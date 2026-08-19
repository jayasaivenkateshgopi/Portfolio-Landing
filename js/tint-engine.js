/* Applies `bg-<color>-<opacity>` classes as tinted background colors. */
(function (global) {
  const isCommonJs = typeof module !== 'undefined' && module.exports;
  /* istanbul ignore next -- the browser branch is exercised by the page, not jest. */
  const { applyColorClasses } = isCommonJs ? require('./utils') : global.PortfolioUtils;

  function applyTints(scope) {
    applyColorClasses('bg', (el, color) => {
      el.style.backgroundColor = color;
    }, { scope, requireOpacity: true, label: 'tint-engine' });
  }

  /* istanbul ignore else -- the browser branch is exercised by the page, not jest. */
  if (isCommonJs) {
    module.exports = { applyTints };
  } else {
    applyTints(document);
  }
})(typeof window !== 'undefined' ? window : globalThis);
