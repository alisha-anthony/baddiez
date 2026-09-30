import { Allergen } from '../types/profile';

/**
 * Maps ingredient keywords and chemical derivatives to standardized allergens.
 */
export const ALLERGEN_SYNONYMS: Record<string, Allergen> = {
  // Milk / Dairy
  milk: 'milk',
  casein: 'milk',
  caseinate: 'milk',
  'sodium caseinate': 'milk',
  sodium_caseinate: 'milk',
  whey: 'milk',
  'whey protein': 'milk',
  lactose: 'milk',
  lactalbumin: 'milk',
  lactoglobulin: 'milk',
  'milk solids': 'milk',
  'milk powder': 'milk',
  'dry milk': 'milk',
  'skim milk': 'milk',
  cream: 'milk',
  buttermilk: 'milk',
  'milk fat': 'milk',
  'milk protein': 'milk',
  cheese: 'milk',
  butter: 'milk',
  ghee: 'milk',
  yogurt: 'milk',
  curd: 'milk',

  // Wheat & Gluten
  wheat: 'wheat_gluten',
  gluten: 'wheat_gluten',
  barley: 'wheat_gluten',
  rye: 'wheat_gluten',
  spelt: 'wheat_gluten',
  kamut: 'wheat_gluten',
  triticale: 'wheat_gluten',
  semolina: 'wheat_gluten',
  durum: 'wheat_gluten',
  couscous: 'wheat_gluten',
  bulgur: 'wheat_gluten',
  seitan: 'wheat_gluten',
  'wheat starch': 'wheat_gluten',
  'wheat bran': 'wheat_gluten',
  farro: 'wheat_gluten',
  malt: 'wheat_gluten',
  'malt extract': 'wheat_gluten',

  // Eggs
  egg: 'eggs',
  eggs: 'eggs',
  albumin: 'eggs',
  ovalbumin: 'eggs',
  globulin: 'eggs',
  ovoglobulin: 'eggs',
  lysozyme: 'eggs',
  mayonnaise: 'eggs',
  meringue: 'eggs',
  'egg white': 'eggs',
  'egg yolk': 'eggs',

  // Soy
  soy: 'soy',
  soya: 'soy',
  soybean: 'soy',
  edamame: 'soy',
  miso: 'soy',
  tempeh: 'soy',
  tofu: 'soy',
  'soy lecithin': 'soy',
  'soy protein': 'soy',
  'soy sauce': 'soy',
  tamari: 'soy',

  // Peanuts
  peanut: 'peanuts',
  peanuts: 'peanuts',
  arachis: 'peanuts',
  groundnut: 'peanuts',
  'ground nuts': 'peanuts',
  'monkey nut': 'peanuts',
  'peanut butter': 'peanuts',
  'peanut oil': 'peanuts',

  // Tree Nuts
  almond: 'tree_nuts',
  almonds: 'tree_nuts',
  cashew: 'tree_nuts',
  cashews: 'tree_nuts',
  walnut: 'tree_nuts',
  walnuts: 'tree_nuts',
  pecan: 'tree_nuts',
  pecans: 'tree_nuts',
  pistachio: 'tree_nuts',
  pistachios: 'tree_nuts',
  macadamia: 'tree_nuts',
  hazelnut: 'tree_nuts',
  hazelnuts: 'tree_nuts',
  filbert: 'tree_nuts',
  'brazil nut': 'tree_nuts',
  'brazil nuts': 'tree_nuts',
  chestnut: 'tree_nuts',
  chestnuts: 'tree_nuts',
  praline: 'tree_nuts',
  marzipan: 'tree_nuts',
  'tree nut': 'tree_nuts',
  'tree nuts': 'tree_nuts',

  // Fish
  fish: 'fish',
  anchovy: 'fish',
  anchovies: 'fish',
  cod: 'fish',
  salmon: 'fish',
  tuna: 'fish',
  tilapia: 'fish',
  haddock: 'fish',
  trout: 'fish',
  halibut: 'fish',
  mackerel: 'fish',
  sardine: 'fish',
  sardines: 'fish',
  'fish sauce': 'fish',
  'fish oil': 'fish',
  surimi: 'fish',

  // Shellfish
  shellfish: 'shellfish',
  crab: 'shellfish',
  lobster: 'shellfish',
  shrimp: 'shellfish',
  prawn: 'shellfish',
  prawns: 'shellfish',
  crayfish: 'shellfish',
  crawfish: 'shellfish',
  scallop: 'shellfish',
  scallops: 'shellfish',
  clam: 'shellfish',
  clams: 'shellfish',
  oyster: 'shellfish',
  oysters: 'shellfish',
  mussel: 'shellfish',
  mussels: 'shellfish',
  squid: 'shellfish',
  calamari: 'shellfish',
  octopus: 'shellfish',
  crustacean: 'shellfish',
  mollusc: 'shellfish',

  // Sesame
  sesame: 'sesame',
  'sesame seed': 'sesame',
  'sesame seeds': 'sesame',
  tahini: 'sesame',
  halvah: 'sesame',
  'sesame oil': 'sesame',
  gingelly: 'sesame',
  til: 'sesame',
};

/**
 * Strips Open Food Facts language prefixes such as "en:milk" -> "milk"
 */
export function normalizeOffTag(tag: string): string {
  const cleaned = tag.toLowerCase().replace(/^[a-z]{2}:/, '').trim();
  // Map common OFF allergen tags
  if (cleaned === 'gluten') return 'wheat_gluten';
  if (cleaned === 'nuts') return 'tree_nuts';
  if (cleaned === 'crustaceans') return 'shellfish';
  if (cleaned === 'molluscs') return 'shellfish';
  if (cleaned === 'soybeans') return 'soy';
  return cleaned;
}
