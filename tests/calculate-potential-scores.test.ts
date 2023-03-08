import type { Dice } from '../source/calculate-potential-score.js'
import {
  calculatePotentialScore,
  dieNumberToId,
  isStraight,
} from '../source/calculate-potential-score.js'
import { initialState } from '../source/game-engine.js'
import type { Die } from '../source/model.js'

test.each([
  [[1, 1, 1, 1, 1], 2, false],
  [[1, 1, 1, 2, 1], 2, true],
  [[1, 2, 4, 5, 6], 4, false],
  [[1, 2, 4, 5, 1], 5, false],
  [[3, 2, 4, 5, 6], 4, true],
  [[3, 2, 4, 5, 6], 5, true],
] satisfies [Dice, number, boolean][])(
  'isStraight(%d)',
  (input, size, expected) => {
    expect(isStraight(input, size)).toBe(expected)
  },
)

test.each([
  [1, 'ones'],
  [2, 'twos'],
  [3, 'threes'],
  [4, 'fours'],
  [5, 'fives'],
  [6, 'sixes'],
] satisfies [Die['value'], string][])('isStraight(%d)', (input, expected) => {
  expect(dieNumberToId(input)).toBe(expected)
})

test('should return empty object when dice values not available', () => {
  expect(
    calculatePotentialScore([null, null, null, null, null], {}),
  ).toStrictEqual({})
})

test.each`
  dice               | score            | expected
  ${[1, 2, 3, 4, 5]} | ${{}}            | ${{ ones: 1, twos: 2, threes: 3, fours: 4, fives: 5, smallStraight: 30, largeStraight: 40, gamble: 15 }}
  ${[1, 1, 3, 4, 5]} | ${{}}            | ${{ ones: 2, threes: 3, fours: 4, fives: 5, gamble: 14 }}
  ${[1, 1, 1, 1, 5]} | ${{}}            | ${{ ones: 4, fives: 5, threeOfAKind: 9, fourOfAKind: 9, gamble: 9 }}
  ${[1, 1, 1, 1, 1]} | ${{}}            | ${{ 'ones': 5, 'threeOfAKind': 5, 'fourOfAKind': 5, 'gamble': 5, '5Dice': 50 }}
  ${[6, 3, 6, 2, 2]} | ${{}}            | ${{ twos: 4, threes: 3, sixes: 12, gamble: 19 }}
  ${[1, 2, 2, 2, 2]} | ${{ ones: 2 }}   | ${{ twos: 8, threeOfAKind: 9, fourOfAKind: 9, gamble: 9 }}
  ${[3, 2, 2, 2, 2]} | ${{ twos: 4 }}   | ${{ threes: 3, threeOfAKind: 11, fourOfAKind: 11, gamble: 11 }}
  ${[3, 2, 2, 2, 2]} | ${{ threes: 3 }} | ${{ twos: 8, threeOfAKind: 11, fourOfAKind: 11, gamble: 11 }}
  ${[4, 2, 2, 2, 2]} | ${{ fours: 8 }}  | ${{ twos: 8, threeOfAKind: 12, fourOfAKind: 12, gamble: 12 }}
  ${[5, 2, 2, 2, 2]} | ${{ fives: 15 }} | ${{ twos: 8, threeOfAKind: 13, fourOfAKind: 13, gamble: 13 }}
  ${[6, 2, 2, 2, 2]} | ${{ sixes: 18 }} | ${{ twos: 8, threeOfAKind: 14, fourOfAKind: 14, gamble: 14 }}
  ${[6, 2, 2, 2, 2]} | ${{ fours: 0 }}  | ${{ twos: 8, sixes: 6, threeOfAKind: 14, fourOfAKind: 14, gamble: 14 }}
  ${[6, 2, 2, 2, 2]} | ${{ sixes: 0 }}  | ${{ twos: 8, threeOfAKind: 14, fourOfAKind: 14, gamble: 14 }}
`('[upperboard] dice: $dice, score: $score', ({ dice, score, expected }) => {
  expect(calculatePotentialScore(dice, score)).toStrictEqual({
    ...initialState.scores,
    ...expected,
  })
})

