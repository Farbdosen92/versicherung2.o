/**
 * Cost Calculation Engine for Debeka Insurance Products
 * 
 * Implements cost structure per KID CA6I (Debeka Global Shares):
 * - Entry costs: 2.5% over first 5 years
 * - Ongoing costs (Gamma): 0.3% p.a. on fund assets
 * - Unit costs: €12 per year
 * - RIY (Reduction in Yield): ~1.0% p.a. over 30 years
 * 
 * Compares with ETF savings plan costs:
 * - TER (Total Expense Ratio): typically 0.2-0.3%
 * - Transaction costs: €0-1.50 per execution
 * - Depot fees: €0 (many online brokers)
 */

// ============================================================================
// COST CONSTANTS
// ============================================================================

/** Debeka Global Shares (KID CA6I) cost structure */
export const DEBEKA_COSTS = {
  /** Entry costs: 2.5% spread over first 5 years */
  ENTRY_COSTS_PERCENT: 0.025,
  ENTRY_COSTS_YEARS: 5,
  
  /** Ongoing costs (Gamma): 0.3% p.a. on fund assets */
  GAMMA_RATE: 0.003,
  
  /** Fixed annual unit costs */
  UNIT_COSTS_ANNUAL: 12,
  
  /** Expected RIY over 30 years */
  RIY_30_YEARS: 0.01
};

/** Typical ETF costs */
export const ETF_COSTS = {
  /** Total Expense Ratio (varies by ETF) */
  TER_LOW: 0.0007, // 0.07% for MSCI World ETFs
  TER_TYPICAL: 0.002, // 0.2%
  TER_HIGH: 0.005, // 0.5%
  
  /** Transaction costs per execution */
  TRANSACTION_FREE: 0,
  TRANSACTION_LOW: 0.99,
  TRANSACTION_TYPICAL: 1.50,
  TRANSACTION_HIGH: 5.0,
  
  /** Front load (Ausgabeaufschlag) - usually 0% for direct ETF purchase */
  FRONT_LOAD: 0.0,
  
  /** Annual depot fees */
  DEPOT_FEE_FREE: 0,
  DEPOT_FEE_TYPICAL: 0 // Most online brokers are free
};

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface InsuranceCostResult {
  totalContributions: number;
  entryCosts: number;
  ongoingCosts: number;
  unitCosts: number;
  totalCosts: number;
  finalCapital: number;
  capitalWithoutCosts: number;
  riy: number; // as percentage
  effectiveAnnualCostRate: number; // as percentage
  yearlyBreakdown: YearlyCostBreakdown[];
}

export interface ETFCostResult {
  totalContributions: number;
  terCosts: number;
  transactionCosts: number;
  frontLoadCosts: number;
  depotCosts: number;
  totalCosts: number;
  finalCapital: number;
  capitalWithoutCosts: number;
  riy: number; // as percentage
  effectiveAnnualCostRate: number; // as percentage
  yearlyBreakdown: YearlyCostBreakdown[];
}

export interface YearlyCostBreakdown {
  year: number;
  contribution: number;
  portfolioValueStart: number;
  portfolioValueEnd: number;
  entryCosts?: number;
  gammaCosts?: number;
  unitCosts?: number;
  terCosts?: number;
  transactionCosts?: number;
  frontLoadCosts?: number;
  totalCostsThisYear: number;
  cumulativeCosts: number;
}

export interface CostComparisonResult {
  insurance: InsuranceCostResult;
  etf: ETFCostResult;
  costDifference: number;
  costDifferencePercent: number;
  insuranceRIY: number;
  etfRIY: number;
  riyDifference: number;
  recommendation: string;
}

export interface CostCalculationOptions {
  monthlyContribution: number;
  durationYears: number;
  fundReturn: number; // Expected annual return (e.g., 0.065 for 6.5%)
  includeYearlyBreakdown?: boolean;
}

// ============================================================================
// DEBEKA INSURANCE COST CALCULATOR
// ============================================================================

