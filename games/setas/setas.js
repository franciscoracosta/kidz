import { gerarRonda, NIVEL_MAX, nomeDirecao } from './logic.js';

const SEGUIDAS_PARA_SUBIR = 3;
const NS = 'http://www.w3.org/2000/svg';

/** Desenha uma seta grossa (SVG) a apontar para a direita; roda-se com CSS. */
function desenharSeta(cor) {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('aria-hidden', 'true');
  const p = document.createElementNS(NS, 'path');
  p.setAttribute('d', 'M14 40 H54 V20 L88 50 L54 80 V60 H14 Z');
  p.setAttribute('fill', cor);
  p.setAttribute('stroke', 'rgba(59,42,85,0.35)');
  p.setAttribute('stroke-width', '3');
  p.setAttribute('stroke-linejoin', 'round');
  svg.append(p);
  return svg;
}

export function mount(root, { sound, celebrate, el }) {
  let nivel = 1;
  let seguidas = 0;
  let estrelas = 0;
  let enganos = 0;
  let encontradas = 0;
  let ronda = null;
  let bloqueado = false;
  let timer = null;

  const contador = el('span', { class: 'stars-box' });
  const nivelEl = el('span', { class: 'stars-box level-box' });
  const mensagem = el('p', { class: 'message' });
  const grelha = el('div', { class: 'arrows-grid' });
  const saltarBtn = el('button', { class: 'pill-btn', onclick: () => { sound.play('tap'); nova(); } }, '⏭️ Outra');
  const ouvirBtn = el('button', { class: 'pill-btn', onclick: () => { sound.play('tap'); dizerPergunta(); } }, '🔊 Ouvir');

  root.replaceChildren(
    el('div', { class: 'play arrows' },
      el('div', { class: 'scoreboard' }, contador, nivelEl),
      mensagem,
      el('div', { class: 'board-wrap' }, grelha),
      el('div', { class: 'actions' }, ouvirBtn, saltarBtn),
    ),
  );

  function atualizarTopo() {
    contador.textContent = `⭐ ${estrelas}`;
    nivelEl.textContent = `Nível ${nivel}`;
  }

  function textoPergunta() {
    return ronda.diferentes === 1
      ? 'Encontra a seta diferente!'
      : `Encontra as ${ronda.diferentes} setas diferentes!`;
  }

  function dizerPergunta() {
    sound.speak(textoPergunta());
  }

  function nova() {
    clearTimeout(timer);
    bloqueado = false;
    enganos = 0;
    encontradas = 0;
    ronda = gerarRonda(nivel);
    mensagem.textContent = `${textoPergunta()} 👀`;
    mensagem.className = 'message';
    grelha.style.setProperty('--lado', ronda.lado);
    grelha.replaceChildren(...ronda.setas.map((s, i) => {
      const b = el('button', {
        class: 'arrow-cell',
        style: `--rot:${s.angulo}deg;animation-delay:${i * 25}ms`,
        'aria-label': `Seta ${nomeDirecao(s.angulo)}`,
        onclick: () => tocar(s, b),
      });
      b.append(desenharSeta(ronda.cor));
      return b;
    }));
    atualizarTopo();
  }

  function tocar(seta, botao) {
    if (bloqueado || botao.disabled) return;
    if (seta.diferente) {
      botao.disabled = true;
      botao.classList.add('found');
      encontradas++;
      if (encontradas < ronda.diferentes) {
        sound.play('p1');
        mensagem.textContent = 'Boa! Falta mais uma 🔍';
        mensagem.className = 'message good';
        return;
      }
      ganhar();
    } else {
      enganos++;
      seguidas = 0;
      botao.classList.remove('shake');
      void botao.offsetWidth; // reinicia a animação
      botao.classList.add('shake');
      mensagem.textContent = 'Essa é igual às outras. Procura outra vez 👀';
      mensagem.className = 'message';
      sound.play('oops');
    }
  }

  function ganhar() {
    bloqueado = true;
    estrelas++;
    if (enganos === 0) seguidas++;
    let subiu = false;
    if (seguidas >= SEGUIDAS_PARA_SUBIR && nivel < NIVEL_MAX) {
      nivel++;
      seguidas = 0;
      subiu = true;
    }
    atualizarTopo();
    // As setas normais desvanecem para se ver bem as diferentes.
    for (const b of grelha.children) if (!b.classList.contains('found')) b.classList.add('dim');
    mensagem.textContent = subiu ? `Muito bem! Subiste para o nível ${nivel} 🚀` : 'Muito bem! ⭐';
    mensagem.className = 'message good';
    sound.play('win');
    if (subiu) sound.speak(`Muito bem! Nível ${nivel}!`);
    if (subiu || estrelas % 5 === 0) celebrate();
    timer = setTimeout(nova, subiu ? 2400 : 1500);
  }

  nova();
  return () => { clearTimeout(timer); sound.stopSpeaking(); };
}
