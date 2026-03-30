'use strict';

// ===== VEHICLE DATA =====
const VEHICLES = {
  car: {
    name: 'Race Car',
    emoji: '🏎️',
    computerEmoji: '🚗',
    parts: ['🛞', '🚘', '⚡'],
    partNames: ['Wheels', 'Body', 'Engine'],
    track: 'road',
    readyMsg: 'Your Race Car is READY!',
  },
  airplane: {
    name: 'Airplane',
    emoji: '✈️',
    computerEmoji: '🛸',
    parts: ['🛩️', '✈️', '🚀'],
    partNames: ['Wings', 'Body', 'Engine'],
    track: 'sky',
    readyMsg: 'Your Airplane is READY!',
  },
  submarine: {
    name: 'Submarine',
    emoji: '🐬',
    computerEmoji: '🐋',
    parts: ['🔩', '🛥️', '🌊'],
    partNames: ['Propeller', 'Hull', 'Fins'],
    track: 'ocean',
    readyMsg: 'Your Submarine is READY!',
  },
};

// ===== PUZZLE POOL =====
// All puzzles age-appropriate for 5–7 year olds
const PUZZLE_POOL = [

  // --- COLOR puzzles ---
  {
    id: 'col-red', type: 'color',
    question: 'Tap the 🔴 RED one!',
    choices: [
      { label: 'RED',    color: '#EF4444', correct: true },
      { label: 'BLUE',   color: '#3B82F6', correct: false },
      { label: 'GREEN',  color: '#22C55E', correct: false },
      { label: 'YELLOW', color: '#EAB308', correct: false },
    ],
  },
  {
    id: 'col-blue', type: 'color',
    question: 'Tap the 🔵 BLUE one!',
    choices: [
      { label: 'RED',    color: '#EF4444', correct: false },
      { label: 'BLUE',   color: '#3B82F6', correct: true },
      { label: 'GREEN',  color: '#22C55E', correct: false },
      { label: 'YELLOW', color: '#EAB308', correct: false },
    ],
  },
  {
    id: 'col-green', type: 'color',
    question: 'Tap the 🟢 GREEN one!',
    choices: [
      { label: 'PINK',   color: '#EC4899', correct: false },
      { label: 'ORANGE', color: '#F97316', correct: false },
      { label: 'GREEN',  color: '#22C55E', correct: true },
      { label: 'PURPLE', color: '#A855F7', correct: false },
    ],
  },
  {
    id: 'col-yellow', type: 'color',
    question: 'Tap the 🟡 YELLOW one!',
    choices: [
      { label: 'RED',    color: '#EF4444', correct: false },
      { label: 'BLUE',   color: '#3B82F6', correct: false },
      { label: 'YELLOW', color: '#EAB308', correct: true },
      { label: 'PURPLE', color: '#A855F7', correct: false },
    ],
  },
  {
    id: 'col-pink', type: 'color',
    question: 'Tap the 🩷 PINK one!',
    choices: [
      { label: 'ORANGE', color: '#F97316', correct: false },
      { label: 'PINK',   color: '#EC4899', correct: true },
      { label: 'BLUE',   color: '#3B82F6', correct: false },
      { label: 'GREEN',  color: '#22C55E', correct: false },
    ],
  },
  {
    id: 'col-orange', type: 'color',
    question: 'Tap the 🟠 ORANGE one!',
    choices: [
      { label: 'RED',    color: '#EF4444', correct: false },
      { label: 'YELLOW', color: '#EAB308', correct: false },
      { label: 'ORANGE', color: '#F97316', correct: true },
      { label: 'PURPLE', color: '#A855F7', correct: false },
    ],
  },

  // --- COUNT puzzles ---
  {
    id: 'cnt-1', type: 'count',
    question: 'How many 🐱 do you see?',
    items: ['🐱'],
    choices: ['1', '2', '3', '4'],
    correctIndex: 0,
  },
  {
    id: 'cnt-2', type: 'count',
    question: 'How many ⭐ do you see?',
    items: ['⭐', '⭐'],
    choices: ['1', '2', '3', '4'],
    correctIndex: 1,
  },
  {
    id: 'cnt-3', type: 'count',
    question: 'How many 🍎 do you see?',
    items: ['🍎', '🍎', '🍎'],
    choices: ['2', '3', '4', '5'],
    correctIndex: 1,
  },
  {
    id: 'cnt-4', type: 'count',
    question: 'How many 🐶 do you see?',
    items: ['🐶', '🐶', '🐶', '🐶'],
    choices: ['2', '3', '4', '5'],
    correctIndex: 2,
  },
  {
    id: 'cnt-5', type: 'count',
    question: 'How many 🌟 do you see?',
    items: ['🌟', '🌟', '🌟', '🌟', '🌟'],
    choices: ['3', '4', '5', '6'],
    correctIndex: 2,
  },
  {
    id: 'cnt-3b', type: 'count',
    question: 'How many 🦋 do you see?',
    items: ['🦋', '🦋', '🦋'],
    choices: ['1', '2', '3', '4'],
    correctIndex: 2,
  },
  {
    id: 'cnt-2b', type: 'count',
    question: 'How many 🐸 do you see?',
    items: ['🐸', '🐸'],
    choices: ['1', '2', '3', '4'],
    correctIndex: 1,
  },

  // --- SHAPE puzzles ---
  {
    id: 'shp-circle', type: 'shape',
    question: 'Tap the CIRCLE!',
    shapes: ['circle', 'square', 'triangle', 'star'],
    correctIndex: 0,
  },
  {
    id: 'shp-square', type: 'shape',
    question: 'Tap the SQUARE!',
    shapes: ['circle', 'square', 'triangle', 'star'],
    correctIndex: 1,
  },
  {
    id: 'shp-triangle', type: 'shape',
    question: 'Tap the TRIANGLE!',
    shapes: ['circle', 'square', 'triangle', 'star'],
    correctIndex: 2,
  },
  {
    id: 'shp-star', type: 'shape',
    question: 'Tap the STAR!',
    shapes: ['circle', 'square', 'triangle', 'star'],
    correctIndex: 3,
  },

  // --- VISUAL MATH puzzles (emoji counting) ---
  {
    id: 'math-1+1', type: 'math',
    question: '🍊 + 🍊 = ?',
    choices: ['1', '2', '3', '4'],
    correctIndex: 1,
  },
  {
    id: 'math-1+2', type: 'math',
    question: '⭐ + ⭐⭐ = ?',
    choices: ['1', '2', '3', '4'],
    correctIndex: 2,
  },
  {
    id: 'math-2+2', type: 'math',
    question: '🐶 + 🐶 + 🐶 + 🐶 = ?',
    choices: ['2', '3', '4', '5'],
    correctIndex: 2,
  },
  {
    id: 'math-1+3', type: 'math',
    question: '🍎 + 🍎🍎🍎 = ?',
    choices: ['3', '4', '5', '6'],
    correctIndex: 1,
  },
  {
    id: 'math-2+1', type: 'math',
    question: '🌸🌸 + 🌸 = ?',
    choices: ['1', '2', '3', '4'],
    correctIndex: 2,
  },
  {
    id: 'math-3+2', type: 'math',
    question: '🌟🌟🌟 + 🌟🌟 = ?',
    choices: ['4', '5', '6', '7'],
    correctIndex: 1,
  },
];

