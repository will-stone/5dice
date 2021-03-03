import _ from 'lodash'
import { flow, makeAutoObservable, set } from 'mobx'
import sleep from 'tings/sleep'

import { calculatePotentialScores } from './calculate-potential-scores'
import type { DieId, ScoreIds, State } from './model'
import { d6, toPairs } from './utils'

const initialState: State = {
  rolling: false,
  dice: {
    a: { value: 1, held: false },
    s: { value: 1, held: false },
    d: { value: 1, held: false },
    f: { value: 1, held: false },
    g: { value: 1, held: false },
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
    makeAutoObservable(this, { roll: flow })

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
    if (this.canRoll) {
      this.turn = this.turn + 1

      this.rolling = true

      // This repetition is because the typing does not work if put in a for loop :(
      this.dice.a.value = this.dice.a.held ? this.dice.a.value : d6()
      this.dice.s.value = this.dice.s.held ? this.dice.s.value : d6()
      this.dice.d.value = this.dice.d.held ? this.dice.d.value : d6()
      this.dice.f.value = this.dice.f.held ? this.dice.f.value : d6()
      this.dice.g.value = this.dice.g.held ? this.dice.g.value : d6()
      yield sleep(50)
      this.dice.a.value = this.dice.a.held ? this.dice.a.value : d6()
      this.dice.s.value = this.dice.s.held ? this.dice.s.value : d6()
      this.dice.d.value = this.dice.d.held ? this.dice.d.value : d6()
      this.dice.f.value = this.dice.f.held ? this.dice.f.value : d6()
      this.dice.g.value = this.dice.g.held ? this.dice.g.value : d6()
      yield sleep(50)
      this.dice.a.value = this.dice.a.held ? this.dice.a.value : d6()
      this.dice.s.value = this.dice.s.held ? this.dice.s.value : d6()
      this.dice.d.value = this.dice.d.held ? this.dice.d.value : d6()
      this.dice.f.value = this.dice.f.held ? this.dice.f.value : d6()
      this.dice.g.value = this.dice.g.held ? this.dice.g.value : d6()
      yield sleep(50)
      this.dice.a.value = this.dice.a.held ? this.dice.a.value : d6()
      this.dice.s.value = this.dice.s.held ? this.dice.s.value : d6()
      this.dice.d.value = this.dice.d.held ? this.dice.d.value : d6()
      this.dice.f.value = this.dice.f.held ? this.dice.f.value : d6()
      this.dice.g.value = this.dice.g.held ? this.dice.g.value : d6()
      yield sleep(50)
      this.dice.a.value = this.dice.a.held ? this.dice.a.value : d6()
      this.dice.s.value = this.dice.s.held ? this.dice.s.value : d6()
      this.dice.d.value = this.dice.d.held ? this.dice.d.value : d6()
      this.dice.f.value = this.dice.f.held ? this.dice.f.value : d6()
      this.dice.g.value = this.dice.g.held ? this.dice.g.value : d6()
      yield sleep(50)
      this.dice.a.value = this.dice.a.held ? this.dice.a.value : d6()
      this.dice.s.value = this.dice.s.held ? this.dice.s.value : d6()
      this.dice.d.value = this.dice.d.held ? this.dice.d.value : d6()
      this.dice.f.value = this.dice.f.held ? this.dice.f.value : d6()
      this.dice.g.value = this.dice.g.held ? this.dice.g.value : d6()
      yield sleep(50)
      this.dice.a.value = this.dice.a.held ? this.dice.a.value : d6()
      this.dice.s.value = this.dice.s.held ? this.dice.s.value : d6()
      this.dice.d.value = this.dice.d.held ? this.dice.d.value : d6()
      this.dice.f.value = this.dice.f.held ? this.dice.f.value : d6()
      this.dice.g.value = this.dice.g.held ? this.dice.g.value : d6()
      yield sleep(50)
      this.dice.a.value = this.dice.a.held ? this.dice.a.value : d6()
      this.dice.s.value = this.dice.s.held ? this.dice.s.value : d6()
      this.dice.d.value = this.dice.d.held ? this.dice.d.value : d6()
      this.dice.f.value = this.dice.f.held ? this.dice.f.value : d6()
      this.dice.g.value = this.dice.g.held ? this.dice.g.value : d6()

      this.rolling = false

      // Immer returns frozen objects which are not compatible with MobX updates.
      // Also replacing the whole object means computeds are no longer updated.
      // By using `set` we force all observables to be replaced by new observables.
      set(
        this.scores,
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
      const updatedTopScores = _.sortBy(
        [...this.topScores, { timestamp: Date.now(), score: this.total }],
        ['score'],
      )
        .reverse()
        .slice(0, 20)
      set(this.topScores, updatedTopScores)
    }
  }

  restart(): void {
    this.dice = initialState.dice
    this.scores = initialState.scores
    this.turn = initialState.turn
  }

  get canRoll(): boolean {
    return !this.isGameOver && !this.rolling && this.turn < 3
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

  get jokerCount(): number {
    if (_.isNumber(this.scores.fiveDice) && this.scores.fiveDice > 50) {
      return (this.scores.fiveDice - 50) / 100
    }

    return 0
  }

  get total(): number {
    return _.sum([this.upperBoardSum, this.upperBoardBonus, this.lowerBoardSum])
  }
}
