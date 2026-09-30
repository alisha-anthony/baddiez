import { Product } from '../types/product';
import { HealthProfile } from '../types/profile';
import {
  VerdictResult,
  VerdictLevel,
  RuleResult,
  Alternative,
} from '../types/verdict';
import { RULES_VERSION } from './rulesConfig';
import { evaluateAllergens } from './rules/allergens';
import { evaluateLactose } from './rules/lactose';
import { evaluatePCOS } from './rules/pcos';
import { evaluatePregnancy } from './rules/pregnancy';
import { evaluateBreastfeeding } from './rules/breastfeeding';
import { evaluateDiabetesT1 } from './rules/diabetesType1';
import { evaluateDiabetesT2 } from './rules/diabetesType2';

export function runVerdictEngine(
  product: Product,
  profile: HealthProfile
): VerdictResult {
  const allRuleResults: RuleResult[] = [];
  const avoidIngredientsSet = new Set<string>();
  const softWarningsList: string[] = [];
  const missingNutrientsList: string[] = [];
  const consequencesList: string[] = [];

  // 1. Allergen Evaluation (Always checked first)
  const { matches: allergenMatches, traces: tracesWarnings } = evaluateAllergens(
    product,
    profile
  );

  // If there are allergen matches, record consequences
  if (allergenMatches.length > 0) {
    for (const match of allergenMatches) {
      consequencesList.push(
        `Immediate allergic reaction risk for "${match.allergen}" (${match.synonym}). Avoid consuming.`
      );
    }
  }

  // 2. Lactose Intolerance Evaluation
  if (profile.lactoseIntolerant) {
    const lactoseResults = evaluateLactose(product);
    allRuleResults.push(...lactoseResults);

    for (const r of lactoseResults) {
      if (r.verdict === 'red') {
        consequencesList.push(
          'Lactose overload: High likelihood of bloating, abdominal cramps, and acute gastric distress.'
        );
      }
    }
  }

  // 3. Life Stages Evaluation
  if (profile.lifeStages.includes('pcos')) {
    const { results, avoidIngredients } = evaluatePCOS(product);
    allRuleResults.push(...results);
    avoidIngredients.forEach((item) => avoidIngredientsSet.add(item));

    const redSugar = results.find((r) => r.ruleId === 'pcos_sugar' && r.verdict === 'red');
    if (redSugar) {
      consequencesList.push(
        'Elevated glycemic load for PCOS: Triggers rapid insulin surge, promoting androgen production, fatigue, and hormonal inflammation.'
      );
    }
  }

  if (profile.lifeStages.includes('pregnancy')) {
    const { results, softWarnings } = evaluatePregnancy(product);
    allRuleResults.push(...results);
    softWarnings.forEach((w) => softWarningsList.push(w));

    const redAlcohol = results.find((r) => r.ruleId === 'preg_alcohol');
    const redMercury = results.find((r) => r.ruleId === 'preg_mercury_fish');
    if (redAlcohol) consequencesList.push('Teratogenic risk: Alcohol can induce fetal alcohol spectrum disorders.');
    if (redMercury) consequencesList.push('Methylmercury bioaccumulation poses severe danger to fetal neurological development.');
  }

  if (profile.lifeStages.includes('breastfeeding')) {
    const { results, avoidIngredients } = evaluateBreastfeeding(product);
    allRuleResults.push(...results);
    avoidIngredients.forEach((item) => avoidIngredientsSet.add(item));

    const redCaff = results.find((r) => r.ruleId === 'bf_caffeine' && r.verdict === 'red');
    if (redCaff) {
      consequencesList.push(
        'High caffeine excretion into milk may lead to infant wakefulness, agitation, and digestive hyper-motility.'
      );
    }
  }

  // 4. Diabetes Evaluation
  if (profile.diabetesType === 'type1') {
    const t1Results = evaluateDiabetesT1(product);
    allRuleResults.push(...t1Results);

    const redSugar = t1Results.find((r) => r.ruleId === 't1d_sugar' && r.verdict === 'red');
    if (redSugar) {
      consequencesList.push(
        'Rapid postprandial glucose spike requiring substantial corrective insulin calculation.'
      );
    }
  } else if (profile.diabetesType === 'type2') {
    const { results, avoidIngredients } = evaluateDiabetesT2(product);
    allRuleResults.push(...results);
    avoidIngredients.forEach((item) => avoidIngredientsSet.add(item));

    const redSugar = results.find((r) => r.ruleId === 't2d_sugar' && r.verdict === 'red');
    if (redSugar) {
      consequencesList.push(
        'Marked glycemic excursion: Overwhelms peripheral insulin sensitivity, worsening blood glucose control.'
      );
    }
  }

  // 5. General check if user has NO active health conditions configured
  if (
    profile.lifeStages.length === 0 &&
    profile.diabetesType === 'none' &&
    !profile.lactoseIntolerant &&
    profile.allergies.length === 0 &&
    profile.customAllergies.length === 0
  ) {
    // Basic general wellness baseline
    const sugar = product.nutrients.sugar_g;
    if (sugar !== undefined) {
      if (sugar > 15) {
        allRuleResults.push({
          ruleId: 'general_sugar',
          condition: 'General Wellness',
          nutrient: 'Sugar',
          actualValue: sugar,
          limitValue: 10,
          unit: 'g',
          verdict: 'yellow',
          message: `Elevated sugar content (${sugar}g per 100g/ml).`,
        });
      } else {
        allRuleResults.push({
          ruleId: 'general_sugar',
          condition: 'General Wellness',
          nutrient: 'Sugar',
          actualValue: sugar,
          limitValue: 10,
          unit: 'g',
          verdict: 'green',
          message: `Sugar is ${sugar}g per 100g/ml, within moderate nutritional bounds.`,
        });
      }
    }
  }

  // Collect missing nutrients that were marked 'unknown'
  for (const r of allRuleResults) {
    if (r.verdict === 'unknown' && !missingNutrientsList.includes(r.nutrient)) {
      missingNutrientsList.push(r.nutrient);
    }
  }

  // 6. Overall Verdict Computation
  let overall: VerdictLevel;

  // Condition 1: Allergen match is an instant override to RED
  if (allergenMatches.length > 0) {
    overall = 'red';
  } else {
    const nonInformational = allRuleResults.filter((r) => !r.isInformational);
    const concreteResults = nonInformational.filter((r) => r.verdict !== 'unknown');
    const unknownResults = nonInformational.filter((r) => r.verdict === 'unknown');

    const hasIngredients =
      (product.ingredients && product.ingredients.length > 0) ||
      (product.ingredientsRaw && product.ingredientsRaw.trim().length > 0);

    const hasRed = concreteResults.some((r) => r.verdict === 'red');
    const hasYellow = concreteResults.some((r) => r.verdict === 'yellow');

    if (hasRed) {
      overall = 'red';
    } else if (hasYellow) {
      overall = 'yellow';
    } else if (concreteResults.length === 0 && unknownResults.length > 0) {
      // Missing all required information for the active conditions
      overall = 'insufficient_data';
    } else if (!hasIngredients && concreteResults.length === 0) {
      overall = 'insufficient_data';
    } else if (unknownResults.length > 0) {
      // Has some green results, but key required nutrients are missing -> Cannot be green!
      overall = 'yellow';
    } else if (concreteResults.length > 0 && concreteResults.every((r) => r.verdict === 'green')) {
      // If there are traces warnings, cap at yellow
      if (tracesWarnings.length > 0) {
        overall = 'yellow';
      } else if (!hasIngredients) {
        // Without ingredient list, cannot be green
        overall = 'insufficient_data';
      } else {
        overall = 'green';
      }
    } else if (tracesWarnings.length > 0) {
      overall = 'yellow';
    } else {
      // Fallback
      overall = hasIngredients ? 'green' : 'insufficient_data';
    }
  }

  // 7. Calculate Health Alignment Score (0-100)
  let score = 100;
  if (overall === 'red') {
    score = Math.max(15, 45 - allergenMatches.length * 20 - allRuleResults.filter((r) => r.verdict === 'red').length * 10);
  } else if (overall === 'yellow') {
    score = 70 - allRuleResults.filter((r) => r.verdict === 'yellow').length * 5;
  } else if (overall === 'insufficient_data') {
    score = 50;
  } else {
    score = 95;
  }

  // 8. Generate Wholesome Generic Alternatives if RED
  let alternatives: Alternative[] | undefined = undefined;
  if (overall === 'red') {
    alternatives = generateGenericAlternatives(profile, product);
  }

  return {
    overall,
    score: Math.max(0, Math.min(100, score)),
    allergenMatches,
    tracesWarnings,
    ruleResults: allRuleResults,
    avoidIngredients: Array.from(avoidIngredientsSet),
    missingNutrients: missingNutrientsList,
    softWarnings: softWarningsList,
    consequences: consequencesList,
    alternatives,
    rulesVersion: RULES_VERSION,
  };
}

