/* Applies `text-<color>[-<opacity>]` classes as text colors. */
(function (global) {
  const isCommonJs = typeof module !== 'undefined' && module.exports;
  const { applyColorClasses } = isCommonJs ? require('./utils') : global.PortfolioUtils;

  function applyTextColors(scope) {
    applyColorClasses('text', (el, color) => {
      el.style.color = color;
    }, { scope });
  }

  if (isCommonJs) {
    module.exports = { applyTextColors };
  } else {
    applyTextColors(document);
  }
})(typeof window !== 'undefined' ? window : globalThis);
