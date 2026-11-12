import { TEMAS, NIVEIS, criarCartas, estrelas } from './logic.js';

export function mount(root, { sound, celebrate, el }) {
  let timer = null;
  let alive = true;

  function escolherNivel() {
    clearTimeout(timer);
    root.replaceChildren(
      el('div', { class: 'setup' },
        el('h1', { class: 'setup-title' }, '🧠 Memória'),
        el('p', { class: 'setup-hint' }, 'Vira as cartas duas a duas e encontra os pares iguais.'),
        el('h2', { class: 'setup-question' }, 'Escolhe o nível'),
        el('div', { class: 'choice-row' },
          NIVEIS.map((n) => el('button', {
            class: 'big-btn',
            onclick: () => { sound.play('tap'); jogar(n); },
          }, el('span', { class: 'big-emoji' }, n.emoji), n.nome, el('small', { class: 'big-sub' }, `${n.pares} pares`))),
        ),
      ),
    );
  }

  function jogar(nivel) {
    clearTimeout(timer);
    const tema = TEMAS[Math.floor(Math.random() * TEMAS.length)];
    const cartas = criarCartas(nivel.pares, tema);
    let viradas = [];
    let encontrados = 0;
    let jogadas = 0;
    let bloqueado = false;

    const info = el('p', { class: 'message' }, `Tema: ${tema.nome}`);
    const contador = el('span', { class: 'stars-box' }, 'Jogadas: 0');
    const grelha = el('div', { class: 'memory-grid', style: `--cols:${nivel.colunas};--rows:${Math.ceil(cartas.length / nivel.colunas)}` });
    const botoes = cartas.map((c) => el('button', {
      class: 'memory-card',
      'aria-label': 'Carta virada para baixo',
      onclick: () => virar(c.id),
    }, el('span', { class: 'memory-inner' },
      el('span', { class: 'memory-back', 'aria-hidden': 'true' }, '❓'),
      el('span', { class: 'memory-front' }, c.simbolo),
    )));
    grelha.append(...botoes);
    const outraBtn = el('button', { class: 'pill-btn primary', onclick: () => { sound.play('tap'); jogar(nivel); } }, '🔄 Outra vez');
    const nivelBtn = el('button', { class: 'pill-btn', onclick: () => { sound.play('tap'); escolherNivel(); } }, '⚙️ Mudar nível');

    root.replaceChildren(
      el('div', { class: 'play' },
        el('div', { class: 'scoreboard' }, contador), info,
        el('div', { class: 'board-wrap' }, grelha),
        el('div', { class: 'actions' }, outraBtn, nivelBtn),
      ),
    );

    function virar(id) {
      const b = botoes[id];
      if (bloqueado || b.classList.contains('flipped')) return;
      b.classList.add('flipped');
      b.setAttribute('aria-label', cartas[id].simbolo);
      sound.play('tap');
      viradas.push(id);
      if (viradas.length < 2) return;

      jogadas++;
      contador.textContent = `Jogadas: ${jogadas}`;
      const [a, c] = viradas;
      viradas = [];
      if (cartas[a].simbolo === cartas[c].simbolo) {
        encontrados++;
        botoes[a].classList.add('matched');
        botoes[c].classList.add('matched');
        sound.play('p1');
        if (encontrados === nivel.pares) acabar();
        else info.textContent = 'Boa! Encontraste um par 🎉';
        return;
      }
      bloqueado = true;
      info.textContent = 'Não são iguais. Tenta lembrar-te onde estão! 🤔';
      timer = setTimeout(() => {
        if (!alive) return;
        for (const i of [a, c]) {
          botoes[i].classList.remove('flipped');
          botoes[i].setAttribute('aria-label', 'Carta virada para baixo');
        }
        bloqueado = false;
      }, 1000);
    }

    function acabar() {
      const n = estrelas(jogadas, nivel.pares);
      info.textContent = `Conseguiste em ${jogadas} jogadas! ${'⭐'.repeat(n)}`;
      outraBtn.classList.add('pulse');
      sound.play('win');
      celebrate();
    }
  }

  escolherNivel();
  return () => { alive = false; clearTimeout(timer); };
}
