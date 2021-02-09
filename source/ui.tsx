import { Box, Spacer, Text, useInput } from "ink";
import React, { useReducer } from "react";
import { initialState, reducer, roll } from "./store";
import _ from "lodash";
import { Scores } from "./model";

const App: React.FC = () => {
	const [state, dispatch] = useReducer(reducer, initialState);
	const dice = Object.entries(state.dice);
	const { potentialScores } = state;

	useInput((input) => {
		if (input === " ") {
			dispatch(roll());
		}
	});

	return (
		<Box alignItems="flex-start">
			<Box
				justifyContent="space-between"
				borderColor="white"
				borderStyle="round"
				paddingX={1}
				width={13}
			>
				{dice.map(([name, { value }]) => (
					<Text key={name}>{value}</Text>
				))}
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
							<Text dimColor>{potentialScores[id]}</Text>
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
							<Text dimColor>{potentialScores[id]}</Text>
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
