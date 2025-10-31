/**
 * Unit Tests for German Tax Calculator
 * Tests all major tax calculation scenarios
 */

import { describe, it, expect } from 'vitest';
import {
  GermanTaxCalculator,
  createTaxCalculator,
  compareETFvsInsuranceTax,
  ABGELTUNGSTEUER_WITH_SOLI,
  TEILFREISTELLUNG,
  SPARER_PAUSCHBETRAG,
  ERTRAGSANTEIL_TABLE,
  GRV_BESTEUERUNGSANTEIL
} from './germanTaxCalculator';

describe('GermanTaxCalculator', () => {
  describe('Vorabpauschale Calculation', () => {
    it('should calculate Vorabpauschale correctly for 2025', () => {
      const calculator = createTaxCalculator();
      const result = calculator.calculateVorabpauschale(100000, 2025, 'EQUITY_FUND');

      // 100,000 € * 2.53% * 0.7 = 1,771 € gross
      expect(result.vorabpauschaleGross).toBeCloseTo(1771, 0);

      // 1,771 € * 30% Teilfreistellung = 531.3 €
      expect(result.teilfreistellungAmount).toBeCloseTo(531.3, 1);

      // 1,771 - 531.3 = 1,239.7 € taxable
      expect(result.taxableAmount).toBeCloseTo(1239.7, 1);

      // 1,239.7 € * 26.375% = 327 €
      expect(result.taxWithoutKirche).toBeCloseTo(327, 0);
    });

    it('should apply Kirchensteuer correctly', () => {
      const calculator = createTaxCalculator({ kirchensteuerState: 'OTHER' });
      const result = calculator.calculateVorabpauschale(100000, 2025, 'EQUITY_FUND');

      // Kirchensteuer 9% on tax
      expect(result.kirchensteuer).toBeCloseTo(result.taxWithoutKirche * 0.09, 0);
      expect(result.taxTotal).toBeCloseTo(result.taxWithoutKirche + result.kirchensteuer, 0);
    });

    it('should calculate lower Vorabpauschale for mixed funds', () => {
      const calculator = createTaxCalculator();
      const equityResult = calculator.calculateVorabpauschale(100000, 2025, 'EQUITY_FUND');
      const mixedResult = calculator.calculateVorabpauschale(100000, 2025, 'MIXED_FUND');

      // Mixed funds have 15% Teilfreistellung vs 30% for equity
      expect(mixedResult.taxTotal).toBeGreaterThan(equityResult.taxTotal);
    });
  });

  describe('ETF Capital Gains Tax', () => {
    it('should calculate capital gains tax with Teilfreistellung', () => {
      const calculator = createTaxCalculator();
      const result = calculator.calculateETFCapitalGainsTax(100000, 150000, 'EQUITY_FUND');

      // 50,000 € gains
      expect(result.capitalGains).toBe(50000);

      // 50,000 * 30% = 15,000 € Teilfreistellung
      expect(result.teilfreistellungAmount).toBe(15000);

      // 35,000 € taxable
      expect(result.taxableGains).toBe(35000);
    });

    it('should apply Sparer-Pauschbetrag for single', () => {
      const calculator = createTaxCalculator({ maritalStatus: 'single' });
      const result = calculator.calculateETFCapitalGainsTax(100000, 102000, 'EQUITY_FUND');

      // 2,000 € gains * 70% (after Teilfreistellung) = 1,400 € taxable
      // Sparer-Pauschbetrag 1,000 € reduces to 400 € taxable
      expect(result.sparerPauschbetragUsed).toBe(1000);
      expect(result.taxableAfterPauschbetrag).toBe(400);
    });

    it('should apply Sparer-Pauschbetrag for married', () => {
      const calculator = createTaxCalculator({ maritalStatus: 'married' });
      const result = calculator.calculateETFCapitalGainsTax(100000, 104000, 'EQUITY_FUND');

      // 4,000 € gains * 70% = 2,800 € taxable
      // Sparer-Pauschbetrag 2,000 € reduces to 800 € taxable
      expect(result.sparerPauschbetragUsed).toBe(2000);
      expect(result.taxableAfterPauschbetrag).toBe(800);
    });

    it('should handle zero or negative gains', () => {
      const calculator = createTaxCalculator();
      const resultZero = calculator.calculateETFCapitalGainsTax(100000, 100000);
      const resultNegative = calculator.calculateETFCapitalGainsTax(100000, 90000);

      expect(resultZero.totalTax).toBe(0);
      expect(resultNegative.totalTax).toBe(0);
      expect(resultNegative.netGains).toBe(-10000);
    });

    it('should calculate correct effective tax rate', () => {
      const calculator = createTaxCalculator({ maritalStatus: 'single' });
      const result = calculator.calculateETFCapitalGainsTax(100000, 150000, 'EQUITY_FUND');

      // Expected: 70% * 26.375% = ~18.46% on gains (before Pauschbetrag)
      // Actual will be slightly lower due to Pauschbetrag
      expect(result.effectiveRate).toBeGreaterThan(18);
      expect(result.effectiveRate).toBeLessThan(19);
    });
  });

  describe('Halbeinkünfteverfahren (12/62 Rule)', () => {
    it('should apply 12/62 rule when eligible', () => {
      const calculator = createTaxCalculator({ personalTaxRate: 0.30 });
      const result = calculator.calculateHalbeinkunfte(
        200000, // total payout
        100000, // contributions
        15, // duration (>12 years)
        65 // age (>62)
      );

      expect(result.eligible).toBe(true);
      expect(result.gains).toBe(100000);

      // 100,000 € * 15% Teilfreistellung = 15,000 €
      expect(result.teilfreistellungAmount).toBe(15000);

      // 85,000 € * 50% Halbeinkünfte = 42,500 € taxable
      expect(result.taxableGains).toBe(42500);

      // 42,500 € * 30% = 12,750 € tax
      expect(result.tax).toBe(12750);

      // Effective rate: 12.75% on gains
      expect(result.effectiveRateOnGains).toBeCloseTo(12.75, 2);
    });

    it('should NOT apply 12/62 rule if contract too short', () => {
      const calculator = createTaxCalculator({ personalTaxRate: 0.30 });
      const result = calculator.calculateHalbeinkunfte(
        200000,
        100000,
        10, // Only 10 years (need 12)
        65
      );

      expect(result.eligible).toBe(false);
      expect(result.message).toContain('12/62-Regel nicht erfüllt');

      // Full taxation: 100,000 € * 30% = 30,000 €
      expect(result.tax).toBe(30000);
    });

    it('should NOT apply 12/62 rule if payout age too young', () => {
      const calculator = createTaxCalculator({ personalTaxRate: 0.30 });
      const result = calculator.calculateHalbeinkunfte(
        200000,
        100000,
        15,
        60 // Only 60 years old (need 62)
      );

      expect(result.eligible).toBe(false);
      expect(result.tax).toBe(30000); // Full taxation
    });

    it('should calculate correct tax savings vs ETF', () => {
      const comparison = compareETFvsInsuranceTax(
        100000, // gains
        15, // contract duration
        65, // payout age
        { personalTaxRate: 0.30 }
      );

      // Insurance should have lower tax due to 12/62 rule
      expect(comparison.insurance.tax).toBeLessThan(comparison.etf.totalTax);
      expect(comparison.taxSavings).toBeGreaterThan(0);
    });
  });

  describe('Ertragsanteil Taxation', () => {
    it('should calculate Ertragsanteil correctly for age 67', () => {
      const calculator = createTaxCalculator({ personalTaxRate: 0.25 });
      const result = calculator.calculateErtragsanteil(2000, 67);

      // Age 67: 17% Ertragsanteil
      expect(result.ertragsanteil).toBe(0.17);
      expect(result.ertragsanteilPercent).toBe(17);

      // 2,000 € * 17% = 340 € taxable
      expect(result.taxableMonthly).toBe(340);

      // 340 € * 25% = 85 € tax
      expect(result.taxMonthly).toBe(85);

      // Net: 2,000 - 85 = 1,915 €
      expect(result.netMonthly).toBe(1915);
    });

    it('should have lower tax for older retirees', () => {
      const calculator = createTaxCalculator({ personalTaxRate: 0.25 });
      const result65 = calculator.calculateErtragsanteil(2000, 65);
      const result70 = calculator.calculateErtragsanteil(2000, 70);
      const result80 = calculator.calculateErtragsanteil(2000, 80);

      // Ertragsanteil decreases with age
      expect(result65.ertragsanteil).toBeGreaterThan(result70.ertragsanteil);
      expect(result70.ertragsanteil).toBeGreaterThan(result80.ertragsanteil);

      // Tax decreases with age
      expect(result65.taxMonthly).toBeGreaterThan(result70.taxMonthly);
      expect(result70.taxMonthly).toBeGreaterThan(result80.taxMonthly);
    });

    it('should calculate yearly totals correctly', () => {
      const calculator = createTaxCalculator({ personalTaxRate: 0.25 });
      const result = calculator.calculateErtragsanteil(2000, 67);

      expect(result.taxableYearly).toBe(result.taxableMonthly * 12);
      expect(result.taxYearly).toBe(result.taxMonthly * 12);
      expect(result.netYearly).toBe(result.netMonthly * 12);
    });

    it('should include Kirchensteuer when specified', () => {
      const calculator = createTaxCalculator({
        personalTaxRate: 0.25,
        kirchensteuerState: 'OTHER'
      });
      const result = calculator.calculateErtragsanteil(2000, 67);

      expect(result.kirchensteuerMonthly).toBeGreaterThan(0);
      expect(result.kirchensteuerMonthly).toBeCloseTo(result.taxMonthly * 0.09, 2);
      expect(result.netMonthly).toBe(
        result.grossMonthly - result.taxMonthly - result.kirchensteuerMonthly
      );
    });
  });

  describe('GRV Taxation', () => {
    it('should calculate GRV tax correctly for 2025 retirement', () => {
      const calculator = createTaxCalculator({ personalTaxRate: 0.25 });
      const result = calculator.calculateGRVTax(2000, 2025);

      // 2025: 83.5% Besteuerungsanteil
      expect(result.besteuerungsanteil).toBe(0.835);

      // 2,000 € * 12 * 83.5% = 20,040 € taxable yearly
      expect(result.taxableYearly).toBe(20040);

      // 20,040 € * 25% = 5,010 € tax
      expect(result.taxYearly).toBe(5010);

      // Health insurance ~11%: 2,640 €
      expect(result.kvPvYearly).toBeCloseTo(2640, 0);
    });

    it('should increase Besteuerungsanteil over years', () => {
      const calculator = createTaxCalculator({ personalTaxRate: 0.25 });
      const result2025 = calculator.calculateGRVTax(2000, 2025);
      const result2030 = calculator.calculateGRVTax(2000, 2030);
      const result2040 = calculator.calculateGRVTax(2000, 2040);

      expect(result2025.besteuerungsanteil).toBe(0.835);
      expect(result2030.besteuerungsanteil).toBe(0.860);
      expect(result2040.besteuerungsanteil).toBe(0.910);

      // Tax increases over time
      expect(result2030.taxYearly).toBeGreaterThan(result2025.taxYearly);
      expect(result2040.taxYearly).toBeGreaterThan(result2030.taxYearly);
    });

    it('should reach 100% in 2058', () => {
      const calculator = createTaxCalculator();
      const result = calculator.calculateGRVTax(2000, 2058);

      expect(result.besteuerungsanteil).toBe(1.0);
      expect(result.besteuerungsanteilPercent).toBe(100);
    });

    it('should calculate effective deduction rate', () => {
      const calculator = createTaxCalculator({ personalTaxRate: 0.30 });
      const result = calculator.calculateGRVTax(2000, 2025, 0.11);

      // Total deductions = tax + health insurance
      const totalDeductions = result.taxYearly + result.kvPvYearly;
      const expectedRate = (totalDeductions / (2000 * 12)) * 100;

      expect(result.effectiveDeductionRate).toBeCloseTo(expectedRate, 1);
      expect(result.effectiveDeductionRate).toBeGreaterThan(30); // Should be 30%+ with health insurance
    });
  });

  describe('Effective Tax Rate Comparison', () => {
    it('should show insurance has lowest tax rate', () => {
      const calculator = createTaxCalculator({ personalTaxRate: 0.30 });
      const rates = calculator.getEffectiveTaxRates(67, 2025);

      // ETF: ~18.46% (70% * 26.375%)
      expect(rates.etfCapitalGains).toBeCloseTo(18.46, 1);

      // Insurance lump sum (12/62): ~7.65% (85% * 50% * 30%)
      expect(rates.insuranceLumpSum12_62).toBeCloseTo(12.75, 1);

      // Insurance annuity: ~5.1% (17% * 30%)
      expect(rates.insuranceAnnuity).toBeCloseTo(5.1, 1);

      // GRV: ~25.05% (83.5% * 30%)
      expect(rates.grv).toBeCloseTo(25.05, 1);

      // Insurance should be lowest
      expect(rates.insuranceAnnuity).toBeLessThan(rates.insuranceLumpSum12_62);
      expect(rates.insuranceLumpSum12_62).toBeLessThan(rates.etfCapitalGains);
    });
  });

  describe('Real-World Scenarios', () => {
    it('should calculate tax for 30-year ETF savings plan', () => {
      const calculator = createTaxCalculator({ maritalStatus: 'married' });
      
      // Contributions: 500 €/month * 30 years = 180,000 €
      // Final value with 7% return: ~600,000 €
      // Gains: 420,000 €
      
      const result = calculator.calculateETFCapitalGainsTax(
        180000,
        600000,
        'EQUITY_FUND'
      );

      expect(result.capitalGains).toBe(420000);
      
      // 420,000 * 70% = 294,000 taxable
      // - 2,000 Pauschbetrag = 292,000
      // * 26.375% = 77,015 € tax
      expect(result.totalTax).toBeCloseTo(77015, 0);
      
      // Effective rate: ~18.3%
      expect(result.effectiveRate).toBeGreaterThan(18);
      expect(result.effectiveRate).toBeLessThan(19);
    });

    it('should calculate tax for 30-year Debeka insurance', () => {
      const calculator = createTaxCalculator({
        maritalStatus: 'married',
        personalTaxRate: 0.30
      });
      
      // Same scenario as ETF
      const result = calculator.calculateHalbeinkunfte(
        600000,
        180000,
        30,
        67
      );

      expect(result.eligible).toBe(true);
      expect(result.gains).toBe(420000);
      
      // 420,000 * 85% * 50% * 30% = 53,550 € tax
      expect(result.tax).toBeCloseTo(53550, 0);
      
      // Effective rate: ~12.75% (vs ~18.3% for ETF)
      expect(result.effectiveRateOnGains).toBeCloseTo(12.75, 1);
      
      // Tax savings vs ETF
      const etfResult = calculator.calculateETFCapitalGainsTax(180000, 600000);
      const savings = etfResult.totalTax - result.tax;
      expect(savings).toBeGreaterThan(20000); // Should save >20k €
    });

    it('should calculate monthly net pension with all taxes', () => {
      const calculator = createTaxCalculator({
        personalTaxRate: 0.25,
        kirchensteuerState: 'OTHER'
      });

      // Insurance annuity: 2,000 € gross
      const insurance = calculator.calculateErtragsanteil(2000, 67);
      
      // GRV: 1,500 € gross
      const grv = calculator.calculateGRVTax(1500, 2025);

      // Total gross: 3,500 €
      const totalGross = insurance.grossMonthly + grv.grossMonthly;
      
      // Total net: ~3,000 € (various deductions)
      const totalNet = insurance.netMonthly + grv.netMonthly;
      
      expect(totalGross).toBe(3500);
      expect(totalNet).toBeLessThan(3100);
      expect(totalNet).toBeGreaterThan(2900);
      
      // Effective deduction: ~14%
      const effectiveDeduction = ((totalGross - totalNet) / totalGross) * 100;
      expect(effectiveDeduction).toBeGreaterThan(10);
      expect(effectiveDeduction).toBeLessThan(20);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small amounts', () => {
      const calculator = createTaxCalculator();
      const result = calculator.calculateVorabpauschale(100, 2025);

      expect(result.vorabpauschaleGross).toBeGreaterThan(0);
      expect(result.taxTotal).toBeGreaterThan(0);
    });

    it('should handle very large amounts', () => {
      const calculator = createTaxCalculator();
      const result = calculator.calculateETFCapitalGainsTax(
        10000000,
        50000000
      );

      expect(result.capitalGains).toBe(40000000);
      expect(result.totalTax).toBeGreaterThan(7000000);
    });

    it('should handle age outside Ertragsanteil table', () => {
      const calculator = createTaxCalculator({ personalTaxRate: 0.25 });
      const result = calculator.calculateErtragsanteil(2000, 100);

      // Should default to 17% for age 67
      expect(result.ertragsanteil).toBe(0.17);
    });

    it('should handle year outside GRV table', () => {
      const calculator = createTaxCalculator({ personalTaxRate: 0.25 });
      const result = calculator.calculateGRVTax(2000, 2100);

      // Should default to 100%
      expect(result.besteuerungsanteil).toBe(1.0);
    });
  });
});
