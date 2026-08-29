/**
 * Brand-link exit transition — shared by index, the style guide and the
 * builder.
 *
 * The brand in the header is a real navigation, so without this it hard-cuts
 * to the next page while every other way out of a view animates. It plays the
 * same push-back the section exit uses — scale to 0.96 and fade — then follows
 * the link.
 *
 * Written on the Web Animations API rather than GSAP because activity.html
 * doesn't load GSAP, and a shared exit shouldn't be the reason it starts.
 */
(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const DURATION = 300;
  let leaving = false;

  document.addEventListener("click", (e) => {
    // Anchors only. The style guide's header demo renders a .brand <div> to
    // document the component, and that one isn't going anywhere.
    const link = e.target.closest("a.brand");
    if (!link || leaving || prefersReducedMotion.matches) return;

    // Leave the browser's own behaviours alone: open-in-new-tab, middle-click,
    // download, and anything explicitly targeted elsewhere.
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (link.target && link.target !== "_self") return;

    // An in-page jump isn't a navigation — animating out and staying put would
    // just blank the page.
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#")) return;

    e.preventDefault();
    leaving = true;

    const anim = document.body.animate(
      [
        { opacity: 1, transform: "scale(1)" },
        { opacity: 0, transform: "scale(0.96)" },
      ],
      { duration: DURATION, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards" }
    );
    anim.onfinish = () => {
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
    document.body.getAnimations().forEach((a) => a.cancel());
  });
})();
