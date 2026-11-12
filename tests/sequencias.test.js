import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gerarSequencia, PADROES, NIVEL_MAX } from '../games/sequencias/logic.js';

test('a resposta continua o padrão e está nas opções', () => {
  for (let nivel = 1; nivel <= NIVEL_MAX; nivel++) {
    for (let k = 0; k < 200; k++) {
      const s = gerarSequencia(nivel);
      assert.ok(PADROES[nivel - 1].includes(s.padrao));
      const p = s.padrao.length;
      const n = s.mostrados.length;
      assert.ok(n >= 6 && n >= p * 2);
      // a resposta é igual ao símbolo um padrão atrás
      assert.equal(s.resposta, s.mostrados[n - p]);
      // a sequência mostrada segue o padrão
      for (let i = p; i < n; i++) assert.equal(s.mostrados[i], s.mostrados[i - p]);
      assert.equal(s.opcoes.length, 3);
      assert.equal(new Set(s.opcoes).size, 3);
      assert.ok(s.opcoes.includes(s.resposta));
    }
  }
});
