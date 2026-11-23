import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PALAVRAS, novaPalavra, maisLetras, quadrados, acertou, estrelasPara } from '../games/adivinha/logic.js';

test('palavras com 4 ou mais letras, sem repetidas e com desenho', () => {
  assert.ok(PALAVRAS.length >= 40);
  assert.equal(new Set(PALAVRAS.map((p) => p.palavra)).size, PALAVRAS.length);
  for (const p of PALAVRAS) assert.ok(p.palavra.length >= 4 && p.emoji);
});

test('mostra 2 letras e depois uma de cada vez até ao fim', () => {
  assert.deepEqual(quadrados('gato', 2), ['G', 'A', null, null]);
  assert.equal(maisLetras(2, 'gato'), 3);
  assert.equal(maisLetras(3, 'gato'), 4);
  assert.equal(maisLetras(4, 'gato'), 4);
  assert.deepEqual(quadrados('maçã', 4), ['M', 'A', 'Ç', 'Ã']);
});

test('reconhece a palavra dita, com ou sem acentos', () => {
  assert.ok(acertou(['é a maçã'], 'maçã'));
  assert.ok(acertou(['bola', 'Maca'], 'maçã'));
  assert.ok(!acertou(['macaco'], 'maçã'));
  assert.ok(!acertou(['gatos'], 'gato'));
});

test('mais estrelas com menos letras', () => {
  assert.equal(estrelasPara(2, 'macaco'), 3);
  assert.equal(estrelasPara(4, 'macaco'), 2);
  assert.equal(estrelasPara(6, 'macaco'), 1);
});

test('não repete a palavra anterior', () => {
  let anterior = null;
  for (let k = 0; k < 200; k++) {
    const p = novaPalavra(anterior);
    assert.notEqual(p, anterior);
    anterior = p;
  }
});
