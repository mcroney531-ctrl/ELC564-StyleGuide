/**
 * Activity Builder (activity.html) — add real components from the module,
 * edit their copy, reorder or remove them, see them assemble live, then
 * copy a self-contained starter file. This is a component picker, not a
 * builder tool: the pieces themselves are fixed, well-formed blocks lifted
 * straight from the module — a viewer can add any of them (more than once
 * if they want two scenarios, say), fill in their own copy through a form
 * (not free-form contenteditable, so "which option is correct" stays an
 * explicit choice rather than a text edit), reorder, and remove.
 */

(function () {
  "use strict";

  const preview = document.getElementById("builder-preview");
  const addWrap = document.getElementById("builder-add-wrap");
  const addBtn = document.getElementById("builder-add-btn");
  const addPanel = document.getElementById("builder-add-panel");
  const copyBtn = document.getElementById("builder-copy");
  const copyStatus = document.getElementById("builder-copy-status");
  if (!preview || !addWrap || !addBtn || !addPanel || !copyBtn) return;

  function esc(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  const TYPE_LABELS = {
    heading: "Heading + intro text",
    image: "Photo scene",
    backdrop: "Decorative backdrop",
    takeaways: "Key takeaways list",
    scenario: "Scenario / MCQ question",
    button: "Standalone CTA button",
  };

  // Per-piece reorder/edit/remove controls now live on the piece itself
  // (there's no sidebar checklist any more), so every .activity-piece gets
  // this small icon row rendered above it.
  const CTRL_ICONS = {
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M15.5 4.5l4 4L8 20H4v-4Z"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 14l6-6 6 6"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 10l6 6 6-6"/></svg>',
    remove: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  };

  // The module's own set of pastel corner-pattern accents — same assets used
  // behind the character illustrations in index.html. Picking one here just
  // sets which file backs the decorative Backdrop piece's accent image.
  const PATTERNS = [
    { key: "dot-matrix-mint", label: "Dot Matrix" },
    { key: "concentric-arcs-blue", label: "Concentric Arcs" },
    { key: "corner-lines-sage", label: "Corner Lines" },
    { key: "ring-cluster-lavender", label: "Ring Cluster" },
    { key: "mini-circles-peach", label: "Mini Circles" },
    { key: "confetti-peach", label: "Confetti" },
    { key: "dot-square-seafoam", label: "Dot & Square" },
    { key: "offset-squares-sage-gray", label: "Offset Squares" },
    { key: "geometric-marks-powder-blue", label: "Geometric Marks" },
    { key: "diamond-cluster-dusty-rose", label: "Diamond Cluster" },
  ];

  // The module's own character-scene photos — the actual people-in-scenario
  // illustrations used across the info beat, each scenario, and completion
  // screens in index.html. Picking one here inserts the real photo.
  const SCENES = [
    { key: "bring-info", label: "Bring: Info screen" },
    { key: "bring-q1", label: "Bring: Question 1" },
    { key: "bring-q2", label: "Bring: Question 2" },
    { key: "bring-complete", label: "Bring: Complete screen" },
    { key: "verify-info", label: "Verify: Info screen" },
    { key: "verify-q1", label: "Verify: Question 1" },
    { key: "verify-q2", label: "Verify: Question 2" },
    { key: "verify-complete", label: "Verify: Complete screen" },
    { key: "present-info", label: "Present: Info screen" },
    { key: "present-q1", label: "Present: Question 1" },
    { key: "present-q2", label: "Present: Question 2" },
    { key: "present-complete", label: "Present: Complete screen" },
  ];

  // Fresh default data per instance — must be factory functions, not shared
  // objects/arrays, so two Scenario blocks don't end up editing the same array.
  const DEFAULTS = {
    heading: () => ({
      eyebrow: "Your Cluster Name",
      title: "Your activity title goes here",
      body: 'One or two sentences setting up what this teaches — the "why," not the whole lesson. Keep it short enough to read in one breath.',
    }),
    image: () => ({ scene: null }),
    backdrop: () => ({ pattern: null }),
    takeaways: () => ({
      items: ["First takeaway — state the behavior you want, plainly.", "Second takeaway.", "Third takeaway."],
    }),
    scenario: () => ({
      prompt: "Replace this with your own scenario question.",
      options: [
        { text: "First option — a wrong answer.", correct: false },
        { text: "Second option — the correct answer.", correct: true },
        { text: "Third option — a wrong answer.", correct: false },
        { text: "Fourth option — a wrong answer.", correct: false },
      ],
      corrective: "Explain why this answer misses the point, then let them try the same question again.",
      success: "A brief, affirming sentence on why this is right.",
    }),
    button: () => ({ label: "Your call to action" }),
  };

  // Render templates — pure functions of data, used identically by the live
  // preview and the exported file.
  const PIECES = {
    heading: (d) => `
      <span class="eyebrow">${esc(d.eyebrow)}</span>
      <h1 class="h1">${esc(d.title)}</h1>
      <p class="body-lg">${esc(d.body)}</p>
    `,
    // opts.interactive is false only for the exported file, which has no JS
    // wiring behind the picker — these render as static instructions, not
    // live controls, so they drop the clickable affordance and "change" copy.
    image: (d, opts = {}) => {
      const interactive = opts.interactive !== false;
      if (!d.scene) {
        return `
      <div class="banner-wrap">
        <div class="content-banner activity-illustration-slot" ${interactive ? 'data-action="choose-asset" role="button" tabindex="0"' : ""}>
          <span class="activity-illustration-cta">${interactive ? "+ Choose an image" : "No image selected"}</span>
        </div>
      </div>
    `;
      }
      return `
      <div class="banner-wrap">
        <img class="content-banner" src="assets/illustrations/scenes/${esc(d.scene)}.webp" alt="">
        ${interactive ? `<button type="button" class="activity-asset-change" data-action="choose-asset">Change image</button>` : ""}
      </div>
    `;
    },
    // A framed, empty card with a corner-pattern accent peeking from behind
    // it — a bigger, standalone version of the .scene-pattern peek used in
    // the real module, not tied to a photo the way it is there.
    backdrop: (d, opts = {}) => {
      const interactive = opts.interactive !== false;
      const hasPattern = !!d.pattern;
      return `
      <div class="backdrop-piece">
        <div class="backdrop-frame ${hasPattern ? "is-filled" : ""}" ${!hasPattern && interactive ? 'data-action="choose-asset" role="button" tabindex="0"' : ""}>
          ${!hasPattern ? `<span class="activity-illustration-cta">${interactive ? "+ Choose a backdrop" : "No backdrop selected"}</span>` : ""}
        </div>
        ${hasPattern ? `<img class="backdrop-accent" src="assets/illustrations/patterns/${esc(d.pattern)}.webp" alt="" aria-hidden="true">` : ""}
        ${hasPattern && interactive ? `<button type="button" class="activity-asset-change" data-action="choose-asset">Change backdrop</button>` : ""}
      </div>
    `;
    },
    takeaways: (d) => `
      <ul class="point-list">
        ${d.items.map((item) => `<li class="body">${esc(item)}</li>`).join("")}
      </ul>
    `,
    scenario: (d) => `
      <div class="activity-scenario-block" data-activity-scenario>
        <div class="scenario-meta">
          <span class="scenario-number">1</span>
          <span class="label" style="color:var(--color-gray-500)">Scenario 1 of 1</span>
        </div>
        <h2 class="scenario-prompt">${esc(d.prompt)}</h2>
        <div class="option-list" role="group" aria-label="Answer options" data-activity-group>
          ${d.options
            .map(
              (o) => `
          <button class="option" type="button" data-correct="${o.correct}"><span class="option-marker" aria-hidden="true"></span><span class="option-text">${esc(o.text)}</span></button>`
            )
            .join("")}
        </div>
        <div class="feedback is-corrective" data-feedback="corrective">
          <span class="feedback-icon" aria-hidden="true"></span>
          <div class="feedback-body">
            <span class="label">Not quite</span>
            <p class="body">${esc(d.corrective)}</p>
            <div class="feedback-actions"><button class="btn btn-secondary" type="button" data-action="retry">Try again</button></div>
          </div>
        </div>
        <div class="feedback is-success" data-feedback="success">
          <span class="feedback-icon" aria-hidden="true"></span>
          <div class="feedback-body">
            <span class="label">Correct</span>
            <p class="body">${esc(d.success)}</p>
          </div>
        </div>
      </div>
    `,
    button: (d) => `<button class="btn btn-primary" type="button">${esc(d.label)}</button>`,
  };

  // Edit forms — one per type, driving the same data the templates above read.
  const FORMS = {
    heading: (id, d) => `
      <div class="activity-field">
        <label for="f${id}-eyebrow">Eyebrow</label>
        <input type="text" id="f${id}-eyebrow" data-field="eyebrow" value="${esc(d.eyebrow)}">
      </div>
      <div class="activity-field">
        <label for="f${id}-title">Title</label>
        <input type="text" id="f${id}-title" data-field="title" value="${esc(d.title)}">
      </div>
      <div class="activity-field">
        <label for="f${id}-body">Intro text</label>
        <textarea id="f${id}-body" data-field="body" rows="3">${esc(d.body)}</textarea>
      </div>
    `,
    image: (id, d) => `
      <div class="activity-field">
        <label>Choose a scene</label>
        <div class="activity-pattern-grid activity-scene-grid">
          ${SCENES.map(
            (s) => `
          <button type="button" class="activity-pattern-swatch ${d.scene === s.key ? "is-selected" : ""}" data-field="scene" data-value="${s.key}" aria-label="${s.label}" aria-pressed="${d.scene === s.key}">
            <img src="assets/illustrations/scenes/${s.key}.webp" alt="">
          </button>`
          ).join("")}
        </div>
        <p class="activity-field-note">Real scene photos from the module — pick whichever fits your activity.</p>
      </div>
    `,
    backdrop: (id, d) => `
      <div class="activity-field">
        <label>Backdrop pattern</label>
        <div class="activity-pattern-grid">
          ${PATTERNS.map(
            (p) => `
          <button type="button" class="activity-pattern-swatch ${d.pattern === p.key ? "is-selected" : ""}" data-field="pattern" data-value="${p.key}" aria-label="${p.label}" aria-pressed="${d.pattern === p.key}">
            <img src="assets/illustrations/patterns/${p.key}.webp" alt="">
          </button>`
          ).join("")}
        </div>
        <p class="activity-field-note">A decorative corner accent, sized up into its own piece. Pick one to continue.</p>
      </div>
    `,
    takeaways: (id, d) =>
      d.items
        .map(
          (item, i) => `
      <div class="activity-field">
        <label for="f${id}-item${i}">Takeaway ${i + 1}</label>
        <input type="text" id="f${id}-item${i}" data-field="items" data-index="${i}" value="${esc(item)}">
      </div>`
        )
        .join(""),
    scenario: (id, d) => `
      <div class="activity-field">
        <label for="f${id}-prompt">Question</label>
        <textarea id="f${id}-prompt" data-field="prompt" rows="2">${esc(d.prompt)}</textarea>
      </div>
      <div class="activity-field">
        <label>Options — pick the correct one</label>
        ${d.options
          .map(
            (o, i) => `
        <div class="activity-option-field">
          <input type="radio" name="correct-${id}" data-field="optionCorrect" data-index="${i}" ${o.correct ? "checked" : ""} aria-label="Mark option ${i + 1} correct">
          <input type="text" data-field="optionText" data-index="${i}" value="${esc(o.text)}" aria-label="Option ${i + 1} text">
        </div>`
          )
          .join("")}
      </div>
      <div class="activity-field">
        <label for="f${id}-corrective">Corrective feedback (wrong answer)</label>
        <textarea id="f${id}-corrective" data-field="corrective" rows="2">${esc(d.corrective)}</textarea>
      </div>
      <div class="activity-field">
        <label for="f${id}-success">Success feedback (right answer)</label>
        <textarea id="f${id}-success" data-field="success" rows="2">${esc(d.success)}</textarea>
      </div>
    `,
    button: (id, d) => `
      <div class="activity-field">
        <label for="f${id}-label">Button label</label>
        <input type="text" id="f${id}-label" data-field="label" value="${esc(d.label)}">
      </div>
    `,
  };

  // Single source of truth: an ordered list of instances. Each has its own
  // id (duplicates need independent identity) and its own data object (what
  // makes it editable rather than a fixed placeholder), plus whether its
  // edit form is currently open.
  let nextId = 1;
  const pieces = [];

  function addPiece(type) {
    pieces.forEach((p) => (p.editing = false));
    const piece = { id: nextId++, type, data: DEFAULTS[type](), editing: true };
    pieces.push(piece);
    renderAll();
    requestAnimationFrame(() => {
      const el = preview.querySelector(`[data-piece-id="${piece.id}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    });
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

  function setEditing(id, editing) {
    pieces.forEach((p) => (p.editing = p.id === id ? editing : false));
    renderAll();
    if (editing) {
      requestAnimationFrame(() => {
        const el = preview.querySelector(`[data-piece-id="${id}"]`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }

  function renderPreview() {
    // number duplicate types ("Scenario / MCQ question #2") for clear aria-labels
    const seen = {};
    const body = pieces
      .map((p, i) => {
        seen[p.type] = (seen[p.type] || 0) + 1;
        const countOfType = pieces.filter((x) => x.type === p.type).length;
        const label = TYPE_LABELS[p.type] + (countOfType > 1 ? ` #${seen[p.type]}` : "");
        const controls = p.editing
          ? ""
          : `<div class="activity-piece-controls">
               <button type="button" class="piece-ctrl" data-action="edit" data-id="${p.id}" aria-label="Edit ${label}">${CTRL_ICONS.edit}</button>
               <button type="button" class="piece-ctrl" data-action="move-up" data-id="${p.id}" ${i === 0 ? "disabled" : ""} aria-label="Move ${label} up">${CTRL_ICONS.up}</button>
               <button type="button" class="piece-ctrl" data-action="move-down" data-id="${p.id}" ${i === pieces.length - 1 ? "disabled" : ""} aria-label="Move ${label} down">${CTRL_ICONS.down}</button>
               <button type="button" class="piece-ctrl is-remove" data-action="remove" data-id="${p.id}" aria-label="Remove ${label}">${CTRL_ICONS.remove}</button>
             </div>`;
        const inner = p.editing
          ? `<div class="activity-edit-form">
               <div class="activity-edit-header">
                 <span class="label">Editing — ${TYPE_LABELS[p.type]}</span>
                 <button type="button" class="btn btn-primary" data-action="done-edit" data-id="${p.id}">Done</button>
               </div>
               ${FORMS[p.type](p.id, p.data)}
             </div>`
          : PIECES[p.type](p.data);
        return `<div class="activity-piece" data-piece-id="${p.id}">${controls}${inner}</div>`;
      })
      .join("\n");
    // .info-beat is what activates the point-list/heading/CTA spacing rules
    // in styles.css — every piece here is designed to live inside it.
    preview.innerHTML = body ? `<div class="info-beat">${body}</div>` : "";
    // innerHTML above detaches addWrap (it was a previous child) without
    // destroying it — re-attach the same node as the trailing element so
    // "+ Add a piece" always sits right after the last piece, and its
    // listeners/open-state carry over instead of needing to be rebuilt.
    preview.appendChild(addWrap);
  }

  function renderAll() {
    renderPreview();
  }

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

  // ---- edit form input handling ----
  // Data updates on every keystroke, but the preview is NOT re-rendered
  // until "Done" is clicked — re-rendering the form on every keystroke
  // would rebuild the focused input out from under the user's cursor.
  preview.addEventListener("input", (e) => {
    const field = e.target.closest("[data-field]");
    if (!field) return;
    const pieceEl = field.closest("[data-piece-id]");
    const piece = pieces.find((p) => p.id === Number(pieceEl.dataset.pieceId));
    if (!piece) return;

    const key = field.dataset.field;
    const index = field.dataset.index !== undefined ? Number(field.dataset.index) : null;

    if (key === "items") {
      piece.data.items[index] = field.value;
    } else if (key === "optionText") {
      piece.data.options[index].text = field.value;
    } else if (key === "optionCorrect") {
      piece.data.options.forEach((o, i) => (o.correct = i === index));
    } else {
      piece.data[key] = field.value;
    }
  });
  // Radios fire "change", not "input" — same field-update logic as above.
  preview.addEventListener("change", (e) => {
    const field = e.target.closest('[data-field="optionCorrect"]');
    if (!field) return;
    const pieceEl = field.closest("[data-piece-id]");
    const piece = pieces.find((p) => p.id === Number(pieceEl.dataset.pieceId));
    if (!piece) return;
    const index = Number(field.dataset.index);
    piece.data.options.forEach((o, i) => (o.correct = i === index));
  });

  preview.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const chooseAsset = e.target.closest('[data-action="choose-asset"]');
    if (!chooseAsset) return;
    e.preventDefault();
    const pieceEl = chooseAsset.closest("[data-piece-id]");
    setEditing(Number(pieceEl.dataset.pieceId), true);
  });

  preview.addEventListener("click", (e) => {
    const doneBtn = e.target.closest('[data-action="done-edit"]');
    if (doneBtn) {
      setEditing(Number(doneBtn.dataset.id), false);
      return;
    }

    const ctrlBtn = e.target.closest(".piece-ctrl");
    if (ctrlBtn && !ctrlBtn.disabled) {
      const id = Number(ctrlBtn.dataset.id);
      const action = ctrlBtn.dataset.action;
      if (action === "edit") setEditing(id, true);
      else if (action === "move-up") movePiece(id, "up");
      else if (action === "move-down") movePiece(id, "down");
      else if (action === "remove") removePiece(id);
      return;
    }

    // Picking an image/backdrop is a single click, not a fill-in-and-Done
    // form — select it and close the editor immediately, same as adding a piece.
    const swatchBtn = e.target.closest(".activity-pattern-swatch");
    if (swatchBtn) {
      const pieceEl = swatchBtn.closest("[data-piece-id]");
      const piece = pieces.find((p) => p.id === Number(pieceEl.dataset.pieceId));
      if (piece) {
        piece.data[swatchBtn.dataset.field] = swatchBtn.dataset.value;
        setEditing(piece.id, false);
      }
      return;
    }

    const chooseAsset = e.target.closest('[data-action="choose-asset"]');
    if (chooseAsset) {
      const pieceEl = chooseAsset.closest("[data-piece-id]");
      setEditing(Number(pieceEl.dataset.pieceId), true);
      return;
    }

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
      }, 550);
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
    }, 550);
  }
});`.trim();

  async function buildExport() {
    const [tokensCss, stylesCss, builderCss] = await Promise.all([
      fetch("css/tokens.css").then((r) => r.text()),
      fetch("css/styles.css").then((r) => r.text()),
      fetch("css/activity-builder.css").then((r) => r.text()),
    ]);
    // Always rendered in view mode, regardless of live-preview edit state.
    const body = pieces.map((p) => PIECES[p.type](p.data, { interactive: false })).join("\n");
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
${builderCss}
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
