/* ===================================
   UTILS.JS
   Shared helpers used by the class-driven
   style engines and the custom cursor.
=================================== */

(function (global) {
  const rootStyles = getComputedStyle(document.documentElement);

  /* Runs `callback` once the document body is parsed. */
  function onReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  /* Resolves a `--clr-<name>` custom property to its "r, g, b" triplet. */
  function resolveRgb(colorName) {
    return rootStyles.getPropertyValue(`--clr-${colorName}`).trim();
  }

  /* Builds a CSS color from a "r, g, b" triplet, optionally tinted (0–100). */
  function toCssColor(rgb, opacityPercent) {
    if (opacityPercent === undefined) return `rgb(${rgb})`;
    return `rgba(${rgb}, ${opacityPercent / 100})`;
  }

  /*
    Walks every class of every element matching `<prefix>-<color>[-<opacity>]`
    and hands the resolved CSS color to `apply(element, cssColor)`.
    Classes with an unknown color are ignored, as are classes without an
    opacity suffix when `requireOpacity` is set.
  */
  function applyColorClasses(prefix, apply, { requireOpacity = false } = {}) {
    document.querySelectorAll(`[class*="${prefix}-"]`).forEach(el => {
      el.classList.forEach(cls => {
        if (!cls.startsWith(`${prefix}-`)) return;

        const parts = cls.slice(prefix.length + 1).split('-');
        // <prefix>-blue        → ["blue"]
        // <prefix>-blue-20     → ["blue", "20"]
        // <prefix>-medium-grey → ["medium", "grey"]
        const hasOpacity = parts.length > 1 && /^\d+$/.test(parts[parts.length - 1]);
        if (requireOpacity && !hasOpacity) return;

        const opacityPercent = hasOpacity ? parseInt(parts.pop(), 10) : undefined;
        const rgb = resolveRgb(parts.join('-'));
        if (!rgb) return;

        apply(el, toCssColor(rgb, opacityPercent));
      });
    });
  }

  global.PortfolioUtils = { onReady, resolveRgb, toCssColor, applyColorClasses };
})(window);
