import type { Die } from './model.js'

export const toPairs = Object.entries as <T>(o: T) => [keyof T, T[keyof T]][]

export const toKeys = Object.keys as <T>(o: T) => (keyof T)[]

export const d6 = (): Die['value'] =>
  (Math.floor(6 * Math.random()) + 1) as Die['value']

export const biasedD6 = (notThisNumber: Die['value']): Die['value'] => {
  const die = d6()

  if (die === notThisNumber) {
    return biasedD6(notThisNumber)
  }

  return die
}
