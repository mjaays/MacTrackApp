import { prisma } from '../utils/prisma';
import { NotFoundError } from '../errors/NotFoundError';
import { startOfDay, endOfDay, parseISO } from 'date-fns';
import type {
  CreateMealInput,
  UpdateMealInput,
  AddMealEntryInput,
  UpdateMealEntryInput,
  GetMealsInput,
} from '../validators/meal.validator';

export class MealService {
  /**
   * Get all meals for user with optional filters
   */
  async getMeals(userId: string, params: GetMealsInput) {
    const { date, startDate, endDate, mealType } = params;

    let dateFilter = {};

    if (date) {
      const parsedDate = parseISO(date);
      dateFilter = {
        loggedAt: {
          gte: startOfDay(parsedDate),
          lte: endOfDay(parsedDate),
        },
      };
    } else if (startDate || endDate) {
      dateFilter = {
        loggedAt: {
          ...(startDate && { gte: parseISO(startDate) }),
          ...(endDate && { lte: endOfDay(parseISO(endDate)) }),
        },
      };
    }

    return prisma.meal.findMany({
      where: {
        userId,
        ...dateFilter,
        ...(mealType && { mealType }),
      },
      orderBy: { loggedAt: 'desc' },
      include: {
        entries: {
          include: { food: true },
        },
      },
    });
  }

  /**
   * Get meals for a specific date
   */
  async getMealsByDate(userId: string, date: string) {
    const parsedDate = parseISO(date);

    return prisma.meal.findMany({
      where: {
        userId,
        loggedAt: {
          gte: startOfDay(parsedDate),
          lte: endOfDay(parsedDate),
        },
      },
      orderBy: { loggedAt: 'asc' },
      include: {
        entries: {
          include: { food: true },
        },
      },
    });
  }

  /**
   * Get a single meal by ID
   */
  async getMealById(userId: string, mealId: string) {
    const meal = await prisma.meal.findUnique({
      where: { id: mealId },
      include: {
        entries: {
          include: { food: true },
        },
      },
    });

    if (!meal) {
      throw new NotFoundError('Meal', mealId);
    }

    if (meal.userId !== userId) {
      throw new NotFoundError('Meal', mealId);
    }

    return meal;
  }

  /**
   * Create a new meal with entries
   */
  async createMeal(userId: string, input: CreateMealInput) {
    // Validate all food IDs exist
    const foodIds = input.entries.map((e) => e.foodId);
    const foods = await prisma.food.findMany({
      where: { id: { in: foodIds } },
    });

    if (foods.length !== foodIds.length) {
      const foundIds = new Set(foods.map((f) => f.id));
      const missingIds = foodIds.filter((id) => !foundIds.has(id));
      throw new NotFoundError('Foods', missingIds.join(', '));
    }

    const foodMap = new Map(foods.map((f) => [f.id, f]));

    // Compute macros for each entry
    const computedEntries = input.entries.map((entry) => {
      const food = foodMap.get(entry.foodId)!;

      // Calculate factor: customGrams overrides servings
      const factor = entry.customGrams != null
        ? entry.customGrams / food.servingSizeG
        : entry.servings;

      return {
        foodId: entry.foodId,
        servings: entry.servings,
        customGrams: entry.customGrams ?? null,
        caloriesKcal: food.caloriesKcal * factor,
        proteinG: food.proteinG * factor,
        carbsG: food.carbsG * factor,
        fatG: food.fatG * factor,
      };
    });

    // Calculate totals
    const totals = computedEntries.reduce(
      (acc, e) => ({
        totalCalories: acc.totalCalories + e.caloriesKcal,
        totalProteinG: acc.totalProteinG + e.proteinG,
        totalCarbsG: acc.totalCarbsG + e.carbsG,
        totalFatG: acc.totalFatG + e.fatG,
      }),
      { totalCalories: 0, totalProteinG: 0, totalCarbsG: 0, totalFatG: 0 }
    );

    // Create meal with entries
    return prisma.meal.create({
      data: {
        userId,
        name: input.name ?? null,
        mealType: input.mealType,
        loggedAt: input.loggedAt ? new Date(input.loggedAt) : new Date(),
        notes: input.notes ?? null,
        totalCalories: totals.totalCalories,
        totalProteinG: totals.totalProteinG,
        totalCarbsG: totals.totalCarbsG,
        totalFatG: totals.totalFatG,
        entries: {
          create: computedEntries,
        },
      },
      include: {
        entries: {
          include: { food: true },
        },
      },
    });
  }

