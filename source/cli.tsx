#!/usr/bin/env node
import { render } from 'ink'
import React from 'react'

import game from './store'
import App from './ui'

// eslint-disable-next-line no-console
console.clear()

render(<App game={game} />)
