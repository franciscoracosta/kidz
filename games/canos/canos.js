import { gerarPuzzle, molhados, resolvido, rodar, dica, DIRECOES, CIMA, DIREITA, BAIXO, NIVEL_MAX } from './logic.js';

// Quantos puzzles certos para subir de nível.
const PARA_SUBIR = 2;
const NS = 'http://www.w3.org/2000/svg';
// Ponta de cada saída do cano, num quadrado de 100x100.
const PONTA = { [CIMA]: [50, 0], [DIREITA]: [100, 50], [BAIXO]: [50, 100], 8: [0, 50] };

function svg(tag, attrs) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

/** Desenho de um cano (o desenho roda inteiro quando se toca). */
function desenharCano(cano) {
  const s = svg('svg', { viewBox: '0 0 100 100', class: 'pipe-svg', 'aria-hidden': 'true' });
  for (const camada of ['pipe-out', 'pipe-in']) {
    const g = svg('g', { class: camada });
    for (const d of DIRECOES) {
      if (!(cano & d)) continue;
      const [x, y] = PONTA[d];
      g.append(svg('line', { x1: 50, y1: 50, x2: x, y2: y }));
    }
    g.append(svg('circle', { cx: 50, cy: 50, r: camada === 'pipe-out' ? 15 : 9 }));
    s.append(g);
  }
  return s;
}

