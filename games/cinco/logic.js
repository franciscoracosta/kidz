// Regras do 5 em linha. O tabuleiro é um array plano de size*size células
// (null = vazio, 1 ou 2 = jogador). Sem DOM: pode ser testado em Node.

export const DIRECTIONS = [[0, 1], [1, 0], [1, 1], [1, -1]];
export const TO_WIN = 5;

export function emptyBoard(size) {
  return Array(size * size).fill(null);
}

const other = (p) => (p === 1 ? 2 : 1);

/**
 * Verifica se a peça colocada em `index` fez 5 (ou mais) seguidas.
 * Devolve a lista de células vencedoras, ou null.
 */
export function winningLine(board, size, index) {
  const player = board[index];
  if (!player) return null;
  const r0 = Math.floor(index / size);
  const c0 = index % size;
  for (const [dr, dc] of DIRECTIONS) {
    const line = [index];
    for (const sign of [1, -1]) {
      let r = r0 + dr * sign;
      let c = c0 + dc * sign;
      while (r >= 0 && r < size && c >= 0 && c < size && board[r * size + c] === player) {
        line.push(r * size + c);
        r += dr * sign;
        c += dc * sign;
      }
    }
    if (line.length >= TO_WIN) return line.sort((a, b) => a - b);
  }
  return null;
}

export function isFull(board) {
  return board.every((cell) => cell !== null);
}

// Quanto vale fazer uma sequência de `count` peças com `open` pontas livres.
function patternScore(count, open) {
  if (count >= 5) return 1_000_000;
  if (open === 0) return 0;
  if (count === 4) return open === 2 ? 100_000 : 10_000;
  if (count === 3) return open === 2 ? 5_000 : 400;
  if (count === 2) return open === 2 ? 200 : 30;
  return open === 2 ? 10 : 2;
}

/** Valor de pôr uma peça de `player` na célula vazia `index`. */
function cellScore(board, size, index, player) {
  const r0 = Math.floor(index / size);
  const c0 = index % size;
  let total = 0;
  for (const [dr, dc] of DIRECTIONS) {
    let count = 1;
    let open = 0;
    for (const sign of [1, -1]) {
      let r = r0 + dr * sign;
      let c = c0 + dc * sign;
      while (r >= 0 && r < size && c >= 0 && c < size && board[r * size + c] === player) {
        count++;
        r += dr * sign;
        c += dc * sign;
      }
      if (r >= 0 && r < size && c >= 0 && c < size && board[r * size + c] === null) open++;
    }
    total += patternScore(count, open);
  }
  return total;
}

function hasNeighbour(board, size, index, dist = 2) {
  const r0 = Math.floor(index / size);
  const c0 = index % size;
  for (let dr = -dist; dr <= dist; dr++) {
    for (let dc = -dist; dc <= dist; dc++) {
      const r = r0 + dr;
      const c = c0 + dc;
      if ((dr || dc) && r >= 0 && r < size && c >= 0 && c < size && board[r * size + c] !== null) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Escolhe a jogada do computador com uma heurística simples:
 * pontua cada casa pelo ataque (as próprias sequências) e pela defesa
 * (as sequências do adversário que bloqueia).
 * - "facil": defende pouco e escolhe entre as melhores ao calhas.
 * - "dificil": escolhe sempre a melhor casa.
 */
export function computerMove(board, size, player, level = 'facil', random = Math.random) {
  const empty = [];
  let anyStone = false;
  board.forEach((cell, i) => {
    if (cell === null) empty.push(i);
    else anyStone = true;
  });
  if (empty.length === 0) return -1;
  if (!anyStone) {
    const mid = Math.floor(size / 2);
    return mid * size + mid;
  }

  const opp = other(player);
  const defenceWeight = level === 'facil' ? 0.5 : 0.9;
  const scored = [];
  for (const i of empty) {
    if (!hasNeighbour(board, size, i)) continue;
    const attack = cellScore(board, size, i, player);
    const defence = cellScore(board, size, i, opp);
    // Ganhar já tem prioridade máxima; bloquear um 5 do adversário a seguir.
    let score = attack + defence * defenceWeight;
    if (attack >= 1_000_000) score = Infinity;
    else if (defence >= 1_000_000 && level !== 'facil') score = 1e12;
    scored.push({ i, score });
  }
  if (scored.length === 0) return empty[Math.floor(random() * empty.length)];
  scored.sort((a, b) => b.score - a.score);

  if (level === 'facil') {
    if (scored[0].score === Infinity) return scored[0].i;
    // No fácil, às vezes "não vê" a ameaça e escolhe entre as 4 melhores.
    const top = scored.slice(0, Math.min(4, scored.length));
    return top[Math.floor(random() * top.length)].i;
  }

  const best = scored.filter((s) => s.score === scored[0].score);
  return best[Math.floor(random() * best.length)].i;
}
