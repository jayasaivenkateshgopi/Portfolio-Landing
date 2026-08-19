/* Applies `bg-<color>-<opacity>` classes as tinted background colors. */
(function ({ onReady, applyColorClasses }) {
  onReady(() => {
    applyColorClasses('bg', (el, color) => {
      el.style.backgroundColor = color;
    }, { requireOpacity: true });
  });
})(window.PortfolioUtils);
