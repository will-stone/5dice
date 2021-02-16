import { Box, Newline, Spacer, Text, useApp, useInput } from 'ink'
import Gradient from 'ink-gradient'
import Link from 'ink-link'
import _ from 'lodash'
import React, { useReducer } from 'react'

import { ScoreIds } from './model'
import {
  hold,
  initialState,
  reducer,
  roll,
  score,
  selectTotal,
  selectUpperBoardBonus,
  selectUpperBoardSum,
} from './store'

const upperBoard: { [key: string]: ScoreIds } = {
  1: 'ones',
  2: 'twos',
  3: 'threes',
  4: 'fours',
  5: 'fives',
  6: 'sixes',
}

const lowerBoard: { [key: string]: ScoreIds } = {
  Q: 'threeOfAKind',
  W: 'fourOfAKind',
  E: 'fullHouse',
  R: 'smallStraight',
  T: 'largeStraight',
  Y: 'chance',
  U: 'fiveDice',
}

const App: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const dice = Object.entries(state.dice)
  const { scores, turn } = state
  const { exit } = useApp()

  const upperBoardSum = selectUpperBoardSum(state)
  const upperBoardBonus = selectUpperBoardBonus(state)
  const total = selectTotal(state)

  useInput((input, key) => {
    // Hold
    if (
      input === 'a' ||
      input === 's' ||
      input === 'd' ||
      input === 'f' ||
      input === 'g'
    ) {
      return dispatch(hold(input))
    }

    // Roll
    if (key.return) {
      return dispatch(roll())
    }

    // Scores

    for (const [hotkey, id] of Object.entries(upperBoard)) {
      if (input === hotkey.toLowerCase()) {
        return dispatch(score(id))
      }
    }

    for (const [hotkey, id] of Object.entries(lowerBoard)) {
      if (input === hotkey.toLowerCase()) {
        return dispatch(score(id))
      }
    }

    if (key.escape) {
      return exit()
    }
  })

  return (
    <Box flexDirection="column" width={54}>
      <Box>
        <Box flexDirection="column">
          <Box
            borderColor="white"
            borderStyle="round"
            justifyContent="space-between"
            paddingX={1}
            width={13}
          >
            <Text>Turn</Text>

            <Text>{turn}</Text>
          </Box>

          <Box
            borderColor="white"
            borderStyle="round"
            height={4}
            paddingX={1}
            width={13}
          >
            <Text>
              <Text dimColor>A S D F G</Text>

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
          flexDirection="column"
          paddingX={1}
          width={16}
        >
          {Object.entries(upperBoard).map(([hotkey, id]) => (
            <Box key={id}>
              <Text dimColor>{hotkey} </Text>

              <Text>{_.startCase(id)}</Text>

              <Spacer />

              <Box justifyContent="flex-end" minWidth={2}>
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

            <Text>{upperBoardSum}</Text>
          </Box>

          <Box>
            <Text>Bonus</Text>

            <Spacer />

            <Text>{upperBoardBonus}</Text>
          </Box>
        </Box>

        <Box
          borderColor="white"
          borderStyle="round"
          flexDirection="column"
          paddingX={1}
          width={25}
        >
          {Object.entries(lowerBoard).map(([hotkey, id]) => (
            <Box key={id}>
              <Text dimColor>{hotkey} </Text>

              <Text>{_.startCase(id)}</Text>

              <Spacer />

              <Box justifyContent="flex-end" minWidth={2}>
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

            <Text>{total}</Text>
          </Box>
        </Box>
      </Box>

      <Box justifyContent="space-between">
        <Text>
          <Text dimColor>↵</Text> Roll
        </Text>

        <Text>
          <Text dimColor>H</Text> Help
        </Text>

        <Text>
          <Text dimColor>esc</Text> Quit
        </Text>

        <Link fallback={false} url="https://wstone.io">
          <Gradient name="atlas">https://wstone.io</Gradient>
        </Link>
      </Box>
    </Box>
  )
}

export default App
