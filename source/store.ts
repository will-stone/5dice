import { createAction, createReducer } from "@reduxjs/toolkit";
import crypto from "crypto";
import _ from "lodash";
import { calculatePotentialScores } from "./calculate-potential-scores";
import type { DieId, Scorers, Scores } from "./model";

/**
 * Determines if you cannot score by seeing if every potential score is already taken.
 */
const cannotScore = (actualScores: Scores, potentialScores: Scores) =>
	(Object.entries(potentialScores) as [Scorers, number][])
		.filter(([, value]) => !_.isNull(value))
		.every(([id]) => _.isNumber(actualScores[id]));

const dieRoll = () => crypto.randomInt(1, 7);

export const roll = createAction("roll");
export const hold = createAction<DieId>("hold");
export const score = createAction<Scorers>("score");

interface State {
	dice: {
		[key in DieId]: { value: number; held: boolean };
	};
	potentialScores: Scores;
	scores: Scores;
	turn: number;
}

export const initialState: State = {
	dice: {
		a: { value: 0, held: false },
		s: { value: 0, held: false },
		d: { value: 0, held: false },
		f: { value: 0, held: false },
		g: { value: 0, held: false },
	},
	potentialScores: {
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
		tahtzee: null,
	},
	turn: 0,
};

export const reducer = createReducer(initialState, (builder) => {
	builder
		.addCase(roll, (state) => {
			if (state.turn < 3) {
				state.turn = state.turn + 1;

				for (const die of Object.values(state.dice)) {
					if (!die.held) {
						die.value = dieRoll();
					}
				}

				const diceValues = Object.values(state.dice).map((d) => d.value);
				const potentialScores = calculatePotentialScores(diceValues);

				if (cannotScore(state.scores, potentialScores)) {
					state.potentialScores = {
						ones: 0,
						twos: 0,
						threes: 0,
						fours: 0,
						fives: 0,
						sixes: 0,

						threeOfAKind: 0,
						fourOfAKind: 0,
						fullHouse: 0,
						smallStraight: 0,
						largeStraight: 0,
						chance: 0,
						tahtzee: 0,
					};
				} else {
					state.potentialScores = potentialScores;
				}
			}
		})
		.addCase(hold, (state, action) => {
			if (state.turn > 0) {
				state.dice[action.payload].held = !state.dice[action.payload].held;
			}
		})
		.addCase(score, (state, action) => {
			const potential = state.potentialScores[action.payload];
			if (
				(potential || potential === 0) &&
				!state.scores[action.payload] &&
				state.scores[action.payload] !== 0
			) {
				state.scores[action.payload] = potential;
				// Reset for next turn
				state.potentialScores = initialState.potentialScores;
				state.dice = initialState.dice;
				state.turn = 0;
			}
		});
});
