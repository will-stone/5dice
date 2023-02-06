import * as tings from 'tings'

import { GameEngine, initialState } from '../source/game-engine'
import * as utils from '../source/utils'

let d6Spy: jest.SpyInstance<1 | 2 | 3 | 4 | 5 | 6, [], unknown>

jest.useFakeTimers()
jest.setSystemTime(0)

// Make Tings' sleep function return immediately so tests run quicker
jest.spyOn(tings, 'sleep').mockImplementation(
  () =>
    new Promise((resolve) => {
      resolve()
    }),
)

// Overwrite biasedD6 as it will get stuck if d6 is mocked and cannot change
jest.spyOn(utils, 'biasedD6').mockImplementation(() => 1)

beforeEach(() => {
  d6Spy = jest.spyOn(utils, 'd6')
})

afterEach(() => {
  d6Spy.mockRestore()
})

test('should report game as started after first roll, or a score in the scoreboard', async () => {
  const game1 = new GameEngine(initialState)
  expect(game1.isGameStart).toBe(true)
  await game1.roll()
  expect(game1.isGameStart).toBe(false)

  const game2 = new GameEngine({
    ...initialState,
    scores: { ...initialState.scores, gamble: 5 },
  })

  expect(game2.isGameStart).toBe(false)
})

test('should only allow three rolls', async () => {
  const game = new GameEngine(initialState)
  expect(game.canRoll).toBe(true)
  await game.roll()
  expect(game.canRoll).toBe(true)
  await game.roll()
  expect(game.canRoll).toBe(true)
  await game.roll()
  expect(game.canRoll).toBe(false)
  await game.roll()
  expect(game.canRoll).toBe(false)
})

test('should advance turn on roll', async () => {
  const game = new GameEngine(initialState)
  expect(game.turn).toBe(0)
  await game.roll()
  expect(game.turn).toBe(1)
  await game.roll()
  expect(game.turn).toBe(2)
  await game.roll()
  expect(game.turn).toBe(3)
  await game.roll()
  expect(game.turn).toBe(3)
})

test('should only show rolling during rolls', async () => {
  const game = new GameEngine(initialState)
  expect(game.turn).toBe(0)
  expect(game.isRolling).toBe(false)

  expect(game.canRoll).toBe(true)
  const roll1 = game.roll()
  expect(game.turn).toBe(1)
  expect(game.isRolling).toBe(true)
  await roll1
  expect(game.turn).toBe(1)
  expect(game.isRolling).toBe(false)

  expect(game.canRoll).toBe(true)
  const roll2 = game.roll()
  expect(game.turn).toBe(2)
  expect(game.isRolling).toBe(true)
  await roll2
  expect(game.turn).toBe(2)
  expect(game.isRolling).toBe(false)

  expect(game.canRoll).toBe(true)
  const roll3 = game.roll()
  expect(game.turn).toBe(3)
  expect(game.isRolling).toBe(true)
  await roll3
  const roll3Dice = game.dice
  expect(game.turn).toBe(3)
  expect(game.isRolling).toBe(false)

  expect(game.canRoll).toBe(false)
  const roll4 = game.roll()
  expect(game.turn).toBe(3)
  expect(game.isRolling).toBe(false)
  await roll4
  const roll4Dice = game.dice
  expect(game.turn).toBe(3)
  expect(game.isRolling).toBe(false)

  expect(roll3Dice).toStrictEqual(roll4Dice)
})

test('should update dice', async () => {
  const game = new GameEngine(initialState)
  expect(game.dice).toStrictEqual(initialState.dice)
  d6Spy
    .mockReturnValueOnce(1)
    .mockReturnValueOnce(2)
    .mockReturnValueOnce(2)
    .mockReturnValueOnce(4)
    .mockReturnValueOnce(3)
  await game.roll()
  expect(game.dice).toStrictEqual([
    { value: 1, held: false },
    { value: 2, held: false },
    { value: 2, held: false },
    { value: 4, held: false },
    { value: 3, held: false },
  ])
})