// ===== GAME STATE =====
let state = {
  vehicle: null,
  puzzles: [],
  currentPuzzle: 0,
  partsEarned: 0,
  firstTryScore: 0,
  isFirstTry: true,
  raceOver: false,
};

// ===== AUDIO =====
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { return null; }
  }
  return audioCtx;
}

function playTone(ctx, freq, startDelay, duration, type = 'sine', vol = 0.28) {
  try {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startDelay);
    gain.gain.setValueAtTime(vol, ctx.currentTime + startDelay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startDelay + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + startDelay);
    osc.stop(ctx.currentTime + startDelay + duration + 0.01);
  } catch (e) { /* ignore */ }
}

function playSound(type) {
  const ctx = getAudioCtx();
  if (!ctx) return;

  if (type === 'correct') {
    playTone(ctx, 523, 0,    0.12);
    playTone(ctx, 659, 0.10, 0.12);
    playTone(ctx, 784, 0.20, 0.20);
  } else if (type === 'wrong') {
    playTone(ctx, 280, 0,    0.10, 'sawtooth', 0.2);
    playTone(ctx, 220, 0.12, 0.22, 'sawtooth', 0.2);
  } else if (type === 'part') {
    playTone(ctx, 523,  0,    0.08);
    playTone(ctx, 784,  0.09, 0.08);
    playTone(ctx, 1047, 0.18, 0.30);
  } else if (type === 'go') {
    playTone(ctx, 784,  0,    0.12);
    playTone(ctx, 1047, 0.14, 0.28);
  } else if (type === 'win') {
    [523, 659, 784, 659, 1047].forEach((f, i) => playTone(ctx, f, i * 0.13, 0.22));
  } else if (type === 'lose') {
    playTone(ctx, 400, 0,   0.18, 'sawtooth', 0.2);
    playTone(ctx, 300, 0.2, 0.30, 'sawtooth', 0.2);
  } else if (type === 'tick') {
    playTone(ctx, 880, 0, 0.07);
  }
}

