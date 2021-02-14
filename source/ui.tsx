import { Box, Spacer, Text, useApp, useInput } from "ink";
import React, { useReducer } from "react";
import { select, initialState, reducer, roll, score, hold } from "./store";
import _ from "lodash";
import { Scores } from "./model";

const App: React.FC = () => {
	const [state, dispatch] = useReducer(reducer, initialState);
	const dice = Object.entries(state.dice);
	const { potentialScores, scores } = state;
	const { exit } = useApp();

	useInput((input, key) => {
		// Hold
		if (key.rightArrow) {
			return dispatch(select("right"));
		}

		if (key.leftArrow) {
			return dispatch(select("left"));
		}

		if (key.downArrow || key.upArrow) {
			return dispatch(hold());
		}

		// Roll
		if (input === " ") {
			return dispatch(roll());
		}

		// Scores
		if (input === "1") {
			return dispatch(score("ones"));
		}

		if (input === "2") {
			return dispatch(score("twos"));
		}

		if (input === "3") {
			return dispatch(score("threes"));
		}

		if (input === "4") {
			return dispatch(score("fours"));
		}

		if (input === "5") {
			return dispatch(score("fives"));
		}

		if (input === "6") {
			return dispatch(score("sixes"));
		}

		if (input === "t") {
			return dispatch(score("threeOfAKind"));
		}

		if (input === "f") {
			return dispatch(score("fourOfAKind"));
		}

		if (input === "h") {
			return dispatch(score("fullHouse"));
		}

		if (input === "s") {
			return dispatch(score("smallStraight"));
		}

		if (input === "l") {
			return dispatch(score("largeStraight"));
		}

		if (input === "c") {
			return dispatch(score("chance"));
		}

		if (input === "y") {
			return dispatch(score("tahtzee"));
		}

		if (key.escape) {
			return exit();
		}
	});

	return (
		<Box alignItems="flex-start">
			<Box flexDirection="column">
				<Box
					justifyContent="space-between"
					borderColor="white"
					borderStyle="round"
					paddingX={1}
					width={13}
				>
					<Text>Turn</Text>
					<Text>{state.turn}</Text>
				</Box>
				<Box
					justifyContent="space-between"
					borderColor="white"
					borderStyle="round"
					paddingX={1}
					width={13}
					height={3}
				>
					{dice.map(([id, { value, held }]) => (
						<Text key={id} inverse={id === state.selected && !held}>
							{held ? " " : value}
						</Text>
					))}
				</Box>
				<Box
					justifyContent="space-between"
					borderColor="white"
					borderStyle="round"
					paddingX={1}
					width={13}
					height={3}
				>
					{dice.map(([id, { value, held }]) => (
						<Text key={id} inverse={id === state.selected && held}>
							{held ? value : " "}
						</Text>
					))}
				</Box>
			</Box>

			<Box
				borderColor="white"
				borderStyle="round"
				width={16}
				flexDirection="column"
				paddingX={1}
			>
				{([
					{ hotkey: "1", id: "ones" },
					{ hotkey: "2", id: "twos" },
					{ hotkey: "3", id: "threes" },
					{ hotkey: "4", id: "fours" },
					{ hotkey: "5", id: "fives" },
					{ hotkey: "6", id: "sixes" },
				] as { hotkey: string; id: keyof Scores }[]).map(({ hotkey, id }) => (
					<Box key={id}>
						<Text dimColor>{hotkey} </Text>
						<Text>{_.startCase(id)}</Text>
						<Spacer />
						<Box minWidth={2} justifyContent="flex-end">
							<Text dimColor={!_.isNumber(scores[id])}>
								{scores[id] ?? potentialScores[id]}
							</Text>
						</Box>
					</Box>
				))}
				<Box>
					<Text>────────────</Text>
				</Box>
				<Box>
					<Text>Sum</Text>
					<Spacer />
					<Text>63</Text>
				</Box>
				<Box>
					<Text>Bonus</Text>
					<Spacer />
					<Text>35</Text>
				</Box>
			</Box>

			<Box
				borderColor="white"
				borderStyle="round"
				width={25}
				flexDirection="column"
				paddingX={1}
			>
				{([
					{ hotkey: "t", id: "threeOfAKind" },
					{ hotkey: "f", id: "fourOfAKind" },
					{ hotkey: "h", id: "fullHouse" },
					{ hotkey: "s", id: "smallStraight" },
					{ hotkey: "l", id: "largeStraight" },
					{ hotkey: "c", id: "chance" },
					{ hotkey: "y", id: "tahtzee" },
				] as { hotkey: string; id: keyof Scores }[]).map(({ hotkey, id }) => (
					<Box key={id}>
						<Text dimColor>{hotkey} </Text>
						<Text>{_.startCase(id)}</Text>
						<Spacer />
						<Box minWidth={2} justifyContent="flex-end">
							<Text dimColor={!_.isNumber(scores[id])}>
								{scores[id] ?? potentialScores[id]}
							</Text>
						</Box>
					</Box>
				))}
				<Box>
					<Text>═════════════════════</Text>
				</Box>
				<Box>
					<Text>Total</Text>
					<Spacer />
					<Text>290</Text>
				</Box>
			</Box>
		</Box>
	);
};

export default App;
