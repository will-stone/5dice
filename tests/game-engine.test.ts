import { createStore } from '2n8'
import type * as tings from 'tings'
import type { MockInstance } from 'vitest'
import { beforeEach, expect, test, vi } from 'vitest'

import { GameEngine } from '../source/game-engine.js'
import type { Die, State } from '../source/model.js'
import * as utils from '../source/utils.js'

const initialState: State = {
  dice: [
    { value: null, held: false },
    { value: null, held: false },
    { value: null, held: false },
    { value: null, held: false },
    { value: null, held: false },
  ],
  scores: {
    ones: undefined,
    twos: undefined,
    threes: undefined,
    fours: undefined,
    fives: undefined,
    sixes: undefined,
    threeOfAKind: undefined,
    fourOfAKind: undefined,
    fullHouse: undefined,
    smallStraight: undefined,
    largeStraight: undefined,
    gamble: undefined,
    '5Dice': undefined,
  },
  turn: 0,
  topScores: [],
}

let d6Spy: MockInstance<[], Die['value']>

// Make Tings' sleep function return immediately so tests run quicker
vi.mock('tings', async () => ({
  ...(await vi.importActual<typeof tings>('tings')),
  sleep: () =>
    new Promise<void>((resolve) => {
      resolve()
    }),
}))

beforeEach(() => {
  // Set all timestamps to 0
  vi.useFakeTimers()
  vi.setSystemTime(0)
  // Overwrite biasedD6 as it will get stuck if d6 is mocked and cannot change
  vi.spyOn(utils, 'biasedD6').mockImplementation(() => 1 as Die['value'])
  d6Spy = vi.spyOn(utils, 'd6')
})

test('should report game as started after first roll, or a score in the scoreboard', async () => {
  const game1 = createStore(new GameEngine())
  expect(game1.getState().isGameStart).toBeTruthy()
  await game1.getState().roll()
  expect(game1.getState().isGameStart).toBeFalsy()

  const game2 = createStore(new GameEngine())
  game2.getState().loadState({
    ...initialState,
    scores: { ...initialState.scores, gamble: 5 },
  })

  expect(game2.getState().isGameStart).toBeFalsy()
})

test('should only allow three rolls', async () => {
  const game = createStore(new GameEngine())
  expect(game.getState().canRoll).toBeTruthy()
  await game.getState().roll()
  expect(game.getState().canRoll).toBeTruthy()
  await game.getState().roll()
  expect(game.getState().canRoll).toBeTruthy()
  await game.getState().roll()
  expect(game.getState().canRoll).toBeFalsy()
  await game.getState().roll()
  expect(game.getState().canRoll).toBeFalsy()
})

test('should advance turn on roll', async () => {
  const game = createStore(new GameEngine())
  expect(game.getState().turn).toBe(0)
  await game.getState().roll()
  expect(game.getState().turn).toBe(1)
  await game.getState().roll()
  expect(game.getState().turn).toBe(2)
  await game.getState().roll()
  expect(game.getState().turn).toBe(3)
  await game.getState().roll()
  expect(game.getState().turn).toBe(3)
})

test('should only show rolling during rolls', async () => {
  const game = createStore(new GameEngine())
  expect(game.getState().turn).toBe(0)
  expect(game.getState().isRolling).toBeFalsy()

  expect(game.getState().canRoll).toBeTruthy()
  const roll1 = game.getState().roll()
  expect(game.getState().turn).toBe(1)
  expect(game.getState().isRolling).toBeTruthy()
  expect(game.getState().potentialScoreboard).toStrictEqual({})
  await roll1
  expect(game.getState().turn).toBe(1)
  expect(game.getState().isRolling).toBeFalsy()

  expect(game.getState().canRoll).toBeTruthy()
  const roll2 = game.getState().roll()
  expect(game.getState().turn).toBe(2)
  expect(game.getState().isRolling).toBeTruthy()
  await roll2
  expect(game.getState().turn).toBe(2)
  expect(game.getState().isRolling).toBeFalsy()

  expect(game.getState().canRoll).toBeTruthy()
  const roll3 = game.getState().roll()
  expect(game.getState().turn).toBe(3)
  expect(game.getState().isRolling).toBeTruthy()
  await roll3
  const roll3Dice = game.getState().dice
  expect(game.getState().turn).toBe(3)
  expect(game.getState().isRolling).toBeFalsy()

  expect(game.getState().canRoll).toBeFalsy()
  const roll4 = game.getState().roll()
  expect(game.getState().turn).toBe(3)
  expect(game.getState().isRolling).toBeFalsy()
  await roll4
  const roll4Dice = game.getState().dice
  expect(game.getState().turn).toBe(3)
  expect(game.getState().isRolling).toBeFalsy()

  expect(roll3Dice).toStrictEqual(roll4Dice)
})

