/**
 * Pension Gap Calculator
 * 
 * Calculates the Versorgungslücke (retirement income gap) based on:
 * - Current net income
 * - Expected retirement income sources (GRV, private pensions, etc.)
 * - Adjustments (work expenses, mortgage, healthcare)
 * - 70% rule for required retirement income
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PensionGapInput {
  // Current situation
  currentNetIncome: number;
  currentAge: number;
  
  // Planning
  retirementAge?: number; // Default: 67
  lifeExpectancy?: number; // Default: 85
  
  // Income sources at retirement
  statutoryPension: number; // GRV
  companyPension?: number; // Betriebsrente (bAV)
  riesterPension?: number; // Riester-Rente
  ruerupPension?: number; // Rürup-Rente (Basis-Rente)
  privatePension?: number; // Private Rentenversicherung
  versorgungswerk?: number; // Professional pension fund
  civilServantPension?: number; // Beamtenpension
  zvkVblPension?: number; // ZVK/VBL (public service)
  
  // Adjustments
  workExpenseSavingsPercent?: number; // Default: 10% (commute, clothing, meals)
  mortgagePayment?: number; // Current monthly mortgage
  mortgageEndsAtAge?: number; // Age when mortgage is paid off
  healthcareCostIncrease?: number; // Additional €/month in retirement
  
  // Advanced settings
  targetIncomePercent?: number; // Default: 70% (can adjust to 60-100%)
  inflationRate?: number; // For future calculations
}

export interface PensionGapResult {
  // Core metrics
  currentNetIncome: number;
  requiredRetirementIncome: number;
  actualRetirementIncome: number;
  monthlyGap: number;
  yearlyGap: number;
  lifetimeGap: number;
  
  // Coverage metrics
  coverageRatio: number; // as percentage
  coverageRatioAdjusted: number; // with expense adjustments
  status: 'Ausreichend' | 'Lücke vorhanden' | 'Erhebliche Lücke' | 'Kritische Lücke';
  color: 'green' | 'yellow' | 'orange' | 'red';
  
  // Breakdown
  breakdown: {
    // Income sources
    statutoryPension: number;
    companyPension: number;
    riesterPension: number;
    ruerupPension: number;
    privatePension: number;
    versorgungswerk: number;
    civilServantPension: number;
    zvkVblPension: number;
    totalPensionIncome: number;
    
    // Adjustments
    savedWorkExpenses: number;
    mortgageSavings: number;
    healthcareCostIncrease: number;
    netAdjustments: number;
    
    // Final calculation
    adjustedRetirementIncome: number;
  };
  
  // Additional info
  retirementYears: number;
  monthsUntilRetirement: number;
}

export interface GaugeZone {
  min: number;
  max: number;
  color: string;
  label: string;
  description: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const DEFAULT_RETIREMENT_AGE = 67;
export const DEFAULT_LIFE_EXPECTANCY = 85;
export const DEFAULT_TARGET_INCOME_PERCENT = 0.70; // 70% rule
export const DEFAULT_WORK_EXPENSE_SAVINGS = 0.10; // 10% saved on work expenses

export const GAUGE_ZONES: GaugeZone[] = [
  {
    min: 100,
    max: Infinity,
    color: '#059669', // Green
    label: 'Ausreichend',
    description: 'Lebensstandard gesichert'
  },
  {
    min: 70,
    max: 99,
    color: '#fbbf24', // Yellow
    label: 'Lücke vorhanden',
    description: 'Moderate Einschränkungen notwendig'
  },
  {
    min: 50,
    max: 69,
    color: '#f97316', // Orange
    label: 'Erhebliche Lücke',
    description: 'Erhebliche Versorgungslücke'
  },
  {
    min: 0,
    max: 49,
    color: '#dc2626', // Red
    label: 'Kritische Lücke',
    description: 'Kritische Unterversorgung'
  }
];

// ============================================================================
// PENSION GAP CALCULATOR
// ============================================================================

export class PensionGapCalculator {
  /**
   * Calculate pension gap based on input data
   */
  static calculate(input: PensionGapInput): PensionGapResult {
    const {
      currentNetIncome,
      currentAge,
      retirementAge = DEFAULT_RETIREMENT_AGE,
      lifeExpectancy = DEFAULT_LIFE_EXPECTANCY,
      
      // Income sources
      statutoryPension,
      companyPension = 0,
      riesterPension = 0,
      ruerupPension = 0,
      privatePension = 0,
      versorgungswerk = 0,
      civilServantPension = 0,
      zvkVblPension = 0,
      
      // Adjustments
      workExpenseSavingsPercent = DEFAULT_WORK_EXPENSE_SAVINGS,
      mortgagePayment = 0,
      mortgageEndsAtAge = retirementAge,
      healthcareCostIncrease = 0,
      
      // Advanced
      targetIncomePercent = DEFAULT_TARGET_INCOME_PERCENT
    } = input;

    // Calculate required retirement income (70% rule by default)
    const savedWorkExpenses = currentNetIncome * workExpenseSavingsPercent;
    const requiredRetirementIncome = (currentNetIncome - savedWorkExpenses) * targetIncomePercent;
    
    // Sum all pension income sources
    const totalPensionIncome = 
      statutoryPension +
      companyPension +
      riesterPension +
      ruerupPension +
      privatePension +
      versorgungswerk +
      civilServantPension +
      zvkVblPension;
    
    // Calculate adjustments in retirement
    const mortgageSavings = retirementAge >= mortgageEndsAtAge ? mortgagePayment : 0;
    const netAdjustments = savedWorkExpenses + mortgageSavings - healthcareCostIncrease;
    
    // Adjusted retirement income
    const adjustedRetirementIncome = totalPensionIncome + netAdjustments;
    
    // Calculate gaps
    const monthlyGap = Math.max(0, requiredRetirementIncome - adjustedRetirementIncome);
    const yearlyGap = monthlyGap * 12;
    const retirementYears = lifeExpectancy - retirementAge;
    const lifetimeGap = yearlyGap * retirementYears;
    
    // Calculate coverage ratios
    const coverageRatio = (totalPensionIncome / requiredRetirementIncome) * 100;
    const coverageRatioAdjusted = (adjustedRetirementIncome / requiredRetirementIncome) * 100;
    
    // Determine status
    const { status, color } = this.determineStatus(coverageRatioAdjusted);
    
    // Calculate months until retirement
    const monthsUntilRetirement = (retirementAge - currentAge) * 12;
    
    return {
      currentNetIncome,
      requiredRetirementIncome,
      actualRetirementIncome: adjustedRetirementIncome,
      monthlyGap,
      yearlyGap,
      lifetimeGap,
      coverageRatio,
      coverageRatioAdjusted,
      status,
      color,
      breakdown: {
        statutoryPension,
        companyPension,
        riesterPension,
        ruerupPension,
        privatePension,
        versorgungswerk,
        civilServantPension,
        zvkVblPension,
        totalPensionIncome,
        savedWorkExpenses,
        mortgageSavings,
        healthcareCostIncrease,
        netAdjustments,
        adjustedRetirementIncome
      },
      retirementYears,
      monthsUntilRetirement
    };
  }

  /**
   * Determine status based on coverage ratio
   */
  private static determineStatus(coverageRatio: number): {
    status: PensionGapResult['status'];
    color: PensionGapResult['color'];
  } {
    if (coverageRatio >= 100) {
      return { status: 'Ausreichend', color: 'green' };
    } else if (coverageRatio >= 70) {
      return { status: 'Lücke vorhanden', color: 'yellow' };
    } else if (coverageRatio >= 50) {
      return { status: 'Erhebliche Lücke', color: 'orange' };
    } else {
      return { status: 'Kritische Lücke', color: 'red' };
    }
  }

  /**
   * Get gauge zone for a coverage ratio
   */
  static getGaugeZone(coverageRatio: number): GaugeZone {
    return GAUGE_ZONES.find(
      zone => coverageRatio >= zone.min && coverageRatio <= zone.max
    ) || GAUGE_ZONES[GAUGE_ZONES.length - 1];
  }

  /**
   * Calculate monthly savings needed to close the gap
   */
  static calculateRequiredSavings(
    gap: PensionGapResult,
    yearsUntilRetirement: number,
    expectedReturn: number = 0.065, // 6.5% annual
    includeInflation: boolean = false,
    inflationRate: number = 0.02 // 2% annual
  ): {
    monthlyRequired: number;
    totalContributions: number;
    projectedValue: number;
    projectedMonthlyIncome: number; // Assuming 4% withdrawal rate
  } {
    if (gap.monthlyGap <= 0) {
      return {
        monthlyRequired: 0,
        totalContributions: 0,
        projectedValue: 0,
        projectedMonthlyIncome: 0
      };
    }

    // Adjust gap for inflation if needed
    const futureMonthlyGap = includeInflation
      ? gap.monthlyGap * Math.pow(1 + inflationRate, yearsUntilRetirement)
      : gap.monthlyGap;

    // Calculate required capital (using 4% safe withdrawal rate)
    const requiredCapital = (futureMonthlyGap * 12) / 0.04;

    // Calculate monthly contribution needed using future value of annuity formula
    // FV = PMT × [(1 + r)^n - 1] / r
    const monthlyReturn = expectedReturn / 12;
    const totalMonths = yearsUntilRetirement * 12;
    
    const monthlyRequired = requiredCapital / 
      (((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn));

    const totalContributions = monthlyRequired * totalMonths;

    return {
      monthlyRequired,
      totalContributions,
      projectedValue: requiredCapital,
      projectedMonthlyIncome: futureMonthlyGap
    };
  }

  /**
   * Format currency for German locale
   */
  static formatEUR(amount: number, decimals: number = 0): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(amount);
  }

  /**
   * Format percentage
   */
  static formatPercent(value: number, decimals: number = 1): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value / 100);
  }

  /**
   * Generate summary text for display
   */
  static generateSummaryText(gap: PensionGapResult): {
    title: string;
    description: string;
    action: string;
  } {
    const required = this.formatEUR(gap.requiredRetirementIncome);
    const actual = this.formatEUR(gap.actualRetirementIncome);
    const coverage = this.formatPercent(gap.coverageRatioAdjusted);
    const missing = this.formatEUR(gap.monthlyGap);

    if (gap.coverageRatioAdjusted >= 100) {
      return {
        title: 'Ihr Lebensstandard ist gesichert',
        description: `Zur Sicherung Ihres Lebensstandards benötigen Sie ${required} monatlich (netto). Ihr aktueller Pfad sichert ${actual} (${coverage}).`,
        action: 'Sie können Ihren Ruhestand entspannt angehen. Überlegen Sie, ob Sie zusätzlich für besondere Wünsche vorsorgen möchten.'
      };
    } else if (gap.coverageRatioAdjusted >= 70) {
      return {
        title: 'Moderate Versorgungslücke vorhanden',
        description: `Zur Sicherung Ihres Lebensstandards benötigen Sie ${required} monatlich (netto). Ihr aktueller Pfad sichert ${actual} (${coverage}).`,
        action: `Versorgungslücke: ${missing} monatlich. Mit zusätzlicher Vorsorge können Sie diese Lücke schließen.`
      };
    } else if (gap.coverageRatioAdjusted >= 50) {
      return {
        title: 'Erhebliche Versorgungslücke',
        description: `Zur Sicherung Ihres Lebensstandards benötigen Sie ${required} monatlich (netto). Ihr aktueller Pfad sichert ${actual} (${coverage}).`,
        action: `Versorgungslücke: ${missing} monatlich. Dringend empfohlen: Zusätzliche Altersvorsorge abschließen.`
      };
    } else {
      return {
        title: 'Kritische Unterversorgung',
        description: `Zur Sicherung Ihres Lebensstandards benötigen Sie ${required} monatlich (netto). Ihr aktueller Pfad sichert nur ${actual} (${coverage}).`,
        action: `Versorgungslücke: ${missing} monatlich. Handeln Sie jetzt, um erhebliche Einschränkungen im Alter zu vermeiden.`
      };
    }
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Quick calculation with minimal input
 */
export function quickCalculate(
  currentNetIncome: number,
  currentAge: number,
  statutoryPension: number
): PensionGapResult {
  return PensionGapCalculator.calculate({
    currentNetIncome,
    currentAge,
    statutoryPension
  });
}

/**
 * Compare scenarios
 */
export function compareScenarios(
  scenario1: PensionGapInput,
  scenario2: PensionGapInput
): {
  scenario1: PensionGapResult;
  scenario2: PensionGapResult;
  gapDifference: number;
  coverageDifference: number;
  betterScenario: 1 | 2;
} {
  const result1 = PensionGapCalculator.calculate(scenario1);
  const result2 = PensionGapCalculator.calculate(scenario2);

  const gapDifference = result2.monthlyGap - result1.monthlyGap;
  const coverageDifference = result2.coverageRatioAdjusted - result1.coverageRatioAdjusted;

  return {
    scenario1: result1,
    scenario2: result2,
    gapDifference,
    coverageDifference,
    betterScenario: result2.monthlyGap < result1.monthlyGap ? 2 : 1
  };
}
