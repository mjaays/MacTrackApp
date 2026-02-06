import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { ExerciseService } from '../services/exercise.service';
import { createExerciseSchema } from '../validators/exercise.validator';

export class ExerciseController {
  static async getAllExercises(req: AuthenticatedRequest, res: Response) {
    const userId = req.userId!;
    const exercises = await ExerciseService.getAllExercises(userId);

    res.json({
      success: true,
      data: exercises,
    });
  }

  static async createExercise(req: AuthenticatedRequest, res: Response) {
    const userId = req.userId!;
    const data = createExerciseSchema.parse(req.body);

    const exercise = await ExerciseService.createExercise(userId, data);

    res.status(201).json({
      success: true,
      data: exercise,
    });
  }
}
