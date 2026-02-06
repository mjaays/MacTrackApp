import prisma from '../utils/prisma';

export class FoodService {
  static async getAllFoods(userId: string) {
    return prisma.food.findMany({
      where: {
        OR: [
          { isVerified: true },
          { createdByUserId: userId },
        ],
      },
      orderBy: { name: 'asc' },
    });
  }

  static async createFood(userId: string, data: any) {
    return prisma.food.create({
      data: {
        ...data,
        isCustom: true,
        createdByUserId: userId,
      },
    });
  }
}
