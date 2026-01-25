/**
 * Categorie di età per il canottaggio
 */
export enum AgeCategory {
  ALLIEVI_A = 'ALLIEVI_A',           // 10 anni
  ALLIEVI_B = 'ALLIEVI_B',           // 11-12 anni
  ALLIEVI_C = 'ALLIEVI_C',           // 13 anni
  CADETTI = 'CADETTI',               // 14 anni
  UNDER_17 = 'UNDER_17',             // 15-16 anni (ex Ragazzi)
  UNDER_19 = 'UNDER_19',             // 17-18 anni (Junior)
  UNDER_23 = 'UNDER_23',             // 19-22 anni
  SENIOR = 'SENIOR',                 // 23-26 anni
  SENIOR_MASTER = 'SENIOR_MASTER',   // 27+ anni
}

/**
 * Mappa delle categorie con le relative informazioni
 */
export const CATEGORY_INFO: Record<
  AgeCategory,
  { label: string; description: string; minAge: number; maxAge: number | null }
> = {
  [AgeCategory.ALLIEVI_A]: {
    label: 'Allievi A',
    description: 'primo ingresso in agonismo giovanile',
    minAge: 10,
    maxAge: 10,
  },
  [AgeCategory.ALLIEVI_B]: {
    label: 'Allievi B',
    description: 'spesso suddivisi in B1/B2',
    minAge: 11,
    maxAge: 12,
  },
  [AgeCategory.ALLIEVI_C]: {
    label: 'Allievi C',
    description: '',
    minAge: 13,
    maxAge: 13,
  },
  [AgeCategory.CADETTI]: {
    label: 'Cadetti',
    description: '',
    minAge: 14,
    maxAge: 14,
  },
  [AgeCategory.UNDER_17]: {
    label: 'Under 17 (Ragazzi)',
    description: 'ex "Ragazzi"',
    minAge: 15,
    maxAge: 16,
  },
  [AgeCategory.UNDER_19]: {
    label: 'Under 19 (Junior)',
    description: 'anche detta categoria Juniors',
    minAge: 17,
    maxAge: 18,
  },
  [AgeCategory.UNDER_23]: {
    label: 'Under 23',
    description: 'ex Senior B',
    minAge: 19,
    maxAge: 22,
  },
  [AgeCategory.SENIOR]: {
    label: 'Senior',
    description: 'categoria aperta dai 23 anni in su',
    minAge: 23,
    maxAge: 26,
  },
  [AgeCategory.SENIOR_MASTER]: {
    label: 'Senior/Master',
    description: '27 anni in su',
    minAge: 27,
    maxAge: null, // nessun limite superiore
  },
};

/**
 * Calcola l'età in base alla data di nascita
 * @param dateOfBirth Data di nascita
 * @returns Età in anni
 */
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Determina la categoria in base all'età
 * @param dateOfBirth Data di nascita
 * @returns Categoria di appartenenza
 */
export function getCategoryByAge(dateOfBirth: Date): AgeCategory {
  const age = calculateAge(dateOfBirth);

  if (age === 10) return AgeCategory.ALLIEVI_A;
  if (age >= 11 && age <= 12) return AgeCategory.ALLIEVI_B;
  if (age === 13) return AgeCategory.ALLIEVI_C;
  if (age === 14) return AgeCategory.CADETTI;
  if (age >= 15 && age <= 16) return AgeCategory.UNDER_17;
  if (age >= 17 && age <= 18) return AgeCategory.UNDER_19;
  if (age >= 19 && age <= 22) return AgeCategory.UNDER_23;
  if (age >= 23 && age <= 26) return AgeCategory.SENIOR;
  if (age >= 27) return AgeCategory.SENIOR_MASTER;

  // Default per età < 10
  return AgeCategory.ALLIEVI_A;
}

/**
 * Ottiene le informazioni della categoria
 * @param category Categoria
 * @returns Informazioni sulla categoria
 */
export function getCategoryInfo(category: AgeCategory) {
  return CATEGORY_INFO[category];
}

/**
 * Ottiene il label della categoria per una data di nascita
 * @param dateOfBirth Data di nascita
 * @returns Label della categoria
 */
export function getCategoryLabel(dateOfBirth: Date): string {
  const category = getCategoryByAge(dateOfBirth);
  return CATEGORY_INFO[category].label;
}
