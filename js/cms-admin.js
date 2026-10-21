(function () {
  const storageKey = "canvaseeds-cms-posts";
  const initialPosts = (window.CanvaseedsCMS && window.CanvaseedsCMS.posts) || [];
  const baselineKey = `${storageKey}-baseline`;
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const postKey = (post) => post.url ? `${post.type}:${post.url}` : post.id;
  let posts = loadPosts();
  savePosts();

  function loadPosts() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (!Array.isArray(saved)) return initialPosts.slice();
      const baseline = JSON.parse(localStorage.getItem(baselineKey) || "null");
      const previous = new Map((Array.isArray(baseline) ? baseline : []).map((post) => [postKey(post), post]));
      const drafts = new Map(saved.map((post) => [postKey(post), post]));
      const publishedKeys = new Set(initialPosts.map(postKey));
      const merged = [];

      initialPosts.forEach((published) => {
        const key = postKey(published);
        const before = previous.get(key);
        const draft = drafts.get(key);
        // Keep explicit local deletions when a baseline is available.
        if (before && !draft) return;
        if (!before || !draft) {
          // Legacy saves have no baseline: current published fields win.
          merged.push({ ...draft, ...published });
          return;
        }
        const post = { ...published };
        new Set([...Object.keys(before), ...Object.keys(draft)]).forEach((field) => {
          // Preserve local edits unless the published field also changed.
          if (!same(draft[field], before[field]) && same(published[field], before[field])) {
            if (Object.prototype.hasOwnProperty.call(draft, field)) post[field] = draft[field];
            else delete post[field];
          }
        });
        merged.push(post);
      });
      saved.forEach((draft) => {
        const key = postKey(draft);
        if (!publishedKeys.has(key) && (!previous.has(key) || !same(draft, previous.get(key)))) {
          merged.push(draft);
        }
      });
      return merged;
    } catch (error) {
      return initialPosts.slice();
    }
  }

  function savePosts() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(posts));
      localStorage.setItem(baselineKey, JSON.stringify(initialPosts));
    } catch (error) {
      // Editing and exporting remain available when browser storage is blocked.
    }
  }

  function slugify(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function buildOutput() {
    const ordered = posts.slice().sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
    return `window.CanvaseedsCMS = ${JSON.stringify({ posts: ordered }, null, 2)};\n`;
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function render() {
    const list = document.querySelector("#cms-admin-list");
    const output = document.querySelector("#cms-output");
    const ordered = posts.slice().sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));

    if (!ordered.length) {
      list.innerHTML = `<p class="cms-empty">投稿はまだありません。</p>`;
    } else {
      list.innerHTML = ordered.map((post) => `
      <article class="cms-admin-item">
        <div>
          <p class="news-category">${escapeHtml(post.type === "activity" ? "活動報告" : "ニュース")}</p>
          <time datetime="${escapeHtml(post.date)}">${escapeHtml(post.date)}</time>
          <h3>${escapeHtml(post.title)}</h3>
          <p>${escapeHtml(post.excerpt)}</p>
        </div>
        <button type="button" class="button button-sub" data-delete-id="${escapeHtml(post.id)}">削除</button>
      </article>
    `).join("");
    }

    output.value = buildOutput();
  }

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#cms-form");
    const resetButton = document.querySelector("#cms-reset");
    const copyButton = document.querySelector("#cms-copy");
    const downloadButton = document.querySelector("#cms-download");
    const list = document.querySelector("#cms-admin-list");

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const type = document.querySelector("#cms-type").value;
      const date = document.querySelector("#cms-date").value;
      const title = document.querySelector("#cms-title").value.trim();
      const post = {
        id: `${type}-${date}-${slugify(title)}`,
        type,
        title,
        date,
        category: document.querySelector("#cms-category").value.trim() || (type === "activity" ? "活動報告" : "お知らせ"),
        excerpt: document.querySelector("#cms-excerpt").value.trim(),
        url: document.querySelector("#cms-url").value.trim(),
        featured: document.querySelector("#cms-featured").checked
      };

      const image = document.querySelector("#cms-image").value.trim();
      const alt = document.querySelector("#cms-alt").value.trim();
      if (image) post.image = image;
      if (alt) post.alt = alt;

      const existing = posts.find((item) => postKey(item) === postKey(post));
      if (existing) post.id = existing.id;
      posts = posts.filter((item) => item.id !== post.id && postKey(item) !== postKey(post)).concat(post);
      savePosts();
      form.reset();
      document.querySelector("#cms-featured").checked = true;
      render();
    });

    list.addEventListener("click", (event) => {
      const button = event.target.closest("[data-delete-id]");
      if (!button) return;
      posts = posts.filter((post) => post.id !== button.dataset.deleteId);
      savePosts();
      render();
    });

    resetButton.addEventListener("click", () => {
      posts = initialPosts.slice();
      savePosts();
      render();
    });

    copyButton.addEventListener("click", async () => {
      const output = document.querySelector("#cms-output");
      output.select();
      try {
        await navigator.clipboard.writeText(output.value);
        copyButton.textContent = "コピーしました";
      } catch (error) {
        document.execCommand("copy");
        copyButton.textContent = "選択しました";
      }
      window.setTimeout(() => {
        copyButton.textContent = "コピーする";
      }, 1400);
    });

    downloadButton.addEventListener("click", () => {
      const output = document.querySelector("#cms-output");
      const blob = new Blob([output.value], { type: "text/javascript" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "cms-data.js";
      link.click();
      URL.revokeObjectURL(url);
    });

    render();
  });
}());
