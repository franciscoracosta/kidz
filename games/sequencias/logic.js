// Regras do jogo das sequências (sem DOM).

export const CONJUNTOS = [
  ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠'],
  ['🐶', '🐱', '🐰', '🐸', '🐵', '🐷'],
  ['🍎', '🍌', '🍇', '🍓', '🍊', '🥝'],
  ['⭐', '🌙', '☀️', '☁️', '⚡', '❄️'],
  ['🚗', '🚀', '🚲', '⛵', '🚂', '✈️'],
];

// Padrões por nível: as letras dizem que símbolo se repete.
export const PADROES = [
  ['AB'],
  ['AB', 'AAB', 'ABB'],
  ['AB', 'AAB', 'ABB', 'ABC', 'AABB'],
  ['ABC', 'AABB', 'ABCC', 'AABC', 'ABAC'],
];
export const NIVEL_MAX = PADROES.length;

function baralhar(lista, random) {
  const a = lista.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const pick = (lista, random) => lista[Math.floor(random() * lista.length)];

/**
 * Gera uma sequência para o nível (1 a NIVEL_MAX).
 * Devolve { padrao, mostrados, resposta, opcoes }: a criança vê `mostrados`
 * e escolhe entre `opcoes` o que vem a seguir (`resposta`).
 */
export function gerarSequencia(nivel = 1, random = Math.random) {
  const padroes = PADROES[Math.min(Math.max(nivel, 1), NIVEL_MAX) - 1];
  const padrao = pick(padroes, random);
  const conjunto = pick(CONJUNTOS, random);
  const letras = [...new Set(padrao)];
  const simbolos = baralhar(conjunto, random).slice(0, letras.length);
  const mapa = Object.fromEntries(letras.map((l, i) => [l, simbolos[i]]));

  // Pelo menos duas voltas completas do padrão e no mínimo 6 peças à vista.
  const minimo = Math.max(6, padrao.length * 2);
  const total = minimo + Math.floor(random() * padrao.length);
  const serie = Array.from({ length: total + 1 }, (_, i) => mapa[padrao[i % padrao.length]]);
  const resposta = serie.pop();

  const outros = baralhar(conjunto.filter((s) => s !== resposta), random);
  // Distratores: primeiro os que aparecem na sequência (mais difícil), depois outros.
  const naSequencia = outros.filter((s) => simbolos.includes(s));
  const fora = outros.filter((s) => !simbolos.includes(s));
  const distratores = [...naSequencia, ...fora].slice(0, 2);
  return { padrao, mostrados: serie, resposta, opcoes: baralhar([resposta, ...distratores], random) };
}
