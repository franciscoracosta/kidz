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
  {
    id: 'pintar',
    title: 'Pintar',
    emoji: '🎨🖌️',
    description: 'Escolhe as cores e o pincel e pinta um desenho.',
    color: '#b46cf0',
    tag: 'Criatividade',
    load: () => import('../games/pintar/pintar.js'),
  },
  {
    id: 'letras',
    title: 'Letras',
    emoji: '✏️🔤',
    description: 'Aprende a escrever as letras por cima do sombreado.',
    color: '#2bb673',
    tag: 'Aprender',
    load: () => import('../games/letras/letras.js'),
  },
];

export function findGame(id) {
  return GAMES.find((g) => g.id === id) || null;
}
