/**
 * "Build an Activity" — pick components, see them assemble live using the
 * real site CSS, then export a self-contained starter file. This is a
 * component picker, not a builder tool: the pieces are fixed, well-formed
 * blocks lifted straight from the module; all a viewer can do is choose
 * which ones to include and swap the placeholder copy afterward.
 */

(function () {
  "use strict";

  const preview = document.getElementById("builder-preview");
  const copyBtn = document.getElementById("builder-copy");
  const copyStatus = document.getElementById("builder-copy-status");
  if (!preview || !copyBtn) return;

  const checkboxes = Array.from(document.querySelectorAll('[data-piece]'));

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
    `,
    button: () => `<button class="btn btn-primary" type="button">Your call to action</button>`,
  };

  const ORDER = ["heading", "illustration", "takeaways", "scenario", "button"];

  function render() {
    const checked = checkboxes.filter((c) => c.checked).map((c) => c.dataset.piece);
    const body = ORDER.filter((p) => checked.includes(p))
      .map((p) => PIECES[p]())
      .join("\n");
    // .info-beat is what activates the point-list/heading/CTA spacing rules
    // in styles.css — every piece here is designed to live inside it.
    preview.innerHTML = body ? `<div class="info-beat">${body}</div>` : "";
  }

  // ---- live preview interactivity (delegated so it survives re-renders) ----
  const SELECT_HOLD_MS = 550;

  preview.addEventListener("click", (e) => {
    const retryBtn = e.target.closest('[data-action="retry"]');
    if (retryBtn) {
      // Only one scenario block can exist per generated activity, so reset
      // is scoped to the whole preview rather than a non-existent ancestor.
      preview.querySelectorAll(".option").forEach((b) => {
        b.disabled = false;
        b.classList.remove("is-selected", "is-correct", "is-wrong");
      });
      preview.querySelectorAll(".feedback").forEach((f) => f.classList.remove("is-visible"));
      return;
    }

    const optionBtn = e.target.closest(".option");
    if (optionBtn && !optionBtn.disabled) {
      const group = optionBtn.closest("[data-activity-group]");
      group.querySelectorAll(".option").forEach((b) => (b.disabled = true));
      optionBtn.classList.add("is-selected");
      setTimeout(() => {
        const correct = optionBtn.dataset.correct === "true";
        optionBtn.classList.remove("is-selected");
        optionBtn.classList.add(correct ? "is-correct" : "is-wrong");
        const panel = preview.querySelector(`[data-feedback="${correct ? "success" : "corrective"}"]`);
        if (panel) panel.classList.add("is-visible");
        if (!correct) {
          group.querySelectorAll(".option").forEach((b) => {
            if (!b.classList.contains("is-wrong")) b.disabled = false;
          });
        }
      }, SELECT_HOLD_MS);
    }
  });

  checkboxes.forEach((c) => c.addEventListener("change", render));
  render();

  // ---- export ----
  const EXPORT_JS = `
document.addEventListener('click', function (e) {
  var retryBtn = e.target.closest('[data-action="retry"]');
  if (retryBtn) {
    document.querySelectorAll('.option').forEach(function (b) {
      b.disabled = false;
      b.classList.remove('is-selected', 'is-correct', 'is-wrong');
    });
    document.querySelectorAll('.feedback').forEach(function (f) { f.classList.remove('is-visible'); });
    return;
  }
  var optionBtn = e.target.closest('.option');
  if (optionBtn && !optionBtn.disabled) {
    var group = optionBtn.closest('[data-activity-group]');
    group.querySelectorAll('.option').forEach(function (b) { b.disabled = true; });
    optionBtn.classList.add('is-selected');
    setTimeout(function () {
      var correct = optionBtn.dataset.correct === 'true';
      optionBtn.classList.remove('is-selected');
      optionBtn.classList.add(correct ? 'is-correct' : 'is-wrong');
      var panel = document.querySelector('[data-feedback="' + (correct ? 'success' : 'corrective') + '"]');
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
    const checked = checkboxes.filter((c) => c.checked).map((c) => c.dataset.piece);
    const body = ORDER.filter((p) => checked.includes(p))
      .map((p) => PIECES[p]())
      .join("\n");
    const needsScript = checked.includes("scenario");

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
