/* Applies `text-<color>[-<opacity>]` classes as text colors. */
(function (global) {
  const isCommonJs = typeof module !== 'undefined' && module.exports;
  const { applyColorClasses } = isCommonJs ? require('./utils') : global.PortfolioUtils;

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
  }

  if (isCommonJs) {
    module.exports = { applyTextColors };
  } else {
    applyTextColors(document);
  }
})(typeof window !== 'undefined' ? window : globalThis);
