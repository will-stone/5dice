#!/usr/bin/env node
import { render } from 'ink'
import jsonfile from 'jsonfile'
import React from 'react'

import { GameEngine } from './game-engine'
import App from './ui'

// TODO needs parsing
const savedFile = jsonfile.readFileSync('5dice.json', { throws: false })

const game = new GameEngine(savedFile)

// eslint-disable-next-line no-console
console.clear()

render(<App game={game} />)
