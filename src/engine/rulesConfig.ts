/**
 * SHE Scan Rules Configuration
 * Version: 1.0.0-draft
 *
 * ⚠️ IMPORTANT CLINICAL NOTICE:
 * All threshold values below are placeholder thresholds compiled from public nutritional guidelines
 * (WHO, FDA, ADA, ACOG) and are PENDING review and validation by a licensed Registered Dietitian (RD).
 * SHE Scan provides general nutritional guidance and does not replace professional medical advice.
 */

export const RULES_VERSION = '1.0.0-draft';

export interface NutrientThreshold {
  greenMax: number;
  yellowMax: number;
  source: string;
  unit: string;
}

export const PCOS_THRESHOLDS = {
  sugar: {
    greenMax: 5, // <= 5g/100g
    yellowMax: 10, // 5-10g/100g, > 10g is Red
    source: 'General Low-Glycemic Index recommendations for insulin resistance in PCOS',
    unit: 'g',
  },
  saturatedFat: {
    greenMax: 2,
    yellowMax: 5,
    source: 'American Heart Association guidelines for cardiovascular health in PCOS',
    unit: 'g',
  },
  transFat: {
    greenMax: 0,
    yellowMax: 0.1,
    source: 'WHO recommendation: Industrial trans fats should be strictly 0g',
    unit: 'g',
  },
  sodium: {
    greenMax: 300,
    yellowMax: 600,
    source: 'FDA Daily Value split per meal portion (normalized to 100g)',
    unit: 'mg',
  },
  avoidIngredients: [
    'high fructose corn syrup',
    'corn syrup',
    'hydrogenated oil',
    'partially hydrogenated',
    'aspartame',
    'sucralose',
    'acesulfame potassium',
    'bleached flour',
    'refined white flour',
  ],
};

export const PREGNANCY_THRESHOLDS = {
  caffeine: {
    greenMax: 0,
    yellowMax: 50, // Per 100ml / 100g
    source: 'ACOG: Limit total daily intake to <200mg; <50mg per single packaged item',
    unit: 'mg',
  },
  sodium: {
    greenMax: 400,
    yellowMax: 600,
    source: 'General prenatal dietary sodium moderation to mitigate gestational hypertension',
    unit: 'mg',
  },
  transFat: {
    greenMax: 0,
    yellowMax: 0.1,
    source: 'WHO Global elimination of industrial trans fatty acids',
    unit: 'g',
  },
  mercuryFish: [
    'swordfish',
    'king mackerel',
    'tilefish',
    'shark',
    'bigeye tuna',
    'marlin',
    'orange roughy',
  ],
  // Note: Soft warnings for unpasteurized or retinol excess since labels don't always declare exact microgram amounts
  softWarningIngredients: [
    'unpasteurized',
    'raw milk',
    'raw egg',
    'retinol',
    'retinyl palmitate',
    'saccharin',
    'licorice root',
  ],
};

export const BREASTFEEDING_THRESHOLDS = {
  caffeine: {
    greenMax: 30,
    yellowMax: 100,
    source: 'Academy of Breastfeeding Medicine / La Leche League guidelines',
    unit: 'mg',
  },
  alcoholMax: 0, // Zero tolerance for alcohol during breastfeeding
  avoidIngredients: [
    'alcohol',
    'ethanol',
    'peppermint oil', // excess peppermint may reduce breastmilk supply
    'sage extract',
  ],
};

export const DIABETES_T1_THRESHOLDS = {
  addedSugar: {
    greenMax: 5,
    yellowMax: 15,
    source: 'ADA Standards of Medical Care in Diabetes: Added sugar moderation',
    unit: 'g',
  },
  fiber: {
    greenMin: 3, // positive nutrient
    source: 'ADA guidance: High fiber assists in blunting postprandial glucose spikes',
    unit: 'g',
  },
  transFat: {
    greenMax: 0,
    yellowMax: 0.1,
    source: 'WHO / ADA cardiovascular prevention',
    unit: 'g',
  },
  // Total carbohydrates are tracked as informational for insulin carb-counting!
};

export const DIABETES_T2_THRESHOLDS = {
  sugar: {
    greenMax: 3,
    yellowMax: 8,
    source: 'ADA Nutrition Therapy for Adults With Diabetes or Prediabetes',
    unit: 'g',
  },
  carbs: {
    greenMax: 12,
    yellowMax: 25,
    source: 'Low-glycemic and carbohydrate-aware portion guidelines for T2D',
    unit: 'g',
  },
  fiber: {
    greenMin: 4,
    source: 'ADA recommendation for glycemic stabilization through soluble fiber',
    unit: 'g',
  },
  saturatedFat: {
    greenMax: 2,
    yellowMax: 5,
    source: 'AHA/ADA cardiovascular protection for metabolic syndrome',
    unit: 'g',
  },
  sodium: {
    greenMax: 300,
    yellowMax: 600,
    source: 'ADA blood pressure management for diabetic patients',
    unit: 'mg',
  },
  avoidIngredients: [
    'high fructose corn syrup',
    'glucose-fructose syrup',
    'maltodextrin',
    'hydrogenated vegetable oil',
    'fruit juice concentrate',
  ],
};

export const LACTOSE_CLASSIFICATION = {
  redIngredients: [
    'milk',
    'whole milk',
    'skim milk',
    'milk powder',
    'dry milk',
    'whey',
    'whey protein',
    'cream',
    'condensed milk',
    'evaporated milk',
    'ice cream',
    'buttermilk',
    'milk solids',
    'curds',
    'lactose',
    'caseinate',
  ],
  yellowIngredients: [
    'butter',
    'ghee',
    'clarified butter',
    'cheddar',
    'parmesan',
    'swiss cheese',
    'aged cheese',
    'hard cheese',
    'lactose-free milk',
    'lactose-free dairy',
  ],
};
