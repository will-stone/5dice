import { createAction, createReducer } from "@reduxjs/toolkit";
import { calculatePotentialScores } from "./calculate-potential-scores";
import type { Scorers, Scores } from "./model";
import crypto from "crypto";

const dieRoll = () => crypto.randomInt(1, 7);

export const roll = createAction("roll");
export const hold = createAction<"a" | "b" | "c" | "d" | "e">("hold");
export const score = createAction<Scorers>("score");

interface State {
	dice: {
		a: { value: number; held: boolean };
		b: { value: number; held: boolean };
		c: { value: number; held: boolean };
		d: { value: number; held: boolean };
		e: { value: number; held: boolean };
	};
	potentialScores: Scores;
	scores: Scores;
	turn: number;
}

export const initialState: State = {
	dice: {
		a: { value: 0, held: false },
		b: { value: 0, held: false },
		c: { value: 0, held: false },
		d: { value: 0, held: false },
		e: { value: 0, held: false },
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
			state.turn = state.turn + 1;

			for (const die of Object.values(state.dice)) {
				if (!die.held) {
					die.value = dieRoll();
				}
			}

			const diceValues = Object.values(state.dice).map((d) => d.value);
			state.potentialScores = calculatePotentialScores(diceValues);
		})
		.addCase(hold, (state, action) => {
			state.dice[action.payload].held = !state.dice[action.payload].held;
		})
		.addCase(score, (state, action) => {
			const potential = state.potentialScores[action.payload];
			if (potential) {
				state.scores[action.payload] = potential;
			}
			state.potentialScores = initialState.potentialScores;
			state.dice = initialState.dice;
			state.turn = 0;
		});
});