test.each`
  dice               | score                  | expected
  ${[3, 3, 3, 1, 2]} | ${{}}                  | ${{ ones: 1, twos: 2, threes: 9, threeOfAKind: 12, gamble: 12 }}
  ${[3, 3, 3, 3, 2]} | ${{}}                  | ${{ twos: 2, threes: 12, threeOfAKind: 14, fourOfAKind: 14, gamble: 14 }}
  ${[3, 3, 3, 3, 3]} | ${{}}                  | ${{ 'threes': 15, 'threeOfAKind': 15, 'fourOfAKind': 15, 'gamble': 15, '5Dice': 50 }}
  ${[5, 5, 3, 5, 3]} | ${{}}                  | ${{ threes: 6, fives: 15, threeOfAKind: 21, fullHouse: 25, gamble: 21 }}
  ${[5, 5, 3, 5, 3]} | ${{ threeOfAKind: 3 }} | ${{ threes: 6, fives: 15, fullHouse: 25, gamble: 21 }}
`(
  '[three of a kind] dice: $dice, score: $score',
  ({ dice, score, expected }) => {
    expect(calculatePotentialScore(dice, score)).toStrictEqual({
      ...initialState.scores,
      ...expected,
    })
  },
)

test.each`
  dice               | score                 | expected
  ${[3, 3, 3, 3, 2]} | ${{}}                 | ${{ twos: 2, threes: 12, threeOfAKind: 14, fourOfAKind: 14, gamble: 14 }}
  ${[5, 5, 3, 5, 5]} | ${{}}                 | ${{ threes: 3, fives: 20, threeOfAKind: 23, fourOfAKind: 23, gamble: 23 }}
  ${[5, 5, 3, 5, 5]} | ${{ fourOfAKind: 2 }} | ${{ threes: 3, fives: 20, threeOfAKind: 23, gamble: 23 }}
`(
  '[four of a kind] dice: $dice, score: $score',
  ({ dice, score, expected }) => {
    expect(calculatePotentialScore(dice, score)).toStrictEqual({
      ...initialState.scores,
      ...expected,
    })
  },
)

test.each`
  dice               | score                | expected
  ${[3, 3, 3, 1, 1]} | ${{}}                | ${{ ones: 2, threes: 9, threeOfAKind: 11, fullHouse: 25, gamble: 11 }}
  ${[3, 3, 3, 1, 1]} | ${{ fullHouse: 25 }} | ${{ ones: 2, threes: 9, threeOfAKind: 11, gamble: 11 }}
  ${[3, 3, 3, 1, 1]} | ${{ fullHouse: 0 }}  | ${{ ones: 2, threes: 9, threeOfAKind: 11, gamble: 11 }}
`('[full house] dice: $dice, score: $score', ({ dice, score, expected }) => {
  expect(calculatePotentialScore(dice, score)).toStrictEqual({
    ...initialState.scores,
    ...expected,
  })
})

test.each`
  dice               | score                                     | expected
  ${[1, 2, 3, 4, 5]} | ${{}}                                     | ${{ ones: 1, twos: 2, threes: 3, fours: 4, fives: 5, smallStraight: 30, largeStraight: 40, gamble: 15 }}
  ${[2, 3, 4, 5, 6]} | ${{}}                                     | ${{ twos: 2, threes: 3, fours: 4, fives: 5, sixes: 6, smallStraight: 30, largeStraight: 40, gamble: 20 }}
  ${[1, 2, 3, 4, 6]} | ${{}}                                     | ${{ ones: 1, twos: 2, threes: 3, fours: 4, sixes: 6, smallStraight: 30, gamble: 16 }}
  ${[2, 3, 4, 3, 5]} | ${{}}                                     | ${{ twos: 2, threes: 6, fours: 4, fives: 5, smallStraight: 30, gamble: 17 }}
  ${[3, 4, 6, 5, 6]} | ${{}}                                     | ${{ threes: 3, fours: 4, fives: 5, sixes: 12, smallStraight: 30, gamble: 24 }}
  ${[2, 4, 5, 6, 1]} | ${{}}                                     | ${{ ones: 1, twos: 2, fours: 4, fives: 5, sixes: 6, gamble: 18 }}
  ${[1, 2, 3, 4, 6]} | ${{ smallStraight: 30 }}                  | ${{ ones: 1, twos: 2, threes: 3, fours: 4, sixes: 6, gamble: 16 }}
  ${[1, 2, 3, 4, 5]} | ${{ smallStraight: 30 }}                  | ${{ ones: 1, twos: 2, threes: 3, fours: 4, fives: 5, largeStraight: 40, gamble: 15 }}
  ${[1, 2, 3, 4, 5]} | ${{ largeStraight: 40 }}                  | ${{ ones: 1, twos: 2, threes: 3, fours: 4, fives: 5, smallStraight: 30, gamble: 15 }}
  ${[1, 2, 3, 4, 5]} | ${{ smallStraight: 0, largeStraight: 0 }} | ${{ ones: 1, twos: 2, threes: 3, fours: 4, fives: 5, gamble: 15 }}
`('[straights] dice: $dice, score: $score', ({ dice, score, expected }) => {
  expect(calculatePotentialScore(dice, score)).toStrictEqual({
    ...initialState.scores,
    ...expected,
  })
})

