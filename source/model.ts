export interface Scores {
	ones: number | null;
	twos: number | null;
	threes: number | null;
	fours: number | null;
	fives: number | null;
	sixes: number | null;

	threeOfAKind: number | null;
	fourOfAKind: number | null;
	fullHouse: number | null;
	smallStraight: number | null;
	largeStraight: number | null;
	chance: number | null;
	tahtzee: number | null;
}

export type Scorers = keyof Scores;

export type DieId = "a" | "s" | "d" | "f" | "g";