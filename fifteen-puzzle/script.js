'use strict';

const GRID = 4;
const TOTAL = GRID * GRID; // 16

let state = [];       // flat array, 0 = empty
let moves = 0;
let tileEls = {};     // value -> DOM element
let touchStart = null;

// ── DOM refs ──────────────────────────────────────────────────────────────────
const board       = document.getElementById('board');
const moveDisplay = document.getElementById('move-count');
const winOverlay  = document.getElementById('win-overlay');
const winMoves    = document.getElementById('win-moves');

// ── Geometry helpers ──────────────────────────────────────────────────────────
function row(idx) { return Math.floor(idx / GRID); }
function col(idx) { return idx % GRID; }

function tilePixelPos(idx) {
  const gap = 4;
  const boardSize = board.offsetWidth;
  const tileSize = boardSize / GRID;
  return {
    left: col(idx) * tileSize + gap,
    top:  row(idx) * tileSize + gap,
  };
}

// ── State helpers ─────────────────────────────────────────────────────────────
function emptyIdx() { return state.indexOf(0); }

function canMove(tileIdx) {
  const empty = emptyIdx();
  const sameRow = row(tileIdx) === row(empty);
  const sameCol = col(tileIdx) === col(empty);
  return (sameRow && Math.abs(col(tileIdx) - col(empty)) === 1) ||
         (sameCol && Math.abs(row(tileIdx) - row(empty)) === 1);
}

function slideTile(tileIdx) {
  if (!canMove(tileIdx)) return false;
  const empty = emptyIdx();
  state[empty] = state[tileIdx];
  state[tileIdx] = 0;
  moves++;
  moveDisplay.textContent = moves;
  renderTiles();
  if (isSolved()) showWin();
  return true;
}

// ── Shuffle ───────────────────────────────────────────────────────────────────
function shuffle() {
  // Start solved, apply random valid moves
  state = Array.from({ length: TOTAL }, (_, i) => (i < TOTAL - 1 ? i + 1 : 0));
  const dirs = [-1, 1, -GRID, GRID];
  for (let i = 0; i < 300; i++) {
    const empty = emptyIdx();
    const neighbors = dirs
      .map(d => empty + d)
      .filter(n => {
        if (n < 0 || n >= TOTAL) return false;
        // prevent wrapping across rows for left/right moves
        if (n === empty - 1 && col(empty) === 0) return false;
        if (n === empty + 1 && col(empty) === GRID - 1) return false;
        return true;
      });
    const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
    state[empty] = state[pick];
    state[pick] = 0;
  }
}

// ── Render ────────────────────────────────────────────────────────────────────
function buildTiles() {
  board.innerHTML = '';
  tileEls = {};
  for (let value = 1; value < TOTAL; value++) {
    const div = document.createElement('div');
    div.className = 'tile';
    div.textContent = value;
    div.addEventListener('click', () => {
      const idx = state.indexOf(value);
      slideTile(idx);
    });
    board.appendChild(div);
    tileEls[value] = div;
  }
  renderTiles(false); // no transition on initial placement
}

function renderTiles(animate = true) {
  for (let value = 1; value < TOTAL; value++) {
    const idx = state.indexOf(value);
    const el = tileEls[value];
    const { left, top } = tilePixelPos(idx);
    if (!animate) {
      el.style.transition = 'none';
      el.style.left = left + 'px';
      el.style.top  = top  + 'px';
      // Force reflow so removing transition takes effect before re-enabling
      el.getBoundingClientRect();
      el.style.transition = '';
    } else {
      el.style.left = left + 'px';
      el.style.top  = top  + 'px';
    }
  }
}

// ── Win ───────────────────────────────────────────────────────────────────────
function isSolved() {
  for (let i = 0; i < TOTAL - 1; i++) {
    if (state[i] !== i + 1) return false;
  }
  return state[TOTAL - 1] === 0;
}

function showWin() {
  winMoves.textContent = `Solved in ${moves} move${moves === 1 ? '' : 's'}!`;
  winOverlay.classList.remove('hidden');
}

// ── Touch / swipe ─────────────────────────────────────────────────────────────
board.addEventListener('touchstart', e => {
  if (e.touches.length !== 1) return;
  touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
}, { passive: true });

board.addEventListener('touchend', e => {
  if (!touchStart) return;
  const dx = e.changedTouches[0].clientX - touchStart.x;
  const dy = e.changedTouches[0].clientY - touchStart.y;
  touchStart = null;

  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  const threshold = 10;
  if (absDx < threshold && absDy < threshold) return; // tap handled by click

  const empty = emptyIdx();
  let target = -1;

  if (absDx > absDy) {
    // Horizontal swipe: move tile on the opposite side of the empty space
    if (dx > 0 && col(empty) > 0)           target = empty - 1; // swipe right → tile left of empty moves right
    else if (dx < 0 && col(empty) < GRID-1) target = empty + 1; // swipe left  → tile right of empty moves left
  } else {
    // Vertical swipe
    if (dy > 0 && row(empty) > 0)           target = empty - GRID; // swipe down  → tile above moves down
    else if (dy < 0 && row(empty) < GRID-1) target = empty + GRID; // swipe up    → tile below moves up
  }

  if (target !== -1 && state[target] !== 0) slideTile(target);
}, { passive: true });

// ── New Game ──────────────────────────────────────────────────────────────────
function newGame() {
  winOverlay.classList.add('hidden');
  moves = 0;
  moveDisplay.textContent = '0';
  shuffle();
  buildTiles();
}

// ── Init ──────────────────────────────────────────────────────────────────────
newGame();
