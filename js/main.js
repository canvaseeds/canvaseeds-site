document.addEventListener("DOMContentLoaded", () => {
  // スマホメニューの開閉
  const menuButton = document.querySelector(".menu-button");
  const siteNav = document.querySelector(".site-nav");

  if (menuButton && siteNav) {
    menuButton.addEventListener("click", () => {
      siteNav.classList.toggle("is-open");

      const isOpen = siteNav.classList.contains("is-open");
      menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
      menuButton.textContent = isOpen ? "閉じる" : "メニュー";
    });
  }

  // ページ上部へ戻るボタン
  const topButton = document.querySelector(".top-button");

  if (topButton) {
    topButton.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

      document.documentElement.scollTop=0;
      document.body.scollTop=0;
    });
  }

  // お問い合わせフォームの入力チェック
  const contactForm = document.querySelector(".contact-form");

  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      const name = contactForm.querySelector("#name");
      const email = contactForm.querySelector("#email");
      const message = contactForm.querySelector("#message");

      if (!name.value || !email.value || !message.value) {
        event.preventDefault();
        alert("未入力の項目があります。お名前、メールアドレス、お問い合わせ内容を入力してください。");
      }
    });
  }

  // 画像のドラッグ保存を少し防ぐ
  const protectedImages = document.querySelectorAll("img");

  protectedImages.forEach((image) => {
    image.setAttribute("draggable", "false");
  });
});