(function () {
  const storageKey = "canvaseeds-cms-posts";
  const initialPosts = (window.CanvaseedsCMS && window.CanvaseedsCMS.posts) || [];
  let posts = loadPosts();

  function loadPosts() {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return initialPosts.slice();

    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : initialPosts.slice();
    } catch (error) {
      return initialPosts.slice();
    }
  }

  function savePosts() {
    localStorage.setItem(storageKey, JSON.stringify(posts));
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

      posts = posts.filter((item) => item.id !== post.id).concat(post);
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
      localStorage.removeItem(storageKey);
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
