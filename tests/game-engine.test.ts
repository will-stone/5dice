import { createStore } from '2n8'
import type * as tings from 'tings'
import type { MockInstance } from 'vitest'
import { beforeEach, expect, test, vi } from 'vitest'

import { GameEngine } from '../source/game-engine.js'
import type { Die, State } from '../source/model.js'
import * as utils from '../source/utils.js'


const getInitialState: () => State = () => ({
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
})

let d6Spy: MockInstance<() => Die['value']>

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

  expect(game1.store.isGameStart).toBe(true)

  await game1.store.roll()

  expect(game1.store.isGameStart).toBe(false)

  const game2 = createStore(new GameEngine())
  game2.store.loadState({
    ...getInitialState(),
    scores: { ...getInitialState().scores, gamble: 5 },
  })

  expect(game2.store.isGameStart).toBe(false)
})

test('should only allow three rolls', async () => {
  const game = createStore(new GameEngine())

  expect(game.store.canRoll).toBe(true)

  await game.store.roll()

  expect(game.store.canRoll).toBe(true)

  await game.store.roll()

  expect(game.store.canRoll).toBe(true)

  await game.store.roll()

  expect(game.store.canRoll).toBe(false)

  await game.store.roll()

  expect(game.store.canRoll).toBe(false)
})

test('should advance turn on roll', async () => {
  const game = createStore(new GameEngine())

  expect(game.store.turn).toBe(0)

  await game.store.roll()

  expect(game.store.turn).toBe(1)

  await game.store.roll()

  expect(game.store.turn).toBe(2)

  await game.store.roll()

  expect(game.store.turn).toBe(3)

  await game.store.roll()

  expect(game.store.turn).toBe(3)
})

test('should only show rolling during rolls', async () => {
  const game = createStore(new GameEngine())

  expect(game.store.turn).toBe(0)
  expect(game.store.isRolling).toBe(false)

  expect(game.store.canRoll).toBe(true)

  const roll1 = game.store.roll()

  expect(game.store.turn).toBe(1)
  expect(game.store.isRolling).toBe(true)
  expect(game.store.potentialScoreboard).toStrictEqual({})

  await roll1

  expect(game.store.turn).toBe(1)
  expect(game.store.isRolling).toBe(false)

  expect(game.store.canRoll).toBe(true)

  const roll2 = game.store.roll()

  expect(game.store.turn).toBe(2)
  expect(game.store.isRolling).toBe(true)

  await roll2

  expect(game.store.turn).toBe(2)
  expect(game.store.isRolling).toBe(false)

  expect(game.store.canRoll).toBe(true)

  const roll3 = game.store.roll()

  expect(game.store.turn).toBe(3)
  expect(game.store.isRolling).toBe(true)

  await roll3
  const roll3Dice = game.store.dice

  expect(game.store.turn).toBe(3)
  expect(game.store.isRolling).toBe(false)

  expect(game.store.canRoll).toBe(false)

  const roll4 = game.store.roll()

  expect(game.store.turn).toBe(3)
  expect(game.store.isRolling).toBe(false)

  await roll4
  const roll4Dice = game.store.dice

  expect(game.store.turn).toBe(3)
  expect(game.store.isRolling).toBe(false)

  expect(roll3Dice).toStrictEqual(roll4Dice)
})

test('should update dice', async () => {
  const game = createStore(new GameEngine())

  expect(game.store.dice).toStrictEqual(getInitialState().dice)

  d6Spy
    .mockReturnValueOnce(1)
    .mockReturnValueOnce(2)
    .mockReturnValueOnce(2)
    .mockReturnValueOnce(4)
    .mockReturnValueOnce(3)
  await game.store.roll()

  expect(game.store.dice).toStrictEqual([
    { value: 1, held: false },
    { value: 2, held: false },
    { value: 2, held: false },
    { value: 4, held: false },
    { value: 3, held: false },
  ])
})

test('should hold dice', async () => {
  const game = createStore(new GameEngine())

  expect(game.store.dice).toStrictEqual(getInitialState().dice)

  d6Spy
    .mockReturnValueOnce(1)
    .mockReturnValueOnce(2)
    .mockReturnValueOnce(2)
    .mockReturnValueOnce(4)
    .mockReturnValueOnce(3)
  await game.store.roll()
  game.store.hold(2)
  game.store.hold(4)

  expect(game.store.dice).toStrictEqual([
    { value: 1, held: false },
    { value: 2, held: false },
    { value: 2, held: true },
    { value: 4, held: false },
    { value: 3, held: true },
  ])

  d6Spy.mockReturnValueOnce(2).mockReturnValueOnce(6).mockReturnValueOnce(5)
  await game.store.roll()

  expect(game.store.dice).toStrictEqual([
    { value: 2, held: false },
    { value: 6, held: false },
    { value: 2, held: true },
    { value: 5, held: false },
    { value: 3, held: true },
  ])
})

