import { emptyBoard, getWinner, isFull, computerMove } from './logic.js';

const NS = 'http://www.w3.org/2000/svg';
const SHAPES = {
  1: '<path d="M24 24L76 76M76 24L24 76"/>',
  2: '<circle cx="50" cy="50" r="28"/>',
};
const LABELS = { 1: 'X', 2: 'O' };

/** Desenha o X ou o O (SVG, para as cores serem iguais em todos os aparelhos). */
function token(player) {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('class', `token p${player}`);
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = SHAPES[player];
  return svg;
}

export function mount(root, { sound, celebrate, chooseMode, scoreboard, el }) {
  let alive = true;
  let timer = null;

  async function setup() {
    clearTimeout(timer);
    const choice = await chooseMode(root, {
      title: 'Jogo do Galo',
      hint: 'Ganha quem fizer 3 iguais em linha: deitadas, de pé ou na diagonal.',
    });
    if (alive) play(choice);
  }

  function play({ mode, level }) {
    const vsComputer = mode === 'computador';
    const players = vsComputer
      ? [{ name: 'Tu', token: token(1), cls: 'p1' }, { name: 'Computador', token: token(2), cls: 'p2' }]
      : [{ name: 'Jogador 1', token: token(1), cls: 'p1' }, { name: 'Jogador 2', token: token(2), cls: 'p2' }];
    const scores = [0, 0];
    let starter = 1;
    let board;
    let turn;
    let over;

    const board_el = el('div', { class: 'galo-board', role: 'grid', 'aria-label': 'Tabuleiro do jogo do galo' });
    const cells = Array.from({ length: 9 }, (_, i) =>
      el('button', { class: 'galo-cell', 'aria-label': `Casa ${i + 1}`, onclick: () => humanPlay(i) }));
    board_el.append(...cells);

    const sb = scoreboard(players);
    const message = el('p', { class: 'message', 'aria-live': 'polite' });
    const againBtn = el('button', { class: 'pill-btn primary', onclick: () => { sound.play('tap'); newRound(); } }, '🔄 Outra vez');
    const modeBtn = el('button', { class: 'pill-btn', onclick: () => { sound.play('tap'); setup(); } }, '⚙️ Mudar modo');

    root.replaceChildren(
      el('div', { class: 'play' },
        sb.root, message,
        el('div', { class: 'board-wrap' }, board_el),
        el('div', { class: 'actions' }, againBtn, modeBtn),
      ),
    );

    function isComputerTurn() {
      return vsComputer && turn === 2;
    }

    function render(winLine = []) {
      board.forEach((v, i) => {
        const c = cells[i];
        if ((c.dataset.v || '') !== String(v ?? '')) {
          c.replaceChildren(...(v ? [token(v)] : []));
          c.dataset.v = v ?? '';
        }
        c.classList.toggle('filled', !!v);
        c.classList.toggle('p1', v === 1);
        c.classList.toggle('p2', v === 2);
        c.classList.toggle('win', winLine.includes(i));
        c.disabled = over || !!v || isComputerTurn();
      });
      sb.setScores(scores);
      sb.setTurn(over ? -1 : turn - 1);
    }

    function newRound() {
      clearTimeout(timer);
      board = emptyBoard();
      turn = starter;
      starter = starter === 1 ? 2 : 1;
      over = false;
      board_el.classList.remove('done');
      againBtn.classList.remove('pulse');
      render();
      announceTurn();
      if (isComputerTurn()) scheduleComputer();
    }

    function announceTurn() {
      message.textContent = vsComputer
        ? (turn === 1 ? `É a tua vez! Tu és o ${LABELS[1]}` : 'O computador está a pensar… 🤔')
        : `Vez do ${players[turn - 1].name} (${LABELS[turn]})`;
    }

    function place(i) {
      board[i] = turn;
      sound.play(turn === 1 ? 'p1' : 'p2');
      const win = getWinner(board);
      if (win) {
        over = true;
        scores[win.player - 1]++;
        render(win.line);
        board_el.classList.add('done');
        againBtn.classList.add('pulse');
        if (vsComputer && win.player === 2) {
          message.textContent = 'O computador ganhou! Tenta outra vez 💪';
          sound.play('oops');
        } else {
          message.textContent = vsComputer ? 'Ganhaste! 🎉' : `${players[win.player - 1].name} ganhou! 🎉`;
          sound.play('win');
          celebrate();
        }
        return;
      }
      if (isFull(board)) {
        over = true;
        render();
        board_el.classList.add('done');
        againBtn.classList.add('pulse');
        message.textContent = 'Empate! Ninguém ganhou 🤝';
        sound.play('draw');
        return;
      }
      turn = turn === 1 ? 2 : 1;
      render();
      announceTurn();
      if (isComputerTurn()) scheduleComputer();
    }

    function humanPlay(i) {
      if (over || board[i] || isComputerTurn()) return;
      place(i);
    }

    function scheduleComputer() {
      timer = setTimeout(() => {
        if (!alive || over) return;
        place(computerMove(board, 2, level));
      }, 650);
    }

    newRound();
  }

  setup();
  return () => { alive = false; clearTimeout(timer); };
}
