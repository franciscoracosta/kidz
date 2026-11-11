import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getWinner, isFull, computerMove, emptyBoard } from '../games/galo/logic.js';

const b = (s) => [...s].map((c) => (c === 'X' ? 1 : c === 'O' ? 2 : null));

test('deteta linha, coluna e diagonal', () => {
  assert.deepEqual(getWinner(b('XXX......')), { player: 1, line: [0, 1, 2] });
  assert.deepEqual(getWinner(b('O..O..O..')), { player: 2, line: [0, 3, 6] });
  assert.deepEqual(getWinner(b('..X.X.X..')), { player: 1, line: [2, 4, 6] });
  assert.equal(getWinner(b('XOX......')), null);
});

test('empate quando o tabuleiro enche sem vencedor', () => {
  const board = b('XOXXOOOXX');
  assert.equal(getWinner(board), null);
  assert.equal(isFull(board), true);
});

test('difícil ganha quando pode e bloqueia quando tem de ser', () => {
  assert.equal(computerMove(b('OO.XX....'), 2, 'dificil'), 2);
  assert.equal(computerMove(b('XX..O....'), 2, 'dificil'), 2);
});

test('fácil aproveita sempre uma vitória', () => {
  for (let k = 0; k < 20; k++) assert.equal(computerMove(b('OO.XX.X..'), 2, 'facil'), 2);
});

test('difícil nunca perde contra jogadas ao calhas', () => {
  for (let game = 0; game < 200; game++) {
    const board = emptyBoard();
    let turn = game % 2 ? 1 : 2;
    while (!getWinner(board) && !isFull(board)) {
      const free = board.flatMap((v, i) => (v ? [] : [i]));
      const i = turn === 2 ? computerMove(board, 2, 'dificil') : free[Math.floor(Math.random() * free.length)];
      board[i] = turn;
      turn = turn === 1 ? 2 : 1;
    }
    assert.notEqual(getWinner(board)?.player, 1);
  }
});
