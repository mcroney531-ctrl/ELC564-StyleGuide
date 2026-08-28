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
  const checkList = document.getElementById("builder-check-list");
  const addWrap = document.getElementById("builder-add-wrap");
  const addBtn = document.getElementById("builder-add-btn");
  const addPanel = document.getElementById("builder-add-panel");
  const copyBtn = document.getElementById("builder-copy");
  const copyStatus = document.getElementById("builder-copy-status");
  if (!preview || !checkList || !addWrap || !addBtn || !addPanel || !copyBtn) return;

  function esc(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  const TYPE_LABELS = {
    heading: "Heading + intro text",
    illustration: "Supporting illustration slot",
    takeaways: "Key takeaways list",
    scenario: "Scenario / MCQ question",
    button: "Standalone CTA button",
  };

  // The module's own set of pastel corner-pattern accents — same assets used
  // behind the character illustrations in index.html. Picking one here just
  // sets which file backs the .scene-pattern accent; no upload needed.
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

  // Fresh default data per instance — must be factory functions, not shared
  // objects/arrays, so two Scenario blocks don't end up editing the same array.
  const DEFAULTS = {
    heading: () => ({
      eyebrow: "Your Cluster Name",
      title: "Your activity title goes here",
      body: 'One or two sentences setting up what this teaches — the "why," not the whole lesson. Keep it short enough to read in one breath.',
    }),
    illustration: () => ({ pattern: null }),
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
    // wiring behind the picker — the box there is a static instruction, not
    // a live control, so it drops the clickable affordance and "change" copy.
    illustration: (d, opts = {}) => {
      const interactive = opts.interactive !== false;
      return `
      <div class="banner-wrap">
        <div class="content-banner activity-illustration-slot" ${interactive ? 'data-action="choose-backdrop" role="button" tabindex="0"' : ""}>
          ${
            d.pattern
              ? `<span class="activity-illustration-hint">Your illustration or photo goes here</span>${interactive ? '<span class="activity-illustration-change">Change backdrop</span>' : ""}`
              : `<span class="activity-illustration-cta">${interactive ? "+ Choose your backdrop" : "Swap this box for your own illustration or photo"}</span>`
          }
        </div>
        ${d.pattern ? `<img class="scene-pattern" src="assets/illustrations/patterns/${esc(d.pattern)}.webp" alt="" aria-hidden="true">` : ""}
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
    illustration: (id, d) => `
      <div class="activity-field">
        <label>Backdrop pattern</label>
        <div class="activity-pattern-grid">
          ${PATTERNS.map(
            (p) => `
          <button type="button" class="activity-pattern-swatch ${d.pattern === p.key ? "is-selected" : ""}" data-value="${p.key}" aria-label="${p.label}" aria-pressed="${d.pattern === p.key}">
            <img src="assets/illustrations/patterns/${p.key}.webp" alt="">
          </button>`
          ).join("")}
        </div>
        <p class="activity-field-note">Sits behind wherever you drop in your own illustration or photo. Pick one to continue.</p>
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

  function renderChecklist() {
    // number duplicate types ("Scenario / MCQ question #2") for clarity
    const seen = {};
    checkList.innerHTML = pieces
      .map((p, i) => {
        seen[p.type] = (seen[p.type] || 0) + 1;
        const countOfType = pieces.filter((x) => x.type === p.type).length;
        const label = TYPE_LABELS[p.type] + (countOfType > 1 ? ` #${seen[p.type]}` : "");
        return `
      <div class="builder-check ${p.editing ? "is-editing" : ""}" data-id="${p.id}">
        <span class="builder-check-label">${label}</span>
        <div class="builder-check-actions">
          <button type="button" class="builder-edit" data-id="${p.id}" aria-label="Edit ${label}">✎</button>
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
    const body = pieces
      .map((p) => {
        const inner = p.editing
          ? `<div class="activity-edit-form">
               <div class="activity-edit-header">
                 <span class="label">Editing — ${TYPE_LABELS[p.type]}</span>
                 <button type="button" class="btn btn-primary" data-action="done-edit" data-id="${p.id}">Done</button>
               </div>
               ${FORMS[p.type](p.id, p.data)}
             </div>`
          : PIECES[p.type](p.data);
        return `<div class="activity-piece" data-piece-id="${p.id}">${inner}</div>`;
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
      return;
    }
    const editBtn = e.target.closest(".builder-edit");
    if (editBtn) {
      setEditing(Number(editBtn.dataset.id), true);
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
    const chooseBackdrop = e.target.closest('[data-action="choose-backdrop"]');
    if (!chooseBackdrop) return;
    e.preventDefault();
    const pieceEl = chooseBackdrop.closest("[data-piece-id]");
    setEditing(Number(pieceEl.dataset.pieceId), true);
  });

  preview.addEventListener("click", (e) => {
    const doneBtn = e.target.closest('[data-action="done-edit"]');
    if (doneBtn) {
      setEditing(Number(doneBtn.dataset.id), false);
      return;
    }

    // Picking a backdrop is a single click, not a fill-in-and-Done form —
    // select it and close the editor immediately, same as adding a piece.
    const swatchBtn = e.target.closest(".activity-pattern-swatch");
    if (swatchBtn) {
      const pieceEl = swatchBtn.closest("[data-piece-id]");
      const piece = pieces.find((p) => p.id === Number(pieceEl.dataset.pieceId));
      if (piece) {
        piece.data.pattern = swatchBtn.dataset.value;
        setEditing(piece.id, false);
      }
      return;
    }

    const chooseBackdrop = e.target.closest('[data-action="choose-backdrop"]');
    if (chooseBackdrop) {
      const pieceEl = chooseBackdrop.closest("[data-piece-id]");
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
