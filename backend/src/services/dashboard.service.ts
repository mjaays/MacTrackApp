import { prisma } from '../utils/prisma';
import { startOfDay, endOfDay, parseISO, subDays } from 'date-fns';

export class DashboardService {
  private async aggregateMeals(userId: string, date: Date) {
    const meals = await prisma.meal.findMany({
      where: {
        userId,
        loggedAt: {
          gte: startOfDay(date),
          lte: endOfDay(date),
        },
      },
    });

    return meals.reduce(
      (acc, meal) => ({
        caloriesConsumed: acc.caloriesConsumed + (meal.totalCalories ?? 0),
        proteinG: acc.proteinG + (meal.totalProteinG ?? 0),
        carbsG: acc.carbsG + (meal.totalCarbsG ?? 0),
        fatG: acc.fatG + (meal.totalFatG ?? 0),
        mealCount: acc.mealCount + 1,
      }),
      { caloriesConsumed: 0, proteinG: 0, carbsG: 0, fatG: 0, mealCount: 0 }
    );
  }

  private async aggregateWorkouts(userId: string, date: Date) {
    const workouts = await prisma.workout.findMany({
      where: {
        userId,
        startedAt: {
          gte: startOfDay(date),
          lte: endOfDay(date),
        },
      },
    });

    return workouts.reduce(
      (acc, workout) => ({
        caloriesBurned: acc.caloriesBurned + (workout.totalCaloriesBurned ?? 0),
        workoutMinutes: acc.workoutMinutes + (workout.durationMin ?? 0),
        workoutCount: acc.workoutCount + 1,
      }),
      { caloriesBurned: 0, workoutMinutes: 0, workoutCount: 0 }
    );
  }

  private async getUserGoals(userId: string) {
    return prisma.userGoals.findUnique({ where: { userId } });
  }

  async buildDailySummary(userId: string, date: Date) {
    const [mealAgg, workoutAgg, goals] = await Promise.all([
      this.aggregateMeals(userId, date),
      this.aggregateWorkouts(userId, date),
      this.getUserGoals(userId),
    ]);

    const netCalories = mealAgg.caloriesConsumed - workoutAgg.caloriesBurned;
    const dateOnly = startOfDay(date);

    return prisma.dailySummary.upsert({
      where: {
        userId_date: { userId, date: dateOnly },
      },
      update: {
        caloriesConsumed: mealAgg.caloriesConsumed,
        proteinG: mealAgg.proteinG,
        carbsG: mealAgg.carbsG,
        fatG: mealAgg.fatG,
        caloriesBurned: workoutAgg.caloriesBurned,
        workoutMinutes: workoutAgg.workoutMinutes,
        calorieGoal: goals?.dailyCalories ?? null,
        proteinGoal: goals?.dailyProteinG ?? null,
        carbsGoal: goals?.dailyCarbsG ?? null,
        fatGoal: goals?.dailyFatG ?? null,
        netCalories,
      },
      create: {
        userId,
        date: dateOnly,
        caloriesConsumed: mealAgg.caloriesConsumed,
        proteinG: mealAgg.proteinG,
        carbsG: mealAgg.carbsG,
        fatG: mealAgg.fatG,
        caloriesBurned: workoutAgg.caloriesBurned,
        workoutMinutes: workoutAgg.workoutMinutes,
        calorieGoal: goals?.dailyCalories ?? null,
        proteinGoal: goals?.dailyProteinG ?? null,
        carbsGoal: goals?.dailyCarbsG ?? null,
        fatGoal: goals?.dailyFatG ?? null,
        netCalories,
      },
    });
  }

  private buildGoalComparison(summary: {
    caloriesConsumed: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    calorieGoal: number | null;
    proteinGoal: number | null;
    carbsGoal: number | null;
    fatGoal: number | null;
  }) {
    return {
      calories: {
        consumed: summary.caloriesConsumed,
        goal: summary.calorieGoal,
        remaining: summary.calorieGoal
          ? Math.round(summary.calorieGoal - summary.caloriesConsumed)
          : null,
        percentage: summary.calorieGoal
          ? Math.round((summary.caloriesConsumed / summary.calorieGoal) * 100)
          : null,
      },
      protein: {
        consumed: summary.proteinG,
        goal: summary.proteinGoal,
        remaining: summary.proteinGoal
          ? Math.round(summary.proteinGoal - summary.proteinG)
          : null,
        percentage: summary.proteinGoal
          ? Math.round((summary.proteinG / summary.proteinGoal) * 100)
          : null,
      },
      carbs: {
        consumed: summary.carbsG,
        goal: summary.carbsGoal,
        remaining: summary.carbsGoal
          ? Math.round(summary.carbsGoal - summary.carbsG)
          : null,
        percentage: summary.carbsGoal
          ? Math.round((summary.carbsG / summary.carbsGoal) * 100)
          : null,
      },
      fat: {
        consumed: summary.fatG,
        goal: summary.fatGoal,
        remaining: summary.fatGoal
          ? Math.round(summary.fatGoal - summary.fatG)
          : null,
        percentage: summary.fatGoal
          ? Math.round((summary.fatG / summary.fatGoal) * 100)
          : null,
      },
    };
  }

  async getTodaySummary(userId: string) {
    const today = new Date();
    const summary = await this.buildDailySummary(userId, today);

    const [meals, workouts] = await Promise.all([
      prisma.meal.findMany({
        where: {
          userId,
          loggedAt: {
            gte: startOfDay(today),
            lte: endOfDay(today),
          },
        },
        orderBy: { loggedAt: 'asc' },
        include: {
          entries: { include: { food: true } },
        },
      }),
      prisma.workout.findMany({
        where: {
          userId,
          startedAt: {
            gte: startOfDay(today),
            lte: endOfDay(today),
          },
        },
        orderBy: { startedAt: 'asc' },
        include: {
          entries: {
            include: { exercise: true },
            orderBy: { orderIndex: 'asc' },
          },
        },
      }),
    ]);

    return {
      summary,
      goalComparison: this.buildGoalComparison(summary),
      meals,
      workouts,
    };
  }

  async getDateSummary(userId: string, dateStr: string) {
    const date = parseISO(dateStr);
    const summary = await this.buildDailySummary(userId, date);

    return {
      summary,
      goalComparison: this.buildGoalComparison(summary),
    };
  }

  async getWeeklyOverview(userId: string, startDateStr?: string) {
    const startDate = startDateStr ? parseISO(startDateStr) : subDays(new Date(), 6);
    const days = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(day.getDate() + i);
      const summary = await this.buildDailySummary(userId, day);
      days.push(summary);
    }

    const avgCaloriesConsumed = days.reduce((s, d) => s + d.caloriesConsumed, 0) / 7;
    const avgProteinG = days.reduce((s, d) => s + d.proteinG, 0) / 7;
    const avgCarbsG = days.reduce((s, d) => s + d.carbsG, 0) / 7;
    const avgFatG = days.reduce((s, d) => s + d.fatG, 0) / 7;
    const totalCaloriesBurned = days.reduce((s, d) => s + d.caloriesBurned, 0);
    const totalWorkoutMinutes = days.reduce((s, d) => s + d.workoutMinutes, 0);

    return {
      startDate: startOfDay(startDate),
      days,
      averages: {
        caloriesConsumed: Math.round(avgCaloriesConsumed),
        proteinG: Math.round(avgProteinG),
        carbsG: Math.round(avgCarbsG),
        fatG: Math.round(avgFatG),
      },
      totals: {
        caloriesBurned: totalCaloriesBurned,
        workoutMinutes: totalWorkoutMinutes,
      },
    };
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
