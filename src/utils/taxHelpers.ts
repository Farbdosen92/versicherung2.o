/**
 * Tax Helper Functions
 * 
 * Utility functions for tax calculations across the application
 */

import { OnboardingData } from '@/types/onboarding';
import { SPARER_PAUSCHBETRAG } from '@/services/germanTaxCalculator';

/**
 * Get the Sparer-Pauschbetrag (saver's allowance) based on onboarding data
 * 
 * Priority:
 * 1. Custom value from taxSettings (if set)
 * 2. Default based on marital status (1000€ single, 2000€ married)
 */
export function getSparerPauschbetrag(data: OnboardingData): number {
  // Check for custom value
  if (data.taxSettings?.sparerPauschbetrag !== undefined) {
    return data.taxSettings.sparerPauschbetrag;
  }

  // Default based on marital status
  const isMarried = data.personal?.maritalStatus === 'verheiratet';
  return isMarried ? SPARER_PAUSCHBETRAG.MARRIED : SPARER_PAUSCHBETRAG.SINGLE;
}

/**
 * Check if church tax applies
 */
export function getChurchTaxApplies(data: OnboardingData): boolean {
  return data.taxSettings?.churchTax ?? false;
}

/**
 * Get church tax rate
 */
export function getChurchTaxRate(data: OnboardingData): number {
  if (!getChurchTaxApplies(data)) {
    return 0;
  }
  return data.taxSettings?.churchTaxRate ?? 0.09; // Default 9%
}

/**
 * Check if solidarity surcharge applies
 */
export function getSolidarityTaxApplies(data: OnboardingData): boolean {
  return data.taxSettings?.solidarityTax ?? true; // Default: applies
}
