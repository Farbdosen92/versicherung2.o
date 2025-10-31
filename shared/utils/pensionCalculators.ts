/**
 * Pension Calculation Utilities
 *
 * Implements German pension calculation formulas per:
 * - EStG (Einkommensteuergesetz)
 * - InvStG (Investmentsteuergesetz)
 * - BMF Guidelines 2024
 *
 * All calculations maintain full precision until final display.
 * Tolerance: ±0.01 EUR for monetary values
 */

import { GOVERNMENT_PARAMETERS_2025 } from '@/data/governmentParameters';

// ============================================================================
// RIESTER PENSION CALCULATOR (§10a, §79ff EStG)
// ============================================================================

export interface RiesterInput {
  grossAnnualIncome: number;  // EUR/year
  children: number;           // Count of eligible children
  contribution: number;       // EUR/year (user contribution)
  childrenBornAfter2008?: number; // Count (300 EUR/child)
}

export interface RiesterResult {
  grundzulage: number;           // EUR/year - Basic subsidy
  kinderzulage: number;          // EUR/year - Child subsidy
  totalSubsidy: number;          // EUR/year - Total government subsidy
  requiredContribution: number;  // EUR/year - Minimum required
  effectiveContribution: number; // EUR/year - After capping at max
  netCost: number;               // EUR/year - User cost after subsidies
  subsidyRate: number;           // Percentage - Subsidy as % of contribution
  isValid: boolean;              // Whether meets minimum contribution
  validationMessage?: string;
}

/**
 * Calculate Riester pension subsidies and net cost
 *
 * Formula:
 *   Required Contribution = max(60 EUR, 4% × Gross Income)
 *   Grundzulage = 175 EUR (2024)
 *   Kinderzulage = 300 EUR per child born after 2008, 185 EUR for older children
 *   Net Cost = Contribution - Total Subsidy
 *
 * Legal basis: §10a EStG, §79ff EStG
 */
export function calculateRiester(input: RiesterInput): RiesterResult {
  const {
    grossAnnualIncome,
    children,
    contribution,
    childrenBornAfter2008 = children, // Default: assume all children born after 2008
  } = input;

  // Constants (2024)
  const GRUNDZULAGE = 175; // EUR/year
  const KINDERZULAGE_NEW = 300; // EUR/year for children born after 2008
  const KINDERZULAGE_OLD = 185; // EUR/year for children born before 2008
  const MIN_CONTRIBUTION = 60; // EUR/year absolute minimum
  const MAX_CONTRIBUTION = 2100; // EUR/year maximum
  const REQUIRED_PERCENT = 0.04; // 4% of gross income

  // Calculate required contribution (4% rule)
  const requiredContribution = Math.max(
    MIN_CONTRIBUTION,
    grossAnnualIncome * REQUIRED_PERCENT
  );

  // Calculate subsidies
  const grundzulage = GRUNDZULAGE;
  const childrenOld = Math.max(0, children - childrenBornAfter2008);
  const kinderzulage =
    (childrenBornAfter2008 * KINDERZULAGE_NEW) +
    (childrenOld * KINDERZULAGE_OLD);
  const totalSubsidy = grundzulage + kinderzulage;

  // Cap contribution at maximum
  const effectiveContribution = Math.min(contribution, MAX_CONTRIBUTION);

  // Validate minimum contribution requirement
  const isValid = effectiveContribution >= requiredContribution;
  const validationMessage = !isValid
    ? `Mindestbeitrag nicht erreicht: ${requiredContribution.toFixed(2)} EUR erforderlich (4% von ${grossAnnualIncome.toFixed(2)} EUR)`
    : undefined;

  // Calculate net cost
  const netCost = Math.max(0, effectiveContribution - totalSubsidy);

  // Calculate subsidy rate
  const subsidyRate = effectiveContribution > 0
    ? (totalSubsidy / effectiveContribution) * 100
    : 0;

  return {
    grundzulage,
    kinderzulage,
    totalSubsidy,
    requiredContribution,
    effectiveContribution,
    netCost,
    subsidyRate,
    isValid,
    validationMessage,
  };
}

// ============================================================================
// OCCUPATIONAL PENSION CALCULATOR (§3 Nr.63 EStG)
// ============================================================================

