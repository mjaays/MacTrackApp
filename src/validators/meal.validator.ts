import { z } from 'zod';

export const createMealSchema = z.object({
  mealType: z.string().min(1),
  name: z.string().optional(),
  notes: z.string().optional(),
  loggedAt: z.string().datetime().optional(),
  entries: z.array(
    z.object({
      foodId: z.string().uuid(),
      servings: z.number().positive().optional(),
      customGrams: z.number().positive().optional(),
    })
  ).min(1),
});
