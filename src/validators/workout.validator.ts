import { z } from 'zod';

export const createWorkoutSchema = z.object({
  workoutType: z.string().min(1), // z.B. strength/cardio/mixed
  name: z.string().optional(),
  notes: z.string().optional(),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().optional(),
  entries: z.array(
    z.object({
      exerciseId: z.string().uuid(),
      orderIndex: z.number().int().min(0).optional(),
      sets: z.number().int().positive().optional(),
      reps: z.number().int().positive().optional(),
      weightKg: z.number().positive().optional(),
      durationMin: z.number().positive().optional(),
      distanceKm: z.number().positive().optional(),
      avgHeartRate: z.number().int().positive().optional(),
      caloriesBurned: z.number().positive().optional(),
      notes: z.string().optional(),
    })
  ).min(1),
});