test('should update dice', async () => {
  const game = createStore(new GameEngine())
  expect(game.getState().dice).toStrictEqual(initialState.dice)
  d6Spy
    .mockReturnValueOnce(1)
    .mockReturnValueOnce(2)
    .mockReturnValueOnce(2)
    .mockReturnValueOnce(4)
    .mockReturnValueOnce(3)
  await game.getState().roll()
  expect(game.getState().dice).toStrictEqual([
    { value: 1, held: false },
    { value: 2, held: false },
    { value: 2, held: false },
    { value: 4, held: false },
    { value: 3, held: false },
  ])
})

test('should hold dice', async () => {
  const game = createStore(new GameEngine())
  expect(game.getState().dice).toStrictEqual(initialState.dice)
  d6Spy
    .mockReturnValueOnce(1)
    .mockReturnValueOnce(2)
    .mockReturnValueOnce(2)
    .mockReturnValueOnce(4)
    .mockReturnValueOnce(3)
  await game.getState().roll()
  game.getState().hold(2)
  game.getState().hold(4)
  expect(game.getState().dice).toStrictEqual([
    { value: 1, held: false },
    { value: 2, held: false },
    { value: 2, held: true },
    { value: 4, held: false },
    { value: 3, held: true },
  ])
  d6Spy.mockReturnValueOnce(2).mockReturnValueOnce(6).mockReturnValueOnce(5)
  await game.getState().roll()
  expect(game.getState().dice).toStrictEqual([
    { value: 2, held: false },
    { value: 6, held: false },
    { value: 2, held: true },
    { value: 5, held: false },
    { value: 3, held: true },
  ])
})

test('should not hold dice before first roll', () => {
  const game = createStore(new GameEngine())
  expect(game.getState().dice).toStrictEqual(initialState.dice)
  game.getState().hold(0)
  game.getState().hold(1)
  game.getState().hold(3)
  expect(game.getState().dice).toStrictEqual(initialState.dice)
})

test('should score', async () => {
  const game = createStore(new GameEngine())
  expect(game.getState().dice).toStrictEqual(initialState.dice)
  expect(game.getState().gameState).toStrictEqual({
    dice: initialState.dice,
    scores: initialState.scores,
    topScores: initialState.topScores,
    turn: initialState.turn,
  })
  d6Spy
    .mockReturnValueOnce(6)
    .mockReturnValueOnce(6)
    .mockReturnValueOnce(3)
    .mockReturnValueOnce(3)
    .mockReturnValueOnce(3)
  await game.getState().roll()
  expect(game.getState().potentialScoreboard).toStrictEqual({
    ...initialState.scores,
    fullHouse: 25,
    gamble: 21,
    sixes: 12,
    threes: 9,
    threeOfAKind: 21,
  })
  expect(game.getState().gameState).toStrictEqual({
    dice: [
      { value: 6, held: false },
      { value: 6, held: false },
      { value: 3, held: false },
      { value: 3, held: false },
      { value: 3, held: false },
    ],
    scores: initialState.scores,
    topScores: initialState.topScores,
    turn: 1,
  })
  game.getState().score('fullHouse')
  expect(game.getState().scores).toStrictEqual({
    ...initialState.scores,
    fullHouse: 25,
  })
  expect(game.getState().gameState).toStrictEqual({
    dice: [
      { value: null, held: false },
      { value: null, held: false },
      { value: null, held: false },
      { value: null, held: false },
      { value: null, held: false },
    ],
    scores: { ...initialState.scores, fullHouse: 25 },
    topScores: initialState.topScores,
    turn: 0,
  })
})

test.each([
  [{}, 0],
  [{ ones: 2 }, 2],
  [{ ones: 2, twos: 2 }, 4],
  [{ ones: 2, twos: 2, threes: 9 }, 13],
  [{ ones: 2, twos: 2, threes: 9, fours: 4 }, 17],
  [{ ones: 2, twos: 2, threes: 9, fours: 4, fives: 10 }, 27],
  [{ ones: 2, twos: 2, threes: 9, fours: 4, fives: 10, sixes: 18 }, 45],
  [{ ones: 0, twos: 0, threes: 0, fours: 0, fives: 0, sixes: 0 }, 0],
])('should total upper board with scoreboard of %o', (scores, expected) => {
  const game = createStore(new GameEngine())
  game.getState().loadState({
    ...initialState,
    scores: { ...initialState.scores, ...scores },
  })

  expect(game.getState().upperBoardSum).toBe(expected)
})

test.each([
  [{ ones: 0, twos: 0, threes: 0, fours: 0, fives: 0, sixes: 0 }, 0],
  [{ ones: 0, twos: 0, threes: 9, fours: 0, fives: 0, sixes: 0 }, 0],
  [{ ones: 5, twos: 8, threes: 9, fours: 12, fives: 0, sixes: 0 }, 0],
  [{ ones: 5, twos: 8, threes: 9, fours: 16, fives: 0, sixes: 0 }, 0],
  [{ ones: 4, twos: 8, threes: 9, fours: 16, fives: 25, sixes: 0 }, 0],
  [{ ones: 5, twos: 8, threes: 9, fours: 16, fives: 25, sixes: 0 }, 35],
  [{ ones: 5, twos: 8, threes: 9, fours: 16, fives: 25, sixes: 6 }, 35],
])(
  'should calculate upper board bonus with scoreboard of %o',
  (scores, expected) => {
    const game = createStore(new GameEngine())
    game.getState().loadState({
      ...initialState,
      scores: { ...initialState.scores, ...scores },
    })

    expect(game.getState().upperBoardBonus).toBe(expected)
  },
)