export class DebecaCostCalculator {
  /**
   * Calculate all costs for Debeka Global Shares insurance
   */
  static calculate(options: CostCalculationOptions): InsuranceCostResult {
    const {
      monthlyContribution,
      durationYears,
      fundReturn,
      includeYearlyBreakdown = true
    } = options;

    const totalContributions = monthlyContribution * 12 * durationYears;
    
    // Entry costs: 2.5% total, spread over first 5 years
    const entryCoststotal = totalContributions * DEBEKA_COSTS.ENTRY_COSTS_PERCENT;
    const entryCostsPerYear = entryCoststotal / DEBEKA_COSTS.ENTRY_COSTS_YEARS;
    
    // Track costs
    let capital = 0;
    let cumulativeOngoingCosts = 0;
    let cumulativeUnitCosts = 0;
    const yearlyBreakdown: YearlyCostBreakdown[] = [];
    
    // Simulation year by year
    for (let year = 1; year <= durationYears; year++) {
      const portfolioValueStart = capital;
      const yearlyContribution = monthlyContribution * 12;
      
      // Entry costs deducted in first 5 years
      const entryCostsThisYear = year <= DEBEKA_COSTS.ENTRY_COSTS_YEARS 
        ? entryCostsPerYear 
        : 0;
      
      const effectiveContribution = yearlyContribution - entryCostsThisYear;
      
      // Add contributions monthly with returns
      for (let month = 1; month <= 12; month++) {
        capital += effectiveContribution / 12;
        capital *= (1 + fundReturn / 12);
      }
      
      // Annual ongoing costs (Gamma + unit costs)
      const gammaCosts = capital * DEBEKA_COSTS.GAMMA_RATE;
      const unitCosts = DEBEKA_COSTS.UNIT_COSTS_ANNUAL;
      
      capital -= (gammaCosts + unitCosts);
      cumulativeOngoingCosts += gammaCosts;
      cumulativeUnitCosts += unitCosts;
      
      if (includeYearlyBreakdown) {
        yearlyBreakdown.push({
          year,
          contribution: yearlyContribution,
          portfolioValueStart,
          portfolioValueEnd: capital,
          entryCosts: entryCostsThisYear,
          gammaCosts,
          unitCosts,
          totalCostsThisYear: entryCostsThisYear + gammaCosts + unitCosts,
          cumulativeCosts: entryCoststotal * (Math.min(year, DEBEKA_COSTS.ENTRY_COSTS_YEARS) / DEBEKA_COSTS.ENTRY_COSTS_YEARS) + cumulativeOngoingCosts + cumulativeUnitCosts
        });
      }
    }
    
    // Calculate capital without costs for RIY
    const capitalWithoutCosts = this.calculateCapitalWithoutCosts(
      monthlyContribution,
      durationYears,
      fundReturn
    );
    
    // RIY calculation
    const totalCosts = entryCoststotal + cumulativeOngoingCosts + cumulativeUnitCosts;
    const riy = ((capitalWithoutCosts - capital) / capitalWithoutCosts) / durationYears * 100;
    const effectiveAnnualCostRate = (totalCosts / totalContributions / durationYears) * 100;
    
    return {
      totalContributions,
      entryCosts: entryCoststotal,
      ongoingCosts: cumulativeOngoingCosts,
      unitCosts: cumulativeUnitCosts,
      totalCosts,
      finalCapital: capital,
      capitalWithoutCosts,
      riy,
      effectiveAnnualCostRate,
      yearlyBreakdown
    };
  }

  /**
   * Calculate capital growth without any costs
   */
  private static calculateCapitalWithoutCosts(
    monthlyContribution: number,
    durationYears: number,
    fundReturn: number
  ): number {
    let capital = 0;
    
    for (let year = 1; year <= durationYears; year++) {
      for (let month = 1; month <= 12; month++) {
        capital += monthlyContribution;
        capital *= (1 + fundReturn / 12);
      }
    }
    
    return capital;
  }

  /**
   * Get cost breakdown at specific year
   */
  static getCostBreakdownAtYear(
    options: CostCalculationOptions,
    targetYear: number
  ): YearlyCostBreakdown | null {
    const result = this.calculate(options);
    return result.yearlyBreakdown.find(y => y.year === targetYear) || null;
  }
}

// ============================================================================
// ETF COST CALCULATOR
// ============================================================================

