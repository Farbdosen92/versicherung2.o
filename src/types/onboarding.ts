// Onboarding Data Model Types

export type MaritalStatus = 'ledig' | 'verheiratet' | 'geschieden' | 'dauernd_getrennt' | 'verwitwet';
export type CalcScope = 'eine_person' | 'beide_personen';
export type OtherIncomeType = 'Vermietung' | 'Verpachtung' | 'Landwirtschaft' | 'Gewerbebetrieb' | 'Unterhalt';
export type WizardStep = 'personal' | 'income' | 'pensions' | 'retirement' | 'assets' | 'mortgage' | 'summary';

export interface PersonalData {
  birthYear?: number;
  age?: number;
  maritalStatus?: MaritalStatus;
  children: {
    has: boolean;
    count?: number;
  };
  calcScope?: CalcScope; // Only for married couples
}

export interface TaxSettings {
  sparerPauschbetrag?: number; // Custom allowance, overrides default 1000/2000
  churchTax?: boolean; // Applies church tax
  churchTaxRate?: number; // 8% or 9%
  solidarityTax?: boolean; // Applies solidarity surcharge
}

export interface IncomeData {
  netMonthly?: number; // Required, €/month
  grossAnnual?: number; // Optional, €/year
  // For married couples with calcScope='beide_personen'
  netMonthly_A?: number;
  grossAnnual_A?: number;
  netMonthly_B?: number;
  grossAnnual_B?: number;
}

export interface OtherIncomeData {
  has: boolean;
  type?: OtherIncomeType;
  amountMonthly?: number; // €/month
  // For married couples with calcScope='beide_personen'
  has_A?: boolean;
  type_A?: OtherIncomeType;
  amountMonthly_A?: number;
  has_B?: boolean;
  type_B?: OtherIncomeType;
  amountMonthly_B?: number;
}

export interface PensionData {
  public67?: number; // €/month
  civil67?: number; // €/month
  profession67?: number; // €/month
  zvkVbl67?: number; // €/month
  // For married couples with calcScope='beide_personen'
  public67_A?: number;
  civil67_A?: number;
  profession67_A?: number;
  zvkVbl67_A?: number;
  public67_B?: number;
  civil67_B?: number;
  profession67_B?: number;
  zvkVbl67_B?: number;
}

export interface PrivatePensionData {
  contribution?: number; // €/month
  // For married couples with calcScope='beide_personen'
  contribution_A?: number;
  contribution_B?: number;
}

export interface RiesterData {
  amount?: number; // €/month
  // For married couples with calcScope='beide_personen'
  amount_A?: number;
  amount_B?: number;
}

export interface RuerupData {
  amount?: number; // €/month
  // For married couples with calcScope='beide_personen'
  amount_A?: number;
  amount_B?: number;
}

export interface OccupationalPensionData {
  amount?: number; // €/month
  // For married couples with calcScope='beide_personen'
  amount_A?: number;
  amount_B?: number;
}

export interface LifeInsuranceData {
  sum?: number; // Sum today
  // For married couples with calcScope='beide_personen'
  sum_A?: number;
  sum_B?: number;
}

export interface FundsData {
  balance?: number; // Sum today
  // For married couples with calcScope='beide_personen'
  balance_A?: number;
  balance_B?: number;
}

export interface SavingsData {
  balance?: number; // Sum today
  // For married couples with calcScope='beide_personen'
  balance_A?: number;
  balance_B?: number;
}

export interface MortgageData {
  has: boolean;
  remainingDebtNow?: number; // Sum today
  fixationEndYear?: number;
  remainingDebtAtFixationEnd?: number;
  interestRate?: number; // Percentage
}

// Complete onboarding data
export interface OnboardingData {
  personal: PersonalData;
  income: IncomeData;
  otherIncome: OtherIncomeData;
  pensions: PensionData;
  privatePension: PrivatePensionData;
  riester: RiesterData;
  ruerup: RuerupData;
  occupationalPension: OccupationalPensionData;
  lifeInsurance: LifeInsuranceData;
  funds: FundsData;
  savings: SavingsData;
  mortgage: MortgageData;
  taxSettings?: TaxSettings; // Optional tax configuration
  completedAt?: string;
}

// Fund comparison specific data
export interface FundComparisonData {
  fundPlan: {
    expectedReturnPa: number; // % p.a.
    frontLoad: number; // % one-time
    annualMgmtFee: number; // % p.a.
  };
  churchTax: {
    applies: boolean;
    rate?: number; // 0, 8, or 9%
  };
  allowance: {
    sparerPauschbetrag: number; // Default: 1000€ single / 2000€ married
  };
  baseRatePa: number; // % p.a. for Vorabpauschale
}

// Validation errors
export interface ValidationErrors {
  [key: string]: any;
}

export interface AssetData {
  lifeInsurance?: LifeInsuranceData;
  funds?: FundsData;
  savings?: SavingsData;
  mortgage?: MortgageData;
}

// Export/Import format
export interface OnboardingExportData {
  data: OnboardingData;
  exportedAt: string;
  version: string;
  checksum?: string;
}