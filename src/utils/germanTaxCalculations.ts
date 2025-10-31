/**
 * German Tax Calculations for Investment Products
 * Includes Kapitalertragssteuer, Vorabpauschale, and Ertragsanteil calculations
 */

import {
  CAPITAL_GAINS_TAX_RATE_PERCENT,
  GOVERNMENT_PARAMETERS_2025,
  PARTIAL_EXEMPTION_PERCENT,
} from "@/data/governmentParameters";

export interface TaxSettings {
  capitalGainsTaxRate: number; // 25% + Soli (26.375%)
  churchTaxRate: number; // 8-9% additional
  allowance: number; // Sparer-Pauschbetrag (Freistellungsauftrag)
  baseRate: number; // Basiszins für Vorabpauschale
  hasChurchTax: boolean;
  useHalfIncomeTaxation?: boolean; // Halbeinkünfteverfahren (nur wenn 12/62-Regel erfüllt)
  partialExemption?: number; // Teilfreistellung (30% für Aktienfonds, 15% Mischfonds)
  contractStartAge?: number; // Vertragsbegin-Alter (für 12/62-Regel)
}

export interface InvestmentData {
  initialValue: number;
  currentValue: number;
  yearlyContributions: number;
  managementFee: number;
  frontLoad: number;
}

export interface PensionData {
  monthlyPension: number;
  totalContributions: number;
  guaranteedPension: number;
  age: number;
}

/**
 * Calculate effective tax rate including church tax
 */
export function getEffectiveTaxRate(settings: TaxSettings): number {
  const baseTaxRate = settings.capitalGainsTaxRate;
  if (settings.hasChurchTax) {
    return baseTaxRate + (baseTaxRate * settings.churchTaxRate / 100);
  }
  return baseTaxRate;
}

/**
 * Calculate Vorabpauschale (advance lump sum) for fund investments
 * This is a German tax concept where investors pay tax on theoretical gains
 */
export function calculateVorabpauschale(
  investmentValue: number,
  baseRate: number,
  managementFee: number,
  actualGain: number
): number {
  // Vorabpauschale = Investment Value * (Base Rate - Management Fee) * 0.7
  const theoreticalGain = investmentValue * (baseRate - managementFee) / 100 * 0.7;
  
  // Vorabpauschale cannot exceed actual gains
  return Math.max(0, Math.min(theoreticalGain, actualGain));
}

/**
 * Calculate taxable amount after applying Sparer-Pauschbetrag (allowance)
 */
export function applyAllowance(taxableAmount: number, allowance: number, usedAllowance: number = 0): {
  taxableAfterAllowance: number;
  allowanceUsed: number;
  remainingAllowance: number;
} {
  const availableAllowance = Math.max(0, allowance - usedAllowance);
  const allowanceUsed = Math.min(taxableAmount, availableAllowance);
  const taxableAfterAllowance = Math.max(0, taxableAmount - allowanceUsed);
  
  return {
    taxableAfterAllowance,
    allowanceUsed,
    remainingAllowance: availableAllowance - allowanceUsed
  };
}

/**
 * Calculate annual tax for fund investments including Vorabpauschale
 */
export function calculateFundTax(
  investmentData: InvestmentData,
  settings: TaxSettings,
  usedAllowance: number = 0
): {
  vorabpauschale: number;
  taxOnVorabpauschale: number;
  allowanceUsed: number;
  remainingAllowance: number;
  totalTax: number;
} {
  const actualGain = Math.max(0, investmentData.currentValue - investmentData.initialValue - investmentData.yearlyContributions);
  
  // Calculate Vorabpauschale
  const vorabpauschale = calculateVorabpauschale(
    investmentData.currentValue,
    settings.baseRate,
    investmentData.managementFee,
    actualGain
  );
  
  // Apply allowance to Vorabpauschale
  const allowanceResult = applyAllowance(vorabpauschale, settings.allowance, usedAllowance);
  
  // Calculate tax on remaining amount after allowance
  const effectiveTaxRate = getEffectiveTaxRate(settings);
  const taxOnVorabpauschale = allowanceResult.taxableAfterAllowance * effectiveTaxRate / 100;
  
  return {
    vorabpauschale,
    taxOnVorabpauschale,
    allowanceUsed: allowanceResult.allowanceUsed,
    remainingAllowance: allowanceResult.remainingAllowance,
    totalTax: taxOnVorabpauschale
  };
}

