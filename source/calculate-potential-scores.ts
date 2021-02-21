import produce, { setAutoFreeze } from 'immer'
import _ from 'lodash'

import type { Scores } from './model'
import { toKeys } from './utils'

// Immer returns frozen objects which are not compatible with MobX updates. This
// turns off the freeze functionality.
setAutoFreeze(false)

const isStraight = (array: number[], size: number) => {
  const uniqSortedArray = _.uniq(array).sort()

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

export const calculatePotentialScores = (
  dice: number[],
  scores: Scores,
): Scores => {
  return produce(scores, (draft) => {
    const countByDie = _.countBy(dice)
    const sumOfAllDie = _.sum(dice)

    if (!_.isNumber(scores.ones)) {
      draft.ones = countByDie['1'] ? String(countByDie['1']) : null
    }

    if (!_.isNumber(scores.twos)) {
      draft.twos = countByDie['2'] ? String(countByDie['2'] * 2) : null
    }

    if (!_.isNumber(scores.threes)) {
      draft.threes = countByDie['3'] ? String(countByDie['3'] * 3) : null
    }

    if (!_.isNumber(scores.fours)) {
      draft.fours = countByDie['4'] ? String(countByDie['4'] * 4) : null
    }

    if (!_.isNumber(scores.fives)) {
      draft.fives = countByDie['5'] ? String(countByDie['5'] * 5) : null
    }

    if (!_.isNumber(scores.sixes)) {
      draft.sixes = countByDie['6'] ? String(countByDie['6'] * 6) : null
    }

    if (!_.isNumber(scores.threeOfAKind)) {
      draft.threeOfAKind =
        _.some(countByDie, (count) => count >= 4) ||
        _.some(countByDie, (count) => count === 3)
          ? String(sumOfAllDie)
          : null
    }

    if (!_.isNumber(scores.fourOfAKind)) {
      draft.fourOfAKind = _.some(countByDie, (count) => count >= 4)
        ? String(sumOfAllDie)
        : null
    }

    if (!_.isNumber(scores.fullHouse)) {
      draft.fullHouse =
        _.includes(countByDie, 2) && _.includes(countByDie, 3)
          ? String(25)
          : null
    }

    if (!_.isNumber(scores.smallStraight)) {
      draft.smallStraight = isStraight(dice, 4) ? String(30) : null
    }

    if (!_.isNumber(scores.largeStraight)) {
      draft.largeStraight = isStraight(dice, 5) ? String(40) : null
    }

    if (!_.isNumber(scores.chance)) {
      draft.chance = String(sumOfAllDie)
    }

    if (!_.isNumber(scores.fiveDice)) {
      draft.fiveDice = _.includes(countByDie, 5) ? String(50) : null
    }

    const canScore = Object.entries(draft).some(([, value]) =>
      _.isString(value),
    )

    if (!canScore) {
      for (const id of toKeys(draft)) {
        if (!_.isNumber(draft[id])) {
          draft[id] = '0'
        }
      }
    }
  })
}
