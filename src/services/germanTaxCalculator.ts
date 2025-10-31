/**
 * German Tax Calculator Service
 * 
 * Implements comprehensive German tax calculations for:
 * - ETF/Depot: Abgeltungsteuer, Vorabpauschale, Teilfreistellung
 * - Debeka Insurance: Steuerstundung, Ertragsanteil, 12/62-Regel (Halbeinkünfteverfahren)
 * - GRV: Besteuerungsanteil
 * - Sparer-Pauschbetrag: €1,000 (single) / €2,000 (married)
 * 
 * Based on:
 * - § 20 EStG (Einkünfte aus Kapitalvermögen)
 * - § 22 EStG (Sonstige Einkünfte)
 * - § 18 InvStG (Investmentsteuergesetz - Vorabpauschale)
 * - KID CA6I (Debeka Global Shares)
 */

// ============================================================================
// TAX RATES & CONSTANTS
// ============================================================================

/** Abgeltungsteuer rate: 25% + 5.5% Solidaritätszuschlag = 26.375% */
export const ABGELTUNGSTEUER_RATE = 0.25;
export const SOLI_RATE = 0.055;
export const ABGELTUNGSTEUER_WITH_SOLI = ABGELTUNGSTEUER_RATE * (1 + SOLI_RATE); // 26.375%

/** Kirchensteuer rates */
export const KIRCHENSTEUER_RATES = {
  BY: 0.08, // Bayern
  BW: 0.08, // Baden-Württemberg
  OTHER: 0.09 // All other states
};

/** Sparer-Pauschbetrag (tax-free allowance) */
export const SPARER_PAUSCHBETRAG = {
  SINGLE: 1000,
  MARRIED: 2000
};

/** Teilfreistellung rates per § 20 InvStG */
export const TEILFREISTELLUNG = {
  EQUITY_FUND: 0.30, // 30% for Aktienfonds (>50% stocks)
  MIXED_FUND: 0.15, // 15% for Mischfonds (25-50% stocks)
  INSURANCE: 0.15 // 15% for fondsgebundene Versicherungen
};

/** BMF Basiszins for Vorabpauschale calculation */
export const BMF_BASISZINS = {
  2024: 0.0246, // 2.46%
  2025: 0.0253, // 2.53%
  2026: 0.026 // Estimated
};

/** Ertragsanteil table per § 22 Nr. 1 S. 3a EStG */
export const ERTRAGSANTEIL_TABLE: Record<number, number> = {
  60: 0.22, 61: 0.21, 62: 0.20, 63: 0.19,
  64: 0.19, 65: 0.18, 66: 0.18, 67: 0.17,
  68: 0.16, 69: 0.16, 70: 0.15, 71: 0.15,
  72: 0.14, 73: 0.14, 74: 0.13, 75: 0.13,
  76: 0.12, 77: 0.12, 78: 0.11, 79: 0.11,
  80: 0.10, 81: 0.10, 82: 0.09, 83: 0.09,
  84: 0.08, 85: 0.08, 86: 0.07, 87: 0.07,
  88: 0.06, 89: 0.06, 90: 0.05, 91: 0.05,
  92: 0.04, 93: 0.04, 94: 0.03, 95: 0.02
};

/** GRV Besteuerungsanteil table (updates yearly) */
export const GRV_BESTEUERUNGSANTEIL: Record<number, number> = {
  2024: 0.830,
  2025: 0.835,
  2026: 0.840,
  2027: 0.845,
  2028: 0.850,
  2029: 0.855,
  2030: 0.860,
  2031: 0.865,
  2032: 0.870,
  2033: 0.875,
  2034: 0.880,
  2035: 0.885,
  2036: 0.890,
  2037: 0.895,
  2038: 0.900,
  2039: 0.905,
  2040: 0.910,
  2041: 0.915,
  2042: 0.920,
  2043: 0.925,
  2044: 0.930,
  2045: 0.935,
  2046: 0.940,
  2047: 0.945,
  2048: 0.950,
  2049: 0.955,
  2050: 0.960,
  2051: 0.965,
  2052: 0.970,
  2053: 0.975,
  2054: 0.980,
  2055: 0.985,
  2056: 0.990,
  2057: 0.995,
  2058: 1.000
};

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface TaxCalculationOptions {
  maritalStatus?: 'single' | 'married';
  kirchensteuerState?: 'BY' | 'BW' | 'OTHER' | 'NONE';
  personalTaxRate?: number; // For Halbeinkünfteverfahren
}

