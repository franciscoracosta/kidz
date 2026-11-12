import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ANIMAIS, novaRonda, frase } from '../games/animais/logic.js';

test('animais com nome, emoji e som, sem repetidos', () => {
  assert.ok(ANIMAIS.length >= 10);
  assert.equal(new Set(ANIMAIS.map((a) => a.nome)).size, ANIMAIS.length);
  assert.equal(new Set(ANIMAIS.map((a) => a.emoji)).size, ANIMAIS.length);
  for (const a of ANIMAIS) assert.ok(a.som && ['O', 'A'].includes(a.artigo));
});

test('ronda tem o animal certo entre opções diferentes e não repete o anterior', () => {
  let anterior = null;
  for (let k = 0; k < 200; k++) {
    const quantos = 3 + (k % 2);
    const r = novaRonda(quantos, anterior);
    assert.equal(r.opcoes.length, quantos);
    assert.equal(new Set(r.opcoes).size, quantos);
    assert.ok(r.opcoes.includes(r.certo));
    assert.notEqual(r.certo, anterior);
    anterior = r.certo;
  }
});

test('frase', () => {
  assert.equal(frase(ANIMAIS[0]), 'A vaca faz Muuuu!');
});
