// Regras do jogo das setas diferentes (sem DOM).
//
// Aparece uma grelha de setas todas a apontar para o mesmo lado, menos
// uma (ou duas) que apontam para outro lado. A criança toca nas diferentes.

// Cores das setas (uma por ronda, todas iguais, para só a direção contar).
export const CORES = ['#ff6f91', '#5b9dff', '#2bb673', '#f5a623', '#b46cf0', '#3cb4c4', '#ff8a5b'];

// Níveis: tamanho da grelha, quantas setas diferentes e quanto rodam
// (180 = ao contrário, 90 = de lado, 45 = só um bocadinho).
export const NIVEIS = [
  { lado: 3, diferentes: 1, rodar: [180] },
  { lado: 3, diferentes: 1, rodar: [90, 180] },
  { lado: 4, diferentes: 1, rodar: [90, 180] },
  { lado: 4, diferentes: 2, rodar: [90, 180] },
  { lado: 5, diferentes: 1, rodar: [90] },
  { lado: 5, diferentes: 2, rodar: [45, 90] },
  { lado: 6, diferentes: 2, rodar: [45] },
];
export const NIVEL_MAX = NIVEIS.length;

const pick = (lista, random) => lista[Math.floor(random() * lista.length)];

/**
 * Cria uma ronda do nível pedido.
 * Devolve { lado, setas: [{ id, angulo, diferente }], diferentes, cor }.
 * Os ângulos estão em graus, 0 = para a direita, a rodar no sentido do relógio.
 */
export function gerarRonda(nivel, random = Math.random) {
  const cfg = NIVEIS[Math.min(Math.max(nivel, 1), NIVEL_MAX) - 1];
  const total = cfg.lado * cfg.lado;
  // As setas "normais" apontam para um dos 4 lados (mais fácil de ver).
  const base = pick([0, 90, 180, 270], random);
  const rodar = pick(cfg.rodar, random) * (random() < 0.5 ? 1 : -1);
  const outro = (base + rodar + 360) % 360;

  const posicoes = new Set();
  while (posicoes.size < cfg.diferentes) posicoes.add(Math.floor(random() * total));

  const setas = Array.from({ length: total }, (_, id) => {
    const diferente = posicoes.has(id);
    return { id, angulo: diferente ? outro : base, diferente };
  });
  return { lado: cfg.lado, setas, diferentes: cfg.diferentes, cor: pick(CORES, random) };
}

/** Nome do lado para onde aponta um ângulo, para dizer em voz alta. */
export function nomeDirecao(angulo) {
  const nomes = {
    0: 'para a direita', 45: 'para baixo e para a direita', 90: 'para baixo',
    135: 'para baixo e para a esquerda', 180: 'para a esquerda', 225: 'para cima e para a esquerda',
    270: 'para cima', 315: 'para cima e para a direita',
  };
  return nomes[((angulo % 360) + 360) % 360] || '';
}
