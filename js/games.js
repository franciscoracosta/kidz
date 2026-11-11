// Lista de jogos que aparecem no ecrã inicial.
//
// Para acrescentar um jogo:
//   1. Cria a pasta games/<id>/ com um <id>.js que exporta `mount(root, ctx)`
//      (vê games/galo/galo.js como exemplo).
//   2. Acrescenta uma entrada aqui em baixo.
//   3. Acrescenta os ficheiros do jogo à lista em sw.js para funcionar offline.

export const GAMES = [
  {
    id: 'galo',
    title: 'Jogo do Galo',
    emoji: '❌⭕',
    description: 'Faz 3 em linha antes do teu amigo!',
    color: '#ff8a5b',
    tag: 'Estratégia',
    load: () => import('../games/galo/galo.js'),
  },
  {
    id: 'cinco',
    title: '5 em Linha',
    emoji: '🔴🟡',
    description: 'Junta 5 peças seguidas num tabuleiro grande.',
    color: '#5b9dff',
    tag: 'Estratégia',
    load: () => import('../games/cinco/cinco.js'),
  },
];

export function findGame(id) {
  return GAMES.find((g) => g.id === id) || null;
}
