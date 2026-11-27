import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  encherQuadro, esconder, parteVisivel, encontrou, bolaNoQuadro, pousarBola, sitioAoCalhas, NIVEIS,
} from '../games/esconde/logic.js';

test('o quadro fica cheio de brinquedos dentro do quadrado', () => {
  for (const { id, grelha } of NIVEIS) {
    const objs = encherQuadro(id);
    assert.equal(objs.length, grelha * grelha);
    assert.equal(new Set(objs.map((o) => o.id)).size, objs.length);
    for (const o of objs) assert.ok(o.x > 0 && o.x < 1 && o.y > 0 && o.y < 1);
  }
});

test('depois de Iniciar a bola fica toda tapada, esteja onde estiver', () => {
  for (const { id } of NIVEIS) {
    for (let k = 0; k < 400; k++) {
      const bola = pousarBola({ x: Math.random(), y: Math.random() });
      const objs = esconder(bola, encherQuadro(id), id);
      assert.equal(parteVisivel(bola, objs), 0, `bola à vista em ${bola.x}, ${bola.y}`);
      assert.ok(!encontrou(bola, objs));
    }
  }
});

test('tirar os brinquedos de cima da bola faz encontrá-la', () => {
  for (let k = 0; k < 100; k++) {
    const bola = sitioAoCalhas();
    const objs = esconder(bola, encherQuadro(2), 2);
    // Arrasta tudo para fora do quadro, um de cada vez, do de cima para o de baixo.
    let achou = false;
    for (let i = objs.length - 1; i >= 0; i--) {
      objs[i].x = -1;
      if (encontrou(bola, objs)) { achou = true; break; }
    }
    assert.ok(achou);
  }
});

test('a bola só conta como escondida se estiver em cima do quadro', () => {
  assert.ok(bolaNoQuadro({ x: 0.5, y: 0.5 }));
  assert.ok(!bolaNoQuadro({ x: -0.2, y: 0.5 }));
  assert.ok(!bolaNoQuadro({ x: 0.5, y: 1.3 }));
  const p = pousarBola({ x: 0, y: 1 });
  assert.ok(p.x > 0 && p.y < 1);
});
