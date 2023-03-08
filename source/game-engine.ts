import _ from 'lodash'
import { flow, makeAutoObservable, set } from 'mobx'
import { sleep, toNumber } from 'tings'

import { calculatePotentialScore } from './calculate-potential-score.js'
import type { State } from './model.js'
import { biasedD6, d6 } from './utils.js'

export const initialState: State = {
  dice: [
    { value: null, held: false },
    { value: null, held: false },
    { value: null, held: false },
    { value: null, held: false },
    { value: null, held: false },
  ],
  scores: {
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
  },
  turn: 0,
  topScores: [],
}

export class GameEngine {
  public isRolling = false

  public turn = initialState.turn

  public dice = initialState.dice

  public scores = initialState.scores

  public topScores = initialState.topScores

  public constructor(savedState?: State) {
    makeAutoObservable(this, { roll: flow })

    if (savedState) {
      this.turn = savedState.turn
      this.dice = savedState.dice
      this.scores = savedState.scores
      this.topScores = savedState.topScores
    }
  }

  public get potentialScoreboard(): State['scores'] {
    return this.isRolling
      ? {}
      : calculatePotentialScore(
          [
            this.dice[0].value,
            this.dice[1].value,
            this.dice[2].value,
            this.dice[3].value,
            this.dice[4].value,
          ],
          this.scores,
        )
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
      _.isNumber(this.potentialScoreboard['5Dice']) &&
      this.potentialScoreboard['5Dice'] > this.scores['5Dice']
    )
  }

  public get jokerCount(): number {
    return _.floor(toNumber(this.scores['5Dice']) / 100)
  }

  public get total(): number {
    return _.sum([this.upperBoardSum, this.upperBoardBonus, this.lowerBoardSum])
  }

  // Used for saving
  public get gameState(): Omit<State, 'isRolling'> {
    return {
      dice: this.dice,
      scores: this.scores,
      topScores: this.topScores,
      turn: this.turn,
    }
  }

  /**
   * Advance turn and roll all non-held dice
   */
  public *roll(): Generator<Promise<void>, void, unknown> {
    if (this.canRoll) {
      this.turn = this.turn + 1

      this.isRolling = true

      for (const iteration of [1, 2, 3, 4, 5, 6, 7, 'last'] as const) {
        // A real roll
        if (iteration === 'last') {
          for (const die of this.dice) {
            die.value = die.held ? die.value : d6()
          }
        }
        // Fake roll
        else {
          for (const die of this.dice) {
            die.value = die.held ? die.value : biasedD6(die.value)
          }

          // Allow value to be displayed
          yield sleep(50)
        }
      }

      this.isRolling = false
    }
  }

  public hold(dieIndex: 0 | 1 | 2 | 3 | 4): void {
    if (!this.isRolling && (this.turn === 1 || this.turn === 2)) {
      this.dice[dieIndex].held = !this.dice[dieIndex].held
    }
  }

  public score(scoreId: keyof State['scores']): void {
    if (!this.isRolling && _.isNumber(this.potentialScoreboard[scoreId])) {
      this.scores[scoreId] = this.potentialScoreboard[scoreId]

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
      // TODO should this restart?
      this.restart()
    }
  }

  public restart(): void {
    this.dice = initialState.dice
    this.scores = initialState.scores
    this.turn = initialState.turn
  }
}
