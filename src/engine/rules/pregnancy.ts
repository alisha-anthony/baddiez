import { Product } from '../../types/product';
import { RuleResult } from '../../types/verdict';
import { PREGNANCY_THRESHOLDS } from '../rulesConfig';

export function evaluatePregnancy(product: Product): {
  results: RuleResult[];
  softWarnings: string[];
} {
  const results: RuleResult[] = [];
  const softWarnings: string[] = [];
  const n = product.nutrients;
  const ingredientsStr = [
    ...(product.ingredients || []),
    product.ingredientsRaw || '',
  ]
    .join(' ')
    .toLowerCase();

  // 1. Caffeine Check
  if (n.caffeine_mg !== undefined) {
    if (n.caffeine_mg > PREGNANCY_THRESHOLDS.caffeine.yellowMax) {
      results.push({
        ruleId: 'preg_caffeine',
        condition: 'Pregnancy',
        nutrient: 'Caffeine',
        actualValue: n.caffeine_mg,
        limitValue: PREGNANCY_THRESHOLDS.caffeine.yellowMax,
        unit: 'mg',
        verdict: 'red',
        message: `High caffeine content (${n.caffeine_mg}mg). Exceeds prenatal single-item threshold.`,
      });
    } else if (n.caffeine_mg > PREGNANCY_THRESHOLDS.caffeine.greenMax) {
      results.push({
        ruleId: 'preg_caffeine',
        condition: 'Pregnancy',
        nutrient: 'Caffeine',
        actualValue: n.caffeine_mg,
        limitValue: PREGNANCY_THRESHOLDS.caffeine.greenMax,
        unit: 'mg',
        verdict: 'yellow',
        message: `Contains caffeine (${n.caffeine_mg}mg). Monitor total daily cumulative caffeine to remain under 200mg.`,
      });
    }
  }

  // 2. Mercury Fish Check
  for (const fish of PREGNANCY_THRESHOLDS.mercuryFish) {
    if (ingredientsStr.includes(fish)) {
      results.push({
        ruleId: 'preg_mercury_fish',
        condition: 'Pregnancy',
        nutrient: fish,
        actualValue: 1,
        limitValue: 0,
        unit: 'present',
        verdict: 'red',
        message: `Contains high-mercury species "${fish}". Poses severe neurodevelopmental risk to the fetus.`,
      });
    }
  }

  // 3. Alcohol check
  if (
    ingredientsStr.includes('alcohol') ||
    ingredientsStr.includes('ethanol') ||
    ingredientsStr.includes('liqueur') ||
    ingredientsStr.includes('wine')
  ) {
    results.push({
      ruleId: 'preg_alcohol',
      condition: 'Pregnancy',
      nutrient: 'Alcohol',
      actualValue: 1,
      limitValue: 0,
      unit: 'present',
      verdict: 'red',
      message: 'Contains alcohol. No amount is considered safe during pregnancy.',
    });
  }

  // 4. Sodium Check
  if (n.sodium_mg !== undefined) {
    if (n.sodium_mg > PREGNANCY_THRESHOLDS.sodium.yellowMax) {
      results.push({
        ruleId: 'preg_sodium',
        condition: 'Pregnancy',
        nutrient: 'Sodium',
        actualValue: n.sodium_mg,
        limitValue: PREGNANCY_THRESHOLDS.sodium.greenMax,
        unit: 'mg',
        verdict: 'red',
        message: `High sodium (${n.sodium_mg}mg). Risk of exacerbating gestational hypertension or edema.`,
      });
    } else if (n.sodium_mg > PREGNANCY_THRESHOLDS.sodium.greenMax) {
      results.push({
        ruleId: 'preg_sodium',
        condition: 'Pregnancy',
        nutrient: 'Sodium',
        actualValue: n.sodium_mg,
        limitValue: PREGNANCY_THRESHOLDS.sodium.greenMax,
        unit: 'mg',
        verdict: 'yellow',
        message: `Moderate sodium (${n.sodium_mg}mg).`,
      });
    }
  }

  // 5. Soft Warnings for Undetectable items (Unpasteurized, Vitamin A excess)
  for (const item of PREGNANCY_THRESHOLDS.softWarningIngredients) {
    if (ingredientsStr.includes(item)) {
      softWarnings.push(
        `Precautionary note: Contains "${item}". Verify that dairy/egg items are pasteurized or discuss high retinol levels with your doctor.`
      );
      results.push({
        ruleId: `preg_soft_${item.replace(/\s+/g, '_')}`,
        condition: 'Pregnancy',
        nutrient: item,
        actualValue: 0.5,
        limitValue: 0,
        unit: 'precaution',
        verdict: 'yellow',
        message: `Precautionary notice: "${item}" may pose bacterial (Listeria) or retinol risks if unverified.`,
        softWarning: true,
      });
    }
  }

  return { results, softWarnings };
}
