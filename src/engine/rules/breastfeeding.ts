import { Product } from '../../types/product';
import { RuleResult } from '../../types/verdict';
import { BREASTFEEDING_THRESHOLDS, PREGNANCY_THRESHOLDS } from '../rulesConfig';

export function evaluateBreastfeeding(product: Product): {
  results: RuleResult[];
  avoidIngredients: string[];
} {
  const results: RuleResult[] = [];
  const avoidFound: string[] = [];
  const n = product.nutrients;
  const ingredientsStr = [
    ...(product.ingredients || []),
    product.ingredientsRaw || '',
  ]
    .join(' ')
    .toLowerCase();

  // 1. Caffeine
  if (n.caffeine_mg !== undefined) {
    if (n.caffeine_mg > BREASTFEEDING_THRESHOLDS.caffeine.yellowMax) {
      results.push({
        ruleId: 'bf_caffeine',
        condition: 'Breastfeeding',
        nutrient: 'Caffeine',
        actualValue: n.caffeine_mg,
        limitValue: BREASTFEEDING_THRESHOLDS.caffeine.yellowMax,
        unit: 'mg',
        verdict: 'red',
        message: `High caffeine (${n.caffeine_mg}mg). Concentrates in breastmilk and may cause infant irritability or sleep disturbance.`,
      });
    } else if (n.caffeine_mg > BREASTFEEDING_THRESHOLDS.caffeine.greenMax) {
      results.push({
        ruleId: 'bf_caffeine',
        condition: 'Breastfeeding',
        nutrient: 'Caffeine',
        actualValue: n.caffeine_mg,
        limitValue: BREASTFEEDING_THRESHOLDS.caffeine.greenMax,
        unit: 'mg',
        verdict: 'yellow',
        message: `Contains caffeine (${n.caffeine_mg}mg). Watch infant response if consuming multiple caffeinated drinks.`,
      });
    }
  }

  // 2. Alcohol
  if (
    ingredientsStr.includes('alcohol') ||
    ingredientsStr.includes('ethanol') ||
    ingredientsStr.includes('liqueur')
  ) {
    results.push({
      ruleId: 'bf_alcohol',
      condition: 'Breastfeeding',
      nutrient: 'Alcohol',
      actualValue: 1,
      limitValue: 0,
      unit: 'present',
      verdict: 'red',
      message: 'Contains alcohol. Alcohol passes directly into breastmilk.',
    });
  }

  // 3. Peppermint / Sage / Antigalactagogues (may reduce milk supply)
  for (const avoid of BREASTFEEDING_THRESHOLDS.avoidIngredients) {
    if (ingredientsStr.includes(avoid)) {
      avoidFound.push(avoid);
      results.push({
        ruleId: `bf_avoid_${avoid.replace(/\s+/g, '_')}`,
        condition: 'Breastfeeding',
        nutrient: avoid,
        actualValue: 1,
        limitValue: 0,
        unit: 'present',
        verdict: 'yellow',
        message: `Contains "${avoid}", an herb noted by lactation specialists for potentially reducing breastmilk volume.`,
      });
    }
  }

  // 4. Mercury Fish
  for (const fish of PREGNANCY_THRESHOLDS.mercuryFish) {
    if (ingredientsStr.includes(fish)) {
      results.push({
        ruleId: 'bf_mercury_fish',
        condition: 'Breastfeeding',
        nutrient: fish,
        actualValue: 1,
        limitValue: 0,
        unit: 'present',
        verdict: 'red',
        message: `High-mercury fish "${fish}" can transfer through breast milk to your nursing infant.`,
      });
    }
  }

  return { results, avoidIngredients: avoidFound };
}
