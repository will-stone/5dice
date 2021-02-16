/* eslint-disable react/jsx-newline */

import { Box, Spacer, Text, useApp, useInput } from 'ink'
import Divider from 'ink-divider'
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
      <Box justifyContent="center" marginBottom={1}>
        <Divider dividerColor="grey" title="5Dice" titleColor="brightWhite" />
      </Box>

      <Box>
        <Box flexDirection="column">
          <Box flexDirection="column">
            <Box>
              <Text dimColor>╭ Turn ─────╮</Text>
            </Box>
            <Box>
              <Text dimColor>│ </Text>
              <Text dimColor={turn === 0}>{turn}</Text>
              <Spacer />
              <Text dimColor>│</Text>
            </Box>
            <Box>
              <Text dimColor>╰───────────╯</Text>
            </Box>
          </Box>

          <Box flexDirection="column">
            <Box>
              <Text dimColor>╭ Dice ─────╮</Text>
            </Box>
            <Box>
              <Text dimColor>│ </Text>
              <Text dimColor>A S D F G</Text>
              <Text dimColor> │</Text>
            </Box>
            <Box>
              <Text dimColor>│ </Text>
              {dice.map(([id, { value, held }], index) => (
                <React.Fragment key={id}>
                  {index !== 0 && <Text> </Text>}

                  <Text dimColor={value === 0} inverse={held}>
                    {value || '-'}
                  </Text>
                </React.Fragment>
              ))}
              <Text dimColor> │</Text>
            </Box>
            <Box>
              <Text dimColor>╰───────────╯</Text>
            </Box>
          </Box>
        </Box>

        <Box flexDirection="column" width={16}>
          <Box>
            <Text dimColor>╭ Upper Board ─╮</Text>
          </Box>
          {Object.entries(upperBoard).map(([hotkey, id]) => (
            <Box key={id}>
              <Text dimColor>│ </Text>
              <Text dimColor={!_.isString(scores[id])}>{hotkey} </Text>
              <Text dimColor={!_.isString(scores[id])}>{_.startCase(id)}</Text>
              <Spacer />
              <Box justifyContent="flex-end" minWidth={2}>
                <Text dimColor={_.isNumber(scores[id])}>{scores[id]}</Text>
              </Box>
              <Text dimColor> │</Text>
            </Box>
          ))}
          <Box>
            <Text dimColor>│ ──────────── │</Text>
          </Box>
          <Box>
            <Text dimColor>│ </Text>
            <Text dimColor={upperBoardSum === 0}>Sum</Text>
            <Spacer />
            <Text dimColor={upperBoardSum === 0}>{upperBoardSum}</Text>
            <Text dimColor> │</Text>
          </Box>
          <Box>
            <Text dimColor>│ </Text>
            <Text dimColor={upperBoardBonus < 35}>Bonus</Text>
            <Spacer />
            <Text dimColor={upperBoardBonus < 35}>{upperBoardBonus}</Text>
            <Text dimColor> │</Text>
          </Box>
          <Box>
            <Text dimColor>╰──────────────╯</Text>
          </Box>
        </Box>

        <Box flexDirection="column" width={25}>
          <Box>
            <Text dimColor>╭ Lower Board ──────────╮</Text>
          </Box>
          {Object.entries(lowerBoard).map(([hotkey, id]) => (
            <Box key={id}>
              <Text dimColor>│ </Text>
              <Text dimColor={!_.isString(scores[id])}>{hotkey} </Text>
              <Text dimColor={!_.isString(scores[id])}>{_.startCase(id)}</Text>
              <Spacer />
              <Box justifyContent="flex-end" minWidth={2}>
                <Text dimColor={_.isNumber(scores[id])}>{scores[id]}</Text>
              </Box>
              <Text dimColor> │</Text>
            </Box>
          ))}
          <Box>
            <Text dimColor>│ </Text>
            <Text dimColor>═════════════════════</Text>
            <Text dimColor> │</Text>
          </Box>
          <Box>
            <Text dimColor>│ </Text>
            <Text dimColor={total === 0}>Total</Text>
            <Spacer />
            <Text dimColor={total === 0}>{total}</Text>
            <Text dimColor> │</Text>
          </Box>
          <Box>
            <Text dimColor>╰───────────────────────╯</Text>
          </Box>
        </Box>
      </Box>

      <Box justifyContent="center" marginTop={1}>
        <Divider dividerColor="grey" />
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
