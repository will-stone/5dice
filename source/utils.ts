export const toPairs = Object.entries as <T>(o: T) => [keyof T, T[keyof T]][]

export const toKeys = Object.keys as <T>(o: T) => (keyof T)[]

export const d6 = (): number => Math.floor(6 * Math.random()) + 1
