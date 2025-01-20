import { createReactStore } from '2n8'
import jsonfile from 'jsonfile'
import pc from 'picocolors'
import type { ZodError } from 'zod'

import { GameEngine } from './game-engine.js'
import { stateSchema } from './model.js'

const savedFile = jsonfile.readFileSync('5dice.json', { throws: false })

if (savedFile) {
  try {
    stateSchema.parse(savedFile)
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error(pc.red('Error reading your 5dice.json file'))

    for (const issue of (error as ZodError).issues) {
      // eslint-disable-next-line no-console
      console.log(
        `${pc.blue(issue.path.join(' > '))} ${pc.bold(
          issue.message.toUpperCase(),
        )}`,
      )
    }

    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1)
  }
}

export const useGame = createReactStore(new GameEngine())

useGame.subscribe(() => {
  if (useGame.store.isRolling === false) {
    jsonfile.writeFileSync('5dice.json', useGame.store.gameState)
  }
})

useGame.store.loadState(savedFile)
