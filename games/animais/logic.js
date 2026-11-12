// Sons dos animais (sem DOM). `som` é o que a voz diz e o que aparece no balão.

export const ANIMAIS = [
  { nome: 'vaca', artigo: 'A', emoji: '🐮', som: 'Muuuu!' },
  { nome: 'cão', artigo: 'O', emoji: '🐶', som: 'Ão ão!' },
  { nome: 'gato', artigo: 'O', emoji: '🐱', som: 'Miau!' },
  { nome: 'pato', artigo: 'O', emoji: '🦆', som: 'Quá quá!' },
  { nome: 'galo', artigo: 'O', emoji: '🐓', som: 'Cócorócócó!' },
  { nome: 'ovelha', artigo: 'A', emoji: '🐑', som: 'Mééééé!' },
  { nome: 'porco', artigo: 'O', emoji: '🐷', som: 'Óinc óinc!' },
  { nome: 'cavalo', artigo: 'O', emoji: '🐴', som: 'Hiiiihihi!' },
  { nome: 'leão', artigo: 'O', emoji: '🦁', som: 'Roaaar!' },
  { nome: 'rã', artigo: 'A', emoji: '🐸', som: 'Croac croac!' },
  { nome: 'burro', artigo: 'O', emoji: '🫏', som: 'Ió ió!' },
  { nome: 'abelha', artigo: 'A', emoji: '🐝', som: 'Bzzzzz!' },
  { nome: 'mocho', artigo: 'O', emoji: '🦉', som: 'Uuu uuu!' },
  { nome: 'galinha', artigo: 'A', emoji: '🐔', som: 'Có có có!' },
  { nome: 'pinto', artigo: 'O', emoji: '🐤', som: 'Piu piu!' },
  { nome: 'lobo', artigo: 'O', emoji: '🐺', som: 'Auuuuuu!' },
];

function baralhar(lista, random) {
  const a = lista.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Uma ronda: o animal certo e `quantos` animais para escolher (o certo incluído).
 * Evita repetir o animal da ronda anterior.
 */
export function novaRonda(quantos = 3, anterior = null, random = Math.random) {
  const possiveis = ANIMAIS.filter((a) => a !== anterior);
  const certo = possiveis[Math.floor(random() * possiveis.length)];
  const outros = baralhar(ANIMAIS.filter((a) => a !== certo), random).slice(0, quantos - 1);
  return { certo, opcoes: baralhar([certo, ...outros], random) };
}

export const frase = (a) => `${a.artigo} ${a.nome} faz ${a.som}`;
