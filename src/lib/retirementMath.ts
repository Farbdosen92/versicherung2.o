import { getErtragsanteil } from '@/utils/germanTaxCalculations';

export const DEFAULT_ANNUAL_RETURN = 0.05;
export const DEFAULT_ANNUITY_RATE = 0.025; // 2,5% = 25€ pro 10.000€ Kapital (realistischer Rentenfaktor)
export const DEFAULT_PERSONAL_TAX_RATE = 0.25;

export interface PrivatePensionProjectionInput {
  monthlyContribution: number;
  years: number;
  startCapital?: number;
  annualReturn?: number;
  annuityRate?: number;
  personalTaxRate?: number;
  retirementAge: number;
  useHalfIncomeTaxation?: boolean;
}

export interface PrivatePensionProjectionResult {
  projectedValue: number;
  grossAnnual: number;
  netAnnual: number;
  netMonthly: number;
  ertragsanteil: number;
  taxablePortion: number;
}

export interface CostImpactInput {
  monthlyContribution: number;
  contractYears: number;
  etfFrontLoad: number;
  etfMgmtFee: number;
  taxDragRate: number;
}

export interface CostImpactResult {
  data: Array<{
    step: string;
    insurance: number;
    etf: number;
  }>;
  summary: {
    insuranceNet: number;
    etfNet: number;
    insuranceCosts: number;
    etfCosts: number;
  };
}

export interface RetirementGapInput {
  netIncome: number;
  statutory?: number;
  occupational?: number;
  riester?: number;
  privateNet?: number;
}

export interface RetirementGapResult {
  totalRetirement: number;
  gapValue: number;
  gapRatio: number;
}

/**
 * Compound growth for monthly contributions (end of month) plus start capital.
 */
export function futureValue(
  monthlyContribution: number,
  annualRate: number,
  years: number,
  startCapital = 0
): number {
  if (years <= 0) {
    return startCapital;
  }

  const totalMonths = years * 12;
  const monthlyRate = annualRate / 12;

  const capitalFV = startCapital * Math.pow(1 + monthlyRate, totalMonths);

  if (monthlyRate === 0) {
    return capitalFV + monthlyContribution * totalMonths;
  }

  const contributionsFV =
    monthlyContribution *
    ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) *
    (1 + monthlyRate);

  return capitalFV + contributionsFV;
}

/**
 * Determine if 12/62 half-income taxation qualifies.
 */
export function qualifiesFor1262(retirementAge: number, contractYears: number): boolean {
  return retirementAge >= 62 && contractYears >= 12;
}

/**
 * Project the private pension (Debeka-style) net payouts based on annuity logic.
 */
export function projectPrivatePension({
  monthlyContribution,
  years,
  startCapital = 0,
  annualReturn = DEFAULT_ANNUAL_RETURN,
  annuityRate = DEFAULT_ANNUITY_RATE,
  personalTaxRate = DEFAULT_PERSONAL_TAX_RATE,
  retirementAge,
  useHalfIncomeTaxation = false,
}: PrivatePensionProjectionInput): PrivatePensionProjectionResult {
  const projectedValue = futureValue(monthlyContribution, annualReturn, years, startCapital);

  const grossAnnual = projectedValue * annuityRate;
  const ertragsanteil = getErtragsanteil(retirementAge);
  const taxablePortion = useHalfIncomeTaxation ? 0.5 : ertragsanteil / 100;
  const taxableAmount = grossAnnual * taxablePortion;
  const netAnnual = Math.max(0, grossAnnual - taxableAmount * personalTaxRate);
  const netMonthly = netAnnual / 12;

  return {
    projectedValue,
    grossAnnual,
    netAnnual,
    netMonthly,
    ertragsanteil,
    taxablePortion,
  };
}

/**
 * Calculate the cost impact comparison between insurance and ETF.
 */
export function calculateCostImpact({
  monthlyContribution,
  contractYears,
  etfFrontLoad,
  etfMgmtFee,
  taxDragRate,
}: CostImpactInput): CostImpactResult {
  const annualContribution = monthlyContribution * 12;
  const totalContribution = annualContribution * contractYears;

  const insuranceEntryCost = totalContribution * 0.025;
  const insuranceOngoing = totalContribution * 0.003 * (contractYears / 2);
  const insurancePolicyFee = 12 * contractYears;
  const insuranceTotalCosts = insuranceEntryCost + insuranceOngoing + insurancePolicyFee;
  const insuranceNet = totalContribution - insuranceTotalCosts;

  const etfFrontLoadCost = totalContribution * etfFrontLoad;
  const etfOngoingCosts = totalContribution * etfMgmtFee * (contractYears / 2);
  const etfTaxDrag = totalContribution * taxDragRate;
  const etfTotalCosts = etfFrontLoadCost + etfOngoingCosts + etfTaxDrag;
  const etfNet = totalContribution - etfTotalCosts;

  return {
    data: [
      { step: 'Contribution', insurance: totalContribution, etf: totalContribution },
      { step: 'Entry', insurance: -insuranceEntryCost, etf: -etfFrontLoadCost },
      { step: 'Ongoing', insurance: -(insuranceOngoing + insurancePolicyFee), etf: -etfOngoingCosts },
      { step: 'Tax', insurance: 0, etf: -etfTaxDrag },
      { step: 'Net', insurance: insuranceNet, etf: etfNet },
    ],
    summary: {
      insuranceNet,
      etfNet,
      insuranceCosts: insuranceTotalCosts,
      etfCosts: etfTotalCosts,
    },
  };
}

/**
 * Calculate monthly retirement gap based on provided streams.
 */
export function calculateRetirementGap({
  netIncome,
  statutory = 0,
  occupational = 0,
  riester = 0,
  privateNet = 0,
}: RetirementGapInput): RetirementGapResult {
  const totalRetirement = statutory + occupational + riester + privateNet;
  if (netIncome <= 0) {
    return {
      totalRetirement,
      gapValue: 0,
      gapRatio: 0,
    };
  }

  const gapValue = netIncome - totalRetirement;
  const gapRatio = gapValue / netIncome;

  return { totalRetirement, gapValue, gapRatio };
}
