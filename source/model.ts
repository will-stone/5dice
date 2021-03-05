import * as z from 'zod'

const dieSchema = z.object({
  value: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
    z.literal(6),
  ]),
  held: z.boolean(),
})

export type Die = z.infer<typeof dieSchema>

const scoreSchema = z.object({
  ones: z.number().optional(),
  twos: z.number().optional(),
  threes: z.number().optional(),
  fours: z.number().optional(),
  fives: z.number().optional(),
  sixes: z.number().optional(),
  threeOfAKind: z.number().optional(),
  fourOfAKind: z.number().optional(),
  fullHouse: z.number().optional(),
  smallStraight: z.number().optional(),
  largeStraight: z.number().optional(),
  chance: z.number().optional(),
  fiveDice: z.number().optional(),
})

export const stateSchema = z.object({
  rolling: z.boolean(),
  dice: z.object({
    a: dieSchema,
    s: dieSchema,
    d: dieSchema,
    f: dieSchema,
    g: dieSchema,
  }),
  scores: scoreSchema,
  potential: scoreSchema,
  turn: z.number().min(0).max(3).int(),
  topScores: z.array(z.object({ timestamp: z.number(), score: z.number() })),
})

export type State = z.infer<typeof stateSchema>
