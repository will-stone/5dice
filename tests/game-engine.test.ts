import * as tings from 'tings'

import { GameEngine, initialState } from '../source/game-engine'
import * as utils from '../source/utils'

// Make Tings' sleep function return immediately so tests run quicker
jest.spyOn(tings, 'sleep').mockImplementation(
  () =>
    new Promise((resolve) => {
      resolve()
    }),
)

// Overwrite biasedD6 as it will get stuck if d6 is mocked and cannot change
jest.spyOn(utils, 'biasedD6').mockImplementation(() => 1)

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
  const d6Spy = jest.spyOn(utils, 'd6')
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
  d6Spy.mockRestore()
})

test('should hold dice', async () => {
  const d6Spy = jest.spyOn(utils, 'd6')
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
  d6Spy.mockRestore()
})

test('should not hold dice before first roll', () => {
  const d6Spy = jest.spyOn(utils, 'd6')
  const game = new GameEngine(initialState)
  expect(game.dice).toStrictEqual(initialState.dice)
  game.hold(0)
  game.hold(1)
  game.hold(3)
  expect(game.dice).toStrictEqual(initialState.dice)
  d6Spy.mockRestore()
})

test('should score', async () => {
  const d6Spy = jest.spyOn(utils, 'd6')
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
  d6Spy.mockRestore()
})
