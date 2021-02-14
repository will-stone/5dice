import { createAction, createReducer } from "@reduxjs/toolkit";
import crypto from "crypto";
import _ from "lodash";
import { calculatePotentialScores } from "./calculate-potential-scores";
import type { Scorers, Scores } from "./model";

const cannotScore = (actualScores: Scores, potentialScores: Scores) =>
	(Object.entries(potentialScores) as [keyof Scores, number][])
		.filter(([, value]) => !_.isNull(value))
		.every(([id]) => _.isNumber(actualScores[id]));

const dieRoll = () => crypto.randomInt(1, 7);

type DieId = "a" | "b" | "c" | "d" | "e";

const nextDie = (currentDie: DieId) => {
	if (currentDie === "a") return "b";
	if (currentDie === "b") return "c";
	if (currentDie === "c") return "d";
	if (currentDie === "d") return "e";
	return "e";
};

const prevDie = (currentDie: DieId) => {
	if (currentDie === "e") return "d";
	if (currentDie === "d") return "c";
	if (currentDie === "c") return "b";
	if (currentDie === "b") return "a";
	return "a";
};

export const roll = createAction("roll");
export const hold = createAction("hold");
export const score = createAction<Scorers>("score");
export const select = createAction<"left" | "right">("direction");

interface State {
	selected: DieId;
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
	selected: "a",
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
		.addCase(hold, (state) => {
			if (state.turn > 0) {
				state.dice[state.selected].held = !state.dice[state.selected].held;
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
				state.selected = "a";
			}
		})
		.addCase(select, (state, action) => {
			if (action.payload === "right") {
				state.selected = nextDie(state.selected);
			}
			if (action.payload === "left") {
				state.selected = prevDie(state.selected);
			}
		});
});
