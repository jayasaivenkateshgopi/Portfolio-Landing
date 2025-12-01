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
      if (!rgb) return;

      if (parts.length === 2) {
        // solid color (no opacity)
        el.style.color = `rgb(${rgb})`;
      }

      if (parts.length === 3) {
        // tinted color
        const opacity = parseInt(parts[2]) / 100;
        el.style.color = `rgba(${rgb}, ${opacity})`;
      }
    });
  });

})();
