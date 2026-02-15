import { z } from 'zod';
import { MealType } from '../types/enums';

const mealEntrySchema = z.object({
  foodId: z.string().uuid('Invalid food ID'),
  servings: z.number().positive().default(1),
  customGrams: z.number().positive().optional(),
});

export const createMealSchema = z.object({
  name: z.string().max(100).optional(),
  mealType: z.enum([
    MealType.BREAKFAST,
    MealType.LUNCH,
    MealType.DINNER,
    MealType.SNACK,
    MealType.OTHER,
  ]),
  loggedAt: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
  entries: z.array(mealEntrySchema).min(1, 'At least one food entry is required'),
});

export const updateMealSchema = z.object({
  name: z.string().max(100).optional(),
  mealType: z.enum([
    MealType.BREAKFAST,
    MealType.LUNCH,
    MealType.DINNER,
    MealType.SNACK,
    MealType.OTHER,
  ]).optional(),
  notes: z.string().max(500).optional(),
});

export const addMealEntrySchema = mealEntrySchema;

export const updateMealEntrySchema = z.object({
  servings: z.number().positive().optional(),
  customGrams: z.number().positive().optional().nullable(),
});

export const getMealsSchema = z.object({
  date: z.string().optional(), // YYYY-MM-DD format
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  mealType: z.enum([
    MealType.BREAKFAST,
    MealType.LUNCH,
    MealType.DINNER,
    MealType.SNACK,
    MealType.OTHER,
  ]).optional(),
});

export type CreateMealInput = z.infer<typeof createMealSchema>;
export type UpdateMealInput = z.infer<typeof updateMealSchema>;
export type AddMealEntryInput = z.infer<typeof addMealEntrySchema>;
export type UpdateMealEntryInput = z.infer<typeof updateMealEntrySchema>;
export type GetMealsInput = z.infer<typeof getMealsSchema>;
