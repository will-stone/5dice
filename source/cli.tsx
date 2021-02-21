#!/usr/bin/env node
import { render } from 'ink'
import jsonfile from 'jsonfile'
import { autorun, toJS } from 'mobx'
import path from 'path'
import React from 'react'
import writeJsonFile from 'write-json-file'

import { GameEngine } from './game-engine'
import App from './ui'

// TODO needs parsing
const savedFile = jsonfile.readFileSync('5dice.json', { throws: false })

const game = new GameEngine(savedFile)

autorun(() => {
  writeJsonFile(path.join('.', '5dice.json'), toJS(game))
})

// eslint-disable-next-line no-console
console.clear()

render(<App game={game} />)
