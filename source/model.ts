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

export type DieNumber = 1 | 2 | 3 | 4 | 5 | 6
export type Dice = [DieNumber, DieNumber, DieNumber, DieNumber, DieNumber]

export interface TopScore {
  timestamp: number
  score: number
}

export interface State {
  rolling: boolean
  dice: {
    [key in DieId]: { value?: DieNumber; held: boolean }
  }
  scores: Scores
  turn: number
  topScores: TopScore[]
}
