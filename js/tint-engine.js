(function() {
  const rootStyles = getComputedStyle(document.documentElement);

  document.querySelectorAll('*').forEach(el => {
    el.classList.forEach(cls => {
      if (!cls.startsWith("bg-")) return;

      const parts = cls.split("-");
      if (parts.length !== 3) return;

      const colorName = parts[1];   // blue
      const opacity = parseInt(parts[2], 10); // 10 → 10%

      if (isNaN(opacity)) {
        console.warn(`tint-engine: invalid opacity in class "${cls}"`, el);
        return;
      }

      const rgb = rootStyles.getPropertyValue(`--clr-${colorName}`).trim();
      if (!rgb) {
        console.warn(`tint-engine: no CSS variable --clr-${colorName} found for class "${cls}"`, el);
        return;
      }

      const alpha = opacity / 100;
      el.style.backgroundColor = `rgba(${rgb}, ${alpha})`;
    });
  });
})();
