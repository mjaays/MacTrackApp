import prisma from '../utils/prisma';
import { NotFoundError } from '../errors';

type CreateMealInput = {
  mealType: string;
  name?: string;
  notes?: string;
  loggedAt?: string;
  entries: Array<{
    foodId: string;
    servings?: number;
    customGrams?: number;
  }>;
};

export class MealService {
  static async createMeal(userId: string, input: CreateMealInput) {
    const foodIds = input.entries.map(e => e.foodId);
    const foods = await prisma.food.findMany({
      where: { id: { in: foodIds } },
    });

    if (foods.length !== foodIds.length) {
      throw new NotFoundError('One or more foods not found');
    }

    const foodMap = new Map(foods.map(f => [f.id, f]));

    const computedEntries = input.entries.map(e => {
      const food = foodMap.get(e.foodId)!;

      const servings = e.servings ?? 1;

      const factor =
        e.customGrams != null
          ? e.customGrams / food.servingSizeG
          : servings;

      const caloriesKcal = food.caloriesKcal * factor;
      const proteinG = food.proteinG * factor;
      const carbsG = food.carbsG * factor;
      const fatG = food.fatG * factor;

      return {
        foodId: e.foodId,
        servings,
        customGrams: e.customGrams ?? null,
        caloriesKcal,
        proteinG,
        carbsG,
        fatG,
      };
    });

    const totals = computedEntries.reduce(
      (acc, e) => {
        acc.totalCalories += e.caloriesKcal;
        acc.totalProtein += e.proteinG;
        acc.totalCarbs += e.carbsG;
        acc.totalFat += e.fatG;
        return acc;
      },
      { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }
    );

    return prisma.meal.create({
      data: {
        userId,
        mealType: input.mealType,
        name: input.name ?? null,
        notes: input.notes ?? null,
        loggedAt: input.loggedAt ? new Date(input.loggedAt) : new Date(),
        totalCalories: totals.totalCalories,
        totalProteinG: totals.totalProtein,
        totalCarbsG: totals.totalCarbs,
        totalFatG: totals.totalFat,
        entries: {
          create: computedEntries.map(e => ({
            foodId: e.foodId,
            servings: e.servings,
            customGrams: e.customGrams,
            caloriesKcal: e.caloriesKcal,
            proteinG: e.proteinG,
            carbsG: e.carbsG,
            fatG: e.fatG,
          })),
        },
      },
      include: {
        entries: {
          include: { food: true },
        },
      },
    });
  }

  static async getMeals(userId: string) {
    return prisma.meal.findMany({
      where: { userId },
      orderBy: { loggedAt: 'desc' },
      include: {
        entries: { include: { food: true } },
      },
    });
  }
}
