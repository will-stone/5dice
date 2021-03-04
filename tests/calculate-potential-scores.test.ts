import { calculatePotentialScores } from '../source/calculate-potential-scores'

test.each`
  dice               | scores           | expected
  ${[1, 2, 3, 4, 5]} | ${{}}            | ${{ ones: 1, twos: 2, threes: 3, fours: 4, fives: 5, smallStraight: 30, largeStraight: 40, chance: 15 }}
  ${[1, 1, 3, 4, 5]} | ${{}}            | ${{ ones: 2, threes: 3, fours: 4, fives: 5, chance: 14 }}
  ${[1, 1, 1, 1, 5]} | ${{}}            | ${{ ones: 4, fives: 5, threeOfAKind: 9, fourOfAKind: 9, chance: 9 }}
  ${[1, 1, 1, 1, 1]} | ${{}}            | ${{ ones: 5, threeOfAKind: 5, fourOfAKind: 5, chance: 5, fiveDice: 50 }}
  ${[6, 3, 6, 2, 2]} | ${{}}            | ${{ twos: 4, threes: 3, sixes: 12, chance: 19 }}
  ${[1, 2, 2, 2, 2]} | ${{ ones: 2 }}   | ${{ twos: 8, threeOfAKind: 9, fourOfAKind: 9, chance: 9 }}
  ${[3, 2, 2, 2, 2]} | ${{ twos: 4 }}   | ${{ threes: 3, threeOfAKind: 11, fourOfAKind: 11, chance: 11 }}
  ${[3, 2, 2, 2, 2]} | ${{ threes: 3 }} | ${{ twos: 8, threeOfAKind: 11, fourOfAKind: 11, chance: 11 }}
  ${[4, 2, 2, 2, 2]} | ${{ fours: 8 }}  | ${{ twos: 8, threeOfAKind: 12, fourOfAKind: 12, chance: 12 }}
  ${[5, 2, 2, 2, 2]} | ${{ fives: 15 }} | ${{ twos: 8, threeOfAKind: 13, fourOfAKind: 13, chance: 13 }}
  ${[6, 2, 2, 2, 2]} | ${{ sixes: 18 }} | ${{ twos: 8, threeOfAKind: 14, fourOfAKind: 14, chance: 14 }}
  ${[6, 2, 2, 2, 2]} | ${{ fours: 0 }}  | ${{ twos: 8, sixes: 6, threeOfAKind: 14, fourOfAKind: 14, chance: 14 }}
  ${[6, 2, 2, 2, 2]} | ${{ sixes: 0 }}  | ${{ twos: 8, threeOfAKind: 14, fourOfAKind: 14, chance: 14 }}
`('upperboard', ({ dice, scores, expected }) => {
  expect(calculatePotentialScores(dice, scores)).toEqual(expected)
})

test.each`
  dice               | scores                 | expected
  ${[3, 3, 3, 1, 2]} | ${{}}                  | ${{ ones: 1, twos: 2, threes: 9, threeOfAKind: 12, chance: 12 }}
  ${[3, 3, 3, 3, 2]} | ${{}}                  | ${{ twos: 2, threes: 12, threeOfAKind: 14, fourOfAKind: 14, chance: 14 }}
  ${[3, 3, 3, 3, 3]} | ${{}}                  | ${{ threes: 15, threeOfAKind: 15, fourOfAKind: 15, chance: 15, fiveDice: 50 }}
  ${[5, 5, 3, 5, 3]} | ${{}}                  | ${{ threes: 6, fives: 15, threeOfAKind: 21, fullHouse: 25, chance: 21 }}
  ${[5, 5, 3, 5, 3]} | ${{ threeOfAKind: 3 }} | ${{ threes: 6, fives: 15, fullHouse: 25, chance: 21 }}
`('three of a kind', ({ dice, scores, expected }) => {
  expect(calculatePotentialScores(dice, scores)).toEqual(expected)
})

test.each`
  dice               | scores                | expected
  ${[3, 3, 3, 3, 2]} | ${{}}                 | ${{ twos: 2, threes: 12, threeOfAKind: 14, fourOfAKind: 14, chance: 14 }}
  ${[5, 5, 3, 5, 5]} | ${{}}                 | ${{ threes: 3, fives: 20, threeOfAKind: 23, fourOfAKind: 23, chance: 23 }}
  ${[5, 5, 3, 5, 5]} | ${{ fourOfAKind: 2 }} | ${{ threes: 3, fives: 20, threeOfAKind: 23, chance: 23 }}
`('four of a kind', ({ dice, scores, expected }) => {
  expect(calculatePotentialScores(dice, scores)).toEqual(expected)
})

test.each`
  dice               | scores               | expected
  ${[3, 3, 3, 1, 1]} | ${{}}                | ${{ ones: 2, threes: 9, threeOfAKind: 11, fullHouse: 25, chance: 11 }}
  ${[3, 3, 3, 1, 1]} | ${{ fullHouse: 25 }} | ${{ ones: 2, threes: 9, threeOfAKind: 11, chance: 11 }}
  ${[3, 3, 3, 1, 1]} | ${{ fullHouse: 0 }}  | ${{ ones: 2, threes: 9, threeOfAKind: 11, chance: 11 }}
`('full house', ({ dice, scores, expected }) => {
  expect(calculatePotentialScores(dice, scores)).toEqual(expected)
})

