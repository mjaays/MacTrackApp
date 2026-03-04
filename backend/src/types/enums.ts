// Enums as const objects for SQLite compatibility
// These are validated at runtime with Zod

export const Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
} as const;
export type Gender = (typeof Gender)[keyof typeof Gender];

export const ActivityLevel = {
  SEDENTARY: 'SEDENTARY',
  LIGHTLY_ACTIVE: 'LIGHTLY_ACTIVE',
  MODERATELY_ACTIVE: 'MODERATELY_ACTIVE',
  VERY_ACTIVE: 'VERY_ACTIVE',
  EXTRA_ACTIVE: 'EXTRA_ACTIVE',
} as const;
export type ActivityLevel = (typeof ActivityLevel)[keyof typeof ActivityLevel];

export const GoalType = {
  LOSE_WEIGHT: 'LOSE_WEIGHT',
  MAINTAIN: 'MAINTAIN',
  GAIN_WEIGHT: 'GAIN_WEIGHT',
  GAIN_MUSCLE: 'GAIN_MUSCLE',
  RECOMPOSITION: 'RECOMPOSITION',
} as const;
export type GoalType = (typeof GoalType)[keyof typeof GoalType];

export const MealType = {
  BREAKFAST: 'BREAKFAST',
  LUNCH: 'LUNCH',
  DINNER: 'DINNER',
  SNACK: 'SNACK',
  OTHER: 'OTHER',
} as const;
export type MealType = (typeof MealType)[keyof typeof MealType];

export const ExerciseCategory = {
  CARDIO: 'CARDIO',
  STRENGTH: 'STRENGTH',
  FLEXIBILITY: 'FLEXIBILITY',
  BALANCE: 'BALANCE',
  SPORTS: 'SPORTS',
  OTHER: 'OTHER',
} as const;
export type ExerciseCategory = (typeof ExerciseCategory)[keyof typeof ExerciseCategory];

export const MuscleGroup = {
  CHEST: 'CHEST',
  BACK: 'BACK',
  SHOULDERS: 'SHOULDERS',
  BICEPS: 'BICEPS',
  TRICEPS: 'TRICEPS',
  FOREARMS: 'FOREARMS',
  ABS: 'ABS',
  OBLIQUES: 'OBLIQUES',
  QUADS: 'QUADS',
  HAMSTRINGS: 'HAMSTRINGS',
  GLUTES: 'GLUTES',
  CALVES: 'CALVES',
  FULL_BODY: 'FULL_BODY',
} as const;
export type MuscleGroup = (typeof MuscleGroup)[keyof typeof MuscleGroup];

export const WorkoutType = {
  STRENGTH: 'STRENGTH',
  CARDIO: 'CARDIO',
  HIIT: 'HIIT',
  FLEXIBILITY: 'FLEXIBILITY',
  SPORTS: 'SPORTS',
  MIXED: 'MIXED',
  OTHER: 'OTHER',
} as const;
export type WorkoutType = (typeof WorkoutType)[keyof typeof WorkoutType];
