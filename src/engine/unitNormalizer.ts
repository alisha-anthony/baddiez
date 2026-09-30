import { Product, ServingUnit, NutrientData } from '../types/product';

/**
 * Normalizes Open Food Facts raw API responses into a clean, typed Product object.
 * Critical adjustments:
 * - Converts sodium from grams to milligrams (1g = 1000mg)
 * - Identifies beverages vs solid foods (per100ml vs per100g)
 * - Extracts serving size and allergens/traces tags
 */
export function normalizeOffProduct(rawData: any): Product {
  const nutriments = rawData.nutriments || {};

  // Detect beverage vs solid
  const categories = (rawData.categories_tags || []).join(' ').toLowerCase();
  const quantity = (rawData.quantity || '').toLowerCase();
  const servingSizeRaw = rawData.serving_size || '';

  const isBeverage =
    categories.includes('beverage') ||
    categories.includes('drinks') ||
    categories.includes('boissons') ||
    quantity.includes('ml') ||
    quantity.includes('cl') ||
    quantity.includes('liter') ||
    quantity.includes('litre') ||
    servingSizeRaw.toLowerCase().includes('ml');

  const servingUnit: ServingUnit = isBeverage ? 'per100ml' : 'per100g';

  // Calculate sodium in mg (OFF stores sodium in grams)
  let sodiumMg: number | undefined = undefined;
  if (nutriments.sodium_100g !== undefined && nutriments.sodium_100g !== null) {
    sodiumMg = Math.round(Number(nutriments.sodium_100g) * 1000);
  } else if (nutriments.salt_100g !== undefined && nutriments.salt_100g !== null) {
    // 1g salt ≈ 400mg sodium (salt / 2.5)
    sodiumMg = Math.round((Number(nutriments.salt_100g) / 2.5) * 1000);
  }

  // Parse sugar
  const sugarG =
    nutriments.sugars_100g !== undefined ? Number(nutriments.sugars_100g) : undefined;
  const addedSugarG =
    nutriments['added-sugars_100g'] !== undefined
      ? Number(nutriments['added-sugars_100g'])
      : undefined;

  // Parse fats
  const saturatedFatG =
    nutriments['saturated-fat_100g'] !== undefined
      ? Number(nutriments['saturated-fat_100g'])
      : undefined;
  const totalFatG =
    nutriments.fat_100g !== undefined ? Number(nutriments.fat_100g) : undefined;
  const transFatG =
    nutriments['trans-fat_100g'] !== undefined
      ? Number(nutriments['trans-fat_100g'])
      : undefined;

  // Parse carbs & fiber
  const carbsG =
    nutriments.carbohydrates_100g !== undefined
      ? Number(nutriments.carbohydrates_100g)
      : undefined;
  const fiberG =
    nutriments.fiber_100g !== undefined ? Number(nutriments.fiber_100g) : undefined;
  const proteinG =
    nutriments.proteins_100g !== undefined
      ? Number(nutriments.proteins_100g)
      : undefined;
  const energyKcal =
    nutriments['energy-kcal_100g'] !== undefined
      ? Number(nutriments['energy-kcal_100g'])
      : nutriments.energy_100g !== undefined
      ? Math.round(Number(nutriments.energy_100g) / 4.184)
      : undefined;

  const caffeineMg =
    nutriments.caffeine_100g !== undefined
      ? Math.round(Number(nutriments.caffeine_100g) * 1000)
      : undefined;

  const nutrients: NutrientData = {
    energy_kcal: energyKcal,
    sugar_g: sugarG,
    added_sugar_g: addedSugarG,
    saturated_fat_g: saturatedFatG,
    total_fat_g: totalFatG,
    trans_fat_g: transFatG,
    sodium_mg: sodiumMg,
    fiber_g: fiberG,
    protein_g: proteinG,
    carbs_g: carbsG,
    caffeine_mg: caffeineMg,
  };

  // Ingredients extraction
  let ingredients: string[] = [];
  const rawIngredientsText = rawData.ingredients_text_en || rawData.ingredients_text || '';

  if (Array.isArray(rawData.ingredients) && rawData.ingredients.length > 0) {
    ingredients = rawData.ingredients
      .map((item: any) => item.text || item.id || '')
      .filter((text: string) => text.trim().length > 0);
  } else if (rawIngredientsText) {
    ingredients = rawIngredientsText
      .split(/[,;\n•]/)
      .map((s: string) => s.trim().replace(/^[-*]\s*/, ''))
      .filter((s: string) => s.length > 0);
  }

  return {
    barcode: rawData.code || rawData.id,
    name: rawData.product_name || rawData.product_name_en || 'Unknown Product',
    brand: rawData.brands || rawData.brand_owner || '',
    imageUrl: rawData.image_url || rawData.image_front_url || '',
    source: 'openfoodfacts',
    servingUnit,
    servingSize: servingSizeRaw || undefined,
    nutrients,
    ingredients,
    ingredientsRaw: rawIngredientsText,
    allergenTags: Array.isArray(rawData.allergens_tags) ? rawData.allergens_tags : [],
    tracesTags: Array.isArray(rawData.traces_tags) ? rawData.traces_tags : [],
    additives: Array.isArray(rawData.additives_tags) ? rawData.additives_tags : [],
    novaGroup: rawData.nova_group ? Number(rawData.nova_group) : undefined,
    nutriscoreGrade: rawData.nutriscore_grade || undefined,
    category: Array.isArray(rawData.categories_hierarchy)
      ? rawData.categories_hierarchy[0]
      : undefined,
  };
}
