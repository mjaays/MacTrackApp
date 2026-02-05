import { prisma } from '../utils/prisma';
import { calculationService } from './calculation.service';
import { NotFoundError } from '../errors/NotFoundError';
import { Gender, ActivityLevel, GoalType } from '../types/enums';
import type { UpdateProfileInput, UpdateGoalsInput } from '../validators/user.validator';

export class UserService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
        profile: true,
        goals: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    return user;
  }

  async updateProfile(userId: string, data: UpdateProfileInput) {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    // Update or create profile
    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      },
      create: {
        userId,
        ...data,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      },
    });

    return profile;
  }

  async getGoals(userId: string) {
    const goals = await prisma.userGoals.findUnique({
      where: { userId },
    });

    if (!goals) {
      // Create default goals if they don't exist
      return prisma.userGoals.create({
        data: {
          userId,
          goalType: 'MAINTAIN',
        },
      });
    }

    return goals;
  }

  async updateGoals(userId: string, data: UpdateGoalsInput) {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    // Update or create goals
    const goals = await prisma.userGoals.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
        goalType: data.goalType || 'MAINTAIN',
      },
    });

    return goals;
  }

  async getCalculatedGoals(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        goals: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    const profile = user.profile;
    const goals = user.goals;

    // Check if we have enough data to calculate
    if (
      !profile?.gender ||
      !profile?.dateOfBirth ||
      !profile?.heightCm ||
      !profile?.currentWeightKg
    ) {
      return {
        calculated: false,
        message: 'Please complete your profile (gender, date of birth, height, weight) to calculate goals',
        requiredFields: {
          gender: !profile?.gender,
          dateOfBirth: !profile?.dateOfBirth,
          heightCm: !profile?.heightCm,
          currentWeightKg: !profile?.currentWeightKg,
        },
      };
    }

    const ageYears = calculationService.calculateAge(profile.dateOfBirth);
    const goalType = (goals?.goalType as GoalType) || 'MAINTAIN';

    const calculatedGoals = calculationService.calculateAllGoals({
      gender: profile.gender as Gender,
      ageYears,
      heightCm: profile.heightCm,
      weightKg: profile.currentWeightKg,
      activityLevel: (profile.activityLevel as ActivityLevel) || 'SEDENTARY',
      goalType,
      weeklyWeightChangeKg: goals?.weeklyWeightChangeKg || undefined,
    });

    return {
      calculated: true,
      ...calculatedGoals,
      profile: {
        gender: profile.gender,
        ageYears,
        heightCm: profile.heightCm,
        weightKg: profile.currentWeightKg,
        activityLevel: profile.activityLevel,
      },
      goalType,
    };
  }

  async deleteAccount(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: userId },
    });
  }
}

export const userService = new UserService();
export default userService;
