import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LETRAS, letraAoCalhas, avaliar, estaBem, morfologia } from '../games/letras/logic.js';

test('tem o alfabeto inteiro, cada letra com palavra e emoji', () => {
  assert.equal(LETRAS.length, 26);
  assert.equal(LETRAS.map((l) => l.letra).join(''), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  for (const l of LETRAS) {
    assert.ok(l.palavra && l.emoji);
  }
});

test('a letra seguinte é sempre diferente', () => {
  for (let i = 0; i < 26; i++) assert.notEqual(letraAoCalhas(i), i);
});

// Modelo de 10x10 com uma barra vertical (colunas 4 e 5).
const N = 10;
const grid = (fn) => Uint8Array.from({ length: N * N }, (_, i) => (fn(i % N, Math.floor(i / N)) ? 1 : 0));
const modelo = grid((x) => x === 4 || x === 5);

test('pintar a letra toda por cima está bem', () => {
  const r = avaliar(modelo, grid((x) => x >= 3 && x <= 6));
  assert.equal(r.cobertura, 1);
  assert.equal(r.fora, 0.5);
  assert.equal(estaBem({ cobertura: 1, fora: 0.2 }), true);
  assert.equal(estaBem(avaliar(modelo, grid((x) => x >= 3 && x <= 6), N, { folga: 1 })), true);
  assert.equal(estaBem(avaliar(modelo, modelo)), true);
});

test('só um bocadinho da letra não chega', () => {
  const r = avaliar(modelo, grid((x, y) => (x === 4 || x === 5) && y < 3));
  assert.ok(r.cobertura < 0.4);
  assert.equal(estaBem(r), false);
});

test('rabiscar o quadrado todo não conta', () => {
  const r = avaliar(modelo, grid(() => true));
  assert.equal(r.cobertura, 1);
  assert.ok(r.fora > 0.7);
  assert.equal(estaBem(r), false);
});

test('folha em branco não está bem', () => {
  assert.equal(estaBem(avaliar(modelo, grid(() => false))), false);
});

test('engrossar e emagrecer', () => {
  const ponto = grid((x, y) => x === 5 && y === 5);
  assert.equal(morfologia(ponto, N, 1).reduce((a, b) => a + b, 0), 5);
  assert.equal(morfologia(modelo, N, -1).reduce((a, b) => a + b, 0), 0);
  const grosso = grid((x) => x >= 3 && x <= 6);
  assert.equal(morfologia(grosso, N, -1).reduce((a, b) => a + b, 0), 2 * 8);
});

test('traço pelo meio da letra conta, mesmo sem cobrir as bordas', () => {
  const grosso = grid((x) => x >= 2 && x <= 7);
  const meio = grid((x, y) => x >= 4 && x <= 5 && y >= 1 && y <= 8);
  assert.equal(estaBem(avaliar(grosso, meio, N, { miolo: 2, folga: 1 })), true);
  assert.equal(estaBem(avaliar(grosso, meio, N)), false);
});
