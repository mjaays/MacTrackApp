import { z } from 'zod';

export const createExerciseSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  description: z.string().optional(),
  muscleGroups: z.string().optional(),
  caloriesPerMin: z.number().positive().optional(),
  isWeighted: z.boolean().optional(),
  isBodyweight: z.boolean().optional(),
});
