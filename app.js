const FOCUS_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

let timeLeft = FOCUS_TIME;
let isRunning = false;
let isFocus = true;
let sessionCount = 0;
let intervalId = null;

const timerEl = document.getElementById('timer');
const modeLabelEl = document.getElementById('modeLabel');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const sessionCountEl = document.getElementById('sessionCount');

function format(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function render() {
  timerEl.textContent = format(timeLeft);
  modeLabelEl.textContent = isFocus ? '集中' : '休憩';
  document.body.classList.toggle('break', !isFocus);
  startBtn.textContent = isRunning ? 'ポーズ' : 'スタート';
  sessionCountEl.textContent = sessionCount;
  document.title = `${format(timeLeft)} — ${isFocus ? '集中' : '休憩'}`;
}

function beep() {
  try {
    const ctx = new AudioContext();
    const freqs = [880, 660, 880];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.4, ctx.currentTime + i * 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.25 + 0.2);
      osc.start(ctx.currentTime + i * 0.25);
      osc.stop(ctx.currentTime + i * 0.25 + 0.2);
    });
  } catch (_) {}
}

function switchMode() {
  beep();
  if (isFocus) {
    sessionCount++;
    isFocus = false;
    timeLeft = BREAK_TIME;
  } else {
    isFocus = true;
    timeLeft = FOCUS_TIME;
  }
  render();
}

function tick() {
  if (timeLeft <= 0) {
    clearInterval(intervalId);
    isRunning = false;
    switchMode();
    start();
    return;
  }
  timeLeft--;
  render();
}

function start() {
  isRunning = true;
  intervalId = setInterval(tick, 1000);
  render();
}

function pause() {
  isRunning = false;
  clearInterval(intervalId);
  render();
}

function reset() {
  clearInterval(intervalId);
  isRunning = false;
  isFocus = true;
  timeLeft = FOCUS_TIME;
  sessionCount = 0;
  render();
}

startBtn.addEventListener('click', () => {
  isRunning ? pause() : start();
});

resetBtn.addEventListener('click', reset);

render();
