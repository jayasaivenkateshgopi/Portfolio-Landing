const fs = require('fs');
const path = require('path');
const { applyTints } = require('../js/tint-engine');
const { applyTextColors } = require('../js/text-color-engine');
const { initCursorEngine } = require('../js/cursor');

const html = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');

function loadPage() {
  document.documentElement.innerHTML = html.replace(/<!DOCTYPE html>/i, '');
  document.documentElement.style.setProperty('--clr-blue', '0, 31, 63');
  document.documentElement.style.setProperty('--clr-red', '255, 0, 0');
}

beforeEach(() => {
  loadPage();
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 0);
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders both hero sections with their calls to action', () => {
  const titles = [...document.querySelectorAll('.hero-title')].map(el => el.textContent.trim());
  expect(titles).toEqual(['PORTFOLIO', 'Freelance']);

  const links = [...document.querySelectorAll('.btn-cmn')].map(el => el.textContent.trim());
  expect(links).toEqual(['Explore Portfolio', 'View Services']);
});

test('loads the three engine scripts', () => {
  const sources = [...document.querySelectorAll('script[src]')].map(el => el.getAttribute('src'));

  expect(sources).toEqual(
    expect.arrayContaining(['./js/tint-engine.js', './js/text-color-engine.js', './js/cursor.js'])
  );
});

test('tints the portfolio section from its bg-blue-10 class', () => {
  applyTints();

  expect(document.querySelector('.portfolio').style.backgroundColor).toBe('rgba(0, 31, 63, 0.1)');
});

test('leaves text-* utility classes without an inline color', () => {
  applyTextColors();

  document.querySelectorAll('.text-uppercase, .text-right').forEach(el => {
    expect(el.style.color).toBe('');
  });
});

test('wires the custom cursor to both call-to-action links', () => {
  const engine = initCursorEngine();

  expect(document.querySelectorAll('.cursor-dot')).toHaveLength(1);
  expect(document.querySelectorAll('.cursor-outline')).toHaveLength(1);
  expect(document.querySelectorAll('.button-border')).toHaveLength(1);

  document.querySelectorAll('.btn-cmn').forEach(link => {
    link.dispatchEvent(new MouseEvent('mouseenter'));
    expect(engine.getState().currentButton).toBe(link);
    link.dispatchEvent(new MouseEvent('mouseleave'));
    expect(engine.getState().currentButton).toBe(null);
  });
});