export interface OccupationalPensionInput {
  monthlyContribution: number; // EUR/month
  marginalTaxRate: number;     // Decimal (0.14 - 0.45)
  includeEmployerMatch?: boolean;
  employerMatchRate?: number;  // Decimal (e.g., 0.20 for 20% match)
}

export interface OccupationalPensionResult {
  monthlyContribution: number;       // EUR/month
  annualContribution: number;        // EUR/year
  taxFreeContribution: number;       // EUR/year (max 584/month)
  taxSavings: number;                // EUR/year
  socialSecuritySavings: number;     // EUR/year (~20%)
  totalSavings: number;              // EUR/year
  grossCost: number;                 // EUR/year
  netCost: number;                   // EUR/year (after all savings)
  savingsRate: number;               // Percentage
  employerContribution?: number;     // EUR/year (if matched)
  totalWithEmployer?: number;        // EUR/year (employee + employer)
}

/**
 * Calculate occupational pension tax and social security savings
 *
 * Formula:
 *   Tax-Free = min(Monthly Contribution, 584 EUR) × 12
 *   Tax Savings = Tax-Free × Marginal Tax Rate
 *   Social Security Savings = Tax-Free × ~20% (average rate)
 *   Net Cost = Gross Cost - Total Savings
 *
 * Legal basis: §3 Nr.63 EStG (Entgeltumwandlung)
 */
export function calculateOccupationalPension(
  input: OccupationalPensionInput
): OccupationalPensionResult {
  const {
    monthlyContribution,
    marginalTaxRate,
    includeEmployerMatch = false,
    employerMatchRate = 0,
  } = input;

  // Constants (2024)
  const MAX_TAX_FREE_MONTHLY = 584; // EUR/month (§3 Nr.63 EStG)
  const SOCIAL_SECURITY_RATE = 0.20; // ~20% average (pension 18.6% + health/care/unemployment)

  // Calculate annual values
  const annualContribution = monthlyContribution * 12;

  // Tax-free portion (capped at 584/month = 7,008/year)
  const taxFreeMonthly = Math.min(monthlyContribution, MAX_TAX_FREE_MONTHLY);
  const taxFreeContribution = taxFreeMonthly * 12;

  // Calculate savings
  const taxSavings = taxFreeContribution * marginalTaxRate;
  const socialSecuritySavings = taxFreeContribution * SOCIAL_SECURITY_RATE;
  const totalSavings = taxSavings + socialSecuritySavings;

  // Calculate costs
  const grossCost = annualContribution;
  const netCost = grossCost - totalSavings;

  // Savings rate
  const savingsRate = grossCost > 0 ? (totalSavings / grossCost) * 100 : 0;

  // Employer match (if applicable)
  const employerContribution = includeEmployerMatch
    ? annualContribution * employerMatchRate
    : undefined;
  const totalWithEmployer = includeEmployerMatch
    ? annualContribution + (employerContribution || 0)
    : undefined;

  return {
    monthlyContribution,
    annualContribution,
    taxFreeContribution,
    taxSavings,
    socialSecuritySavings,
    totalSavings,
    grossCost,
    netCost,
    savingsRate,
    employerContribution,
    totalWithEmployer,
  };
}

// ============================================================================
// RÜRUP TAX SAVINGS (Year-Dependent)
// ============================================================================

export interface RuerupInput {
  annualContribution: number;
  taxRate: number;
  year?: number; // Defaults to current year
}

export interface RuerupResult {
  maxContribution: number;
  deductibleRate: number;
  deductibleAmount: number;
  taxSavings: number;
  effectiveContribution: number;
}

/**
 * Get Rürup deductible rate for a given year
 *
 * Rate increases by 1% per year from 2005 until reaching 100% in 2025
 *
 * @param year Tax year (2024, 2025, etc.)
 * @returns Deductible rate as decimal (0.96 for 2024, 1.00 for 2025+)
 */
export function getRuerupDeductibleRate(year: number): number {
  if (year >= 2025) return 1.00; // 100% from 2025 onwards
  if (year === 2024) return 0.96; // 96%
  if (year === 2023) return 0.94; // 94%
  if (year === 2022) return 0.92; // 92%
  // ... continues down to 2005 at 60%

  // Formula: 60% + (year - 2005) × 2% up to 100%
  const baseYear = 2005;
  const baseRate = 0.60;
  const increasePerYear = 0.02;

  const rate = baseRate + ((year - baseYear) * increasePerYear);
  return Math.min(1.00, Math.max(0.60, rate));
}

