// Regras do jogo das letras, sem DOM (testáveis em Node).

export const LETRAS = [
  ['A', 'Abelha', '🐝'], ['B', 'Bola', '⚽'], ['C', 'Cão', '🐶'], ['D', 'Dado', '🎲'],
  ['E', 'Elefante', '🐘'], ['F', 'Flor', '🌸'], ['G', 'Gato', '🐱'], ['H', 'Helicóptero', '🚁'],
  ['I', 'Iglu', '🧊'], ['J', 'Joaninha', '🐞'], ['K', 'Kiwi', '🥝'], ['L', 'Leão', '🦁'],
  ['M', 'Maçã', '🍎'], ['N', 'Nuvem', '☁️'], ['O', 'Ovo', '🥚'], ['P', 'Peixe', '🐟'],
  ['Q', 'Queijo', '🧀'], ['R', 'Rato', '🐭'], ['S', 'Sol', '☀️'], ['T', 'Tartaruga', '🐢'],
  ['U', 'Uva', '🍇'], ['V', 'Vaca', '🐮'], ['W', 'Waffle', '🧇'], ['X', 'Xilofone', '🎶'],
  ['Y', 'Ioiô', '🪀'], ['Z', 'Zebra', '🦓'],
].map(([letra, palavra, emoji]) => ({ letra, palavra, emoji }));

/** Escolhe uma letra ao calhas, diferente da atual. */
export function letraAoCalhas(atual = -1, random = Math.random) {
  let i = atual;
  while (i === atual) i = Math.floor(random() * LETRAS.length);
  return i;
}

/** Engrossa (raio > 0) ou emagrece (raio < 0) uma imagem binária quadrada de lado `n`. */
export function morfologia(img, n, raio) {
  if (!raio) return img;
  const r = Math.abs(raio);
  const engrossar = raio > 0;
  const offsets = [];
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) if (dx * dx + dy * dy <= r * r) offsets.push([dx, dy]);
  }
  const out = new Uint8Array(n * n);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      let v = engrossar ? 0 : 1;
      for (const [dx, dy] of offsets) {
        const xx = x + dx;
        const yy = y + dy;
        const on = xx >= 0 && xx < n && yy >= 0 && yy < n && img[yy * n + xx] > 0;
        if (engrossar && on) { v = 1; break; }
        if (!engrossar && !on) { v = 0; break; }
      }
      out[y * n + x] = v;
    }
  }
  return out;
}

/**
 * Compara a letra modelo com o que a criança escreveu.
 * `modelo` e `tinta` são imagens binárias de n x n (> 0 = pintado).
 * Para ser justo com dedos pequenos:
 *  - a cobertura mede o "miolo" da letra (emagrecida `miolo` pixels), não as bordas;
 *  - a tinta conta como dentro se estiver até `folga` pixels da letra.
 * Devolve { cobertura, fora }, ambos de 0 a 1.
 */
export function avaliar(modelo, tinta, n = Math.round(Math.sqrt(modelo.length)), { miolo = 0, folga = 0 } = {}) {
  const centro = morfologia(modelo, n, -miolo);
  const zona = morfologia(modelo, n, folga);
  let letra = 0;
  let coberta = 0;
  let total = 0;
  let foraDaLetra = 0;
  for (let i = 0; i < modelo.length; i++) {
    const t = tinta[i] > 0;
    if (centro[i]) { letra++; if (t) coberta++; }
    if (t) { total++; if (!zona[i]) foraDaLetra++; }
  }
  return {
    cobertura: letra ? coberta / letra : 0,
    fora: total ? foraDaLetra / total : 0,
  };
}

export const COBERTURA_MINIMA = 0.65;
export const FORA_MAXIMO = 0.3;

/** Diz se a letra está bem escrita. */
export function estaBem({ cobertura, fora }) {
  return cobertura >= COBERTURA_MINIMA && fora <= FORA_MAXIMO;
}
