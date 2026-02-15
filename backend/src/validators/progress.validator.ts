import { z } from 'zod';

export const createProgressLogSchema = z.object({
  loggedAt: z.string().datetime().optional(),
  weightKg: z.number().positive().optional(),
  bodyFatPct: z.number().min(0).max(100).optional(),
  waistCm: z.number().positive().optional(),
  hipsCm: z.number().positive().optional(),
  chestCm: z.number().positive().optional(),
  armsCm: z.number().positive().optional(),
  thighsCm: z.number().positive().optional(),
  notes: z.string().max(500).optional(),
  photoUrl: z.string().url().optional(),
});

export const updateProgressLogSchema = createProgressLogSchema.partial();

export type CreateProgressLogInput = z.infer<typeof createProgressLogSchema>;
export type UpdateProgressLogInput = z.infer<typeof updateProgressLogSchema>;
