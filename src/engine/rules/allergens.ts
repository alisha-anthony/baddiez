import { Product } from '../../types/product';
import { HealthProfile } from '../../types/profile';
import { AllergenMatch, TracesWarning } from '../../types/verdict';
import { ALLERGEN_SYNONYMS, normalizeOffTag } from '../allergenSynonyms';

export interface AllergenEvaluation {
  matches: AllergenMatch[];
  traces: TracesWarning[];
}

export function evaluateAllergens(
  product: Product,
  profile: HealthProfile
): AllergenEvaluation {
  const matches: AllergenMatch[] = [];
  const traces: TracesWarning[] = [];

  const userAllergens = new Set<string>(profile.allergies);
  const customAllergens = (profile.customAllergies || []).map((a) =>
    a.trim().toLowerCase()
  );

  if (userAllergens.size === 0 && customAllergens.length === 0) {
    return { matches, traces };
  }

  // 1. Check OFF Allergen Tags (e.g. "en:milk", "en:peanuts")
  for (const rawTag of product.allergenTags || []) {
    const normalizedTag = normalizeOffTag(rawTag);
    if (userAllergens.has(normalizedTag)) {
      matches.push({
        allergen: normalizedTag,
        synonym: rawTag,
        foundIn: `Packaged Allergen Declaration: ${rawTag}`,
      });
    }
    // Also check custom allergies against tag
    for (const custom of customAllergens) {
      if (normalizedTag.includes(custom)) {
        matches.push({
          allergen: custom,
          synonym: rawTag,
          foundIn: `Packaged Allergen Declaration: ${rawTag}`,
        });
      }
    }
  }

  // 2. Check Ingredients against Synonyms and Custom strings
  const ingredientTexts = [
    ...(product.ingredients || []),
    product.ingredientsRaw || '',
  ].map((t) => t.toLowerCase());

  // Sort synonym entries by length descending to match full phrases first
  const sortedSynonyms = Object.entries(ALLERGEN_SYNONYMS).sort(
    (a, b) => b[0].length - a[0].length
  );

  for (const text of ingredientTexts) {
    if (!text) continue;

    // Check synonym dictionary
    for (const [synonym, allergenCategory] of sortedSynonyms) {
      if (userAllergens.has(allergenCategory)) {
        // Regex word boundary matching to avoid false positives (e.g., "buttermilk" vs "butter")
        const regex = new RegExp(`\\b${synonym.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (regex.test(text)) {
          // Avoid duplicate report
          const alreadyMatched = matches.some(
            (m) => m.synonym.toLowerCase() === synonym.toLowerCase()
          );
          if (!alreadyMatched) {
            matches.push({
              allergen: allergenCategory,
              synonym: synonym,
              foundIn: `Ingredient list contains "${synonym}"`,
            });
          }
        }
      }
    }

    // Check custom allergens
    for (const custom of customAllergens) {
      if (custom && text.includes(custom)) {
        const alreadyMatched = matches.some((m) => m.synonym.toLowerCase() === custom);
        if (!alreadyMatched) {
          matches.push({
            allergen: custom,
            synonym: custom,
            foundIn: `Ingredient contains "${custom}"`,
          });
        }
      }
    }
  }

  // 3. Check Traces Tags ("May contain traces of...")
  for (const rawTrace of product.tracesTags || []) {
    const normalizedTrace = normalizeOffTag(rawTrace);
    if (userAllergens.has(normalizedTrace)) {
      traces.push({
        allergen: normalizedTrace,
        source: `Traces warning: ${rawTrace}`,
      });
    }
    for (const custom of customAllergens) {
      if (normalizedTrace.includes(custom)) {
        traces.push({
          allergen: custom,
          source: `Traces warning: ${rawTrace}`,
        });
      }
    }
  }

  return { matches, traces };
}
