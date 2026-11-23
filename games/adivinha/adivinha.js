import { novaPalavra, maisLetras, quadrados, acertou, estrelasPara } from './logic.js';

const Reconhecimento = window.SpeechRecognition || window.webkitSpeechRecognition || null;

export function mount(root, { sound, celebrate, el }) {
  let palavra = null;
  let mostradas = 2;
  let estrelas = 0;
  let ganhas = 0;
  let acabou = false;
  let timer = null;
  let rec = null;
  let micOk = !!Reconhecimento;

  const contador = el('span', { class: 'stars-box' });
  const mensagem = el('p', { class: 'message' });
  const fila = el('div', { class: 'guess-row' });
  const desenho = el('div', { class: 'guess-picture' });
  const micBtn = el('button', { class: 'pill-btn primary mic-btn', onclick: () => ouvir() }, '🎤 Adivinhar');
  const maisBtn = el('button', { class: 'pill-btn', onclick: () => mais() }, '➕ Mais uma letra');
  const acerteiBtn = el('button', { class: 'pill-btn', onclick: () => ganhar() }, '👍 Acertei!');
  const verBtn = el('button', { class: 'pill-btn', onclick: () => ver() }, '👀 Ver');
  const outraBtn = el('button', { class: 'pill-btn', onclick: () => { sound.play('tap'); nova(); } }, '⏭️ Outra');
  micBtn.hidden = !micOk;

  root.replaceChildren(
    el('div', { class: 'play guess' },
      el('div', { class: 'scoreboard' }, contador),
      mensagem,
      el('div', { class: 'word-stage' }, fila, desenho),
      el('div', { class: 'actions' }, micBtn, maisBtn, acerteiBtn, verBtn, outraBtn),
    ),
  );

  function desenhar(animar = 0) {
    const qs = quadrados(palavra.palavra, mostradas);
    fila.style.setProperty('--n', qs.length);
    fila.replaceChildren(...qs.map((l, i) => el('span', {
      class: `guess-tile${l ? '' : ' hidden'}${l && i >= animar ? ' new' : ''}`,
    }, l || '?')));
  }

  function botoes() {
    maisBtn.hidden = acabou || mostradas >= palavra.palavra.length;
    acerteiBtn.hidden = acabou;
    verBtn.hidden = acabou;
    micBtn.hidden = acabou || !micOk;
    outraBtn.classList.toggle('pulse', acabou);
  }

  function nova() {
    limpar();
    acabou = false;
    palavra = novaPalavra(palavra);
    mostradas = 2;
    contador.textContent = `⭐ ${estrelas}`;
    mensagem.textContent = 'Que palavra é?';
    mensagem.className = 'message';
    desenho.replaceChildren();
    desenhar(0);
    botoes();
    sound.speak('Que palavra é?', { rate: 0.9 });
  }

  function mais() {
    if (acabou) return;
    sound.play('tap');
    const antes = mostradas;
    mostradas = maisLetras(mostradas, palavra.palavra);
    desenhar(antes);
    botoes();
    mensagem.textContent = mostradas >= palavra.palavra.length ? 'Já tens as letras todas!' : 'E agora, já sabes?';
    mensagem.className = 'message';
  }

  function mostrarTudo() {
    const antes = mostradas;
    mostradas = palavra.palavra.length;
    desenhar(antes);
    desenho.replaceChildren(el('span', { class: 'word-emoji' }, palavra.emoji),
      el('span', { class: 'word-text' }, palavra.palavra));
  }

  function ganhar() {
    if (acabou) return;
    pararMic();
    acabou = true;
    const ganho = estrelasPara(mostradas, palavra.palavra);
    estrelas += ganho;
    ganhas++;
    contador.textContent = `⭐ ${estrelas}`;
    mostrarTudo();
    fila.classList.add('right-row');
    mensagem.textContent = `Muito bem! ${'⭐'.repeat(ganho)}`;
    mensagem.className = 'message good';
    sound.play('win');
    timer = setTimeout(() => sound.speak(`Muito bem! ${palavra.palavra}!`, { rate: 0.9 }), 500);
    if (ganhas % 3 === 0 || ganho === 3) celebrate();
    botoes();
  }

  function ver() {
    if (acabou) return;
    pararMic();
    acabou = true;
    sound.play('tap');
    mostrarTudo();
    mensagem.textContent = 'Era esta! Vamos a outra?';
    mensagem.className = 'message';
    sound.speak(palavra.palavra, { rate: 0.85 });
    botoes();
  }

  // ---------- Microfone ----------
  function pararMic() {
    if (rec) { try { rec.abort(); } catch { /* já parou */ } rec = null; }
    micBtn.textContent = '🎤 Adivinhar';
    micBtn.classList.remove('pulse', 'listening');
  }

  function limpar() {
    clearTimeout(timer);
    pararMic();
    fila.classList.remove('right-row');
    sound.stopSpeaking();
  }

  function semMicrofone() {
    micOk = false;
    pararMic();
    botoes();
    mensagem.textContent = 'Não consigo usar o microfone. Diz em voz alta e carrega em 👍 Acertei!';
    mensagem.className = 'message';
  }

  function ouvir() {
    if (acabou || !micOk) return;
    if (rec) { pararMic(); return; }
    sound.stopSpeaking();
    let r;
    try { r = new Reconhecimento(); } catch { semMicrofone(); return; }
    rec = r;
    const alvo = palavra;
    r.lang = 'pt-PT';
    r.interimResults = false;
    r.continuous = false;
    r.maxAlternatives = 5;
    r.onresult = (e) => {
      if (rec !== r || palavra !== alvo) return;
      const alternativas = [...e.results[0]].map((a) => a.transcript);
      if (acertou(alternativas, alvo.palavra)) {
        ganhar();
      } else {
        const ouvi = (alternativas[0] || '').trim();
        mensagem.textContent = ouvi ? `Ouvi «${ouvi}». Não é essa! Tenta outra vez.` : 'Não percebi. Tenta outra vez!';
        mensagem.className = 'message';
        fila.classList.remove('shake');
        void fila.offsetWidth;
        fila.classList.add('shake');
        sound.play('oops');
      }
    };
    r.onerror = (e) => {
      if (rec !== r) return;
      if (['not-allowed', 'service-not-allowed', 'audio-capture'].includes(e.error)) semMicrofone();
      else if (e.error === 'no-speech') mensagem.textContent = 'Não ouvi nada. Carrega no 🎤 e fala mais alto!';
    };
    r.onend = () => { if (rec === r) pararMic(); };
    try { r.start(); } catch { semMicrofone(); return; }
    micBtn.textContent = '👂 A ouvir…';
    micBtn.classList.add('pulse', 'listening');
    mensagem.textContent = 'Estou a ouvir…';
    mensagem.className = 'message';
  }

  nova();
  return limpar;
}
