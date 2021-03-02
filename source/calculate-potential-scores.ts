import produce, { setAutoFreeze } from 'immer'
import _ from 'lodash'

import type { Dice, DieNumber, Scores } from './model'
import { toKeys } from './utils'

// MobX can have issues with frozen objects
setAutoFreeze(false)

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

const dieNumberToId = (number: DieNumber) => {
  if (number === 1) return 'ones'
  if (number === 2) return 'twos'
  if (number === 3) return 'threes'
  if (number === 4) return 'fours'
  if (number === 5) return 'fives'
  return 'sixes'
}

export const calculatePotentialScores = (
  dice: Dice,
  scores: Scores,
): Scores => {
  return produce(scores, (draft) => {
    const countByDie = _.countBy(dice)
    const sumOfAllDie = _.sum(dice)

    /**
     * 5 Dice
     */

    // Not scored
    if (_.includes(countByDie, 5) && _.isNull(draft.fiveDice)) {
      draft.fiveDice = '50'
    }

    // Joker
    else if (_.isNumber(draft.fiveDice) && draft.fiveDice !== 0) {
      // Add bonus 100 points
      draft.fiveDice = draft.fiveDice + 100

      const dieScoreId = dieNumberToId(dice[0])

      // Upperboard score
      if (_.isNull(draft[dieScoreId])) {
        draft[dieScoreId] = String(_.sum(dice))
        return
      }

      // Upperboard score isn't available, Lowerboard is full, force 0
      if (
        [
          draft.threeOfAKind,
          draft.fourOfAKind,
          draft.fullHouse,
          draft.smallStraight,
          draft.largeStraight,
          draft.chance,
        ].every((s) => _.isNumber(s))
      ) {
        for (const scoreId of toKeys(draft)) {
          if (_.isNull(draft[scoreId])) {
            draft[scoreId] = '0'
          }
        }

        return
      }

      // Lowerboard score
      if (_.isNull(draft.threeOfAKind)) {
        draft.threeOfAKind = String(_.sum(dice))
      }

      if (_.isNull(draft.fourOfAKind)) {
        draft.fourOfAKind = String(_.sum(dice))
      }

      if (_.isNull(draft.fullHouse)) {
        draft.fullHouse = '25'
      }

      if (_.isNull(draft.smallStraight)) {
        draft.smallStraight = '30'
      }

      if (_.isNull(draft.largeStraight)) {
        draft.largeStraight = '40'
      }

      if (_.isNull(draft.chance)) {
        draft.chance = String(_.sum(dice))
      }

      return
    }

    if (countByDie['1'] && _.isNull(draft.ones)) {
      draft.ones = String(countByDie['1'])
    }

    if (countByDie['2'] && _.isNull(draft.twos)) {
      draft.twos = String(countByDie['2'] * 2)
    }

    if (countByDie['3'] && _.isNull(draft.threes)) {
      draft.threes = String(countByDie['3'] * 3)
    }

    if (countByDie['4'] && _.isNull(draft.fours)) {
      draft.fours = String(countByDie['4'] * 4)
    }

    if (countByDie['5'] && _.isNull(draft.fives)) {
      draft.fives = String(countByDie['5'] * 5)
    }

    if (countByDie['6'] && _.isNull(draft.sixes)) {
      draft.sixes = String(countByDie['6'] * 6)
    }

    if (
      _.isNull(draft.threeOfAKind) &&
      _.some(countByDie, (count) => count >= 3)
    ) {
      draft.threeOfAKind = String(sumOfAllDie)
    }

    if (
      _.isNull(draft.fourOfAKind) &&
      _.some(countByDie, (count) => count === 4)
    ) {
      draft.fourOfAKind = String(sumOfAllDie)
    }

    if (
      _.isNull(draft.fullHouse) &&
      _.includes(countByDie, 2) &&
      _.includes(countByDie, 3)
    ) {
      draft.fullHouse = '25'
    }

    if (_.isNull(draft.smallStraight) && isStraight(dice, 4)) {
      draft.smallStraight = '30'
    }

    if (_.isNull(draft.largeStraight) && isStraight(dice, 5)) {
      draft.largeStraight = '40'
    }

    if (_.isNull(draft.chance)) {
      draft.chance = String(sumOfAllDie)
    }

    // At least one potential score
    const canScore = Object.values(draft).some((value) => _.isString(value))

    // No potential scores
    if (!canScore) {
      for (const id of toKeys(draft)) {
        if (!_.isNumber(draft[id])) {
          draft[id] = '0'
        }
      }
    }
  })
}
