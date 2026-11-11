import { DESENHOS, desenhoAoCalhas } from './desenhos.js';

export const CORES = [
  ['#ff3b4a', 'Vermelho'], ['#ff8a1f', 'Laranja'], ['#ffd60a', 'Amarelo'], ['#7ed957', 'Verde claro'],
  ['#1fa34a', 'Verde'], ['#4cc9ff', 'Azul claro'], ['#2f6bff', 'Azul'], ['#8e4dff', 'Roxo'],
  ['#ff6fb5', 'Cor-de-rosa'], ['#ffcc99', 'Cor de pele'], ['#8b5a2b', 'Castanho'], ['#2b2b2b', 'Preto'],
];
// Larguras no espaço do desenho (400x400), por isso são iguais em qualquer ecrã.
export const PINCEIS = [[8, 'Fino'], [18, 'Médio'], [34, 'Grosso']];

const SIZE = 400;
const NS = 'http://www.w3.org/2000/svg';

export function mount(root, { sound, celebrate, el }) {
  let desenho = -1;
  let cor = CORES[0][0];
  let largura = PINCEIS[1][0];
  let borracha = false;
  let tracos = []; // { cor, largura, borracha, pontos: [[x, y], ...] }
  let atual = null;
  let pointerId = null;

  const canvas = el('canvas', { class: 'paint-canvas', 'aria-label': 'Folha para pintar' });
  const linhas = document.createElementNS(NS, 'svg');
  linhas.setAttribute('viewBox', `0 0 ${SIZE} ${SIZE}`);
  linhas.setAttribute('class', 'paint-lines');
  linhas.setAttribute('aria-hidden', 'true');
  const paper = el('div', { class: 'paper' }, canvas, linhas);
  const stage = el('div', { class: 'paint-stage' }, paper);
  const g = canvas.getContext('2d');

  // ---------- Ferramentas ----------
  const corBtns = CORES.map(([c, nome]) =>
    el('button', {
      class: 'swatch', style: `--c:${c}`, 'aria-label': nome,
      onclick: () => { cor = c; borracha = false; sound.play('tap'); updateTools(); },
    }));
  const pincelBtns = PINCEIS.map(([w, nome]) =>
    el('button', {
      class: 'brush', 'aria-label': `Pincel ${nome.toLowerCase()}`,
      onclick: () => { largura = w; sound.play('tap'); updateTools(); },
    }, el('span', { class: 'brush-dot', style: `--w:${Math.round(w * 0.9) + 4}px` })));
  const borrachaBtn = el('button', {
    class: 'tool-btn', onclick: () => { borracha = !borracha; sound.play('tap'); updateTools(); },
  }, '🧽', el('span', {}, 'Borracha'));
  const desfazerBtn = el('button', {
    class: 'tool-btn', onclick: () => { tracos.pop(); sound.play('tap'); redraw(); updateTools(); },
  }, '↩️', el('span', {}, 'Desfazer'));
  const limparBtn = el('button', {
    class: 'tool-btn', onclick: () => { tracos = []; sound.play('oops'); redraw(); updateTools(); },
  }, '🗑️', el('span', {}, 'Limpar'));
  const outroBtn = el('button', {
    class: 'tool-btn', onclick: () => { novoDesenho(); sound.play('tap'); },
  }, '🎲', el('span', {}, 'Outro desenho'));
  const jaEstaBtn = el('button', {
    class: 'pill-btn primary', onclick: () => { sound.play('win'); celebrate(); },
  }, '🎉 Já está!');

  const titulo = el('p', { class: 'message paint-title' });
  const tools = el('div', { class: 'paint-tools' },
    el('div', { class: 'palette', role: 'group', 'aria-label': 'Cores' }, corBtns),
    el('div', { class: 'brushes', role: 'group', 'aria-label': 'Largura do pincel' }, pincelBtns, borrachaBtn),
    el('div', { class: 'tool-row' }, desfazerBtn, limparBtn, outroBtn),
    jaEstaBtn,
  );
  root.replaceChildren(el('div', { class: 'paint' }, el('div', { class: 'paint-main' }, titulo, stage), tools));

  function updateTools() {
    corBtns.forEach((b, i) => b.classList.toggle('selected', !borracha && CORES[i][0] === cor));
    pincelBtns.forEach((b, i) => {
      b.classList.toggle('selected', PINCEIS[i][0] === largura);
      b.style.setProperty('--c', borracha ? '#cfc6dc' : cor);
    });
    borrachaBtn.classList.toggle('selected', borracha);
    desfazerBtn.disabled = tracos.length === 0;
    limparBtn.disabled = tracos.length === 0;
  }

  function novoDesenho() {
    desenho = desenhoAoCalhas(desenho);
    tracos = [];
    const d = DESENHOS[desenho];
    linhas.innerHTML = d.svg;
    titulo.textContent = `Pinta: ${d.nome}`;
    redraw();
    updateTools();
  }

  // ---------- Pintar ----------
  function scale() { return canvas.width / SIZE; }

  function strokeStyle(t) {
    g.globalCompositeOperation = t.borracha ? 'destination-out' : 'source-over';
    g.strokeStyle = g.fillStyle = t.cor;
    g.lineWidth = t.largura;
    g.lineCap = 'round';
    g.lineJoin = 'round';
  }

  function dot(t, [x, y]) {
    strokeStyle(t);
    g.beginPath();
    g.arc(x, y, t.largura / 2, 0, Math.PI * 2);
    g.fill();
  }

  function segment(t, [x0, y0], [x1, y1]) {
    strokeStyle(t);
    g.beginPath();
    g.moveTo(x0, y0);
    g.lineTo(x1, y1);
    g.stroke();
  }

  function redraw() {
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, canvas.width, canvas.height);
    g.setTransform(scale(), 0, 0, scale(), 0, 0);
    for (const t of tracos) {
      if (t.pontos.length === 1) { dot(t, t.pontos[0]); continue; }
      strokeStyle(t);
      g.beginPath();
      g.moveTo(...t.pontos[0]);
      for (const p of t.pontos.slice(1)) g.lineTo(...p);
      g.stroke();
    }
  }

  function resize() {
    const box = paper.getBoundingClientRect();
    const px = Math.max(1, Math.round(box.width * Math.min(window.devicePixelRatio || 1, 2)));
    if (canvas.width !== px) {
      canvas.width = px;
      canvas.height = px;
      redraw();
    }
  }

  function point(e) {
    const r = canvas.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * SIZE, ((e.clientY - r.top) / r.height) * SIZE];
  }

  canvas.addEventListener('pointerdown', (e) => {
    if (pointerId !== null) return; // só um dedo de cada vez
    e.preventDefault();
    pointerId = e.pointerId;
    canvas.setPointerCapture?.(e.pointerId);
    atual = { cor, largura, borracha, pontos: [point(e)] };
    tracos.push(atual);
    dot(atual, atual.pontos[0]);
    updateTools();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (e.pointerId !== pointerId || !atual) return;
    e.preventDefault();
    const events = e.getCoalescedEvents?.() || [e];
    for (const ev of events.length ? events : [e]) {
      const p = point(ev);
      const prev = atual.pontos[atual.pontos.length - 1];
      if (Math.hypot(p[0] - prev[0], p[1] - prev[1]) < 0.8) continue;
      atual.pontos.push(p);
      segment(atual, prev, p);
    }
  });
  const end = (e) => {
    if (e.pointerId !== pointerId) return;
    pointerId = null;
    atual = null;
  };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);

  const ro = new ResizeObserver(resize);
  ro.observe(paper);

  novoDesenho();
  resize();

  return () => ro.disconnect();
}
