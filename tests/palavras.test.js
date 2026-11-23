import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PARES, LETRAS, normalizar, comecaPor, encontrarPalavra, emojiDe, novaRonda, pedido,
} from '../games/palavras/logic.js';

test('todos os exemplos começam pelas letras certas', () => {
  for (const tabela of [PARES, LETRAS]) {
    for (const [inicio, exemplos] of Object.entries(tabela)) {
      assert.ok(exemplos.length >= 2, inicio);
      for (const e of exemplos) assert.ok(comecaPor(e.palavra, inicio), `${e.palavra} / ${inicio}`);
    }
  }
  for (const par of Object.keys(PARES)) assert.equal(par.length, 2);
  for (const letra of Object.keys(LETRAS)) assert.equal(letra.length, 1);
});

test('normalizar tira acentos e cedilhas', () => {
  assert.equal(normalizar('Maçã'), 'maca');
  assert.equal(normalizar('CÃO'), 'cao');
});

test('reconhece a palavra no meio do que foi dito', () => {
  assert.equal(encontrarPalavra(['é o Macaco'], 'MA'), 'macaco');
  assert.equal(encontrarPalavra(['bola', 'mala'], 'MA'), 'mala');
  assert.equal(encontrarPalavra(['cão'], 'CA'), 'cão');
  assert.equal(encontrarPalavra(['pé'], 'PE'), 'pé');
  assert.equal(encontrarPalavra(['bola'], 'MA'), null);
  // uma letra sozinha não é palavra
  assert.equal(encontrarPalavra(['a'], 'A'), null);
  assert.equal(encontrarPalavra(['a abelha'], 'A'), 'abelha');
});

test('emoji das palavras conhecidas', () => {
  assert.equal(emojiDe('Macaco'), '🐒');
  assert.equal(emojiDe('xilofone'), null);
});

test('rondas não repetem o início e trazem exemplos desse início', () => {
  for (const modo of ['par', 'letra']) {
    let anterior = null;
    for (let k = 0; k < 200; k++) {
      const r = novaRonda(modo, anterior);
      assert.equal(r.inicio.length, modo === 'par' ? 2 : 1);
      assert.notEqual(r.inicio, anterior);
      assert.ok(r.exemplos.length >= 2 && r.exemplos.length <= 3);
      for (const e of r.exemplos) assert.ok(comecaPor(e.palavra, r.inicio));
      anterior = r.inicio;
    }
  }
});

test('pedido', () => {
  assert.equal(pedido('MA'), 'Diz uma palavra começada por ma');
  assert.equal(pedido('B'), 'Diz uma palavra começada pela letra B');
});
