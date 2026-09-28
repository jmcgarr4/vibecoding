'use strict';

// ===== VEHICLE DATA =====
const VEHICLES = {
  car: {
    name: 'Race Car',
    emoji: '🏎️', computerEmoji: '🚗',
    parts: ['🛞', '🚘', '⚡'], partNames: ['Wheels', 'Body', 'Engine'],
    track: 'road',
    obstacles: ['🪨', '🚧', '🌵'],
    readyMsg: 'Your Race Car is READY!',
  },
  airplane: {
    name: 'Airplane',
    emoji: '✈️', computerEmoji: '🛸',
    parts: ['🛩️', '✈️', '🚀'], partNames: ['Wings', 'Body', 'Engine'],
    track: 'sky',
    obstacles: ['⛅', '⚡', '🌩️'],
    readyMsg: 'Your Airplane is READY!',
  },
  submarine: {
    name: 'Submarine',
    emoji: '🐬', computerEmoji: '🐋',
    parts: ['🔩', '🛥️', '🌊'], partNames: ['Propeller', 'Hull', 'Fins'],
    track: 'ocean',
    obstacles: ['🪸', '🐙', '🌿'],
    readyMsg: 'Your Submarine is READY!',
  },
};

// ===== PUZZLE POOL (ages 5–7) =====
const PUZZLE_POOL = [
  { id:'col-red',    type:'color', question:'Tap the 🔴 RED one!',
    choices:[{label:'RED',color:'#EF4444',correct:true},{label:'BLUE',color:'#3B82F6',correct:false},{label:'GREEN',color:'#22C55E',correct:false},{label:'YELLOW',color:'#EAB308',correct:false}] },
  { id:'col-blue',   type:'color', question:'Tap the 🔵 BLUE one!',
    choices:[{label:'RED',color:'#EF4444',correct:false},{label:'BLUE',color:'#3B82F6',correct:true},{label:'GREEN',color:'#22C55E',correct:false},{label:'YELLOW',color:'#EAB308',correct:false}] },
  { id:'col-green',  type:'color', question:'Tap the 🟢 GREEN one!',
    choices:[{label:'PINK',color:'#EC4899',correct:false},{label:'ORANGE',color:'#F97316',correct:false},{label:'GREEN',color:'#22C55E',correct:true},{label:'PURPLE',color:'#A855F7',correct:false}] },
  { id:'col-yellow', type:'color', question:'Tap the 🟡 YELLOW one!',
    choices:[{label:'RED',color:'#EF4444',correct:false},{label:'BLUE',color:'#3B82F6',correct:false},{label:'YELLOW',color:'#EAB308',correct:true},{label:'PURPLE',color:'#A855F7',correct:false}] },
  { id:'col-pink',   type:'color', question:'Tap the 🩷 PINK one!',
    choices:[{label:'ORANGE',color:'#F97316',correct:false},{label:'PINK',color:'#EC4899',correct:true},{label:'BLUE',color:'#3B82F6',correct:false},{label:'GREEN',color:'#22C55E',correct:false}] },
  { id:'cnt-6',  type:'count', question:'How many ⭐ do you see?',
    items:Array(6).fill('⭐'),  choices:['5','6','7','8'], correctIndex:1 },
  { id:'cnt-7',  type:'count', question:'How many 🍎 do you see?',
    items:Array(7).fill('🍎'),  choices:['6','7','8','9'], correctIndex:1 },
  { id:'cnt-8',  type:'count', question:'How many 🐶 do you see?',
    items:Array(8).fill('🐶'),  choices:['6','7','8','9'], correctIndex:2 },
  { id:'cnt-9',  type:'count', question:'How many 🌟 do you see?',
    items:Array(9).fill('🌟'),  choices:['7','8','9','10'], correctIndex:2 },
  { id:'cnt-10', type:'count', question:'How many 🦋 do you see?',
    items:Array(10).fill('🦋'), choices:['8','9','10','11'], correctIndex:2 },
  { id:'shp-circle',   type:'shape', question:'Tap the CIRCLE!',   shapes:['circle','square','triangle','star'], correctIndex:0 },
  { id:'shp-square',   type:'shape', question:'Tap the SQUARE!',   shapes:['circle','square','triangle','star'], correctIndex:1 },
  { id:'shp-triangle', type:'shape', question:'Tap the TRIANGLE!', shapes:['circle','square','triangle','star'], correctIndex:2 },
  { id:'shp-star',     type:'shape', question:'Tap the STAR!',     shapes:['circle','square','triangle','star'], correctIndex:3 },
  { id:'m-3+4', type:'math', question:'3 + 4 = ?',  choices:['5','6','7','8'], correctIndex:2 },
  { id:'m-5+3', type:'math', question:'5 + 3 = ?',  choices:['6','7','8','9'], correctIndex:2 },
  { id:'m-4+5', type:'math', question:'4 + 5 = ?',  choices:['7','8','9','10'], correctIndex:2 },
  { id:'m-5+5', type:'math', question:'5 + 5 = ?',  choices:['8','9','10','11'], correctIndex:2 },
  { id:'m-7-3', type:'math', question:'7 − 3 = ?',  choices:['2','3','4','5'], correctIndex:2 },
  { id:'m-8-4', type:'math', question:'8 − 4 = ?',  choices:['3','4','5','6'], correctIndex:1 },
  { id:'m-6-2', type:'math', question:'6 − 2 = ?',  choices:['2','3','4','5'], correctIndex:2 },
  { id:'m-9-5', type:'math', question:'9 − 5 = ?',  choices:['3','4','5','6'], correctIndex:1 },
  { id:'pat-rb', type:'pattern', question:'What comes next? 🔴🔵🔴🔵🔴 ___',
    choices:['🔴','🔵','🟢','🟡'], correctIndex:1 },
  { id:'pat-sm', type:'pattern', question:'What comes next? ⭐🌙⭐🌙⭐ ___',
    choices:['☀️','🌟','🌙','⭐'], correctIndex:2 },
  { id:'pat-cd', type:'pattern', question:'What comes next? 🐱🐶🐱🐶🐱 ___',
    choices:['🐱','🐟','🐶','🐸'], correctIndex:2 },
  { id:'pat-123',type:'pattern', question:'What comes next? 1️⃣ 2️⃣ 3️⃣ 1️⃣ 2️⃣ 3️⃣ 1️⃣ ___',
    choices:['1️⃣','2️⃣','3️⃣','4️⃣'], correctIndex:1 },
  { id:'cmp-1', type:'compare', question:'Which number is BIGGER?',   choices:['3','7'], correctIndex:1 },
  { id:'cmp-2', type:'compare', question:'Which number is SMALLER?',  choices:['5','2'], correctIndex:1 },
  { id:'cmp-3', type:'compare', question:'Which number is BIGGER?',   choices:['9','4'], correctIndex:0 },
  { id:'cmp-4', type:'compare', question:'Which number is SMALLER?',  choices:['8','6'], correctIndex:1 },
  { id:'cmp-5', type:'compare', question:'Which number is BIGGER?',   choices:['6','10'], correctIndex:1 },
  { id:'wrd-cat', type:'word', question:'Find the word:  C A T',  choices:['bat','cat','hat','mat'], correctIndex:1 },
  { id:'wrd-dog', type:'word', question:'Find the word:  D O G',  choices:['bog','fog','dog','log'], correctIndex:2 },
  { id:'wrd-run', type:'word', question:'Find the word:  R U N',  choices:['gun','sun','bun','run'], correctIndex:3 },
  { id:'wrd-big', type:'word', question:'Find the word:  B I G',  choices:['big','bag','bug','bog'], correctIndex:0 },
  { id:'wrd-red', type:'word', question:'Find the word:  R E D',  choices:['bed','fed','red','led'], correctIndex:2 },
];

