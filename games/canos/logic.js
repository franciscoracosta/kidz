// Regras do jogo "Leva a Água" (sem DOM).
//
// O tabuleiro é uma grelha de canos. Cada quadrado guarda as saídas do cano
// como um número com 4 bits: cima = 1, direita = 2, baixo = 4, esquerda = 8.
// Tocar num cano roda-o 90 graus para a direita. A água sai da torneira e
// passa de um cano para o vizinho só quando os dois têm saída um para o outro.
// Ganha-se quando a água chega a todas as flores.
//
// Para gerar um puzzle faz-se um labirinto ao calhas (uma árvore que passa
// por todos os quadrados), põe-se a torneira num quadrado e as flores em
// pontas do labirinto. Os canos que levam a água ficam no tabuleiro; os
// outros quadrados ficam vazios ou com canos que não servem para nada.
// No fim baralha-se a rotação de cada cano.

export const CIMA = 1;
export const DIREITA = 2;
export const BAIXO = 4;
export const ESQUERDA = 8;
export const DIRECOES = [CIMA, DIREITA, BAIXO, ESQUERDA];
const PASSO = { [CIMA]: [-1, 0], [DIREITA]: [0, 1], [BAIXO]: [1, 0], [ESQUERDA]: [0, -1] };
const OPOSTA = { [CIMA]: BAIXO, [DIREITA]: ESQUERDA, [BAIXO]: CIMA, [ESQUERDA]: DIREITA };

// Cada nível: tamanho da grelha, quantas flores, e se há canos a mais para enganar.
export const NIVEIS = [
  { tamanho: 3, flores: 1, enganos: false },
  { tamanho: 4, flores: 1, enganos: false },
  { tamanho: 4, flores: 1, enganos: true },
  { tamanho: 5, flores: 1, enganos: true },
  { tamanho: 5, flores: 2, enganos: true },
  { tamanho: 6, flores: 2, enganos: true },
  { tamanho: 6, flores: 3, enganos: true },
  { tamanho: 7, flores: 3, enganos: true },
  { tamanho: 7, flores: 4, enganos: true },
];
export const NIVEL_MAX = NIVEIS.length;

/** Roda um cano 90 graus para a direita, `vezes` vezes. */
export function rodar(cano, vezes = 1) {
  let m = cano;
  for (let i = 0; i < ((vezes % 4) + 4) % 4; i++) m = ((m << 1) | (m >> 3)) & 15;
  return m;
}

/** Quantas saídas tem o cano. */
export const saidas = (cano) => DIRECOES.filter((d) => cano & d).length;

function baralhar(lista, random) {
  const a = lista.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const vazia = (n, v) => Array.from({ length: n }, () => Array(n).fill(v));

/** Labirinto ao calhas que liga todos os quadrados (sem voltas fechadas). */
export function labirinto(n, random = Math.random) {
  const g = vazia(n, 0);
  const visto = vazia(n, false);
  const pilha = [[Math.floor(random() * n), Math.floor(random() * n)]];
  visto[pilha[0][0]][pilha[0][1]] = true;
  while (pilha.length) {
    // Às vezes continua de um quadrado antigo: assim o labirinto tem mais ramos.
    const i = random() < 0.25 ? Math.floor(random() * pilha.length) : pilha.length - 1;
    const [r, c] = pilha[i];
    const livres = DIRECOES.filter((d) => {
      const [dr, dc] = PASSO[d];
      const rr = r + dr;
      const cc = c + dc;
      return rr >= 0 && rr < n && cc >= 0 && cc < n && !visto[rr][cc];
    });
    if (!livres.length) {
      pilha.splice(i, 1);
      continue;
    }
    const d = livres[Math.floor(random() * livres.length)];
    const [dr, dc] = PASSO[d];
    g[r][c] |= d;
    g[r + dr][c + dc] |= OPOSTA[d];
    visto[r + dr][c + dc] = true;
    pilha.push([r + dr, c + dc]);
  }
  return g;
}

/**
 * Quadrados onde a água chega, a partir da torneira.
 * Devolve uma grelha de true/false.
 */
export function molhados(grelha, fonte) {
  const n = grelha.length;
  const m = vazia(n, false);
  const fila = [fonte];
  m[fonte.r][fonte.c] = true;
  while (fila.length) {
    const { r, c } = fila.shift();
    for (const d of DIRECOES) {
      if (!(grelha[r][c] & d)) continue;
      const [dr, dc] = PASSO[d];
      const rr = r + dr;
      const cc = c + dc;
      if (rr < 0 || rr >= n || cc < 0 || cc >= n || m[rr][cc]) continue;
      if (!(grelha[rr][cc] & OPOSTA[d])) continue;
      m[rr][cc] = true;
      fila.push({ r: rr, c: cc });
    }
  }
  return m;
}

/** A água chega a todas as flores? */
export function resolvido(grelha, puzzle) {
  const m = molhados(grelha, puzzle.fonte);
  return puzzle.flores.every(({ r, c }) => m[r][c]);
}

/** Distância (em passos do labirinto) de cada quadrado à torneira, e o caminho de volta. */
function distancias(arvore, fonte) {
  const n = arvore.length;
  const dist = vazia(n, -1);
  const pai = vazia(n, null);
  dist[fonte.r][fonte.c] = 0;
  const fila = [fonte];
  while (fila.length) {
    const { r, c } = fila.shift();
    for (const d of DIRECOES) {
      if (!(arvore[r][c] & d)) continue;
      const [dr, dc] = PASSO[d];
      const rr = r + dr;
      const cc = c + dc;
      if (rr < 0 || rr >= n || cc < 0 || cc >= n || dist[rr][cc] !== -1) continue;
      if (!(arvore[rr][cc] & OPOSTA[d])) continue;
      dist[rr][cc] = dist[r][c] + 1;
      pai[rr][cc] = { r, c, d: OPOSTA[d] };
      fila.push({ r: rr, c: cc });
    }
  }
  return { dist, pai };
}

function escolherFlores(arvore, fonte, quantas, random) {
  const n = arvore.length;
  const { dist } = distancias(arvore, fonte);
  const pontas = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if ((r !== fonte.r || c !== fonte.c) && saidas(arvore[r][c]) === 1) pontas.push({ r, c, dist: dist[r][c] });
    }
  }
  if (pontas.length < quantas) return null;
  const longe = Math.max(...pontas.map((p) => p.dist));
  // Flores longe da torneira, para o caminho ser comprido.
  let boas = pontas.filter((p) => p.dist >= Math.ceil(longe * 0.6));
  if (boas.length < quantas) boas = pontas.sort((a, b) => b.dist - a.dist).slice(0, quantas);
  return baralhar(boas, random).slice(0, quantas).map(({ r, c }) => ({ r, c }));
}

