import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import _ from 'lodash'
import os from 'os'
import path from 'path'
import writeJsonFile from 'write-json-file'

import { calculatePotentialScores } from './calculate-potential-scores'
import type { DieId, Score, ScoreIds, State } from './model'
import { selectIsGameOver, selectTotal } from './selectors'

const dieRoll = () => Math.floor(6 * Math.random()) + 1

const initialState: State = {
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

const store = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    roll: (state) => {
      if (state.turn < 3 && !selectIsGameOver(state)) {
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
    },

    hold: (state, action: PayloadAction<DieId>) => {
      if (state.turn > 0) {
        state.dice[action.payload].held = !state.dice[action.payload].held
      }
    },

    score: (state, action: PayloadAction<ScoreIds>) => {
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

      if (selectIsGameOver(state)) {
        writeJsonFile(path.join(os.homedir(), '5dice.json'), {
          topScores: [{ score: selectTotal(state) }],
        })
      }
    },

    restartGame: () => initialState,
  },
})

const { reducer, actions } = store
export { initialState, reducer, actions }
