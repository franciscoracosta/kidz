// Adivinha a palavra (sem DOM): mostram-se 2 letras, depois mais 2, até a
// criança adivinhar. Usa as palavras com desenho do jogo "Diz uma Palavra".
import { LETRAS, normalizar } from '../palavras/logic.js';

// Palavras cujo desenho não ajuda a adivinhar.
const FORA = new Set(['nuca', 'bicho', 'zero', 'quatro', 'quadrado', 'número', 'tosta', 'escova']);

/** Palavras com 4 ou mais letras, sem repetidas. */
export const PALAVRAS = (() => {
  const vistas = new Map();
  for (const lista of Object.values(LETRAS)) {
    for (const e of lista) {
      if (e.palavra.length >= 4 && !FORA.has(e.palavra) && !vistas.has(e.palavra)) vistas.set(e.palavra, e);
    }
  }
  return [...vistas.values()];
})();

/** Escolhe uma palavra diferente da anterior. */
export function novaPalavra(anterior = null, random = Math.random) {
  const possiveis = PALAVRAS.filter((p) => p !== anterior);
  return possiveis[Math.floor(random() * possiveis.length)];
}

/** Quantas letras se mostram depois de carregar em "mais" (de 2 em 2, sem passar o tamanho). */
export function maisLetras(mostradas, palavra) {
  return Math.min(mostradas + 2, palavra.length);
}

/** As letras para os quadrados: as escondidas ficam null. */
export function quadrados(palavra, mostradas) {
  return [...palavra.toUpperCase()].map((l, i) => (i < mostradas ? l : null));
}

/** Alguma das coisas que o reconhecimento de voz ouviu é a palavra? */
export function acertou(transcricoes, palavra) {
  const alvo = normalizar(palavra);
  return transcricoes.some((t) =>
    normalizar(t).split(/[^a-z]+/).includes(alvo));
}

/** Estrelas: mais estrelas quando se adivinha com menos letras. */
export function estrelasPara(mostradas, palavra) {
  if (mostradas <= 2) return 3;
  if (mostradas < palavra.length) return 2;
  return 1;
}