/**
 * Calculate Ertragsanteil for pension payments
 * The taxable portion of pension payments based on age when payments start
 * According to §22 No. 1 Sentence 3 Letter a EStG (2024)
 */
export function getErtragsanteil(ageAtPaymentStart: number): number {
  // Vollständige Ertragsanteils-Tabelle gemäß §22 EStG
  if (ageAtPaymentStart >= 68) return 17;
  if (ageAtPaymentStart === 67) return 17;
  if (ageAtPaymentStart === 66) return 18;
  if (ageAtPaymentStart === 65) return 18;
  if (ageAtPaymentStart === 64) return 19;
  if (ageAtPaymentStart === 63) return 19;
  if (ageAtPaymentStart === 62) return 20;
  if (ageAtPaymentStart === 61) return 21;
  if (ageAtPaymentStart === 60) return 22;
  if (ageAtPaymentStart === 59) return 23;
  if (ageAtPaymentStart === 58) return 24;
  if (ageAtPaymentStart === 57) return 25;
  if (ageAtPaymentStart === 56) return 26;
  if (ageAtPaymentStart === 55) return 27;
  if (ageAtPaymentStart === 54) return 28;
  if (ageAtPaymentStart === 53) return 29;
  if (ageAtPaymentStart === 52) return 30;
  if (ageAtPaymentStart === 51) return 31;
  if (ageAtPaymentStart === 50) return 32;
  if (ageAtPaymentStart === 49) return 33;
  if (ageAtPaymentStart === 48) return 34;
  if (ageAtPaymentStart === 47) return 35;
  if (ageAtPaymentStart <= 46) return 36; // 36% für Alter 0-46
  return 17; // Default (sollte nie erreicht werden)
}

/**
 * Calculate annual tax on pension payments
 */
export function calculatePensionTax(
  pensionData: PensionData,
  settings: TaxSettings,
  personalTaxRate: number = 25 // Assuming 25% personal tax rate
): {
  ertragsanteil: number;
  taxableAmount: number;
  totalTax: number;
} {
  const ertragsanteil = getErtragsanteil(pensionData.age);
  const annualPension = pensionData.monthlyPension * 12;
  const taxableAmount = annualPension * ertragsanteil / 100;
  
  // Pension payments are taxed at personal tax rate, not capital gains rate
  const totalTax = taxableAmount * personalTaxRate / 100;
  
  return {
    ertragsanteil,
    taxableAmount,
    totalTax
  };
}

/**
 * Calculate final tax when selling fund investments
 */
export function calculateFinalSaleTax(
  totalGains: number,
  vorabpauschaleAlreadyPaid: number,
  settings: TaxSettings,
  usedAllowance: number = 0
): {
  remainingTaxableGains: number;
  allowanceUsed: number;
  finalTax: number;
} {
  // Remaining taxable gains after deducting already taxed Vorabpauschale
  const remainingTaxableGains = Math.max(0, totalGains - vorabpauschaleAlreadyPaid);
  
  // Apply remaining allowance
  const allowanceResult = applyAllowance(remainingTaxableGains, settings.allowance, usedAllowance);
  
  // Calculate final tax
  const effectiveTaxRate = getEffectiveTaxRate(settings);
  const finalTax = allowanceResult.taxableAfterAllowance * effectiveTaxRate / 100;
  
  return {
    remainingTaxableGains,
    allowanceUsed: allowanceResult.allowanceUsed,
    finalTax
  };
}

/**
 * Check if 12/62 rule (§20 Abs. 1 Nr. 6 EStG) applies
 * Requires BOTH conditions:
 * - Contract duration of at least 12 years
 * - Payout starting at age 62 or later
 */
export function qualifiesFor1262Rule(
  contractStartAge: number,
  payoutStartAge: number
): boolean {
  const contractDuration = payoutStartAge - contractStartAge;
  return contractDuration >= 12 && payoutStartAge >= 62;
}

/**
 * Calculate tax with Halbeinkünfteverfahren (Half-Income Taxation) from age 62
 * Only applies if 12/62 rule is met: 12 years duration AND payout from age 62+
 * When qualified: Only 50% of GAINS (not total) are taxable
 */
