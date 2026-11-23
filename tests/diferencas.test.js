import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criarDesafio, diferencaEm, estrelas, NIVEIS, TEMAS, TOTAL_DIFERENCAS, LARGURA, ALTURA } from '../games/diferencas/logic.js';

test('cada desafio tem exatamente 7 diferenças e o resto é igual', () => {
  for (const nivel of NIVEIS) {
    for (const tema of TEMAS) {
      for (let k = 0; k < 100; k++) {
        const d = criarDesafio(nivel.id, Math.random, tema);
        assert.equal(d.diferencas.length, TOTAL_DIFERENCAS);
        assert.equal(new Set(d.diferencas.map((x) => x.id)).size, TOTAL_DIFERENCAS);
        for (const t of nivel.tipos) assert.ok(d.diferencas.some((x) => x.tipo === t), `falta tipo ${t}`);
        const dir = new Map(d.direita.map((b) => [b.id, b]));
        const mudadas = new Set(d.diferencas.map((x) => x.id));
        for (const b of d.esquerda) {
          assert.ok(b.x > 0 && b.x < LARGURA && b.y > 0 && b.y < ALTURA);
          const o = dir.get(b.id);
          if (!mudadas.has(b.id)) { assert.deepEqual(o, b); continue; }
          const tipo = d.diferencas.find((x) => x.id === b.id).tipo;
          if (tipo === 'falta') assert.equal(o, undefined);
          else assert.notDeepEqual(o, b);
          if (tipo === 'troca') assert.notEqual(o.emoji, b.emoji);
        }
      }
    }
  }
});

test('os bonecos não se tapam uns aos outros', () => {
  for (let k = 0; k < 200; k++) {
    const { esquerda } = criarDesafio('dificil');
    for (const a of esquerda) for (const b of esquerda) {
      if (a.id >= b.id) continue;
      const dx = Math.abs(a.x - b.x), dy = Math.abs(a.y - b.y);
      assert.ok(dx >= (a.tamanho + b.tamanho) / 2 || dy >= (a.tamanho + b.tamanho) / 2, 'sobrepostos');
    }
  }
});

test('tocar perto de uma diferença encontra-a, longe não', () => {
  const d = criarDesafio('facil');
  const alvo = d.diferencas[0];
  assert.equal(diferencaEm(d, alvo.x + 5, alvo.y - 5), alvo.id);
  assert.equal(diferencaEm(d, alvo.x, alvo.y, new Set([alvo.id])) === alvo.id, false);
  const normal = d.esquerda.find((b) => !d.diferencas.some((x) => x.id === b.id));
  const perto = d.diferencas.some((x) => Math.hypot(x.x - normal.x, x.y - normal.y) <= x.raio);
  if (!perto) assert.equal(diferencaEm(d, normal.x, normal.y), null);
});

test('estrelas', () => {
  assert.equal(estrelas(0, 0), 3);
  assert.equal(estrelas(3, 1), 2);
  assert.equal(estrelas(10, 2), 1);
});