/**
 * Calculate Rürup tax savings with year-dependent deductible rate
 *
 * Formula:
 *   Deductible Amount = min(Contribution, Max) × Deductible Rate(year)
 *   Tax Savings = Deductible Amount × Tax Rate
 *
 * Legal basis: §10 Abs.3 EStG
 */
export function calculateRuerupTaxSavings(input: RuerupInput): RuerupResult {
  const currentYear = new Date().getFullYear();
  const {
    annualContribution,
    taxRate,
    year = currentYear,
  } = input;

  // Get year-specific parameters
  const maxContribution = GOVERNMENT_PARAMETERS_2025.tax.ruerupMaxContribution; // 27,566 for 2024
  const deductibleRate = getRuerupDeductibleRate(year);

  // Calculate deductible amount (capped at max contribution)
  const cappedContribution = Math.min(annualContribution, maxContribution);
  const deductibleAmount = cappedContribution * deductibleRate;

  // Calculate tax savings
  const taxSavings = deductibleAmount * taxRate;

  // Effective contribution (net of tax savings)
  const effectiveContribution = annualContribution - taxSavings;

  return {
    maxContribution,
    deductibleRate,
    deductibleAmount,
    taxSavings,
    effectiveContribution,
  };
}

// ============================================================================
// COMPOUND INTEREST WITH MONTHLY CONTRIBUTIONS (CORRECTED)
// ============================================================================

export interface CompoundInterestInput {
  principal: number;           // EUR - Starting capital
  monthlyContribution: number; // EUR/month
  annualReturn: number;        // Decimal (0.07 for 7%)
  years: number;               // Years to compound
}

export interface CompoundInterestResult {
  futureValue: number;         // EUR - Total value at end
  principalGrowth: number;     // EUR - Growth from initial principal
  contributionsTotal: number;  // EUR - Total contributions made
  contributionsGrowth: number; // EUR - Growth from contributions
  totalGrowth: number;         // EUR - Total investment gains
  effectiveReturn: number;     // Percentage - Annualized return
}

/**
 * Calculate future value with MONTHLY compounding (CORRECTED)
 *
 * This is the CORRECT implementation using monthly compounding.
 * Previous implementation incorrectly used annual compounding.
 *
 * Formula (Monthly Compounding):
 *   For each month:
 *     Portfolio = (Portfolio + Monthly Contribution) × (1 + r_monthly)
 *
 * Where:
 *   r_monthly = annual_return / 12
 *   months = years × 12
 *
 * @param input Calculation parameters
 * @returns Future value with breakdown
 */
export function calculateCompoundInterest(
  input: CompoundInterestInput
): CompoundInterestResult {
  const { principal, monthlyContribution, annualReturn, years } = input;

  const monthlyRate = annualReturn / 12;
  const months = years * 12;

  // Track portfolio value month by month
  let portfolioValue = principal;
  let totalContributions = 0;

  for (let month = 0; month < months; month++) {
    // Apply monthly return to current balance FIRST
    portfolioValue *= (1 + monthlyRate);

    // Then add monthly contribution at END of month
    portfolioValue += monthlyContribution;
    totalContributions += monthlyContribution;
  }

  // Calculate breakdowns
  const totalInvested = principal + totalContributions;
  const totalGrowth = portfolioValue - totalInvested;

  // Principal growth (if we hadn't added contributions)
  const principalGrowth = principal * Math.pow(1 + monthlyRate, months) - principal;

  // Contribution growth
  const contributionsGrowth = totalGrowth - principalGrowth;

  // Effective annual return
  const effectiveReturn = years > 0
    ? (Math.pow(portfolioValue / totalInvested, 1 / years) - 1) * 100
    : 0;

  return {
    futureValue: portfolioValue,
    principalGrowth,
    contributionsTotal: totalContributions,
    contributionsGrowth,
    totalGrowth,
    effectiveReturn,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format EUR currency with German locale
 */
export function formatEUR(amount: number, decimals: number = 2): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Format percentage with German locale
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}
