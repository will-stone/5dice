export interface Scores {
  ones?: number
  twos?: number
  threes?: number
  fours?: number
  fives?: number
  sixes?: number
  threeOfAKind?: number
  fourOfAKind?: number
  fullHouse?: number
  smallStraight?: number
  largeStraight?: number
  chance?: number
  fiveDice?: number
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
    [key in DieId]: { value: DieNumber; held: boolean }
  }
  scores: Scores
  potential: Scores
  turn: number
  topScores: TopScore[]
}