// ===== SPEED SETTING (0–10) =====
const SPEED_COLORS = [
  '#111111','#4a0a0a','#7f1d1d','#b91c1c','#c2410c',
  '#ea580c','#d97706','#ca8a04','#84cc16','#22c55e','#15803d',
];
const SPEED_NAMES = ['Nothing','1','2','3','4','5','6','7','8','9','BLAST'];
const SCORE_BONUS = [0, 12, 25, 40];

let selectedSpeed = 5;

function buildSpeedPicker() {
  const c = el('speed-btns'); if (!c) return;
  c.innerHTML = '';
  for (let i = 0; i <= 10; i++) {
    const b = document.createElement('button');
    b.className = 'speed-num-btn' + (i === selectedSpeed ? ' active' : '');
    b.textContent = i; b.style.background = SPEED_COLORS[i];
    b.addEventListener('click', () => setSpeed(i));
    c.appendChild(b);
  }
  updateSpeedLabel();
}

function buildRaceSpeedStrip() {
  const c = el('rss-btns'); if (!c) return;
  c.innerHTML = '';
  for (let i = 0; i <= 10; i++) {
    const b = document.createElement('button');
    b.className = 'rss-btn' + (i === selectedSpeed ? ' active' : '');
    b.textContent = i; b.style.background = SPEED_COLORS[i];
    b.addEventListener('click', () => raceSetSpeed(i));
    c.appendChild(b);
  }
  updateRaceSpeedLabel();
}

