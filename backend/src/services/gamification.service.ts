import { prisma } from '../utils/prisma';
import { format } from 'date-fns';
import { startOfDay } from 'date-fns';

const ACHIEVEMENTS = [
  { key: 'first_meal',       name: 'First Bite',        description: 'Log your first meal',                icon: '🍎', xpReward: 50,   category: 'NUTRITION',    rarity: 'COMMON',    sortOrder: 1  },
  { key: 'meals_10',         name: 'Meal Prep Pro',     description: 'Log 10 meals',                       icon: '🥗', xpReward: 100,  category: 'NUTRITION',    rarity: 'COMMON',    sortOrder: 2  },
  { key: 'meals_50',         name: 'Foodie',            description: 'Log 50 meals',                       icon: '🍽️', xpReward: 200,  category: 'NUTRITION',    rarity: 'RARE',      sortOrder: 3  },
  { key: 'meals_100',        name: 'Nutrition Master',  description: 'Log 100 meals',                      icon: '👨‍🍳', xpReward: 400, category: 'NUTRITION',    rarity: 'EPIC',      sortOrder: 4  },
  { key: 'first_workout',    name: 'First Pump',        description: 'Complete your first workout',        icon: '💪', xpReward: 50,   category: 'FITNESS',      rarity: 'COMMON',    sortOrder: 5  },
  { key: 'workouts_10',      name: 'Gym Regular',       description: 'Complete 10 workouts',               icon: '🏋️', xpReward: 150,  category: 'FITNESS',      rarity: 'COMMON',    sortOrder: 6  },
  { key: 'workouts_25',      name: 'Fitness Freak',     description: 'Complete 25 workouts',               icon: '🔥', xpReward: 250,  category: 'FITNESS',      rarity: 'RARE',      sortOrder: 7  },
  { key: 'workouts_50',      name: 'Iron Athlete',      description: 'Complete 50 workouts',               icon: '🥇', xpReward: 400,  category: 'FITNESS',      rarity: 'EPIC',      sortOrder: 8  },
  { key: 'workouts_100',     name: 'Legend',            description: 'Complete 100 workouts',              icon: '🏆', xpReward: 750,  category: 'FITNESS',      rarity: 'LEGENDARY', sortOrder: 9  },
  { key: 'first_progress',   name: 'Body Check',        description: 'Log your first progress entry',      icon: '⚖️', xpReward: 50,   category: 'CONSISTENCY',  rarity: 'COMMON',    sortOrder: 10 },
  { key: 'progress_10',      name: 'Scale Tracker',     description: 'Log 10 progress entries',            icon: '📊', xpReward: 150,  category: 'CONSISTENCY',  rarity: 'COMMON',    sortOrder: 11 },
  { key: 'progress_30',      name: 'Data Devotee',      description: 'Log 30 progress entries',            icon: '📈', xpReward: 300,  category: 'CONSISTENCY',  rarity: 'RARE',      sortOrder: 12 },
  { key: 'streak_3',         name: 'Hat Trick',         description: '3-day activity streak',              icon: '🔥', xpReward: 75,   category: 'CONSISTENCY',  rarity: 'COMMON',    sortOrder: 13 },
  { key: 'streak_7',         name: 'Week Warrior',      description: '7-day activity streak',              icon: '📅', xpReward: 150,  category: 'CONSISTENCY',  rarity: 'RARE',      sortOrder: 14 },
  { key: 'streak_14',        name: 'Fortnight Fighter', description: '14-day activity streak',             icon: '💫', xpReward: 300,  category: 'CONSISTENCY',  rarity: 'RARE',      sortOrder: 15 },
  { key: 'streak_30',        name: 'Monthly Grind',     description: '30-day activity streak',             icon: '🌟', xpReward: 600,  category: 'CONSISTENCY',  rarity: 'EPIC',      sortOrder: 16 },
  { key: 'streak_100',       name: 'Century',           description: '100-day activity streak',            icon: '👑', xpReward: 2000, category: 'CONSISTENCY',  rarity: 'LEGENDARY', sortOrder: 17 },
  { key: 'set_goals',        name: 'Goal Setter',       description: 'Set your fitness goals',             icon: '🎯', xpReward: 50,   category: 'MILESTONE',    rarity: 'COMMON',    sortOrder: 18 },
  { key: 'hit_calorie_goal', name: 'On Target',         description: 'Hit your calorie goal for a day',   icon: '✅', xpReward: 100,  category: 'MILESTONE',    rarity: 'RARE',      sortOrder: 19 },
  { key: 'hit_all_macros',   name: 'Macro Master',      description: 'Hit all 4 macro goals in one day',  icon: '💯', xpReward: 200,  category: 'MILESTONE',    rarity: 'EPIC',      sortOrder: 20 },
  { key: 'level_5',          name: 'Rising Star',       description: 'Reach Level 5',                     icon: '⭐', xpReward: 0,    category: 'MILESTONE',    rarity: 'RARE',      sortOrder: 21 },
  { key: 'level_10',         name: 'Pro Athlete',       description: 'Reach Level 10',                    icon: '🌠', xpReward: 0,    category: 'MILESTONE',    rarity: 'EPIC',      sortOrder: 22 },
];

