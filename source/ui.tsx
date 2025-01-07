import path from 'node:path'
import url from 'node:url'

import fs from 'fs-extra'
import { Box, Spacer, Text, useApp, useInput } from 'ink'
import _ from 'lodash'
import open from 'open'
import type { ReactNode } from 'react'
import React from 'react'

import type { State } from './model.js'
import { useGame } from './use-game.js'
import { toPairs } from './utils.js'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

const packageJson = fs.readJSONSync(path.join(__dirname, '..', 'package.json'))

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

const LabelBox: React.FC<{
  readonly label: string
  readonly width: number
  readonly children: ReactNode
}> = ({ children, label, width }) => {
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

const App: React.FC = () => {
  const potentialScoreboard = useGame('potentialScoreboard')
  const scores = useGame('scores')
  const turn = useGame('turn')
  const upperBoardSum = useGame('upperBoardSum')
  const upperBoardBonus = useGame('upperBoardBonus')
  const total = useGame('total')
  const dice = useGame('dice')
  const isRolling = useGame('isRolling')
  const topScores = useGame('topScores')
  const canRoll = useGame('canRoll')
  const jokerCount = useGame('jokerCount')
  const potentialHasJoker = useGame('potentialHasJoker')
  const isGameStart = useGame('isGameStart')
  const hold = useGame('hold')
  const roll = useGame('roll')
  const score = useGame('score')
  const restart = useGame('restart')

  const { exit } = useApp()

  useInput(
    (input, key) => {
      const lowerInput = input.toLowerCase()

      // Hold
      for (const [diceKey, index] of Object.entries(diceKeys)) {
        if (lowerInput === diceKey.toLowerCase()) {
          return hold(index)
        }
      }

      // Roll
      if (key.return) {
        return roll()
      }

      // Open rules
      if (lowerInput === rulesKey.toLowerCase()) {
        open('https://en.wikipedia.org/wiki/Yahtzee#Rules')
        return
      }

      // Scores

      for (const [hotkey, id] of Object.entries(upperBoardKeys)) {
        if (lowerInput === hotkey.toLowerCase()) {
          return score(id)
        }
      }

      for (const [hotkey, id] of Object.entries(lowerBoardKeys)) {
        if (lowerInput === hotkey.toLowerCase()) {
          return score(id)
        }
      }

      if (lowerInput === restartKey.toLowerCase()) {
        return restart()
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
        <Text color="#9C53F6">5</Text>
        <Text color="#916DF6">D</Text>
        <Text color="#8684F9">i</Text>
        <Text color="#7A9CF7">c</Text>
        <Text color="#6FB5F9">e</Text>
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
                  inverse={held}
                >
                  {value || '-'}
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
              <Text color="#9C53F6">w</Text>
              <Text color="#955FF4">s</Text>
              <Text color="#7F60D7">t</Text>
              <Text color="#8A77F5">o</Text>
              <Text color="#7C7BE5">n</Text>
              <Text color="#8091F8">e</Text>
              <Text color="#7A9DF9">.</Text>
              <Text color="#74A6F6">u</Text>
              <Text color="#6FB5F9">k</Text>
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
                    !_.isNumber(potentialScoreboard[id]) ||
                    _.isNumber(scores[id])
                  }
                >
                  {hotkey}{' '}
                </Text>
                <Text
                  dimColor={
                    !_.isNumber(potentialScoreboard[id]) ||
                    _.isNumber(scores[id])
                  }
                >
                  {_.startCase(id)}
                </Text>
                <Spacer />
                <Box justifyContent="flex-end" minWidth={2}>
                  <Text
                    dimColor={
                      !_.isNumber(potentialScoreboard[id]) ||
                      _.isNumber(scores[id])
                    }
                  >
                    {scores[id] ?? potentialScoreboard[id]}
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
                    !_.isNumber(potentialScoreboard[id]) ||
                    _.isNumber(scores[id])
                  }
                >
                  {hotkey}{' '}
                </Text>
                <Text
                  dimColor={
                    !_.isNumber(potentialScoreboard[id]) ||
                    _.isNumber(scores[id])
                  }
                >
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
                      !_.isNumber(potentialScoreboard[id]) ||
                      _.isNumber(scores[id])
                    }
                  >
                    {potentialHasJoker
                      ? potentialScoreboard[id]
                      : (scores[id] ?? potentialScoreboard[id])}
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
}

export default App
