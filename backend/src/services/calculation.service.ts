import { Gender, ActivityLevel, GoalType } from '../types/enums';

interface UserMetrics {
  gender: Gender;
  ageYears: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goalType: GoalType;
  weeklyWeightChangeKg?: number;
}

export interface NutritionGoals {
  dailyCalories: number;
  dailyProteinG: number;
  dailyCarbsG: number;
  dailyFatG: number;
  dailyFiberG: number;
  dailyWaterMl: number;
  bmr: number;
  tdee: number;
}

// Activity level multipliers for TDEE calculation
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  SEDENTARY: 1.2,
  LIGHTLY_ACTIVE: 1.375,
  MODERATELY_ACTIVE: 1.55,
  VERY_ACTIVE: 1.725,
  EXTRA_ACTIVE: 1.9,
};

// 1 kg fat = ~7700 kcal
const KCAL_PER_KG_FAT = 7700;

export class CalculationService {
  /**
   * Calculate Basal Metabolic Rate using Mifflin-St Jeor formula
   */
  calculateBMR(gender: Gender, weightKg: number, heightCm: number, ageYears: number): number {
    // Mifflin-St Jeor Equation:
    // Men: BMR = (10 × weight kg) + (6.25 × height cm) - (5 × age) + 5
    // Women: BMR = (10 × weight kg) + (6.25 × height cm) - (5 × age) - 161

    const baseBMR = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;

    switch (gender) {
      case 'MALE':
        return Math.round(baseBMR + 5);
      case 'FEMALE':
        return Math.round(baseBMR - 161);
      case 'OTHER':
        // Use average of male and female formulas
        return Math.round(baseBMR - 78);
      default:
        return Math.round(baseBMR - 78);
    }
  }

  /**
   * Calculate Total Daily Energy Expenditure
   * TDEE = BMR × Activity Multiplier
   */
  calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
    const multiplier = ACTIVITY_MULTIPLIERS[activityLevel];
    return Math.round(bmr * multiplier);
  }

  /**
   * Calculate daily calorie target based on goal
   */
  calculateCalorieTarget(
    tdee: number,
    goalType: GoalType,
    weeklyWeightChangeKg?: number
  ): number {
    // Default weight change rates if not specified
    const defaultWeeklyChange: Record<GoalType, number> = {
      LOSE_WEIGHT: -0.5, // 0.5 kg loss per week
      MAINTAIN: 0,
      GAIN_WEIGHT: 0.25, // 0.25 kg gain per week
      GAIN_MUSCLE: 0.25, // Lean bulk rate
      RECOMPOSITION: 0, // Eat at maintenance
    };

    const weeklyChange = weeklyWeightChangeKg ?? defaultWeeklyChange[goalType];

    // Calculate daily calorie adjustment
    // weeklyChange in kg * 7700 kcal/kg / 7 days = daily adjustment
    const dailyAdjustment = (weeklyChange * KCAL_PER_KG_FAT) / 7;

    const targetCalories = tdee + dailyAdjustment;

    // Ensure minimum healthy calorie intake
    const minCalories = 1200;
    const maxCalories = 5000;

    return Math.round(Math.max(minCalories, Math.min(maxCalories, targetCalories)));
  }

  /**
   * Calculate macronutrient distribution based on goal
   */
  calculateMacros(
    dailyCalories: number,
    goalType: GoalType,
    weightKg: number
  ): { proteinG: number; carbsG: number; fatG: number } {
    // Protein recommendations (g per kg body weight)
    const proteinPerKg: Record<GoalType, number> = {
      LOSE_WEIGHT: 2.0, // Higher protein to preserve muscle
      MAINTAIN: 1.6,
      GAIN_WEIGHT: 1.8,
      GAIN_MUSCLE: 2.2, // Highest for muscle building
      RECOMPOSITION: 2.2, // High protein for recomp
    };

    // Fat as percentage of total calories
    const fatPercentage: Record<GoalType, number> = {
      LOSE_WEIGHT: 0.25, // 25% from fat
      MAINTAIN: 0.3, // 30% from fat
      GAIN_WEIGHT: 0.3,
      GAIN_MUSCLE: 0.25,
      RECOMPOSITION: 0.25,
    };

    // Calculate protein (4 kcal per gram)
    const proteinG = Math.round(weightKg * proteinPerKg[goalType]);
    const proteinCalories = proteinG * 4;

    // Calculate fat (9 kcal per gram)
    const fatCalories = dailyCalories * fatPercentage[goalType];
    const fatG = Math.round(fatCalories / 9);

    // Remaining calories go to carbs (4 kcal per gram)
    const carbCalories = dailyCalories - proteinCalories - fatCalories;
    const carbsG = Math.round(Math.max(0, carbCalories / 4));

    return { proteinG, carbsG, fatG };
  }

  /**
   * Calculate fiber recommendation
   * General guideline: 14g per 1000 calories
   */
  calculateFiberTarget(dailyCalories: number): number {
    return Math.round((dailyCalories / 1000) * 14);
  }

  /**
   * Calculate water intake recommendation
   * General guideline: 30-35ml per kg body weight
   */
  calculateWaterTarget(weightKg: number, activityLevel: ActivityLevel): number {
    const baseWater = weightKg * 30; // 30ml per kg

    // Add extra for activity
    const activityBonus: Record<ActivityLevel, number> = {
      SEDENTARY: 0,
      LIGHTLY_ACTIVE: 250,
      MODERATELY_ACTIVE: 500,
      VERY_ACTIVE: 750,
      EXTRA_ACTIVE: 1000,
    };

    return Math.round(baseWater + activityBonus[activityLevel]);
  }

  /**
   * Calculate all nutrition goals for a user
   */
  calculateAllGoals(metrics: UserMetrics): NutritionGoals {
    const bmr = this.calculateBMR(
      metrics.gender,
      metrics.weightKg,
      metrics.heightCm,
      metrics.ageYears
    );

    const tdee = this.calculateTDEE(bmr, metrics.activityLevel);

    const dailyCalories = this.calculateCalorieTarget(
      tdee,
      metrics.goalType,
      metrics.weeklyWeightChangeKg
    );

    const macros = this.calculateMacros(dailyCalories, metrics.goalType, metrics.weightKg);

    const dailyFiberG = this.calculateFiberTarget(dailyCalories);
    const dailyWaterMl = this.calculateWaterTarget(metrics.weightKg, metrics.activityLevel);

    return {
      dailyCalories,
      dailyProteinG: macros.proteinG,
      dailyCarbsG: macros.carbsG,
      dailyFatG: macros.fatG,
      dailyFiberG,
      dailyWaterMl,
      bmr,
      tdee,
    };
  }

  /**
   * Calculate age from date of birth
   */
  calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Calculate calories burned during exercise
   * MET-based calculation for cardio
   */
  calculateCaloriesBurned(weightKg: number, durationMin: number, metValue: number): number {
    // Calories = MET × weight (kg) × duration (hours)
    const durationHours = durationMin / 60;
    return Math.round(metValue * weightKg * durationHours);
  }

  /**
   * Estimate calories burned for strength training
   */
  calculateStrengthCaloriesBurned(
    weightKg: number,
    durationMin: number,
    intensity: 'light' | 'moderate' | 'vigorous' = 'moderate'
  ): number {
    const metValues = {
      light: 3.0,
      moderate: 5.0,
      vigorous: 6.0,
    };

    return this.calculateCaloriesBurned(weightKg, durationMin, metValues[intensity]);
  }
}

export const calculationService = new CalculationService();
export default calculationService;