export interface VorabpauschaleResult {
  vorabpauschaleGross: number;
  teilfreistellungAmount: number;
  taxableAmount: number;
  taxWithoutKirche: number;
  kirchensteuer: number;
  taxTotal: number;
  effectiveRate: number;
}

export interface HalbeinkunfteResult {
  eligible: boolean;
  message?: string;
  totalPayout: number;
  totalContributions: number;
  gains: number;
  teilfreistellungAmount: number;
  afterTeilfreistellung: number;
  halbeinkünfteReduction: number;
  taxableGains: number;
  tax: number;
  netPayout: number;
  effectiveRateOnGains: number;
  effectiveRateOnPayout: number;
}

export interface ErtragsanteilResult {
  grossMonthly: number;
  ertragsanteil: number; // as decimal
  ertragsanteilPercent: number;
  taxableMonthly: number;
  taxMonthly: number;
  kirchensteuerMonthly: number;
  netMonthly: number;
  taxableYearly: number;
  taxYearly: number;
  netYearly: number;
  effectiveRate: number;
}

export interface GRVTaxResult {
  grossMonthly: number;
  besteuerungsanteil: number; // as decimal
  besteuerungsanteilPercent: number;
  taxableYearly: number;
  taxYearly: number;
  kvPvYearly: number; // Health + care insurance
  netYearly: number;
  netMonthly: number;
  effectiveDeductionRate: number;
}

export interface ETFTaxResult {
  capitalGains: number;
  teilfreistellungAmount: number;
  taxableGains: number;
  sparerPauschbetragUsed: number;
  taxableAfterPauschbetrag: number;
  abgeltungsteuer: number;
  kirchensteuer: number;
  totalTax: number;
  netGains: number;
  effectiveRate: number;
}

// ============================================================================
// GERMAN TAX CALCULATOR CLASS
// ============================================================================

export class GermanTaxCalculator {
  private options: Required<TaxCalculationOptions>;

  constructor(options: TaxCalculationOptions = {}) {
    this.options = {
      maritalStatus: options.maritalStatus || 'single',
      kirchensteuerState: options.kirchensteuerState || 'NONE',
      personalTaxRate: options.personalTaxRate || 0.30
    };
  }

  /**
   * Calculate Vorabpauschale for ETF/Fund holdings
   * Per § 18 InvStG
   */
  calculateVorabpauschale(
    fundValueYearStart: number,
    year: number = new Date().getFullYear(),
    fundType: 'EQUITY_FUND' | 'MIXED_FUND' = 'EQUITY_FUND'
  ): VorabpauschaleResult {
    const basiszins = BMF_BASISZINS[year as keyof typeof BMF_BASISZINS] || 0.0253;
    const teilfreistellung = TEILFREISTELLUNG[fundType];

    // Step 1: Calculate gross Vorabpauschale
    const vorabpauschaleGross = fundValueYearStart * basiszins * 0.7;

    // Step 2: Apply Teilfreistellung
    const teilfreistellungAmount = vorabpauschaleGross * teilfreistellung;
    const taxableAmount = vorabpauschaleGross - teilfreistellungAmount;

    // Step 3: Apply Abgeltungsteuer + Soli
    const taxWithoutKirche = taxableAmount * ABGELTUNGSTEUER_WITH_SOLI;

    // Step 4: Kirchensteuer (optional)
    const kirchensteuer = this.options.kirchensteuerState !== 'NONE'
      ? taxWithoutKirche * KIRCHENSTEUER_RATES[this.options.kirchensteuerState]
      : 0;

    const taxTotal = taxWithoutKirche + kirchensteuer;
    const effectiveRate = (taxTotal / vorabpauschaleGross) * 100;

    return {
      vorabpauschaleGross,
      teilfreistellungAmount,
      taxableAmount,
      taxWithoutKirche,
      kirchensteuer,
      taxTotal,
      effectiveRate
    };
  }

