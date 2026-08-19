const { onReady, resolveRgb, toCssColor, applyColorClasses } = require('../js/utils');

describe('onReady', () => {
  test('runs the callback immediately once the body is parsed', () => {
    const callback = jest.fn();
    onReady(callback);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('defers the callback until DOMContentLoaded while loading', () => {
    const readyState = jest.spyOn(document, 'readyState', 'get').mockReturnValue('loading');
    const callback = jest.fn();

    onReady(callback);
    expect(callback).not.toHaveBeenCalled();

    readyState.mockRestore();
    document.dispatchEvent(new Event('DOMContentLoaded'));
    expect(callback).toHaveBeenCalledTimes(1);
  });
});

describe('resolveRgb', () => {
  test('reads the "r, g, b" triplet from a --clr-* custom property', () => {
    document.documentElement.style.setProperty('--clr-blue', '0, 0, 255');
    expect(resolveRgb('blue')).toBe('0, 0, 255');
  });

  test('returns an empty string for an undefined color', () => {
    expect(resolveRgb('nope')).toBe('');
  });
});

describe('toCssColor', () => {
  test('builds an opaque color without an opacity', () => {
    expect(toCssColor('0, 0, 255')).toBe('rgb(0, 0, 255)');
  });

  test('builds a tinted color from an opacity percentage', () => {
    expect(toCssColor('0, 0, 255', 20)).toBe('rgba(0, 0, 255, 0.2)');
  });
});

describe('applyColorClasses', () => {
  beforeEach(() => {
    document.documentElement.style.setProperty('--clr-blue', '0, 0, 255');
    document.documentElement.style.setProperty('--clr-light-grey', '200, 200, 200');
    document.body.innerHTML = '';
  });

  test('passes the resolved color of each matching class to the callback', () => {
    document.body.innerHTML = `
      <div class="bg-blue-20"></div>
      <div class="bg-light-grey"></div>
    `;
    const apply = jest.fn();

    applyColorClasses('bg', apply, { scope: document });

    expect(apply.mock.calls.map(([, color]) => color))
      .toEqual(['rgba(0, 0, 255, 0.2)', 'rgb(200, 200, 200)']);
  });

  test('skips classes without an opacity suffix when one is required', () => {
    document.body.innerHTML = '<div class="bg-blue"></div>';
    const apply = jest.fn();

    applyColorClasses('bg', apply, { scope: document, requireOpacity: true });

    expect(apply).not.toHaveBeenCalled();
  });

  test('ignores non-color utilities without warning', () => {
    document.body.innerHTML = '<div class="text-uppercase"></div>';
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const apply = jest.fn();

    applyColorClasses('text', apply, { scope: document });

    expect(apply).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  test('warns when an opacity-suffixed class has no matching CSS variable', () => {
    document.body.innerHTML = '<div class="bg-ghost-20"></div>';
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const apply = jest.fn();

    applyColorClasses('bg', apply, { scope: document, label: 'tint-engine' });

    expect(apply).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('tint-engine: no CSS variable --clr-ghost'),
      expect.any(HTMLElement)
    );
    warn.mockRestore();
  });
});