export class ETFCostCalculator {
  /**
   * Calculate all costs for ETF savings plan
   */
  static calculate(
    options: CostCalculationOptions,
    terRate: number = ETF_COSTS.TER_TYPICAL,
    transactionCost: number = ETF_COSTS.TRANSACTION_TYPICAL,
    frontLoad: number = ETF_COSTS.FRONT_LOAD,
    depotFeeAnnual: number = ETF_COSTS.DEPOT_FEE_FREE
  ): ETFCostResult {
    const {
      monthlyContribution,
      durationYears,
      fundReturn,
      includeYearlyBreakdown = true
    } = options;

    const totalContributions = monthlyContribution * 12 * durationYears;
    
    let capital = 0;
    let cumulativeTerCosts = 0;
    let cumulativeTransactionCosts = 0;
    let cumulativeFrontLoadCosts = 0;
    let cumulativeDepotCosts = 0;
    const yearlyBreakdown: YearlyCostBreakdown[] = [];
    
    // Simulation year by year
    for (let year = 1; year <= durationYears; year++) {
      const portfolioValueStart = capital;
      let yearlyTransactionCosts = 0;
      let yearlyFrontLoadCosts = 0;
      
      // Add contributions monthly
      for (let month = 1; month <= 12; month++) {
        // Front load and transaction costs
        const contributionAfterFrontLoad = monthlyContribution * (1 - frontLoad);
        yearlyFrontLoadCosts += monthlyContribution * frontLoad;
        yearlyTransactionCosts += transactionCost;
        
        capital += contributionAfterFrontLoad;
        
        // Apply net return (gross return - TER)
        const netMonthlyReturn = (fundReturn - terRate) / 12;
        capital *= (1 + netMonthlyReturn);
      }
      
      // Annual depot fee
      capital -= depotFeeAnnual;
      cumulativeDepotCosts += depotFeeAnnual;
      
      // TER costs (implicit in reduced returns, but calculated for transparency)
      const terCosts = (capital + portfolioValueStart) / 2 * terRate; // Average balance * TER
      cumulativeTerCosts += terCosts;
      
      cumulativeTransactionCosts += yearlyTransactionCosts;
      cumulativeFrontLoadCosts += yearlyFrontLoadCosts;
      
      if (includeYearlyBreakdown) {
        yearlyBreakdown.push({
          year,
          contribution: monthlyContribution * 12,
          portfolioValueStart,
          portfolioValueEnd: capital,
          terCosts,
          transactionCosts: yearlyTransactionCosts,
          frontLoadCosts: yearlyFrontLoadCosts,
          totalCostsThisYear: terCosts + yearlyTransactionCosts + yearlyFrontLoadCosts + depotFeeAnnual,
          cumulativeCosts: cumulativeTerCosts + cumulativeTransactionCosts + cumulativeFrontLoadCosts + cumulativeDepotCosts
        });
      }
    }
    
    // Calculate capital without costs
    const capitalWithoutCosts = DebecaCostCalculator['calculateCapitalWithoutCosts'](
      monthlyContribution,
      durationYears,
      fundReturn
    );
    
    const totalCosts = cumulativeTerCosts + cumulativeTransactionCosts + 
                      cumulativeFrontLoadCosts + cumulativeDepotCosts;
    const riy = ((capitalWithoutCosts - capital) / capitalWithoutCosts) / durationYears * 100;
    const effectiveAnnualCostRate = (totalCosts / totalContributions / durationYears) * 100;
    
    return {
      totalContributions,
      terCosts: cumulativeTerCosts,
      transactionCosts: cumulativeTransactionCosts,
      frontLoadCosts: cumulativeFrontLoadCosts,
      depotCosts: cumulativeDepotCosts,
      totalCosts,
      finalCapital: capital,
      capitalWithoutCosts,
      riy,
      effectiveAnnualCostRate,
      yearlyBreakdown
    };
  }

  /**
   * Calculate costs for different TER scenarios
   */
  static compareTERScenarios(
    options: CostCalculationOptions
  ): {
    low: ETFCostResult;
    typical: ETFCostResult;
    high: ETFCostResult;
  } {
    return {
      low: this.calculate(options, ETF_COSTS.TER_LOW),
      typical: this.calculate(options, ETF_COSTS.TER_TYPICAL),
      high: this.calculate(options, ETF_COSTS.TER_HIGH)
    };
  }
}

// ============================================================================
// COST COMPARISON
// ============================================================================