export function mount(root, { sound, celebrate, el }) {
  let nivel = 1;
  let feitos = 0;
  let estrelas = 0;
  let puzzle = null;
  let grelha = null;
  let voltas = null; // quantas vezes cada cano já rodou (para a animação)
  let presos = null; // canos acertados pela ajuda
  let tiles = [];
  let acabou = false;
  let timers = [];

  const contador = el('span', { class: 'stars-box' });
  const nivelBtn = el('button', { class: 'stars-box level-box', onclick: () => trocarNivel() });
  const mensagem = el('p', { class: 'message' });
  const tabuleiro = el('div', { class: 'pipes-board' });
  const ouvirBtn = el('button', { class: 'pill-btn', onclick: () => explicar() }, '🔊 Ouvir');
  const ajudaBtn = el('button', { class: 'pill-btn', onclick: () => ajudar() }, '💡 Ajuda');
  const outroBtn = el('button', { class: 'pill-btn', onclick: () => { sound.play('tap'); novo(); } }, '⏭️ Outro');

  root.replaceChildren(
    el('div', { class: 'play canos' },
      el('div', { class: 'scoreboard' }, contador, nivelBtn),
      mensagem,
      el('div', { class: 'board-wrap' }, tabuleiro),
      el('div', { class: 'actions' }, ouvirBtn, ajudaBtn, outroBtn),
    ),
  );

  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  function explicar() {
    const muitas = puzzle.flores.length > 1;
    sound.speak(muitas
      ? `Toca nos canos para os rodar. Leva a água da torneira até às ${puzzle.flores.length} flores!`
      : 'Toca nos canos para os rodar. Leva a água da torneira até à flor!');
  }

  function atualizarTopo() {
    contador.textContent = `⭐ ${estrelas}`;
    nivelBtn.textContent = `Nível ${nivel}`;
  }

  function dizer(texto, cls = '') {
    mensagem.textContent = texto;
    mensagem.className = `message ${cls}`.trim();
  }

  function tile(r, c) {
    return tiles[r * puzzle.tamanho + c];
  }

  function trocarNivel() {
    sound.play('tap');
    nivel = nivel % NIVEL_MAX + 1;
    feitos = 0;
    novo();
  }

  function novo() {
    timers.forEach(clearTimeout);
    timers = [];
    acabou = false;
    puzzle = gerarPuzzle(nivel);
    const n = puzzle.tamanho;
    grelha = puzzle.inicio.map((l) => l.slice());
    voltas = grelha.map((l) => l.map(() => 0));
    presos = grelha.map((l) => l.map(() => false));

    tabuleiro.style.setProperty('--n', n);
    tabuleiro.classList.remove('solved');
    tiles = grelha.flatMap((linha, r) => linha.map((cano, c) => {
      const tipo = puzzle.tipo[r][c];
      const t = el('button', {
        class: `pipe-tile ${tipo}`,
        'aria-label': { fonte: 'Torneira', flor: 'Flor', cano: 'Cano', vazio: 'Vazio' }[tipo],
        onclick: () => tocar(r, c),
      });
      if (tipo === 'vazio') {
        t.disabled = true;
        return t;
      }
      t.append(desenharCano(cano));
      if (tipo === 'fonte') t.append(el('span', { class: 'pipe-icon' }, '🚰'));
      if (tipo === 'flor') t.append(el('span', { class: 'pipe-icon' }, '🌱'));
      return t;
    }));
    tabuleiro.replaceChildren(...tiles);
    regar();

    const nf = puzzle.flores.length;
    dizer(nf > 1 ? `Leva a água 💧 até às ${nf} flores!` : 'Leva a água 💧 até à flor!');
    atualizarTopo();
    explicar();
  }

  /** Pinta de azul os canos com água e faz as flores crescer. */
  function regar() {
    const m = molhados(grelha, puzzle.fonte);
    const n = puzzle.tamanho;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const t = tile(r, c);
        t.classList.toggle('wet', m[r][c]);
        if (puzzle.tipo[r][c] === 'flor') {
          const icon = t.querySelector('.pipe-icon');
          const nova = m[r][c] ? '🌻' : '🌱';
          if (icon.textContent !== nova) {
            icon.textContent = nova;
            icon.classList.remove('grow');
            void icon.offsetWidth;
            icon.classList.add('grow');
          }
        }
      }
    }
    return m;
  }

  function virar(r, c, vezes) {
    voltas[r][c] += vezes;
    grelha[r][c] = rodar(grelha[r][c], vezes);
    tile(r, c).querySelector('.pipe-svg').style.transform = `rotate(${voltas[r][c] * 90}deg)`;
  }

  function tocar(r, c) {
    if (acabou) return;
    const tipo = puzzle.tipo[r][c];
    const t = tile(r, c);
    if (tipo !== 'cano' || presos[r][c]) {
      sound.play('oops');
      t.classList.remove('shake');
      void t.offsetWidth;
      t.classList.add('shake');
      if (tipo === 'fonte') dizer('A torneira não roda. Roda os canos 🔄');
      else if (tipo === 'flor') dizer('A flor não roda. Roda os canos 🔄');
      else dizer('Este cano já está certo 👍');
      return;
    }
    sound.play('tap');
    const antes = puzzle.flores.filter(({ r: fr, c: fc }) => tile(fr, fc).classList.contains('wet')).length;
    virar(r, c, 1);
    regar();
    if (resolvido(grelha, puzzle)) return ganhou();
    const agora = puzzle.flores.filter(({ r: fr, c: fc }) => tile(fr, fc).classList.contains('wet')).length;
    if (agora > antes) {
      sound.play('p1');
      const faltam = puzzle.flores.length - agora;
      dizer(`Boa! 🌻 Falta${faltam > 1 ? 'm' : ''} ${faltam} flor${faltam > 1 ? 'es' : ''}.`, 'good');
    }
  }

  function ajudar() {
    if (acabou) return;
    const pos = dica(grelha, puzzle);
    if (!pos) return;
    const { r, c } = pos;
    let k = 0;
    while (rodar(grelha[r][c], k) !== puzzle.solucao[r][c]) k++;
    sound.play('p2');
    if (k) virar(r, c, k);
    presos[r][c] = true;
    const t = tile(r, c);
    t.classList.add('locked');
    regar();
    if (resolvido(grelha, puzzle)) return ganhou();
    dizer('Este cano já está certo. Continua daí 👀');
    sound.speak('Olha, este cano fica assim. Continua daí.');
  }

  function ganhou() {
    acabou = true;
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
    const texto = subiu ? `As flores têm água! Subiste para o nível ${nivel} 🚀` : 'As flores têm água! 🌻🎉';
    dizer(texto, 'good');
    sound.play('win');
    sound.speak(subiu ? `Conseguiste! Agora é o nível ${nivel}.` : 'Conseguiste! As flores já têm água.');
    celebrate();
    later(novo, subiu ? 3200 : 2600);
  }

  novo();
  return () => {
    timers.forEach(clearTimeout);
    sound.stopSpeaking();
  };
}
