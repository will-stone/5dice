import { z } from 'zod'

const dieSchema = z.object({
  value: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
    z.literal(6),
    z.null(),
  ]),
  held: z.boolean(),
})

export type Die = z.infer<typeof dieSchema>

const scoreSchema = z.object({
  'ones': z.number().optional(),
  'twos': z.number().optional(),
  'threes': z.number().optional(),
  'fours': z.number().optional(),
  'fives': z.number().optional(),
  'sixes': z.number().optional(),
  'threeOfAKind': z.number().optional(),
  'fourOfAKind': z.number().optional(),
  'fullHouse': z.number().optional(),
  'smallStraight': z.number().optional(),
  'largeStraight': z.number().optional(),
  'gamble': z.number().optional(),
  '5Dice': z.number().optional(),
})

export const stateSchema = z.object({
  isRolling: z.boolean(),
  dice: z.tuple([dieSchema, dieSchema, dieSchema, dieSchema, dieSchema]),
  scores: scoreSchema,
  turn: z.number().min(0).max(3).int(),
  topScores: z.array(z.object({ timestamp: z.number(), score: z.number() })),
})

export type State = z.infer<typeof stateSchema>