function raceSetSpeed(s) {
  selectedSpeed = s;
  document.querySelectorAll('.rss-btn').forEach((b, i) => b.classList.toggle('active', i === s));
  updateRaceSpeedLabel();
}

function updateRaceSpeedLabel() {
  const n = el('rss-name'); if (!n) return;
  n.textContent = SPEED_NAMES[selectedSpeed];
  n.style.color = SPEED_COLORS[selectedSpeed] === '#111111' ? '#888' : SPEED_COLORS[selectedSpeed];
  n.style.fontWeight = 'bold';
}

function setSpeed(s) {
  selectedSpeed = s;
  document.querySelectorAll('.speed-num-btn').forEach((b, i) => b.classList.toggle('active', i === s));
  updateSpeedLabel();
}

function updateSpeedLabel() {
  const n = el('speed-name'); if (!n) return;
  n.textContent = SPEED_NAMES[selectedSpeed];
  n.style.color = SPEED_COLORS[selectedSpeed] === '#111111' ? '#888' : SPEED_COLORS[selectedSpeed];
  n.style.fontWeight = 'bold';
}

function getSpeedParams() {
  const s = selectedSpeed;
  if (s === 0) return { obsBase:0, obsRamp:0, freqBase:9999, freqMin:9999, cpuMin:40, cpuMax:55 };
  return {
    obsBase:  80  + s * 32,
    obsRamp:  1.5 + s * 0.7,
    freqBase: 3.5 - s * 0.24,
    freqMin:  Math.max(0.6, 2.2 - s * 0.16),
    cpuMin:   40  + s * 10,
    cpuMax:   60  + s * 12,
  };
}

function livyForwardSpeed() {
  if (selectedSpeed === 0) return 8;
  return 40 + selectedSpeed * 10 + SCORE_BONUS[state.firstTryScore];
}

// ===== GAME STATE =====
let state = {
  vehicle: null, puzzles: [], currentPuzzle: 0,
  partsEarned: 0, firstTryScore: 0, isFirstTry: true,
};

// ===== 2D RACE CONSTANTS =====
const LANE_H    = 190;
const VEH_W     = 40;
const VEH_H     = 40;
const OBS_W     = 44;
const OBS_H     = 48;
const VEH_X     = 52;
const STEER_SPD = 170; // px/s up/down
const RACE_DIST = 4500;
const HIT_PENALTY = 1.6;
const HIT_SPEED   = 20;

// D-pad held state
const held = { up: false, down: false, left: false, right: false };
let speedChangeTimer = 0;

function dpadStart(dir) {
  held[dir] = true;
  if (dir === 'left')  raceSetSpeed(Math.max(0, selectedSpeed - 1));
  if (dir === 'right') raceSetSpeed(Math.min(10, selectedSpeed + 1));
  const btn = el('dpad-' + dir);
  if (btn) btn.classList.add('pressed');
}

function dpadEnd(dir) {
  held[dir] = false;
  speedChangeTimer = 0;
  const btn = el('dpad-' + dir);
  if (btn) btn.classList.remove('pressed');
}

// ===== RACE STATE =====
let R = null;

