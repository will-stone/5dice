import { Box, Newline, Spacer, Text, useApp, useInput } from "ink";
import React, { useReducer } from "react";
import { initialState, reducer, roll, score, hold } from "./store";
import _ from "lodash";
import { ScoreIds } from "./model";

const upperBoard: { [key: string]: ScoreIds } = {
	1: "ones",
	2: "twos",
	3: "threes",
	4: "fours",
	5: "fives",
	6: "sixes",
};

const lowerBoard: { [key: string]: ScoreIds } = {
	q: "threeOfAKind",
	w: "fourOfAKind",
	e: "fullHouse",
	r: "smallStraight",
	t: "largeStraight",
	y: "chance",
	u: "tahtzee",
};

const App: React.FC = () => {
	const [state, dispatch] = useReducer(reducer, initialState);
	const dice = Object.entries(state.dice);
	const { scores } = state;
	const { exit } = useApp();

	useInput((input, key) => {
		// Hold
		if (
			input === "a" ||
			input === "s" ||
			input === "d" ||
			input === "f" ||
			input === "g"
		) {
			return dispatch(hold(input));
		}

		// Roll
		if (key.return) {
			return dispatch(roll());
		}

		// Scores

		for (const [key, id] of Object.entries(upperBoard)) {
			if (input === key) {
				return dispatch(score(id));
			}
		}

		for (const [key, id] of Object.entries(lowerBoard)) {
			if (input === key) {
				return dispatch(score(id));
			}
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
					borderColor="white"
					borderStyle="round"
					paddingX={1}
					width={13}
					height={4}
				>
					<Text>
						<Text dimColor>a s d f g</Text>
						<Newline />
						{dice.map(([id, { value, held }], index) => (
							<React.Fragment key={id}>
								{index !== 0 && <Text> </Text>}
								<Text inverse={held}>{value}</Text>
							</React.Fragment>
						))}
					</Text>
				</Box>
			</Box>

			<Box
				borderColor="white"
				borderStyle="round"
				width={16}
				flexDirection="column"
				paddingX={1}
			>
				{Object.entries(upperBoard).map(([hotkey, id]) => (
					<Box key={id}>
						<Text dimColor>{hotkey} </Text>
						<Text>{_.startCase(id)}</Text>
						<Spacer />
						<Box minWidth={2} justifyContent="flex-end">
							<Text dimColor={_.isString(scores[id])}>{scores[id]}</Text>
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
				{Object.entries(lowerBoard).map(([hotkey, id]) => (
					<Box key={id}>
						<Text dimColor>{hotkey} </Text>
						<Text>{_.startCase(id)}</Text>
						<Spacer />
						<Box minWidth={2} justifyContent="flex-end">
							<Text dimColor={_.isString(scores[id])}>{scores[id]}</Text>
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