const CANOS_ENGANO = [CIMA | BAIXO, CIMA | DIREITA, CIMA | DIREITA | BAIXO];

/**
 * Gera um puzzle do nível pedido:
 * { tamanho, fonte: {r,c}, flores: [{r,c}], tipo: [['fonte'|'flor'|'cano'|'vazio']],
 *   solucao: [[cano]], inicio: [[cano]] }
 */
export function gerarPuzzle(nivel, random = Math.random) {
  const { tamanho: n, flores: quantas, enganos } = NIVEIS[Math.min(Math.max(nivel, 1), NIVEL_MAX) - 1];
  for (;;) {
    const arvore = labirinto(n, random);
    const fonte = { r: Math.floor(random() * n), c: Math.floor(random() * n) };
    const flores = escolherFlores(arvore, fonte, quantas, random);
    if (!flores) continue;
    // Os canos que levam a água: o caminho de cada flor até à torneira.
    const { pai } = distancias(arvore, fonte);
    const solucao = vazia(n, 0);
    for (const f of flores) {
      let p = f;
      while (pai[p.r][p.c]) {
        const q = pai[p.r][p.c];
        solucao[p.r][p.c] |= q.d;
        solucao[q.r][q.c] |= OPOSTA[q.d];
        p = q;
      }
    }
    const tipo = vazia(n, 'vazio');
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (solucao[r][c]) tipo[r][c] = 'cano';
        else if (enganos) {
          tipo[r][c] = 'cano';
          solucao[r][c] = rodar(CANOS_ENGANO[Math.floor(random() * CANOS_ENGANO.length)], Math.floor(random() * 4));
        }
      }
    }
    tipo[fonte.r][fonte.c] = 'fonte';
    for (const f of flores) tipo[f.r][f.c] = 'flor';
    // Baralha os canos; a torneira e as flores ficam como estão.
    for (let tentativa = 0; tentativa < 20; tentativa++) {
      const inicio = solucao.map((linha, r) => linha.map((cano, c) => (
        tipo[r][c] === 'cano' ? rodar(cano, Math.floor(random() * 4)) : cano
      )));
      const puzzle = { tamanho: n, fonte, flores, tipo, solucao, inicio };
      if (!resolvido(inicio, puzzle) && acertados(inicio, puzzle) < caminho(puzzle) * 0.6) return puzzle;
    }
  }
}

/** Quadrados que fazem parte do caminho da água (sem contar os canos a enganar). */
export function noCaminho(puzzle, r, c) {
  const { solucao, fonte } = puzzle;
  return molhados(solucao, fonte)[r][c];
}

function caminho(puzzle) {
  const m = molhados(puzzle.solucao, puzzle.fonte);
  return m.flat().filter(Boolean).length;
}

function acertados(grelha, puzzle) {
  const m = molhados(puzzle.solucao, puzzle.fonte);
  let n = 0;
  grelha.forEach((linha, r) => linha.forEach((cano, c) => {
    if (m[r][c] && puzzle.tipo[r][c] === 'cano' && cano === puzzle.solucao[r][c]) n++;
  }));
  return n;
}

/**
 * Ajuda: o próximo cano do caminho que está mal virado, a começar pela
 * torneira. Devolve { r, c } ou null.
 */
export function dica(grelha, puzzle) {
  const { solucao, fonte, tipo } = puzzle;
  const { dist } = distancias(solucao, fonte);
  let melhor = null;
  grelha.forEach((linha, r) => linha.forEach((cano, c) => {
    if (tipo[r][c] !== 'cano' || dist[r][c] < 0 || cano === solucao[r][c]) return;
    if (!melhor || dist[r][c] < melhor.d) melhor = { r, c, d: dist[r][c] };
  }));
  return melhor && { r: melhor.r, c: melhor.c };
}
