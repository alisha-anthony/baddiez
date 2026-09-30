import { Product } from '../../types/product';
import { RuleResult } from '../../types/verdict';
import { LACTOSE_CLASSIFICATION } from '../rulesConfig';

export function evaluateLactose(product: Product): RuleResult[] {
  const ingredients = [
    ...(product.ingredients || []),
    product.ingredientsRaw || '',
  ]
    .join(' ')
    .toLowerCase();

  // If there are no ingredients listed
  if (!ingredients.trim()) {
    return [
      {
        ruleId: 'lactose_check',
        condition: 'Lactose Intolerance',
        nutrient: 'Dairy/Lactose Content',
        actualValue: null,
        limitValue: 0,
        unit: 'ingredients',
        verdict: 'unknown',
        message: 'No ingredient list found to verify lactose or dairy contents',
      },
    ];
  }

  // 1. Check for High-Lactose Red Ingredients
  for (const item of LACTOSE_CLASSIFICATION.redIngredients) {
    const regex = new RegExp(`\\b${item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(ingredients)) {
      return [
        {
          ruleId: 'lactose_high',
          condition: 'Lactose Intolerance',
          nutrient: 'Lactose',
          actualValue: 1,
          limitValue: 0,
          unit: 'present',
          verdict: 'red',
          message: `Contains high-lactose ingredient "${item}". High likelihood of digestive discomfort.`,
        },
      ];
    }
  }

  // 2. Check for Low-Lactose / Fermented Yellow Ingredients
  for (const item of LACTOSE_CLASSIFICATION.yellowIngredients) {
    const regex = new RegExp(`\\b${item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(ingredients)) {
      return [
        {
          ruleId: 'lactose_low',
          condition: 'Lactose Intolerance',
          nutrient: 'Low-Lactose Dairy',
          actualValue: 0.5,
          limitValue: 0,
          unit: 'trace',
          verdict: 'yellow',
          message: `Contains low-lactose item "${item}". Usually tolerated in modest amounts, but test personal sensitivity.`,
        },
      ];
    }
  }

  // 3. No dairy ingredients found
  return [
    {
      ruleId: 'lactose_safe',
      condition: 'Lactose Intolerance',
      nutrient: 'Lactose',
      actualValue: 0,
      limitValue: 0,
      unit: 'none',
      verdict: 'green',
      message: 'No dairy or lactose-containing ingredients identified.',
    },
  ];
}
