/**
 * App logic for "AI Do's & Don'ts at Work."
 *   1. Render the landing cards (each wrapping its own hidden section content).
 *   2. Card <-> section transition — one view fades out and up, the next
 *      settles in behind it, the same two-step handoff the cover uses.
 *   3. MCQ flow: selected -> confirmed-correct/-wrong or corrective retry or advance.
 *   4. Progress persisted per cluster in localStorage.
 */

(function () {
  "use strict";

  const STORAGE_KEY = "aidodont-progress";
  const SELECT_HOLD_MS = 550; // "selected, unconfirmed" beat before it resolves

  const grid = document.getElementById("card-grid");

  /* ---------------- progress persistence ---------------- */

  function loadProgress() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return raw && typeof raw === "object" ? raw : {};
    } catch (e) {
      return {};
    }
  }

  const progress = loadProgress();
  CONTENT.clusters.forEach((c) => {
    if (!progress[c.id]) progress[c.id] = "not-started";
  });

  function saveProgress() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }

  function setProgress(clusterId, state) {
    progress[clusterId] = state;
    saveProgress();
    renderBadge(clusterId);
  }

  function renderBadge(clusterId) {
    const badge = document.querySelector(`[data-badge="${clusterId}"]`);
    if (!badge) return;
    const state = progress[clusterId];
    const label =
      state === "complete" ? "Complete" : state === "in-progress" ? "In progress" : "Not started";
    badge.dataset.state = state;
    badge.querySelector(".label-text").textContent = label;
  }

  /* ---------------- card + section building ---------------- */

  const entries = {}; // clusterId -> { slot, card, cluster, state }

  function buildCard(cluster) {
    const slot = document.createElement("div");
    slot.className = "card-slot";

    const card = document.createElement("div");
    card.className = "card";
    card.dataset.cluster = cluster.id;
    card.dataset.accent = cluster.accent;
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Open ${cluster.title} section`);
    card.setAttribute("aria-expanded", "false");
    card.style.setProperty("--illo-accent", `var(--cluster-${cluster.accent})`);

    card.innerHTML = `
      <div class="card-preview">
        <div class="card-art">
          <img src="assets/illustrations/${cluster.id}.webp" alt="" loading="lazy">
        </div>
        <div class="card-body">
          <span class="card-badge-num">${String(cluster.order).padStart(2, "0")}</span>
          <h2 class="card-title">${cluster.title}</h2>
          <span class="card-underline"></span>
          <p class="card-dek">${cluster.dek}</p>
        </div>
        <div class="card-footer">
          <span class="progress-badge" data-badge="${cluster.id}">
            <span class="dot"></span><span class="label-text">Not started</span>
          </span>
          <span class="card-arrow-btn" aria-hidden="true">→</span>
        </div>
      </div>

      <div class="card-section">
        <div class="section-inner">
          <div class="section-topbar">
            <div class="section-nav">
              <a class="btn btn-ghost section-home" href="index.html" aria-label="Home">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.75 12 3.5l9 7.25"/><path d="M5.5 9.75V19.5a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.75"/><path d="M9.75 20.5V14.5h4.5v6"/></svg>
              </a>
            </div>
            <div class="section-progress-track" aria-hidden="true">
              <span class="tick" data-tick="0"></span>
              <span class="tick" data-tick="1"></span>
            </div>
          </div>

          <div class="section-content info-beat" data-view="info">
            <span class="eyebrow">${cluster.info.eyebrow}</span>
            <h1 class="h1">${cluster.info.heading}</h1>
            <div class="banner-wrap">
              <img class="content-banner" src="assets/illustrations/scenes/${cluster.info.image}" alt="">
              <img class="scene-pattern" src="assets/illustrations/patterns/${cluster.info.pattern}" alt="" aria-hidden="true">
            </div>
            ${cluster.info.body.map((p) => `<p class="body-lg">${p}</p>`).join("")}
            <ul class="point-list">
              ${cluster.info.points.map((pt) => `<li class="body">${pt}</li>`).join("")}
            </ul>
            <button class="btn btn-primary start-cta" data-action="start-scenarios">Start the scenarios</button>
          </div>

          ${cluster.questions
            .map(
              (q, qi) => `
            <div class="section-content scenario" data-view="scenario" data-question="${qi}">
              <div class="scenario-meta">
                <span class="scenario-count">Scenario ${qi + 1} of ${cluster.questions.length}</span>
              </div>
              <div class="banner-wrap">
                <img class="content-banner" src="assets/illustrations/scenes/${q.image}" alt="">
                <img class="scene-pattern" src="assets/illustrations/patterns/${q.pattern}" alt="" aria-hidden="true">
              </div>
              <h2 class="scenario-prompt">${q.prompt}</h2>
              <span class="scenario-underline" aria-hidden="true"></span>
              <div class="option-list" role="group" aria-label="Answer options">
                ${q.options
                  .map(
                    (opt, oi) => `
                  <button class="option" type="button" data-option="${oi}">
                    <span class="option-marker" aria-hidden="true"></span>
                    <span class="option-text">${opt}</span>
                  </button>`
                  )
                  .join("")}
              </div>
              <div class="feedback is-corrective" data-feedback="corrective">
                <span class="feedback-icon" aria-hidden="true"></span>
                <div class="feedback-body">
                  <span class="label">Not quite</span>
                  <p class="body">${q.corrective}</p>
                  <div class="feedback-actions">
                    <button class="btn btn-secondary" data-action="retry">Try again</button>
                  </div>
                </div>
              </div>
              <div class="feedback is-success" data-feedback="success">
                <span class="feedback-icon" aria-hidden="true"></span>
                <div class="feedback-body">
                  <span class="label">Correct</span>
                  <p class="body">${q.success}</p>
                  <div class="feedback-actions">
                    <button class="btn btn-primary" data-action="advance">
                      ${qi + 1 < cluster.questions.length ? "Next scenario" : "Finish section"}
                    </button>
                  </div>
                </div>
              </div>
            </div>`
            )
            .join("")}

          <div class="section-content section-complete" data-view="complete">
            <div class="badge-check" aria-hidden="true">✓</div>
            <h1 class="h1">${cluster.title} — complete</h1>
            <p class="body-lg">Both scenarios answered. That badge is now checked off on the overview.</p>
            <div class="banner-wrap">
              <img class="content-banner" src="assets/illustrations/scenes/${cluster.completeImage}" alt="">
              <img class="scene-pattern" src="assets/illustrations/patterns/${cluster.completePattern}" alt="" aria-hidden="true">
            </div>
            <div class="actions">
              <button class="btn btn-primary" data-action="exit">Back to overview</button>
            </div>
          </div>
        </div>
      </div>
    `;

    slot.appendChild(card);
    grid.appendChild(slot);

    const state = { currentQuestion: 0 };
    entries[cluster.id] = { slot, card, cluster, state };

    renderBadge(cluster.id);
    wireCard(cluster, card, state);
  }

  // The takeaways are read, not clicked, so they get an arrival animation
  // rather than a hover one: each rectangle fades up in sequence when the
  // info beat appears. back.out is deliberately NOT used here — the motion
  // spec reserves that overshoot for the clickable card lift, and reusing it
  // on static content would read as a false affordance. Their hover state is
  // a shadow lift in CSS, no movement.
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function revealPoints(target) {
    const items = target.querySelectorAll(".point-list li");
    if (!items.length) return;
    if (prefersReducedMotion.matches) {
      gsap.set(items, { clearProps: "all" });
      return;
    }
    gsap.from(items, {
      opacity: 0,
      y: 12,
      duration: 0.5,
      ease: "power2.out",
      stagger: 0.06,
      // let the view it lives in settle first, so the two moments read in
      // sequence rather than as one blur of movement
      delay: 0.3,
      clearProps: "all",
    });
  }

  function wireCard(cluster, card, state) {
    // Open on click/keyboard — but ignore clicks that bubble up from the
    // section's own controls once expanded (those are handled below).
    card.addEventListener("click", () => {
      if (card.classList.contains("is-expanded")) return;
      openSection(cluster.id);
    });
    card.addEventListener("keydown", (e) => {
      if (card.classList.contains("is-expanded")) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openSection(cluster.id);
      }
    });

    // Secondary polish moment: a hover bounce, distinct from the system
    // easing used everywhere else (see Motion section of the style guide).
    card.addEventListener("mouseenter", () => {
      if (card.classList.contains("is-expanded")) return;
      gsap.to(card, { y: -8, duration: 0.4, ease: "back.out(2.2)" });
    });
    card.addEventListener("mouseleave", () => {
      if (card.classList.contains("is-expanded")) return;
      gsap.to(card, { y: 0, duration: 0.4, ease: "back.out(2.2)" });
    });

    const sectionRoot = card.querySelector(".card-section");
    sectionRoot.addEventListener("click", (e) => {
      const actionBtn = e.target.closest("[data-action]");
      if (actionBtn) {
        const action = actionBtn.dataset.action;
        if (action === "exit") {
          // Don't let this reach the card's own open-on-click listener: by the
          // time the event bubbles, closeSection has already removed
          // "is-expanded", so that listener's guard would pass and immediately
          // re-open the section we're leaving.
          e.stopPropagation();
          return closeSection(cluster.id);
        }
        if (action === "start-scenarios") {
          state.currentQuestion = 0;
          showView(sectionRoot, "scenario", 0);
        }
        if (action === "retry") {
          resetQuestion(actionBtn.closest(".scenario"));
        }
        if (action === "advance") {
          const next = state.currentQuestion + 1;
          if (next < cluster.questions.length) {
            state.currentQuestion = next;
            showView(sectionRoot, "scenario", next);
          } else {
            setProgress(cluster.id, "complete");
            showView(sectionRoot, "complete");
          }
        }
        return;
      }

      const optionBtn = e.target.closest(".option");
      if (optionBtn && !optionBtn.disabled) {
        handleOptionClick(cluster, sectionRoot, optionBtn);
      }
    });
  }

  function showView(sectionRoot, viewName, questionIndex) {
    sectionRoot.querySelectorAll(".section-content").forEach((node) => {
      node.classList.remove("is-visible");
      node.classList.remove("is-active");
    });

    const target =
      viewName === "scenario"
        ? sectionRoot.querySelector(`.scenario[data-question="${questionIndex}"]`)
        : sectionRoot.querySelector(`[data-view="${viewName}"]`);

    target.classList.add("is-active");
    syncFrameToPattern(sectionRoot, target);
    requestAnimationFrame(() => {
      target.classList.add("is-visible");
      revealPoints(target);
    });
  }

  // Every view carries its own corner pattern, so the page frame retints to
  // match whichever one is showing — border and pattern belong to the same
  // backdrop. The colors live in styles.css keyed off this data-pattern.
  function syncFrameToPattern(sectionRoot, target) {
    const inner = sectionRoot.querySelector(".section-inner");
    if (!inner) return;
    const pattern = target.querySelector(".scene-pattern");
    const key = pattern && pattern.getAttribute("src").split("/").pop().replace(".webp", "");
    if (key) inner.dataset.pattern = key;
    else delete inner.dataset.pattern;
  }

  function updateTicks(sectionRoot, resolvedCount) {
    sectionRoot.querySelectorAll(".tick").forEach((tick, i) => {
      tick.classList.toggle("is-done", i < resolvedCount);
    });
  }

  function resetQuestion(scenarioEl) {
    scenarioEl.querySelectorAll(".option").forEach((btn) => {
      btn.disabled = false;
      btn.classList.remove("is-selected", "is-correct", "is-wrong");
    });
    scenarioEl.querySelectorAll(".feedback").forEach((f) => f.classList.remove("is-visible"));
  }

  function handleOptionClick(cluster, sectionRoot, optionBtn) {
    const scenarioEl = optionBtn.closest(".scenario");
    const qIndex = Number(scenarioEl.dataset.question);
    const question = cluster.questions[qIndex];
    const chosenIndex = Number(optionBtn.dataset.option);

    scenarioEl.querySelectorAll(".option").forEach((btn) => (btn.disabled = true));
    optionBtn.classList.add("is-selected");

    setTimeout(() => {
      const isCorrect = chosenIndex === question.correct;
      optionBtn.classList.remove("is-selected");
      optionBtn.classList.add(isCorrect ? "is-correct" : "is-wrong");

      const feedbackName = isCorrect ? "success" : "corrective";
      scenarioEl.querySelector(`[data-feedback="${feedbackName}"]`).classList.add("is-visible");

      if (!isCorrect) {
        // same-question retry only: other (untried) options stay clickable
        scenarioEl.querySelectorAll(".option").forEach((btn) => {
          if (!btn.classList.contains("is-wrong")) btn.disabled = false;
        });
      } else {
        updateTicks(sectionRoot, qIndex + 1);
      }
    }, SELECT_HOLD_MS);
  }

  /* ---------------- card <-> section transition ----------------
   * The "is-expanded" class swaps the clicked card to a fixed full-viewport
   * overlay; its .card-slot wrapper never leaves the grid, so the siblings
   * never reflow and can be faded independently. Nothing tweens between the
   * two geometries — the overview fades out before the swap and the section
   * fades in after it, so the class change itself is never on screen.
   */

  let isAnimating = false;

  function otherCards(clusterId) {
    return Object.values(entries)
      .filter((e) => e.cluster.id !== clusterId)
      .map((e) => e.card);
  }

  // Everything that makes up the overview: the intro copy plus every card.
  // The cards rather than their .card-slot wrappers — the slots hold the grid's
  // layout, and fading a slot would take the expanded card down with it, since
  // opacity on an ancestor still applies to a position:fixed descendant.
  function landingLayer() {
    const intro = document.querySelector(".landing-intro");
    const cards = Object.values(entries).map((e) => e.card);
    return intro ? [intro, ...cards] : cards;
  }

  /* Opening runs the same two-step fade as "Start Activity" on the cover: the
   * outgoing view drops away upward, then the incoming one settles up into
   * place, staggered. It replaces a Flip that grew the card from its grid slot
   * to full screen — same destination, but this reads as one view handing off
   * to the next rather than a card inflating. */
  function openSection(clusterId) {
    if (isAnimating) return;

    const { slot, card, state } = entries[clusterId];
    const sectionRoot = card.querySelector(".card-section");

    if (progress[clusterId] === "not-started") setProgress(clusterId, "in-progress");

    const expand = () => {
      // Lock the slot's height before the card leaves normal flow, so the grid
      // row never has a moment of collapsing/resizing.
      slot.style.height = card.getBoundingClientRect().height + "px";
      card.classList.add("is-expanded");
      card.tabIndex = -1;
      card.setAttribute("aria-expanded", "true");
      // Clicking a card means the pointer is on it, so the hover-lift tween
      // (y: -8) is usually still running — and mouseleave won't undo it, since
      // by then the card is expanded and that handler bails. Left alone it
      // offsets the whole full-screen section by 8px. The Flip this replaced
      // hid the problem by measuring real rects; a fixed overlay just inherits
      // the transform, so it has to be killed outright.
      gsap.killTweensOf(card);
      // The card faded out with the rest of the overview a moment ago; now that
      // it *is* the incoming view, it has to be fully visible and unoffset.
      gsap.set(card, { clearProps: "opacity,y,scale,transform" });

      if (state.currentQuestion === 0 && !sectionRoot.querySelector(".scenario.is-active")) {
        showView(sectionRoot, "info");
      }
    };

    // Land on the end state directly, matching how closeSection honors the
    // same preference. isAnimating stays false: there's no animation to guard,
    // and closeSection's own reduced-motion path relies on being able to run
    // immediately after this.
    if (prefersReducedMotion.matches) {
      gsap.set(landingLayer(), { opacity: 0 });
      gsap.set(otherCards(clusterId), { pointerEvents: "none" });
      expand();
      return;
    }

    isAnimating = true;

    gsap.to(landingLayer(), {
      opacity: 0,
      y: -16,
      duration: 0.35,
      ease: "power2.in",
      onComplete: () => {
        gsap.set(otherCards(clusterId), { pointerEvents: "none" });
        expand();

        // Mirrors the cover handoff: the header settles first, then the body
        // just behind it. Only the transform is animated on .section-content —
        // its opacity belongs to the .is-visible CSS fade showView triggers,
        // and driving both would have the two fighting over the same property.
        const topbar = sectionRoot.querySelector(".section-topbar");
        const view = sectionRoot.querySelector(".section-content.is-active");

        if (topbar) {
          gsap.from(topbar, { opacity: 0, y: 16, duration: 0.5, ease: "power2.out", clearProps: "all" });
        }
        if (view) {
          gsap.from(view, { y: 24, duration: 0.55, ease: "power2.out", delay: 0.1, clearProps: "transform" });
        }

        isAnimating = false;
      },
    });
  }

  /* Closing is deliberately NOT the expansion played backwards. Reversing the
   * Flip meant a full screen of text and artwork was visibly squeezed down
   * into a small card, and power2.inOut's slow start read as lag once you'd
   * already decided to leave. Instead the expanded view pushes back into the
   * stack — it scales down slightly and fades while the grid comes forward
   * from 1.02 — so the exit reads as depth rather than a fold, and nothing
   * has to track a shrinking rectangle. */
  function closeSection(clusterId) {
    if (isAnimating) return;

    const { slot, card } = entries[clusterId];

    // Put the card back in its slot. Deliberately does NOT clear the rest of
    // the overview: on the animated path that's still mid-tween when this runs,
    // and wiping its inline styles there would flash for a frame before the
    // tween wrote them again. Each path below cleans up its own.
    const restore = () => {
      card.classList.remove("is-expanded");
      card.tabIndex = 0;
      card.setAttribute("aria-expanded", "false");
      slot.style.height = "";
      gsap.set(card, { clearProps: "opacity,scale,y,borderRadius" });
      gsap.set(otherCards(clusterId), { clearProps: "pointerEvents" });
    };

    if (prefersReducedMotion.matches) {
      restore();
      gsap.set(landingLayer(), { clearProps: "opacity,y" });
      return;
    }

    isAnimating = true;

    // The two halves overlap deliberately. Run sequentially and there's a beat
    // where the expanded view has faded but the grid hasn't returned, so the
    // screen shows a bare page. Note we never transform .landing or #card-grid
    // here: they're ancestors of the still-fixed card, and transforming an
    // ancestor would re-anchor it mid-flight.
    // Everything the overview is made of except the card currently standing in
    // for the section — it's mid-exit and gets restored by restore() below.
    // These come back from where openSection left them (opacity 0, y -16),
    // so the properties have to match what it actually set.
    const returning = landingLayer().filter((el) => el !== card);

    gsap.to(returning, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: "power2.out",
      stagger: 0.04,
      clearProps: "opacity,y",
    });

    gsap.to(card, {
      opacity: 0,
      scale: 0.96,
      duration: 0.3,
      ease: "power2.inOut",
      onComplete: () => {
        restore();
        // Now that it's back in normal flow, let it settle in from slightly
        // forward so it reads as having pushed back into the stack.
        gsap.fromTo(
          card,
          { opacity: 0, scale: 1.02 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.28,
            ease: "power2.out",
            clearProps: "opacity,scale",
            onComplete: () => {
              isAnimating = false;
            },
          }
        );
      },
    });
  }

  /* ---------------- init ---------------- */

  CONTENT.clusters.forEach(buildCard);

  // The cover stands alone — the clusters aren't on the page behind it.
  // "Start Activity" swaps the cover out and brings the cards in, staggered,
  // so arriving at the grid reads as a step rather than a jump cut.
  const startBtn = document.querySelector('[data-action="start-module"]');
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      const cover = document.getElementById("cover");
      const landing = document.getElementById("landing");
      if (!cover || !landing || !landing.hidden) return;

      const show = () => {
        cover.hidden = true;
        landing.hidden = false;
        // move focus to the grid's heading so keyboard and screen-reader
        // users land on the new content instead of a removed button
        const heading = landing.querySelector(".landing-intro .h1");
        if (heading) {
          heading.setAttribute("tabindex", "-1");
          heading.focus({ preventScroll: true });
        }
      };

      if (prefersReducedMotion.matches) {
        show();
        return;
      }

      gsap.to(cover, {
        opacity: 0,
        y: -16,
        duration: 0.35,
        ease: "power2.in",
        onComplete: () => {
          show();
          gsap.from(landing.querySelector(".landing-intro"), {
            opacity: 0, y: 16, duration: 0.5, ease: "power2.out", clearProps: "all",
          });
          gsap.from(landing.querySelectorAll(".card-slot"), {
            opacity: 0, y: 24, duration: 0.55, ease: "power2.out",
            stagger: 0.08, delay: 0.1, clearProps: "all",
          });
        },
      });
    });
  }
})();
