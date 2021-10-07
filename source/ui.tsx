import { Box, Spacer, Text, useApp, useInput } from 'ink'
import Gradient from 'ink-gradient'
import _ from 'lodash'
import open from 'open'
import React from 'react'

import type { GameEngine } from './game-engine'
import type { State } from './model'
import { observer } from './observer'
import { toPairs } from './utils'

// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports -- this does not import
const packageJson = require('../package.json')

const rulesKey = 'P'
const restartKey = 'L'

const diceKeys: Record<string, 0 | 1 | 2 | 3 | 4> = {
  A: 0,
  S: 1,
  D: 2,
  F: 3,
  G: 4,
}

const upperBoardKeys: Record<string, keyof State['scores']> = {
  1: 'ones',
  2: 'twos',
  3: 'threes',
  4: 'fours',
  5: 'fives',
  6: 'sixes',
}

const lowerBoardKeys: Record<string, keyof State['scores']> = {
  Q: 'threeOfAKind',
  W: 'fourOfAKind',
  E: 'fullHouse',
  R: 'smallStraight',
  T: 'largeStraight',
  Y: 'gamble',
  U: '5Dice',
}

const LabelBox: React.FC<{ label: string; width: number }> = ({
  children,
  label,
  width,
}) => {
  if (width > 0) {
    return (
      <Box flexDirection="column" width={width}>
        <Box>
          <Text dimColor>
            ╭ {label} {'─'.repeat(width - 4 - label.length)}╮
          </Text>
        </Box>
        <Box flexDirection="column">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return (
                <Box flexGrow={1}>
                  <Text dimColor>│ </Text>
                  <Box flexGrow={1}>{React.cloneElement(child)}</Box>
                  <Text dimColor> │</Text>
                </Box>
              )
            }

            return child
          })}
        </Box>
        <Box>
          <Text dimColor>╰{'─'.repeat(width - 2)}╯</Text>
        </Box>
      </Box>
    )
  }

  return <Box />
}

