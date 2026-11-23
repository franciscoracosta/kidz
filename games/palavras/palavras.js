import { novaRonda, encontrarPalavra, emojiDe, pedido } from './logic.js';

const Reconhecimento = window.SpeechRecognition || window.webkitSpeechRecognition || null;

export function mount(root, { sound, celebrate, el }) {
  let modo = null;
  let ronda = null;
  let estrelas = 0;
  let bloqueado = false;
  let timer = null;
  let rec = null;
  let micOk = !!Reconhecimento;

  function limpar() {
    clearTimeout(timer);
    if (rec) { try { rec.abort(); } catch { /* já parou */ } rec = null; }
    sound.stopSpeaking();
  }

  // ---------- Escolher uma letra ou duas ----------
  function escolherModo() {
    limpar();
    const pick = (m) => { sound.play('tap'); modo = m; jogar(); };
    root.replaceChildren(
      el('div', { class: 'setup' },
        el('h1', { class: 'setup-title' }, 'Diz uma palavra'),
        el('p', { class: 'setup-hint' }, 'Aparecem letras e tu dizes uma palavra que comece assim.'),
        el('h2', { class: 'setup-question' }, 'Quantas letras?'),
        el('div', { class: 'choice-row' },
          el('button', { class: 'big-btn easy', onclick: () => pick('letra') },
            el('span', { class: 'big-emoji word-mode' }, 'B'), 'Uma letra'),
          el('button', { class: 'big-btn hard', onclick: () => pick('par') },
            el('span', { class: 'big-emoji word-mode' }, 'BA'), 'Duas letras'),
        ),
      ),
    );
  }

  // ---------- Jogo ----------
  let contador, mensagem, tile, resultado, micBtn;

  function jogar() {
    contador = el('span', { class: 'stars-box' });
    mensagem = el('p', { class: 'message' });
    tile = el('button', { class: 'word-tile', 'aria-label': 'Ouvir outra vez', onclick: () => pedir() });
    resultado = el('div', { class: 'word-result' });
    micBtn = el('button', { class: 'pill-btn primary mic-btn', onclick: () => ouvirCrianca() }, '🎤 Falar');
    micBtn.hidden = !micOk;
    root.replaceChildren(
      el('div', { class: 'play words' },
        el('div', { class: 'scoreboard' },
          contador,
          el('button', { class: 'pill-btn small', onclick: () => { sound.play('tap'); escolherModo(); } }, '🔁 Mudar'),
        ),
        mensagem,
        el('div', { class: 'word-stage' }, tile, resultado),
        el('div', { class: 'actions' },
          micBtn,
          el('button', { class: 'pill-btn', onclick: () => jaDisse() }, '👍 Já disse!'),
          el('button', { class: 'pill-btn', onclick: () => ajuda() }, '💡 Ajuda'),
          el('button', { class: 'pill-btn', onclick: () => { sound.play('tap'); nova(); } }, '⏭️ Outra'),
        ),
      ),
    );
    nova();
  }

  function pedir() {
    if (!ronda) return;
    tile.classList.remove('wiggle');
    void tile.offsetWidth;
    tile.classList.add('wiggle');
    sound.speak(pedido(ronda.inicio), { rate: 0.85 });
  }

  function nova() {
    limpar();
    bloqueado = false;
    ronda = novaRonda(modo, ronda?.inicio);
    contador.textContent = `⭐ ${estrelas}`;
    mensagem.textContent = micOk
      ? 'Carrega no 🎤 e diz uma palavra começada por…'
      : 'Diz uma palavra começada por…';
    mensagem.className = 'message';
    tile.className = 'word-tile';
    tile.replaceChildren(...[...ronda.inicio].map((l, i) =>
      el('span', { class: 'word-letter', style: `animation-delay:${i * 0.12}s` }, l)));
    resultado.replaceChildren();
    pararMic();
    pedir();
  }

  function marcarPalavra(palavra) {
    // Destaca o início pedido dentro da palavra: "MAcaco".
    const n = ronda.inicio.length;
    return el('span', { class: 'word-text' }, el('strong', {}, palavra.slice(0, n)), palavra.slice(n));
  }

  function acertou(palavra) {
    bloqueado = true;
    pararMic();
    estrelas++;
    contador.textContent = `⭐ ${estrelas}`;
    tile.classList.add('right');
    mensagem.textContent = 'Muito bem!';
    mensagem.className = 'message good';
    if (palavra) {
      const emoji = emojiDe(palavra);
      resultado.replaceChildren(el('div', { class: 'word-heard' },
        emoji ? el('span', { class: 'word-emoji' }, emoji) : null, marcarPalavra(palavra)));
    }
    sound.play('win');
    timer = setTimeout(() => {
      sound.speak(palavra ? `Muito bem! ${palavra}!` : 'Muito bem!', { rate: 0.9 });
      timer = setTimeout(nova, palavra ? 2800 : 2000);
    }, 500);
    if (estrelas % 5 === 0) celebrate();
  }

  function jaDisse() {
    if (bloqueado) return;
    acertou(null);
  }

  function ajuda() {
    if (bloqueado) return;
    sound.play('tap');
    resultado.replaceChildren(el('div', { class: 'word-examples' },
      ronda.exemplos.map((e) => el('button', {
        class: 'word-example',
        onclick: () => sound.speak(e.palavra, { rate: 0.85 }),
      }, el('span', { class: 'word-emoji' }, e.emoji), marcarPalavra(e.palavra)))));
    sound.speak(`Por exemplo: ${ronda.exemplos.map((e) => e.palavra).join(', ')}`, { rate: 0.85 });
  }

  // ---------- Microfone ----------
  function pararMic() {
    if (rec) { try { rec.abort(); } catch { /* já parou */ } rec = null; }
    if (micBtn) {
      micBtn.textContent = '🎤 Falar';
      micBtn.classList.remove('pulse', 'listening');
    }
  }

  function semMicrofone() {
    micOk = false;
    pararMic();
    micBtn.hidden = true;
    mensagem.textContent = 'Não consigo usar o microfone. Diz em voz alta e carrega em 👍 Já disse!';
    mensagem.className = 'message';
  }

  function ouvirCrianca() {
    if (bloqueado || !micOk) return;
    if (rec) { pararMic(); return; }
    sound.stopSpeaking();
    const inicio = ronda.inicio;
    let r;
    try {
      r = new Reconhecimento();
    } catch {
      semMicrofone();
      return;
    }
    rec = r;
    r.lang = 'pt-PT';
    r.interimResults = false;
    r.continuous = false;
    r.maxAlternatives = 5;
    r.onresult = (e) => {
      if (rec !== r) return;
      const alternativas = [...e.results[0]].map((a) => a.transcript);
      const palavra = encontrarPalavra(alternativas, inicio);
      if (palavra) {
        acertou(palavra);
      } else {
        const ouvi = (alternativas[0] || '').trim();
        mensagem.textContent = ouvi
          ? `Ouvi «${ouvi}». Não começa por ${inicio}. Tenta outra vez!`
          : 'Não percebi. Tenta outra vez!';
        mensagem.className = 'message';
        tile.classList.remove('shake');
        void tile.offsetWidth;
        tile.classList.add('shake');
        sound.play('oops');
        timer = setTimeout(() => sound.speak('Tenta outra vez!', { rate: 0.9 }), 300);
      }
    };
    r.onerror = (e) => {
      if (rec !== r) return;
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed' || e.error === 'audio-capture') {
        semMicrofone();
      } else if (e.error === 'no-speech') {
        mensagem.textContent = 'Não ouvi nada. Carrega no 🎤 e fala mais alto!';
        mensagem.className = 'message';
      }
    };
    r.onend = () => {
      if (rec === r) pararMic();
    };
    try {
      r.start();
    } catch {
      semMicrofone();
      return;
    }
    micBtn.textContent = '👂 A ouvir…';
    micBtn.classList.add('pulse', 'listening');
    mensagem.textContent = 'Estou a ouvir…';
    mensagem.className = 'message';
  }

  escolherModo();
  return limpar;
}
