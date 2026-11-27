import { TAMANHOS, DENTE, gerarFormas, contorno, encaixa, espalhar, arrumar } from './logic.js';
import { IMAGENS, svgParaUrl } from './imagens.js';

const LADO_FONTE = 1024; // o desenho é preparado num quadrado deste tamanho
const GUIA_KEY = 'kidz:puzzle:guia';
const FOTO_KEY = 'kidz:puzzle:foto';

function ler(chave) {
  try { return localStorage.getItem(chave); } catch { return null; }
}
function guardar(chave, valor) {
  try {
    if (valor == null) localStorage.removeItem(chave);
    else localStorage.setItem(chave, valor);
    return true;
  } catch { return false; }
}

function carregarImagem(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Desenha a imagem num quadrado (corta o que sobra ao centro, como nas fotos). */
function quadrado(img, lado = LADO_FONTE) {
  const cv = document.createElement('canvas');
  cv.width = lado;
  cv.height = lado;
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  const m = Math.min(w, h);
  cv.getContext('2d').drawImage(img, (w - m) / 2, (h - m) / 2, m, m, 0, 0, lado, lado);
  return cv;
}

function caminho(forma, lado) {
  const p = new Path2D();
  for (const [cmd, ...v] of contorno(forma, lado)) {
    if (cmd === 'M') p.moveTo(...v);
    else if (cmd === 'L') p.lineTo(...v);
    else p.bezierCurveTo(...v);
  }
  p.closePath();
  return p;
}

export function mount(root, { sound, celebrate, el }) {
  let guia = ler(GUIA_KEY) !== 'nao';
  let escolha = null; // { id, nome, fala, url } da imagem escolhida
  let n = 3;
  let timers = [];
  let limpezas = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  function parar() {
    timers.forEach(clearTimeout);
    timers = [];
    limpezas.forEach((f) => f());
    limpezas = [];
  }

  // ---------- Escolher a imagem ----------

  function cartaoImagem(src, nome, onclick, extra = null) {
    return el('button', { class: 'puzzle-pick', onclick },
      el('img', { src, alt: '', draggable: 'false' }),
      el('span', { class: 'puzzle-pick-name' }, nome),
      extra);
  }

  function escolherImagem() {
    parar();
    const fotoInput = el('input', { type: 'file', accept: 'image/*', hidden: true, onchange: () => usarFoto(fotoInput) });
    const cartoes = IMAGENS.map((im) => {
      const url = svgParaUrl(im.svg());
      return cartaoImagem(url, im.nome, () => {
        sound.play('tap');
        escolha = { id: im.id, nome: im.nome, fala: im.fala, url };
        escolherTamanho();
      });
    });
    const fotoGuardada = ler(FOTO_KEY);
    if (fotoGuardada) {
      cartoes.push(cartaoImagem(fotoGuardada, 'A minha foto', () => {
        sound.play('tap');
        escolha = { id: 'foto', nome: 'A minha foto', fala: 'A tua foto', url: fotoGuardada };
        escolherTamanho();
      }));
    }
    cartoes.push(el('button', { class: 'puzzle-pick foto', onclick: () => { sound.play('tap'); fotoInput.click(); } },
      el('span', { class: 'puzzle-pick-emoji' }, '📷'),
      el('span', { class: 'puzzle-pick-name' }, fotoGuardada ? 'Outra foto' : 'Uma foto do iPad')));

    root.replaceChildren(
      el('div', { class: 'setup puzzle-setup' },
        el('h2', { class: 'setup-question' }, 'Escolhe o desenho do puzzle'),
        el('div', { class: 'puzzle-picks' }, cartoes),
        fotoInput,
      ),
    );
    sound.speak('Escolhe o desenho do puzzle.');
  }

  async function usarFoto(input) {
    const file = input.files && input.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    try {
      const img = await carregarImagem(url);
      // Guarda uma cópia mais pequena para a foto aparecer da próxima vez.
      const pequena = quadrado(img, 768).toDataURL('image/jpeg', 0.85);
      if (!guardar(FOTO_KEY, pequena)) guardar(FOTO_KEY, null);
      escolha = { id: 'foto', nome: 'A minha foto', fala: 'A tua foto', url: pequena };
      escolherTamanho();
    } catch {
      sound.play('oops');
      sound.speak('Não consegui abrir essa foto. Experimenta outra.');
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  // ---------- Escolher quantas peças ----------

  function escolherTamanho() {
    parar();
    const botoes = TAMANHOS.map((t) =>
      el('button', {
        class: `big-btn puzzle-size${t.n === n ? ' chosen' : ''}`,
        onclick: () => { sound.play('tap'); n = t.n; jogar(); },
      },
      el('span', { class: 'big-emoji' }, t.emoji), t.nome,
      el('span', { class: 'big-sub' }, `${t.n} × ${t.n}`)));
    root.replaceChildren(
      el('div', { class: 'setup puzzle-setup' },
        el('img', { class: 'puzzle-preview', src: escolha.url, alt: escolha.nome, draggable: 'false' }),
        el('h2', { class: 'setup-question' }, 'Quantas peças?'),
        el('div', { class: 'choice-row puzzle-sizes' }, botoes),
        el('button', { class: 'pill-btn small', onclick: () => { sound.play('tap'); escolherImagem(); } }, '⬅️ Outro desenho'),
      ),
    );
    sound.speak(`${escolha.fala}. Quantas peças queres?`);
  }

  // ---------- Jogar ----------

  async function jogar() {
    parar();
    let fonte;
    try {
      fonte = quadrado(await carregarImagem(escolha.url));
    } catch {
      sound.play('oops');
      escolherImagem();
      return;
    }

    const total = n * n;
    const formas = gerarFormas(n);
    let pecas = []; // { i, r, c, cv, path, x, y, certa }
    let lay = null;
    let arrasto = null; // { peca, dx, dy, id }
    let topo = 10 + total;
    let acabou = false;

    const contador = el('span', { class: 'stars-box' });
    const guiaBtn = el('button', { class: 'stars-box level-box', onclick: () => trocarGuia() });
    const mensagem = el('p', { class: 'message' });
    const palco = el('div', { class: 'puzzle-stage' });
    const tabuleiro = el('canvas', { class: 'puzzle-board' });
    const final = el('canvas', { class: 'puzzle-final' });
    const ajudaBtn = el('button', { class: 'pill-btn', onclick: () => ajudar() }, '💡 Ajuda');
    palco.append(tabuleiro);

    root.replaceChildren(
      el('div', { class: 'play puzzle' },
        el('div', { class: 'scoreboard' }, contador, guiaBtn),
        mensagem,
        el('div', { class: 'board-wrap' }, palco),
        el('div', { class: 'actions' },
          el('button', { class: 'pill-btn', onclick: () => explicar() }, '🔊 Ouvir'),
          ajudaBtn,
          el('button', { class: 'pill-btn', onclick: () => { sound.play('tap'); escolherTamanho(); } }, '🔢 Peças'),
          el('button', { class: 'pill-btn', onclick: () => { sound.play('tap'); escolherImagem(); } }, '🖼️ Desenho'),
        ),
      ),
    );

    pecas = formas.map((forma, i) => {
      const cv = el('canvas', { class: 'puzzle-piece', style: `z-index:${10 + i}` });
      palco.append(cv);
      return { i, r: Math.floor(i / n), c: i % n, forma, cv, path: null, x: 0, y: 0, certa: false };
    });
    palco.append(final);

    function certas() {
      return pecas.filter((p) => p.certa).length;
    }

    function atualizarTopo() {
      contador.textContent = `🧩 ${certas()}/${total}`;
      guiaBtn.textContent = guia ? '🖼️ Guia: sim' : '🖼️ Guia: não';
    }

    function dizer(texto, cls = '') {
      mensagem.textContent = texto;
      mensagem.className = `message ${cls}`.trim();
    }

    function explicar() {
      sound.speak('Arrasta as peças com o dedo para o quadro. Quando a peça está perto do sítio certo, encaixa sozinha!');
    }

    function trocarGuia() {
      sound.play('tap');
      guia = !guia;
      guardar(GUIA_KEY, guia ? 'sim' : 'nao');
      desenharTabuleiro();
      atualizarTopo();
    }

    function alvo(p) {
      return { x: lay.tabuleiro.x + p.c * lay.celula, y: lay.tabuleiro.y + p.r * lay.celula };
    }

    function mover(p) {
      const pad = lay.celula * DENTE;
      p.cv.style.transform = `translate(${p.x - pad}px, ${p.y - pad}px)`;
    }

    function desenharTabuleiro() {
      const { tabuleiro: t } = lay;
      const dpr = window.devicePixelRatio || 1;
      for (const cv of [tabuleiro, final]) {
        cv.width = Math.round(t.lado * dpr);
        cv.height = Math.round(t.lado * dpr);
        cv.style.width = `${t.lado}px`;
        cv.style.height = `${t.lado}px`;
        cv.style.transform = `translate(${t.x}px, ${t.y}px)`;
      }
      const ctx = tabuleiro.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#fffaf0';
      ctx.fillRect(0, 0, t.lado, t.lado);
      if (guia) {
        ctx.globalAlpha = 0.3;
        ctx.drawImage(fonte, 0, 0, t.lado, t.lado);
        ctx.globalAlpha = 1;
      }
      ctx.strokeStyle = 'rgba(59, 42, 85, 0.18)';
      ctx.lineWidth = 1.5;
      for (const forma of formas) {
        ctx.save();
        const i = formas.indexOf(forma);
        ctx.translate((i % n) * lay.celula, Math.floor(i / n) * lay.celula);
        ctx.stroke(caminho(forma, lay.celula));
        ctx.restore();
      }
      const fctx = final.getContext('2d');
      fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fctx.drawImage(fonte, 0, 0, t.lado, t.lado);
    }

    function desenharPeca(p) {
      const s = lay.celula;
      const pad = s * DENTE;
      const dpr = window.devicePixelRatio || 1;
      const lado = s + 2 * pad;
      p.cv.width = Math.round(lado * dpr);
      p.cv.height = Math.round(lado * dpr);
      p.cv.style.width = `${lado}px`;
      p.cv.style.height = `${lado}px`;
      p.path = caminho(p.forma, s);
      const ctx = p.cv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.translate(pad, pad);
      ctx.save();
      ctx.clip(p.path);
      const escala = LADO_FONTE / (s * n);
      ctx.drawImage(fonte, (p.c * s - pad) * escala, (p.r * s - pad) * escala, lado * escala, lado * escala, -pad, -pad, lado, lado);
      ctx.restore();
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 3;
      ctx.stroke(p.path);
      ctx.strokeStyle = 'rgba(59, 42, 85, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.stroke(p.path);
    }

    /** Arruma tudo outra vez (ao começar e quando o iPad roda). */
    function arrumarTudo() {
      const w = palco.clientWidth;
      const h = palco.clientHeight;
      if (!w || !h) return;
      const antes = lay;
      lay = arrumar(w, h, n);
      if (antes && antes.celula === lay.celula && antes.tabuleiro.x === lay.tabuleiro.x && antes.tabuleiro.y === lay.tabuleiro.y) return;
      desenharTabuleiro();
      const soltas = pecas.filter((p) => !p.certa);
      const posicoes = espalhar(soltas.length, lay.zona, lay.celula);
      soltas.forEach((p, k) => Object.assign(p, posicoes[k]));
      for (const p of pecas) {
        desenharPeca(p);
        if (p.certa) Object.assign(p, alvo(p));
        mover(p);
      }
    }

    function pecaEm(x, y) {
      // Primeiro a peça de cima que está mesmo debaixo do dedo...
      const soltas = pecas.filter((p) => !p.certa).sort((a, b) => (+b.cv.style.zIndex || 0) - (+a.cv.style.zIndex || 0));
      const ctx = soltas[0]?.cv.getContext('2d');
      for (const p of soltas) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const dentro = ctx.isPointInPath(p.path, x - p.x, y - p.y);
        ctx.restore();
        if (dentro) return p;
      }
      // ...senão a mais perto (para dedos pequenos que falham por pouco).
      let melhor = null;
      let dist = lay.celula * 0.75;
      for (const p of soltas) {
        const d = Math.hypot(x - (p.x + lay.celula / 2), y - (p.y + lay.celula / 2));
        if (d < dist) { dist = d; melhor = p; }
      }
      return melhor;
    }

    function ponto(e) {
      const r = palco.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    function pegar(e) {
      if (acabou || arrasto) return;
      const { x, y } = ponto(e);
      const p = pecaEm(x, y);
      if (!p) return;
      e.preventDefault();
      arrasto = { peca: p, dx: x - p.x, dy: y - p.y, id: e.pointerId };
      try { palco.setPointerCapture(e.pointerId); } catch { /* sem captura */ }
      p.cv.style.zIndex = String(++topo);
      p.cv.classList.remove('snap');
      p.cv.classList.add('dragging');
      sound.play('tap');
    }

    function arrastar(e) {
      if (!arrasto || e.pointerId !== arrasto.id) return;
      e.preventDefault();
      const { x, y } = ponto(e);
      const p = arrasto.peca;
      const s = lay.celula;
      p.x = Math.min(Math.max(x - arrasto.dx, -s / 2), palco.clientWidth - s / 2);
      p.y = Math.min(Math.max(y - arrasto.dy, -s / 2), palco.clientHeight - s / 2);
      mover(p);
    }

    function largar(e) {
      if (!arrasto || e.pointerId !== arrasto.id) return;
      const p = arrasto.peca;
      arrasto = null;
      p.cv.classList.remove('dragging');
      // Peças grandes (poucas) encaixam com mais folga.
      const folga = n <= 3 ? 0.45 : 0.38;
      if (encaixa(p, alvo(p), lay.celula, folga)) {
        encaixar(p);
      } else {
        // Se ficou quase toda fora do palco, puxa-a para dentro.
        const s = lay.celula;
        p.x = Math.min(Math.max(p.x, 0), palco.clientWidth - s);
        p.y = Math.min(Math.max(p.y, 0), palco.clientHeight - s);
        mover(p);
      }
    }

    function encaixar(p, ajuda = false) {
      p.certa = true;
      Object.assign(p, alvo(p));
      p.cv.classList.add('snap');
      p.cv.style.zIndex = '1';
      mover(p);
      later(() => p.cv.classList.add('placed'), 220);
      atualizarTopo();
      if (certas() === total) return ganhou();
      sound.play(ajuda ? 'p2' : 'p1');
      const faltam = total - certas();
      dizer(faltam === 1 ? 'Só falta 1 peça! 🤩' : `Boa! Faltam ${faltam} peças.`, 'good');
    }

    function ajudar() {
      if (acabou) return;
      const soltas = pecas.filter((p) => !p.certa);
      if (!soltas.length) return;
      const p = soltas[Math.floor(Math.random() * soltas.length)];
      p.cv.style.zIndex = String(++topo);
      encaixar(p, true);
      if (!acabou) sound.speak('Olha, esta peça vai para aqui.');
    }

    function ganhou() {
      acabou = true;
      ajudaBtn.disabled = true;
      sound.play('win');
      dizer('Conseguiste! O puzzle está completo! 🎉', 'good');
      sound.speak(n < 6 ? 'Conseguiste! O puzzle está completo! Queres experimentar com mais peças?' : 'Conseguiste! O puzzle está completo! És um campeão dos puzzles!');
      celebrate();
      later(() => final.classList.add('show'), 300);
      if (n < 6) {
        later(() => {
          const mais = el('button', { class: 'pill-btn primary pulse', onclick: () => { sound.play('tap'); n += 1; jogar(); } }, `➕ ${TAMANHOS.find((t) => t.n === n + 1).nome}`);
          root.querySelector('.puzzle .actions')?.prepend(mais);
        }, 900);
      }
    }

    palco.addEventListener('pointerdown', pegar);
    palco.addEventListener('pointermove', arrastar);
    palco.addEventListener('pointerup', largar);
    palco.addEventListener('pointercancel', largar);
    const ro = new ResizeObserver(() => arrumarTudo());
    ro.observe(palco);
    limpezas.push(() => ro.disconnect());

    atualizarTopo();
    dizer(`Arrasta as ${total} peças para o quadro! 🧩`);
    arrumarTudo();
    explicar();
  }

  escolherImagem();
  return () => {
    parar();
    sound.stopSpeaking();
  };
}
