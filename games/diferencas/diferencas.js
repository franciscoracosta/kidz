import { NIVEIS, LARGURA, ALTURA, TOTAL_DIFERENCAS, criarDesafio, diferencaEm, estrelas } from './logic.js';

const NS = 'http://www.w3.org/2000/svg';

function svgEl(tag, attrs = {}) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
}

/** Desenha um dos quadros (esquerda ou direita) em SVG. */
function desenharQuadro(tema, bonecos) {
  const svg = svgEl('svg', { viewBox: `0 0 ${LARGURA} ${ALTURA}`, class: 'diff-board' });
  svg.append(
    svgEl('rect', { x: 0, y: 0, width: LARGURA, height: ALTURA, fill: tema.ceu }),
    svgEl('rect', { x: 0, y: ALTURA * 0.62, width: LARGURA, height: ALTURA * 0.38, fill: tema.chao }),
  );
  for (const b of bonecos) {
    const t = svgEl('text', {
      x: b.x,
      y: b.y,
      'font-size': b.tamanho,
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      transform: b.rodar ? `rotate(${b.rodar} ${b.x} ${b.y})` : '',
    });
    t.textContent = b.emoji;
    svg.append(t);
  }
  svg.append(svgEl('g', { class: 'diff-marks' }));
  return svg;
}

export function mount(root, { sound, celebrate, el }) {
  let timer = null;
  let alive = true;

  function escolherNivel() {
    clearTimeout(timer);
    root.replaceChildren(
      el('div', { class: 'setup' },
        el('h1', { class: 'setup-title' }, '🔍 7 Diferenças'),
        el('p', { class: 'setup-hint' }, 'Os dois desenhos parecem iguais, mas há 7 coisas diferentes. Toca nelas!'),
        el('h2', { class: 'setup-question' }, 'Escolhe o nível'),
        el('div', { class: 'choice-row' },
          NIVEIS.map((n) => el('button', {
            class: 'big-btn',
            onclick: () => { sound.play('tap'); jogar(n); },
          }, el('span', { class: 'big-emoji' }, n.emoji), n.nome,
          el('small', { class: 'big-sub' }, n.id === 'facil' ? 'falta ou trocou' : 'também tamanho e virado'))),
        ),
      ),
    );
  }

  function jogar(nivel) {
    clearTimeout(timer);
    const desafio = criarDesafio(nivel.id);
    const encontradas = new Set();
    let enganos = 0;
    let ajudas = 0;
    let acabou = false;

    const contador = el('span', { class: 'stars-box' });
    const info = el('p', { class: 'message' }, `${desafio.tema.nome}: encontra as 7 diferenças! 👀`);
    const quadros = [desenharQuadro(desafio.tema, desafio.esquerda), desenharQuadro(desafio.tema, desafio.direita)];
    for (const q of quadros) q.addEventListener('pointerdown', (e) => tocar(e, q));

    const ajudaBtn = el('button', { class: 'pill-btn', onclick: ajudar }, '💡 Ajuda');
    const outraBtn = el('button', { class: 'pill-btn', onclick: () => { sound.play('tap'); jogar(nivel); } }, '🔄 Outro desenho');
    const nivelBtn = el('button', { class: 'pill-btn', onclick: () => { sound.play('tap'); escolherNivel(); } }, '⚙️ Nível');

    root.replaceChildren(
      el('div', { class: 'play' },
        el('div', { class: 'scoreboard' }, contador), info,
        el('div', { class: 'board-wrap' }, el('div', { class: 'diff-pair' }, ...quadros)),
        el('div', { class: 'actions' }, ajudaBtn, outraBtn, nivelBtn),
      ),
    );
    atualizar();

    function atualizar() {
      contador.textContent = `🔍 ${encontradas.size} / ${TOTAL_DIFERENCAS}`;
    }

    function marcar(d, classe) {
      for (const q of quadros) {
        const c = svgEl('circle', { cx: d.x, cy: d.y, r: d.raio, class: classe });
        q.querySelector('.diff-marks').append(c);
        if (classe === 'diff-hint') setTimeout(() => c.remove(), 1600);
      }
    }

    function tocar(e, quadro) {
      if (acabou) return;
      const r = quadro.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * LARGURA;
      const y = ((e.clientY - r.top) / r.height) * ALTURA;
      const id = diferencaEm(desafio, x, y, encontradas);
      if (id === null) {
        // Só conta como engano se tocou num boneco (tocar no céu não faz mal).
        const num = desafio.esquerda.some((b) => Math.hypot(b.x - x, b.y - y) < b.tamanho * 0.6);
        if (num) {
          enganos++;
          sound.play('oops');
          const m = svgEl('circle', { cx: x, cy: y, r: 22, class: 'diff-miss' });
          quadro.querySelector('.diff-marks').append(m);
          setTimeout(() => m.remove(), 600);
          info.textContent = 'Aí está igual. Procura outra vez 👀';
          info.className = 'message';
        }
        return;
      }
      encontradas.add(id);
      marcar(desafio.diferencas.find((d) => d.id === id), 'diff-found');
      atualizar();
      const faltam = TOTAL_DIFERENCAS - encontradas.size;
      if (faltam === 0) return ganhar();
      sound.play('p1');
      info.textContent = faltam === 1 ? 'Boa! Só falta uma! 🔥' : `Boa! Faltam ${faltam} ⭐`;
      info.className = 'message good';
    }

    function ajudar() {
      if (acabou) return;
      const d = desafio.diferencas.find((x) => !encontradas.has(x.id));
      ajudas++;
      sound.play('tap');
      marcar(d, 'diff-hint');
      info.textContent = 'Olha aqui 👉 o que mudou?';
      info.className = 'message';
    }

    function ganhar() {
      acabou = true;
      const n = estrelas(enganos, ajudas);
      info.textContent = `Encontraste as 7 diferenças! ${'⭐'.repeat(n)}`;
      info.className = 'message good';
      outraBtn.classList.add('pulse', 'primary');
      sound.play('win');
      sound.speak('Muito bem! Encontraste as sete diferenças!');
      celebrate();
    }
  }

  escolherNivel();
  return () => { alive = false; clearTimeout(timer); sound.stopSpeaking(); };
}
