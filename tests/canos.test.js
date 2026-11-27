import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gerarPuzzle, labirinto, molhados, resolvido, rodar, dica, saidas, NIVEIS, NIVEL_MAX } from '../games/canos/logic.js';

test('rodar dá a volta completa em 4 vezes', () => {
  assert.equal(rodar(1), 2); // cima -> direita
  assert.equal(rodar(8), 1); // esquerda -> cima
  assert.equal(rodar(5), 10); // reto vertical -> horizontal
  for (let m = 0; m < 16; m++) assert.equal(rodar(m, 4), m);
});

test('o labirinto liga todos os quadrados sem voltas fechadas', () => {
  for (const n of [3, 5, 7]) {
    for (let k = 0; k < 50; k++) {
      const g = labirinto(n);
      const m = molhados(g, { r: 0, c: 0 });
      assert.ok(m.flat().every(Boolean));
      const ligacoes = g.flat().reduce((s, cano) => s + saidas(cano), 0) / 2;
      assert.equal(ligacoes, n * n - 1);
    }
  }
});

test('cada puzzle tem solução, começa baralhado e segue o nível', () => {
  for (let nivel = 1; nivel <= NIVEL_MAX; nivel++) {
    for (let k = 0; k < 80; k++) {
      const p = gerarPuzzle(nivel);
      const { tamanho, flores, enganos } = NIVEIS[nivel - 1];
      assert.equal(p.tamanho, tamanho);
      assert.equal(p.flores.length, flores);
      assert.ok(resolvido(p.solucao, p));
      assert.ok(!resolvido(p.inicio, p));
      const tipos = p.tipo.flat();
      assert.equal(tipos.filter((t) => t === 'fonte').length, 1);
      if (enganos) assert.ok(!tipos.includes('vazio'));
      // A torneira e as flores não rodam: já estão como na solução.
      for (const f of [p.fonte, ...p.flores]) assert.equal(p.inicio[f.r][f.c], p.solucao[f.r][f.c]);
      // Cada cano do início é o da solução rodado.
      p.inicio.forEach((linha, r) => linha.forEach((cano, c) => {
        assert.ok([0, 1, 2, 3].some((v) => rodar(cano, v) === p.solucao[r][c]));
      }));
    }
  }
});

test('carregar na ajuda até ao fim resolve o puzzle', () => {
  for (let nivel = 1; nivel <= NIVEL_MAX; nivel++) {
    for (let k = 0; k < 20; k++) {
      const p = gerarPuzzle(nivel);
      const g = p.inicio.map((l) => l.slice());
      let passos = 0;
      while (!resolvido(g, p)) {
        const pos = dica(g, p);
        assert.ok(pos);
        g[pos.r][pos.c] = p.solucao[pos.r][pos.c];
        assert.ok(++passos <= p.tamanho * p.tamanho);
      }
    }
  }
});
