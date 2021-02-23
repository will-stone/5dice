import { calculatePotentialScores } from '../source/calculate-potential-scores'
import { Scores } from '../source/model'

const s = (alteration?: Partial<Scores>) => ({
  ones: null,
  twos: null,
  threes: null,
  fours: null,
  fives: null,
  sixes: null,

  threeOfAKind: null,
  fourOfAKind: null,
  fullHouse: null,
  smallStraight: null,
  largeStraight: null,
  chance: null,
  fiveDice: null,
  ...alteration,
})

test.each`
  dice               | scores              | expected
  ${[1, 2, 3, 4, 5]} | ${s()}              | ${{ ones: '1', twos: '2', threes: '3', fours: '4', fives: '5', sixes: null }}
  ${[1, 1, 3, 4, 5]} | ${s()}              | ${{ ones: '2', twos: null, threes: '3', fours: '4', fives: '5', sixes: null }}
  ${[1, 1, 1, 1, 5]} | ${s()}              | ${{ ones: '4', twos: null, threes: null, fours: null, fives: '5', sixes: null }}
  ${[1, 1, 1, 1, 1]} | ${s()}              | ${{ ones: '5', twos: null, threes: null, fours: null, fives: null, sixes: null }}
  ${[6, 3, 6, 2, 2]} | ${s()}              | ${{ ones: null, twos: '4', threes: '3', fours: null, fives: null, sixes: '12' }}
  ${[1, 2, 2, 2, 2]} | ${s({ ones: 2 })}   | ${{ ones: 2, twos: '8', threes: null, fours: null, fives: null, sixes: null }}
  ${[3, 2, 2, 2, 2]} | ${s({ twos: 4 })}   | ${{ ones: null, twos: 4, threes: '3', fours: null, fives: null, sixes: null }}
  ${[3, 2, 2, 2, 2]} | ${s({ threes: 3 })} | ${{ ones: null, twos: '8', threes: 3, fours: null, fives: null, sixes: null }}
  ${[4, 2, 2, 2, 2]} | ${s({ fours: 8 })}  | ${{ ones: null, twos: '8', threes: null, fours: 8, fives: null, sixes: null }}
  ${[5, 2, 2, 2, 2]} | ${s({ fives: 15 })} | ${{ ones: null, twos: '8', threes: null, fours: null, fives: 15, sixes: null }}
  ${[6, 2, 2, 2, 2]} | ${s({ sixes: 18 })} | ${{ ones: null, twos: '8', threes: null, fours: null, fives: null, sixes: 18 }}
  ${[6, 2, 2, 2, 2]} | ${s({ fours: 0 })}  | ${{ ones: null, twos: '8', threes: null, fours: 0, fives: null, sixes: '6' }}
  ${[6, 2, 2, 2, 2]} | ${s({ sixes: 0 })}  | ${{ ones: null, twos: '8', threes: null, fours: null, fives: null, sixes: 0 }}
`('upperboard', ({ dice, scores, expected }) => {
  expect(calculatePotentialScores(dice, scores)).toMatchObject(expected)
})

test.each`
  dice               | scores                    | expected
  ${[3, 3, 1, 1, 2]} | ${s()}                    | ${{ threeOfAKind: null }}
  ${[3, 3, 3, 1, 2]} | ${s()}                    | ${{ threeOfAKind: '12' }}
  ${[3, 3, 3, 3, 2]} | ${s()}                    | ${{ threeOfAKind: '14' }}
  ${[3, 3, 3, 3, 3]} | ${s()}                    | ${{ threeOfAKind: '15' }}
  ${[5, 5, 3, 5, 3]} | ${s()}                    | ${{ threeOfAKind: '21' }}
  ${[5, 5, 3, 5, 3]} | ${s({ threeOfAKind: 3 })} | ${{ threeOfAKind: 3 }}
`('three of a kind', ({ dice, scores, expected }) => {
  expect(calculatePotentialScores(dice, scores)).toMatchObject(expected)
})

test.each`
  dice               | scores                   | expected
  ${[3, 3, 1, 1, 2]} | ${s()}                   | ${{ fourOfAKind: null }}
  ${[3, 3, 3, 1, 2]} | ${s()}                   | ${{ fourOfAKind: null }}
  ${[3, 3, 3, 3, 2]} | ${s()}                   | ${{ fourOfAKind: '14' }}
  ${[3, 3, 3, 3, 3]} | ${s()}                   | ${{ fourOfAKind: '15' }}
  ${[5, 5, 3, 5, 5]} | ${s()}                   | ${{ fourOfAKind: '23' }}
  ${[5, 5, 3, 5, 5]} | ${s({ fourOfAKind: 2 })} | ${{ fourOfAKind: 2 }}
`('four of a kind', ({ dice, scores, expected }) => {
  expect(calculatePotentialScores(dice, scores)).toMatchObject(expected)
})

