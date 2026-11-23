import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gerarRonda, NIVEIS, NIVEL_MAX, nomeDirecao } from '../games/setas/logic.js';

test('cada ronda tem o número certo de setas diferentes, todas iguais entre si', () => {
  for (let nivel = 1; nivel <= NIVEL_MAX; nivel++) {
    const cfg = NIVEIS[nivel - 1];
    for (let k = 0; k < 300; k++) {
      const r = gerarRonda(nivel);
      assert.equal(r.lado, cfg.lado);
      assert.equal(r.setas.length, cfg.lado * cfg.lado);
      assert.deepEqual(r.setas.map((s) => s.id), [...r.setas.keys()]);
      const dif = r.setas.filter((s) => s.diferente);
      const normais = r.setas.filter((s) => !s.diferente);
      assert.equal(dif.length, cfg.diferentes);
      assert.equal(r.diferentes, cfg.diferentes);
      assert.equal(new Set(dif.map((s) => s.angulo)).size, 1);
      assert.equal(new Set(normais.map((s) => s.angulo)).size, 1);
      const a = dif[0].angulo;
      const b = normais[0].angulo;
      assert.notEqual(a, b);
      const d = Math.min((a - b + 360) % 360, (b - a + 360) % 360);
      assert.ok(cfg.rodar.includes(d), `nível ${nivel}: diferença ${d}`);
      assert.ok(nomeDirecao(a) && nomeDirecao(b));
    }
  }
});

test('os níveis ficam mais difíceis', () => {
  for (let i = 1; i < NIVEIS.length; i++) {
    assert.ok(NIVEIS[i].lado >= NIVEIS[i - 1].lado);
  }
  assert.equal(gerarRonda(99).lado, NIVEIS[NIVEL_MAX - 1].lado);
});