export function applyHalfIncomeTaxation(
  taxableIncome: number,
  age: number,
  useHalfIncome: boolean = false,
  contractStartAge?: number
): number {
  // Only apply if explicitly enabled AND 12/62 rule is met
  if (useHalfIncome && contractStartAge && qualifiesFor1262Rule(contractStartAge, age)) {
    return taxableIncome * 0.5; // Only 50% of gains taxable
  }
  return taxableIncome;
}

/**
 * Apply Teilfreistellung (Partial Exemption) - typically 15% for equity funds
 * This reduces the taxable gains
 */
export function applyPartialExemption(
  gains: number,
  exemptionRate: number = 0.15
): {
  exemptedAmount: number;
  taxableAmount: number;
} {
  const exemptedAmount = gains * exemptionRate;
  const taxableAmount = gains * (1 - exemptionRate);

  return {
    exemptedAmount,
    taxableAmount
  };
}

/**
 * Calculate tax on pension payout with all applicable rules
 * Includes: Freistellungsauftrag, Halbeinkünfteverfahren, Teilfreistellung
 */
export function calculatePayoutTax(
  totalGains: number,
  age: number,
  settings: TaxSettings,
  usedAllowance: number = 0
): {
  originalGains: number;
  afterPartialExemption: number;
  afterHalfIncomeTaxation: number;
  afterAllowance: number;
  totalTax: number;
  effectiveTaxRate: number;
} {
  const partialExemptionRate = settings.partialExemption || 0.15;

  // Step 1: Apply Teilfreistellung (only on gains/Erträge)
  const { taxableAmount: afterPartialExemption } = applyPartialExemption(
    totalGains,
    partialExemptionRate
  );

  // Step 2: Apply Halbeinkünfteverfahren if 12/62 rule is met
  const afterHalfIncome = applyHalfIncomeTaxation(
    afterPartialExemption,
    age,
    settings.useHalfIncomeTaxation,
    settings.contractStartAge // Pass contract start age for 12/62 check
  );

  // Step 3: Apply Freistellungsauftrag (allowance)
  const { taxableAfterAllowance: afterAllowance } = applyAllowance(
    afterHalfIncome,
    settings.allowance,
    usedAllowance
  );

  // Step 4: Calculate final tax
  const effectiveTaxRate = getEffectiveTaxRate(settings);
  const totalTax = afterAllowance * effectiveTaxRate / 100;

  return {
    originalGains: totalGains,
    afterPartialExemption,
    afterHalfIncomeTaxation: afterHalfIncome,
    afterAllowance,
    totalTax,
    effectiveTaxRate: (totalTax / totalGains) * 100
  };
}

/**
 * Calculate monthly payout after taxes
 */
export function calculateMonthlyPayoutAfterTax(
  annualWithdrawal: number,
  annualGains: number,
  age: number,
  settings: TaxSettings
): {
  annualGross: number;
  annualTax: number;
  annualNet: number;
  monthlyNet: number;
} {
  const taxResult = calculatePayoutTax(annualGains, age, settings);

  const annualGross = annualWithdrawal;
  const annualTax = taxResult.totalTax;
  const annualNet = annualGross - annualTax;
  const monthlyNet = annualNet / 12;

  return {
    annualGross,
    annualTax,
    annualNet,
    monthlyNet
  };
}

/**
 * Default German tax settings for 2025
 */
export const DEFAULT_TAX_SETTINGS: TaxSettings = {
  capitalGainsTaxRate: CAPITAL_GAINS_TAX_RATE_PERCENT,
  churchTaxRate: GOVERNMENT_PARAMETERS_2025.tax.churchTaxDefaultRate * 100,
  allowance: GOVERNMENT_PARAMETERS_2025.tax.sparerPauschbetragSingle,
  baseRate: GOVERNMENT_PARAMETERS_2025.tax.vorabpauschaleBasiszins * 100,
  hasChurchTax: false,
  useHalfIncomeTaxation: false, // Halbeinkünfteverfahren ab 62
  partialExemption: PARTIAL_EXEMPTION_PERCENT // 30% Teilfreistellung für Aktienfonds
};
