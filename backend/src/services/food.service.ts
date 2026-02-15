import { prisma } from '../utils/prisma';
import { NotFoundError } from '../errors/NotFoundError';
import { AuthError } from '../errors/AuthError';
import type { CreateFoodInput, UpdateFoodInput, SearchFoodsInput } from '../validators/food.validator';

export class FoodService {
  /**
   * Get all foods accessible by user (verified + user's custom foods)
   */
  async getAllFoods(userId: string, params: SearchFoodsInput) {
    const { query, page, limit } = params;
    const skip = (page - 1) * limit;

    const where = {
      AND: [
        {
          OR: [
            { isVerified: true },
            { createdByUserId: userId },
          ],
        },
        query
          ? {
              OR: [
                { name: { contains: query } },
                { brand: { contains: query } },
                { barcode: { contains: query } },
              ],
            }
          : {},
      ],
    };

    const [foods, total] = await Promise.all([
      prisma.food.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.food.count({ where }),
    ]);

    return {
      foods,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single food by ID
   */
  async getFoodById(userId: string, foodId: string) {
    const food = await prisma.food.findUnique({
      where: { id: foodId },
    });

    if (!food) {
      throw new NotFoundError('Food', foodId);
    }

    // Check access: either verified or created by user
    if (!food.isVerified && food.createdByUserId !== userId) {
      throw new NotFoundError('Food', foodId);
    }

    return food;
  }

  /**
   * Search food by barcode
   */
  async getFoodByBarcode(userId: string, barcode: string) {
    const food = await prisma.food.findFirst({
      where: {
        barcode,
        OR: [
          { isVerified: true },
          { createdByUserId: userId },
        ],
      },
    });

    if (!food) {
      throw new NotFoundError('Food with barcode', barcode);
    }

    return food;
  }

  /**
   * Create a custom food for user
   */
  async createFood(userId: string, data: CreateFoodInput) {
    return prisma.food.create({
      data: {
        ...data,
        isCustom: true,
        isVerified: false,
        createdByUserId: userId,
      },
    });
  }

  /**
   * Update a custom food (only owner can update)
   */
  async updateFood(userId: string, foodId: string, data: UpdateFoodInput) {
    const food = await prisma.food.findUnique({
      where: { id: foodId },
    });

    if (!food) {
      throw new NotFoundError('Food', foodId);
    }

    // Only the creator can update custom foods
    if (food.createdByUserId !== userId) {
      throw new AuthError('You can only update your own custom foods');
    }

    return prisma.food.update({
      where: { id: foodId },
      data,
    });
  }

  /**
   * Delete a custom food (only owner can delete)
   */
  async deleteFood(userId: string, foodId: string) {
    const food = await prisma.food.findUnique({
      where: { id: foodId },
    });

    if (!food) {
      throw new NotFoundError('Food', foodId);
    }

    // Only the creator can delete custom foods
    if (food.createdByUserId !== userId) {
      throw new AuthError('You can only delete your own custom foods');
    }

    // Check if food is used in any meal entries
    const usageCount = await prisma.mealEntry.count({
      where: { foodId },
    });

    if (usageCount > 0) {
      throw new AuthError(`Cannot delete food: it is used in ${usageCount} meal entries`);
    }

    await prisma.food.delete({
      where: { id: foodId },
    });
  }
}

export const foodService = new FoodService();
export default foodService;