test('should not hold dice before first roll', () => {
  const game = createStore(new GameEngine())

  expect(game.store.dice).toStrictEqual(getInitialState().dice)

  game.store.hold(0)
  game.store.hold(1)
  game.store.hold(3)

  expect(game.store.dice).toStrictEqual(getInitialState().dice)
})

test('should score', async () => {
  const game = createStore(new GameEngine())

  expect(game.store.dice).toStrictEqual(getInitialState().dice)
  expect(game.store.gameState).toStrictEqual({
    dice: getInitialState().dice,
    scores: getInitialState().scores,
    topScores: getInitialState().topScores,
    turn: getInitialState().turn,
  })

  d6Spy
    .mockReturnValueOnce(6)
    .mockReturnValueOnce(6)
    .mockReturnValueOnce(3)
    .mockReturnValueOnce(3)
    .mockReturnValueOnce(3)
  await game.store.roll()

  expect(game.store.potentialScoreboard).toStrictEqual({
    ...getInitialState().scores,
    fullHouse: 25,
    gamble: 21,
    sixes: 12,
    threes: 9,
    threeOfAKind: 21,
  })
  expect(game.store.gameState).toStrictEqual({
    dice: [
      { value: 6, held: false },
      { value: 6, held: false },
      { value: 3, held: false },
      { value: 3, held: false },
      { value: 3, held: false },
    ],
    scores: getInitialState().scores,
    topScores: getInitialState().topScores,
    turn: 1,
  })

  game.store.score('fullHouse')

  expect(game.store.scores).toStrictEqual({
    ...getInitialState().scores,
    fullHouse: 25,
  })
  expect(game.store.gameState).toStrictEqual({
    dice: [
      { value: null, held: false },
      { value: null, held: false },
      { value: null, held: false },
      { value: null, held: false },
      { value: null, held: false },
    ],
    scores: { ...getInitialState().scores, fullHouse: 25 },
    topScores: getInitialState().topScores,
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
  game.store.loadState({
    ...getInitialState(),
    scores: { ...getInitialState().scores, ...scores },
  })

  expect(game.store.upperBoardSum).toBe(expected)
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
    game.store.loadState({
      ...getInitialState(),
      scores: { ...getInitialState().scores, ...scores },
    })

    expect(game.store.upperBoardBonus).toBe(expected)
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
  game.store.loadState({
    ...getInitialState(),
    scores: { ...getInitialState().scores, ...scores },
  })

  expect(game.store.lowerBoardSum).toBe(expected)
})

test('should end game and restart', async () => {
  d6Spy
    .mockReturnValueOnce(3)
    .mockReturnValueOnce(3)
    .mockReturnValueOnce(3)
    .mockReturnValueOnce(3)
    .mockReturnValueOnce(3)

  const game = createStore(new GameEngine())
  game.store.loadState({
    ...getInitialState(),
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

  expect(game.store.upperBoardSum).toBe(30)
  expect(game.store.lowerBoardSum).toBe(101)
  expect(game.store.total).toBe(131)

  expect(game.store.isGameOver).toBe(false)

  await game.store.roll()

  expect(game.store.potentialScoreboard).toStrictEqual({
    ...getInitialState().scores,
    '5Dice': 50,
  })

  game.store.score('5Dice')

  expect(game.store.topScores).toStrictEqual([
    { score: 181, timestamp: 0 },
  ])
  expect(game.store.dice).toStrictEqual(getInitialState().dice)
  expect(game.store.scores).toStrictEqual(getInitialState().scores)
  expect(game.store.potentialScoreboard).toStrictEqual({})
  expect(game.store.turn).toStrictEqual(getInitialState().turn)
  expect(game.store.gameState).toStrictEqual({
    dice: getInitialState().dice,
    scores: getInitialState().scores,
    topScores: [{ score: 181, timestamp: 0 }],
    turn: getInitialState().turn,
  })
})

test('should show potential jokers', async () => {
  const game = createStore(new GameEngine())

  expect(game.store.potentialHasJoker).toBe(false)
  expect(game.store.jokerCount).toBe(0)

  d6Spy
    .mockReturnValueOnce(3)
    .mockReturnValueOnce(3)
    .mockReturnValueOnce(3)
    .mockReturnValueOnce(3)
    .mockReturnValueOnce(3)
  await game.store.roll()

  expect(game.store.potentialHasJoker).toBe(false)

  game.store.score('5Dice')

  expect(game.store.scores).toStrictEqual({
    ...getInitialState().scores,
    '5Dice': 50,
  })
  expect(game.store.potentialHasJoker).toBe(false)

  d6Spy
    .mockReturnValueOnce(6)
    .mockReturnValueOnce(6)
    .mockReturnValueOnce(6)
    .mockReturnValueOnce(6)
    .mockReturnValueOnce(6)
  await game.store.roll()

  expect(game.store.potentialHasJoker).toBe(true)
  expect(game.store.jokerCount).toBe(0)

  game.store.score('5Dice')

  expect(game.store.jokerCount).toBe(1)
})