function makeRaceState() {
  const sp = getSpeedParams();
  return {
    running: false, winner: null,
    livyDist: 0, cpuDist: 0,
    cpuSpeed: sp.cpuMin + Math.random() * (sp.cpuMax - sp.cpuMin),
    vehicleY: Math.floor((LANE_H - VEH_H) / 2),
    hitTimer: 0,
    obstacles: [],
    obsTimer: sp.freqBase,
    obsSpeed: sp.obsBase,
    cpuObsTimer: 2.5 + Math.random() * 1.5,
    cpuHitTimer: 0,
    laneW: 0, lastTime: null, raf: null, raceTime: 0,
  };
}

// ===== AUDIO =====
let audioCtx = null;
function getCtx() {
  if (!audioCtx) try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){}
  return audioCtx;
}
function tone(freq, start, dur, type='sine', vol=0.28) {
  const ctx = getCtx(); if (!ctx) return;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, ctx.currentTime + start);
  g.gain.setValueAtTime(vol, ctx.currentTime + start);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
  o.connect(g); g.connect(ctx.destination);
  o.start(ctx.currentTime + start); o.stop(ctx.currentTime + start + dur + 0.01);
}
function playSound(t) {
  if (t==='correct'){ tone(523,0,.12); tone(659,.10,.12); tone(784,.20,.22); }
  else if(t==='wrong') { tone(280,0,.10,'sawtooth',.2); tone(220,.12,.22,'sawtooth',.2); }
  else if(t==='part')  { tone(523,0,.08); tone(784,.09,.08); tone(1047,.18,.30); }
  else if(t==='go')    { tone(784,0,.12); tone(1047,.14,.28); }
  else if(t==='hit')   { tone(200,0,.08,'sawtooth',.3); tone(150,.08,.15,'sawtooth',.25); }
  else if(t==='win')   { [523,659,784,659,1047].forEach((f,i)=>tone(f,i*.13,.22)); }
  else if(t==='lose')  { tone(400,0,.18,'sawtooth',.2); tone(300,.2,.30,'sawtooth',.2); }
  else if(t==='tick')  { tone(880,0,.07); }
}