export class CostComparator {
  /**
   * Compare Debeka insurance vs ETF costs
   */
  static compare(
    options: CostCalculationOptions,
    etfTER: number = ETF_COSTS.TER_TYPICAL,
    etfTransactionCost: number = ETF_COSTS.TRANSACTION_TYPICAL
  ): CostComparisonResult {
    const insurance = DebecaCostCalculator.calculate(options);
    const etf = ETFCostCalculator.calculate(
      options,
      etfTER,
      etfTransactionCost
    );

    const costDifference = insurance.totalCosts - etf.totalCosts;
    const costDifferencePercent = (costDifference / etf.totalCosts) * 100;
    const riyDifference = insurance.riy - etf.riy;

    // Generate recommendation
    let recommendation = '';
    if (costDifference > 0) {
      recommendation = `Debeka kostet ${this.formatEUR(Math.abs(costDifference))} mehr als ETF (${costDifferencePercent.toFixed(1)}% höher). `;
      recommendation += `RIY-Unterschied: ${riyDifference.toFixed(2)}% p.a. `;
      recommendation += `Vorteil ETF: Niedrigere Kosten. Vorteil Debeka: Steuerstundung, 12/62-Regel.`;
    } else {
      recommendation = `ETF kostet ${this.formatEUR(Math.abs(costDifference))} mehr als Debeka (unwahrscheinlich). `;
      recommendation += `Bitte Parameter prüfen.`;
    }

    return {
      insurance,
      etf,
      costDifference,
      costDifferencePercent,
      insuranceRIY: insurance.riy,
      etfRIY: etf.riy,
      riyDifference,
      recommendation
    };
  }

  /**
   * Calculate break-even point where tax advantages offset higher costs
   */
  static calculateBreakEvenYears(
    monthlyContribution: number,
    fundReturn: number,
    personalTaxRate: number = 0.30
  ): number {
    // Simplified calculation: compare net returns after tax
    const insuranceNetReturn = fundReturn; // Tax-deferred
    const etfNetReturn = fundReturn * (1 - DEBEKA_COSTS.GAMMA_RATE); // Approximation
    
    // Find year where insurance overtakes ETF due to tax deferral
    // This is a simplified heuristic
    const costDifference = DEBEKA_COSTS.ENTRY_COSTS_PERCENT + 
                          (DEBEKA_COSTS.GAMMA_RATE * 30); // Over 30 years
    const taxAdvantage = personalTaxRate * 0.5 * 0.85; // Simplified 12/62 advantage
    
    return Math.ceil(costDifference / taxAdvantage);
  }

  /**
   * Format currency for display
   */
  private static formatEUR(amount: number): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
}

// ============================================================================
// WATERFALL CHART DATA PREPARATION
// ============================================================================

/**
 * Prepare data for cost waterfall visualization
 * Shows: Contributions → Entry Costs → Ongoing Costs → Unit Costs → Final Value
 */
export function prepareWaterfallData(result: InsuranceCostResult | ETFCostResult) {
  const isInsurance = 'entryCosts' in result;
  
  if (isInsurance) {
    const insurance = result as InsuranceCostResult;
    return [
      { name: 'Eingezahlt', value: insurance.totalContributions, type: 'start' },
      { name: 'Einstiegskosten', value: -insurance.entryCosts, type: 'decrease' },
      { name: 'Laufende Kosten', value: -insurance.ongoingCosts, type: 'decrease' },
      { name: 'Stückkosten', value: -insurance.unitCosts, type: 'decrease' },
      { name: 'Rendite', value: insurance.finalCapital - insurance.totalContributions + insurance.totalCosts, type: 'increase' },
      { name: 'Endwert', value: insurance.finalCapital, type: 'end' }
    ];
  } else {
    const etf = result as ETFCostResult;
    return [
      { name: 'Eingezahlt', value: etf.totalContributions, type: 'start' },
      { name: 'TER-Kosten', value: -etf.terCosts, type: 'decrease' },
      { name: 'Ordergebühren', value: -etf.transactionCosts, type: 'decrease' },
      { name: 'Rendite', value: etf.finalCapital - etf.totalContributions + etf.totalCosts, type: 'increase' },
      { name: 'Endwert', value: etf.finalCapital, type: 'end' }
    ];
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Quick calculation: 30-year comparison at €500/month
 */
export function quickCompare30Years(): CostComparisonResult {
  return CostComparator.compare({
    monthlyContribution: 500,
    durationYears: 30,
    fundReturn: 0.065 // 6.5% p.a.
  });
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}
