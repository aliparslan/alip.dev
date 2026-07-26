const card = document.getElementById('card');
const frontFace = document.getElementById('front');
const backFace = document.getElementById('back');
const showBackButton = document.getElementById('flip-to-back');
const showFrontButton = document.getElementById('flip-to-front');
const finePointer = window.matchMedia('(pointer: fine)').matches;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function setFlipped(showBack, moveFocus = true) {
  card.classList.toggle('flipped', showBack);
  showBackButton.setAttribute('aria-expanded', String(showBack));
  frontFace.toggleAttribute('inert', showBack);
  backFace.toggleAttribute('inert', !showBack);
  if (moveFocus) {
    (showBack ? showFrontButton : showBackButton).focus({ preventScroll: true });
  }
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
let dragCleanupTimer;

function settleDrag(showBack, targetAngle, moveFocus) {
  setFlipped(showBack, moveFocus);
  card.classList.remove('dragging');

  window.requestAnimationFrame(() => {
    function finish() {
      card.removeEventListener('transitionend', finish);
      clearTimeout(dragCleanupTimer);
      card.classList.add('normalizing');
      window.requestAnimationFrame(() => {
        card.style.removeProperty('transform');
        window.requestAnimationFrame(() => card.classList.remove('normalizing'));
      });
    }

    card.addEventListener('transitionend', finish);
    card.style.transform = `rotateY(${targetAngle}deg)`;
    dragCleanupTimer = window.setTimeout(finish, 800);
  });
}

card.addEventListener('pointerdown', (event) => {
  if (event.pointerType !== 'touch' || !event.isPrimary) return;

  const eventTarget = event.target instanceof Element ? event.target : null;
  swipeStart = {
    id: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    startedAt: event.timeStamp,
    width: card.getBoundingClientRect().width,
    wasFlipped: card.classList.contains('flipped'),
    dragging: false,
    startedOnControl: Boolean(eventTarget?.closest('a, button')),
  };
});

window.addEventListener('pointermove', (event) => {
  if (!swipeStart || event.pointerId !== swipeStart.id) return;

  const deltaX = event.clientX - swipeStart.x;
  const deltaY = event.clientY - swipeStart.y;
  const hasHorizontalIntent =
    Math.abs(deltaX) >= 8 && Math.abs(deltaX) > Math.abs(deltaY);
  if (!hasHorizontalIntent) return;

  event.preventDefault();
  swipeStart.dragging = true;
  if (reducedMotion) return;

  const progress = Math.min(Math.abs(deltaX) / (swipeStart.width * 0.65), 1);
  const baseAngle = swipeStart.wasFlipped ? 180 : 0;
  const angle = baseAngle - Math.sign(deltaX) * progress * 180;

  card.classList.add('dragging');
  card.style.transform = `rotateY(${angle}deg)`;
}, { passive: false });

window.addEventListener('pointerup', (event) => {
  if (!swipeStart || event.pointerId !== swipeStart.id) return;

  const gesture = swipeStart;
  const deltaX = event.clientX - gesture.x;
  const deltaY = event.clientY - gesture.y;
  const distance = Math.abs(deltaX);
  const duration = Math.max(event.timeStamp - gesture.startedAt, 1);
  const velocity = distance / duration;
  const minDistance = Math.max(44, gesture.width * 0.12);
  const isHorizontal = distance > Math.abs(deltaY) * 1.25;
  const isFlick = distance >= 20 && velocity >= 0.5;
  const shouldFlip = isHorizontal && (distance >= minDistance || isFlick);
  swipeStart = null;

  suppressClick = gesture.startedOnControl && gesture.dragging;
  clearTimeout(suppressClickTimer);
  suppressClickTimer = window.setTimeout(() => {
    suppressClick = false;
  }, 500);

  const showBack = shouldFlip ? !gesture.wasFlipped : gesture.wasFlipped;
  if (!gesture.dragging || reducedMotion) {
    if (shouldFlip) setFlipped(showBack);
    return;
  }

  const baseAngle = gesture.wasFlipped ? 180 : 0;
  const targetAngle = shouldFlip
    ? baseAngle - Math.sign(deltaX) * 180
    : baseAngle;
  settleDrag(showBack, targetAngle, shouldFlip);
});

window.addEventListener('pointercancel', (event) => {
  if (!swipeStart || event.pointerId !== swipeStart.id) return;

  const gesture = swipeStart;
  swipeStart = null;
  if (gesture.dragging && !reducedMotion) {
    settleDrag(gesture.wasFlipped, gesture.wasFlipped ? 180 : 0, false);
  }
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
    if (event.pointerType !== 'mouse') return;

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
