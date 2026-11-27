// Regras do Sudoku de Figuras (sem DOM).
//
// A grelha é um quadrado latino: em cada linha e em cada coluna cada figura
// aparece uma só vez. No 4x4 também não se pode repetir em cada quadrado 2x2.
// As figuras são guardadas como números (0, 1, 2, ...) e só o ecrã as troca
// por emojis.

export const TEMAS = [
  ['🐶', '🐱', '🐰', '🐸'],
  ['🍎', '🍌', '🍇', '🍓'],
  ['🔴', '🔵', '🟢', '🟡'],
  ['🚗', '🚀', '🚲', '⛵'],
  ['⭐', '🌙', '☀️', '☁️'],
];

// Cada nível: tamanho da grelha e quantos quadrados ficam vazios.
export const NIVEIS = [
  { tamanho: 3, vazios: 2 },
  { tamanho: 3, vazios: 4 },
  { tamanho: 4, vazios: 4 },
  { tamanho: 4, vazios: 7 },
  { tamanho: 4, vazios: 10 },
];
export const NIVEL_MAX = NIVEIS.length;

function baralhar(lista, random) {
  const a = lista.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Tamanho dos quadrados interiores (só o 4x4 tem: 2x2). */
export const caixa = (tamanho) => (tamanho === 4 ? 2 : 0);

/** Gera uma grelha completa e válida, ao acaso. */
export function gerarSolucao(tamanho, random = Math.random) {
  let base;
  if (tamanho === 4) {
    base = [[0, 1, 2, 3], [2, 3, 0, 1], [1, 0, 3, 2], [3, 2, 1, 0]];
    // Troca linhas dentro de cada faixa e as faixas entre si (mantém os quadrados 2x2 válidos).
    const faixas = baralhar([0, 1], random);
    const linhas = faixas.flatMap((f) => baralhar([f * 2, f * 2 + 1], random));
    base = linhas.map((l) => base[l]);
    const fcols = baralhar([0, 1], random);
    const cols = fcols.flatMap((f) => baralhar([f * 2, f * 2 + 1], random));
    base = base.map((linha) => cols.map((c) => linha[c]));
  } else {
    base = Array.from({ length: tamanho }, (_, r) => Array.from({ length: tamanho }, (_, c) => (r + c) % tamanho));
    base = baralhar(base, random);
    const cols = baralhar([...Array(tamanho).keys()], random);
    base = base.map((linha) => cols.map((c) => linha[c]));
  }
  const figuras = baralhar([...Array(tamanho).keys()], random);
  return base.map((linha) => linha.map((v) => figuras[v]));
}

/**
 * Onde está o conflito se puséssemos `valor` em (r, c)?
 * Devolve { r, c, onde: 'linha' | 'coluna' | 'quadrado' } ou null se não houver.
 */
export function conflito(grelha, r, c, valor) {
  const n = grelha.length;
  for (let i = 0; i < n; i++) {
    if (i !== c && grelha[r][i] === valor) return { r, c: i, onde: 'linha' };
  }
  for (let i = 0; i < n; i++) {
    if (i !== r && grelha[i][c] === valor) return { r: i, c, onde: 'coluna' };
  }
  const b = caixa(n);
  if (b) {
    const r0 = r - (r % b);
    const c0 = c - (c % b);
    for (let i = r0; i < r0 + b; i++) {
      for (let j = c0; j < c0 + b; j++) {
        if ((i !== r || j !== c) && grelha[i][j] === valor) return { r: i, c: j, onde: 'quadrado' };
      }
    }
  }
  return null;
}

/** Conta as soluções de uma grelha com buracos (null), parando em `limite`. */
export function contarSolucoes(grelha, limite = 2) {
  const g = grelha.map((l) => l.slice());
  const n = g.length;
  let total = 0;
  (function resolver() {
    if (total >= limite) return;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (g[r][c] !== null) continue;
        for (let v = 0; v < n; v++) {
          if (!conflito(g, r, c, v)) {
            g[r][c] = v;
            resolver();
            g[r][c] = null;
          }
        }
        return;
      }
    }
    total++;
  })();
  return total;
}

/**
 * Gera um puzzle para o nível (1 a NIVEL_MAX).
 * Devolve { tamanho, solucao, grelha } em que `grelha` tem null nos
 * quadrados vazios e só há uma maneira certa de a completar.
 */
export function gerarPuzzle(nivel = 1, random = Math.random) {
  const { tamanho, vazios } = NIVEIS[Math.min(Math.max(nivel, 1), NIVEL_MAX) - 1];
  for (;;) {
    const solucao = gerarSolucao(tamanho, random);
    const grelha = solucao.map((l) => l.slice());
    const posicoes = baralhar([...Array(tamanho * tamanho).keys()], random);
    let tirados = 0;
    for (const p of posicoes) {
      if (tirados === vazios) break;
      const r = Math.floor(p / tamanho);
      const c = p % tamanho;
      const antes = grelha[r][c];
      grelha[r][c] = null;
      if (contarSolucoes(grelha) === 1) tirados++;
      else grelha[r][c] = antes;
    }
    if (tirados === vazios) return { tamanho, solucao, grelha };
  }
}
