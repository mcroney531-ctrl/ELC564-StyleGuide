/**
 * Activity Builder (activity.html) — add real components from the module,
 * reorder or remove them, see them assemble live, then copy a
 * self-contained starter file. This is a component picker, not a builder
 * tool: the pieces themselves are fixed, well-formed blocks lifted straight
 * from the module — a viewer can add any of them (more than once if they
 * want two scenarios, say), reorder, remove, and swap the placeholder copy
 * afterward.
 */

(function () {
  "use strict";

  const preview = document.getElementById("builder-preview");
  const checkList = document.getElementById("builder-check-list");
  const addBtn = document.getElementById("builder-add-btn");
  const addPanel = document.getElementById("builder-add-panel");
  const copyBtn = document.getElementById("builder-copy");
  const copyStatus = document.getElementById("builder-copy-status");
  if (!preview || !checkList || !addBtn || !addPanel || !copyBtn) return;

  const TYPE_LABELS = {
    heading: "Heading + intro text",
    illustration: "Supporting illustration slot",
    takeaways: "Key takeaways list",
    scenario: "Scenario / MCQ question",
    button: "Standalone CTA button",
  };

  const PIECES = {
    heading: () => `
      <span class="eyebrow">Your Cluster Name</span>
      <h1 class="h1">Your activity title goes here</h1>
      <p class="body-lg">One or two sentences setting up what this teaches — the "why," not the whole lesson. Keep it short enough to read in one breath.</p>
    `,
    illustration: () => `
      <div class="banner-wrap">
        <div class="content-banner" style="aspect-ratio:4/3;background:var(--color-cloud);border-radius:var(--radius-lg);display:flex;align-items:center;justify-content:center;color:var(--color-gray-500);font:var(--text-label);text-align:center;padding:var(--space-4)">
          Swap for your own illustration
        </div>
      </div>
    `,
    takeaways: () => `
      <ul class="point-list">
        <li class="body">First takeaway — state the behavior you want, plainly.</li>
        <li class="body">Second takeaway.</li>
        <li class="body">Third takeaway.</li>
      </ul>
    `,
    scenario: () => `
      <div class="activity-scenario-block" data-activity-scenario>
        <div class="scenario-meta">
          <span class="scenario-number">1</span>
          <span class="label" style="color:var(--color-gray-500)">Scenario 1 of 1</span>
        </div>
        <h2 class="scenario-prompt">Replace this with your own scenario question.</h2>
        <div class="option-list" role="group" aria-label="Answer options" data-activity-group>
          <button class="option" type="button" data-correct="false"><span class="option-marker" aria-hidden="true"></span><span class="option-text">First option — a wrong answer.</span></button>
          <button class="option" type="button" data-correct="true"><span class="option-marker" aria-hidden="true"></span><span class="option-text">Second option — the correct answer.</span></button>
          <button class="option" type="button" data-correct="false"><span class="option-marker" aria-hidden="true"></span><span class="option-text">Third option — a wrong answer.</span></button>
          <button class="option" type="button" data-correct="false"><span class="option-marker" aria-hidden="true"></span><span class="option-text">Fourth option — a wrong answer.</span></button>
        </div>
        <div class="feedback is-corrective" data-feedback="corrective">
          <span class="feedback-icon" aria-hidden="true"></span>
          <div class="feedback-body">
            <span class="label">Not quite</span>
            <p class="body">Explain why this answer misses the point, then let them try the same question again.</p>
            <div class="feedback-actions"><button class="btn btn-secondary" type="button" data-action="retry">Try again</button></div>
          </div>
        </div>
        <div class="feedback is-success" data-feedback="success">
          <span class="feedback-icon" aria-hidden="true"></span>
          <div class="feedback-body">
            <span class="label">Correct</span>
            <p class="body">A brief, affirming sentence on why this is right.</p>
          </div>
        </div>
      </div>
    `,
    button: () => `<button class="btn btn-primary" type="button">Your call to action</button>`,
  };

  // Single source of truth: an ordered list of instances. Each has its own
  // id so duplicates (two Scenario blocks, say) can be reordered/removed
  // independently — the type alone isn't enough to identify one.
  let nextId = 1;
  const pieces = [];

  function addPiece(type) {
    pieces.push({ id: nextId++, type });
    renderAll();
  }

  function removePiece(id) {
    const i = pieces.findIndex((p) => p.id === id);
    if (i !== -1) pieces.splice(i, 1);
    renderAll();
  }

  function movePiece(id, dir) {
    const i = pieces.findIndex((p) => p.id === id);
    const j = dir === "up" ? i - 1 : i + 1;
    if (i === -1 || j < 0 || j >= pieces.length) return;
    [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
    renderAll();
  }

  function renderChecklist() {
    // number duplicate types ("Scenario / MCQ question #2") for clarity
    const seen = {};
    checkList.innerHTML = pieces
      .map((p, i) => {
        seen[p.type] = (seen[p.type] || 0) + 1;
        const countOfType = pieces.filter((x) => x.type === p.type).length;
        const label = TYPE_LABELS[p.type] + (countOfType > 1 ? ` #${seen[p.type]}` : "");
        return `
      <div class="builder-check" data-id="${p.id}">
        <span class="builder-check-label">${label}</span>
        <div class="builder-check-actions">
          <div class="builder-reorder">
            <button type="button" class="builder-move" data-dir="up" data-id="${p.id}" ${i === 0 ? "disabled" : ""} aria-label="Move ${label} up">↑</button>
            <button type="button" class="builder-move" data-dir="down" data-id="${p.id}" ${i === pieces.length - 1 ? "disabled" : ""} aria-label="Move ${label} down">↓</button>
          </div>
          <button type="button" class="builder-remove" data-id="${p.id}" aria-label="Remove ${label}">✕</button>
        </div>
      </div>`;
      })
      .join("");
  }

  function renderPreview() {
    const body = pieces.map((p) => PIECES[p.type]()).join("\n");
    // .info-beat is what activates the point-list/heading/CTA spacing rules
    // in styles.css — every piece here is designed to live inside it.
    preview.innerHTML = body ? `<div class="info-beat">${body}</div>` : "";
  }

  function renderAll() {
    renderChecklist();
    renderPreview();
  }

  checkList.addEventListener("click", (e) => {
    const moveBtn = e.target.closest(".builder-move");
    if (moveBtn) {
      movePiece(Number(moveBtn.dataset.id), moveBtn.dataset.dir);
      return;
    }
    const removeBtn = e.target.closest(".builder-remove");
    if (removeBtn) {
      removePiece(Number(removeBtn.dataset.id));
    }
  });

  // ---- "+ Add a piece" trigger + panel ----
  function closeAddPanel() {
    addPanel.hidden = true;
    addBtn.setAttribute("aria-expanded", "false");
  }
  function openAddPanel() {
    addPanel.hidden = false;
    addBtn.setAttribute("aria-expanded", "true");
  }
  addBtn.addEventListener("click", () => {
    if (addPanel.hidden) openAddPanel();
    else closeAddPanel();
  });
  addPanel.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    addPiece(btn.dataset.add);
    closeAddPanel();
  });
  document.addEventListener("click", (e) => {
    if (!addPanel.hidden && !e.target.closest(".builder-add-wrap")) closeAddPanel();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !addPanel.hidden) closeAddPanel();
  });

  // ---- live preview interactivity (delegated so it survives re-renders;
  // scoped to the nearest scenario block so multiple scenarios don't
  // cross-talk) ----
  const SELECT_HOLD_MS = 550;

  preview.addEventListener("click", (e) => {
    const retryBtn = e.target.closest('[data-action="retry"]');
    if (retryBtn) {
      const scenario = retryBtn.closest("[data-activity-scenario]");
      if (!scenario) return;
      scenario.querySelectorAll(".option").forEach((b) => {
        b.disabled = false;
        b.classList.remove("is-selected", "is-correct", "is-wrong");
      });
      scenario.querySelectorAll(".feedback").forEach((f) => f.classList.remove("is-visible"));
      return;
    }

    const optionBtn = e.target.closest(".option");
    if (optionBtn && !optionBtn.disabled) {
      const scenario = optionBtn.closest("[data-activity-scenario]");
      const group = optionBtn.closest("[data-activity-group]");
      group.querySelectorAll(".option").forEach((b) => (b.disabled = true));
      optionBtn.classList.add("is-selected");
      setTimeout(() => {
        const correct = optionBtn.dataset.correct === "true";
        optionBtn.classList.remove("is-selected");
        optionBtn.classList.add(correct ? "is-correct" : "is-wrong");
        const panel = scenario.querySelector(`[data-feedback="${correct ? "success" : "corrective"}"]`);
        if (panel) panel.classList.add("is-visible");
        if (!correct) {
          group.querySelectorAll(".option").forEach((b) => {
            if (!b.classList.contains("is-wrong")) b.disabled = false;
          });
        }
      }, SELECT_HOLD_MS);
    }
  });

  renderAll();

  // ---- export ----
  const EXPORT_JS = `
document.addEventListener('click', function (e) {
  var retryBtn = e.target.closest('[data-action="retry"]');
  if (retryBtn) {
    var scenario = retryBtn.closest('[data-activity-scenario]');
    if (!scenario) return;
    scenario.querySelectorAll('.option').forEach(function (b) {
      b.disabled = false;
      b.classList.remove('is-selected', 'is-correct', 'is-wrong');
    });
    scenario.querySelectorAll('.feedback').forEach(function (f) { f.classList.remove('is-visible'); });
    return;
  }
  var optionBtn = e.target.closest('.option');
  if (optionBtn && !optionBtn.disabled) {
    var scenario = optionBtn.closest('[data-activity-scenario]');
    var group = optionBtn.closest('[data-activity-group]');
    group.querySelectorAll('.option').forEach(function (b) { b.disabled = true; });
    optionBtn.classList.add('is-selected');
    setTimeout(function () {
      var correct = optionBtn.dataset.correct === 'true';
      optionBtn.classList.remove('is-selected');
      optionBtn.classList.add(correct ? 'is-correct' : 'is-wrong');
      var panel = scenario.querySelector('[data-feedback="' + (correct ? 'success' : 'corrective') + '"]');
      if (panel) panel.classList.add('is-visible');
      if (!correct) {
        group.querySelectorAll('.option').forEach(function (b) {
          if (!b.classList.contains('is-wrong')) b.disabled = false;
        });
      }
    }, ${SELECT_HOLD_MS});
  }
});`.trim();

  async function buildExport() {
    const [tokensCss, stylesCss] = await Promise.all([
      fetch("css/tokens.css").then((r) => r.text()),
      fetch("css/styles.css").then((r) => r.text()),
    ]);
    const body = pieces.map((p) => PIECES[p.type]()).join("\n");
    const needsScript = pieces.some((p) => p.type === "scenario");

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Your Activity</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
${tokensCss}
${stylesCss}
body { max-width: 640px; margin: 0 auto; padding: var(--space-8) var(--space-6) var(--space-16); }
</style>
</head>
<body>
<div class="info-beat">
${body}
</div>
${needsScript ? `<script>\n${EXPORT_JS}\n</script>` : ""}
</body>
</html>
`;
  }

  copyBtn.addEventListener("click", async () => {
    copyStatus.textContent = "";
    if (!pieces.length) {
      copyStatus.textContent = "Add at least one piece first.";
      setTimeout(() => (copyStatus.textContent = ""), 3000);
      return;
    }
    try {
      const html = await buildExport();
      await navigator.clipboard.writeText(html);
      copyStatus.textContent = "Copied — paste it anywhere.";
    } catch (err) {
      copyStatus.textContent = "Couldn't copy automatically — check the browser console.";
      console.error(err);
    }
    setTimeout(() => {
      copyStatus.textContent = "";
    }, 4000);
  });
})();
