const { applyTextColors } = require('../js/text-color-engine');

beforeEach(() => {
  document.documentElement.removeAttribute('style');
  document.body.innerHTML = '';
  document.documentElement.style.setProperty('--clr-blue', '0, 0, 255');
  document.documentElement.style.setProperty('--clr-red', '255, 0, 0');
});

test('applies a solid color for text-<color>', () => {
  document.body.innerHTML = '<p class="text-blue"></p>';

  applyTextColors();

  expect(document.querySelector('p').style.color).toBe('rgb(0, 0, 255)');
});

test('applies a tinted color for text-<color>-<opacity>', () => {
  document.body.innerHTML = '<p class="text-red-20"></p>';

  applyTextColors();

  expect(document.querySelector('p').style.color).toBe('rgba(255, 0, 0, 0.2)');
});

test('ignores classes that do not start with text-', () => {
  document.body.innerHTML = '<p class="blue"></p><span class="bg-blue-10"></span>';

  applyTextColors();

  expect(document.querySelector('p').style.color).toBe('');
  expect(document.querySelector('span').style.color).toBe('');
});

test('ignores utility text-* classes whose color has no custom property', () => {
  document.body.innerHTML = '<p class="text-uppercase"></p><span class="text-green-40"></span>';

  applyTextColors();

  expect(document.querySelector('p').style.color).toBe('');
  expect(document.querySelector('span').style.color).toBe('');
});

test('ignores text-* classes with more than three parts', () => {
  document.body.innerHTML = '<p class="text-blue-20-30"></p>';

  applyTextColors();

  expect(document.querySelector('p').style.color).toBe('');
});

test('applies the last matching class when an element has several', () => {
  document.body.innerHTML = '<p class="text-blue text-red-50"></p>';

  applyTextColors();

  expect(document.querySelector('p').style.color).toBe('rgba(255, 0, 0, 0.5)');
});

test('only touches elements inside the given scope', () => {
  document.body.innerHTML = '<p id="outside" class="text-blue"></p>';
  const scope = document.createElement('div');
  scope.innerHTML = '<p id="inside" class="text-blue"></p>';

  applyTextColors(scope);

  expect(scope.querySelector('#inside').style.color).toBe('rgb(0, 0, 255)');
  expect(document.querySelector('#outside').style.color).toBe('');
});
