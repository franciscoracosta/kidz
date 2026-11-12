import { novaRonda, frase } from './logic.js';

export function mount(root, { sound, celebrate, el }) {
  let ronda = null;
  let estrelas = 0;
  let certos = 0;
  let bloqueado = false;
  let timer = null;
  let vozTimer = null;

  const contador = el('span', { class: 'stars-box' });
  const pergunta = el('p', { class: 'message' });
  const balao = el('button', {
    class: 'bubble', 'aria-label': 'Ouvir outra vez',
    onclick: () => ouvir(),
  });
  const opcoesEl = el('div', { class: 'animal-options' });
  const ouvirBtn = el('button', { class: 'pill-btn primary', onclick: () => ouvir() }, '🔊 Ouvir');
  const outroBtn = el('button', { class: 'pill-btn', onclick: () => { sound.play('tap'); nova(); } }, '⏭️ Outro');

  root.replaceChildren(
    el('div', { class: 'play animals' },
      el('div', { class: 'scoreboard' }, contador),
      pergunta,
      balao,
      opcoesEl,
      el('div', { class: 'actions' }, ouvirBtn, outroBtn),
    ),
  );

  function ouvir() {
    balao.classList.remove('wiggle');
    void balao.offsetWidth;
    balao.classList.add('wiggle');
    sound.speak(ronda.certo.som, { rate: 0.8, pitch: 1.2 });
  }

  function nova() {
    clearTimeout(timer);
    clearTimeout(vozTimer);
    bloqueado = false;
    // Começa com 3 animais e passa a 4 depois de 5 certos.
    ronda = novaRonda(certos >= 5 ? 4 : 3, ronda?.certo);
    contador.textContent = `⭐ ${estrelas}`;
    pergunta.textContent = 'Quem faz este som?';
    pergunta.className = 'message';
    balao.replaceChildren(el('span', { class: 'bubble-icon' }, '🔊'), el('span', {}, ronda.certo.som));
    opcoesEl.replaceChildren(...ronda.opcoes.map((a) => el('button', {
      class: 'animal-option',
      'aria-label': a.nome,
      onclick: (e) => escolher(a, e.currentTarget),
    }, a.emoji)));
    ouvir();
  }

  function escolher(animal, botao) {
    if (bloqueado) return;
    if (animal === ronda.certo) {
      bloqueado = true;
      estrelas++;
      certos++;
      contador.textContent = `⭐ ${estrelas}`;
      botao.classList.add('right');
      pergunta.textContent = `Muito bem! ${frase(animal)}`;
      pergunta.className = 'message good';
      sound.play('win');
      vozTimer = setTimeout(() => sound.speak(frase(animal), { rate: 0.85 }), 500);
      if (estrelas % 5 === 0) celebrate();
      timer = setTimeout(nova, 3000);
    } else {
      botao.classList.remove('shake');
      void botao.offsetWidth;
      botao.classList.add('shake', 'wrong');
      botao.disabled = true;
      pergunta.textContent = `Não, ${animal.artigo.toLowerCase()} ${animal.nome} faz ${animal.som}`;
      pergunta.className = 'message';
      sound.play('oops');
      sound.speak(`${animal.som}`, { rate: 0.8, pitch: 1.2 });
    }
  }

  nova();
  return () => { clearTimeout(timer); clearTimeout(vozTimer); sound.stopSpeaking(); };
}