test.each`
  dice               | scores                                    | expected
  ${[1, 2, 3, 4, 5]} | ${{}}                                     | ${{ ones: 1, twos: 2, threes: 3, fours: 4, fives: 5, smallStraight: 30, largeStraight: 40, chance: 15 }}
  ${[2, 3, 4, 5, 6]} | ${{}}                                     | ${{ twos: 2, threes: 3, fours: 4, fives: 5, sixes: 6, smallStraight: 30, largeStraight: 40, chance: 20 }}
  ${[1, 2, 3, 4, 6]} | ${{}}                                     | ${{ ones: 1, twos: 2, threes: 3, fours: 4, sixes: 6, smallStraight: 30, chance: 16 }}
  ${[2, 3, 4, 3, 5]} | ${{}}                                     | ${{ twos: 2, threes: 6, fours: 4, fives: 5, smallStraight: 30, chance: 17 }}
  ${[3, 4, 6, 5, 6]} | ${{}}                                     | ${{ threes: 3, fours: 4, fives: 5, sixes: 12, smallStraight: 30, chance: 24 }}
  ${[2, 4, 5, 6, 1]} | ${{}}                                     | ${{ ones: 1, twos: 2, fours: 4, fives: 5, sixes: 6, chance: 18 }}
  ${[1, 2, 3, 4, 6]} | ${{ smallStraight: 30 }}                  | ${{ ones: 1, twos: 2, threes: 3, fours: 4, sixes: 6, chance: 16 }}
  ${[1, 2, 3, 4, 5]} | ${{ smallStraight: 30 }}                  | ${{ ones: 1, twos: 2, threes: 3, fours: 4, fives: 5, largeStraight: 40, chance: 15 }}
  ${[1, 2, 3, 4, 5]} | ${{ largeStraight: 40 }}                  | ${{ ones: 1, twos: 2, threes: 3, fours: 4, fives: 5, smallStraight: 30, chance: 15 }}
  ${[1, 2, 3, 4, 5]} | ${{ smallStraight: 0, largeStraight: 0 }} | ${{ ones: 1, twos: 2, threes: 3, fours: 4, fives: 5, chance: 15 }}
`('straights', ({ dice, scores, expected }) => {
  expect(calculatePotentialScores(dice, scores)).toEqual(expected)
})

test.each`
  dice               | scores            | expected
  ${[1, 2, 3, 4, 5]} | ${{}}             | ${{ ones: 1, twos: 2, threes: 3, fours: 4, fives: 5, smallStraight: 30, largeStraight: 40, chance: 15 }}
  ${[2, 4, 4, 5, 1]} | ${{}}             | ${{ ones: 1, twos: 2, fours: 8, fives: 5, chance: 16 }}
  ${[2, 4, 4, 5, 1]} | ${{ chance: 0 }}  | ${{ ones: 1, twos: 2, fours: 8, fives: 5 }}
  ${[2, 4, 4, 5, 1]} | ${{ chance: 23 }} | ${{ ones: 1, twos: 2, fours: 8, fives: 5 }}
`('chance', ({ dice, scores, expected }) => {
  expect(calculatePotentialScores(dice, scores)).toEqual(expected)
})

test.each`
  dice               | scores                        | expected
  ${[2, 2, 2, 2, 2]} | ${{}}                         | ${{ twos: 10, threeOfAKind: 10, fourOfAKind: 10, fiveDice: 50, chance: 10 }}
  ${[2, 2, 2, 2, 2]} | ${{ fiveDice: 0 }}            | ${{ twos: 10, threeOfAKind: 10, fourOfAKind: 10, chance: 10 }}
  ${[2, 2, 2, 2, 2]} | ${{ fiveDice: 50 }}           | ${{ twos: 10, fiveDice: 150 }}
  ${[2, 2, 2, 2, 2]} | ${{ twos: 4, fiveDice: 50 }}  | ${{ threeOfAKind: 10, fourOfAKind: 10, fullHouse: 25, smallStraight: 30, largeStraight: 40, chance: 10, fiveDice: 150 }}
  ${[2, 2, 2, 2, 2]} | ${{ twos: 4, fiveDice: 150 }} | ${{ threeOfAKind: 10, fourOfAKind: 10, fullHouse: 25, smallStraight: 30, largeStraight: 40, chance: 10, fiveDice: 250 }}
`('Five Dice', ({ dice, scores, expected }) => {
  expect(calculatePotentialScores(dice, scores)).toEqual(expected)
})

test('cannot score', () => {
  expect(
    calculatePotentialScores([1, 1, 2, 1, 1], {
      ones: 1,
      twos: 6,
      threeOfAKind: 10,
      fourOfAKind: 20,
      chance: 0,
    }),
  ).toEqual({
    threes: 0,
    fours: 0,
    fives: 0,
    sixes: 0,
    fullHouse: 0,
    smallStraight: 0,
    largeStraight: 0,
    fiveDice: 0,
  })
})

test('full score', () => {
  expect(
    calculatePotentialScores([1, 1, 2, 1, 2], { fives: 10 }),
  ).toStrictEqual({
    ones: 3,
    twos: 4,
    threes: undefined,
    fours: undefined,
    fives: undefined,
    sixes: undefined,
    threeOfAKind: 7,
    fourOfAKind: undefined,
    fullHouse: 25,
    smallStraight: undefined,
    largeStraight: undefined,
    chance: 7,
    fiveDice: undefined,
  })
})