test.each`
  dice               | scores                  | expected
  ${[3, 3, 1, 1, 2]} | ${s()}                  | ${{ fullHouse: null }}
  ${[3, 3, 3, 1, 1]} | ${s()}                  | ${{ fullHouse: '25' }}
  ${[3, 3, 3, 1, 1]} | ${s({ fullHouse: 25 })} | ${{ fullHouse: 25 }}
  ${[3, 3, 3, 1, 1]} | ${s({ fullHouse: 0 })}  | ${{ fullHouse: 0 }}
`('full house', ({ dice, scores, expected }) => {
  expect(calculatePotentialScores(dice, scores)).toMatchObject(expected)
})

test.each`
  dice               | scores                                       | expected
  ${[1, 2, 3, 4, 5]} | ${s()}                                       | ${{ smallStraight: '30', largeStraight: '40' }}
  ${[2, 3, 4, 5, 6]} | ${s()}                                       | ${{ smallStraight: '30', largeStraight: '40' }}
  ${[1, 2, 3, 4, 6]} | ${s()}                                       | ${{ smallStraight: '30', largeStraight: null }}
  ${[2, 3, 4, 3, 5]} | ${s()}                                       | ${{ smallStraight: '30', largeStraight: null }}
  ${[3, 4, 6, 5, 6]} | ${s()}                                       | ${{ smallStraight: '30', largeStraight: null }}
  ${[2, 4, 5, 6, 1]} | ${s()}                                       | ${{ smallStraight: null, largeStraight: null }}
  ${[1, 2, 3, 4, 6]} | ${s({ smallStraight: 30 })}                  | ${{ smallStraight: 30, largeStraight: null }}
  ${[1, 2, 3, 4, 5]} | ${s({ smallStraight: 30 })}                  | ${{ smallStraight: 30, largeStraight: '40' }}
  ${[1, 2, 3, 4, 5]} | ${s({ largeStraight: 40 })}                  | ${{ smallStraight: '30', largeStraight: 40 }}
  ${[1, 2, 3, 4, 5]} | ${s({ smallStraight: 0, largeStraight: 0 })} | ${{ smallStraight: 0, largeStraight: 0 }}
`('straights', ({ dice, scores, expected }) => {
  expect(calculatePotentialScores(dice, scores)).toMatchObject(expected)
})

test.each`
  dice               | scores               | expected
  ${[1, 2, 3, 4, 5]} | ${s()}               | ${{ chance: '15' }}
  ${[2, 4, 4, 5, 1]} | ${s()}               | ${{ chance: '16' }}
  ${[2, 4, 4, 5, 1]} | ${s({ chance: 0 })}  | ${{ chance: 0 }}
  ${[2, 4, 4, 5, 1]} | ${s({ chance: 23 })} | ${{ chance: 23 }}
`('chance', ({ dice, scores, expected }) => {
  expect(calculatePotentialScores(dice, scores)).toMatchObject(expected)
})

test.each`
  dice               | scores                 | expected
  ${[1, 2, 3, 4, 5]} | ${s()}                 | ${{ fiveDice: null }}
  ${[2, 2, 2, 2, 2]} | ${s()}                 | ${{ fiveDice: '50' }}
  ${[2, 2, 2, 2, 2]} | ${s({ fiveDice: 0 })}  | ${{ fiveDice: 0 }}
  ${[2, 2, 2, 2, 2]} | ${s({ fiveDice: 50 })} | ${{ fiveDice: 50 }}
`('Five Dice', ({ dice, scores, expected }) => {
  expect(calculatePotentialScores(dice, scores)).toMatchObject(expected)
})

test.each`
  dice               | scores                                                        | expected
  ${[1, 1, 2, 1, 1]} | ${s({ ones: 1, twos: 6, threeOfAKind: 10, fourOfAKind: 20 })} | ${{ fiveDice: null }}
`('Cannot Score', ({ dice, scores, expected }) => {
  expect(calculatePotentialScores(dice, scores)).toMatchObject(expected)
})

test('cannot score', () => {
  expect(
    calculatePotentialScores(
      [1, 1, 2, 1, 1],
      s({ ones: 1, twos: 6, threeOfAKind: 10, fourOfAKind: 20, chance: 0 }),
    ),
  ).toEqual({
    ones: 1,
    twos: 6,
    threes: '0',
    fours: '0',
    fives: '0',
    sixes: '0',

    threeOfAKind: 10,
    fourOfAKind: 20,
    fullHouse: '0',
    smallStraight: '0',
    largeStraight: '0',
    chance: 0,
    fiveDice: '0',
  })
})

test('full score', () => {
  expect(calculatePotentialScores([1, 1, 2, 1, 2], s({ fives: 10 }))).toEqual({
    ones: '3',
    twos: '4',
    threes: null,
    fours: null,
    fives: 10,
    sixes: null,

    threeOfAKind: '7',
    fourOfAKind: null,
    fullHouse: '25',
    smallStraight: null,
    largeStraight: null,
    chance: '7',
    fiveDice: null,
  })
})