  /**
   * Update meal metadata (not entries)
   */
  async updateMeal(userId: string, mealId: string, data: UpdateMealInput) {
    const meal = await this.getMealById(userId, mealId);

    return prisma.meal.update({
      where: { id: meal.id },
      data,
      include: {
        entries: {
          include: { food: true },
        },
      },
    });
  }

  /**
   * Delete a meal
   */
  async deleteMeal(userId: string, mealId: string) {
    const meal = await this.getMealById(userId, mealId);

    await prisma.meal.delete({
      where: { id: meal.id },
    });
  }

  /**
   * Add an entry to an existing meal
   */
  async addMealEntry(userId: string, mealId: string, input: AddMealEntryInput) {
    // Verify meal exists and belongs to user
    await this.getMealById(userId, mealId);

    // Get the food
    const food = await prisma.food.findUnique({
      where: { id: input.foodId },
    });

    if (!food) {
      throw new NotFoundError('Food', input.foodId);
    }

    // Calculate macros
    const factor = input.customGrams != null
      ? input.customGrams / food.servingSizeG
      : input.servings;

    const entryData = {
      foodId: input.foodId,
      servings: input.servings,
      customGrams: input.customGrams ?? null,
      caloriesKcal: food.caloriesKcal * factor,
      proteinG: food.proteinG * factor,
      carbsG: food.carbsG * factor,
      fatG: food.fatG * factor,
    };

    // Create entry and update meal totals
    const [entry] = await prisma.$transaction([
      prisma.mealEntry.create({
        data: {
          mealId,
          ...entryData,
        },
        include: { food: true },
      }),
      prisma.meal.update({
        where: { id: mealId },
        data: {
          totalCalories: { increment: entryData.caloriesKcal },
          totalProteinG: { increment: entryData.proteinG },
          totalCarbsG: { increment: entryData.carbsG },
          totalFatG: { increment: entryData.fatG },
        },
      }),
    ]);

    return entry;
  }

  /**
   * Update a meal entry
   */
  async updateMealEntry(
    userId: string,
    mealId: string,
    entryId: string,
    input: UpdateMealEntryInput
  ) {
    const meal = await this.getMealById(userId, mealId);

    const entry = await prisma.mealEntry.findUnique({
      where: { id: entryId },
      include: { food: true },
    });

    if (!entry || entry.mealId !== meal.id) {
      throw new NotFoundError('Meal entry', entryId);
    }

    // Calculate new macros
    const servings = input.servings ?? entry.servings;
    const customGrams = input.customGrams === null ? null : (input.customGrams ?? entry.customGrams);

    const factor = customGrams != null
      ? customGrams / entry.food.servingSizeG
      : servings;

    const newMacros = {
      servings,
      customGrams,
      caloriesKcal: entry.food.caloriesKcal * factor,
      proteinG: entry.food.proteinG * factor,
      carbsG: entry.food.carbsG * factor,
      fatG: entry.food.fatG * factor,
    };

    // Calculate difference for meal totals
    const diff = {
      calories: newMacros.caloriesKcal - entry.caloriesKcal,
      protein: newMacros.proteinG - entry.proteinG,
      carbs: newMacros.carbsG - entry.carbsG,
      fat: newMacros.fatG - entry.fatG,
    };

    // Update entry and meal totals
    const [updatedEntry] = await prisma.$transaction([
      prisma.mealEntry.update({
        where: { id: entryId },
        data: newMacros,
        include: { food: true },
      }),
      prisma.meal.update({
        where: { id: mealId },
        data: {
          totalCalories: { increment: diff.calories },
          totalProteinG: { increment: diff.protein },
          totalCarbsG: { increment: diff.carbs },
          totalFatG: { increment: diff.fat },
        },
      }),
    ]);

    return updatedEntry;
  }

  /**
   * Remove an entry from a meal
   */
  async removeMealEntry(userId: string, mealId: string, entryId: string) {
    const meal = await this.getMealById(userId, mealId);

    const entry = await prisma.mealEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry || entry.mealId !== meal.id) {
      throw new NotFoundError('Meal entry', entryId);
    }

    // Delete entry and update meal totals
    await prisma.$transaction([
      prisma.mealEntry.delete({
        where: { id: entryId },
      }),
      prisma.meal.update({
        where: { id: mealId },
        data: {
          totalCalories: { decrement: entry.caloriesKcal },
          totalProteinG: { decrement: entry.proteinG },
          totalCarbsG: { decrement: entry.carbsG },
          totalFatG: { decrement: entry.fatG },
        },
      }),
    ]);
  }
}

export const mealService = new MealService();
export default mealService;