// ===== UTILITIES =====
function shuffle(arr) {
  const a=[...arr];
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
function el(id){ return document.getElementById(id); }

// ===== HOME =====
function goHome() {
  if (R && R.raf) cancelAnimationFrame(R.raf);
  R = null;
  Object.keys(held).forEach(k => held[k] = false);
  state = { vehicle:null, puzzles:[], currentPuzzle:0, partsEarned:0, firstTryScore:0, isFirstTry:true };
  showScreen('screen-home');
}

// ===== BUILD PHASE =====
function startGame(vehicleKey) {
  getCtx();
  const v = VEHICLES[vehicleKey];
  state.vehicle = vehicleKey;
  state.puzzles = selectPuzzles();
  state.currentPuzzle = 0; state.partsEarned = 0;
  state.firstTryScore = 0; state.isFirstTry = true;

  el('factory-title').textContent = `🏭 ${v.name} Factory`;
  el('build-progress-text').textContent = `Solve puzzles to build your ${v.name}!`;
  for (let i=0;i<3;i++) {
    const slot = el(`part-slot-${i}`);
    slot.innerHTML = '<span class="part-q">❓</span>';
    slot.classList.remove('earned');
  }
  showScreen('screen-build');
  showPuzzle(0);
}

function selectPuzzles() {
  const byType = {};
  PUZZLE_POOL.forEach(p => { (byType[p.type] = byType[p.type]||[]).push(p); });
  const types = shuffle(Object.keys(byType));
  const picked = [], used = new Set();
  for (const type of types) {
    if (picked.length >= 3) break;
    const pool = byType[type].filter(p=>!used.has(p.id));
    if (pool.length) { const p=pick(pool); picked.push(p); used.add(p.id); }
  }
  while (picked.length<3) {
    const rem = PUZZLE_POOL.filter(p=>!used.has(p.id));
    if (!rem.length) break;
    const p=pick(rem); picked.push(p); used.add(p.id);
  }
  return shuffle(picked);
}

function showPuzzle(idx) {
  const puzzle = state.puzzles[idx];
  const v = VEHICLES[state.vehicle];
  state.isFirstTry = true;
  el('puzzle-number').textContent = `Puzzle ${idx+1} of 3 — Earn the ${v.partNames[idx]}!`;
  el('puzzle-question').textContent = puzzle.question;
  el('puzzle-feedback').className = 'feedback hidden';
  el('puzzle-display').innerHTML = '';
  el('puzzle-choices').innerHTML = '';
  if (puzzle.type==='color')   renderColor(puzzle);
  if (puzzle.type==='count')   renderCount(puzzle);
  if (puzzle.type==='shape')   renderShape(puzzle);
  if (puzzle.type==='math')    renderMath(puzzle);
  if (puzzle.type==='pattern') renderPattern(puzzle);
  if (puzzle.type==='compare') renderCompare(puzzle);
  if (puzzle.type==='word')    renderWord(puzzle);
}

function renderColor(p) {
  shuffle(p.choices).forEach(c => {
    const b = btn(); b.className='choice-btn color-choice';
    b.style.background=c.color; b.style.border='3px solid rgba(255,255,255,0.4)';
    b.textContent=c.label; b.style.fontWeight='bold'; b.style.fontSize='0.95em';
    b.addEventListener('click',()=>answer(c.correct,b));
    el('puzzle-choices').appendChild(b);
  });
}
function renderCount(p) {
  el('puzzle-display').textContent = p.items.join(' ');
  p.choices.forEach((v,i)=>{ const b=btn(); b.className='choice-btn'; b.textContent=v; b.addEventListener('click',()=>answer(i===p.correctIndex,b)); el('puzzle-choices').appendChild(b); });
}
function renderShape(p) {
  p.shapes.forEach((shape,i)=>{
    const b=btn(); b.className='choice-btn';
    if(shape==='star'){ const s=document.createElement('span'); s.className='shape-star'; s.textContent='⭐'; b.appendChild(s); }
    else { const w=document.createElement('div'); w.className='shape-wrap'; const d=document.createElement('div'); d.className=`shape-${shape}`; w.appendChild(d); b.appendChild(w); }
    b.addEventListener('click',()=>answer(i===p.correctIndex,b));
    el('puzzle-choices').appendChild(b);
  });
}
function renderMath(p) {
  p.choices.forEach((v,i)=>{ const b=btn(); b.className='choice-btn'; b.textContent=v; b.addEventListener('click',()=>answer(i===p.correctIndex,b)); el('puzzle-choices').appendChild(b); });
}
function renderPattern(p) {
  p.choices.forEach((v,i)=>{ const b=btn(); b.className='choice-btn'; b.textContent=v; b.addEventListener('click',()=>answer(i===p.correctIndex,b)); el('puzzle-choices').appendChild(b); });
}
function renderCompare(p) {
  el('puzzle-choices').style.gridTemplateColumns='1fr 1fr';
  p.choices.forEach((v,i)=>{ const b=btn(); b.className='choice-btn'; b.textContent=v; b.style.fontSize='2em'; b.addEventListener('click',()=>answer(i===p.correctIndex,b)); el('puzzle-choices').appendChild(b); });
}
function renderWord(p) {
  p.choices.forEach((v,i)=>{ const b=btn(); b.className='choice-btn'; b.textContent=v; b.style.fontSize='1.1em'; b.style.letterSpacing='2px'; b.addEventListener('click',()=>answer(i===p.correctIndex,b)); el('puzzle-choices').appendChild(b); });
}
function btn() { return document.createElement('button'); }

function answer(correct, btnEl) {
  document.querySelectorAll('#puzzle-choices .choice-btn').forEach(b=>b.style.pointerEvents='none');
  const fb = el('puzzle-feedback');
  if (correct) {
    btnEl.classList.add('correct');
    fb.textContent = pick(['Great job! 🌟','You got it! 🎉','Amazing! ⭐','Correct! 🎊','Brilliant! 💫']);
    fb.className = 'feedback success';
    if (state.isFirstTry) state.firstTryScore++;
    playSound('correct');
    setTimeout(()=>awardPart(state.currentPuzzle), 750);
  } else {
    btnEl.classList.add('wrong');
    fb.textContent = pick(['Not quite! Try again 💪','Oops! Give it another try 🤗','Almost! Try once more 💫']);
    fb.className = 'feedback error';
    state.isFirstTry = false;
    playSound('wrong');
    setTimeout(()=>{ btnEl.classList.remove('wrong'); fb.className='feedback hidden'; document.querySelectorAll('#puzzle-choices .choice-btn').forEach(b=>b.style.pointerEvents=''); }, 1100);
  }
}

function awardPart(idx) {
  const v = VEHICLES[state.vehicle];
  const slot = el(`part-slot-${idx}`);
  slot.innerHTML = `<span>${v.parts[idx]}</span>`;
  slot.classList.add('earned');
  playSound('part');
  state.partsEarned++;
  if (state.currentPuzzle<2) {
    state.currentPuzzle++;
    setTimeout(()=>showPuzzle(state.currentPuzzle), 900);
  } else {
    el('build-progress-text').textContent = v.readyMsg + ' 🎉';
    setTimeout(showReadyOverlay, 600);
  }
}

function showReadyOverlay() {
  const v = VEHICLES[state.vehicle];
  const overlay = document.createElement('div');
  overlay.className = 'ready-overlay';
  overlay.innerHTML = `<div class="ready-box"><span class="ready-emoji">${v.emoji}</span><h3>${v.readyMsg}</h3><p>Use the D-pad to steer! ← slower  → faster 🏁</p></div>`;
  document.body.appendChild(overlay);
  setTimeout(()=>{ overlay.remove(); startRace(); }, 2500);
}

// ===== RACE PHASE =====
function startRace() {
  const v = VEHICLES[state.vehicle];
  R = makeRaceState();

  el('livy-runner').textContent = v.emoji;
  el('cpu-runner').textContent  = v.computerEmoji;

  ['road','sky','ocean'].forEach(c=>{ el('game-bg').classList.remove(c); el('cpu-bg').classList.remove(c); });
  el('game-bg').classList.add(v.track);
  el('cpu-bg').classList.add(v.track);

  el('livy-fill').style.width = '0%';
  el('cpu-fill').style.width  = '0%';

  el('livy-runner').style.top = R.vehicleY + 'px';
  el('cpu-runner').style.top  = Math.floor((80 - 24) / 2) + 'px';
  el('cpu-runner').style.bottom = 'auto';

  el('obstacle-layer').innerHTML = '';
  el('cpu-obstacle-layer').innerHTML = '';
  el('hit-flash').classList.add('hidden');

  buildRaceSpeedStrip();

  const cdEl = el('race-countdown'), cdNum = el('countdown-num');
  cdEl.classList.remove('hidden');
  cdNum.textContent = '3';

  showScreen('screen-race');

  requestAnimationFrame(()=>{
    R.laneW = el('game-lane').offsetWidth;
    playSound('tick');
    setTimeout(()=>{ cdNum.textContent='2'; playSound('tick'); }, 1000);
    setTimeout(()=>{ cdNum.textContent='1'; playSound('tick'); }, 2000);
    setTimeout(()=>{
      cdNum.textContent='GO! 🚀';
      playSound('go');
      setTimeout(()=>cdEl.classList.add('hidden'), 800);
      R.running = true; R.lastTime = null;
      R.raf = requestAnimationFrame(gameLoop);
    }, 3000);
  });
}

// ===== GAME LOOP =====
function gameLoop(ts) {
  if (!R || !R.running) return;
  if (R.lastTime === null) { R.lastTime = ts; R.raf = requestAnimationFrame(gameLoop); return; }

  const dt = Math.min((ts - R.lastTime) / 1000, 0.05);
  R.lastTime = ts;
  R.raceTime += dt;

  // --- D-pad steering (up/down) ---
  if (held.up)   R.vehicleY = Math.max(0, R.vehicleY - STEER_SPD * dt);
  if (held.down) R.vehicleY = Math.min(LANE_H - VEH_H, R.vehicleY + STEER_SPD * dt);

  // --- D-pad speed change (held left/right repeat) ---
  if (held.left || held.right) {
    speedChangeTimer -= dt;
    if (speedChangeTimer <= 0) {
      speedChangeTimer = 0.35;
      if (held.left)  raceSetSpeed(Math.max(0, selectedSpeed - 1));
      if (held.right) raceSetSpeed(Math.min(10, selectedSpeed + 1));
    }
  }

  el('livy-runner').style.top = Math.round(R.vehicleY) + 'px';

  // --- Hit timer ---
  if (R.hitTimer > 0) {
    R.hitTimer -= dt;
    if (R.hitTimer <= 0) { R.hitTimer = 0; el('hit-flash').classList.add('hidden'); }
  }

  // --- Difficulty ramp ---
  const sp = getSpeedParams();
  R.obsSpeed = sp.obsBase + Math.min(R.raceTime * sp.obsRamp, sp.obsBase * 0.45);
  const freqNow = Math.max(sp.freqMin, sp.freqBase - R.raceTime * 0.04);

  // --- Spawn obstacles ---
  R.obsTimer -= dt;
  if (R.obsTimer <= 0) {
    spawnObstacle();
    R.obsTimer = freqNow + Math.random() * 0.6;
  }

  // --- Update obstacles ---
  updateObstacles(dt);

  // --- CPU ---
  updateCPU(dt);

  // --- Progress ---
  const livySpd = R.hitTimer > 0 ? HIT_SPEED : livyForwardSpeed();
  R.livyDist += livySpd * dt;
  R.cpuDist  += R.cpuSpeed * dt;

  el('livy-fill').style.width = Math.min(R.livyDist / RACE_DIST * 100, 100) + '%';
  el('cpu-fill').style.width  = Math.min(R.cpuDist  / RACE_DIST * 100, 100) + '%';

  // --- Win check ---
  if (R.livyDist >= RACE_DIST || R.cpuDist >= RACE_DIST) {
    R.running = false;
    const winner = R.livyDist >= R.cpuDist ? 'livy' : 'cpu';
    setTimeout(()=>showResult(winner), 400);
    return;
  }

  R.raf = requestAnimationFrame(gameLoop);
}

function spawnObstacle() {
  const v = VEHICLES[state.vehicle];
  const obsEl = document.createElement('div');
  obsEl.className = 'obstacle';
  obsEl.textContent = pick(v.obstacles);

  // 3 height zones: top / middle / bottom
  const zones = [8, Math.floor((LANE_H - OBS_H) / 2), LANE_H - OBS_H - 8];
  const zoneY = pick(zones) + Math.floor(Math.random() * 12 - 6);
  const topPx = Math.max(0, Math.min(LANE_H - OBS_H, zoneY));

  obsEl.style.top = topPx + 'px';
  el('obstacle-layer').appendChild(obsEl);

  R.obstacles.push({ el: obsEl, x: R.laneW + 10, topPx, passed: false });
}

function updateObstacles(dt) {
  R.obstacles.forEach(obs => {
    obs.x -= R.obsSpeed * dt;
    obs.el.style.left = obs.x + 'px';

    if (!obs.passed && R.hitTimer === 0) {
      // AABB collision
      const vLeft = VEH_X, vRight = VEH_X + VEH_W;
      const vTop = R.vehicleY, vBottom = R.vehicleY + VEH_H;
      const oLeft = obs.x, oRight = obs.x + OBS_W;
      const oTop = obs.topPx, oBottom = obs.topPx + OBS_H;

      if (vLeft < oRight && vRight > oLeft && vTop < oBottom && vBottom > oTop) {
        obs.passed = true;
        R.hitTimer = HIT_PENALTY;
        el('hit-flash').classList.remove('hidden');
        el('livy-runner').style.filter = 'brightness(0.5) saturate(3)';
        setTimeout(()=>el('livy-runner').style.filter = '', 200);
        playSound('hit');
      } else if (oRight < VEH_X) {
        obs.passed = true;
      }
    }

    if (obs.x < -60) obs.el.remove();
  });
  R.obstacles = R.obstacles.filter(o => o.x > -60);
}

function updateCPU(dt) {
  const v = VEHICLES[state.vehicle];
  R.cpuObsTimer -= dt;
  if (R.cpuObsTimer <= 0) {
    if (Math.random() < 0.38) {
      R.cpuHitTimer = 1.4;
      R.cpuSpeed    = HIT_SPEED;
      el('cpu-runner').style.filter = 'brightness(0.4) saturate(3)';
      setTimeout(()=>el('cpu-runner').style.filter='', 250);
      spawnCpuObstacle(v);
    }
    R.cpuObsTimer = 2.0 + Math.random() * 1.5;
  }
  if (R.cpuHitTimer > 0) {
    R.cpuHitTimer -= dt;
    if (R.cpuHitTimer <= 0) {
      R.cpuSpeed    = getSpeedParams().cpuMin + Math.random() * 30;
      R.cpuHitTimer = 0;
    }
  }
}

function spawnCpuObstacle(v) {
  const obsEl = document.createElement('div');
  obsEl.className = 'cpu-obstacle';
  obsEl.textContent = pick(v.obstacles);
  obsEl.style.top  = '10px';
  obsEl.style.left = (el('cpu-lane').offsetWidth - 10) + 'px';
  el('cpu-obstacle-layer').appendChild(obsEl);
  let x = el('cpu-lane').offsetWidth, last = null;
  const speed = 180 + Math.random() * 60;
  function animCpu(ts) {
    if (last===null) last=ts;
    x -= speed * (ts-last)/1000; last=ts;
    obsEl.style.left = x + 'px';
    if (x > -60) requestAnimationFrame(animCpu); else obsEl.remove();
  }
  requestAnimationFrame(animCpu);
}

// ===== KEYBOARD SUPPORT =====
document.addEventListener('keydown', e => {
  if (!R || !R.running) return;
  if (e.code==='ArrowUp')    { e.preventDefault(); if(!held.up)    dpadStart('up');    }
  if (e.code==='ArrowDown')  { e.preventDefault(); if(!held.down)  dpadStart('down');  }
  if (e.code==='ArrowLeft')  { e.preventDefault(); if(!held.left)  dpadStart('left');  }
  if (e.code==='ArrowRight') { e.preventDefault(); if(!held.right) dpadStart('right'); }
});
document.addEventListener('keyup', e => {
  if (e.code==='ArrowUp')    dpadEnd('up');
  if (e.code==='ArrowDown')  dpadEnd('down');
  if (e.code==='ArrowLeft')  dpadEnd('left');
  if (e.code==='ArrowRight') dpadEnd('right');
});

document.addEventListener('DOMContentLoaded', buildSpeedPicker);

// ===== RESULT =====
function showResult(winner) {
  if (R && R.raf) { cancelAnimationFrame(R.raf); R.running = false; }
  Object.keys(held).forEach(k => held[k] = false);

  const anim=el('result-animation'), title=el('result-title'), msg=el('result-message'), score=el('result-score');
  if (winner === 'livy') {
    anim.textContent  = '🏆';
    title.textContent = 'Livy Wins!!! 🎉';
    msg.textContent   = pick(['Amazing steering! You are a champion!','Incredible! You crushed it!','Woohoo! That was AWESOME!']);
    playSound('win');
    launchConfetti();
  } else {
    anim.textContent  = '💪';
    title.textContent = 'So Close!';
    msg.textContent   = pick(['Great effort! Try again and steer faster!','You almost had it! Give it another go!','Dodge those obstacles — you can do it!']);
    playSound('lose');
  }
  const stars = '⭐'.repeat(state.firstTryScore) + '☆'.repeat(3 - state.firstTryScore);
  score.textContent = `Puzzle stars: ${stars}`;
  showScreen('screen-result');
}

function launchConfetti() {
  const colors = ['#FF6B6B','#FFD93D','#6BCB77','#4D96FF','#FF6BFF','#FF9F43','#A78BFA'];
  for (let i=0;i<55;i++) {
    setTimeout(()=>{
      const p=document.createElement('div');
      p.className='confetti-piece';
      p.style.left=Math.random()*100+'vw'; p.style.top='-16px';
      p.style.background=pick(colors);
      p.style.animationDuration=(1.8+Math.random()*1.8)+'s';
      p.style.width=(8+Math.random()*8)+'px'; p.style.height=(8+Math.random()*8)+'px';
      if(Math.random()>.5) p.style.borderRadius='50%';
      document.body.appendChild(p);
      setTimeout(()=>p.remove(),4500);
    }, i*55);
  }
}
