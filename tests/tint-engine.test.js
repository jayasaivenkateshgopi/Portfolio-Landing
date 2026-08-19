const { applyTints } = require('../js/tint-engine');

function setVar(name, value) {
  document.documentElement.style.setProperty(name, value);
}

beforeEach(() => {
  document.documentElement.removeAttribute('style');
  document.body.innerHTML = '';
  setVar('--clr-blue', '0, 0, 255');
  setVar('--clr-red', '255, 0, 0');
});

test('applies rgba background from bg-<color>-<opacity> class', () => {
  document.body.innerHTML = '<div class="bg-blue-10"></div>';

  applyTints();

  expect(document.querySelector('div').style.backgroundColor).toBe('rgba(0, 0, 255, 0.1)');
});

test('converts the opacity part into a 0-1 alpha', () => {
  document.body.innerHTML = '<div class="bg-red-100"></div><span class="bg-red-5"></span>';

  applyTints();

  expect(document.querySelector('div').style.backgroundColor).toBe('rgb(255, 0, 0)');
  expect(document.querySelector('span').style.backgroundColor).toBe('rgba(255, 0, 0, 0.05)');
});

test('applies every matching class on every element in the scope', () => {
  document.body.innerHTML =
    '<section class="bg-blue-20"><div class="bg-red-50"></div><p class="other"></p></section>';

  applyTints(document);

  expect(document.querySelector('section').style.backgroundColor).toBe('rgba(0, 0, 255, 0.2)');
  expect(document.querySelector('div').style.backgroundColor).toBe('rgba(255, 0, 0, 0.5)');
  expect(document.querySelector('p').style.backgroundColor).toBe('');
});

test('ignores classes that are not bg-* or have the wrong number of parts', () => {
  document.body.innerHTML =
    '<div class="blue-10"></div><span class="bg-blue"></span><p class="bg-blue-10-20"></p>';

  applyTints();

  document.querySelectorAll('div, span, p').forEach(el => {
    expect(el.style.backgroundColor).toBe('');
  });
});

test('ignores classes with a non-numeric opacity', () => {
  document.body.innerHTML = '<div class="bg-blue-light"></div>';

  applyTints();

  expect(document.querySelector('div').style.backgroundColor).toBe('');
});

test('ignores colors that have no --clr-* custom property', () => {
  document.body.innerHTML = '<div class="bg-green-10"></div>';

  applyTints();

  expect(document.querySelector('div').style.backgroundColor).toBe('');
});

test('only touches elements inside the given scope', () => {
  document.body.innerHTML = '<div id="outside" class="bg-blue-10"></div>';
  const scope = document.createElement('div');
  scope.innerHTML = '<div id="inside" class="bg-blue-10"></div>';

  applyTints(scope);

  expect(scope.querySelector('#inside').style.backgroundColor).toBe('rgba(0, 0, 255, 0.1)');
  expect(document.querySelector('#outside').style.backgroundColor).toBe('');
});
