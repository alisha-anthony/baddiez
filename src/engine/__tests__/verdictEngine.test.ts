import { describe, it, expect } from 'vitest';
import { runVerdictEngine } from '../verdictEngine';
import { normalizeOffProduct } from '../unitNormalizer';
import { HealthProfile } from '../../types/profile';
import { Product } from '../../types/product';

const baseProfile: HealthProfile = {
  id: 'user-1',
  displayName: 'Alisha',
  lifeStages: [],
  diabetesType: 'none',
  lactoseIntolerant: false,
  allergies: [],
  customAllergies: [],
  consentGiven: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('Verdict Engine — Core Health Rules', () => {
  it('overrides to RED when an allergen matches, even if all nutrients are healthy', () => {
    const milkAllergyProfile: HealthProfile = {
      ...baseProfile,
      allergies: ['milk'],
    };

    const productWithCasein: Product = {
      name: 'Clean Organic Protein Bar',
      source: 'manual',
      servingUnit: 'per100g',
      nutrients: {
        sugar_g: 1, // Super low sugar
        saturated_fat_g: 0.5,
        sodium_mg: 50,
      },
      ingredients: ['organic dates', 'sodium caseinate', 'chia seeds'],
      allergenTags: [],
      tracesTags: [],
      additives: [],
    };

    const result = runVerdictEngine(productWithCasein, milkAllergyProfile);
    expect(result.overall).toBe('red');
    expect(result.allergenMatches.length).toBeGreaterThan(0);
    expect(result.allergenMatches[0].allergen).toBe('milk');
    expect(result.allergenMatches[0].synonym).toBe('sodium caseinate');
  });

  it('detects gluten via barley synonym', () => {
    const glutenProfile: HealthProfile = {
      ...baseProfile,
      allergies: ['wheat_gluten'],
    };

    const cerealProduct: Product = {
      name: 'Morning Crisp Cereal',
      source: 'manual',
      servingUnit: 'per100g',
      nutrients: { sugar_g: 3 },
      ingredients: ['whole grain corn', 'barley malt extract'],
      allergenTags: [],
      tracesTags: [],
      additives: [],
    };

    const result = runVerdictEngine(cerealProduct, glutenProfile);
    expect(result.overall).toBe('red');
    expect(result.allergenMatches.some((m) => m.allergen === 'wheat_gluten')).toBe(true);
  });

  it('triggers yellow warning for allergen traces without overriding other rules', () => {
    const nutProfile: HealthProfile = {
      ...baseProfile,
      allergies: ['tree_nuts'],
    };

    const cleanSafeProduct: Product = {
      name: 'Oat Crackers',
      source: 'manual',
      servingUnit: 'per100g',
      nutrients: { sugar_g: 1 },
      ingredients: ['rolled oats', 'water', 'salt'],
      allergenTags: [],
      tracesTags: ['en:nuts'],
      additives: [],
    };

    const result = runVerdictEngine(cleanSafeProduct, nutProfile);
    expect(result.overall).toBe('yellow');
    expect(result.tracesWarnings.length).toBeGreaterThan(0);
  });

  it('evaluates graduated lactose intolerance: butter is yellow, whole milk is red', () => {
    const lactoseProfile: HealthProfile = {
      ...baseProfile,
      lactoseIntolerant: true,
    };

    const butterCookie: Product = {
      name: 'Shortbread Cookie',
      source: 'manual',
      servingUnit: 'per100g',
      nutrients: {},
      ingredients: ['wheat flour', 'butter', 'sugar'],
      allergenTags: [],
      tracesTags: [],
      additives: [],
    };

    const milkShake: Product = {
      name: 'Strawberry Shake',
      source: 'manual',
      servingUnit: 'per100ml',
      nutrients: {},
      ingredients: ['whole milk', 'strawberry syrup', 'whey'],
      allergenTags: [],
      tracesTags: [],
      additives: [],
    };

    const butterResult = runVerdictEngine(butterCookie, lactoseProfile);
    expect(butterResult.overall).toBe('yellow');

    const milkResult = runVerdictEngine(milkShake, lactoseProfile);
    expect(milkResult.overall).toBe('red');
  });

  it('returns insufficient_data (grey) when required nutrient is missing for active rule', () => {
    const pcosProfile: HealthProfile = {
      ...baseProfile,
      lifeStages: ['pcos'],
    };

    const mysteryProduct: Product = {
      name: 'Unlabeled Snack',
      source: 'manual',
      servingUnit: 'per100g',
      nutrients: {}, // No sugar, no fat, no sodium
      ingredients: [],
      allergenTags: [],
      tracesTags: [],
      additives: [],
    };

    const result = runVerdictEngine(mysteryProduct, pcosProfile);
    expect(result.overall).toBe('insufficient_data');
    expect(result.missingNutrients).toContain('Sugar');
  });

  it('handles Type 1 Diabetes: carbs are informational and do not force RED', () => {
    const t1Profile: HealthProfile = {
      ...baseProfile,
      diabetesType: 'type1',
    };

    const highCarbLowSugarProduct: Product = {
      name: 'Brown Rice Cakes',
      source: 'manual',
      servingUnit: 'per100g',
      nutrients: {
        carbs_g: 80, // High carbs for carb counting
        sugar_g: 0.5, // Low added sugar
        added_sugar_g: 0,
        fiber_g: 4,
      },
      ingredients: ['whole brown rice', 'sea salt'],
      allergenTags: [],
      tracesTags: [],
      additives: [],
    };

    const result = runVerdictEngine(highCarbLowSugarProduct, t1Profile);
    // Should NOT be red because carbs are informational for T1D
    expect(result.overall).toBe('green');
    const carbRule = result.ruleResults.find((r) => r.nutrient === 'Total Carbohydrates');
    expect(carbRule?.isInformational).toBe(true);
  });

  it('correctly handles multi-condition profile (PCOS + Type 2 Diabetes)', () => {
    const multiProfile: HealthProfile = {
      ...baseProfile,
      lifeStages: ['pcos'],
      diabetesType: 'type2',
    };

    const sweetProduct: Product = {
      name: 'Granola Bar',
      source: 'manual',
      servingUnit: 'per100g',
      nutrients: {
        sugar_g: 12, // Exceeds both PCOS (10g) and T2D (8g) limits
        carbs_g: 30,
        saturated_fat_g: 6,
        sodium_mg: 200,
      },
      ingredients: ['rolled oats', 'high fructose corn syrup', 'palm oil'],
      allergenTags: [],
      tracesTags: [],
      additives: [],
    };

    const result = runVerdictEngine(sweetProduct, multiProfile);
    expect(result.overall).toBe('red');
    expect(result.avoidIngredients).toContain('high fructose corn syrup');
    expect(result.consequences.length).toBeGreaterThan(0);
    expect(result.alternatives?.length).toBeGreaterThan(0);
  });
});

describe('Unit Normalizer', () => {
  it('converts sodium from grams to milligrams and detects beverages', () => {
    const rawOffResponse = {
      code: '0123456789',
      product_name: 'Electrolyte Splash Drink',
      categories_tags: ['en:beverages', 'en:sports-drinks'],
      nutriments: {
        sodium_100g: 0.15, // 0.15 grams
        sugars_100g: 4.5,
        'energy-kcal_100g': 20,
      },
      ingredients_text: 'Water, Citric Acid, Salt',
    };

    const normalized = normalizeOffProduct(rawOffResponse);
    expect(normalized.servingUnit).toBe('per100ml');
    expect(normalized.nutrients.sodium_mg).toBe(150); // 0.15g * 1000 = 150mg
    expect(normalized.nutrients.sugar_g).toBe(4.5);
  });
});
