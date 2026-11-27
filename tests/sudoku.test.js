import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gerarPuzzle, gerarSolucao, conflito, contarSolucoes, NIVEIS, NIVEL_MAX, TEMAS } from '../games/sudoku/logic.js';

function valida(g) {
  for (let r = 0; r < g.length; r++) {
    for (let c = 0; c < g.length; c++) {
      if (conflito(g, r, c, g[r][c])) return false;
    }
  }
  return true;
}

test('as soluções geradas são válidas (linhas, colunas e quadrados)', () => {
  for (const n of [3, 4]) {
    for (let k = 0; k < 200; k++) {
      const s = gerarSolucao(n);
      assert.equal(s.length, n);
      assert.ok(s.every((l) => l.length === n && new Set(l).size === n));
      assert.ok(valida(s));
    }
  }
});

test('cada puzzle tem os vazios do nível e uma só solução', () => {
  for (let nivel = 1; nivel <= NIVEL_MAX; nivel++) {
    for (let k = 0; k < 60; k++) {
      const p = gerarPuzzle(nivel);
      const { tamanho, vazios } = NIVEIS[nivel - 1];
      assert.equal(p.tamanho, tamanho);
      assert.equal(p.grelha.flat().filter((v) => v === null).length, vazios);
      assert.equal(contarSolucoes(p.grelha), 1);
      p.grelha.forEach((l, r) => l.forEach((v, c) => { if (v !== null) assert.equal(v, p.solucao[r][c]); }));
    }
  }
});

test('conflito diz onde está a figura repetida', () => {
  const g = [[0, 1, 2, 3], [2, null, 0, 1], [1, 0, 3, 2], [3, 2, 1, 0]];
  assert.deepEqual(conflito(g, 1, 1, 2), { r: 1, c: 0, onde: 'linha' });
  assert.deepEqual(conflito(g, 1, 1, 0), { r: 1, c: 2, onde: 'linha' });
  assert.equal(conflito(g, 1, 1, 3), null);
  const h = [[0, null, 2, 3], [2, 3, 0, 1], [1, 0, 3, 2], [3, 2, 1, 0]];
  assert.deepEqual(conflito(h, 0, 1, 3).onde, 'linha');
  const q = [[null, null, null, null], [null, 1, null, null], [null, null, null, null], [null, null, null, null]];
  assert.deepEqual(conflito(q, 0, 0, 1), { r: 1, c: 1, onde: 'quadrado' });
});

test('todos os temas têm 4 figuras diferentes', () => {
  for (const t of TEMAS) assert.equal(new Set(t).size, 4);
});
