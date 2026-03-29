import { prisma } from '../utils/prisma';
import { NotFoundError } from '../errors/NotFoundError';
import { AuthError } from '../errors/AuthError';
import { ExerciseCategory } from '../types/enums';
import type { CreateExerciseInput, UpdateExerciseInput, SearchExercisesInput } from '../validators/exercise.validator';

export interface ExternalExerciseResult {
  externalId: string;
  name: string;
  description?: string;
  category: string;
  muscleGroups?: string;
}

export class ExerciseService {
  async getAllExercises(userId: string, params: SearchExercisesInput) {
    const { query, category, page, limit } = params;
    const skip = (page - 1) * limit;

    const where = {
      AND: [
        {
          OR: [
            { isCustom: false },
            { createdByUserId: userId },
          ],
        },
        query
          ? {
              OR: [
                { name: { contains: query } },
                { description: { contains: query } },
              ],
            }
          : {},
        category ? { category } : {},
      ],
    };

    const [exercises, total] = await Promise.all([
      prisma.exercise.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.exercise.count({ where }),
    ]);

    return {
      exercises,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getExerciseById(userId: string, exerciseId: string) {
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      throw new NotFoundError('Exercise', exerciseId);
    }

    if (exercise.isCustom && exercise.createdByUserId !== userId) {
      throw new NotFoundError('Exercise', exerciseId);
    }

    return exercise;
  }

  async createExercise(userId: string, data: CreateExerciseInput) {
    return prisma.exercise.create({
      data: {
        ...data,
        isCustom: true,
        createdByUserId: userId,
      },
    });
  }

  async updateExercise(userId: string, exerciseId: string, data: UpdateExerciseInput) {
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      throw new NotFoundError('Exercise', exerciseId);
    }

    if (exercise.createdByUserId !== userId) {
      throw new AuthError('You can only update your own custom exercises');
    }

    return prisma.exercise.update({
      where: { id: exerciseId },
      data,
    });
  }

  async deleteExercise(userId: string, exerciseId: string) {
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      throw new NotFoundError('Exercise', exerciseId);
    }

    if (exercise.createdByUserId !== userId) {
      throw new AuthError('You can only delete your own custom exercises');
    }

    const usageCount = await prisma.workoutEntry.count({
      where: { exerciseId },
    });

    if (usageCount > 0) {
      throw new AuthError(`Cannot delete exercise: it is used in ${usageCount} workout entries`);
    }

    await prisma.exercise.delete({
      where: { id: exerciseId },
    });
  }

  // Map wger category names (body parts) to our ExerciseCategory enum
  private mapWgerCategory(categoryName?: string): string {
    if (!categoryName) return ExerciseCategory.OTHER;
    const name = categoryName.toLowerCase();
    if (name.includes('cardio') || name.includes('running') || name.includes('swimming')) return ExerciseCategory.CARDIO;
    if (name.includes('stretch') || name.includes('yoga') || name.includes('flexibility')) return ExerciseCategory.FLEXIBILITY;
    if (name.includes('balance') || name.includes('stability')) return ExerciseCategory.BALANCE;
    if (name.includes('sport')) return ExerciseCategory.SPORTS;
    // Most wger entries (Arms, Legs, Back, Chest, Shoulders, Abs, Calves) are strength exercises
    return ExerciseCategory.STRENGTH;
  }

  /**
   * Search wger exercise database
   */
  async searchExternalExercises(query: string): Promise<ExternalExerciseResult[]> {
    const url = `https://wger.de/api/v2/exercise/search/?term=${encodeURIComponent(query)}&language=english&format=json`;
    const res = await fetch(url, { headers: { 'User-Agent': 'MacTrackApp/1.0' } });
    if (!res.ok) return [];

    const data = await res.json() as { suggestions?: any[] };
    if (!data.suggestions) return [];

    return data.suggestions
      .filter((s: any) => s.value?.trim())
      .map((s: any) => ({
        externalId:   String(s.data?.id ?? ''),
        name:         s.value.trim(),
        description:  s.data?.description?.trim() || undefined,
        category:     this.mapWgerCategory(s.data?.category?.name),
        muscleGroups: Array.isArray(s.data?.muscles)
          ? s.data.muscles.map((m: any) => m.name_en ?? m.name).filter(Boolean).join(', ')
          : undefined,
      }));
  }

  /**
   * Import an external exercise into the local DB (deduplicates by exact name).
   * Returns the existing record if already imported.
   */
  async importExternalExercise(userId: string, data: ExternalExerciseResult) {
    // Dedup by exact name (case-insensitive)
    const existing = await prisma.exercise.findFirst({
      where: { name: { equals: data.name } },
    });
    if (existing) return existing;

    const exerciseData: CreateExerciseInput = {
      name:         data.name,
      description:  data.description,
      category:     data.category as any,
      muscleGroups: data.muscleGroups,
      isWeighted:   true,
      isBodyweight: false,
    };

    return this.createExercise(userId, exerciseData);
  }
}

export const exerciseService = new ExerciseService();
export default exerciseService;
