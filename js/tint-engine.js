(function() {
  function applyTints(scope) {
    const root = scope || document;
    const rootStyles = getComputedStyle(document.documentElement);

    root.querySelectorAll('*').forEach(el => {
      el.classList.forEach(cls => {
        if (!cls.startsWith("bg-")) return;

        const parts = cls.split("-");
        if (parts.length !== 3) return;

        const colorName = parts[1];   // blue
        const opacity = parseInt(parts[2]); // 10 → 10%

        if (isNaN(opacity)) return;

        const rgb = rootStyles.getPropertyValue(`--clr-${colorName}`).trim();
        if (!rgb) return;

        const alpha = opacity / 100;
        el.style.backgroundColor = `rgba(${rgb}, ${alpha})`;
      });
    });
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { applyTints };
  } else {
    applyTints(document);
  }
})();
