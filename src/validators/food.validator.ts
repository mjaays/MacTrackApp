import { z } from 'zod';

export const createFoodSchema = z.object({
  name: z.string().min(1),
  brand: z.string().optional(),
  servingSizeG: z.number().positive().optional(),
  caloriesKcal: z.number().positive(),
  proteinG: z.number().min(0),
  carbsG: z.number().min(0),
  fatG: z.number().min(0),
  fiberG: z.number().min(0).optional(),
});
