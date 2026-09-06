(function () {
  const cms = window.CanvaseedsCMS || { posts: [] };
  const posts = Array.isArray(cms.posts) ? cms.posts.slice() : [];

  const formatDate = (value) => {
    if (!value) return "";
    return value.replaceAll("-", ".");
  };

  const escapeHtml = (value) => String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[char]));

  const normalizeUrl = (url, basePath) => {
    if (!url) return "";
    if (/^(https?:)?\/\//.test(url) || url.startsWith("#")) return url;
    return `${basePath || ""}${url}`;
  };

  const byNewest = (a, b) => String(b.date || "").localeCompare(String(a.date || ""));

  const getFilteredPosts = (type, limit, featuredOnly) => {
    let filtered = posts.filter((post) => post.type === type);
    if (featuredOnly) {
      filtered = filtered.filter((post) => post.featured);
    }
    filtered.sort(byNewest);
    return limit ? filtered.slice(0, limit) : filtered;
  };

  const renderLink = (post, basePath, label) => {
    const href = normalizeUrl(post.url, basePath);
    if (!href) return "";
    return `<a href="${escapeHtml(href)}" class="text-link">${label}</a>`;
  };

  const renderNewsItem = (post, basePath) => `
    <article class="news-item cms-item">
      <div class="news-meta">
        <time datetime="${escapeHtml(post.date)}">${escapeHtml(formatDate(post.date))}</time>
        <span class="news-category">${escapeHtml(post.category || "お知らせ")}</span>
      </div>
      <h3>${escapeHtml(post.title)}</h3>
      <p>${escapeHtml(post.excerpt)}</p>
      ${renderLink(post, basePath, "詳しく見る")}
    </article>
  `;

  const renderActivityItem = (post, basePath) => {
    const image = normalizeUrl(post.image, basePath);
    const imageHtml = image
      ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(post.alt || post.title)}">`
      : "";

    return `
      <article class="report-item cms-item">
        ${imageHtml}
        <div>
          <div class="news-meta">
            <time datetime="${escapeHtml(post.date)}">${escapeHtml(formatDate(post.date))}</time>
            <span class="news-category">${escapeHtml(post.category || "活動報告")}</span>
          </div>
          <h3>${escapeHtml(post.title)}</h3>
          <p>${escapeHtml(post.excerpt)}</p>
          ${renderLink(post, basePath, "詳しく見る")}
        </div>
      </article>
    `;
  };

  const renderArchiveNav = (items) => {
    const years = [...new Set(items.map((post) => String(post.date || "").slice(0, 4)).filter(Boolean))];
    if (!years.length) return "";

    return `
      <div class="cms-archive">
        <h3>過去の投稿</h3>
      <div class="archive-links">
        ${years.map((year) => `<a href="#archive-${year}">${escapeHtml(year)}年</a>`).join("")}
      </div>
      </div>
    `;
  };

  const renderGroupedItems = (type, items, basePath) => {
    const renderItem = type === "activity" ? renderActivityItem : renderNewsItem;
    const years = [...new Set(items.map((post) => String(post.date || "").slice(0, 4)).filter(Boolean))];

    return years.map((year) => {
      const yearItems = items.filter((post) => String(post.date || "").startsWith(year));
      return `
        <section class="archive-year" id="archive-${escapeHtml(year)}">
          <h3>${escapeHtml(year)}年</h3>
          <div class="archive-year-list">
            ${yearItems.map((post) => renderItem(post, basePath)).join("")}
          </div>
        </section>
      `;
    }).join("");
  };

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-cms-list]").forEach((container) => {
      const type = container.dataset.cmsList;
      const limit = Number(container.dataset.cmsLimit || 0);
      const featuredOnly = container.dataset.cmsFeatured === "true";
      const basePath = container.dataset.cmsBasePath || "";
      const items = getFilteredPosts(type, limit, featuredOnly);

      if (!items.length) {
        container.innerHTML = `<p class="cms-empty">${escapeHtml(container.dataset.cmsEmpty || "投稿はまだありません。")}</p>`;
        return;
      }

      if (container.dataset.cmsArchive === "true") {
        container.innerHTML = renderArchiveNav(items) + renderGroupedItems(type, items, basePath);
        return;
      }

      container.innerHTML = items.map((post) => (
        type === "activity" ? renderActivityItem(post, basePath) : renderNewsItem(post, basePath)
      )).join("");
    });
  });
}());
