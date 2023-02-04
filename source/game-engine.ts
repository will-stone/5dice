import _ from 'lodash'
import { flow, makeAutoObservable, set } from 'mobx'
import sleep from 'tings/sleep'
import toNumberAlways from 'tings/toNumberAlways'

import { calculatePotentialScores } from './calculate-potential-scores'
import type { State } from './model'
import { biasedD6, d6 } from './utils'

const initialState: State = {
  isRolling: false,
  dice: [
    { value: 1, held: false },
    { value: 1, held: false },
    { value: 1, held: false },
    { value: 1, held: false },
    { value: 1, held: false },
  ],
  scores: {},
  potential: {},
  turn: 0,
  topScores: [],
}

export class GameEngine {
  public isRolling = initialState.isRolling

  public turn = initialState.turn

  public dice = initialState.dice

  public scores = initialState.scores

  public potential = initialState.potential

  public topScores = initialState.topScores

  public constructor(savedState?: State) {
    makeAutoObservable(this, { roll: flow })

    if (savedState) {
      this.turn = savedState.turn
      this.dice = savedState.dice
      this.scores = savedState.scores
      this.potential = savedState.potential
      this.topScores = savedState.topScores
    }
  }

  public get canRoll(): boolean {
    return !this.isGameOver && !this.isRolling && this.turn < 3
  }

  public get isGameStart(): boolean {
    return (
      this.turn === 0 &&
      _.isUndefined(this.scores.ones) &&
      _.isUndefined(this.scores.twos) &&
      _.isUndefined(this.scores.threes) &&
      _.isUndefined(this.scores.fours) &&
      _.isUndefined(this.scores.fives) &&
      _.isUndefined(this.scores.sixes) &&
      _.isUndefined(this.scores.threeOfAKind) &&
      _.isUndefined(this.scores.fourOfAKind) &&
      _.isUndefined(this.scores.fullHouse) &&
      _.isUndefined(this.scores.smallStraight) &&
      _.isUndefined(this.scores.largeStraight) &&
      _.isUndefined(this.scores.gamble) &&
      _.isUndefined(this.scores['5Dice'])
    )
  }

  public get isGameOver(): boolean {
    return (
      _.isNumber(this.scores.ones) &&
      _.isNumber(this.scores.twos) &&
      _.isNumber(this.scores.threes) &&
      _.isNumber(this.scores.fours) &&
      _.isNumber(this.scores.fives) &&
      _.isNumber(this.scores.sixes) &&
      _.isNumber(this.scores.threeOfAKind) &&
      _.isNumber(this.scores.fourOfAKind) &&
      _.isNumber(this.scores.fullHouse) &&
      _.isNumber(this.scores.smallStraight) &&
      _.isNumber(this.scores.largeStraight) &&
      _.isNumber(this.scores.gamble) &&
      _.isNumber(this.scores['5Dice'])
    )
  }

  public get upperBoardSum(): number {
    return _.sum([
      this.scores.ones || 0,
      this.scores.twos || 0,
      this.scores.threes || 0,
      this.scores.fours || 0,
      this.scores.fives || 0,
      this.scores.sixes || 0,
    ])
  }

  public get upperBoardBonus(): number {
    return this.upperBoardSum >= 63 ? 35 : 0
  }

  public get lowerBoardSum(): number {
    return _.sum([
      this.scores.threeOfAKind || 0,
      this.scores.fourOfAKind || 0,
      this.scores.fullHouse || 0,
      this.scores.smallStraight || 0,
      this.scores.largeStraight || 0,
      this.scores.gamble || 0,
      this.scores['5Dice'] || 0,
    ])
  }

  public get potentialHasJoker(): boolean {
    return (
      _.isNumber(this.scores['5Dice']) &&
      this.scores['5Dice'] > 0 &&
      _.isNumber(this.potential['5Dice']) &&
      this.potential['5Dice'] > this.scores['5Dice']
    )
  }

  public get jokerCount(): number {
    return _.floor(toNumberAlways(this.scores['5Dice']) / 100)
  }

  public get total(): number {
    return _.sum([this.upperBoardSum, this.upperBoardBonus, this.lowerBoardSum])
  }

  /**
   * Advance turn and roll all unheld dice
   */
  public *roll(): Generator<Promise<void>, void, unknown> {
    if (this.canRoll) {
      this.turn = this.turn + 1

      this.isRolling = true

      for (const iteration of ['first', 2, 3, 4, 5, 6, 7, 'last'] as const) {
        // A real roll
        if (iteration === 'first' || iteration === 'last') {
          for (const die of this.dice) {
            die.value = die.held ? die.value : d6()
          }
        }
        // Fake roll
        else {
          for (const die of this.dice) {
            die.value = die.held ? die.value : biasedD6(die.value)
          }
        }

        // Allow value to be displayed
        if (iteration !== 'last') {
          yield sleep(50)
        }
      }

      this.isRolling = false

      // Replacing the whole object means computeds are no longer updated.
      // By using `set` we force all observables to be replaced by new observables.
      set(
        this.potential,
        calculatePotentialScores(
          [
            this.dice[0].value,
            this.dice[1].value,
            this.dice[2].value,
            this.dice[3].value,
            this.dice[4].value,
          ],
          this.scores,
        ),
      )
    }
  }

  public hold(dieIndex: 0 | 1 | 2 | 3 | 4): void {
    if (!this.isRolling && (this.turn === 1 || this.turn === 2)) {
      this.dice[dieIndex].held = !this.dice[dieIndex].held
    }
  }

  public score(scoreId: keyof State['scores']): void {
    if (!this.isRolling && _.isNumber(this.potential[scoreId])) {
      this.scores[scoreId] = this.potential[scoreId]

      if (this.potential['5Dice'] && this.potential['5Dice'] > 50) {
        this.scores['5Dice'] = this.potential['5Dice']
      }

      // Reset for next turn
      this.potential = {}

      // Reset
      this.dice = initialState.dice
      this.turn = initialState.turn
    }

    if (this.isGameOver) {
      const updatedTopScores = _.sortBy(
        [...this.topScores, { timestamp: Date.now(), score: this.total }],
        ['score'],
      )
        .reverse()
        .slice(0, 20)

      set(this.topScores, updatedTopScores)
      this.restart()
    }
  }

  public restart(): void {
    this.dice = initialState.dice
    this.scores = initialState.scores
    this.potential = initialState.potential
    this.turn = initialState.turn
  }
}
