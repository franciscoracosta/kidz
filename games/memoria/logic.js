// Regras do jogo da memória (sem DOM).

export const TEMAS = [
  { nome: 'Animais', simbolos: ['🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷'] },
  { nome: 'Frutas', simbolos: ['🍎', '🍌', '🍇', '🍓', '🍒', '🍑', '🍍', '🥝', '🍉', '🍋', '🍐', '🥥'] },
  { nome: 'Transportes', simbolos: ['🚗', '🚕', '🚌', '🚒', '🚑', '🚜', '🚲', '🚀', '✈️', '🚁', '⛵', '🚂'] },
  { nome: 'Mar', simbolos: ['🐟', '🐠', '🐡', '🦈', '🐙', '🦀', '🐬', '🐳', '🦑', '🐚', '🦭', '🐢'] },
];

export const NIVEIS = [
  { id: 'facil', nome: 'Fácil', emoji: '🐣', pares: 6, colunas: 4 },
  { id: 'medio', nome: 'Médio', emoji: '🐥', pares: 8, colunas: 4 },
  { id: 'dificil', nome: 'Difícil', emoji: '🦉', pares: 10, colunas: 5 },
];

export function baralhar(lista, random = Math.random) {
  const a = lista.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Cria as cartas: `pares` símbolos do tema, cada um duas vezes, baralhadas. */
export function criarCartas(pares, tema, random = Math.random) {
  const escolhidos = baralhar(tema.simbolos, random).slice(0, pares);
  return baralhar([...escolhidos, ...escolhidos], random).map((simbolo, id) => ({ id, simbolo }));
}

/** Estrelas no fim: 3 se quase sem enganos, 1 se muitos. */
export function estrelas(jogadas, pares) {
  if (jogadas <= pares + Math.ceil(pares / 2)) return 3;
  if (jogadas <= pares * 2 + 2) return 2;
  return 1;
}
