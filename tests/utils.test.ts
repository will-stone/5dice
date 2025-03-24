import { expect, test, vi } from 'vitest'

import { biasedD6, d6, toKeys, toPairs } from '../source/utils.js'

test('should convert to pairs', () => {
  expect(toPairs({ a: 1, b: 2 })).toStrictEqual([
    ['a', 1],
    ['b', 2],
  ])
})

test('should convert to keys', () => {
  expect(toKeys({ a: 1, b: 2 })).toStrictEqual(['a', 'b'])
})

test('should roll a d6', () => {
  const randomSpy = vi.spyOn(globalThis.Math, 'random')
  randomSpy.mockReturnValueOnce(0.123)

  expect(d6()).toBe(1)

  randomSpy.mockReturnValueOnce(0.422)

  expect(d6()).toBe(3)

  randomSpy.mockReturnValueOnce(0.999_99)

  expect(d6()).toBe(6)

  randomSpy.mockRestore()
})

test('should roll a biased d6', () => {
  const randomSpy = vi.spyOn(globalThis.Math, 'random')
  randomSpy.mockReturnValueOnce(0.123)
  randomSpy.mockReturnValueOnce(0.152)
  randomSpy.mockReturnValueOnce(0.522)

  expect(biasedD6(1)).toBe(4)
  expect(randomSpy).toHaveBeenCalledTimes(3)

  randomSpy.mockRestore()
})
