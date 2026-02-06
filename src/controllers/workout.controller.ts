import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { WorkoutService } from '../services/workout.service';
import { createWorkoutSchema } from '../validators/workout.validator';

export class WorkoutController {
  static async createWorkout(req: AuthenticatedRequest, res: Response) {
    const userId = req.userId!;
    const input = createWorkoutSchema.parse(req.body);

    const workout = await WorkoutService.createWorkout(userId, input);

    res.status(201).json({
      success: true,
      data: workout,
    });
  }

  static async getWorkouts(req: AuthenticatedRequest, res: Response) {
    const userId = req.userId!;
    const workouts = await WorkoutService.getWorkouts(userId);

    res.json({
      success: true,
      data: workouts,
    });
  }
}
