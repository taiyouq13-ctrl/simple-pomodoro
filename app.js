const FOCUS_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

const QUOTES = [
  // Floyd Mayweather Jr.
  { text: "Hard work beats talent when talent doesn't work hard.", author: "— Floyd Mayweather Jr." },
  { text: "I am a winner. I've always been a winner.", author: "— Floyd Mayweather Jr." },
  { text: "I never lose. I either win or I learn.", author: "— Floyd Mayweather Jr." },
  { text: "Dedication, hard work and fighting spirit. That's what it takes.", author: "— Floyd Mayweather Jr." },
  { text: "The secret to my success: every day I set new standards for myself.", author: "— Floyd Mayweather Jr." },
  // Cristiano Ronaldo
  { text: "Your love for what you do and willingness to push yourself where others aren't prepared to go — that's what makes the difference.", author: "— Cristiano Ronaldo" },
  { text: "Talent without working hard is nothing.", author: "— Cristiano Ronaldo" },
  { text: "I don't need to be liked. I need to be the best.", author: "— Cristiano Ronaldo" },
  { text: "Dreams are not what you see in your sleep. Dreams are things which do not let you sleep.", author: "— Cristiano Ronaldo" },
  // Muhammad Ali
  { text: "Don't quit. Suffer now and live the rest of your life as a champion.", author: "— Muhammad Ali" },
  { text: "It's not bragging if you can back it up.", author: "— Muhammad Ali" },
  { text: "I hated every minute of training, but I said: don't quit. Suffer now and live the rest of your life as a champion.", author: "— Muhammad Ali" },
  // Michael Jordan
  { text: "I've missed more than 9,000 shots. I've lost almost 300 games. 26 times I've been trusted to take the winning shot and missed. I've failed over and over. That's why I succeed.", author: "— Michael Jordan" },
  { text: "Some people want it to happen, some wish it would happen, others make it happen.", author: "— Michael Jordan" },
  // Kobe Bryant
  { text: "The most important thing is to try and inspire people so that they can be great at whatever they want to do.", author: "— Kobe Bryant" },
  { text: "Everything negative — pressure, challenges — is all an opportunity for me to rise.", author: "— Kobe Bryant" },
  { text: "The moment you give up is the moment you let someone else win.", author: "— Kobe Bryant" },
  // Steve Jobs
  { text: "The people who are crazy enough to think they can change the world are the ones who do.", author: "— Steve Jobs" },
  { text: "Stay hungry, stay foolish.", author: "— Steve Jobs" },
  // Elon Musk
  { text: "When something is important enough, you do it even if the odds are not in your favor.", author: "— Elon Musk" },
  { text: "If something's important enough, you should try even if the probable outcome is failure.", author: "— Elon Musk" },
  // Nelson Mandela
  { text: "It always seems impossible until it's done.", author: "— Nelson Mandela" },
  { text: "I never lose. I either win or I learn.", author: "— Nelson Mandela" },
  // Albert Einstein
  { text: "A person who never made a mistake never tried anything new.", author: "— Albert Einstein" },
  { text: "Genius is 1% talent and 99% hard work.", author: "— Albert Einstein" },
  // Winston Churchill
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "— Winston Churchill" },
  { text: "If you're going through hell, keep going.", author: "— Winston Churchill" },
  // Bruce Lee
  { text: "I fear not the man who has practiced 10,000 kicks once, but I fear the man who has practiced one kick 10,000 times.", author: "— Bruce Lee" },
  { text: "Absorb what is useful, discard what is useless, add what is essentially your own.", author: "— Bruce Lee" },
  // Walt Disney
  { text: "All our dreams can come true, if we have the courage to pursue them.", author: "— Walt Disney" },
  // Thomas Edison
  { text: "Genius is one percent inspiration and ninety-nine percent perspiration.", author: "— Thomas Edison" },
  { text: "Our greatest weakness lies in giving up. The most certain way to succeed is always to try just one more time.", author: "— Thomas Edison" },
];

let timeLeft = FOCUS_TIME;
let isRunning = false;
let isFocus = true;
let sessionCount = 0;
let totalFocusSeconds = 0;
let intervalId = null;

const shuffled = [...QUOTES].sort(() => Math.random() - 0.5);
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
  const q = shuffled[idx % shuffled.length];
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
  currentQuoteIdx = (currentQuoteIdx + 1) % shuffled.length;
  const card = document.getElementById('quoteCard');
  card.style.opacity = '0';
  setTimeout(() => {
    setQuote(currentQuoteIdx);
    card.style.opacity = '1';
  }, 400);
}

function switchMode() {
  beep();
  if (isFocus) {
    nextQuote();
    if (Notification.permission === 'granted') {
      new Notification('集中セッション完了！', {
        body: '25分お疲れさん！5分休憩してや。',
        icon: 'https://cdn.jsdelivr.net/npm/twemoji@14.0.2/assets/72x72/1f345.png',
      });
    }
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

if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

startBtn.addEventListener('click', () => isRunning ? pause() : start());
resetBtn.addEventListener('click', reset);
skipBtn.addEventListener('click', skip);

ringFill.style.strokeDasharray = CIRCUMFERENCE;
ringFill.style.strokeDashoffset = 0;
setQuote(currentQuoteIdx);
render();
