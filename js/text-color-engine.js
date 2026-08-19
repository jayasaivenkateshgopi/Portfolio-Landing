/* Applies `text-<color>[-<opacity>]` classes as text colors. */
(function ({ onReady, applyColorClasses }) {
  onReady(() => {
    applyColorClasses('text', (el, color) => {
      el.style.color = color;
    });
  });
})(window.PortfolioUtils);