// ===== UTILITIES =====
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ===== HOME =====
function goHome() {
  state = {
    vehicle: null,
    puzzles: [],
    currentPuzzle: 0,
    partsEarned: 0,
    firstTryScore: 0,
    isFirstTry: true,
    raceOver: false,
  };
  showScreen('screen-home');
}

// ===== BUILD SCREEN =====
function startGame(vehicleKey) {
  // Unlock audio on first interaction
  getAudioCtx();

  const vehicle = VEHICLES[vehicleKey];
  state.vehicle = vehicleKey;
  state.puzzles = selectPuzzles();
  state.currentPuzzle = 0;
  state.partsEarned = 0;
  state.firstTryScore = 0;
  state.isFirstTry = true;

  document.getElementById('factory-title').textContent = `🏭 ${vehicle.name} Factory`;
  document.getElementById('build-progress-text').textContent = `Solve puzzles to build your ${vehicle.name}!`;

  // Reset part slots
  for (let i = 0; i < 3; i++) {
    const slot = document.getElementById(`part-slot-${i}`);
    slot.innerHTML = '<span class="part-q">❓</span>';
    slot.classList.remove('earned');
  }

  showScreen('screen-build');
  showPuzzle(0);
}

function selectPuzzles() {
  // Pick one from each type for variety (color/count/shape/math), shuffled
  const byType = {};
  PUZZLE_POOL.forEach(p => {
    if (!byType[p.type]) byType[p.type] = [];
    byType[p.type].push(p);
  });

  const types  = shuffle(Object.keys(byType));
  const picked = [];
  const usedIds = new Set();

  for (const type of types) {
    if (picked.length >= 3) break;
    const pool = byType[type].filter(p => !usedIds.has(p.id));
    if (pool.length) {
      const p = pool[Math.floor(Math.random() * pool.length)];
      picked.push(p);
      usedIds.add(p.id);
    }
  }

  // Fill to 3 if needed
  while (picked.length < 3) {
    const remaining = PUZZLE_POOL.filter(p => !usedIds.has(p.id));
    if (!remaining.length) break;
    const p = remaining[Math.floor(Math.random() * remaining.length)];
    picked.push(p);
    usedIds.add(p.id);
  }

  return picked;
}

function showPuzzle(index) {
  const puzzle  = state.puzzles[index];
  const vehicle = VEHICLES[state.vehicle];
  state.isFirstTry = true;

  document.getElementById('puzzle-number').textContent =
    `Puzzle ${index + 1} of 3 — Earn the ${vehicle.partNames[index]}!`;
  document.getElementById('puzzle-question').textContent = puzzle.question;

  const feedbackEl = document.getElementById('puzzle-feedback');
  feedbackEl.className = 'feedback hidden';
  feedbackEl.textContent = '';

  const display = document.getElementById('puzzle-display');
  const choices = document.getElementById('puzzle-choices');
  display.innerHTML = '';
  choices.innerHTML = '';

  if (puzzle.type === 'color')  renderColor(puzzle, display, choices);
  if (puzzle.type === 'count')  renderCount(puzzle, display, choices);
  if (puzzle.type === 'shape')  renderShape(puzzle, display, choices);
  if (puzzle.type === 'math')   renderMath(puzzle, display, choices);
}

