const { initCursorEngine } = require('../js/cursor');

function mouseMove(x, y) {
  document.dispatchEvent(new MouseEvent('mousemove', { clientX: x, clientY: y }));
}

function stubRect(el, rect) {
  el.getBoundingClientRect = () => ({
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height
  });
}

let rafCallbacks;

beforeEach(() => {
  document.body.innerHTML = '';
  rafCallbacks = [];
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
    rafCallbacks.push(cb);
    return rafCallbacks.length;
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('appends the cursor elements to the body', () => {
  const engine = initCursorEngine();

  expect(document.querySelector('.cursor-dot')).toBe(engine.cursorDot);
  expect(document.querySelector('.cursor-outline')).toBe(engine.cursorOutline);
  expect(document.querySelector('.button-border')).toBe(engine.buttonBorder);
});

test('moves the dot to the pointer position on mousemove', () => {
  const engine = initCursorEngine();

  mouseMove(120, 80);

  expect(engine.cursorDot.style.left).toBe('120px');
  expect(engine.cursorDot.style.top).toBe('80px');
  expect(engine.getState()).toMatchObject({ mouseX: 120, mouseY: 80 });
});

test('eases the outline towards the pointer on each animation frame', () => {
  const engine = initCursorEngine();

  mouseMove(100, 200);
  engine.animateOutline();

  expect(engine.cursorOutline.style.left).toBe('25px');
  expect(engine.cursorOutline.style.top).toBe('50px');

  engine.animateOutline();

  expect(engine.cursorOutline.style.left).toBe('43.75px');
  expect(engine.cursorOutline.style.top).toBe('87.5px');
});

test('schedules the next animation frame', () => {
  const engine = initCursorEngine();

  expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);

  rafCallbacks.pop()();

  expect(window.requestAnimationFrame).toHaveBeenCalledTimes(2);
  expect(engine.cursorOutline.style.left).toBe('0px');
});

test('expands the outline over a hovered button and hides the dot', () => {
  document.body.innerHTML = '<button id="cta">Go</button>';
  const button = document.getElementById('cta');
  stubRect(button, { left: 10, top: 20, width: 100, height: 40 });
  button.style.border = '3px dashed rgb(1, 2, 3)';
  button.style.borderRadius = '8px';

  const engine = initCursorEngine();
  button.dispatchEvent(new MouseEvent('mouseenter'));

  const outline = engine.cursorOutline;
  expect(outline.classList.contains('hover-button')).toBe(true);
  expect(engine.cursorDot.style.opacity).toBe('0');
  expect(outline.style.width).toBe('100px');
  expect(outline.style.height).toBe('40px');
  expect(outline.style.borderRadius).toBe('8px');
  expect(outline.style.borderWidth).toBe('3px');
  expect(outline.style.borderStyle).toBe('dashed');
  expect(outline.style.borderColor).toBe('rgb(1, 2, 3)');
  expect(engine.getState().isHoveringButton).toBe(true);
  expect(engine.getState().currentButton).toBe(button);
});

test('centers the outline on the hovered button', () => {
  document.body.innerHTML = '<button id="cta">Go</button>';
  const button = document.getElementById('cta');
  stubRect(button, { left: 10, top: 20, width: 100, height: 40 });

  const engine = initCursorEngine();
  button.dispatchEvent(new MouseEvent('mouseenter'));

  // Target is (60, 40); each frame eases 25% of the remaining distance.
  engine.animateOutline();

  expect(engine.cursorOutline.style.left).toBe('15px');
  expect(engine.cursorOutline.style.top).toBe('10px');
});

test('falls back to the outline default color when the target has no border', () => {
  document.body.innerHTML = '<a href="/" class="btn-cmn">Go</a>';
  const link = document.querySelector('.btn-cmn');
  stubRect(link, { left: 0, top: 0, width: 50, height: 50 });

  const engine = initCursorEngine();
  engine.cursorOutline.style.border = '2px solid rgb(9, 9, 9)';
  link.dispatchEvent(new MouseEvent('mouseenter'));

  expect(engine.cursorOutline.style.borderWidth).toBe('2px');
  expect(engine.cursorOutline.style.borderStyle).toBe('solid');
  expect(engine.cursorOutline.style.borderColor).toBe('rgb(9, 9, 9)');
});

test('restores the default outline on mouseleave', () => {
  document.body.innerHTML = '<button id="cta">Go</button>';
  const button = document.getElementById('cta');
  stubRect(button, { left: 10, top: 20, width: 100, height: 40 });
  button.style.border = '3px solid rgb(1, 2, 3)';

  const engine = initCursorEngine();
  mouseMove(7, 9);
  button.dispatchEvent(new MouseEvent('mouseenter'));
  button.dispatchEvent(new MouseEvent('mouseleave'));

  const outline = engine.cursorOutline;
  expect(outline.classList.contains('hover-button')).toBe(false);
  expect(engine.cursorDot.style.opacity).toBe('1');
  ['width', 'height', 'borderRadius', 'borderWidth', 'borderColor', 'borderStyle'].forEach(prop => {
    expect(outline.style[prop]).toBe('');
  });
  expect(engine.getState().isHoveringButton).toBe(false);
  expect(engine.getState().currentButton).toBe(null);
});

test('keeps the outline on the button while hovering, ignoring mousemove', () => {
  document.body.innerHTML = '<button id="cta">Go</button>';
  const button = document.getElementById('cta');
  stubRect(button, { left: 100, top: 100, width: 100, height: 100 });

  const engine = initCursorEngine();
  button.dispatchEvent(new MouseEvent('mouseenter'));
  mouseMove(0, 0);
  engine.animateOutline();

  // Still easing towards the button center (150, 150), not the pointer.
  expect(engine.cursorOutline.style.left).toBe('37.5px');
  expect(engine.cursorOutline.style.top).toBe('37.5px');
});

test('binds hover handlers to .btn-cmn elements too', () => {
  document.body.innerHTML = '<a href="/" class="btn-cmn">Explore</a>';
  const link = document.querySelector('.btn-cmn');
  stubRect(link, { left: 0, top: 0, width: 10, height: 10 });

  const engine = initCursorEngine();
  link.dispatchEvent(new MouseEvent('mouseenter'));

  expect(engine.getState().currentButton).toBe(link);
});

test('binds hover handlers to dynamically added buttons', async () => {
  const engine = initCursorEngine();

  const button = document.createElement('button');
  stubRect(button, { left: 0, top: 0, width: 20, height: 20 });
  document.body.appendChild(button);
  await Promise.resolve();

  button.dispatchEvent(new MouseEvent('mouseenter'));

  expect(engine.getState().currentButton).toBe(button);
});

test('binds hover handlers to buttons nested in added subtrees', async () => {
  const engine = initCursorEngine();

  const wrapper = document.createElement('section');
  wrapper.innerHTML = '<a href="/" class="btn-cmn">Nested</a>';
  document.body.appendChild(wrapper);
  await Promise.resolve();

  const link = wrapper.querySelector('.btn-cmn');
  stubRect(link, { left: 0, top: 0, width: 20, height: 20 });
  link.dispatchEvent(new MouseEvent('mouseenter'));

  expect(engine.getState().currentButton).toBe(link);
});

test('resets hover state when the hovered button leaves the DOM', () => {
  document.body.innerHTML = '<button id="cta">Go</button>';
  const button = document.getElementById('cta');
  stubRect(button, { left: 0, top: 0, width: 20, height: 20 });

  const engine = initCursorEngine();
  button.dispatchEvent(new MouseEvent('mouseenter'));
  button.remove();
  engine.animateOutline();

  expect(engine.getState().isHoveringButton).toBe(false);
  expect(engine.getState().currentButton).toBe(null);
  expect(engine.cursorDot.style.opacity).toBe('1');
  expect(engine.cursorOutline.classList.contains('hover-button')).toBe(false);
});

test('logs and keeps animating when a frame throws', () => {
  document.body.innerHTML = '<button id="cta">Go</button>';
  const button = document.getElementById('cta');
  stubRect(button, { left: 0, top: 0, width: 20, height: 20 });
  const error = jest.spyOn(console, 'error').mockImplementation(() => {});

  const engine = initCursorEngine();
  button.dispatchEvent(new MouseEvent('mouseenter'));

  const boom = new Error('boom');
  button.getBoundingClientRect = () => { throw boom; };

  expect(() => engine.animateOutline()).not.toThrow();
  expect(error).toHaveBeenCalledWith('cursor: animation frame failed', boom);
  expect(window.requestAnimationFrame).toHaveBeenCalled();
});
