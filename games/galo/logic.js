// Regras do Jogo do Galo (3x3). Sem DOM: pode ser testado em Node.

export const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // linhas
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // colunas
  [0, 4, 8], [2, 4, 6],            // diagonais
];

export function emptyBoard() {
  return Array(9).fill(null);
}

/** Devolve { player, line } se alguém ganhou, ou null. */
export function getWinner(board) {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { player: board[a], line };
    }
  }
  return null;
}

export function isFull(board) {
  return board.every((cell) => cell !== null);
}

export function emptyCells(board) {
  const cells = [];
  board.forEach((cell, i) => { if (cell === null) cells.push(i); });
  return cells;
}

const other = (p) => (p === 1 ? 2 : 1);

function minimax(board, toPlay, me, depth) {
  const win = getWinner(board);
  if (win) return win.player === me ? 10 - depth : depth - 10;
  if (isFull(board)) return 0;
  let best = toPlay === me ? -Infinity : Infinity;
  for (const i of emptyCells(board)) {
    board[i] = toPlay;
    const score = minimax(board, other(toPlay), me, depth + 1);
    board[i] = null;
    best = toPlay === me ? Math.max(best, score) : Math.min(best, score);
  }
  return best;
}

function findWinningMove(board, player) {
  for (const i of emptyCells(board)) {
    board[i] = player;
    const won = getWinner(board);
    board[i] = null;
    if (won) return i;
  }
  return -1;
}

/**
 * Escolhe a jogada do computador.
 * - "facil": ganha se puder, às vezes bloqueia, senão joga ao calhas.
 * - "dificil": joga na perfeição (minimax). Nunca perde.
 */
export function computerMove(board, player, level = 'facil', random = Math.random) {
  const cells = emptyCells(board);
  if (cells.length === 0) return -1;
  const b = board.slice();

  if (level === 'facil') {
    const win = findWinningMove(b, player);
    if (win >= 0) return win;
    if (random() < 0.5) {
      const block = findWinningMove(b, other(player));
      if (block >= 0) return block;
    }
    return cells[Math.floor(random() * cells.length)];
  }

  let bestScore = -Infinity;
  let bestMoves = [];
  for (const i of cells) {
    b[i] = player;
    const score = minimax(b, other(player), player, 0);
    b[i] = null;
    if (score > bestScore) { bestScore = score; bestMoves = [i]; }
    else if (score === bestScore) bestMoves.push(i);
  }
  return bestMoves[Math.floor(random() * bestMoves.length)];
}
