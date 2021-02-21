export type Score = number | string | null

export interface Scores {
  ones: Score
  twos: Score
  threes: Score
  fours: Score
  fives: Score
  sixes: Score

  threeOfAKind: Score
  fourOfAKind: Score
  fullHouse: Score
  smallStraight: Score
  largeStraight: Score
  chance: Score
  fiveDice: Score
}

export type ScoreIds = keyof Scores

export type DieId = 'a' | 'd' | 'f' | 'g' | 's'

export interface State {
  dice: {
    [key in DieId]: { value: number; held: boolean }
  }
  scores: Scores
  turn: number
  topScores: { timestamp: number; score: number }[]
}
