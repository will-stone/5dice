import { createAction, createReducer } from '@reduxjs/toolkit'
import _ from 'lodash'

import { calculatePotentialScores } from './calculate-potential-scores'
import type { DieId, Score, ScoreIds, Scores } from './model'

const dieRoll = () => Math.floor(6 * Math.random()) + 1

export const roll = createAction('roll')
export const hold = createAction<DieId>('hold')
export const score = createAction<ScoreIds>('score')

interface State {
  dice: {
    [key in DieId]: { value: number; held: boolean }
  }
  scores: Scores
  turn: number
}

export const initialState: State = {
  dice: {
    a: { value: 0, held: false },
    s: { value: 0, held: false },
    d: { value: 0, held: false },
    f: { value: 0, held: false },
    g: { value: 0, held: false },
  },
  scores: {
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
  },
  turn: 0,
}

export const reducer = createReducer(initialState, (builder) => {
  builder
    .addCase(roll, (state) => {
      if (state.turn < 3) {
        state.turn = state.turn + 1

        for (const die of Object.values(state.dice)) {
          if (!die.held) {
            die.value = dieRoll()
          }
        }

        const diceValues = Object.values(state.dice).map((d) => d.value)
        const potentialScores = calculatePotentialScores(diceValues)

        // Determines if you cannot score by seeing if every potential score
        // is already taken.
        const cannotScore = (Object.entries(potentialScores) as [
          ScoreIds,
          Score,
        ][])
          .filter(([, value]) => !_.isNull(value))
          .every(([id]) => _.isNumber(state.scores[id]))

        for (const [id, value] of Object.entries(state.scores) as [
          ScoreIds,
          Score,
        ][]) {
          const potentialScore = potentialScores[id]
          // Set potential score if score not set
          if (!_.isNumber(value)) {
            state.scores[id] = cannotScore ? '0' : potentialScore
          }
        }
      }
    })
    .addCase(hold, (state, action) => {
      if (state.turn > 0) {
        state.dice[action.payload].held = !state.dice[action.payload].held
      }
    })
    .addCase(score, (state, action) => {
      const potential = _.isString(state.scores[action.payload])
      if (potential) {
        state.scores[action.payload] = Number(state.scores[action.payload])
        // Reset for next turn
        for (const [id, value] of Object.entries(state.scores) as [
          ScoreIds,
          Score,
        ][]) {
          if (_.isString(value)) {
            state.scores[id] = null
          }
        }

        state.dice = initialState.dice
        state.turn = 0
      }
    })
})

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