// ---- Render helpers ----
function renderColor(puzzle, display, choices) {
  const shuffled = shuffle(puzzle.choices);
  shuffled.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn color-choice';
    btn.style.background = choice.color;
    btn.style.border = '3px solid rgba(255,255,255,0.45)';
    btn.textContent = choice.label;
    btn.addEventListener('click', () => handleAnswer(choice.correct, btn));
    choices.appendChild(btn);
  });
}

function renderCount(puzzle, display, choices) {
  display.textContent = puzzle.items.join(' ');
  puzzle.choices.forEach((val, i) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = val;
    btn.addEventListener('click', () => handleAnswer(i === puzzle.correctIndex, btn));
    choices.appendChild(btn);
  });
}

function renderShape(puzzle, display, choices) {
  puzzle.shapes.forEach((shape, i) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';

    if (shape === 'star') {
      const s = document.createElement('span');
      s.className = 'shape-star';
      s.textContent = '⭐';
      btn.appendChild(s);
    } else {
      const wrap = document.createElement('div');
      wrap.className = 'shape-wrap';
      const inner = document.createElement('div');
      inner.className = `shape-${shape}`;
      wrap.appendChild(inner);
      btn.appendChild(wrap);
    }

    btn.addEventListener('click', () => handleAnswer(i === puzzle.correctIndex, btn));
    choices.appendChild(btn);
  });
}

function renderMath(puzzle, display, choices) {
  puzzle.choices.forEach((val, i) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = val;
    btn.addEventListener('click', () => handleAnswer(i === puzzle.correctIndex, btn));
    choices.appendChild(btn);
  });
}

// ---- Answer handling ----
function handleAnswer(isCorrect, btn) {
  // Disable all buttons immediately to prevent double-tap
  const buttons = document.querySelectorAll('#puzzle-choices .choice-btn');
  buttons.forEach(b => { b.style.pointerEvents = 'none'; });

  const feedback = document.getElementById('puzzle-feedback');

  if (isCorrect) {
    btn.classList.add('correct');
    feedback.textContent = pick([
      'Great job! 🌟', 'You got it! 🎉', 'Amazing! ⭐',
      'Correct! 🎊', 'Awesome! 🙌', 'Brilliant! 💫',
    ]);
    feedback.className = 'feedback success';

    if (state.isFirstTry) state.firstTryScore++;
    playSound('correct');

    setTimeout(() => awardPart(state.currentPuzzle), 750);

  } else {
    btn.classList.add('wrong');
    feedback.textContent = pick([
      'Not quite! Try again 💪',
      'Oops! Give it another try 🤗',
      'Almost! Try once more 💫',
    ]);
    feedback.className = 'feedback error';
    state.isFirstTry = false;
    playSound('wrong');

    setTimeout(() => {
      btn.classList.remove('wrong');
      feedback.className = 'feedback hidden';
      buttons.forEach(b => { b.style.pointerEvents = ''; });
    }, 1100);
  }
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function awardPart(index) {
  const vehicle = VEHICLES[state.vehicle];
  const slot = document.getElementById(`part-slot-${index}`);
  slot.innerHTML = `<span>${vehicle.parts[index]}</span>`;
  slot.classList.add('earned');
  playSound('part');
  state.partsEarned++;

  if (state.currentPuzzle < 2) {
    state.currentPuzzle++;
    setTimeout(() => showPuzzle(state.currentPuzzle), 900);
  } else {
    // All 3 parts collected!
    document.getElementById('build-progress-text').textContent = vehicle.readyMsg + ' 🎉';
    setTimeout(() => showReadyOverlay(), 600);
  }
}

function showReadyOverlay() {
  const vehicle = VEHICLES[state.vehicle];
  const overlay = document.createElement('div');
  overlay.className = 'ready-overlay';
  overlay.innerHTML = `
    <div class="ready-box">
      <span class="ready-emoji">${vehicle.emoji}</span>
      <h3>${vehicle.readyMsg}</h3>
      <p>Get ready to race! 🏁</p>
    </div>`;
  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.remove();
    startRace();
  }, 2000);
}

