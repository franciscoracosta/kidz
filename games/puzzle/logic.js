// Regras do Puzzle (sem DOM).
//
// O desenho é um quadrado cortado em `n` x `n` peças. Cada lado de uma peça
// é liso (na borda), tem um "dente" para fora (+1) ou um "buraco" para dentro
// (-1). Duas peças vizinhas encaixam: onde uma tem dente a outra tem buraco.

export const TAMANHOS = [
  { n: 2, nome: '4 peças', emoji: '🐣' },
  { n: 3, nome: '9 peças', emoji: '🐥' },
  { n: 4, nome: '16 peças', emoji: '🐔' },
  { n: 5, nome: '25 peças', emoji: '🦊' },
  { n: 6, nome: '36 peças', emoji: '🦁' },
];

/** Quanto o dente sai para fora da peça (em fração do lado da peça). */
export const DENTE = 0.3;

/**
 * Formas das peças: lista de `n*n` objetos { top, right, bottom, left },
 * pela ordem linha a linha.
 */
export function gerarFormas(n, random = Math.random) {
  const sinal = () => (random() < 0.5 ? 1 : -1);
  // horiz[r][c]: lado entre a peça (r-1, c) e a peça (r, c). +1 = dente para baixo.
  const horiz = Array.from({ length: n + 1 }, (_, r) =>
    Array.from({ length: n }, () => (r === 0 || r === n ? 0 : sinal())));
  // vert[r][c]: lado entre a peça (r, c-1) e a peça (r, c). +1 = dente para a direita.
  const vert = Array.from({ length: n }, () =>
    Array.from({ length: n + 1 }, (_, c) => (c === 0 || c === n ? 0 : sinal())));
  const formas = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      formas.push({
        top: -horiz[r][c],
        right: vert[r][c + 1],
        bottom: horiz[r + 1][c],
        left: -vert[r][c],
      });
    }
  }
  // Tira os -0 (para as comparações ficarem simples).
  return formas.map((f) => Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v || 0])));
}

// Um lado com dente, desenhado de (0,0) a (1,0). O y é "para fora da peça".
// Cada linha: pontos de controlo e ponto final de uma curva.
const CURVA = [
  [[0.36, 0], [0.42, 0.04], [0.39, 0.1]],
  [[0.34, 0.21], [0.41, 0.3], [0.5, 0.3]],
  [[0.59, 0.3], [0.66, 0.21], [0.61, 0.1]],
  [[0.58, 0.04], [0.64, 0], [1, 0]],
];

/**
 * Contorno de uma peça como lista de comandos [['M', x, y], ['L', x, y],
 * ['C', x1, y1, x2, y2, x, y], ...], com a peça de lado `s` a começar em (0,0).
 * Serve para o canvas (Path2D) e para os testes.
 */
export function contorno(forma, s) {
  const cmds = [['M', 0, 0]];
  const lados = [
    { a: [0, 0], b: [s, 0], v: forma.top },
    { a: [s, 0], b: [s, s], v: forma.right },
    { a: [s, s], b: [0, s], v: forma.bottom },
    { a: [0, s], b: [0, 0], v: forma.left },
  ];
  for (const { a, b, v } of lados) {
    if (!v) {
      cmds.push(['L', b[0], b[1]]);
      continue;
    }
    const d = [(b[0] - a[0]) / s, (b[1] - a[1]) / s];
    // Para fora da peça (andamos no sentido dos ponteiros do relógio).
    const fora = [d[1] * v, -d[0] * v];
    const ponto = ([t, y]) => [a[0] + d[0] * t * s + fora[0] * y * s, a[1] + d[1] * t * s + fora[1] * y * s];
    for (const [c1, c2, fim] of CURVA) cmds.push(['C', ...ponto(c1), ...ponto(c2), ...ponto(fim)]);
  }
  return cmds;
}

/** Está perto o suficiente do sítio certo para encaixar? */
export function encaixa(pos, alvo, lado, folga = 0.4) {
  return Math.hypot(pos.x - alvo.x, pos.y - alvo.y) <= lado * folga;
}

export function baralhar(lista, random = Math.random) {
  const a = lista.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Espalha `total` peças de lado `lado` dentro de uma zona { x, y, w, h }.
 * Usa uma grelha com um pouco de desalinho para as peças não ficarem todas
 * umas por cima das outras. Devolve a posição do canto de cada peça.
 */
export function espalhar(total, zona, lado, random = Math.random) {
  const w = Math.max(zona.w - lado, 0);
  const h = Math.max(zona.h - lado, 0);
  // Quantas colunas e linhas, mantendo as casas o mais quadradas possível.
  let cols = Math.max(1, Math.round(Math.sqrt((total * (w + lado)) / Math.max(h + lado, 1))));
  cols = Math.min(cols, total);
  const linhas = Math.ceil(total / cols);
  const passoX = cols > 1 ? w / (cols - 1) : 0;
  const passoY = linhas > 1 ? h / (linhas - 1) : 0;
  const casas = [];
  for (let i = 0; i < cols * linhas; i++) casas.push(i);
  return baralhar(casas, random).slice(0, total).map((i) => {
    const c = i % cols;
    const r = Math.floor(i / cols);
    const jx = (random() - 0.5) * Math.min(passoX, lado) * 0.4;
    const jy = (random() - 0.5) * Math.min(passoY, lado) * 0.4;
    return {
      x: zona.x + Math.min(Math.max((cols > 1 ? c * passoX : w / 2) + jx, 0), w),
      y: zona.y + Math.min(Math.max((linhas > 1 ? r * passoY : h / 2) + jy, 0), h),
    };
  });
}

/**
 * Onde fica o tabuleiro e onde ficam as peças soltas, num palco de `w` x `h`.
 * Deitado: tabuleiro à esquerda e peças à direita. De pé: tabuleiro em cima.
 */
export function arrumar(w, h, n) {
  const margem = 12;
  const deitado = w >= h;
  let lado;
  if (deitado) lado = Math.min(h - 2 * margem, (w - 3 * margem) * 0.56);
  else lado = Math.min(w - 2 * margem, (h - 3 * margem) * 0.56);
  lado = Math.max(Math.floor(lado / n) * n, n);
  const celula = lado / n;
  // A folga deixa espaço para os dentes das peças junto às bordas.
  const folga = celula * DENTE;
  if (deitado) {
    const tab = { x: margem + folga * 0.5, y: Math.max((h - lado) / 2, margem), lado };
    const x0 = tab.x + lado + margem + folga;
    return {
      tabuleiro: tab,
      celula,
      zona: { x: x0, y: margem + folga, w: Math.max(w - x0 - margem - folga, celula), h: Math.max(h - 2 * (margem + folga), celula) },
    };
  }
  const tab = { x: (w - lado) / 2, y: margem + folga * 0.5, lado };
  const y0 = tab.y + lado + margem + folga;
  return {
    tabuleiro: tab,
    celula,
    zona: { x: margem + folga, y: y0, w: Math.max(w - 2 * (margem + folga), celula), h: Math.max(h - y0 - margem - folga, celula) },
  };
}
