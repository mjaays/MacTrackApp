import prisma from '../utils/prisma';

export class ExerciseService {
  static async getAllExercises(userId: string) {
    return prisma.exercise.findMany({
      where: {
        OR: [
          { isCustom: false },
          { createdByUserId: userId },
        ],
      },
      orderBy: { name: 'asc' },
    });
  }

  static async createExercise(userId: string, data: any) {
    return prisma.exercise.create({
      data: {
        ...data,
        isCustom: true,
        createdByUserId: userId,
        isWeighted: data.isWeighted ?? true,
        isBodyweight: data.isBodyweight ?? false,
      },
    });
  }
}
