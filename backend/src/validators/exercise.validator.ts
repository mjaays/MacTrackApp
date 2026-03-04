import { z } from 'zod';
import { ExerciseCategory } from '../types/enums';

export const createExerciseSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(500).optional(),
  category: z.enum([
    ExerciseCategory.CARDIO,
    ExerciseCategory.STRENGTH,
    ExerciseCategory.FLEXIBILITY,
    ExerciseCategory.BALANCE,
    ExerciseCategory.SPORTS,
    ExerciseCategory.OTHER,
  ]),
  muscleGroups: z.string().max(200).optional(),
  caloriesPerMin: z.number().positive().optional(),
  isWeighted: z.boolean().default(true),
  isBodyweight: z.boolean().default(false),
});

export const updateExerciseSchema = createExerciseSchema.partial();

export const searchExercisesSchema = z.object({
  query: z.string().optional(),
  category: z.enum([
    ExerciseCategory.CARDIO,
    ExerciseCategory.STRENGTH,
    ExerciseCategory.FLEXIBILITY,
    ExerciseCategory.BALANCE,
    ExerciseCategory.SPORTS,
    ExerciseCategory.OTHER,
  ]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
export type UpdateExerciseInput = z.infer<typeof updateExerciseSchema>;
export type SearchExercisesInput = z.infer<typeof searchExercisesSchema>;
