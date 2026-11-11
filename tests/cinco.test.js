import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyBoard, winningLine, computerMove, isFull } from '../games/cinco/logic.js';

const N = 10;
const at = (r, c) => r * N + c;

function place(board, player, cells) {
  for (const [r, c] of cells) board[at(r, c)] = player;
  return board;
}

test('5 na horizontal, vertical e diagonais', () => {
  const h = place(emptyBoard(N), 1, [[2, 1], [2, 2], [2, 3], [2, 4], [2, 5]]);
  assert.deepEqual(winningLine(h, N, at(2, 3)), [at(2, 1), at(2, 2), at(2, 3), at(2, 4), at(2, 5)]);
  const v = place(emptyBoard(N), 2, [[0, 9], [1, 9], [2, 9], [3, 9], [4, 9]]);
  assert.ok(winningLine(v, N, at(0, 9)));
  const d = place(emptyBoard(N), 1, [[5, 5], [6, 6], [7, 7], [8, 8], [9, 9]]);
  assert.ok(winningLine(d, N, at(9, 9)));
  const a = place(emptyBoard(N), 1, [[0, 4], [1, 3], [2, 2], [3, 1], [4, 0]]);
  assert.ok(winningLine(a, N, at(2, 2)));
});

test('4 seguidas não chegam e não dá a volta ao tabuleiro', () => {
  const four = place(emptyBoard(N), 1, [[3, 0], [3, 1], [3, 2], [3, 3]]);
  assert.equal(winningLine(four, N, at(3, 3)), null);
  const wrap = place(emptyBoard(N), 1, [[0, 7], [0, 8], [0, 9], [1, 0], [1, 1]]);
  assert.equal(winningLine(wrap, N, at(0, 9)), null);
});

test('computador começa no meio de um tabuleiro vazio', () => {
  assert.equal(computerMove(emptyBoard(N), N, 2, 'dificil'), at(5, 5));
});

test('computador completa o seu 5 (fácil e difícil)', () => {
  for (const level of ['facil', 'dificil']) {
    const board = place(emptyBoard(N), 2, [[4, 2], [4, 3], [4, 4], [4, 5]]);
    place(board, 1, [[4, 1], [6, 6], [7, 7]]);
    assert.equal(computerMove(board, N, 2, level), at(4, 6));
  }
});

test('difícil bloqueia 4 seguidas do adversário', () => {
  const board = place(emptyBoard(N), 1, [[5, 1], [5, 2], [5, 3], [5, 4]]);
  place(board, 2, [[5, 0], [8, 8]]);
  assert.equal(computerMove(board, N, 2, 'dificil'), at(5, 5));
});

test('difícil bloqueia 3 abertas do adversário', () => {
  const board = place(emptyBoard(N), 1, [[2, 3], [2, 4], [2, 5]]);
  place(board, 2, [[7, 7]]);
  assert.ok([at(2, 2), at(2, 6)].includes(computerMove(board, N, 2, 'dificil')));
});

test('jogo completo computador contra computador termina', () => {
  const board = emptyBoard(N);
  let turn = 1;
  let winner = null;
  while (!winner && !isFull(board)) {
    const i = computerMove(board, N, turn, turn === 1 ? 'facil' : 'dificil');
    assert.equal(board[i], null);
    board[i] = turn;
    if (winningLine(board, N, i)) winner = turn;
    turn = turn === 1 ? 2 : 1;
  }
  assert.ok(winner || isFull(board));
});
