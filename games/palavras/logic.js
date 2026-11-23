// Diz uma palavra (sem DOM): sai uma letra ou um par de letras e a criança
// diz uma palavra que comece assim. Cada início tem exemplos com emoji para
// a ajuda.

const ex = (palavra, emoji) => ({ palavra, emoji });

/** Pares de letras (sílabas do início das palavras) com exemplos. */
export const PARES = {
  BA: [ex('banana', '🍌'), ex('baleia', '🐋'), ex('balão', '🎈')],
  BI: [ex('bicicleta', '🚲'), ex('biberão', '🍼'), ex('bicho', '🐛')],
  BO: [ex('bola', '⚽'), ex('bolo', '🎂'), ex('bota', '👢')],
  CA: [ex('cavalo', '🐴'), ex('cão', '🐶'), ex('casa', '🏠')],
  CO: [ex('coelho', '🐰'), ex('coração', '❤️'), ex('cobra', '🐍')],
  DE: [ex('dedo', '☝️'), ex('dente', '🦷'), ex('dez', '🔟')],
  DI: [ex('dinossauro', '🦕'), ex('dinheiro', '💰'), ex('diamante', '💎')],
  FA: [ex('fada', '🧚'), ex('farol', '🗼'), ex('fantasma', '👻')],
  FO: [ex('foca', '🦭'), ex('fogo', '🔥'), ex('foguetão', '🚀')],
  GA: [ex('gato', '🐱'), ex('galinha', '🐔'), ex('galo', '🐓')],
  GO: [ex('golfinho', '🐬'), ex('gota', '💧'), ex('gorila', '🦍')],
  JA: [ex('janela', '🪟'), ex('jacaré', '🐊'), ex('jardim', '🌷')],
  LA: [ex('laranja', '🍊'), ex('lápis', '✏️'), ex('lagarta', '🐛')],
  LE: [ex('leão', '🦁'), ex('leite', '🥛'), ex('legumes', '🥕')],
  LI: [ex('limão', '🍋'), ex('livro', '📖'), ex('língua', '👅')],
  LU: [ex('lua', '🌙'), ex('luva', '🧤'), ex('luz', '💡')],
  MA: [ex('maçã', '🍎'), ex('macaco', '🐒'), ex('mala', '🧳')],
  ME: [ex('melancia', '🍉'), ex('mel', '🍯'), ex('meia', '🧦')],
  MO: [ex('morango', '🍓'), ex('mota', '🏍️'), ex('mochila', '🎒')],
  NA: [ex('nariz', '👃'), ex('navio', '🚢'), ex('nabo', '🥬')],
  NU: [ex('nuvem', '☁️'), ex('número', '🔢'), ex('nuca', '💆')],
  PA: [ex('pato', '🦆'), ex('pão', '🍞'), ex('palhaço', '🤡')],
  PE: [ex('peixe', '🐟'), ex('pera', '🍐'), ex('pé', '🦶')],
  PI: [ex('pinguim', '🐧'), ex('pipoca', '🍿'), ex('piano', '🎹')],
  PO: [ex('porco', '🐷'), ex('polvo', '🐙'), ex('pombo', '🕊️')],
  RA: [ex('rato', '🐭'), ex('raposa', '🦊'), ex('rã', '🐸')],
  RO: [ex('rosa', '🌹'), ex('robô', '🤖'), ex('roda', '🛞')],
  SA: [ex('sapo', '🐸'), ex('sapato', '👞'), ex('salada', '🥗')],
  SO: [ex('sol', '☀️'), ex('sopa', '🍲'), ex('sorriso', '😁')],
  TA: [ex('tartaruga', '🐢'), ex('tambor', '🥁'), ex('taça', '🏆')],
  TE: [ex('telefone', '☎️'), ex('tesoura', '✂️'), ex('tenda', '⛺')],
  TO: [ex('tomate', '🍅'), ex('touro', '🐂'), ex('tosta', '🥪')],
  VA: [ex('vaca', '🐮'), ex('vassoura', '🧹'), ex('vampiro', '🧛')],
  ZE: [ex('zebra', '🦓'), ex('zero', '0️⃣')],
};

const VOGAIS = {
  A: [ex('abelha', '🐝'), ex('árvore', '🌳'), ex('avião', '✈️')],
  E: [ex('elefante', '🐘'), ex('estrela', '⭐'), ex('escova', '🪥')],
  I: [ex('igreja', '⛪'), ex('ilha', '🏝️'), ex('iogurte', '🥛')],
  O: [ex('ovo', '🥚'), ex('óculos', '👓'), ex('ovelha', '🐑')],
  U: [ex('uva', '🍇'), ex('urso', '🐻'), ex('unicórnio', '🦄')],
  Q: [ex('queijo', '🧀'), ex('quatro', '4️⃣'), ex('quadrado', '🟥')],
};

/** Letras sozinhas: as vogais e mais umas, e as consoantes juntam os exemplos dos pares. */
export const LETRAS = (() => {
  const letras = { ...VOGAIS };
  for (const [par, exemplos] of Object.entries(PARES)) {
    (letras[par[0]] ??= []).push(...exemplos);
  }
  return letras;
})();

/** Minúsculas e sem acentos nem cedilhas: "Maçã" → "maca". */
export function normalizar(texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** A palavra começa pelo início pedido? Uma letra sozinha não conta como palavra. */
export function comecaPor(palavra, inicio) {
  const p = normalizar(palavra).replace(/[^a-z]/g, '');
  return p.length >= Math.max(2, inicio.length) && p.startsWith(normalizar(inicio));
}

/**
 * Procura, no que o reconhecimento de voz ouviu (uma ou mais alternativas),
 * uma palavra que comece pelo início pedido. Devolve a palavra ou null.
 */
export function encontrarPalavra(transcricoes, inicio) {
  for (const t of transcricoes) {
    for (const palavra of t.split(/[\s,.!?;:]+/)) {
      if (palavra && comecaPor(palavra, inicio)) return palavra.toLowerCase();
    }
  }
  return null;
}

/** Emoji de uma palavra que esteja nos exemplos, se houver. */
export function emojiDe(palavra) {
  const p = normalizar(palavra);
  for (const lista of Object.values(LETRAS)) {
    const e = lista.find((x) => normalizar(x.palavra) === p);
    if (e) return e.emoji;
  }
  return null;
}

function baralhar(lista, random) {
  const a = lista.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Uma ronda: `modo` é 'par' (duas letras) ou 'letra' (uma letra).
 * Devolve { inicio, exemplos } com 3 exemplos baralhados e sem repetir o início anterior.
 */
export function novaRonda(modo = 'par', anterior = null, random = Math.random) {
  const tabela = modo === 'letra' ? LETRAS : PARES;
  const inicios = Object.keys(tabela).filter((k) => k !== anterior);
  const inicio = inicios[Math.floor(random() * inicios.length)];
  return { inicio, exemplos: baralhar(tabela[inicio], random).slice(0, 3) };
}

/** O que a voz diz para pedir a palavra. */
export function pedido(inicio) {
  return inicio.length === 1
    ? `Diz uma palavra começada pela letra ${inicio}`
    : `Diz uma palavra começada por ${inicio.toLowerCase()}`;
}
