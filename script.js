const card = document.getElementById('card');
const frontFace = document.getElementById('front');
const backFace = document.getElementById('back');
const showBackButton = document.getElementById('flip-to-back');
const showFrontButton = document.getElementById('flip-to-front');

function setFlipped(showBack) {
  card.classList.toggle('flipped', showBack);
  showBackButton.setAttribute('aria-expanded', String(showBack));
  frontFace.toggleAttribute('inert', showBack);
  backFace.toggleAttribute('inert', !showBack);
  (showBack ? showFrontButton : showBackButton).focus({ preventScroll: true });
}

showBackButton.addEventListener('click', () => setFlipped(true));
showFrontButton.addEventListener('click', () => setFlipped(false));

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && card.classList.contains('flipped')) {
    setFlipped(false);
  }
});

// Touch swipe
let swipeStart = null;
let suppressClick = false;
let suppressClickTimer;

card.addEventListener('pointerdown', (event) => {
  if (event.pointerType !== 'touch' || !event.isPrimary) return;

  const eventTarget = event.target instanceof Element ? event.target : null;
  swipeStart = {
    id: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    startedOnControl: Boolean(eventTarget?.closest('a, button')),
  };
});

card.addEventListener('pointerup', (event) => {
  if (!swipeStart || event.pointerId !== swipeStart.id) return;

  const gesture = swipeStart;
  const deltaX = event.clientX - gesture.x;
  const deltaY = event.clientY - gesture.y;
  const minDistance = Math.max(44, card.getBoundingClientRect().width * 0.12);
  const isSwipe =
    Math.abs(deltaX) >= minDistance &&
    Math.abs(deltaX) > Math.abs(deltaY) * 1.25;
  swipeStart = null;

  if (!isSwipe) return;

  suppressClick = gesture.startedOnControl;
  clearTimeout(suppressClickTimer);
  suppressClickTimer = window.setTimeout(() => {
    suppressClick = false;
  }, 500);
  setFlipped(!card.classList.contains('flipped'));
});

card.addEventListener('pointercancel', () => {
  swipeStart = null;
});

card.addEventListener('click', (event) => {
  if (!suppressClick) return;

  suppressClick = false;
  clearTimeout(suppressClickTimer);
  event.preventDefault();
  event.stopPropagation();
}, true);

// Pointer tilt
const scene = document.querySelector('.scene');
const tilt = document.querySelector('.tilt');
const finePointer = window.matchMedia('(pointer: fine)').matches;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (finePointer && !reducedMotion) {
  const MAX_TILT = 2.2;
  const EASING = 0.12;
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let running = false;

  function clampUnit(value) {
    return Math.max(-1, Math.min(1, value));
  }

  function renderTilt() {
    currentX += (targetX - currentX) * EASING;
    currentY += (targetY - currentY) * EASING;

    const settled =
      Math.abs(targetX - currentX) < 0.005 &&
      Math.abs(targetY - currentY) < 0.005;
    if (settled) {
      currentX = targetX;
      currentY = targetY;
    }

    // Remove the transform at rest so text and hairlines stay crisp.
    tilt.style.transform = (currentX === 0 && currentY === 0)
      ? ''
      : `rotateX(${currentX.toFixed(2)}deg) rotateY(${currentY.toFixed(2)}deg)`;

    if (settled) {
      running = false;
      return;
    }
    window.requestAnimationFrame(renderTilt);
  }

  function requestTiltFrame() {
    if (running) return;
    running = true;
    window.requestAnimationFrame(renderTilt);
  }

  window.addEventListener('pointermove', (event) => {
    const bounds = scene.getBoundingClientRect();
    const insideScene =
      event.clientX >= bounds.left &&
      event.clientX <= bounds.right &&
      event.clientY >= bounds.top &&
      event.clientY <= bounds.bottom;

    if (!insideScene) {
      targetX = 0;
      targetY = 0;
      requestTiltFrame();
      return;
    }

    const horizontalPosition =
      (event.clientX - bounds.left - bounds.width / 2) / (bounds.width / 2);
    const verticalPosition =
      (event.clientY - bounds.top - bounds.height / 2) / (bounds.height / 2);

    targetY = clampUnit(horizontalPosition) * MAX_TILT;
    targetX = clampUnit(verticalPosition) * -MAX_TILT;
    requestTiltFrame();
  }, { passive: true });
}
