import { gerarSequencia, NIVEL_MAX } from './logic.js';

const SEGUIDAS_PARA_SUBIR = 3;

export function mount(root, { sound, celebrate, el }) {
  let nivel = 1;
  let seguidas = 0;
  let estrelas = 0;
  let atual = null;
  let bloqueado = false;
  let timer = null;

  const contador = el('span', { class: 'stars-box' });
  const nivelEl = el('span', { class: 'stars-box level-box' });
  const pergunta = el('p', { class: 'message' }, 'O que vem a seguir?');
  const fila = el('div', { class: 'seq-row' });
  const opcoesEl = el('div', { class: 'seq-options' });
  const saltarBtn = el('button', { class: 'pill-btn', onclick: () => { sound.play('tap'); nova(); } }, '⏭️ Outra');

  root.replaceChildren(
    el('div', { class: 'play seq' },
      el('div', { class: 'scoreboard' }, contador, nivelEl),
      pergunta,
      el('div', { class: 'seq-stage' }, fila),
      opcoesEl,
      el('div', { class: 'actions' }, saltarBtn),
    ),
  );

  function atualizarTopo() {
    contador.textContent = `⭐ ${estrelas}`;
    nivelEl.textContent = `Nível ${nivel}`;
  }

  function nova() {
    clearTimeout(timer);
    bloqueado = false;
    atual = gerarSequencia(nivel);
    pergunta.textContent = 'O que vem a seguir?';
    pergunta.className = 'message';
    fila.replaceChildren(
      ...atual.mostrados.map((s, i) => el('span', { class: 'seq-item', style: `animation-delay:${i * 60}ms` }, s)),
      el('span', { class: 'seq-item seq-gap' }, '❓'),
    );
    opcoesEl.replaceChildren(...atual.opcoes.map((s) => el('button', {
      class: 'seq-option',
      'aria-label': `Escolher ${s}`,
      onclick: (e) => escolher(s, e.currentTarget),
    }, s)));
    atualizarTopo();
  }

  function escolher(simbolo, botao) {
    if (bloqueado) return;
    if (simbolo === atual.resposta) {
      bloqueado = true;
      const gap = fila.querySelector('.seq-gap');
      gap.textContent = simbolo;
      gap.classList.add('filled');
      botao.classList.add('right');
      estrelas++;
      seguidas++;
      let subiu = false;
      if (seguidas >= SEGUIDAS_PARA_SUBIR && nivel < NIVEL_MAX) {
        nivel++;
        seguidas = 0;
        subiu = true;
      }
      atualizarTopo();
      pergunta.textContent = subiu ? `Muito bem! Subiste para o nível ${nivel} 🚀` : 'Muito bem! ⭐';
      pergunta.className = 'message good';
      sound.play('win');
      if (subiu || estrelas % 5 === 0) celebrate();
      timer = setTimeout(nova, subiu ? 2200 : 1400);
    } else {
      seguidas = 0;
      botao.classList.remove('shake');
      void botao.offsetWidth; // reinicia a animação
      botao.classList.add('shake', 'wrong');
      botao.disabled = true;
      pergunta.textContent = 'Ainda não. Olha bem para a sequência 👀';
      pergunta.className = 'message';
      sound.play('oops');
    }
  }

  nova();
  return () => clearTimeout(timer);
}