  /**
   * Calculate tax for ETF capital gains at sale
   * Includes Teilfreistellung and Sparer-Pauschbetrag
   */
  calculateETFCapitalGainsTax(
    purchaseValue: number,
    saleValue: number,
    fundType: 'EQUITY_FUND' | 'MIXED_FUND' = 'EQUITY_FUND'
  ): ETFTaxResult {
    const capitalGains = saleValue - purchaseValue;
    
    if (capitalGains <= 0) {
      return {
        capitalGains,
        teilfreistellungAmount: 0,
        taxableGains: 0,
        sparerPauschbetragUsed: 0,
        taxableAfterPauschbetrag: 0,
        abgeltungsteuer: 0,
        kirchensteuer: 0,
        totalTax: 0,
        netGains: capitalGains,
        effectiveRate: 0
      };
    }

    const teilfreistellung = TEILFREISTELLUNG[fundType];
    const teilfreistellungAmount = capitalGains * teilfreistellung;
    const taxableGains = capitalGains - teilfreistellungAmount;

    // Apply Sparer-Pauschbetrag
    const pauschbetrag = this.options.maritalStatus === 'married'
      ? SPARER_PAUSCHBETRAG.MARRIED
      : SPARER_PAUSCHBETRAG.SINGLE;

    const sparerPauschbetragUsed = Math.min(taxableGains, pauschbetrag);
    const taxableAfterPauschbetrag = Math.max(0, taxableGains - sparerPauschbetragUsed);

    // Calculate taxes
    const abgeltungsteuer = taxableAfterPauschbetrag * ABGELTUNGSTEUER_WITH_SOLI;
    const kirchensteuer = this.options.kirchensteuerState !== 'NONE'
      ? abgeltungsteuer * KIRCHENSTEUER_RATES[this.options.kirchensteuerState]
      : 0;

    const totalTax = abgeltungsteuer + kirchensteuer;
    const netGains = capitalGains - totalTax;
    const effectiveRate = (totalTax / capitalGains) * 100;

    return {
      capitalGains,
      teilfreistellungAmount,
      taxableGains,
      sparerPauschbetragUsed,
      taxableAfterPauschbetrag,
      abgeltungsteuer,
      kirchensteuer,
      totalTax,
      netGains,
      effectiveRate
    };
  }

  /**
   * Calculate 12/62 Rule (Halbeinkünfteverfahren) for insurance policies
   * Per § 20 Abs. 1 Nr. 6 EStG
   */
  calculateHalbeinkunfte(
    totalPayout: number,
    totalContributions: number,
    contractDuration: number, // in years
    payoutAge: number
  ): HalbeinkunfteResult {
    // Check 12/62 eligibility
    const eligible = contractDuration >= 12 && payoutAge >= 62;

    const gains = totalPayout - totalContributions;

    if (!eligible) {
      // Full taxation if not eligible
      const tax = gains * this.options.personalTaxRate;
      return {
        eligible: false,
        message: "12/62-Regel nicht erfüllt. Volle Gewinnbesteuerung nach persönlichem Steuersatz.",
        totalPayout,
        totalContributions,
        gains,
        teilfreistellungAmount: 0,
        afterTeilfreistellung: gains,
        halbeinkünfteReduction: 0,
        taxableGains: gains,
        tax,
        netPayout: totalPayout - tax,
        effectiveRateOnGains: (tax / gains) * 100,
        effectiveRateOnPayout: (tax / totalPayout) * 100
      };
    }

    // Step 1: Apply Teilfreistellung (15% for insurance)
    const teilfreistellungAmount = gains * TEILFREISTELLUNG.INSURANCE;
    const afterTeilfreistellung = gains - teilfreistellungAmount;

    // Step 2: Apply Halbeinkünfteverfahren (50% reduction)
    const halbeinkünfteReduction = afterTeilfreistellung * 0.50;
    const taxableGains = afterTeilfreistellung - halbeinkünfteReduction;

    // Step 3: Apply personal tax rate (not Abgeltungsteuer!)
    const tax = taxableGains * this.options.personalTaxRate;

    const netPayout = totalPayout - tax;

    return {
      eligible: true,
      totalPayout,
      totalContributions,
      gains,
      teilfreistellungAmount,
      afterTeilfreistellung,
      halbeinkünfteReduction,
      taxableGains,
      tax,
      netPayout,
      effectiveRateOnGains: (tax / gains) * 100,
      effectiveRateOnPayout: (tax / totalPayout) * 100
    };
  }

