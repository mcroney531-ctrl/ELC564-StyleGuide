/**
 * Page transitions — shared by index, the style guide and the builder.
 *
 * Every navigation *inside* a page animates: cards expand, the cover swaps out
 * for the grid, a section pushes back on the way home. Real page-to-page links
 * were the exception — they hard-cut. This gives them the matching pair:
 *
 *   out  the page pushes back and fades, then the link is followed
 *   in   the next page settles forward into place
 *
 * The two are deliberately not mirror images. The exit pushes to 0.96 on the
 * standard curve; the entry starts shallower at 0.98 and lands on a
 * decelerating curve, so arriving reads as settling rather than as the exit
 * rebounding back at you.
 *
 * Written on the Web Animations API rather than GSAP because activity.html
 * doesn't load GSAP, and a shared transition shouldn't be the reason it starts.
 *
 * Loaded as a blocking script in <head>, and animates <html> rather than
 * <body>, because both halves of that are what keep the entry from flashing —
 * see playEntry().
 */
(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const EXIT_MS = 300;
  const ENTER_MS = 380;
  const EASE_STANDARD = "cubic-bezier(0.65, 0, 0.35, 1)";
  const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";

  const root = document.documentElement;
  let leaving = false;

  /* ---- in ---------------------------------------------------------------
     Runs at script execution, which is why this file is a blocking script in
     <head> and why the animation is on <html> rather than <body>.

     At the end of <body> it was too late: on index the parser had already run
     GSAP, content.js and app.js and painted three opaque frames before
     reaching this file — five on the style guide — so the page popped into
     view at full strength and only then faded up from nothing. A head script
     runs before any content is parsed, so there is no painted frame to catch,
     and <body> doesn't exist yet at that point — <html> does.

     Fading <html> doesn't fade the page background: html carries
     --color-paper, and a background on the root element is propagated to the
     viewport canvas rather than painted on the element itself. Only the
     content moves.

     A live `transform` also makes the element the containing block for
     anything position:fixed — which is exactly how app.js expands a card. The
     entry is long over by the time anyone can click a card, but "long over"
     isn't "impossible", so the first pointerdown cancels it outright rather
     than letting the two overlap. */
  function playEntry() {
    if (prefersReducedMotion.matches) return;

    const enter = root.animate(
      [
        { opacity: 0, transform: "scale(0.98)" },
        { opacity: 1, transform: "scale(1)" },
      ],
      { duration: ENTER_MS, easing: EASE_OUT }
    );

    document.addEventListener("pointerdown", () => enter.cancel(), { once: true });
  }

  playEntry();

  /* ---- out --------------------------------------------------------------
     Matched on "is this a real navigation away from here" rather than on a
     list of classes, so the transition covers the brand, the style guide
     links both ways, "Build a new Activity" and anything added later,
     without each one having to opt in. */
  document.addEventListener("click", (e) => {
    if (leaving || prefersReducedMotion.matches) return;

    const link = e.target.closest("a[href]");
    if (!link) return;

    // Leave the browser's own behaviours alone: open-in-new-tab, middle-click,
    // download, and anything explicitly targeted elsewhere.
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (link.target && link.target !== "_self") return;
    if (link.hasAttribute("download")) return;

    const url = new URL(link.href, location.href);

    // mailto:, tel: and friends aren't page loads.
    if (url.protocol !== "http:" && url.protocol !== "https:") return;
    // Somewhere else entirely — that page won't be running this.
    if (url.origin !== location.origin) return;
    // An in-page jump isn't a navigation. Animating out and staying put would
    // just blank the page. The style guide's nav is eight of these.
    if (url.hash && url.pathname === location.pathname && url.search === location.search) return;

    e.preventDefault();
    leaving = true;

    const exit = root.animate(
      [
        { opacity: 1, transform: "scale(1)" },
        { opacity: 0, transform: "scale(0.96)" },
      ],
      { duration: EXIT_MS, easing: EASE_STANDARD, fill: "forwards" }
    );
    exit.onfinish = () => {
      window.location.href = link.href;
    };
  });

  // The exit fades the page out and then navigates, so the browser can put it
  // into the back/forward cache mid-animation. Coming back restores it exactly
  // as it was left — a body at opacity 0 that never recovers, because a
  // restore isn't a fresh load and nothing re-runs.
  window.addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    leaving = false;
    root.getAnimations().forEach((a) => a.cancel());
  });
})();