const DAILY_QUESTS = [
  { questKey: 'log_meals',        title: 'Nutrition Quest', description: 'Log 2 meals today',          icon: '🍽️', xpReward: 20, target: 2 },
  { questKey: 'complete_workout', title: 'Fitness Quest',   description: 'Complete a workout today',    icon: '💪', xpReward: 40, target: 1 },
  { questKey: 'log_progress',     title: 'Wellness Quest',  description: 'Log your weight/progress',    icon: '📏', xpReward: 20, target: 1 },
];

export class GamificationService {
  private calculateLevel(totalXp: number): number {
    return Math.floor(Math.sqrt(totalXp / 100)) + 1;
  }

  async getUserStats(userId: string) {
    return prisma.userStats.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  async awardXP(userId: string, amount: number) {
    const stats = await this.getUserStats(userId);
    const newXp = stats.totalXp + amount;
    const newLevel = this.calculateLevel(newXp);
    return prisma.userStats.update({
      where: { userId },
      data: { totalXp: newXp, weeklyXp: stats.weeklyXp + amount, level: newLevel },
    });
  }

  async updateStreak(userId: string) {
    const today = format(new Date(), 'yyyy-MM-dd');
    const stats = await this.getUserStats(userId);

    if (stats.lastActiveDate === today) return stats;

    const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
    const newStreak = stats.lastActiveDate === yesterday ? stats.currentStreak + 1 : 1;
    const newLongest = Math.max(newStreak, stats.longestStreak);

    return prisma.userStats.update({
      where: { userId },
      data: { currentStreak: newStreak, longestStreak: newLongest, lastActiveDate: today },
    });
  }

  async seedAchievements() {
    for (const a of ACHIEVEMENTS) {
      await prisma.achievement.upsert({
        where: { key: a.key },
        create: a,
        update: {},
      });
    }
  }

  async checkAndUnlockAchievements(userId: string): Promise<void> {
    await this.seedAchievements();

    const stats = await this.getUserStats(userId);
    const allAchievements = await prisma.achievement.findMany();
    const unlocked = await prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    });
    const unlockedIds = new Set(unlocked.map((u) => u.achievementId));

    const todayDate = startOfDay(new Date());
    const todaySummary = await prisma.dailySummary.findUnique({
      where: { userId_date: { userId, date: todayDate } },
    });
    const hasGoals = await prisma.userGoals.findUnique({ where: { userId } });

    const criteria: Record<string, boolean> = {
      first_meal:       stats.totalMeals >= 1,
      meals_10:         stats.totalMeals >= 10,
      meals_50:         stats.totalMeals >= 50,
      meals_100:        stats.totalMeals >= 100,
      first_workout:    stats.totalWorkouts >= 1,
      workouts_10:      stats.totalWorkouts >= 10,
      workouts_25:      stats.totalWorkouts >= 25,
      workouts_50:      stats.totalWorkouts >= 50,
      workouts_100:     stats.totalWorkouts >= 100,
      first_progress:   stats.totalProgressLogs >= 1,
      progress_10:      stats.totalProgressLogs >= 10,
      progress_30:      stats.totalProgressLogs >= 30,
      streak_3:         stats.currentStreak >= 3,
      streak_7:         stats.currentStreak >= 7,
      streak_14:        stats.currentStreak >= 14,
      streak_30:        stats.currentStreak >= 30,
      streak_100:       stats.currentStreak >= 100,
      set_goals:        !!hasGoals,
      hit_calorie_goal: !!(
        todaySummary &&
        todaySummary.calorieGoal &&
        todaySummary.calorieGoal > 0 &&
        todaySummary.caloriesConsumed >= todaySummary.calorieGoal
      ),
      hit_all_macros: !!(
        todaySummary &&
        todaySummary.calorieGoal && todaySummary.caloriesConsumed >= todaySummary.calorieGoal &&
        todaySummary.proteinGoal && todaySummary.proteinG >= todaySummary.proteinGoal &&
        todaySummary.carbsGoal   && todaySummary.carbsG   >= todaySummary.carbsGoal &&
        todaySummary.fatGoal     && todaySummary.fatG     >= todaySummary.fatGoal
      ),
      level_5:  stats.level >= 5,
      level_10: stats.level >= 10,
    };

