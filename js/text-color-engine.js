/* Applies `text-<color>[-<opacity>]` classes as text colors. */
(function (global) {
  const isCommonJs = typeof module !== 'undefined' && module.exports;
  const { onReady, applyColorClasses } = isCommonJs ? require('./utils') : global.PortfolioUtils;

  function applyTextColors(scope) {
    applyColorClasses('text', (el, color) => {
      el.style.color = color;
    }, { scope });
  }

  /* istanbul ignore else -- browser-only auto-invoke */
  if (isCommonJs) {
    module.exports = { applyTextColors };
  } else {
    onReady(() => applyTextColors());
  }
})(typeof window !== 'undefined' ? window : globalThis);
