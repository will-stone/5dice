import _ from 'lodash'
import toNumberAlways from 'tings/toNumberAlways'

import type { Die, State } from './model'
import { toKeys } from './utils'

type Dice = [
  Die['value'],
  Die['value'],
  Die['value'],
  Die['value'],
  Die['value'],
]

const isStraight = (dice: Dice, size: number) => {
  const uniqSortedArray = _.uniq(dice).sort()

  if (uniqSortedArray.length < size) {
    return false
  }

  let last = null
  let hits = 1

  for (const [index, element] of uniqSortedArray.entries()) {
    const iteration = index + 1

    const isSequential = last && element === last + 1
    hits = isSequential ? hits + 1 : 1

    // Short-circuit if there are not enough items left to ever satisfy straight
    if (uniqSortedArray.length - iteration + hits < size) {
      return false
    }

    if (hits === size) {
      return true
    }

    last = element
  }

  return false
}

const dieNumberToId = (number: Die['value']) => {
  if (number === 1) return 'ones'
  if (number === 2) return 'twos'
  if (number === 3) return 'threes'
  if (number === 4) return 'fours'
  if (number === 5) return 'fives'
  return 'sixes'
}

export function calculatePotentialScores(
  dice: Dice,
  scores: State['scores'],
): State['potential'] {
  const countByDie = _.countBy(dice)
  const sumOfAllDie = _.sum(dice)

  const potential: State['potential'] = {
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
    chance: undefined,
    fiveDice: undefined,
  }

  // joker
  if (
    _.includes(countByDie, 5) &&
    _.isNumber(scores.fiveDice) &&
    scores.fiveDice >= 50
  ) {
    potential.fiveDice = scores.fiveDice + 100

    const dieScoreId = dieNumberToId(dice[0])

    // Upperboard score
    if (_.isUndefined(scores[dieScoreId])) {
      potential[dieScoreId] = sumOfAllDie
    }
    // Upperboard score isn't available, Lowerboard is full, force 0
    else if (
      [
        scores.threeOfAKind,
        scores.fourOfAKind,
        scores.fullHouse,
        scores.smallStraight,
        scores.largeStraight,
        scores.chance,
      ].every((s) => _.isNumber(s))
    ) {
      for (const scoreId of toKeys(scores)) {
        if (_.isUndefined(scores[scoreId])) {
          potential[scoreId] = 0
        }
      }
    }
    // Lowerboard score
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

      if (_.isUndefined(scores.chance)) {
        potential.chance = sumOfAllDie
      }
    }

    return potential
  }

  if (_.isUndefined(scores.ones) && countByDie['1']) {
    potential.ones = toNumberAlways(countByDie['1'])
  }

  if (_.isUndefined(scores.twos) && countByDie['2']) {
    potential.twos = toNumberAlways(countByDie['2']) * 2
  }

  if (_.isUndefined(scores.threes) && countByDie['3']) {
    potential.threes = toNumberAlways(countByDie['3']) * 3
  }

  if (_.isUndefined(scores.fours) && countByDie['4']) {
    potential.fours = toNumberAlways(countByDie['4']) * 4
  }

  if (_.isUndefined(scores.fives) && countByDie['5']) {
    potential.fives = toNumberAlways(countByDie['5']) * 5
  }

  if (_.isUndefined(scores.sixes) && countByDie['6']) {
    potential.sixes = toNumberAlways(countByDie['6']) * 6
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

  if (_.isUndefined(scores.chance)) {
    potential.chance = sumOfAllDie
  }

  if (_.isUndefined(scores.fiveDice) && _.includes(countByDie, 5)) {
    potential.fiveDice = 50
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
