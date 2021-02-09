import _ from "lodash";
import type { Scores } from "./model";

const isStraight = (array: number[], size: number) => {
	const uniqSortedArray = _.uniq(array).sort();

	if (uniqSortedArray.length < size) {
		return false;
	}

	let last = null;
	let hits = 1;

	for (const [index, element] of uniqSortedArray.entries()) {
		const iteration = index + 1;

		const isSequential = last && element === last + 1;
		hits = isSequential ? hits + 1 : 1;

		// Short-circuit if there are not enough items left to ever satisfy straight
		if (uniqSortedArray.length - iteration + hits < size) {
			return false;
		}

		if (hits === size) {
			return true;
		}

		last = element;
	}

	return false;
};


export const calculatePotentialScores = (dice: number[]) => {
	const score: Scores = {
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
		tahtzee: null,
	};

	const countByDie = _.countBy(dice);
	const sumOfAllDie = _.sum(dice);

	score.ones = countByDie["1"] ? countByDie["1"] * 1 : null;
	score.twos = countByDie["2"] ? countByDie["2"] * 2 : null;
	score.threes = countByDie["3"] ? countByDie["3"] * 3 : null;
	score.fours = countByDie["4"] ? countByDie["4"] * 4 : null;
	score.fives = countByDie["5"] ? countByDie["5"] * 5 : null;
	score.sixes = countByDie["6"] ? countByDie["6"] * 6 : null;

	if (_.some(countByDie, (count) => count >= 4)) {
		score.threeOfAKind = sumOfAllDie;
		score.fourOfAKind = sumOfAllDie;
	} else if (_.some(countByDie, (count) => count === 3)) {
		score.threeOfAKind = sumOfAllDie;
	}

	if (_.includes(countByDie, 2) && _.includes(countByDie, 3)) {
		score.fullHouse = 25;
	}

	if (isStraight(dice, 5)) {
		score.smallStraight = 30;
		score.largeStraight = 40;
	} else if (isStraight(dice, 4)) {
		score.smallStraight = 30;
	}

	score.chance = sumOfAllDie;

	if (_.includes(countByDie, 5)) {
		score.tahtzee = 50;
	}

	return score;
};