    for (const achievement of allAchievements) {
      if (!criteria[achievement.key]) continue;
      if (unlockedIds.has(achievement.id)) continue;

      await prisma.userAchievement.create({
        data: { userId, achievementId: achievement.id },
      });

      if (achievement.xpReward > 0) {
        await this.awardXP(userId, achievement.xpReward);
      }
    }
  }

  async getOrCreateDailyQuests(userId: string, todayStr: string) {
    for (const q of DAILY_QUESTS) {
      await prisma.dailyQuest.upsert({
        where: { userId_date_questKey: { userId, date: todayStr, questKey: q.questKey } },
        create: { userId, date: todayStr, ...q, progress: 0, completed: false },
        update: {},
      });
    }
    return prisma.dailyQuest.findMany({ where: { userId, date: todayStr }, orderBy: { questKey: 'asc' } });
  }

  async updateQuestProgress(userId: string, questKey: string, todayStr: string) {
    const quest = await prisma.dailyQuest.findUnique({
      where: { userId_date_questKey: { userId, date: todayStr, questKey } },
    });
    if (!quest || quest.completed) return;

    const newProgress = quest.progress + 1;
    const completed = newProgress >= quest.target;

    await prisma.dailyQuest.update({
      where: { userId_date_questKey: { userId, date: todayStr, questKey } },
      data: { progress: newProgress, completed },
    });

    if (completed) {
      await this.awardXP(userId, quest.xpReward);
    }
  }

  async getLeaderboard() {
    const top = await prisma.userStats.findMany({
      orderBy: { totalXp: 'desc' },
      take: 10,
      include: { user: { include: { profile: true } } },
    });

    return top.map((s, i) => {
      const p = s.user.profile;
      const firstName = p?.firstName ?? '';
      const lastInitial = p?.lastName ? `${p.lastName.charAt(0)}.` : '';
      const displayName = [firstName, lastInitial].filter(Boolean).join(' ') || 'Anonymous';
      return {
        rank: i + 1,
        displayName,
        level: s.level,
        totalXp: s.totalXp,
        currentStreak: s.currentStreak,
      };
    });
  }

  // ── Event handlers (fire-and-forget orchestrators) ──

  async onMealLogged(userId: string): Promise<void> {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    await prisma.userStats.upsert({
      where: { userId },
      create: { userId, totalMeals: 1 },
      update: { totalMeals: { increment: 1 } },
    });
    await this.awardXP(userId, 10);
    await this.updateStreak(userId);
    await this.getOrCreateDailyQuests(userId, todayStr);
    await this.updateQuestProgress(userId, 'log_meals', todayStr);
    await this.checkAndUnlockAchievements(userId);
  }

  async onWorkoutCompleted(userId: string): Promise<void> {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    await prisma.userStats.upsert({
      where: { userId },
      create: { userId, totalWorkouts: 1 },
      update: { totalWorkouts: { increment: 1 } },
    });
    await this.awardXP(userId, 30);
    await this.updateStreak(userId);
    await this.getOrCreateDailyQuests(userId, todayStr);
    await this.updateQuestProgress(userId, 'complete_workout', todayStr);
    await this.checkAndUnlockAchievements(userId);
  }

  async onProgressLogged(userId: string): Promise<void> {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    await prisma.userStats.upsert({
      where: { userId },
      create: { userId, totalProgressLogs: 1 },
      update: { totalProgressLogs: { increment: 1 } },
    });
    await this.awardXP(userId, 20);
    await this.updateStreak(userId);
    await this.getOrCreateDailyQuests(userId, todayStr);
    await this.updateQuestProgress(userId, 'log_progress', todayStr);
    await this.checkAndUnlockAchievements(userId);
  }

  async onGoalsSet(userId: string): Promise<void> {
    await this.awardXP(userId, 25);
    await this.checkAndUnlockAchievements(userId);
  }
}

export const gamificationService = new GamificationService();
export default gamificationService;
