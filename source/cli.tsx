#!/usr/bin/env node

/* eslint-disable no-console */

import chalk from 'chalk'
import { render } from 'ink'
import jsonfile from 'jsonfile'
import { autorun, toJS } from 'mobx'
import React from 'react'

import { GameEngine } from './game-engine'
import { stateSchema } from './model'
import App from './ui'

const savedFile = jsonfile.readFileSync('5dice.json', { throws: false })

if (savedFile) {
  try {
    stateSchema.parse(savedFile)
  } catch (error) {
    console.error(chalk.red('Error reading your 5dice.json file'))

    for (const issue of error.issues) {
      console.log(
        `${chalk.blue(issue.path.join(' > '))} ${chalk.bold(
          issue.message.toUpperCase(),
        )}`,
      )
    }

    process.exit(1)
  }
}

const game = new GameEngine(savedFile)

autorun(() => {
  if (game.isRolling === false) {
    jsonfile.writeFileSync('5dice.json', toJS(game))
  }
})

// eslint-disable-next-line no-console
console.clear()

render(<App game={game} />)
