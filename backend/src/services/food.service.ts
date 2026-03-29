import { prisma } from '../utils/prisma';
import { NotFoundError } from '../errors/NotFoundError';
import { AuthError } from '../errors/AuthError';
import type { CreateFoodInput, UpdateFoodInput, SearchFoodsInput } from '../validators/food.validator';

export interface ExternalFoodResult {
  externalId: string;       // barcode / OFF product code
  name: string;
  brand?: string;
  caloriesKcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
  sugarG?: number;
  sodiumMg?: number;
  saturatedFatG?: number;
  servingSizeG: number;
  servingUnit: string;
}

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

  /**
   * Search Open Food Facts for foods matching query
   */
  async searchExternalFoods(query: string): Promise<ExternalFoodResult[]> {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&action=process&json=1&page_size=20&fields=product_name,brands,nutriments,serving_size,code`;
    const res = await fetch(url, { headers: { 'User-Agent': 'MacTrackApp/1.0' } });
    if (!res.ok) return [];

    const data = await res.json() as { products?: any[] };
    if (!data.products) return [];

    const results: ExternalFoodResult[] = [];
    for (const p of data.products) {
      const name = p.product_name?.trim();
      if (!name) continue;

      const n = p.nutriments ?? {};
      const calories = Number(n['energy-kcal_100g'] ?? n['energy-kcal'] ?? 0);
      const protein  = Number(n.proteins_100g  ?? n.proteins  ?? 0);
      const carbs    = Number(n.carbohydrates_100g ?? n.carbohydrates ?? 0);
      const fat      = Number(n.fat_100g       ?? n.fat       ?? 0);

      if (calories === 0 && protein === 0 && carbs === 0 && fat === 0) continue;

      results.push({
        externalId:    String(p.code ?? ''),
        name,
        brand:         p.brands?.split(',')[0]?.trim() || undefined,
        caloriesKcal:  Math.round(calories * 10) / 10,
        proteinG:      Math.round(protein  * 10) / 10,
        carbsG:        Math.round(carbs    * 10) / 10,
        fatG:          Math.round(fat      * 10) / 10,
        fiberG:        n.fiber_100g        != null ? Math.round(Number(n.fiber_100g)        * 10) / 10 : undefined,
        sugarG:        n.sugars_100g       != null ? Math.round(Number(n.sugars_100g)       * 10) / 10 : undefined,
        sodiumMg:      n.sodium_100g       != null ? Math.round(Number(n.sodium_100g) * 1000 * 10) / 10 : undefined,
        saturatedFatG: n['saturated-fat_100g'] != null ? Math.round(Number(n['saturated-fat_100g']) * 10) / 10 : undefined,
        servingSizeG:  100,
        servingUnit:   'g',
      });
    }
    return results;
  }

  /**
   * Import an external food into the local DB (deduplicates by barcode or name).
   * Returns the existing record if already imported.
   */
  async importExternalFood(userId: string, data: ExternalFoodResult) {
    // Try dedup by barcode first
    if (data.externalId) {
      const existing = await prisma.food.findFirst({
        where: { barcode: data.externalId },
      });
      if (existing) return existing;
    }

    const foodData: CreateFoodInput = {
      name:          data.name,
      brand:         data.brand,
      barcode:       data.externalId || undefined,
      caloriesKcal:  data.caloriesKcal,
      proteinG:      data.proteinG,
      carbsG:        data.carbsG,
      fatG:          data.fatG,
      fiberG:        data.fiberG,
      sugarG:        data.sugarG,
      sodiumMg:      data.sodiumMg,
      saturatedFatG: data.saturatedFatG,
      servingSizeG:  data.servingSizeG,
      servingUnit:   data.servingUnit,
    };

    return this.createFood(userId, foodData);
  }
}

export const foodService = new FoodService();
export default foodService;
