import { emptyBoard, winningLine, isFull, computerMove } from './logic.js';

const SIZE = 10;
const TOKENS = { 1: '🔴', 2: '🟡' };

export function mount(root, { sound, celebrate, chooseMode, scoreboard, el }) {
  let alive = true;
  let timer = null;

  async function setup() {
    clearTimeout(timer);
    const choice = await chooseMode(root, {
      title: '🔴 5 em Linha 🟡',
      hint: 'Toca numa casa para pôr a tua peça. Ganha quem juntar 5 seguidas!',
    });
    if (alive) play(choice);
  }

  function play({ mode, level }) {
    const vsComputer = mode === 'computador';
    const players = vsComputer
      ? [{ name: 'Tu', token: TOKENS[1], cls: 'p1' }, { name: 'Computador', token: TOKENS[2], cls: 'p2' }]
      : [{ name: 'Jogador 1', token: TOKENS[1], cls: 'p1' }, { name: 'Jogador 2', token: TOKENS[2], cls: 'p2' }];
    const scores = [0, 0];
    let starter = 1;
    let board;
    let turn;
    let over;
    let last = -1;

    const boardEl = el('div', {
      class: 'cinco-board',
      style: `--size:${SIZE}`,
      role: 'grid',
      'aria-label': 'Tabuleiro do 5 em linha',
    });
    const cells = Array.from({ length: SIZE * SIZE }, (_, i) =>
      el('button', {
        class: 'cinco-cell',
        'aria-label': `Linha ${Math.floor(i / SIZE) + 1}, coluna ${(i % SIZE) + 1}`,
        onclick: () => humanPlay(i),
      }, el('span', { class: 'stone' })));
    boardEl.append(...cells);

    const sb = scoreboard(players);
    const message = el('p', { class: 'message', 'aria-live': 'polite' });
    const againBtn = el('button', { class: 'pill-btn primary', onclick: () => { sound.play('tap'); newRound(); } }, '🔄 Outra vez');
    const modeBtn = el('button', { class: 'pill-btn', onclick: () => { sound.play('tap'); setup(); } }, '⚙️ Mudar modo');

    root.replaceChildren(
      el('div', { class: 'play' },
        sb.root, message,
        el('div', { class: 'board-wrap' }, boardEl),
        el('div', { class: 'actions' }, againBtn, modeBtn),
      ),
    );

    const isComputerTurn = () => vsComputer && turn === 2;

    function render(winLine = []) {
      board.forEach((v, i) => {
        const c = cells[i];
        c.classList.toggle('p1', v === 1);
        c.classList.toggle('p2', v === 2);
        c.classList.toggle('last', i === last && !over);
        c.classList.toggle('win', winLine.includes(i));
        c.disabled = over || v !== null || isComputerTurn();
      });
      sb.setScores(scores);
      sb.setTurn(over ? -1 : turn - 1);
    }

    function announceTurn() {
      const p = players[turn - 1];
      message.textContent = vsComputer
        ? (turn === 1 ? `É a tua vez! Tu és ${p.token}` : 'O computador está a pensar… 🤔')
        : `Vez do ${p.name} ${p.token}`;
    }

    function finish(text, snd, party) {
      over = true;
      boardEl.classList.add('done');
      againBtn.classList.add('pulse');
      message.textContent = text;
      sound.play(snd);
      if (party) celebrate();
    }

    function newRound() {
      clearTimeout(timer);
      board = emptyBoard(SIZE);
      turn = starter;
      starter = starter === 1 ? 2 : 1;
      over = false;
      last = -1;
      boardEl.classList.remove('done');
      againBtn.classList.remove('pulse');
      render();
      announceTurn();
      if (isComputerTurn()) scheduleComputer();
    }

    function place(i) {
      board[i] = turn;
      last = i;
      sound.play(turn === 1 ? 'p1' : 'p2');
      const line = winningLine(board, SIZE, i);
      if (line) {
        const winner = turn;
        scores[winner - 1]++;
        over = true;
        render(line);
        if (vsComputer && winner === 2) finish('O computador ganhou! Tenta outra vez 💪', 'oops', false);
        else finish(vsComputer ? 'Ganhaste! 🎉' : `${players[winner - 1].name} ganhou! 🎉`, 'win', true);
        return;
      }
      if (isFull(board)) {
        over = true;
        render();
        finish('Empate! O tabuleiro encheu 🤝', 'draw', false);
        return;
      }
      turn = turn === 1 ? 2 : 1;
      render();
      announceTurn();
      if (isComputerTurn()) scheduleComputer();
    }

    function humanPlay(i) {
      if (over || board[i] !== null || isComputerTurn()) return;
      place(i);
    }

    function scheduleComputer() {
      timer = setTimeout(() => {
        if (!alive || over) return;
        place(computerMove(board, SIZE, 2, level));
      }, 600);
    }

    newRound();
  }

  setup();
  return () => { alive = false; clearTimeout(timer); };
}
