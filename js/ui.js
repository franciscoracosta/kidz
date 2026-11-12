// Peças partilhadas por todos os jogos: sons, festa de vitória,
// escolha do modo de jogo e o placar.

const SOUND_KEY = 'kidz:som';

function readSoundPref() {
  try { return localStorage.getItem(SOUND_KEY) !== 'off'; } catch { return true; }
}

let audioCtx = null;
let soundOn = readSoundPref();

export const sound = {
  get on() { return soundOn; },
  toggle() {
    soundOn = !soundOn;
    try { localStorage.setItem(SOUND_KEY, soundOn ? 'on' : 'off'); } catch { /* sem armazenamento */ }
    return soundOn;
  },
  /** Diz um texto em voz alta (voz do aparelho em pt-PT). Devolve false se não houver voz. */
  speak(text, { rate = 0.9, pitch = 1.1 } = {}) {
    if (!soundOn || !('speechSynthesis' in window)) return false;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'pt-PT';
      u.rate = rate;
      u.pitch = pitch;
      speechSynthesis.speak(u);
      return true;
    } catch {
      return false;
    }
  },
  stopSpeaking() {
    try { speechSynthesis.cancel(); } catch { /* sem voz */ }
  },
  /** Toca um som curto: 'tap', 'p1', 'p2', 'win', 'draw', 'oops'. */
  play(name) {
    if (!soundOn) return;
    try {
      audioCtx ??= new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
    } catch { return; }
    const notes = {
      tap: [[660, 0.06]],
      p1: [[523, 0.09]],
      p2: [[392, 0.09]],
      win: [[523, 0.12], [659, 0.12], [784, 0.12], [1047, 0.3]],
      draw: [[440, 0.15], [440, 0.15]],
      oops: [[220, 0.15]],
    }[name] || [[600, 0.08]];
    let t = audioCtx.currentTime;
    for (const [freq, dur] of notes) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);
      t += dur * 0.9;
    }
  },
};

/** Chuva de confetis para celebrar uma vitória. */
export function celebrate() {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const layer = document.createElement('div');
  layer.className = 'confetti';
  const colors = ['#ff5d73', '#ffb03a', '#ffe14d', '#4cd97b', '#3fa9f5', '#a77bf3'];
  for (let i = 0; i < 80; i++) {
    const p = document.createElement('i');
    p.style.left = `${Math.random() * 100}%`;
    p.style.background = colors[i % colors.length];
    p.style.animationDelay = `${Math.random() * 0.6}s`;
    p.style.animationDuration = `${1.6 + Math.random() * 1.4}s`;
    p.style.setProperty('--drift', `${(Math.random() - 0.5) * 200}px`);
    p.style.setProperty('--spin', `${Math.random() * 720 - 360}deg`);
    layer.appendChild(p);
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 3500);
}

export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) node.setAttribute(k, v === true ? '' : v);
  }
  for (const child of children.flat()) {
    if (child != null) node.append(child);
  }
  return node;
}

/**
 * Ecrã para escolher "2 jogadores" ou "contra o computador".
 * Resolve com { mode: 'dois' | 'computador', level?: 'facil' | 'dificil' }.
 */
export function chooseMode(container, { title, hint }) {
  return new Promise((resolve) => {
    const pick = (choice) => { sound.play('tap'); resolve(choice); };
    const levels = el('div', { class: 'choice-row', hidden: true },
      el('button', { class: 'big-btn level easy', onclick: () => pick({ mode: 'computador', level: 'facil' }) },
        el('span', { class: 'big-emoji' }, '🐣'), 'Fácil'),
      el('button', { class: 'big-btn level hard', onclick: () => pick({ mode: 'computador', level: 'dificil' }) },
        el('span', { class: 'big-emoji' }, '🦁'), 'Difícil'),
    );
    const modes = el('div', { class: 'choice-row' },
      el('button', { class: 'big-btn', onclick: () => pick({ mode: 'dois' }) },
        el('span', { class: 'big-emoji' }, '👫'), '2 jogadores'),
      el('button', {
        class: 'big-btn',
        onclick: () => {
          sound.play('tap');
          modes.hidden = true;
          levels.hidden = false;
          question.textContent = 'Escolhe o nível';
        },
      }, el('span', { class: 'big-emoji' }, '🤖'), 'Contra o computador'),
    );
    const question = el('h2', { class: 'setup-question' }, 'Como queres jogar?');
    container.replaceChildren(
      el('div', { class: 'setup' },
        el('h1', { class: 'setup-title' }, title),
        hint ? el('p', { class: 'setup-hint' }, hint) : null,
        question, modes, levels,
      ),
    );
  });
}

/**
 * Placar com os dois jogadores. `players` = [{ name, token, cls }, ...].
 * Devolve funções para mostrar de quem é a vez e atualizar pontos.
 */
export function scoreboard(players) {
  const cards = players.map((p) =>
    el('div', { class: `player ${p.cls}` },
      el('span', { class: 'player-token' }, p.token),
      el('span', { class: 'player-name' }, p.name),
      el('span', { class: 'player-score' }, '0'),
    ));
  const root = el('div', { class: 'scoreboard' }, cards[0], el('span', { class: 'vs' }, 'vs'), cards[1]);
  return {
    root,
    setTurn(index) {
      cards.forEach((c, i) => c.classList.toggle('active', i === index));
    },
    setScores(scores) {
      cards.forEach((c, i) => { c.querySelector('.player-score').textContent = String(scores[i]); });
    },
  };
}
