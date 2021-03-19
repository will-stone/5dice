import _ from 'lodash'
import { flow, makeAutoObservable, set } from 'mobx'
import sleep from 'tings/sleep'
import toNumberAlways from 'tings/toNumberAlways'

import { calculatePotentialScores } from './calculate-potential-scores'
import type { State } from './model'
import { biasedD6, d6 } from './utils'

const initialState: State = {
  rolling: false,
  dice: {
    a: { value: 1, held: false },
    s: { value: 1, held: false },
    d: { value: 1, held: false },
    f: { value: 1, held: false },
    g: { value: 1, held: false },
  },
  scores: {},
  potential: {},
  turn: 0,
  topScores: [],
}

export class GameEngine {
  rolling = initialState.rolling

  turn = initialState.turn

  dice = initialState.dice

  scores = initialState.scores

  potential = initialState.potential

  topScores = initialState.topScores

  constructor(savedState?: State) {
    makeAutoObservable(this, { roll: flow })

    if (savedState) {
      this.turn = savedState.turn
      this.dice = savedState.dice
      this.scores = savedState.scores
      this.potential = savedState.potential
      this.topScores = savedState.topScores
    }
  }

  /**
   * Advance turn and roll all unheld dice
   */
  *roll(): Generator<Promise<void>, void, unknown> {
    if (this.canRoll) {
      this.turn = this.turn + 1

      this.rolling = true

      for (const iteration of ['first', 2, 3, 4, 5, 6, 7, 'last'] as const) {
        // A real roll
        if (iteration === 'first' || iteration === 'last') {
          this.dice.a.value = this.dice.a.held ? this.dice.a.value : d6()
          this.dice.s.value = this.dice.s.held ? this.dice.s.value : d6()
          this.dice.d.value = this.dice.d.held ? this.dice.d.value : d6()
          this.dice.f.value = this.dice.f.held ? this.dice.f.value : d6()
          this.dice.g.value = this.dice.g.held ? this.dice.g.value : d6()
        }
        // Fake roll
        else {
          this.dice.a.value = this.dice.a.held
            ? this.dice.a.value
            : biasedD6(this.dice.a.value)
          this.dice.s.value = this.dice.s.held
            ? this.dice.s.value
            : biasedD6(this.dice.s.value)
          this.dice.d.value = this.dice.d.held
            ? this.dice.d.value
            : biasedD6(this.dice.d.value)
          this.dice.f.value = this.dice.f.held
            ? this.dice.f.value
            : biasedD6(this.dice.f.value)
          this.dice.g.value = this.dice.g.held
            ? this.dice.g.value
            : biasedD6(this.dice.g.value)
        }

        // Allow value to be displayed
        if (iteration !== 'last') {
          yield sleep(50)
        }
      }

      this.rolling = false

      // Replacing the whole object means computeds are no longer updated.
      // By using `set` we force all observables to be replaced by new observables.
      set(
        this.potential,
        calculatePotentialScores(
          [
            this.dice.a.value,
            this.dice.s.value,
            this.dice.d.value,
            this.dice.f.value,
            this.dice.g.value,
          ],
          this.scores,
        ),
      )
    }
  }

  hold(dieId: keyof State['dice']): void {
    if (!this.rolling && this.turn > 0) {
      this.dice[dieId].held = !this.dice[dieId].held
    }
  }

  score(scoreId: keyof State['scores']): void {
    if (!this.rolling && _.isNumber(this.potential[scoreId])) {
      this.scores[scoreId] = this.potential[scoreId]

      if (this.potential.fiveDice && this.potential.fiveDice > 50) {
        this.scores.fiveDice = this.potential.fiveDice
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

  restart(): void {
    this.dice = initialState.dice
    this.scores = initialState.scores
    this.potential = initialState.potential
    this.turn = initialState.turn
  }

  get canRoll(): boolean {
    return !this.isGameOver && !this.rolling && this.turn < 3
  }

  get isGameOver(): boolean {
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
      _.isNumber(this.scores.chance) &&
      _.isNumber(this.scores.fiveDice)
    )
  }

  get upperBoardSum(): number {
    return _.sum([
      this.scores.ones || 0,
      this.scores.twos || 0,
      this.scores.threes || 0,
      this.scores.fours || 0,
      this.scores.fives || 0,
      this.scores.sixes || 0,
    ])
  }

  get upperBoardBonus(): number {
    return this.upperBoardSum >= 63 ? 35 : 0
  }

  get lowerBoardSum(): number {
    return _.sum([
      this.scores.threeOfAKind || 0,
      this.scores.fourOfAKind || 0,
      this.scores.fullHouse || 0,
      this.scores.smallStraight || 0,
      this.scores.largeStraight || 0,
      this.scores.chance || 0,
      this.scores.fiveDice || 0,
    ])
  }

  get potentialHasJoker(): boolean {
    return (
      _.isNumber(this.scores.fiveDice) &&
      this.scores.fiveDice > 0 &&
      _.isNumber(this.potential.fiveDice) &&
      this.potential.fiveDice > this.scores.fiveDice
    )
  }

  get jokerCount(): number {
    return _.floor(toNumberAlways(this.scores.fiveDice) / 100)
  }

  get total(): number {
    return _.sum([this.upperBoardSum, this.upperBoardBonus, this.lowerBoardSum])
  }
}
