/* eslint-disable react/jsx-newline */

import {
  Box,
  DOMElement,
  measureElement,
  Spacer,
  Text,
  useApp,
  useInput,
} from 'ink'
import Divider from 'ink-divider'
import Gradient from 'ink-gradient'
import Link from 'ink-link'
import jsonfile from 'jsonfile'
import _ from 'lodash'
import { toJS } from 'mobx'
import React, { useEffect, useRef, useState } from 'react'

import type { GameEngine } from './game-engine'
import { ScoreIds } from './model'
import { observer } from './observer'
import { toPairs } from './utils'

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

const LabelBox: React.FC<{ label: string }> = ({ children, label }) => {
  const reference = useRef<DOMElement>(null)
  const [{ width }, setMeasurements] = useState({ width: 0, height: 0 })

  useEffect(() => {
    setMeasurements(measureElement(reference.current as DOMElement))
  }, [])

  if (width > 0) {
    return (
      <Box ref={reference} flexDirection="column">
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

  return <Box ref={reference} />
}

const App: React.FC<{ game: GameEngine }> = observer(({ game }) => {
  const {
    scores,
    turn,
    upperBoardSum,
    upperBoardBonus,
    total,
    dice,
    rolling,
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
      jsonfile.writeFileSync('5dice.json', toJS(game))
      return exit()
    }
  })

  return (
    <Box flexDirection="column" width={56}>
      <Box justifyContent="center" marginBottom={1}>
        <Divider dividerColor="grey" title="5Dice" titleColor="brightWhite" />
      </Box>

      <Box justifyContent="space-between">
        <Box flexDirection="column" width={13}>
          <LabelBox label="Turn">
            <Text dimColor={turn === 0}>{turn || '-'}</Text>
          </LabelBox>

          <Box height={1} />

          <LabelBox label="Dice">
            <Text dimColor>A S D F G</Text>
            <Box flexGrow={1} justifyContent="space-between">
              {toPairs(dice).map(([id, { value, held }]) => (
                <Text
                  key={id}
                  dimColor={value === 0 || (rolling && !held)}
                  inverse={held}
                >
                  {value || '-'}
                </Text>
              ))}
            </Box>
          </LabelBox>
        </Box>

        <Box flexDirection="column" width={16}>
          <LabelBox label="Upper Board">
            {toPairs(upperBoard).map(([hotkey, id]) => (
              <Box key={id} flexGrow={1}>
                <Text dimColor={!_.isString(scores[id])}>{hotkey} </Text>
                <Text dimColor={!_.isString(scores[id])}>
                  {_.startCase(id)}
                </Text>
                <Spacer />
                <Box justifyContent="flex-end" minWidth={2}>
                  <Text dimColor={_.isNumber(scores[id])}>{scores[id]}</Text>
                </Box>
              </Box>
            ))}
            <Text dimColor>────────────</Text>
            <Box flexGrow={1} justifyContent="space-between">
              <Text dimColor={upperBoardSum === 0}>Sum</Text>
              <Text dimColor={upperBoardSum === 0}>{upperBoardSum}</Text>
            </Box>
            <Box flexGrow={1} justifyContent="space-between">
              <Text dimColor={upperBoardBonus < 35}>Bonus</Text>
              <Text dimColor={upperBoardBonus < 35}>{upperBoardBonus}</Text>
            </Box>
          </LabelBox>
        </Box>

        <Box flexDirection="column" width={25}>
          <LabelBox label="Lower Board">
            {toPairs(lowerBoard).map(([hotkey, id]) => (
              <Box key={id} flexGrow={1}>
                <Text dimColor={!_.isString(scores[id])}>{hotkey} </Text>
                <Text dimColor={!_.isString(scores[id])}>
                  {_.startCase(id)}
                </Text>
                <Spacer />
                <Box justifyContent="flex-end" minWidth={2}>
                  <Text dimColor={_.isNumber(scores[id])}>{scores[id]}</Text>
                </Box>
              </Box>
            ))}
            <Text dimColor>═════════════════════</Text>
            <Box flexGrow={1} justifyContent="space-between">
              <Text dimColor={total === 0}>Total</Text>
              <Text dimColor={total === 0}>{total}</Text>
            </Box>
          </LabelBox>
        </Box>
      </Box>

      <Box justifyContent="center" marginTop={1}>
        <Divider dividerColor="grey" />
      </Box>

      <Box justifyContent="space-between">
        <Box>
          <Text dimColor>↵ </Text>
          <Text>Roll</Text>
        </Box>

        <Box>
          <Text dimColor>L </Text>
          <Text>Restart</Text>
        </Box>

        <Box>
          <Text dimColor>esc </Text>
          <Text>Save & Quit</Text>
        </Box>

        <Link fallback={false} url="https://wstone.io">
          <Gradient name="atlas">https://wstone.io</Gradient>
        </Link>
      </Box>
    </Box>
  )
})

export default App