test('should hold dice', async () => {
  const game = new GameEngine(initialState)
  expect(game.dice).toStrictEqual(initialState.dice)
  d6Spy
    .mockReturnValueOnce(1)
    .mockReturnValueOnce(2)
    .mockReturnValueOnce(2)
    .mockReturnValueOnce(4)
    .mockReturnValueOnce(3)
  await game.roll()
  game.hold(2)
  game.hold(4)
  expect(game.dice).toStrictEqual([
    { value: 1, held: false },
    { value: 2, held: false },
    { value: 2, held: true },
    { value: 4, held: false },
    { value: 3, held: true },
  ])
})

test('should not hold dice before first roll', () => {
  const game = new GameEngine(initialState)
  expect(game.dice).toStrictEqual(initialState.dice)
  game.hold(0)
  game.hold(1)
  game.hold(3)
  expect(game.dice).toStrictEqual(initialState.dice)
})

test('should score', async () => {
  const game = new GameEngine(initialState)
  expect(game.dice).toStrictEqual(initialState.dice)
  d6Spy
    .mockReturnValueOnce(6)
    .mockReturnValueOnce(6)
    .mockReturnValueOnce(3)
    .mockReturnValueOnce(3)
    .mockReturnValueOnce(3)
  await game.roll()
  expect(game.potential).toStrictEqual({
    ...initialState.potential,
    fullHouse: 25,
    gamble: 21,
    sixes: 12,
    threes: 9,
    threeOfAKind: 21,
  })
  game.score('fullHouse')
  expect(game.scores).toStrictEqual({ ...initialState.scores, fullHouse: 25 })
})

test('should end game and restart', async () => {
  d6Spy
    .mockReturnValueOnce(3)
    .mockReturnValueOnce(3)
    .mockReturnValueOnce(3)
    .mockReturnValueOnce(3)
    .mockReturnValueOnce(3)

  const game = new GameEngine({
    ...initialState,
    scores: {
      'ones': 2,
      'twos': 6,
      'threes': 12,
      'fours': 4,
      'fives': 0,
      'sixes': 6,
      'threeOfAKind': 8,
      'fourOfAKind': 22,
      'fullHouse': 25,
      'smallStraight': 0,
      'largeStraight': 30,
      'gamble': 16,
      '5Dice': undefined,
    },
  })

  expect(game.upperBoardSum).toBe(30)
  expect(game.lowerBoardSum).toBe(101)
  expect(game.total).toBe(131)

  expect(game.isGameOver).toBe(false)
  await game.roll()
  expect(game.potential).toStrictEqual({
    ...initialState.potential,
    '5Dice': 50,
  })
  game.score('5Dice')
  expect(game.topScores).toStrictEqual([{ score: 181, timestamp: 0 }])
  expect(game.dice).toStrictEqual(initialState.dice)
  expect(game.scores).toStrictEqual(initialState.scores)
  expect(game.potential).toStrictEqual(initialState.potential)
  expect(game.turn).toStrictEqual(initialState.turn)
})

test('should show potential jokers', async () => {
  const game = new GameEngine(initialState)
  expect(game.potentialHasJoker).toBe(false)
  expect(game.jokerCount).toBe(0)
  d6Spy
    .mockReturnValueOnce(3)
    .mockReturnValueOnce(3)
    .mockReturnValueOnce(3)
    .mockReturnValueOnce(3)
    .mockReturnValueOnce(3)
  await game.roll()
  expect(game.potentialHasJoker).toBe(false)
  game.score('5Dice')
  expect(game.scores).toStrictEqual({
    ...initialState.scores,
    '5Dice': 50,
  })
  expect(game.potentialHasJoker).toBe(false)
  d6Spy
    .mockReturnValueOnce(6)
    .mockReturnValueOnce(6)
    .mockReturnValueOnce(6)
    .mockReturnValueOnce(6)
    .mockReturnValueOnce(6)
  await game.roll()
  expect(game.potentialHasJoker).toBe(true)
  expect(game.jokerCount).toBe(0)
  game.score('5Dice')
  expect(game.jokerCount).toBe(1)
})
