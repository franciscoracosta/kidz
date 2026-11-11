import { GAMES, findGame } from './games.js';
import { sound, celebrate, chooseMode, scoreboard, el } from './ui.js';

const app = document.getElementById('app');
const soundBtn = document.getElementById('sound-btn');
const homeBtn = document.getElementById('home-btn');
const titleEl = document.getElementById('title');

let cleanup = null;

function renderSoundBtn() {
  soundBtn.textContent = sound.on ? '🔊' : '🔇';
  soundBtn.setAttribute('aria-label', sound.on ? 'Desligar o som' : 'Ligar o som');
}

soundBtn.addEventListener('click', () => {
  sound.toggle();
  renderSoundBtn();
  sound.play('tap');
});
homeBtn.addEventListener('click', () => {
  sound.play('tap');
  location.hash = '';
});

function renderHome() {
  document.title = 'Jogos';
  titleEl.textContent = '🎈 Jogos';
  homeBtn.hidden = true;
  const cards = GAMES.map((game) =>
    el('a', { class: 'game-card', href: `#/${game.id}`, style: `--card:${game.color}`, onclick: () => sound.play('tap') },
      el('span', { class: 'game-emoji', 'aria-hidden': 'true' }, game.emoji),
      el('span', { class: 'game-title' }, game.title),
      el('span', { class: 'game-desc' }, game.description),
      el('span', { class: 'game-tag' }, game.tag),
    ));
  app.replaceChildren(
    el('section', { class: 'home' },
      el('h1', { class: 'home-title' }, 'A que vamos jogar?'),
      el('div', { class: 'game-grid' }, cards),
    ),
  );
}

async function renderGame(game) {
  document.title = game.title;
  titleEl.textContent = game.title;
  homeBtn.hidden = false;
  app.replaceChildren(el('div', { class: 'loading' }, 'A carregar…'));
  const mod = await game.load();
  if (location.hash.slice(2) !== game.id) return; // a criança já saiu
  const root = el('section', { class: 'game', 'data-game': game.id });
  app.replaceChildren(root);
  cleanup = mod.mount(root, { sound, celebrate, chooseMode, scoreboard, el, game }) || null;
}

function route() {
  if (cleanup) { cleanup(); cleanup = null; }
  const id = location.hash.replace(/^#\/?/, '');
  const game = id ? findGame(id) : null;
  if (game) renderGame(game);
  else renderHome();
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', route);
renderSoundBtn();
route();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => { /* offline não é essencial */ });
  });
}
