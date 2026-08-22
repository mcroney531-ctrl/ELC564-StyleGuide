/**
 * Small live demos for the style guide page: the card component (with its
 * real hover bounce), the three cluster illustrations, and a scrollspy nav.
 * Reuses the same CONTENT / ILLUSTRATIONS data as the module — no separate
 * copies of copy or artwork to keep in sync.
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
        <div class="card-art">${ILLUSTRATIONS[cluster.id]}</div>
        <div class="card-body">
          <span class="card-index">Cluster ${cluster.order} of 3</span>
          <h2 class="card-title">${cluster.title}</h2>
          <p class="card-dek">${cluster.dek}</p>
        </div>
        <div class="card-footer">
          <span class="progress-badge" data-state="${["not-started", "in-progress", "complete"][cluster.order - 1]}">
            <span class="dot"></span><span class="label-text">${["Not started", "In progress", "Complete"][cluster.order - 1]}</span>
          </span>
          <span class="card-cta">Start</span>
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
        <div class="card-art" data-accent="${cluster.accent}" style="border-radius:var(--radius-lg); overflow:hidden;
          --illo-ink:var(--color-ink-900); --illo-tint:var(--cluster-${cluster.accent}-tint); --illo-accent:var(--cluster-${cluster.accent})">
          ${ILLUSTRATIONS[cluster.id]}
        </div>
      `;
      illoDemo.appendChild(wrap);
    });
  }

  // ---- "do" example reuses the real Bring illustration ----
  const doExample = document.getElementById("do-example-illo");
  if (doExample) {
    doExample.style.setProperty("--illo-ink", "var(--color-ink-900)");
    doExample.style.setProperty("--illo-tint", "var(--cluster-bring-tint)");
    doExample.style.setProperty("--illo-accent", "var(--cluster-bring)");
    doExample.innerHTML = ILLUSTRATIONS.bring;
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
