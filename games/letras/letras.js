import { LETRAS, letraAoCalhas, avaliar, estaBem, COBERTURA_MINIMA } from './logic.js';

const SIZE = 400;      // espaço do desenho (como no jogo de pintura)
const EVAL = 160;      // resolução usada para verificar a letra
const PINCEL = 34;
const CORES = ['#ff3b4a', '#ff8a1f', '#1fa34a', '#2f6bff', '#8e4dff', '#ff6fb5'];
const FONTE = '"SF Pro Rounded", ui-rounded, "Arial Rounded MT Bold", "Nunito", system-ui, sans-serif';

/** Desenha a letra centrada num quadrado de `SIZE` (o contexto já deve estar escalado). */
function desenharLetra(g, texto) {
  g.save();
  g.textAlign = 'left';
  g.textBaseline = 'alphabetic';
  g.font = `800 100px ${FONTE}`;
  let m = g.measureText(texto);
  const w = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
  const h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
  const fontSize = 100 * Math.min(280 / h, 290 / w, 3.2);
  g.font = `800 ${fontSize}px ${FONTE}`;
  m = g.measureText(texto);
  const x = SIZE / 2 - (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2;
  const y = SIZE / 2 + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
  g.fillText(texto, x, y);
  g.restore();
}

export function mount(root, { sound, celebrate, el }) {
  let indice = -1;
  let minusculas = false;
  let tracos = [];
  let atual = null;
  let pointerId = null;
  let feito = false;
  let estrelas = 0;
  let cor = CORES[0];

  const guia = el('canvas', { class: 'paint-canvas guide-canvas', 'aria-hidden': 'true' });
  const tinta = el('canvas', { class: 'paint-canvas', 'aria-label': 'Escreve a letra por cima' });
  const paper = el('div', { class: 'paper letter-paper' }, guia, tinta);
  const stage = el('div', { class: 'paint-stage' }, paper);
  const gGuia = guia.getContext('2d');
  const g = tinta.getContext('2d');

  const palavraEl = el('p', { class: 'message letter-word' });
  const mensagem = el('p', { class: 'letter-hint', 'aria-live': 'polite' });
  const estrelasEl = el('span', { class: 'stars' });
  const ouvirBtn = el('button', { class: 'tool-btn', onclick: () => falar() }, '🔊', el('span', {}, 'Ouvir'));
  const apagarBtn = el('button', {
    class: 'tool-btn', onclick: () => { sound.play('tap'); limpar(); },
  }, '🧽', el('span', {}, 'Apagar'));
  const proximaBtn = el('button', {
    class: 'pill-btn primary', onclick: () => { sound.play('tap'); novaLetra(); },
  }, '➡️ Outra letra');
  const modoBtn = el('button', {
    class: 'tool-btn', onclick: () => { minusculas = !minusculas; sound.play('tap'); mostrar(); },
  });

  root.replaceChildren(
    el('div', { class: 'paint' },
      el('div', { class: 'paint-main' }, palavraEl, stage),
      el('div', { class: 'paint-tools letter-tools' },
        el('div', { class: 'stars-box' }, estrelasEl),
        mensagem,
        el('div', { class: 'tool-row' }, ouvirBtn, apagarBtn, modoBtn),
        proximaBtn,
      ),
    ),
  );

  const letraAtual = () => {
    const l = LETRAS[indice];
    return minusculas ? l.letra.toLowerCase() : l.letra;
  };

  function falar() {
    if (!sound.on || !('speechSynthesis' in window)) return;
    const { letra, palavra } = LETRAS[indice];
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(`${letra}... de ${palavra}`);
      u.lang = 'pt-PT';
      u.rate = 0.85;
      speechSynthesis.speak(u);
    } catch { /* sem voz neste aparelho */ }
  }

  function atualizarTexto() {
    const { palavra, emoji } = LETRAS[indice];
    const l = letraAtual();
    palavraEl.replaceChildren(
      el('span', { class: 'letter-emoji', 'aria-hidden': 'true' }, emoji), ' ',
      el('strong', {}, l), ' de ',
      minusculas ? palavra.toLowerCase() : palavra,
    );
    modoBtn.replaceChildren(minusculas ? 'ABC' : 'abc', el('span', {}, minusculas ? 'Maiúsculas' : 'Minúsculas'));
    estrelasEl.textContent = estrelas ? `⭐ ${estrelas}` : '⭐ 0';
    apagarBtn.disabled = tracos.length === 0;
  }

  function dica(texto, tipo = '') {
    mensagem.textContent = texto;
    mensagem.className = `letter-hint ${tipo}`;
  }

  function limpar() {
    tracos = [];
    feito = false;
    proximaBtn.classList.remove('pulse');
    paper.classList.remove('done');
    dica('Escreve a letra por cima do sombreado ✏️');
    redesenharTinta();
    atualizarTexto();
  }

  function novaLetra() {
    indice = letraAoCalhas(indice);
    cor = CORES[Math.floor(Math.random() * CORES.length)];
    mostrar();
    falar();
  }

  function mostrar() {
    desenharGuia();
    limpar();
  }

  // ---------- Desenho ----------
  const escala = (c) => c.width / SIZE;

  function desenharGuia() {
    gGuia.setTransform(1, 0, 0, 1, 0, 0);
    gGuia.clearRect(0, 0, guia.width, guia.height);
    gGuia.setTransform(escala(guia), 0, 0, escala(guia), 0, 0);
    // linhas de caderno
    gGuia.strokeStyle = '#d9e6ff';
    gGuia.lineWidth = 3;
    for (const y of [60, 340]) { gGuia.beginPath(); gGuia.moveTo(16, y); gGuia.lineTo(SIZE - 16, y); gGuia.stroke(); }
    gGuia.fillStyle = '#dcd2ee';
    desenharLetra(gGuia, letraAtual());
  }

  function estilo(c) {
    c.strokeStyle = c.fillStyle = cor;
    c.lineWidth = PINCEL;
    c.lineCap = 'round';
    c.lineJoin = 'round';
  }

  function desenharTracos(c) {
    estilo(c);
    for (const t of tracos) {
      c.beginPath();
      if (t.length === 1) {
        c.arc(t[0][0], t[0][1], PINCEL / 2, 0, Math.PI * 2);
        c.fill();
        continue;
      }
      c.moveTo(...t[0]);
      for (const p of t.slice(1)) c.lineTo(...p);
      c.stroke();
    }
  }

  function redesenharTinta() {
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, tinta.width, tinta.height);
    g.setTransform(escala(tinta), 0, 0, escala(tinta), 0, 0);
    desenharTracos(g);
  }

  // Desenha num canvas pequeno e devolve um valor por pixel (o alfa).
  function pixels(desenhar) {
    const c = document.createElement('canvas');
    c.width = c.height = EVAL;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.setTransform(EVAL / SIZE, 0, 0, EVAL / SIZE, 0, 0);
    desenhar(ctx);
    const data = ctx.getImageData(0, 0, EVAL, EVAL).data;
    const alfa = new Uint8Array(EVAL * EVAL);
    for (let i = 0; i < alfa.length; i++) alfa[i] = data[i * 4 + 3] > 100 ? 1 : 0;
    return alfa;
  }

  function verificar() {
    if (feito) return;
    const modelo = pixels((c) => { c.fillStyle = '#000'; desenharLetra(c, letraAtual()); });
    const escrito = pixels(desenharTracos);
    // miolo: tira ~8 unidades às bordas; folga: aceita tinta até meio pincel (e mais um pouco) fora da letra.
    const k = EVAL / SIZE;
    const r = avaliar(modelo, escrito, EVAL, { miolo: Math.round(8 * k), folga: Math.round((PINCEL / 2 + 10) * k) });
    if (estaBem(r)) {
      feito = true;
      estrelas++;
      atualizarTexto();
      paper.classList.add('done');
      proximaBtn.classList.add('pulse');
      dica('Muito bem! ⭐', 'good');
      sound.play('win');
      celebrate();
    } else if (r.cobertura >= COBERTURA_MINIMA) {
      dica('Quase! Tenta não sair da letra 🙂', 'warn');
    } else if (r.cobertura >= COBERTURA_MINIMA * 0.6) {
      dica('Boa! Continua a pintar a letra toda ✏️');
    }
  }

  function resize() {
    const box = paper.getBoundingClientRect();
    const px = Math.max(1, Math.round(box.width * Math.min(window.devicePixelRatio || 1, 2)));
    if (tinta.width !== px) {
      tinta.width = tinta.height = guia.width = guia.height = px;
      desenharGuia();
      redesenharTinta();
    }
  }

  function ponto(e) {
    const r = tinta.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * SIZE, ((e.clientY - r.top) / r.height) * SIZE];
  }

  tinta.addEventListener('pointerdown', (e) => {
    if (pointerId !== null) return;
    e.preventDefault();
    pointerId = e.pointerId;
    tinta.setPointerCapture?.(e.pointerId);
    atual = [ponto(e)];
    tracos.push(atual);
    estilo(g);
    g.beginPath();
    g.arc(atual[0][0], atual[0][1], PINCEL / 2, 0, Math.PI * 2);
    g.fill();
    apagarBtn.disabled = false;
  });
  tinta.addEventListener('pointermove', (e) => {
    if (e.pointerId !== pointerId || !atual) return;
    e.preventDefault();
    const evs = e.getCoalescedEvents?.() || [];
    for (const ev of evs.length ? evs : [e]) {
      const p = ponto(ev);
      const prev = atual[atual.length - 1];
      if (Math.hypot(p[0] - prev[0], p[1] - prev[1]) < 0.8) continue;
      atual.push(p);
      estilo(g);
      g.beginPath();
      g.moveTo(...prev);
      g.lineTo(...p);
      g.stroke();
    }
  });
  const fim = (e) => {
    if (e.pointerId !== pointerId) return;
    pointerId = null;
    atual = null;
    verificar();
  };
  tinta.addEventListener('pointerup', fim);
  tinta.addEventListener('pointercancel', fim);

  const ro = new ResizeObserver(resize);
  ro.observe(paper);

  indice = letraAoCalhas();
  resize();
  mostrar();

  return () => {
    ro.disconnect();
    try { speechSynthesis.cancel(); } catch { /* nada */ }
  };
}
