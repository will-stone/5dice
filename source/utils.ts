export const toPairs = Object.entries as <T>(o: T) => [keyof T, T][]

export const toKeys = Object.keys as <T>(o: T) => (keyof T)[]
