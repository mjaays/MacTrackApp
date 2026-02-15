import { z } from 'zod';

export const createFoodSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  brand: z.string().max(100).optional(),
  barcode: z.string().max(50).optional(),
  servingSizeG: z.number().positive().default(100),
  servingUnit: z.string().max(20).default('g'),
  caloriesKcal: z.number().min(0, 'Calories must be non-negative'),
  proteinG: z.number().min(0, 'Protein must be non-negative'),
  carbsG: z.number().min(0, 'Carbs must be non-negative'),
  fatG: z.number().min(0, 'Fat must be non-negative'),
  fiberG: z.number().min(0).optional(),
  sugarG: z.number().min(0).optional(),
  sodiumMg: z.number().min(0).optional(),
  saturatedFatG: z.number().min(0).optional(),
  cholesterolMg: z.number().min(0).optional(),
});

export const updateFoodSchema = createFoodSchema.partial();

export const searchFoodsSchema = z.object({
  query: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateFoodInput = z.infer<typeof createFoodSchema>;
export type UpdateFoodInput = z.infer<typeof updateFoodSchema>;
export type SearchFoodsInput = z.infer<typeof searchFoodsSchema>;
