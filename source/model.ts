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
  tahtzee: Score
}

export type ScoreIds = keyof Scores

export type DieId = 'a' | 'd' | 'f' | 'g' | 's'
