import _ from 'lodash'
import { flow, makeAutoObservable } from 'mobx'
import sleep from 'tings/sleep'

import { calculatePotentialScores } from './calculate-potential-scores'
import type { DieId, ScoreIds, State } from './model'
import { d6, toPairs } from './utils'

const initialState: State = {
  rolling: false,
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
  topScores: [],
}

export class GameEngine {
  rolling = initialState.rolling

  turn = initialState.turn

  dice = initialState.dice

  scores = initialState.scores

  topScores = initialState.topScores

  constructor(savedState?: State) {
    makeAutoObservable(this, { roll: flow }, { deep: true })

    if (savedState) {
      this.turn = savedState.turn
      this.dice = savedState.dice
      this.scores = savedState.scores
      this.topScores = savedState.topScores
    }
  }

  /**
   * Advance turn and roll all unheld dice
   */
  *roll(): Generator<Promise<void>, void, unknown> {
    if (!this.rolling && this.turn < 3 && !this.isGameOver) {
      this.turn = this.turn + 1

      this.rolling = true

      for (const roll of [1, 2, 3, 4, 5, 6, 7, 8]) {
        for (const die of Object.values(this.dice)) {
          if (!die.held) {
            die.value = d6()
          }
        }

        if (roll !== 8) {
          yield sleep(50)
        }
      }

      this.rolling = false

      const diceValues = Object.values(this.dice).map((d) => d.value)

      this.scores = calculatePotentialScores(diceValues, this.scores)
    }
  }

  hold(dieId: DieId): void {
    if (!this.rolling && this.turn > 0) {
      this.dice[dieId].held = !this.dice[dieId].held
    }
  }

  score(scoreId: ScoreIds): void {
    const isPotential = _.isString(this.scores[scoreId])

    if (!this.rolling && isPotential) {
      this.scores[scoreId] = Number(this.scores[scoreId])

      // Reset for next turn
      for (const [id, value] of toPairs(this.scores)) {
        if (_.isString(value)) {
          this.scores[id] = null
        }
      }

      // Reset
      this.dice = initialState.dice
      this.turn = initialState.turn
    }

    if (this.isGameOver) {
      this.topScores.push({ timestamp: Date.now(), score: this.total })
    }
  }

  restart(): void {
    this.dice = initialState.dice
    this.scores = initialState.scores
    this.turn = initialState.turn
  }

  get isGameOver(): boolean {
    return Object.values(this.scores).every((s) => _.isNumber(s))
  }

  get upperBoardSum(): number {
    const upperBoard = [
      this.scores.ones,
      this.scores.twos,
      this.scores.threes,
      this.scores.fours,
      this.scores.fives,
      this.scores.sixes,
    ]
    const numbers = upperBoard.filter(_.isNumber)
    return _.sum(numbers)
  }

  get upperBoardBonus(): number {
    return this.upperBoardSum >= 63 ? 35 : 0
  }

  get lowerBoardSum(): number {
    const lowerBoard = [
      this.scores.threeOfAKind,
      this.scores.fourOfAKind,
      this.scores.fullHouse,
      this.scores.smallStraight,
      this.scores.largeStraight,
      this.scores.chance,
      this.scores.fiveDice,
    ]
    const numbers = lowerBoard.filter(_.isNumber)
    return _.sum(numbers)
  }

  get total(): number {
    return _.sum([this.upperBoardSum, this.upperBoardBonus, this.lowerBoardSum])
  }
}