/**
 * Provides generic, wholesome nutritional alternatives rather than fabricated brand names.
 */
function generateGenericAlternatives(
  profile: HealthProfile,
  product: Product
): Alternative[] {
  const list: Alternative[] = [];
  const cat = (product.category || product.name || '').toLowerCase();

  if (profile.lifeStages.includes('pcos') || profile.diabetesType !== 'none') {
    if (cat.includes('snack') || cat.includes('bar') || cat.includes('cookie') || cat.includes('candy') || cat.includes('chocolate')) {
      list.push(
        {
          name: 'Handful of Raw Walnuts or Almonds with 85%+ Dark Chocolate',
          type: 'generic',
          description: 'High in healthy monounsaturated fats and fiber with minimal insulin impact.',
        },
        {
          name: 'Roasted Chickpeas with Smoked Paprika & Sea Salt',
          type: 'generic',
          description: 'Crunchy snack packed with complex low-glycemic carbohydrates and slow-digesting protein.',
        }
      );
    } else if (cat.includes('drink') || cat.includes('soda') || cat.includes('juice') || cat.includes('beverage')) {
      list.push(
        {
          name: 'Infused Sparkling Water with Fresh Mint & Lime',
          type: 'generic',
          description: 'Zero glycemic response, 100% natural, refreshing hydration.',
        },
        {
          name: 'Unsweetened Iced Hibiscus or Green Tea',
          type: 'generic',
          description: 'Rich in polyphenols that support insulin sensitivity and cellular repair.',
        }
      );
    }
  }

  if (profile.lactoseIntolerant) {
    list.push(
      {
        name: 'Fortified Unsweetened Almond or Oat Milk',
        type: 'generic',
        description: 'Plant-based dairy alternative enriched with calcium and vitamin D.',
      },
      {
        name: 'Coconut-Milk Greek-Style Fermented Yogurt',
        type: 'generic',
        description: 'Dairy-free, creamy, with live active probiotic cultures for gut health.',
      }
    );
  }

  if (list.length === 0) {
    list.push(
      {
        name: 'Whole Fresh Fruit with Sunflower Seed Butter',
        type: 'generic',
        description: 'Naturally sweetened, fiber-rich paired with stabilizing healthy fats.',
      },
      {
        name: 'Raw Veggie Sticks with Olive Oil Hummus',
        type: 'generic',
        description: 'Nutrient-dense, low sodium, zero artificial preservatives.',
      }
    );
  }

  return list.slice(0, 3);
}
