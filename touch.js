/* touch.js - Mobile Touch Controls for Ultimate Tailwind Snake Game */

// Global variables for touch coordinates
let touchStartX = null;
let touchStartY = null;

// Listen for touchstart events on the canvas
canvas.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }
}, false);

// Listen for touchend events and determine swipe direction
canvas.addEventListener('touchend', (e) => {
  if (touchStartX === null || touchStartY === null) return;
  
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  
  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;
  
  // Determine whether the swipe is horizontal or vertical
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX > 0) {
      changeDirection({ key: 'ArrowRight' });
    } else {
      changeDirection({ key: 'ArrowLeft' });
    }
  } else {
    if (deltaY > 0) {
      changeDirection({ key: 'ArrowDown' });
    } else {
      changeDirection({ key: 'ArrowUp' });
    }
  }
  
  // Reset touch start values
  touchStartX = null;
  touchStartY = null;
}, false);

// Prevent scrolling when swiping on the canvas
canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
}, { passive: false });
