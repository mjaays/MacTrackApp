import { z } from 'zod';
import { Gender, ActivityLevel, GoalType } from '../types/enums';

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER]).optional(),
  heightCm: z.number().positive().max(300).optional(),
  currentWeightKg: z.number().positive().max(500).optional(),
  activityLevel: z
    .enum([
      ActivityLevel.SEDENTARY,
      ActivityLevel.LIGHTLY_ACTIVE,
      ActivityLevel.MODERATELY_ACTIVE,
      ActivityLevel.VERY_ACTIVE,
      ActivityLevel.EXTRA_ACTIVE,
    ])
    .optional(),
});

export const updateGoalsSchema = z.object({
  goalType: z
    .enum([
      GoalType.LOSE_WEIGHT,
      GoalType.MAINTAIN,
      GoalType.GAIN_WEIGHT,
      GoalType.GAIN_MUSCLE,
      GoalType.RECOMPOSITION,
    ])
    .optional(),
  targetWeightKg: z.number().positive().max(500).optional(),
  weeklyWeightChangeKg: z.number().min(-1).max(1).optional(),
  dailyCalories: z.number().int().positive().max(10000).optional(),
  dailyProteinG: z.number().int().positive().max(1000).optional(),
  dailyCarbsG: z.number().int().positive().max(1000).optional(),
  dailyFatG: z.number().int().positive().max(500).optional(),
  dailyFiberG: z.number().int().positive().max(100).optional(),
  dailyWaterMl: z.number().int().positive().max(10000).optional(),
  useCustomMacros: z.boolean().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateGoalsInput = z.infer<typeof updateGoalsSchema>;
