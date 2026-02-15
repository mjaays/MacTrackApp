import { z } from 'zod';
import { WorkoutType } from '../types/enums';

const workoutEntrySchema = z.object({
  exerciseId: z.string().uuid('Invalid exercise ID'),
  orderIndex: z.number().int().min(0).optional(),
  sets: z.number().int().positive().optional(),
  reps: z.number().int().positive().optional(),
  weightKg: z.number().positive().optional(),
  durationMin: z.number().positive().optional(),
  distanceKm: z.number().positive().optional(),
  avgHeartRate: z.number().int().positive().optional(),
  caloriesBurned: z.number().positive().optional(),
  notes: z.string().max(500).optional(),
});

export const createWorkoutSchema = z.object({
  name: z.string().max(100).optional(),
  workoutType: z.enum([
    WorkoutType.STRENGTH,
    WorkoutType.CARDIO,
    WorkoutType.HIIT,
    WorkoutType.FLEXIBILITY,
    WorkoutType.SPORTS,
    WorkoutType.MIXED,
    WorkoutType.OTHER,
  ]),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
  entries: z.array(workoutEntrySchema).min(1, 'At least one exercise entry is required'),
});

export const updateWorkoutSchema = z.object({
  name: z.string().max(100).optional(),
  workoutType: z.enum([
    WorkoutType.STRENGTH,
    WorkoutType.CARDIO,
    WorkoutType.HIIT,
    WorkoutType.FLEXIBILITY,
    WorkoutType.SPORTS,
    WorkoutType.MIXED,
    WorkoutType.OTHER,
  ]).optional(),
  notes: z.string().max(500).optional(),
});

export const addWorkoutEntrySchema = workoutEntrySchema;

export const updateWorkoutEntrySchema = z.object({
  sets: z.number().int().positive().optional(),
  reps: z.number().int().positive().optional(),
  weightKg: z.number().positive().optional().nullable(),
  durationMin: z.number().positive().optional().nullable(),
  distanceKm: z.number().positive().optional().nullable(),
  avgHeartRate: z.number().int().positive().optional().nullable(),
  caloriesBurned: z.number().positive().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;
export type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;
export type AddWorkoutEntryInput = z.infer<typeof addWorkoutEntrySchema>;
export type UpdateWorkoutEntryInput = z.infer<typeof updateWorkoutEntrySchema>;
