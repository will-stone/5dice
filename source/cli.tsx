#!/usr/bin/env node
import { render } from 'ink'
import React from 'react'

import game from './game-engine'
import App from './ui'

// eslint-disable-next-line no-console
console.clear()

render(<App game={game} />)