// ===== RACE SCREEN =====
function startRace() {
  const vehicle = VEHICLES[state.vehicle];

  const livyVehicle     = document.getElementById('vehicle-livy');
  const computerVehicle = document.getElementById('vehicle-computer');

  livyVehicle.textContent     = vehicle.emoji;
  computerVehicle.textContent = vehicle.computerEmoji;
  livyVehicle.style.left      = '4%';
  computerVehicle.style.left  = '4%';
  livyVehicle.classList.remove('racing');
  computerVehicle.classList.remove('racing');

  const track = document.getElementById('race-track');
  track.className = vehicle.track;

  document.getElementById('race-status').textContent = '';
  document.getElementById('race-header').textContent = '🏁 Race Time! 🏁';

  const countdown = document.getElementById('countdown');
  countdown.classList.remove('hidden');
  countdown.textContent = '3';
  state.raceOver = false;

  showScreen('screen-race');

  // Countdown 3 → 2 → 1 → GO!
  playSound('tick');
  setTimeout(() => { countdown.textContent = '2'; playSound('tick'); }, 1000);
  setTimeout(() => { countdown.textContent = '1'; playSound('tick'); }, 2000);
  setTimeout(() => {
    countdown.textContent = 'GO! 🚀';
    playSound('go');
    setTimeout(() => countdown.classList.add('hidden'), 900);
    beginRace();
  }, 3000);
}

function beginRace() {
  // Speed: 3/3 first try = 3.5s, each miss adds ~1s. Computer varies 4.0–7.5s.
  const livyDuration     = 6.5 - state.firstTryScore * 1.0;
  const computerDuration = 4.0 + Math.random() * 3.5;

  const livyVehicle     = document.getElementById('vehicle-livy');
  const computerVehicle = document.getElementById('vehicle-computer');

  livyVehicle.style.setProperty('--duration',     livyDuration + 's');
  computerVehicle.style.setProperty('--duration', computerDuration + 's');

  livyVehicle.classList.add('racing');
  computerVehicle.classList.add('racing');

  const winner  = livyDuration <= computerDuration ? 'livy' : 'computer';
  const winTime = Math.min(livyDuration, computerDuration);

  setTimeout(() => {
    if (!state.raceOver) {
      state.raceOver = true;
      showResult(winner);
    }
  }, winTime * 1000 + 300);
}

// ===== RESULT SCREEN =====
function showResult(winner) {
  const resultAnim    = document.getElementById('result-animation');
  const resultTitle   = document.getElementById('result-title');
  const resultMessage = document.getElementById('result-message');
  const resultScore   = document.getElementById('result-score');

  if (winner === 'livy') {
    resultAnim.textContent    = '🏆';
    resultTitle.textContent   = 'Livy Wins!!! 🎉';
    resultMessage.textContent = pick([
      'Amazing racing! You are a champion!',
      'Incredible! You crushed it!',
      'Woohoo! That was AWESOME!',
    ]);
    playSound('win');
    launchConfetti();
  } else {
    resultAnim.textContent    = '💪';
    resultTitle.textContent   = 'So Close!';
    resultMessage.textContent = pick([
      'Great effort! Try again and go even faster!',
      'You almost had it! Give it another go!',
      'Nice try! Solve more puzzles on first try to win!',
    ]);
    playSound('lose');
  }

  const stars = '⭐'.repeat(state.firstTryScore) + '☆'.repeat(3 - state.firstTryScore);
  resultScore.textContent = `Puzzle stars: ${stars}`;

  showScreen('screen-result');
}

function launchConfetti() {
  const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF6BFF', '#FF9F43', '#A78BFA'];
  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left             = Math.random() * 100 + 'vw';
      piece.style.top              = '-16px';
      piece.style.background       = pick(colors);
      piece.style.animationDuration = (1.8 + Math.random() * 1.8) + 's';
      piece.style.width            = (8 + Math.random() * 8) + 'px';
      piece.style.height           = (8 + Math.random() * 8) + 'px';
      if (Math.random() > 0.5) piece.style.borderRadius = '50%';
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 4500);
    }, i * 55);
  }
}
