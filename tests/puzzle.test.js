import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TAMANHOS, DENTE, gerarFormas, contorno, encaixa, espalhar, arrumar } from '../games/puzzle/logic.js';
import { IMAGENS } from '../games/puzzle/imagens.js';

test('os tamanhos vão de 2x2 a 6x6', () => {
  assert.deepEqual(TAMANHOS.map((t) => t.n), [2, 3, 4, 5, 6]);
});

test('as peças vizinhas encaixam e as bordas são lisas', () => {
  for (const n of [2, 3, 4, 5, 6]) {
    for (let k = 0; k < 30; k++) {
      const f = gerarFormas(n);
      assert.equal(f.length, n * n);
      const at = (r, c) => f[r * n + c];
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          const p = at(r, c);
          if (r === 0) assert.equal(p.top, 0); else assert.equal(p.top, -at(r - 1, c).bottom);
          if (c === 0) assert.equal(p.left, 0); else assert.equal(p.left, -at(r, c - 1).right);
          if (r === n - 1) assert.equal(p.bottom, 0); else assert.notEqual(p.bottom, 0);
          if (c === n - 1) assert.equal(p.right, 0); else assert.notEqual(p.right, 0);
        }
      }
    }
  }
});

test('o contorno fecha e os dentes não passam da folga', () => {
  const s = 100;
  const forma = { top: 1, right: -1, bottom: 1, left: -1 };
  const cmds = contorno(forma, s);
  const fim = cmds.at(-1).slice(-2);
  assert.deepEqual(fim.map((v) => Math.round(v)), [0, 0]);
  for (const cmd of cmds) {
    for (const v of cmd.slice(1)) {
      assert.ok(v >= -s * DENTE - 1e-9 && v <= s + s * DENTE + 1e-9);
    }
  }
  // Peça lisa (2x2 de um só lado) é só um quadrado.
  assert.equal(contorno({ top: 0, right: 0, bottom: 0, left: 0 }, s).length, 5);
});

test('a peça encaixa quando fica perto do sítio certo', () => {
  assert.ok(encaixa({ x: 110, y: 95 }, { x: 100, y: 100 }, 100));
  assert.ok(!encaixa({ x: 160, y: 100 }, { x: 100, y: 100 }, 100));
});

test('as peças espalhadas ficam dentro da zona', () => {
  const zona = { x: 500, y: 20, w: 300, h: 600 };
  for (const total of [4, 9, 16, 25, 36]) {
    const lado = 80;
    const pos = espalhar(total, zona, lado);
    assert.equal(pos.length, total);
    for (const p of pos) {
      assert.ok(p.x >= zona.x && p.x + lado <= zona.x + zona.w + 1e-9);
      assert.ok(p.y >= zona.y && p.y + lado <= zona.y + zona.h + 1e-9);
    }
  }
});

test('o tabuleiro e a zona das peças não se sobrepõem', () => {
  for (const [w, h] of [[1100, 700], [780, 900], [360, 520]]) {
    for (const n of [2, 4, 6]) {
      const { tabuleiro: t, zona, celula } = arrumar(w, h, n);
      assert.equal(celula * n, t.lado);
      assert.ok(t.x >= 0 && t.y >= 0 && t.x + t.lado <= w && t.y + t.lado <= h);
      const sobrepoe = zona.x < t.x + t.lado && t.x < zona.x + zona.w && zona.y < t.y + t.lado && t.y < zona.y + zona.h;
      assert.ok(!sobrepoe);
    }
  }
});

test('os desenhos são SVG válidos e com nome', () => {
  assert.ok(IMAGENS.length >= 6);
  for (const im of IMAGENS) {
    const svg = im.svg();
    assert.ok(svg.startsWith('<svg') && svg.endsWith('</svg>'));
    assert.ok(!svg.includes('undefined') && !svg.includes('NaN'));
    assert.ok(im.nome && im.fala);
  }
});