test.each([
  [{}, 0],
  [{ threeOfAKind: 8 }, 8],
  [{ threeOfAKind: 8, fourOfAKind: 18 }, 26],
  [{ threeOfAKind: 8, fourOfAKind: 18, fullHouse: 25 }, 51],
  [{ threeOfAKind: 8, fourOfAKind: 18, fullHouse: 25, smallStraight: 30 }, 81],
  [
    {
      threeOfAKind: 8,
      fourOfAKind: 18,
      fullHouse: 25,
      smallStraight: 30,
      largeStraight: 40,
    },
    121,
  ],
  [
    {
      threeOfAKind: 8,
      fourOfAKind: 18,
      fullHouse: 25,
      smallStraight: 30,
      largeStraight: 40,
      gamble: 18,
    },
    139,
  ],
  [
    {
      threeOfAKind: 8,
      fourOfAKind: 18,
      fullHouse: 25,
      smallStraight: 30,
      largeStraight: 40,
      gamble: 18,
      '5Dice': 50,
    },
    189,
  ],
  [
    {
      threeOfAKind: 0,
      fourOfAKind: 0,
      fullHouse: 0,
      smallStraight: 0,
      largeStraight: 0,
      gamble: 0,
      '5Dice': 0,
    },
    0,
  ],
])('should total lower board with scoreboard of %o', (scores, expected) => {
  const game = createStore(new GameEngine())
  game.getState().loadState({
    ...initialState,
    scores: { ...initialState.scores, ...scores },
  })

  expect(game.getState().lowerBoardSum).toBe(expected)
})

test('should end game and restart', async () => {
  d6Spy
    .mockReturnValueOnce(3)
    .mockReturnValueOnce(3)
    .mockReturnValueOnce(3)
    .mockReturnValueOnce(3)
    .mockReturnValueOnce(3)

  const game = createStore(new GameEngine())
  game.getState().loadState({
    ...initialState,
    scores: {
      ones: 2,
      twos: 6,
      threes: 12,
      fours: 4,
      fives: 0,
      sixes: 6,
      threeOfAKind: 8,
      fourOfAKind: 22,
      fullHouse: 25,
      smallStraight: 0,
      largeStraight: 30,
      gamble: 16,
      '5Dice': undefined,
    },
  })

  expect(game.getState().upperBoardSum).toBe(30)
  expect(game.getState().lowerBoardSum).toBe(101)
  expect(game.getState().total).toBe(131)

  expect(game.getState().isGameOver).toBeFalsy()
  await game.getState().roll()
  expect(game.getState().potentialScoreboard).toStrictEqual({
    ...initialState.scores,
    '5Dice': 50,
  })
  game.getState().score('5Dice')
  expect(game.getState().topScores).toStrictEqual([
    { score: 181, timestamp: 0 },
  ])
  expect(game.getState().dice).toStrictEqual(initialState.dice)
  expect(game.getState().scores).toStrictEqual(initialState.scores)
  expect(game.getState().potentialScoreboard).toStrictEqual({})
  expect(game.getState().turn).toStrictEqual(initialState.turn)
  expect(game.getState().gameState).toStrictEqual({
    dice: initialState.dice,
    scores: initialState.scores,
    topScores: [{ score: 181, timestamp: 0 }],
    turn: initialState.turn,
  })
})

test('should show potential jokers', async () => {
  const game = createStore(new GameEngine())
  expect(game.getState().potentialHasJoker).toBeFalsy()
  expect(game.getState().jokerCount).toBe(0)
  d6Spy
    .mockReturnValueOnce(3)
    .mockReturnValueOnce(3)
    .mockReturnValueOnce(3)
    .mockReturnValueOnce(3)
    .mockReturnValueOnce(3)
  await game.getState().roll()
  expect(game.getState().potentialHasJoker).toBeFalsy()
  game.getState().score('5Dice')
  expect(game.getState().scores).toStrictEqual({
    ...initialState.scores,
    '5Dice': 50,
  })
  expect(game.getState().potentialHasJoker).toBeFalsy()
  d6Spy
    .mockReturnValueOnce(6)
    .mockReturnValueOnce(6)
    .mockReturnValueOnce(6)
    .mockReturnValueOnce(6)
    .mockReturnValueOnce(6)
  await game.getState().roll()
  expect(game.getState().potentialHasJoker).toBeTruthy()
  expect(game.getState().jokerCount).toBe(0)
  game.getState().score('5Dice')
  expect(game.getState().jokerCount).toBe(1)
})
