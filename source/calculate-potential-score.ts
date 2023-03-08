import _ from 'lodash'
import { toNumber } from 'tings'

import { initialState } from './game-engine.js'
import type { Die, State } from './model.js'
import { toKeys } from './utils.js'

export type Dice = [
  Die['value'],
  Die['value'],
  Die['value'],
  Die['value'],
  Die['value'],
]

export const isStraight = (dice: Dice, size: number): boolean => {
  const uniqSortedArray = _.uniq(dice).sort()

  if (uniqSortedArray.length < size) {
    return false
  }

  let last = null
  let hits = 1

  for (const element of uniqSortedArray.values()) {
    const isSequential = last && element === last + 1
    hits = isSequential ? hits + 1 : 1

    if (hits === size) {
      return true
    }

    last = element
  }

  return false
}

export const dieNumberToId = (
  number: Die['value'],
): 'fives' | 'fours' | 'ones' | 'sixes' | 'threes' | 'twos' => {
  if (number === 1) return 'ones'
  if (number === 2) return 'twos'
  if (number === 3) return 'threes'
  if (number === 4) return 'fours'
  if (number === 5) return 'fives'
  return 'sixes'
}

export function calculatePotentialScore(
  dice: Dice,
  inputScores: State['scores'],
): State['scores'] {
  const isNotARoll = dice.includes(null)
  if (isNotARoll) return {}
  const scores = { ...initialState.scores, ...inputScores }
  const countByDie = _.countBy(dice)
  const sumOfAllDie = _.sum(dice)

  const potential: State['scores'] = {
    'ones': undefined,
    'twos': undefined,
    'threes': undefined,
    'fours': undefined,
    'fives': undefined,
    'sixes': undefined,
    'threeOfAKind': undefined,
    'fourOfAKind': undefined,
    'fullHouse': undefined,
    'smallStraight': undefined,
    'largeStraight': undefined,
    'gamble': undefined,
    '5Dice': undefined,
  }

  // joker
  if (
    _.includes(countByDie, 5) &&
    _.isNumber(scores['5Dice']) &&
    scores['5Dice'] >= 50
  ) {
    potential['5Dice'] = scores['5Dice'] + 100

    const dieScoreId = dieNumberToId(dice[0])

    // Upper-board score
    if (_.isUndefined(scores[dieScoreId])) {
      potential[dieScoreId] = sumOfAllDie
    }
    // Upper-board score isn't available, Lower-board is full, force 0
    else if (
      [
        scores.threeOfAKind,
        scores.fourOfAKind,
        scores.fullHouse,
        scores.smallStraight,
        scores.largeStraight,
        scores.gamble,
      ].every((s) => _.isNumber(s))
    ) {
      for (const scoreId of toKeys(scores)) {
        if (_.isUndefined(scores[scoreId])) {
          potential[scoreId] = 0
        }
      }
    }
    // Lower-board score
    else {
      if (_.isUndefined(scores.threeOfAKind)) {
        potential.threeOfAKind = sumOfAllDie
      }

      if (_.isUndefined(scores.fourOfAKind)) {
        potential.fourOfAKind = sumOfAllDie
      }

      if (_.isUndefined(scores.fullHouse)) {
        potential.fullHouse = 25
      }

      if (_.isUndefined(scores.smallStraight)) {
        potential.smallStraight = 30
      }

      if (_.isUndefined(scores.largeStraight)) {
        potential.largeStraight = 40
      }

      if (_.isUndefined(scores.gamble)) {
        potential.gamble = sumOfAllDie
      }
    }

    return potential
  }

  if (_.isUndefined(scores.ones) && countByDie['1']) {
    potential.ones = toNumber(countByDie['1'])
  }

  if (_.isUndefined(scores.twos) && countByDie['2']) {
    potential.twos = toNumber(countByDie['2']) * 2
  }

  if (_.isUndefined(scores.threes) && countByDie['3']) {
    potential.threes = toNumber(countByDie['3']) * 3
  }

  if (_.isUndefined(scores.fours) && countByDie['4']) {
    potential.fours = toNumber(countByDie['4']) * 4
  }

  if (_.isUndefined(scores.fives) && countByDie['5']) {
    potential.fives = toNumber(countByDie['5']) * 5
  }

  if (_.isUndefined(scores.sixes) && countByDie['6']) {
    potential.sixes = toNumber(countByDie['6']) * 6
  }

  if (
    _.isUndefined(scores.threeOfAKind) &&
    _.some(countByDie, (count) => count >= 3)
  ) {
    potential.threeOfAKind = sumOfAllDie
  }

  if (
    _.isUndefined(scores.fourOfAKind) &&
    _.some(countByDie, (count) => count >= 4)
  ) {
    potential.fourOfAKind = sumOfAllDie
  }

  if (
    _.isUndefined(scores.fullHouse) &&
    _.includes(countByDie, 2) &&
    _.includes(countByDie, 3)
  ) {
    potential.fullHouse = 25
  }

  if (_.isUndefined(scores.smallStraight) && isStraight(dice, 4)) {
    potential.smallStraight = 30
  }

  if (_.isUndefined(scores.largeStraight) && isStraight(dice, 5)) {
    potential.largeStraight = 40
  }

  if (_.isUndefined(scores.gamble)) {
    potential.gamble = sumOfAllDie
  }

  if (_.isUndefined(scores['5Dice']) && _.includes(countByDie, 5)) {
    potential['5Dice'] = 50
  }

  // Cannot score
  if (_.isEmpty(Object.values(potential).filter((x) => !_.isUndefined(x)))) {
    for (const scoreId of toKeys(potential)) {
      if (_.isUndefined(scores[scoreId])) {
        potential[scoreId] = 0
      }
    }
  }

  return potential
}
