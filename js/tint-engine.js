/* Applies `bg-<color>-<opacity>` classes as tinted background colors. */
(function (global) {
  const isCommonJs = typeof module !== 'undefined' && module.exports;
  const { applyColorClasses } = isCommonJs ? require('./utils') : global.PortfolioUtils;

  function applyTints(scope) {
    applyColorClasses('bg', (el, color) => {
      el.style.backgroundColor = color;
    }, { scope, requireOpacity: true });
  }

  if (isCommonJs) {
    module.exports = { applyTints };
  } else {
    applyTints(document);
  }
})(typeof window !== 'undefined' ? window : globalThis);
