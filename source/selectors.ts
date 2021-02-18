import _ from 'lodash'

import { State } from './model'

export const selectIsGameOver = (state: State): boolean => {
  return Object.values(state.scores).every((s) => _.isNumber(s))
}

export const selectUpperBoardSum = (state: State): number => {
  const upperBoard = [
    state.scores.ones,
    state.scores.twos,
    state.scores.threes,
    state.scores.fours,
    state.scores.fives,
    state.scores.sixes,
  ]
  const numbers = upperBoard.filter(_.isNumber)
  return _.sum(numbers)
}

export const selectUpperBoardBonus = (state: State): number => {
  return selectUpperBoardSum(state) >= 63 ? 35 : 0
}

const selectLowerBoardSum = (state: State): number => {
  const lowerBoard = [
    state.scores.threeOfAKind,
    state.scores.fourOfAKind,
    state.scores.fullHouse,
    state.scores.smallStraight,
    state.scores.largeStraight,
    state.scores.chance,
    state.scores.fiveDice,
  ]
  const numbers = lowerBoard.filter(_.isNumber)
  return _.sum(numbers)
}

export const selectTotal = (state: State): number => {
  return _.sum([
    selectUpperBoardSum(state),
    selectUpperBoardBonus(state),
    selectLowerBoardSum(state),
  ])
}
