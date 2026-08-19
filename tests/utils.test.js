const { onReady, resolveRgb, toCssColor, applyColorClasses } = require('../js/utils');

beforeEach(() => {
  document.documentElement.removeAttribute('style');
  document.body.innerHTML = '';
  document.documentElement.style.setProperty('--clr-blue', '0, 31, 63');
});

describe('onReady', () => {
  test('runs the callback immediately once the body is parsed', () => {
    const callback = jest.fn();

    onReady(callback);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('defers the callback until DOMContentLoaded while loading', () => {
    jest.spyOn(document, 'readyState', 'get').mockReturnValue('loading');
    const callback = jest.fn();

    onReady(callback);
    expect(callback).not.toHaveBeenCalled();

    jest.restoreAllMocks();
    document.dispatchEvent(new Event('DOMContentLoaded'));

    expect(callback).toHaveBeenCalledTimes(1);
  });
});

describe('resolveRgb', () => {
  test('returns the trimmed --clr-* triplet', () => {
    document.documentElement.style.setProperty('--clr-red', ' 255, 0, 0 ');

    expect(resolveRgb('red')).toBe('255, 0, 0');
  });

  test('returns an empty string for an unknown color', () => {
    expect(resolveRgb('chartreuse')).toBe('');
  });
});

describe('toCssColor', () => {
  test('builds a solid color when no opacity is given', () => {
    expect(toCssColor('0, 31, 63')).toBe('rgb(0, 31, 63)');
  });

  test('builds a tinted color from a percentage', () => {
    expect(toCssColor('0, 31, 63', 40)).toBe('rgba(0, 31, 63, 0.4)');
    expect(toCssColor('0, 31, 63', 0)).toBe('rgba(0, 31, 63, 0)');
  });
});

describe('applyColorClasses', () => {
  test('passes solid and tinted colors to the apply callback', () => {
    document.body.innerHTML = '<p class="tc-blue"></p><span class="tc-blue-25"></span>';
    const apply = jest.fn();

    applyColorClasses('tc', apply);

    expect(apply.mock.calls.map(([, color]) => color)).toEqual([
      'rgb(0, 31, 63)',
      'rgba(0, 31, 63, 0.25)'
    ]);
  });

  test('ignores classes whose color has no --clr-* property', () => {
    document.body.innerHTML = '<p class="tc-chartreuse"></p><span class="other-blue"></span>';
    const apply = jest.fn();

    applyColorClasses('tc', apply);

    expect(apply).not.toHaveBeenCalled();
  });

  test('skips classes without an opacity when requireOpacity is set', () => {
    document.body.innerHTML = '<p class="tc-blue"></p><span class="tc-blue-10"></span>';
    const apply = jest.fn();

    applyColorClasses('tc', apply, { requireOpacity: true });

    expect(apply).toHaveBeenCalledTimes(1);
    expect(apply.mock.calls[0][1]).toBe('rgba(0, 31, 63, 0.1)');
  });

  test('supports hyphenated color names', () => {
    document.documentElement.style.setProperty('--clr-deep-blue', '1, 2, 3');
    document.body.innerHTML = '<p class="tc-deep-blue"></p><span class="tc-deep-blue-50"></span>';
    const apply = jest.fn();

    applyColorClasses('tc', apply);

    expect(apply.mock.calls.map(([, color]) => color)).toEqual([
      'rgb(1, 2, 3)',
      'rgba(1, 2, 3, 0.5)'
    ]);
  });

  test('only walks elements inside the given scope', () => {
    document.body.innerHTML = '<p class="tc-blue"></p>';
    const scope = document.createElement('div');
    scope.innerHTML = '<span class="tc-blue"></span>';
    const apply = jest.fn();

    applyColorClasses('tc', apply, { scope });

    expect(apply).toHaveBeenCalledTimes(1);
    expect(apply.mock.calls[0][0]).toBe(scope.querySelector('span'));
  });
});
