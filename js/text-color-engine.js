(function() {
  const rootStyles = getComputedStyle(document.documentElement);

  document.querySelectorAll('*').forEach(el => {
    el.classList.forEach(cls => {
      if (!cls.startsWith("text-")) return;

      const parts = cls.split("-");
      // text-blue → 2 parts
      // text-blue-20 → 3 parts

      const colorName = parts[1];
      const rgb = rootStyles.getPropertyValue(`--clr-${colorName}`).trim();
      if (!rgb) {
        console.warn(`text-color-engine: no CSS variable --clr-${colorName} found for class "${cls}"`, el);
        return;
      }

      if (parts.length === 2) {
        // solid color (no opacity)
        el.style.color = `rgb(${rgb})`;
      }

      if (parts.length === 3) {
        // tinted color
        const opacity = parseInt(parts[2], 10);
        if (isNaN(opacity)) {
          console.warn(`text-color-engine: invalid opacity in class "${cls}"`, el);
          return;
        }
        el.style.color = `rgba(${rgb}, ${opacity / 100})`;
      }
    });
  });

})();
