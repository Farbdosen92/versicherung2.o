import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Shield, PieChart, Info, Settings } from 'lucide-react';
import { useOnboardingStore } from '@/stores/onboardingStore';
import {
  DEFAULT_TAX_SETTINGS,
  applyAllowance,
  calculateVorabpauschale,
  getEffectiveTaxRate,
} from '@/utils/germanTaxCalculations';
import {
  GOVERNMENT_PARAMETERS_2025,
  PARTIAL_EXEMPTION_RATES
} from '@/data/governmentParameters';
import { formatCurrency } from '@/lib/utils';
import {
  calculateRetirementGap,
  projectPrivatePension,
  qualifiesFor1262,
  DEFAULT_PERSONAL_TAX_RATE,
  DEFAULT_ANNUITY_RATE,
  DEFAULT_ANNUAL_RETURN,
} from '@/lib/retirementMath';

type FundType = 'equity' | 'mixed' | 'other';

interface TaxCockpitProps {
  language?: 'de' | 'en';
  monthlyPensionEstimate?: number;
  currentAgeOverride?: number;
  retirementAgeOverride?: number;
  monthlyContributionOverride?: number;
  fundBalanceOverride?: number;
}

export const TaxCockpit: React.FC<TaxCockpitProps> = ({
  language = 'de',
  monthlyPensionEstimate,
  currentAgeOverride,
  retirementAgeOverride,
  monthlyContributionOverride,
  fundBalanceOverride,
}) => {
  const { data } = useOnboardingStore();
  const [fundType, setFundType] = useState<FundType>('equity');
  const [churchTaxEnabled, setChurchTaxEnabled] = useState<boolean>(false);
  const [churchTaxRate, setChurchTaxRate] = useState<'08' | '09'>('08');
  const [showSettings, setShowSettings] = useState(false);

  const isMarried = data.personal?.maritalStatus === 'verheiratet';
  const netIncome =
    (isMarried && data.personal?.calcScope === 'beide_personen')
      ? (data.income.netMonthly_A || 0) + (data.income.netMonthly_B || 0)
      : data.income.netMonthly || 0;

  const currentAge = useMemo(() => {
    if (currentAgeOverride) return currentAgeOverride;
    if (data.personal?.age) return data.personal.age;
    if (data.personal?.birthYear) {
      return new Date().getFullYear() - data.personal.birthYear;
    }
    return 35;
  }, [currentAgeOverride, data.personal?.age, data.personal?.birthYear]);

  const retirementAge = retirementAgeOverride ?? 67;
  const contractYears = Math.max(0, retirementAge - currentAge);

  const privateContribution =
    monthlyContributionOverride ??
    (isMarried && data.personal?.calcScope === 'beide_personen'
      ? (data.privatePension.contribution_A || 0) + (data.privatePension.contribution_B || 0)
      : data.privatePension.contribution || 0);

  const fundBalance = fundBalanceOverride ??
    (isMarried && data.personal?.calcScope === 'beide_personen'
      ? (data.funds.balance_A || 0) + (data.funds.balance_B || 0)
      : data.funds.balance || 0);

  const defaultAllowance = useMemo(() => (
    isMarried
      ? GOVERNMENT_PARAMETERS_2025.tax.sparerPauschbetragMarried
      : GOVERNMENT_PARAMETERS_2025.tax.sparerPauschbetragSingle
  ), [isMarried]);

  const [allowanceValue, setAllowanceValue] = useState(defaultAllowance);

  useEffect(() => {
    setAllowanceValue(defaultAllowance);
  }, [defaultAllowance]);

  const defaultHalfIncome = useMemo(() => qualifiesFor1262(retirementAge, contractYears), [retirementAge, contractYears]);
  const [useHalfIncome, setUseHalfIncome] = useState(defaultHalfIncome);

  useEffect(() => {
    if (!defaultHalfIncome) {
      setUseHalfIncome(false);
    }
  }, [defaultHalfIncome]);

  const taxSettings = useMemo(() => ({
    ...DEFAULT_TAX_SETTINGS,
    allowance: allowanceValue,
    hasChurchTax: churchTaxEnabled,
    churchTaxRate: churchTaxEnabled ? (churchTaxRate === '09' ? 9 : 8) : DEFAULT_TAX_SETTINGS.churchTaxRate,
    partialExemption: PARTIAL_EXEMPTION_RATES[fundType],
  }), [allowanceValue, churchTaxEnabled, churchTaxRate, fundType]);

  const fundAnalysis = useMemo(() => {
    const assumedAnnualReturn = 0.06;
    const managementFee = 0.75; // illustrative 0.75%

    const actualGain = Math.max(0, fundBalance * assumedAnnualReturn);
    const vorabpauschale = calculateVorabpauschale(
      fundBalance,
      taxSettings.baseRate,
      managementFee,
      actualGain
    );

    const partial = taxSettings.partialExemption ?? 0;
    const afterPartial = vorabpauschale * (1 - partial);

    const allowanceResult = applyAllowance(afterPartial, allowanceValue);
    const effectiveTaxRate = getEffectiveTaxRate(taxSettings);
    const taxDue = allowanceResult.taxableAfterAllowance * effectiveTaxRate / 100;

    return {
      vorabpauschale,
      partialExemption: partial,
      taxableAfterPartial: afterPartial,
      allowanceApplied: allowanceResult.allowanceUsed,
      remainingAllowance: allowanceResult.remainingAllowance,
      taxDue,
      effectiveTaxRate,
    };
  }, [allowanceValue, fundBalance, taxSettings]);

  const insuranceAnalysis = useMemo(() => {
    const startCapital = fundBalance > 0 ? Math.min(fundBalance * 0.1, 25_000) : 0;
    const projection = projectPrivatePension({
      monthlyContribution: privateContribution,
      years: contractYears,
      startCapital,
      retirementAge,
      annualReturn: DEFAULT_ANNUAL_RETURN,
      annuityRate: DEFAULT_ANNUITY_RATE,
      personalTaxRate: DEFAULT_PERSONAL_TAX_RATE,
      useHalfIncomeTaxation: useHalfIncome && defaultHalfIncome,
    });

    const monthlyPensionNet = monthlyPensionEstimate ?? projection.netMonthly;

    return {
      qualifies1262: defaultHalfIncome,
      netMonthly: monthlyPensionNet,
      ertragsanteil: projection.ertragsanteil,
      projectedValue: projection.projectedValue,
      netAnnual: projection.netAnnual,
    };
  }, [contractYears, defaultHalfIncome, fundBalance, monthlyPensionEstimate, privateContribution, retirementAge, useHalfIncome]);

  const statutory = useMemo(() => (
    (isMarried && data.personal?.calcScope === 'beide_personen'
      ? (data.pensions.public67_A || 0) + (data.pensions.public67_B || 0)
      : data.pensions.public67 || 0) || 0
  ), [data.pensions.public67, data.pensions.public67_A, data.pensions.public67_B, data.personal?.calcScope, isMarried]);

  const occupational = useMemo(() => (
    (isMarried && data.personal?.calcScope === 'beide_personen'
      ? (data.occupationalPension.amount_A || 0) + (data.occupationalPension.amount_B || 0)
      : data.occupationalPension.amount || 0) || 0
  ), [data.occupationalPension.amount, data.occupationalPension.amount_A, data.occupationalPension.amount_B, data.personal?.calcScope, isMarried]);

  const riester = useMemo(() => (
    (isMarried && data.personal?.calcScope === 'beide_personen'
      ? (data.riester.amount_A || 0) + (data.riester.amount_B || 0)
      : data.riester.amount || 0) || 0
  ), [data.riester.amount, data.riester.amount_A, data.riester.amount_B, data.personal?.calcScope, isMarried]);

  const gap = useMemo(() => calculateRetirementGap({
    netIncome,
    statutory,
    occupational,
    riester,
    privateNet: insuranceAnalysis.netMonthly,
  }), [netIncome, statutory, occupational, riester, insuranceAnalysis.netMonthly]);

  const otherRetirement = riester + occupational;

  const texts = {
    de: {
      title: 'Steuer-Cockpit',
      subtitle: 'Direkter Überblick über Depot und Police',
      fundTile: 'ETF / Depot',
      insuranceTile: 'Debeka Police',
      vorabpauschale: 'Vorabpauschale (theoretischer Gewinn)',
      partialExemption: 'Teilfreistellung',
      allowanceUsed: 'Genutzter Freibetrag',
      remainingAllowance: 'Restlicher Freibetrag',
      taxDue: 'Steuerlast',
      effectiveRate: 'Effektiver Steuersatz',
      fundType: 'Fondsart',
      churchTax: 'Kirchensteuer',
      churchTaxLabel: 'Kirchensteuer anwenden',
      fundTypeOptions: {
        equity: 'Aktienfonds (30%)',
        mixed: 'Mischfonds (15%)',
        other: 'Sonstige (0%)'
      },
      accumulationTaxFree: 'Ansparphase steuerfrei',
      rule1262: '12/62-Regel',
      fulfilled: 'erfüllt',
      notFulfilled: 'nicht erfüllt',
      earningsPortion: 'Ertragsanteil bei Rentenstart',
      netRetirement: 'Netto ab Rentenbeginn',
      statutory: 'Gesetzliche Rente (monatlich)',
      riesterOther: 'Riester / bAV',
      privateStream: 'Private Rente (netto)',
      combined: 'Gesamt nach Steuern',
      gapClosed: 'Lücke geschlossen',
      gapOpen: 'Lücke verbleibend',
      info: 'Die Werte basieren auf aktuellen Annahmen und werden bei neuen Onboarding-Daten aktualisiert.',
    },
    en: {
      title: 'Tax Cockpit',
      subtitle: 'Instant view for depot and policy taxation',
      fundTile: 'ETF / Brokerage',
      insuranceTile: 'Insurance Policy',
      vorabpauschale: 'Advance lump sum (theoretical gain)',
      partialExemption: 'Partial exemption',
      allowanceUsed: 'Allowance used',
      remainingAllowance: 'Remaining allowance',
      taxDue: 'Tax due',
      effectiveRate: 'Effective tax rate',
      fundType: 'Fund type',
      churchTax: 'Church tax',
      churchTaxLabel: 'Apply church tax',
      fundTypeOptions: {
        equity: 'Equity fund (30%)',
        mixed: 'Mixed fund (15%)',
        other: 'Other (0%)'
      },
      accumulationTaxFree: 'Accumulation phase tax-free',
      rule1262: '12/62 rule',
      fulfilled: 'met',
      notFulfilled: 'not met',
      earningsPortion: 'Taxable earnings portion at retirement',
      netRetirement: 'Net payout from retirement start',
      statutory: 'Statutory pension (monthly)',
      riesterOther: 'Riester / occupational plans',
      privateStream: 'Private pension (net)',
      combined: 'Combined after tax',
      gapClosed: 'Gap closed',
      gapOpen: 'Gap remaining',
      info: 'Values update automatically when onboarding data changes.',
    }
  };

  const t = texts[language];

  const gapStatus = gap.gapRatio <= 0
    ? 'good'
    : gap.gapRatio <= 0.1
      ? 'neutral'
      : 'bad';

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">{t.title}</h2>
          <p className="text-muted-foreground text-sm">{t.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="space-y-1">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">{t.fundType}</Label>
            <Select value={fundType} onValueChange={(value: FundType) => setFundType(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equity">{t.fundTypeOptions.equity}</SelectItem>
                <SelectItem value="mixed">{t.fundTypeOptions.mixed}</SelectItem>
                <SelectItem value="other">{t.fundTypeOptions.other}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">{t.churchTax}</Label>
            <div className="flex items-center gap-3">
              <Switch checked={churchTaxEnabled} onCheckedChange={setChurchTaxEnabled} />
              {churchTaxEnabled && (
                <Select value={churchTaxRate} onValueChange={(value: '08' | '09') => setChurchTaxRate(value)}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="08">8%</SelectItem>
                    <SelectItem value="09">9%</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <span className="text-xs text-muted-foreground">{t.churchTaxLabel}</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowSettings((prev) => !prev)}
            aria-label={language === 'de' ? 'Einstellungen anzeigen' : 'Toggle settings'}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {showSettings && (
        <Card className="bg-muted/40 border-dashed border-muted">
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                {language === 'de' ? 'Freistellungsauftrag' : 'Saver allowance'}
              </Label>
              <div className="relative max-w-xs">
                <Input
                  type="number"
                  value={allowanceValue}
                  onChange={(e) => setAllowanceValue(Number(e.target.value) || 0)}
                  min={0}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">{t.rule1262}</Label>
              <div className="flex items-center justify-between max-w-xs">
                <span className="text-sm text-muted-foreground">
                  {defaultHalfIncome ? t.fulfilled : t.notFulfilled}
                </span>
                <Switch
                  checked={useHalfIncome}
                  onCheckedChange={setUseHalfIncome}
                  disabled={!defaultHalfIncome}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                {language === 'de' ? 'Annahme Rendite (p.a.)' : 'Return assumption (p.a.)'}
              </Label>
              <div className="text-sm text-muted-foreground">
                {(DEFAULT_ANNUAL_RETURN * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {language === 'de'
                  ? 'Für Sensitivitäten bitte Beitrags- und Altersparameter im Onboarding anpassen.'
                  : 'Adjust onboarding contribution and age inputs for scenario sensitivities.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-blue-200 bg-blue-50/60">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <PieChart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle>{t.fundTile}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(fundBalance)} • {t.effectiveRate}: {(fundAnalysis.effectiveTaxRate).toFixed(2)}%
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t.vorabpauschale}</span>
              <span className="font-medium">{formatCurrency(fundAnalysis.vorabpauschale)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t.partialExemption}</span>
              <span className="font-medium">{(fundAnalysis.partialExemption * 100).toFixed(0)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t.allowanceUsed}</span>
              <span className="font-medium">{formatCurrency(fundAnalysis.allowanceApplied)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t.remainingAllowance}</span>
              <span className="font-medium">{formatCurrency(fundAnalysis.remainingAllowance)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex items-center justify-between text-base font-semibold">
              <span>{t.taxDue}</span>
              <span>{formatCurrency(fundAnalysis.taxDue)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/70">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100">
              <Shield className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <CardTitle>{t.insuranceTile}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {t.accumulationTaxFree} • {t.rule1262}:{' '}
                <span className={insuranceAnalysis.qualifies1262 ? 'text-emerald-600 font-medium' : 'text-red-500 font-medium'}>
                  {insuranceAnalysis.qualifies1262 ? t.fulfilled : t.notFulfilled}
                </span>
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t.earningsPortion}</span>
              <span className="font-medium">{insuranceAnalysis.ertragsanteil}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t.netRetirement}</span>
              <span className="font-medium">{formatCurrency(insuranceAnalysis.netMonthly)}</span>
            </div>
            {gap && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t.statutory}</span>
                  <span className="font-medium">{formatCurrency(statutory)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t.riesterOther}</span>
                  <span className="font-medium">{formatCurrency(otherRetirement)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t.privateStream}</span>
                  <span className="font-medium">{formatCurrency(insuranceAnalysis.netMonthly)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between text-base font-semibold">
                  <span>{t.combined}</span>
                  <span>{formatCurrency(gap.totalRetirement)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {gapStatus === 'good' ? t.gapClosed : t.gapOpen}
                  </span>
                  <span className={`font-semibold ${
                    gapStatus === 'good'
                      ? 'text-emerald-600'
                      : gapStatus === 'neutral'
                        ? 'text-yellow-600'
                        : 'text-red-500'
                  }`}>
                    {formatCurrency(gap.gapValue)}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="w-4 h-4 mt-0.5" />
        <span>{t.info}</span>
      </div>
    </div>
  );
};
