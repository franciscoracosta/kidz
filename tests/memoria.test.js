import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TEMAS, NIVEIS, criarCartas, estrelas } from '../games/memoria/logic.js';

test('cada nível cabe em todos os temas e as cartas vêm aos pares', () => {
  for (const nivel of NIVEIS) {
    for (const tema of TEMAS) {
      assert.ok(tema.simbolos.length >= nivel.pares);
      const cartas = criarCartas(nivel.pares, tema);
      assert.equal(cartas.length, nivel.pares * 2);
      const contagem = {};
      for (const c of cartas) contagem[c.simbolo] = (contagem[c.simbolo] || 0) + 1;
      assert.equal(Object.keys(contagem).length, nivel.pares);
      assert.ok(Object.values(contagem).every((n) => n === 2));
      assert.deepEqual(cartas.map((c) => c.id), [...cartas.keys()]);
    }
  }
});

test('estrelas: menos jogadas, mais estrelas', () => {
  assert.equal(estrelas(6, 6), 3);
  assert.equal(estrelas(12, 6), 2);
  assert.equal(estrelas(30, 6), 1);
});