test.each`
  dice               | score             | expected
  ${[1, 2, 3, 4, 5]} | ${{}}             | ${{ ones: 1, twos: 2, threes: 3, fours: 4, fives: 5, smallStraight: 30, largeStraight: 40, gamble: 15 }}
  ${[2, 4, 4, 5, 1]} | ${{}}             | ${{ ones: 1, twos: 2, fours: 8, fives: 5, gamble: 16 }}
  ${[2, 4, 4, 5, 1]} | ${{ gamble: 0 }}  | ${{ ones: 1, twos: 2, fours: 8, fives: 5 }}
  ${[2, 4, 4, 5, 1]} | ${{ gamble: 23 }} | ${{ ones: 1, twos: 2, fours: 8, fives: 5 }}
`('[gamble] dice: $dice, score: $score', ({ dice, score, expected }) => {
  expect(calculatePotentialScore(dice, score)).toStrictEqual({
    ...initialState.scores,
    ...expected,
  })
})

test.each`
  dice               | score                                                                                                                                   | expected
  ${[2, 2, 2, 2, 2]} | ${{}}                                                                                                                                   | ${{ 'twos': 10, 'threeOfAKind': 10, 'fourOfAKind': 10, '5Dice': 50, 'gamble': 10 }}
  ${[2, 2, 2, 2, 2]} | ${{ '5Dice': 0 }}                                                                                                                       | ${{ twos: 10, threeOfAKind: 10, fourOfAKind: 10, gamble: 10 }}
  ${[2, 2, 2, 2, 2]} | ${{ '5Dice': 50 }}                                                                                                                      | ${{ 'twos': 10, '5Dice': 150 }}
  ${[2, 2, 2, 2, 2]} | ${{ 'twos': 4, '5Dice': 50 }}                                                                                                           | ${{ 'threeOfAKind': 10, 'fourOfAKind': 10, 'fullHouse': 25, 'smallStraight': 30, 'largeStraight': 40, 'gamble': 10, '5Dice': 150 }}
  ${[2, 2, 2, 2, 2]} | ${{ 'twos': 4, '5Dice': 150 }}                                                                                                          | ${{ 'threeOfAKind': 10, 'fourOfAKind': 10, 'fullHouse': 25, 'smallStraight': 30, 'largeStraight': 40, 'gamble': 10, '5Dice': 250 }}
  ${[2, 2, 2, 2, 2]} | ${{ 'twos': 4, 'threeOfAKind': 1, 'fourOfAKind': 1, 'fullHouse': 1, 'smallStraight': 1, 'largeStraight': 1, 'gamble': 1, '5Dice': 50 }} | ${{ 'ones': 0, 'threes': 0, 'fours': 0, 'fives': 0, 'sixes': 0, '5Dice': 150 }}
`('[Five Dice] dice: $dice, score: $score', ({ dice, score, expected }) => {
  expect(calculatePotentialScore(dice, score)).toStrictEqual({
    ...initialState.scores,
    ...expected,
  })
})

test('cannot score', () => {
  expect(
    calculatePotentialScore([1, 1, 2, 1, 1], {
      ones: 1,
      twos: 6,
      threeOfAKind: 10,
      fourOfAKind: 20,
      gamble: 0,
    }),
  ).toStrictEqual({
    ...initialState.scores,
    'threes': 0,
    'fours': 0,
    'fives': 0,
    'sixes': 0,
    'fullHouse': 0,
    'smallStraight': 0,
    'largeStraight': 0,
    '5Dice': 0,
  })
})

test('full score', () => {
  expect(calculatePotentialScore([1, 1, 2, 1, 2], { fives: 10 })).toStrictEqual(
    {
      ...initialState.scores,
      ones: 3,
      twos: 4,
      threeOfAKind: 7,
      fullHouse: 25,
      gamble: 7,
    },
  )
})
