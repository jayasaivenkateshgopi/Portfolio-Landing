/* Applies `text-<color>[-<opacity>]` classes as text colors. */
(function (global) {
  const isCommonJs = typeof module !== 'undefined' && module.exports;
  /* istanbul ignore next -- the browser branch is exercised by the page, not jest. */
  const { applyColorClasses } = isCommonJs ? require('./utils') : global.PortfolioUtils;

  function applyTextColors(scope) {
    applyColorClasses('text', (el, color) => {
      el.style.color = color;
    }, { scope, label: 'text-color-engine' });
  }

  /* istanbul ignore else -- the browser branch is exercised by the page, not jest. */
  if (isCommonJs) {
    module.exports = { applyTextColors };
  } else {
    applyTextColors(document);
  }
})(typeof window !== 'undefined' ? window : globalThis);
