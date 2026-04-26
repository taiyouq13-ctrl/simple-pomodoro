const FOCUS_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

const QUOTES = [
  { text: "Hard work beats talent when talent doesn't work hard.", author: "— Tim Notke (Floyd Mayweather's motto)" },
  { text: "I am a winner. I've always been a winner.", author: "— Floyd Mayweather Jr." },
  { text: "I never lose. I either win or I learn.", author: "— Floyd Mayweather Jr." },
  { text: "Dedication, hard work and fighting spirit. That's what it takes.", author: "— Floyd Mayweather Jr." },
  { text: "Your love for what you do and willingness to push yourself where others aren't prepared to go — that's what makes the difference.", author: "— Cristiano Ronaldo" },
  { text: "Talent without working hard is nothing.", author: "— Cristiano Ronaldo" },
  { text: "I don't need to be liked. I need to be the best.", author: "— Cristiano Ronaldo" },
  { text: "Dreams are not what you see in your sleep. Dreams are things which do not let you sleep.", author: "— Cristiano Ronaldo" },
  { text: "The secret to my success: every day I set new standards for myself.", author: "— Floyd Mayweather Jr." },
  { text: "It's not about the size of the dog in the fight. It's about the size of the fight in the dog.", author: "— Floyd Mayweather Jr." },
];

let timeLeft = FOCUS_TIME;
let isRunning = false;
let isFocus = true;
let sessionCount = 0;
let totalFocusSeconds = 0;
let intervalId = null;
let currentQuoteIdx = 0;

const timerEl = document.getElementById('timer');
const modeLabelEl = document.querySelector('.mode-text');
const startBtn = document.getElementById('startBtn');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const resetBtn = document.getElementById('resetBtn');
const skipBtn = document.getElementById('skipBtn');
const sessionCountEl = document.getElementById('sessionCount');
const focusTimeEl = document.getElementById('focusTime');
const quoteTextEl = document.getElementById('quoteText');
const quoteAuthorEl = document.getElementById('quoteAuthor');
const ringFill = document.getElementById('ringFill');

const CIRCUMFERENCE = 2 * Math.PI * 126;

function format(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function setQuote(idx) {
  const q = QUOTES[idx % QUOTES.length];
  quoteTextEl.textContent = `"${q.text}"`;
  quoteAuthorEl.textContent = q.author;
}

function updateRing() {
  const total = isFocus ? FOCUS_TIME : BREAK_TIME;
  const progress = timeLeft / total;
  ringFill.style.strokeDashoffset = CIRCUMFERENCE * (1 - progress);
}

function render() {
  timerEl.textContent = format(timeLeft);
  modeLabelEl.textContent = isFocus ? '集中' : '休憩';
  document.body.classList.toggle('break', !isFocus);
  playIcon.style.display = isRunning ? 'none' : 'block';
  pauseIcon.style.display = isRunning ? 'block' : 'none';
  sessionCountEl.textContent = sessionCount;
  focusTimeEl.textContent = Math.floor(totalFocusSeconds / 60);
  document.title = `${format(timeLeft)} — ${isFocus ? '集中' : '休憩'}`;
  updateRing();
}

function beep() {
  try {
    const ctx = new AudioContext();
    const freqs = [880, 1100, 880, 1100];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.35, ctx.currentTime + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.2 + 0.18);
      osc.start(ctx.currentTime + i * 0.2);
      osc.stop(ctx.currentTime + i * 0.2 + 0.18);
    });
  } catch (_) {}
}

function nextQuote() {
  currentQuoteIdx = (currentQuoteIdx + 1) % QUOTES.length;
  const card = document.getElementById('quoteCard');
  card.style.opacity = '0';
  setTimeout(() => {
    setQuote(currentQuoteIdx);
    card.style.opacity = '1';
  }, 400);
}

function switchMode() {
  beep();
  nextQuote();
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
  if (isFocus) totalFocusSeconds++;
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
  totalFocusSeconds = 0;
  render();
}

function skip() {
  clearInterval(intervalId);
  isRunning = false;
  switchMode();
}

startBtn.addEventListener('click', () => isRunning ? pause() : start());
resetBtn.addEventListener('click', reset);
skipBtn.addEventListener('click', skip);

ringFill.style.strokeDasharray = CIRCUMFERENCE;
ringFill.style.strokeDashoffset = 0;
setQuote(currentQuoteIdx);
render();
