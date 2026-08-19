/* Applies `bg-<color>-<opacity>` classes as tinted background colors. */
(function (global) {
  const isCommonJs = typeof module !== 'undefined' && module.exports;
  const { onReady, applyColorClasses } = isCommonJs ? require('./utils') : global.PortfolioUtils;

  function applyTints(scope) {
    applyColorClasses('bg', (el, color) => {
      el.style.backgroundColor = color;
    }, { scope, requireOpacity: true });
  }

  /* istanbul ignore else -- browser-only auto-invoke */
  if (isCommonJs) {
    module.exports = { applyTints };
  } else {
    onReady(() => applyTints());
  }
})(typeof window !== 'undefined' ? window : globalThis);
