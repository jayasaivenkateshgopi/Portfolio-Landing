/* ===================================
   UTILS.JS
   Shared helpers used by the class-driven
   style engines and the custom cursor.
=================================== */

(function (global) {
  /* Runs `callback` once the document body is parsed. */
  function onReady(callback) {
    if (document.readyState === 'loading' || !document.body) {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  /* Resolves a `--clr-<name>` custom property to its "r, g, b" triplet. */
  function resolveRgb(colorName) {
    return getComputedStyle(document.documentElement).getPropertyValue(`--clr-${colorName}`).trim();
  }

  /* Builds a CSS color from a "r, g, b" triplet, optionally tinted (0–100). */
  function toCssColor(rgb, opacityPercent) {
    if (opacityPercent === undefined) return `rgb(${rgb})`;
    return `rgba(${rgb}, ${opacityPercent / 100})`;
  }

  /*
    Walks every class of every element in `scope` matching
    `<prefix>-<color>[-<opacity>]` and hands the resolved CSS color to
    `apply(element, cssColor)`. Classes whose color has no `--clr-*` property
    are ignored, as are classes without an opacity suffix when
    `requireOpacity` is set.
  */
  function applyColorClasses(prefix, apply, { scope, requireOpacity = false } = {}) {
    const root = scope || document;

    root.querySelectorAll(`[class*="${prefix}-"]`).forEach(el => {
      el.classList.forEach(cls => {
        if (!cls.startsWith(`${prefix}-`)) return;

        const parts = cls.slice(prefix.length + 1).split('-');
        // <prefix>-blue    → ["blue"]
        // <prefix>-blue-20 → ["blue", "20"]
        const hasOpacity = parts.length > 1 && /^\d+$/.test(parts[parts.length - 1]);
        if (requireOpacity && !hasOpacity) return;

        const opacityPercent = hasOpacity ? parseInt(parts.pop(), 10) : undefined;
        const rgb = resolveRgb(parts.join('-'));
        if (!rgb) return;

        apply(el, toCssColor(rgb, opacityPercent));
      });
    });
  }

  const utils = { onReady, resolveRgb, toCssColor, applyColorClasses };

  /* istanbul ignore else -- browser-only global export */
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = utils;
  } else {
    global.PortfolioUtils = utils;
  }
})(typeof window !== 'undefined' ? window : globalThis);