  /**
   * Calculate Ertragsanteil taxation for insurance annuities
   * Per § 22 Nr. 1 S. 3a EStG
   */
  calculateErtragsanteil(
    monthlyPension: number,
    retirementAge: number
  ): ErtragsanteilResult {
    // Get Ertragsanteil from table (default to 17% for age 67 if not found)
    const ertragsanteil = ERTRAGSANTEIL_TABLE[retirementAge] || 0.17;

    // Monthly calculation
    const taxableMonthly = monthlyPension * ertragsanteil;
    const taxMonthly = taxableMonthly * this.options.personalTaxRate;
    const kirchensteuerMonthly = this.options.kirchensteuerState !== 'NONE'
      ? taxMonthly * KIRCHENSTEUER_RATES[this.options.kirchensteuerState]
      : 0;
    const netMonthly = monthlyPension - taxMonthly - kirchensteuerMonthly;

    // Yearly calculation
    const taxableYearly = taxableMonthly * 12;
    const taxYearly = taxMonthly * 12;
    const netYearly = netMonthly * 12;

    const effectiveRate = ((taxMonthly + kirchensteuerMonthly) / monthlyPension) * 100;

    return {
      grossMonthly: monthlyPension,
      ertragsanteil,
      ertragsanteilPercent: ertragsanteil * 100,
      taxableMonthly,
      taxMonthly,
      kirchensteuerMonthly,
      netMonthly,
      taxableYearly,
      taxYearly,
      netYearly,
      effectiveRate
    };
  }

  /**
   * Calculate GRV (Gesetzliche Rentenversicherung) taxation
   * Besteuerungsanteil per § 22 EStG
   */
  calculateGRVTax(
    monthlyPension: number,
    retirementYear: number,
    kvPvRate: number = 0.11 // Health + care insurance ~11%
  ): GRVTaxResult {
    // Get Besteuerungsanteil (increases 0.5% per year until 100% in 2058)
    const besteuerungsanteil = GRV_BESTEUERUNGSANTEIL[retirementYear] || 1.0;

    const yearlyPension = monthlyPension * 12;
    const taxableYearly = yearlyPension * besteuerungsanteil;
    const taxYearly = taxableYearly * this.options.personalTaxRate;
    const kvPvYearly = yearlyPension * kvPvRate;

    const netYearly = yearlyPension - taxYearly - kvPvYearly;
    const netMonthly = netYearly / 12;

    const effectiveDeductionRate = ((taxYearly + kvPvYearly) / yearlyPension) * 100;

    return {
      grossMonthly: monthlyPension,
      besteuerungsanteil,
      besteuerungsanteilPercent: besteuerungsanteil * 100,
      taxableYearly,
      taxYearly,
      kvPvYearly,
      netYearly,
      netMonthly,
      effectiveDeductionRate
    };
  }

  /**
   * Calculate annual tax drag from Vorabpauschale during accumulation phase
   */
  calculateAnnualTaxDrag(
    portfolioValue: number,
    year: number = new Date().getFullYear()
  ): number {
    const result = this.calculateVorabpauschale(portfolioValue, year);
    return result.taxTotal;
  }

  /**
   * Helper: Get effective tax rate for different product types
   */
  getEffectiveTaxRates(age: number, retirementYear: number) {
    return {
      etfCapitalGains: ABGELTUNGSTEUER_WITH_SOLI * (1 - TEILFREISTELLUNG.EQUITY_FUND) * 100,
      insuranceLumpSum12_62: this.options.personalTaxRate * (1 - TEILFREISTELLUNG.INSURANCE) * 0.5 * 100,
      insuranceAnnuity: (ERTRAGSANTEIL_TABLE[age] || 0.17) * this.options.personalTaxRate * 100,
      grv: (GRV_BESTEUERUNGSANTEIL[retirementYear] || 1.0) * this.options.personalTaxRate * 100
    };
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Create a tax calculator with default settings
 */
export function createTaxCalculator(options?: TaxCalculationOptions): GermanTaxCalculator {
  return new GermanTaxCalculator(options);
}

/**
 * Quick calculation: Compare ETF vs Insurance tax on same gains
 */
export function compareETFvsInsuranceTax(
  gains: number,
  contractDuration: number,
  payoutAge: number,
  options?: TaxCalculationOptions
): {
  etf: ETFTaxResult;
  insurance: HalbeinkunfteResult;
  taxSavings: number;
  taxSavingsPercent: number;
} {
  const calculator = new GermanTaxCalculator(options);
  
  const purchaseValue = 100000; // Arbitrary base
  const saleValue = purchaseValue + gains;
  
  const etf = calculator.calculateETFCapitalGainsTax(purchaseValue, saleValue);
  const insurance = calculator.calculateHalbeinkunfte(
    saleValue,
    purchaseValue,
    contractDuration,
    payoutAge
  );

  const taxSavings = etf.totalTax - insurance.tax;
  const taxSavingsPercent = (taxSavings / etf.totalTax) * 100;

  return {
    etf,
    insurance,
    taxSavings,
    taxSavingsPercent
  };
}

/**
 * Format currency for German locale
 */
export function formatEUR(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

/**
 * Format percentage for German locale
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value / 100);
}
