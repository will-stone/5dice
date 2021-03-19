/* eslint-disable react/jsx-newline */

import { Box, Spacer, Text, useApp, useInput } from 'ink'
import Gradient from 'ink-gradient'
import _ from 'lodash'
import React from 'react'

import type { GameEngine } from './game-engine'
import { State } from './model'
import { observer } from './observer'
import { toPairs } from './utils'

// eslint-disable-next-line @typescript-eslint/no-var-requires -- this does not include
const packageJson = require('../package.json')

const upperBoard: { [key: string]: keyof State['scores'] } = {
  1: 'ones',
  2: 'twos',
  3: 'threes',
  4: 'fours',
  5: 'fives',
  6: 'sixes',
}

const lowerBoard: { [key: string]: keyof State['scores'] } = {
  Q: 'threeOfAKind',
  W: 'fourOfAKind',
  E: 'fullHouse',
  R: 'smallStraight',
  T: 'largeStraight',
  Y: 'chance',
  U: 'fiveDice',
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
    rolling,
    topScores,
    canRoll,
    isGameOver,
    jokerCount,
    potentialHasJoker,
  } = game
  const { exit } = useApp()

  useInput((input, key) => {
    const lowerInput = input.toLowerCase()
    // Hold
    if (
      lowerInput === 'a' ||
      lowerInput === 's' ||
      lowerInput === 'd' ||
      lowerInput === 'f' ||
      lowerInput === 'g'
    ) {
      return game.hold(lowerInput)
    }

    // Roll
    if (key.return) {
      return game.roll()
    }

    // Scores

    for (const [hotkey, id] of Object.entries(upperBoard)) {
      if (lowerInput === hotkey.toLowerCase()) {
        return game.score(id)
      }
    }

    for (const [hotkey, id] of Object.entries(lowerBoard)) {
      if (lowerInput === hotkey.toLowerCase()) {
        return game.score(id)
      }
    }

    if (lowerInput === 'l') {
      return game.restart()
    }

    if (key.escape) {
      return exit()
    }
  })

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
            <Text dimColor>A S D F G</Text>
            <Box flexGrow={1} justifyContent="space-between">
              {toPairs(dice).map(([id, { value, held }]) => (
                <Text
                  key={id}
                  dimColor={turn === 0 || (rolling && !held)}
                  inverse={held}
                >
                  {turn > 0 ? value : '-'}
                </Text>
              ))}
            </Box>
          </LabelBox>

          <Spacer />

          <Box flexDirection="column" paddingBottom={1} paddingX={1}>
            <Box>
              <Box marginLeft={2} marginRight={1}>
                <Text dimColor>↵</Text>
              </Box>
              <Text dimColor={!canRoll}>Roll</Text>
            </Box>

            <Box>
              <Box marginLeft={2} marginRight={1}>
                <Text dimColor>L</Text>
              </Box>
              <Text dimColor={!isGameOver}>
                {isGameOver ? 'Start' : 'Restart'}
              </Text>
            </Box>

            <Box marginBottom={1}>
              <Text dimColor>esc </Text>
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
            {toPairs(upperBoard).map(([hotkey, id]) => (
              <Box key={id} flexGrow={1}>
                <Text
                  dimColor={
                    !_.isNumber(potential[id]) || _.isNumber(scores[id])
                  }
                >
                  {hotkey}{' '}
                </Text>
                <Text
                  dimColor={
                    !_.isNumber(potential[id]) || _.isNumber(scores[id])
                  }
                >
                  {_.startCase(id)}
                </Text>
                <Spacer />
                <Box justifyContent="flex-end" minWidth={2}>
                  <Text
                    dimColor={
                      !_.isNumber(potential[id]) || _.isNumber(scores[id])
                    }
                  >
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
            {toPairs(lowerBoard).map(([hotkey, id]) => (
              <Box key={id} flexGrow={1}>
                <Text
                  dimColor={
                    !_.isNumber(potential[id]) || _.isNumber(scores[id])
                  }
                >
                  {hotkey}{' '}
                </Text>
                <Text
                  dimColor={
                    !_.isNumber(potential[id]) || _.isNumber(scores[id])
                  }
                >
                  {_.startCase(id)}
                </Text>
                {id === 'fiveDice' &&
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
                    }
                  >
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
                  justifyContent="space-between"
                >
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
