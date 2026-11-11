import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DESENHOS, desenhoAoCalhas } from '../games/pintar/desenhos.js';

test('há vários desenhos, cada um com nome e contornos', () => {
  assert.ok(DESENHOS.length >= 8);
  for (const d of DESENHOS) {
    assert.ok(d.nome);
    assert.match(d.svg, /<(path|circle|ellipse|rect|polygon)/);
    assert.doesNotMatch(d.svg, /<svg/);
  }
});

test('o desenho seguinte é sempre diferente do atual', () => {
  for (let atual = 0; atual < DESENHOS.length; atual++) {
    for (let k = 0; k < 20; k++) {
      const i = desenhoAoCalhas(atual);
      assert.notEqual(i, atual);
      assert.ok(i >= 0 && i < DESENHOS.length);
    }
  }
});