const App: React.FC<{ game: GameEngine }> = observer(({ game }) => {
  const {
    scores,
    potential,
    turn,
    upperBoardSum,
    upperBoardBonus,
    total,
    dice,
    isRolling,
    topScores,
    canRoll,
    jokerCount,
    potentialHasJoker,
    isGameStart,
  } = game
  const { exit } = useApp()

  useInput(
    (input, key) => {
      const lowerInput = input.toLowerCase()
      // Hold
      for (const [diceKey, index] of Object.entries(diceKeys)) {
        if (lowerInput === diceKey.toLowerCase()) {
          return game.hold(index)
        }
      }

      // Roll
      if (key.return) {
        return game.roll()
      }

      // Open rules
      if (lowerInput === rulesKey.toLowerCase()) {
        open('http://www.yahtzee.org.uk/rules.html')
        return
      }

      // Scores

      for (const [hotkey, id] of Object.entries(upperBoardKeys)) {
        if (lowerInput === hotkey.toLowerCase()) {
          return game.score(id)
        }
      }

      for (const [hotkey, id] of Object.entries(lowerBoardKeys)) {
        if (lowerInput === hotkey.toLowerCase()) {
          return game.score(id)
        }
      }

      if (lowerInput === restartKey.toLowerCase()) {
        return game.restart()
      }

      if (key.escape) {
        return exit()
      }
    },
    { isActive: !isRolling },
  )

  return (
    <Box flexDirection="column" width={58}>
      <Box justifyContent="center" marginY={1}>
        <Gradient colors={['#9C53F6', '#6FB5F9']}>5Dice</Gradient>
      </Box>

      <Box>
        <Box flexDirection="column">
          <LabelBox label="Turn" width={13}>
            <Text dimColor={turn === 0}>{turn || '-'}</Text>
          </LabelBox>

          <LabelBox label="Dice" width={13}>
            <Text dimColor={turn === 0 || !canRoll}>
              {Object.keys(diceKeys).join(' ')}
            </Text>
            <Box flexGrow={1} justifyContent="space-between">
              {dice.map(({ value, held }, index) => (
                <Text
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  dimColor={turn === 0 || (isRolling && !held)}
                  inverse={held}>
                  {turn > 0 ? value : '-'}
                </Text>
              ))}
            </Box>
          </LabelBox>

          <Spacer />

          <Box flexDirection="column" paddingBottom={1} paddingX={1}>
            <Box>
              <Box marginBottom={1} marginLeft={2} marginRight={1}>
                <Text dimColor={!canRoll}>↵</Text>
              </Box>
              <Text dimColor={!canRoll}>Roll</Text>
            </Box>

            <Box>
              <Box marginLeft={2} marginRight={1}>
                <Text dimColor={isGameStart}>{restartKey}</Text>
              </Box>
              <Text dimColor={isGameStart}>Restart</Text>
            </Box>

            <Box>
              <Box marginLeft={2} marginRight={1}>
                <Text>{rulesKey}</Text>
              </Box>
              <Text>Rules</Text>
            </Box>

            <Box marginBottom={1}>
              <Text>esc </Text>
              <Text>Quit</Text>
            </Box>

            <Box justifyContent="center">
              <Gradient colors={['#9C53F6', '#6FB5F9']}>wstone.io</Gradient>
            </Box>

            <Box justifyContent="center">
              <Text dimColor>{packageJson.version}</Text>
            </Box>
          </Box>
        </Box>

        <Box flexDirection="column">
          <LabelBox label="Upper Board" width={25}>
            {toPairs(upperBoardKeys).map(([hotkey, id]) => (
              <Box key={id} flexGrow={1}>
                <Text
                  dimColor={
                    !_.isNumber(potential[id]) || _.isNumber(scores[id])
                  }>
                  {hotkey}{' '}
                </Text>
                <Text
                  dimColor={
                    !_.isNumber(potential[id]) || _.isNumber(scores[id])
                  }>
                  {_.startCase(id)}
                </Text>
                <Spacer />
                <Box justifyContent="flex-end" minWidth={2}>
                  <Text
                    dimColor={
                      !_.isNumber(potential[id]) || _.isNumber(scores[id])
                    }>
                    {scores[id] ?? potential[id]}
                  </Text>
                </Box>
              </Box>
            ))}
            <Text dimColor>─────────────────────</Text>
            <Box flexGrow={1} justifyContent="space-between">
              <Text dimColor>Sum</Text>
              <Text dimColor>{upperBoardSum}</Text>
            </Box>
            <Box flexGrow={1} justifyContent="space-between">
              <Text dimColor>Bonus</Text>
              <Text dimColor>{upperBoardBonus}</Text>
            </Box>
          </LabelBox>

          <LabelBox label="Lower Board" width={25}>
            {toPairs(lowerBoardKeys).map(([hotkey, id]) => (
              <Box key={id} flexGrow={1}>
                <Text
                  dimColor={
                    !_.isNumber(potential[id]) || _.isNumber(scores[id])
                  }>
                  {hotkey}{' '}
                </Text>
                <Text
                  dimColor={
                    !_.isNumber(potential[id]) || _.isNumber(scores[id])
                  }>
                  {_.startCase(id)}
                </Text>
                {id === '5Dice' &&
                  _.times(jokerCount, (index) => (
                    <Text key={index} dimColor>
                      *
                    </Text>
                  ))}
                <Spacer />
                <Box justifyContent="flex-end" minWidth={2}>
                  <Text
                    dimColor={
                      !_.isNumber(potential[id]) || _.isNumber(scores[id])
                    }>
                    {potentialHasJoker
                      ? potential[id]
                      : scores[id] ?? potential[id]}
                  </Text>
                </Box>
              </Box>
            ))}
            <Text dimColor>═════════════════════</Text>
            <Box flexGrow={1} justifyContent="space-between">
              <Text dimColor>Total</Text>
              <Text dimColor>{total}</Text>
            </Box>
          </LabelBox>
        </Box>

        <LabelBox label="Top Scores" width={20}>
          {topScores.length ? (
            topScores.map((topScore) => {
              const isRecent = Date.now() - topScore.timestamp < 30_000
              return (
                <Box
                  key={topScore.timestamp}
                  flexGrow={1}
                  justifyContent="space-between">
                  <Text dimColor={!isRecent}>
                    {new Intl.DateTimeFormat().format(topScore.timestamp)}
                  </Text>
                  <Text dimColor={!isRecent}>{topScore.score}</Text>
                </Box>
              )
            })
          ) : (
            <Text dimColor>----------------</Text>
          )}
        </LabelBox>
      </Box>
    </Box>
  )
})

export default App
