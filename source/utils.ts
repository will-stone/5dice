import type { DieNumber } from './model'

export const toPairs = Object.entries as <T>(o: T) => [keyof T, T[keyof T]][]

export const toKeys = Object.keys as <T>(o: T) => (keyof T)[]

export const d6 = (): DieNumber =>
  (Math.floor(6 * Math.random()) + 1) as DieNumber
