/**
 * Card / cluster illustrations — one shared visual system, three subjects.
 *
 * Direction given (documented in the style guide's Imagery section): each
 * mark sits on a 240x240 grid inside a rounded tinted panel, drawn as duotone
 * line art — a 4px ink-navy outline plus a single flat accent fill, no
 * gradients, no literal photography, no character work. The three subjects
 * (an inbound document, an inspected shield, a human figure in front of an
 * AI node) are abstract enough to read as corporate iconography rather than
 * illustration, so the set stays restrained instead of decorative.
 */

const ILLUSTRATIONS = {
  bring: `
    <svg viewBox="0 0 240 240" role="img" aria-label="Document icon with an arrow bringing material inward and three attachment marks">
      <rect width="240" height="240" rx="32" fill="var(--illo-tint)"/>
      <g fill="none" stroke="var(--illo-ink)" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
        <path d="M70 66 h68 l18 18 v92 a6 6 0 0 1 -6 6 h-80 a6 6 0 0 1 -6 -6 v-104 a6 6 0 0 1 6 -6 Z" fill="var(--color-white, #fff)"/>
        <path d="M138 66 v18 h18" />
      </g>
      <g stroke="var(--illo-ink)" stroke-width="4" stroke-linecap="round" opacity="0.55">
        <line x1="86" y1="128" x2="146" y2="128"/>
        <line x1="86" y1="144" x2="146" y2="144"/>
        <line x1="86" y1="160" x2="122" y2="160"/>
      </g>
      <g stroke="var(--illo-accent)" stroke-width="7" stroke-linecap="round" fill="none">
        <path d="M186 58 L146 98"/>
        <path d="M146 98 l26 -4 M146 98 l4 -26" />
      </g>
      <g fill="var(--illo-accent)">
        <circle cx="176" cy="150" r="7"/>
        <circle cx="176" cy="172" r="7" opacity="0.7"/>
        <circle cx="176" cy="194" r="7" opacity="0.4"/>
      </g>
    </svg>`,

  verify: `
    <svg viewBox="0 0 240 240" role="img" aria-label="Shield with a checkmark, inspected by a magnifying glass">
      <rect width="240" height="240" rx="32" fill="var(--illo-tint)"/>
      <g fill="var(--color-white, #fff)" stroke="var(--illo-ink)" stroke-width="4" stroke-linejoin="round">
        <path d="M120 54 l52 18 v50 c0 42 -24 66 -52 78 c-28 -12 -52 -36 -52 -78 v-50 Z"/>
      </g>
      <path d="M98 122 l16 16 32 -36" fill="none" stroke="var(--illo-accent)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
      <g>
        <circle cx="168" cy="176" r="22" fill="var(--illo-tint)" stroke="var(--illo-ink)" stroke-width="5"/>
        <line x1="184" y1="192" x2="202" y2="210" stroke="var(--illo-ink)" stroke-width="7" stroke-linecap="round"/>
      </g>
    </svg>`,

  present: `
    <svg viewBox="0 0 240 240" role="img" aria-label="Human figure standing in front of a smaller AI network node">
      <rect width="240" height="240" rx="32" fill="var(--illo-tint)"/>
      <g stroke="var(--illo-accent)" stroke-width="4" fill="none" opacity="0.8">
        <circle cx="168" cy="92" r="10"/>
        <circle cx="196" cy="76" r="6"/>
        <circle cx="196" cy="110" r="6"/>
        <circle cx="150" cy="70" r="6"/>
        <line x1="168" y1="92" x2="196" y2="76"/>
        <line x1="168" y1="92" x2="196" y2="110"/>
        <line x1="168" y1="92" x2="150" y2="70"/>
      </g>
      <g fill="var(--color-white, #fff)" stroke="var(--illo-ink)" stroke-width="4" stroke-linejoin="round">
        <circle cx="108" cy="104" r="28"/>
        <path d="M60 196 c0 -40 22 -62 48 -62 c26 0 48 22 48 62 Z"/>
      </g>
    </svg>`,
};

if (typeof module !== "undefined") module.exports = ILLUSTRATIONS;
