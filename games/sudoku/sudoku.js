import { gerarPuzzle, conflito, caixa, TEMAS, NIVEL_MAX } from './logic.js';

// Quantos puzzles certos para subir de nível.
const PARA_SUBIR = 2;
const ONDE = { linha: 'nesta linha', coluna: 'nesta coluna', quadrado: 'neste quadrado' };

export function mount(root, { sound, celebrate, el }) {
  let nivel = 1;
  let feitos = 0;
  let estrelas = 0;
  let tema = TEMAS[0];
  let puzzle = null;
  let grelha = null;
  let sel = null; // { r, c } do quadrado escolhido
  let timers = [];
  let cells = [];

  const contador = el('span', { class: 'stars-box' });
  const nivelEl = el('span', { class: 'stars-box level-box' });
  const mensagem = el('p', { class: 'message' });
  const tabuleiro = el('div', { class: 'sudoku-board' });
  const paleta = el('div', { class: 'sudoku-palette' });
  const ouvirBtn = el('button', { class: 'pill-btn', onclick: () => explicar() }, '🔊 Ouvir');
  const outroBtn = el('button', { class: 'pill-btn', onclick: () => { sound.play('tap'); novo(); } }, '⏭️ Outro');

  root.replaceChildren(
    el('div', { class: 'play sudoku' },
      el('div', { class: 'scoreboard' }, contador, nivelEl),
      mensagem,
      el('div', { class: 'board-wrap' }, tabuleiro),
      paleta,
      el('div', { class: 'actions' }, ouvirBtn, outroBtn),
    ),
  );

  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  function explicar() {
    const extra = puzzle.tamanho === 4 ? ', e em cada quadrado grande' : '';
    sound.speak(`Põe as figuras nos quadrados vazios. Em cada linha e em cada coluna${extra}, cada figura só pode aparecer uma vez.`);
  }

  function atualizarTopo() {
    contador.textContent = `⭐ ${estrelas}`;
    nivelEl.textContent = `Nível ${nivel}`;
  }

  function dizer(texto, cls = '') {
    mensagem.textContent = texto;
    mensagem.className = `message ${cls}`.trim();
  }

  function celula(r, c) {
    return cells[r * puzzle.tamanho + c];
  }

  function primeiroVazio(depois = null) {
    const n = puzzle.tamanho;
    const inicio = depois ? depois.r * n + depois.c + 1 : 0;
    for (let k = 0; k < n * n; k++) {
      const p = (inicio + k) % (n * n);
      const r = Math.floor(p / n);
      const c = p % n;
      if (grelha[r][c] === null) return { r, c };
    }
    return null;
  }

  function escolherCelula(pos) {
    sel = pos;
    const n = puzzle.tamanho;
    cells.forEach((cel, i) => {
      const r = Math.floor(i / n);
      const c = i % n;
      cel.classList.toggle('selected', !!pos && r === pos.r && c === pos.c);
      cel.classList.toggle('same-line', !!pos && (r === pos.r || c === pos.c) && !(r === pos.r && c === pos.c));
    });
  }

  function novo() {
    timers.forEach(clearTimeout);
    timers = [];
    puzzle = gerarPuzzle(nivel);
    grelha = puzzle.grelha.map((l) => l.slice());
    tema = TEMAS[Math.floor(Math.random() * TEMAS.length)];
    const n = puzzle.tamanho;
    const b = caixa(n);

    tabuleiro.style.setProperty('--n', n);
    cells = grelha.flatMap((linha, r) => linha.map((v, c) => el('button', {
      class: `sudoku-cell ${v === null ? 'empty' : 'given'}`,
      'aria-label': v === null ? `Quadrado vazio, linha ${r + 1}, coluna ${c + 1}` : tema[v],
      onclick: () => {
        if (grelha[r][c] !== null) return;
        sound.play('tap');
        escolherCelula({ r, c });
      },
    }, v === null ? '' : tema[v])));
    // No 4x4 as figuras ficam agrupadas em 4 quadrados grandes de 2x2.
    tabuleiro.classList.toggle('boxes', b > 0);
    if (b) {
      const grupos = Array.from({ length: n }, () => el('div', { class: 'sudoku-box' }));
      cells.forEach((cel, i) => {
        const r = Math.floor(i / n);
        const c = i % n;
        grupos[Math.floor(r / b) * (n / b) + Math.floor(c / b)].append(cel);
      });
      tabuleiro.replaceChildren(...grupos);
    } else {
      tabuleiro.replaceChildren(...cells);
    }

    paleta.replaceChildren(...tema.slice(0, n).map((fig, v) => el('button', {
      class: 'sudoku-pick',
      'aria-label': `Pôr ${fig}`,
      onclick: (e) => porFigura(v, e.currentTarget),
    }, fig)));

    escolherCelula(primeiroVazio());
    dizer('Que figura falta? Toca num quadrado vazio e depois numa figura.');
    atualizarTopo();
    explicar();
  }

  function abanar(node) {
    node.classList.remove('shake');
    void node.offsetWidth; // reinicia a animação
    node.classList.add('shake');
  }

  function porFigura(v, botao) {
    if (!sel) {
      dizer('Primeiro toca num quadrado vazio 👆');
      return;
    }
    const { r, c } = sel;
    const cel = celula(r, c);
    if (v === puzzle.solucao[r][c]) {
      grelha[r][c] = v;
      cel.textContent = tema[v];
      cel.classList.remove('empty');
      cel.classList.add('placed');
      cel.setAttribute('aria-label', tema[v]);
      sound.play('p1');
      if (!primeiroVazio()) return ganhou();
      dizer('Boa! ⭐', 'good');
      escolherCelula(primeiroVazio({ r, c }));
      return;
    }
    sound.play('oops');
    abanar(cel);
    abanar(botao);
    const choque = conflito(grelha, r, c, v);
    if (choque) {
      const outra = celula(choque.r, choque.c);
      outra.classList.add('clash');
      later(() => outra.classList.remove('clash'), 1200);
      dizer(`Já há um ${tema[v]} ${ONDE[choque.onde]}!`);
      sound.speak(`Já há um igual ${ONDE[choque.onde]}.`);
    } else {
      dizer('Ainda não. Olha para os outros quadrados 👀');
      sound.speak('Ainda não. Pensa outra vez.');
    }
  }

  function ganhou() {
    escolherCelula(null);
    estrelas++;
    feitos++;
    let subiu = false;
    if (feitos >= PARA_SUBIR && nivel < NIVEL_MAX) {
      nivel++;
      feitos = 0;
      subiu = true;
    }
    atualizarTopo();
    tabuleiro.classList.add('solved');
    later(() => tabuleiro.classList.remove('solved'), 1500);
    const texto = subiu ? `Conseguiste! Subiste para o nível ${nivel} 🚀` : 'Conseguiste! 🎉';
    dizer(texto, 'good');
    sound.play('win');
    sound.speak(subiu ? `Conseguiste! Agora é o nível ${nivel}.` : 'Conseguiste! Muito bem!');
    celebrate();
    later(novo, subiu ? 3000 : 2400);
  }

  novo();
  return () => {
    timers.forEach(clearTimeout);
    sound.stopSpeaking();
  };
}
