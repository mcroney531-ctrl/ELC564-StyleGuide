/**
 * Small live demos for the style guide page: the card component (with its
 * real hover bounce), the three cluster illustrations, and a scrollspy nav.
 * Reuses the same CONTENT data and illustration assets as the module — no
 * separate copies of copy or artwork to keep in sync.
 */

(function () {
  "use strict";

  // ---- card demo ----
  const cardDemo = document.getElementById("card-demo");
  if (cardDemo) {
    CONTENT.clusters.forEach((cluster) => {
      const card = document.createElement("div");
      card.className = "card mini-card";
      card.dataset.accent = cluster.accent;
      card.innerHTML = `
        <div class="card-art"><img src="assets/illustrations/${cluster.id}.webp" alt=""></div>
        <div class="card-body">
          <span class="card-badge-num">${String(cluster.order).padStart(2, "0")}</span>
          <h2 class="card-title">${cluster.title}</h2>
          <span class="card-underline"></span>
          <p class="card-dek">${cluster.dek}</p>
        </div>
        <div class="card-footer">
          <span class="progress-badge" data-state="${["not-started", "in-progress", "complete"][cluster.order - 1]}">
            <span class="dot"></span><span class="label-text">${["Not started", "In progress", "Complete"][cluster.order - 1]}</span>
          </span>
          <span class="card-arrow-btn" aria-hidden="true">→</span>
        </div>
      `;
      cardDemo.appendChild(card);
      card.addEventListener("mouseenter", () => gsap.to(card, { y: -8, duration: 0.4, ease: "back.out(2.2)" }));
      card.addEventListener("mouseleave", () => gsap.to(card, { y: 0, duration: 0.4, ease: "back.out(2.2)" }));
    });
  }

  // ---- illustration demo ----
  const illoDemo = document.getElementById("illo-demo");
  if (illoDemo) {
    CONTENT.clusters.forEach((cluster) => {
      const wrap = document.createElement("div");
      wrap.innerHTML = `
        <span class="demo-label">${cluster.title}</span>
        <div class="card-art" style="border-radius:var(--radius-lg); overflow:hidden; background:var(--cluster-${cluster.accent}-tint)">
          <img src="assets/illustrations/${cluster.id}.webp" alt="" style="width:100%;height:100%;object-fit:cover;object-position:50% 12%">
        </div>
      `;
      illoDemo.appendChild(wrap);
    });
  }

  // ---- "do" example reuses the real Bring illustration ----
  const doExample = document.getElementById("do-example-illo");
  if (doExample) {
    doExample.innerHTML = `<img src="assets/illustrations/bring.webp" alt="" style="width:100%;height:100%;object-fit:cover;object-position:50% 12%">`;
  }

  // ---- scrollspy ----
  const navLinks = Array.from(document.querySelectorAll("#guide-nav a"));
  const targets = navLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && targets.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = "#" + entry.target.id;
          navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === id));
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    targets.forEach((t) => observer.observe(t));
  }
})();
