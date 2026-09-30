import { Product } from '../../types/product';
import { RuleResult } from '../../types/verdict';
import { DIABETES_T2_THRESHOLDS } from '../rulesConfig';

export function evaluateDiabetesT2(product: Product): {
  results: RuleResult[];
  avoidIngredients: string[];
} {
  const results: RuleResult[] = [];
  const avoidFound: string[] = [];
  const n = product.nutrients;
  const unit = product.servingUnit === 'per100ml' ? 'ml' : 'g';

  // 1. Sugar
  if (n.sugar_g === undefined) {
    results.push({
      ruleId: 't2d_sugar',
      condition: 'Type 2 Diabetes',
      nutrient: 'Sugar',
      actualValue: null,
      limitValue: DIABETES_T2_THRESHOLDS.sugar.greenMax,
      unit: `g / 100${unit}`,
      verdict: 'unknown',
      message: 'Sugar content is not specified.',
    });
  } else if (n.sugar_g <= DIABETES_T2_THRESHOLDS.sugar.greenMax) {
    results.push({
      ruleId: 't2d_sugar',
      condition: 'Type 2 Diabetes',
      nutrient: 'Sugar',
      actualValue: n.sugar_g,
      limitValue: DIABETES_T2_THRESHOLDS.sugar.greenMax,
      unit: `g / 100${unit}`,
      verdict: 'green',
      message: `Sugar is ${n.sugar_g}g per 100${unit} (safe threshold <= ${DIABETES_T2_THRESHOLDS.sugar.greenMax}g).`,
    });
  } else if (n.sugar_g <= DIABETES_T2_THRESHOLDS.sugar.yellowMax) {
    results.push({
      ruleId: 't2d_sugar',
      condition: 'Type 2 Diabetes',
      nutrient: 'Sugar',
      actualValue: n.sugar_g,
      limitValue: DIABETES_T2_THRESHOLDS.sugar.greenMax,
      unit: `g / 100${unit}`,
      verdict: 'yellow',
      message: `Moderate sugar (${n.sugar_g}g per 100${unit}). Can elevate blood glucose.`,
    });
  } else {
    results.push({
      ruleId: 't2d_sugar',
      condition: 'Type 2 Diabetes',
      nutrient: 'Sugar',
      actualValue: n.sugar_g,
      limitValue: DIABETES_T2_THRESHOLDS.sugar.greenMax,
      unit: `g / 100${unit}`,
      verdict: 'red',
      message: `High sugar (${n.sugar_g}g per 100${unit}, safe target <= ${DIABETES_T2_THRESHOLDS.sugar.greenMax}g). Risk of hyperglycemia.`,
    });
  }

  // 2. Total Carbohydrates
  if (n.carbs_g === undefined) {
    results.push({
      ruleId: 't2d_carbs',
      condition: 'Type 2 Diabetes',
      nutrient: 'Total Carbs',
      actualValue: null,
      limitValue: DIABETES_T2_THRESHOLDS.carbs.greenMax,
      unit: `g / 100${unit}`,
      verdict: 'unknown',
      message: 'Total carbohydrate content is not declared.',
    });
  } else if (n.carbs_g <= DIABETES_T2_THRESHOLDS.carbs.greenMax) {
    results.push({
      ruleId: 't2d_carbs',
      condition: 'Type 2 Diabetes',
      nutrient: 'Total Carbs',
      actualValue: n.carbs_g,
      limitValue: DIABETES_T2_THRESHOLDS.carbs.greenMax,
      unit: `g / 100${unit}`,
      verdict: 'green',
      message: `Carbohydrates: ${n.carbs_g}g (low-carb friendly).`,
    });
  } else if (n.carbs_g <= DIABETES_T2_THRESHOLDS.carbs.yellowMax) {
    results.push({
      ruleId: 't2d_carbs',
      condition: 'Type 2 Diabetes',
      nutrient: 'Total Carbs',
      actualValue: n.carbs_g,
      limitValue: DIABETES_T2_THRESHOLDS.carbs.greenMax,
      unit: `g / 100${unit}`,
      verdict: 'yellow',
      message: `Moderate carb load (${n.carbs_g}g per 100${unit}). Portion control advised.`,
    });
  } else {
    results.push({
      ruleId: 't2d_carbs',
      condition: 'Type 2 Diabetes',
      nutrient: 'Total Carbs',
      actualValue: n.carbs_g,
      limitValue: DIABETES_T2_THRESHOLDS.carbs.greenMax,
      unit: `g / 100${unit}`,
      verdict: 'red',
      message: `High carb load (${n.carbs_g}g per 100${unit}). High glycemic burden.`,
    });
  }

  // 3. Saturated Fat
  if (n.saturated_fat_g !== undefined) {
    if (n.saturated_fat_g > DIABETES_T2_THRESHOLDS.saturatedFat.yellowMax) {
      results.push({
        ruleId: 't2d_sat_fat',
        condition: 'Type 2 Diabetes',
        nutrient: 'Saturated Fat',
        actualValue: n.saturated_fat_g,
        limitValue: DIABETES_T2_THRESHOLDS.saturatedFat.greenMax,
        unit: 'g',
        verdict: 'red',
        message: `High saturated fat (${n.saturated_fat_g}g), increasing insulin resistance and cardiovascular risk.`,
      });
    } else if (n.saturated_fat_g > DIABETES_T2_THRESHOLDS.saturatedFat.greenMax) {
      results.push({
        ruleId: 't2d_sat_fat',
        condition: 'Type 2 Diabetes',
        nutrient: 'Saturated Fat',
        actualValue: n.saturated_fat_g,
        limitValue: DIABETES_T2_THRESHOLDS.saturatedFat.greenMax,
        unit: 'g',
        verdict: 'yellow',
        message: `Moderate saturated fat (${n.saturated_fat_g}g).`,
      });
    }
  }

  // 4. Sodium
  if (n.sodium_mg !== undefined) {
    if (n.sodium_mg > DIABETES_T2_THRESHOLDS.sodium.yellowMax) {
      results.push({
        ruleId: 't2d_sodium',
        condition: 'Type 2 Diabetes',
        nutrient: 'Sodium',
        actualValue: n.sodium_mg,
        limitValue: DIABETES_T2_THRESHOLDS.sodium.greenMax,
        unit: 'mg',
        verdict: 'red',
        message: `High sodium (${n.sodium_mg}mg). Elevates vascular pressure.`,
      });
    } else if (n.sodium_mg > DIABETES_T2_THRESHOLDS.sodium.greenMax) {
      results.push({
        ruleId: 't2d_sodium',
        condition: 'Type 2 Diabetes',
        nutrient: 'Sodium',
        actualValue: n.sodium_mg,
        limitValue: DIABETES_T2_THRESHOLDS.sodium.greenMax,
        unit: 'mg',
        verdict: 'yellow',
        message: `Moderate sodium (${n.sodium_mg}mg).`,
      });
    }
  }

  // 5. Avoid Ingredients check
  const ingredientsStr = [
    ...(product.ingredients || []),
    product.ingredientsRaw || '',
  ]
    .join(' ')
    .toLowerCase();

  for (const avoid of DIABETES_T2_THRESHOLDS.avoidIngredients) {
    if (ingredientsStr.includes(avoid)) {
      avoidFound.push(avoid);
      results.push({
        ruleId: `t2d_avoid_${avoid.replace(/\s+/g, '_')}`,
        condition: 'Type 2 Diabetes',
        nutrient: avoid,
        actualValue: 1,
        limitValue: 0,
        unit: 'present',
        verdict: 'red',
        message: `Contains "${avoid}", highly prone to spiking blood glucose levels.`,
      });
    }
  }

  return { results, avoidIngredients: avoidFound };
}
