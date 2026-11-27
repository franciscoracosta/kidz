import {
  encherQuadro, esconder, parteVisivel, encontrou, bolaNoQuadro, pousarBola, sitioAoCalhas,
  BOLA, TAM_OBJETO, TAM_BOLA, NIVEIS,
} from './logic.js';

// Esconde a Bola: um jogador arrasta a bola para o quadro cheio de brinquedos e
// carrega em Iniciar. A bola fica escondida por baixo de tudo e outra pessoa
// tem de ir tirando os brinquedos para o lado até a encontrar.

export function mount(root, { sound, celebrate, el }) {
  let nivel = 2;
  let estrelas = 0;
  let fase = 'esconder'; // 'esconder' | 'procurar' | 'fim'
  let objetos = [];
  let bola = { x: 0, y: 0 };
  let inicioBola = { x: 0, y: 0 };
  let mexidas = 0;
  let timers = [];
  let geo = { left: 0, top: 0, S: 1, W: 1, H: 1 };
  let arrasto = null; // { id, node, item, dx, dy, pointerId }
  const nodes = new Map(); // id do objeto -> elemento

  const contador = el('span', { class: 'stars-box' });
  const mensagem = el('p', { class: 'message' });
  const quadro = el('div', { class: 'hide-square' });
  const bolaEl = el('div', { class: 'hide-item hide-ball', 'aria-label': 'Bola' }, BOLA);
  const palco = el('div', { class: 'hide-stage' }, quadro);

  const btnIpad = el('button', { class: 'pill-btn', onclick: () => { sound.play('tap'); ipadEsconde(); } }, '🤖 O iPad esconde');
  const btnIniciar = el('button', { class: 'pill-btn primary', onclick: () => iniciar() }, '▶️ Iniciar');
  const btnNivel = el('button', { class: 'pill-btn', onclick: () => trocarNivel() });
  const btnMostrar = el('button', { class: 'pill-btn', onclick: () => mostrar() }, '👀 Onde está?');
  const btnOutra = el('button', { class: 'pill-btn primary pulse', onclick: () => { sound.play('tap'); novaRonda(true); } }, '🔁 Outra vez');
  const btnOuvir = el('button', { class: 'pill-btn', onclick: () => explicar() }, '🔊 Ouvir');

  root.replaceChildren(
    el('div', { class: 'play esconde' },
      el('div', { class: 'scoreboard' }, contador),
      mensagem,
      el('div', { class: 'board-wrap' }, palco),
      el('div', { class: 'actions' }, btnIpad, btnNivel, btnIniciar, btnMostrar, btnOutra, btnOuvir),
    ),
  );

  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  function dizer(texto, cls = '') {
    mensagem.textContent = texto;
    mensagem.className = `message ${cls}`.trim();
  }

  function explicar() {
    if (fase === 'esconder') {
      sound.speak('Arrasta a bola para cima dos brinquedos e carrega em Iniciar. A bola vai ficar escondida. Depois outra pessoa tem de a encontrar.');
    } else if (fase === 'procurar') {
      sound.speak('A bola está escondida debaixo dos brinquedos. Arrasta os brinquedos para o lado até encontrares a bola.');
    } else {
      sound.speak('Encontraste a bola! Carrega em Outra vez para jogar de novo.');
    }
  }

  function atualizarBotoes() {
    btnIpad.hidden = fase !== 'esconder';
    btnNivel.hidden = fase !== 'esconder';
    btnIniciar.hidden = fase !== 'esconder';
    btnIniciar.disabled = !bolaNoQuadro(bola);
    btnIniciar.classList.toggle('pulse', bolaNoQuadro(bola));
    btnIniciar.style.opacity = bolaNoQuadro(bola) ? '' : '0.5';
    btnMostrar.hidden = fase !== 'procurar';
    btnOutra.hidden = fase !== 'fim';
    btnNivel.textContent = `🧸 ${NIVEIS[nivel - 1].nome}`;
    contador.textContent = `⭐ ${estrelas}`;
  }

  // ---------- Posições no ecrã ----------

  function medir() {
    const W = palco.clientWidth || 1;
    const H = palco.clientHeight || 1;
    // Deixa espaço ao lado (ou em baixo) para a bola e para os brinquedos tirados.
    const S = W >= H ? Math.min(H * 0.96, W / 1.55) : Math.min(W * 0.96, H / 1.5);
    geo = { W, H, S, left: (W - S) / 2, top: (H - S) / 2 };
    inicioBola = W >= H
      ? { x: -geo.left / 2 / S, y: 0.5 }
      : { x: 0.5, y: 1 + (H - geo.top - S) / 2 / S };
  }

  function colocar(node, item, tam) {
    const lado = tam * geo.S;
    node.style.left = `${geo.left + item.x * geo.S}px`;
    node.style.top = `${geo.top + item.y * geo.S}px`;
    node.style.width = `${lado}px`;
    node.style.height = `${lado}px`;
    node.style.fontSize = `${lado * 0.82}px`;
    node.style.setProperty('--rot', `${item.rot || 0}deg`);
  }

  function desenhar() {
    medir();
    quadro.style.left = `${geo.left}px`;
    quadro.style.top = `${geo.top}px`;
    quadro.style.width = `${geo.S}px`;
    quadro.style.height = `${geo.S}px`;
    if (fase === 'esconder' && !bolaNoQuadro(bola)) bola = { ...inicioBola };
    objetos.forEach((o, i) => {
      const node = nodes.get(o.id);
      colocar(node, o, TAM_OBJETO);
      node.style.zIndex = String(10 + i);
    });
    colocar(bolaEl, bola, TAM_BOLA);
    // A esconder, a bola anda por cima de tudo; depois fica por baixo.
    bolaEl.style.zIndex = fase === 'esconder' ? '500' : '1';
  }

  // ---------- Rondas ----------

  function novaRonda(trocar = false) {
    timers.forEach(clearTimeout);
    timers = [];
    fase = 'esconder';
    mexidas = 0;
    objetos = encherQuadro(nivel);
    nodes.clear();
    bolaEl.classList.remove('found', 'reveal');
    palco.classList.remove('hiding', 'revealed');
    palco.replaceChildren(quadro, bolaEl, ...objetos.map((o) => {
      const node = el('div', { class: 'hide-item hide-obj', 'aria-hidden': 'true' }, o.emoji);
      node.dataset.id = String(o.id);
      nodes.set(o.id, node);
      return node;
    }));
    medir();
    bola = { ...inicioBola };
    desenhar();
    atualizarBotoes();
    dizer(trocar ? 'Agora troquem! Quem procurou, esconde 🙈' : 'Arrasta a bola ⚽ para cima dos brinquedos.');
    explicar();
  }

  function trocarNivel() {
    sound.play('tap');
    nivel = nivel % NIVEIS.length + 1;
    const naoMexeu = !bolaNoQuadro(bola);
    novaRonda();
    if (naoMexeu) dizer(`${NIVEIS[nivel - 1].nome}! Arrasta a bola ⚽ para cima dos brinquedos.`);
  }

  function iniciar() {
    if (fase !== 'esconder' || !bolaNoQuadro(bola)) return;
    sound.play('p1');
    fase = 'procurar';
    objetos = esconder(bola, objetos, nivel);
    palco.classList.add('hiding');
    desenhar();
    later(() => palco.classList.remove('hiding'), 700);
    atualizarBotoes();
    dizer('A bola está escondida! Agora procura 🔎');
    sound.speak('A bola está escondida! Agora outra pessoa procura. Arrasta os brinquedos para o lado até encontrares a bola.');
  }

  function ipadEsconde() {
    bola = sitioAoCalhas();
    desenhar();
    iniciar();
    dizer('O iPad escondeu a bola! Consegues encontrá-la? 🔎');
  }

  function achou() {
    if (fase !== 'procurar') return;
    fase = 'fim';
    estrelas++;
    // A bola salta para cima de tudo.
    bolaEl.style.zIndex = '500';
    bolaEl.classList.add('found');
    atualizarBotoes();
    const quantas = mexidas === 1 ? '1 brinquedo' : `${mexidas} brinquedos`;
    dizer(`Encontraste a bola! 🎉 Tiraste ${quantas}.`, 'good');
    sound.play('win');
    sound.speak(mexidas <= 1 ? 'Encontraste a bola logo à primeira! Boa!' : `Encontraste a bola! Tiraste ${mexidas} brinquedos.`);
    celebrate();
  }

  function mostrar() {
    if (fase !== 'procurar') return;
    sound.play('tap');
    fase = 'fim';
    palco.classList.add('revealed');
    bolaEl.style.zIndex = '500';
    bolaEl.classList.add('reveal');
    atualizarBotoes();
    dizer('Estava aqui! 👀');
    sound.speak('A bola estava aqui!');
  }

  // ---------- Arrastar com o dedo ----------

  function limites(tam) {
    const meio = tam / 2;
    return {
      minX: -geo.left / geo.S + meio,
      maxX: (geo.W - geo.left) / geo.S - meio,
      minY: -geo.top / geo.S + meio,
      maxY: (geo.H - geo.top) / geo.S - meio,
    };
  }

  function pontoNoQuadro(e) {
    const r = palco.getBoundingClientRect();
    return {
      x: (e.clientX - r.left - geo.left) / geo.S,
      y: (e.clientY - r.top - geo.top) / geo.S,
    };
  }

  palco.addEventListener('pointerdown', (e) => {
    if (arrasto) return;
    const node = e.target.closest?.('.hide-item');
    if (!node) return;
    const p = pontoNoQuadro(e);
    if (node === bolaEl) {
      if (fase === 'procurar') { achou(); return; }
      if (fase !== 'esconder') return;
      arrasto = { node, item: bola, tam: TAM_BOLA, dx: p.x - bola.x, dy: p.y - bola.y, pointerId: e.pointerId, bola: true };
    } else {
      if (fase !== 'procurar') return;
      const id = Number(node.dataset.id);
      const i = objetos.findIndex((o) => o.id === id);
      if (i < 0) return;
      // O brinquedo agarrado passa para cima de todos.
      const [o] = objetos.splice(i, 1);
      objetos.push(o);
      objetos.forEach((ob, k) => { nodes.get(ob.id).style.zIndex = String(10 + k); });
      arrasto = { node, item: o, tam: TAM_OBJETO, dx: p.x - o.x, dy: p.y - o.y, pointerId: e.pointerId, bola: false };
    }
    e.preventDefault();
    node.setPointerCapture?.(e.pointerId);
    node.classList.add('dragging');
    sound.play('tap');
  });

  palco.addEventListener('pointermove', (e) => {
    if (!arrasto || e.pointerId !== arrasto.pointerId) return;
    e.preventDefault();
    const p = pontoNoQuadro(e);
    const lim = limites(arrasto.tam);
    arrasto.item.x = Math.min(lim.maxX, Math.max(lim.minX, p.x - arrasto.dx));
    arrasto.item.y = Math.min(lim.maxY, Math.max(lim.minY, p.y - arrasto.dy));
    colocar(arrasto.node, arrasto.item, arrasto.tam);
  });

  function largar(e) {
    if (!arrasto || e.pointerId !== arrasto.pointerId) return;
    const { node, bola: eBola } = arrasto;
    node.classList.remove('dragging');
    arrasto = null;
    if (eBola) {
      if (bolaNoQuadro(bola)) {
        bola = pousarBola(bola);
        sound.play('p1');
        dizer('Boa! Agora carrega em Iniciar ▶️');
      } else {
        // Largou fora do quadro: a bola volta para o sítio dela.
        bola = { ...inicioBola };
        dizer('Põe a bola em cima dos brinquedos 👆');
      }
      colocar(bolaEl, bola, TAM_BOLA);
      atualizarBotoes();
      return;
    }
    if (fase !== 'procurar') return;
    mexidas++;
    sound.play('p2');
    if (encontrou(bola, objetos)) achou();
    else if (parteVisivel(bola, objetos) > 0.08 && mexidas > 0) dizer('Estás quase! 👀');
    else if (mexidas === 1) dizer('Continua a tirar brinquedos 🧸');
  }
  palco.addEventListener('pointerup', largar);
  palco.addEventListener('pointercancel', largar);

  const observador = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => { if (!arrasto) desenhar(); }) : null;
  observador?.observe(palco);

  novaRonda();
  return () => {
    timers.forEach(clearTimeout);
    observador?.disconnect();
    sound.stopSpeaking();
  };
}
