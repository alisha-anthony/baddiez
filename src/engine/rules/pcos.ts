import { Product } from '../../types/product';
import { RuleResult } from '../../types/verdict';
import { PCOS_THRESHOLDS } from '../rulesConfig';

export function evaluatePCOS(product: Product): {
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
      ruleId: 'pcos_sugar',
      condition: 'PCOS / PCOD',
      nutrient: 'Sugar',
      actualValue: null,
      limitValue: PCOS_THRESHOLDS.sugar.greenMax,
      unit: `g / 100${unit}`,
      verdict: 'unknown',
      message: 'Sugar content is not specified on packaging.',
    });
  } else if (n.sugar_g <= PCOS_THRESHOLDS.sugar.greenMax) {
    results.push({
      ruleId: 'pcos_sugar',
      condition: 'PCOS / PCOD',
      nutrient: 'Sugar',
      actualValue: n.sugar_g,
      limitValue: PCOS_THRESHOLDS.sugar.greenMax,
      unit: `g / 100${unit}`,
      verdict: 'green',
      message: `Sugar is ${n.sugar_g}g per 100${unit}, within the safe <= ${PCOS_THRESHOLDS.sugar.greenMax}g limit.`,
    });
  } else if (n.sugar_g <= PCOS_THRESHOLDS.sugar.yellowMax) {
    results.push({
      ruleId: 'pcos_sugar',
      condition: 'PCOS / PCOD',
      nutrient: 'Sugar',
      actualValue: n.sugar_g,
      limitValue: PCOS_THRESHOLDS.sugar.greenMax,
      unit: `g / 100${unit}`,
      verdict: 'yellow',
      message: `Moderate sugar (${n.sugar_g}g per 100${unit}). May prompt mild insulin resistance response.`,
    });
  } else {
    results.push({
      ruleId: 'pcos_sugar',
      condition: 'PCOS / PCOD',
      nutrient: 'Sugar',
      actualValue: n.sugar_g,
      limitValue: PCOS_THRESHOLDS.sugar.greenMax,
      unit: `g / 100${unit}`,
      verdict: 'red',
      message: `High sugar (${n.sugar_g}g per 100${unit}, limit ${PCOS_THRESHOLDS.sugar.greenMax}g). Can trigger sharp insulin spikes and hormone imbalance.`,
    });
  }

  // 2. Saturated Fat
  if (n.saturated_fat_g === undefined) {
    results.push({
      ruleId: 'pcos_sat_fat',
      condition: 'PCOS / PCOD',
      nutrient: 'Saturated Fat',
      actualValue: null,
      limitValue: PCOS_THRESHOLDS.saturatedFat.greenMax,
      unit: `g / 100${unit}`,
      verdict: 'unknown',
      message: 'Saturated fat content not specified.',
    });
  } else if (n.saturated_fat_g <= PCOS_THRESHOLDS.saturatedFat.greenMax) {
    results.push({
      ruleId: 'pcos_sat_fat',
      condition: 'PCOS / PCOD',
      nutrient: 'Saturated Fat',
      actualValue: n.saturated_fat_g,
      limitValue: PCOS_THRESHOLDS.saturatedFat.greenMax,
      unit: `g / 100${unit}`,
      verdict: 'green',
      message: `Saturated fat is ${n.saturated_fat_g}g, safe for metabolic health.`,
    });
  } else if (n.saturated_fat_g <= PCOS_THRESHOLDS.saturatedFat.yellowMax) {
    results.push({
      ruleId: 'pcos_sat_fat',
      condition: 'PCOS / PCOD',
      nutrient: 'Saturated Fat',
      actualValue: n.saturated_fat_g,
      limitValue: PCOS_THRESHOLDS.saturatedFat.greenMax,
      unit: `g / 100${unit}`,
      verdict: 'yellow',
      message: `Moderate saturated fat (${n.saturated_fat_g}g per 100${unit}).`,
    });
  } else {
    results.push({
      ruleId: 'pcos_sat_fat',
      condition: 'PCOS / PCOD',
      nutrient: 'Saturated Fat',
      actualValue: n.saturated_fat_g,
      limitValue: PCOS_THRESHOLDS.saturatedFat.greenMax,
      unit: `g / 100${unit}`,
      verdict: 'red',
      message: `High saturated fat (${n.saturated_fat_g}g per 100${unit}, limit ${PCOS_THRESHOLDS.saturatedFat.greenMax}g). Increases inflammatory burden.`,
    });
  }

  // 3. Trans Fat
  if (n.trans_fat_g !== undefined && n.trans_fat_g > 0.1) {
    results.push({
      ruleId: 'pcos_trans_fat',
      condition: 'PCOS / PCOD',
      nutrient: 'Trans Fat',
      actualValue: n.trans_fat_g,
      limitValue: 0,
      unit: `g / 100${unit}`,
      verdict: 'red',
      message: `Contains ${n.trans_fat_g}g trans fats. Promotes systemic inflammation and ovulatory dysfunction.`,
    });
  }

  // 4. Sodium
  if (n.sodium_mg !== undefined) {
    if (n.sodium_mg > PCOS_THRESHOLDS.sodium.yellowMax) {
      results.push({
        ruleId: 'pcos_sodium',
        condition: 'PCOS / PCOD',
        nutrient: 'Sodium',
        actualValue: n.sodium_mg,
        limitValue: PCOS_THRESHOLDS.sodium.greenMax,
        unit: 'mg',
        verdict: 'red',
        message: `High sodium (${n.sodium_mg}mg). Contributes to water retention and blood pressure volatility.`,
      });
    } else if (n.sodium_mg > PCOS_THRESHOLDS.sodium.greenMax) {
      results.push({
        ruleId: 'pcos_sodium',
        condition: 'PCOS / PCOD',
        nutrient: 'Sodium',
        actualValue: n.sodium_mg,
        limitValue: PCOS_THRESHOLDS.sodium.greenMax,
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

  for (const avoid of PCOS_THRESHOLDS.avoidIngredients) {
    if (ingredientsStr.includes(avoid)) {
      avoidFound.push(avoid);
      results.push({
        ruleId: `pcos_avoid_${avoid.replace(/\s+/g, '_')}`,
        condition: 'PCOS / PCOD',
        nutrient: avoid,
        actualValue: 1,
        limitValue: 0,
        unit: 'present',
        verdict: 'red',
        message: `Contains "${avoid}", known to exacerbate insulin sensitivity and endocrine disruption.`,
      });
    }
  }

  return { results, avoidIngredients: avoidFound };
}
