import { Product } from '../../types/product';
import { RuleResult } from '../../types/verdict';
import { DIABETES_T1_THRESHOLDS } from '../rulesConfig';

export function evaluateDiabetesT1(product: Product): RuleResult[] {
  const results: RuleResult[] = [];
  const n = product.nutrients;
  const unit = product.servingUnit === 'per100ml' ? 'ml' : 'g';

  // 1. Total Carbohydrates (INFORMATIONAL ONLY — does not affect Green/Yellow/Red overall verdict)
  if (n.carbs_g !== undefined) {
    results.push({
      ruleId: 't1d_carbs_info',
      condition: 'Type 1 Diabetes',
      nutrient: 'Total Carbohydrates',
      actualValue: n.carbs_g,
      limitValue: 0,
      unit: `g / 100${unit}`,
      verdict: 'green',
      isInformational: true,
      message: `Carbohydrates: ${n.carbs_g}g per 100${unit}. For insulin dosing and carb counting.`,
    });
  }

  // 2. Sugar / Added Sugar Evaluation
  const sugarValue = n.added_sugar_g !== undefined ? n.added_sugar_g : n.sugar_g;
  const sugarLabel = n.added_sugar_g !== undefined ? 'Added Sugar' : 'Total Sugar';

  if (sugarValue === undefined) {
    results.push({
      ruleId: 't1d_sugar',
      condition: 'Type 1 Diabetes',
      nutrient: sugarLabel,
      actualValue: null,
      limitValue: DIABETES_T1_THRESHOLDS.addedSugar.greenMax,
      unit: `g / 100${unit}`,
      verdict: 'unknown',
      message: `${sugarLabel} content is not declared on label.`,
    });
  } else if (sugarValue <= DIABETES_T1_THRESHOLDS.addedSugar.greenMax) {
    results.push({
      ruleId: 't1d_sugar',
      condition: 'Type 1 Diabetes',
      nutrient: sugarLabel,
      actualValue: sugarValue,
      limitValue: DIABETES_T1_THRESHOLDS.addedSugar.greenMax,
      unit: `g / 100${unit}`,
      verdict: 'green',
      message: `${sugarLabel} is ${sugarValue}g (safe range <= ${DIABETES_T1_THRESHOLDS.addedSugar.greenMax}g). Minimal rapid glucose spike risk.`,
    });
  } else if (sugarValue <= DIABETES_T1_THRESHOLDS.addedSugar.yellowMax) {
    results.push({
      ruleId: 't1d_sugar',
      condition: 'Type 1 Diabetes',
      nutrient: sugarLabel,
      actualValue: sugarValue,
      limitValue: DIABETES_T1_THRESHOLDS.addedSugar.greenMax,
      unit: `g / 100${unit}`,
      verdict: 'yellow',
      message: `Moderate ${sugarLabel.toLowerCase()} (${sugarValue}g). Fast absorption will require attentive bolus timing.`,
    });
  } else {
    results.push({
      ruleId: 't1d_sugar',
      condition: 'Type 1 Diabetes',
      nutrient: sugarLabel,
      actualValue: sugarValue,
      limitValue: DIABETES_T1_THRESHOLDS.addedSugar.greenMax,
      unit: `g / 100${unit}`,
      verdict: 'red',
      message: `High ${sugarLabel.toLowerCase()} (${sugarValue}g per 100${unit}). High likelihood of rapid post-meal hyperglycemia spike.`,
    });
  }

  // 3. High-GI Indicator Ingredients
  const ingredientsStr = [
    ...(product.ingredients || []),
    product.ingredientsRaw || '',
  ]
    .join(' ')
    .toLowerCase();

  const highGIIngredients = [
    'high fructose corn syrup',
    'maltodextrin',
    'dextrose',
    'glucose syrup',
    'corn syrup solids',
  ];

  for (const gi of highGIIngredients) {
    if (ingredientsStr.includes(gi)) {
      results.push({
        ruleId: `t1d_high_gi_${gi.replace(/\s+/g, '_')}`,
        condition: 'Type 1 Diabetes',
        nutrient: `High-GI: ${gi}`,
        actualValue: 1,
        limitValue: 0,
        unit: 'present',
        verdict: 'yellow',
        message: `Contains "${gi}", a very fast-acting glycemic agent that spikes blood glucose rapidly.`,
      });
      break;
    }
  }

  // 4. Fiber (Beneficial Nutrient)
  if (n.fiber_g !== undefined && n.fiber_g >= DIABETES_T1_THRESHOLDS.fiber.greenMin) {
    results.push({
      ruleId: 't1d_fiber',
      condition: 'Type 1 Diabetes',
      nutrient: 'Dietary Fiber',
      actualValue: n.fiber_g,
      limitValue: DIABETES_T1_THRESHOLDS.fiber.greenMin,
      unit: 'g',
      verdict: 'green',
      isInformational: true,
      message: `Good fiber content (${n.fiber_g}g), which helps steady carbohydrate absorption.`,
    });
  }

  // 5. Trans Fat
  if (n.trans_fat_g !== undefined && n.trans_fat_g > 0.1) {
    results.push({
      ruleId: 't1d_trans_fat',
      condition: 'Type 1 Diabetes',
      nutrient: 'Trans Fat',
      actualValue: n.trans_fat_g,
      limitValue: 0,
      unit: 'g',
      verdict: 'red',
      message: 'Contains trans fats, elevating long-term cardiovascular risk in diabetes.',
    });
  }

  return results;
}
