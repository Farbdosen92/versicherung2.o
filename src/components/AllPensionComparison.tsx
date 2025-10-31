import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { Shield, TrendingUp } from 'lucide-react';

interface AllPensionComparisonProps {
  language?: 'de' | 'en';
  currentAge: number;
  netMonthlyIncome: number;
  retirementAge?: number;
  privatePensionMonthly?: number;
}

interface ComparisonDataPoint {
  age: number;
  year: number;
  nettoEinkommen: number;
  gesetzlicheRente: number;
  privateRente: number;
  riesterRente: number;
  total: number;
}

export const AllPensionComparison: React.FC<AllPensionComparisonProps> = ({
  language = 'de',
  currentAge,
  netMonthlyIncome,
  retirementAge = 67,
  privatePensionMonthly = 0
}) => {
  const [showAllIncomeStreams, setShowAllIncomeStreams] = useState(false);
  const { data } = useOnboardingStore();

  // Get pension data from onboarding
  const pensionData = useMemo(() => {
    const pensions = data.pensions || {};
    const riester = data.riester || {};
    const privatePension = data.privatePension || {};

    // Check if married and calculating for both
    const isMarriedBoth = data.personal?.maritalStatus === 'verheiratet' && data.personal?.calcScope === 'beide_personen';

    return {
      gesetzlicheRente: isMarriedBoth
        ? (pensions.public67_A || 0) + (pensions.public67_B || 0)
        : (pensions.public67 || 0),
      beamtenpension: isMarriedBoth
        ? (pensions.civil67_A || 0) + (pensions.civil67_B || 0)
        : (pensions.civil67 || 0),
      versorgungswerk: isMarriedBoth
        ? (pensions.profession67_A || 0) + (pensions.profession67_B || 0)
        : (pensions.profession67 || 0),
      zvkVbl: isMarriedBoth
        ? (pensions.zvkVbl67_A || 0) + (pensions.zvkVbl67_B || 0)
        : (pensions.zvkVbl67 || 0),
      riester: isMarriedBoth
        ? (riester.amount_A || 0) + (riester.amount_B || 0)
        : (riester.amount || 0),
      privatePension: privatePensionMonthly,
      privateContribution: isMarriedBoth
        ? (privatePension.contribution_A || 0) + (privatePension.contribution_B || 0)
        : (privatePension.contribution || 0)
    };
  }, [data, privatePensionMonthly]);

  // Calculate total statutory pension
  const totalStatutoryPension = useMemo(() => {
    return pensionData.gesetzlicheRente + pensionData.beamtenpension +
           pensionData.versorgungswerk + pensionData.zvkVbl;
  }, [pensionData]);

  // Generate comparison data
  const chartData = useMemo((): ComparisonDataPoint[] => {
    const data: ComparisonDataPoint[] = [];
    const currentYear = new Date().getFullYear();
    const yearsToRetirement = retirementAge - currentAge;
    const yearsAfterRetirement = 20; // Show 20 years after retirement

    for (let i = 0; i <= yearsToRetirement + yearsAfterRetirement; i++) {
      const age = currentAge + i;
      const year = currentYear + i;
      const isRetired = age >= retirementAge;

      const privateRenteValue = isRetired ? pensionData.privatePension : 0;
      const riesterValue = isRetired ? pensionData.riester : 0;

      data.push({
        age,
        year,
        nettoEinkommen: isRetired ? 0 : netMonthlyIncome,
        gesetzlicheRente: isRetired ? totalStatutoryPension : 0,
        privateRente: privateRenteValue,
        riesterRente: riesterValue,
        total: isRetired
          ? totalStatutoryPension + privateRenteValue + riesterValue
          : netMonthlyIncome
      });
    }

    return data;
  }, [currentAge, retirementAge, netMonthlyIncome, totalStatutoryPension, pensionData]);

  const texts = {
    de: {
      title: 'Vergleich aller Altersvorsorge-Optionen',
      description: 'Übersicht über Ihr Einkommen vor und nach Renteneintritt',
      toggle: 'Alle Einkommensströme anzeigen',
      netIncome: 'Netto-Einkommen',
      statutoryPension: 'Gesetzliche Rente',
      privateRente: 'Private Rente',
      riesterRente: 'Riester Rente',
      privatePension: 'Private Rente (Simulation)',
      total: 'Gesamt',
      beforeRetirement: 'Vor Rente',
      afterRetirement: 'Nach Renteneintritt',
      monthlyAmount: 'Monatlicher Betrag',
      summary: 'Zusammenfassung'
    },
    en: {
      title: 'Comparison of All Pension Options',
      description: 'Overview of your income before and after retirement',
      toggle: 'Show All Income Streams',
      netIncome: 'Net Income',
      statutoryPension: 'Statutory Pension',
      privateRente: 'Private Pension',
      riesterRente: 'Riester Pension',
      privatePension: 'Private Pension (simulated)',
      total: 'Total',
      beforeRetirement: 'Before Retirement',
      afterRetirement: 'After Retirement',
      monthlyAmount: 'Monthly Amount',
      summary: 'Summary'
    }
  };

  const t = texts[language];

  // Color scheme for different income streams
  const colors = {
    nettoEinkommen: '#3b82f6',  // Blue
    gesetzlicheRente: '#10b981', // Green
    privateRente: '#8b5cf6',     // Purple
    riesterRente: '#f59e0b'      // Orange
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="text-2xl">{t.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center cursor-pointer transition-all ${
                  showAllIncomeStreams
                    ? 'bg-green-500 border-green-500'
                    : 'bg-gray-200 border-gray-300'
                }`}
                onClick={() => setShowAllIncomeStreams(!showAllIncomeStreams)}
                >
                  {showAllIncomeStreams && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <Label className="text-sm font-medium cursor-pointer" onClick={() => setShowAllIncomeStreams(!showAllIncomeStreams)}>
                {t.toggle}
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Chart */}
          <div className="mb-8">
            <ResponsiveContainer width="100%" height={500}>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNettoEinkommen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.nettoEinkommen} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={colors.nettoEinkommen} stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="colorGesetzlicheRente" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.gesetzlicheRente} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={colors.gesetzlicheRente} stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="colorPrivateRente" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.privateRente} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={colors.privateRente} stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="colorRiesterRente" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.riesterRente} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={colors.riesterRente} stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="age"
                  label={{ value: language === 'de' ? 'Alter' : 'Age', position: 'insideBottom', offset: -5 }}
                />
                <YAxis
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  label={{ value: '€', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(age) => `${language === 'de' ? 'Alter' : 'Age'}: ${age}`}
                />
                <Legend />

                {!showAllIncomeStreams ? (
                  // Chart 1: Only Netto-Einkommen before retirement, Vista + Gesetzliche after
                  <>
                    <Area
                      type="monotone"
                      dataKey="nettoEinkommen"
                      stackId="1"
                      stroke={colors.nettoEinkommen}
                      fill="url(#colorNettoEinkommen)"
                      name={t.netIncome}
                    />
                    <Area
                      type="monotone"
                      dataKey="gesetzlicheRente"
                      stackId="1"
                      stroke={colors.gesetzlicheRente}
                      fill="url(#colorGesetzlicheRente)"
                      name={t.statutoryPension}
                    />
                    <Area
                      type="monotone"
                      dataKey="privateRente"
                      stackId="1"
                      stroke={colors.privateRente}
                      fill="url(#colorPrivateRente)"
                      name={t.privateRente}
                    />
                  </>
                ) : (
                  // Chart 2: All income streams after retirement
                  <>
                    <Area
                      type="monotone"
                      dataKey="nettoEinkommen"
                      stackId="1"
                      stroke={colors.nettoEinkommen}
                      fill="url(#colorNettoEinkommen)"
                      name={t.netIncome}
                    />
                    <Area
                      type="monotone"
                      dataKey="gesetzlicheRente"
                      stackId="1"
                      stroke={colors.gesetzlicheRente}
                      fill="url(#colorGesetzlicheRente)"
                      name={t.statutoryPension}
                    />
                    <Area
                      type="monotone"
                      dataKey="riesterRente"
                      stackId="1"
                      stroke={colors.riesterRente}
                      fill="url(#colorRiesterRente)"
                      name={t.riesterRente}
                    />
                    <Area
                      type="monotone"
                      dataKey="privateRente"
                      stackId="1"
                      stroke={colors.privateRente}
                      fill="url(#colorPrivateRente)"
                      name={t.privateRente}
                    />
                  </>
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Table */}
          <Card className="bg-accent/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>{t.summary}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-background rounded-lg border border-border">
                  <div className="text-xs text-muted-foreground mb-1">{t.netIncome}</div>
                  <div className="text-xl font-bold" style={{ color: colors.nettoEinkommen }}>
                    {formatCurrency(netMonthlyIncome)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{t.beforeRetirement}</div>
                </div>

                <div className="text-center p-4 bg-background rounded-lg border border-border">
                  <div className="text-xs text-muted-foreground mb-1">{t.statutoryPension}</div>
                  <div className="text-xl font-bold" style={{ color: colors.gesetzlicheRente }}>
                    {formatCurrency(totalStatutoryPension)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{t.afterRetirement}</div>
                </div>

                <div className="text-center p-4 bg-background rounded-lg border border-border">
                  <div className="text-xs text-muted-foreground mb-1">{t.privateRente}</div>
                  <div className="text-xl font-bold" style={{ color: colors.privateRente }}>
                    {formatCurrency(pensionData.privatePension)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{t.afterRetirement}</div>
                </div>

                <div className="text-center p-4 bg-background rounded-lg border border-border">
                  <div className="text-xs text-muted-foreground mb-1">{t.riesterRente}</div>
                  <div className="text-xl font-bold" style={{ color: colors.riesterRente }}>
                    {formatCurrency(pensionData.riester)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{t.afterRetirement}</div>
                </div>

                <div className="text-center p-4 bg-primary/10 rounded-lg border-2 border-primary">
                  <div className="text-xs text-muted-foreground mb-1">{t.total}</div>
                  <div className="text-xl font-bold text-primary">
                    {formatCurrency(totalStatutoryPension + pensionData.privatePension + pensionData.riester)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{t.afterRetirement}</div>
                </div>
              </div>

              {/* Income Replacement Ratio */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-900">
                  <strong>{language === 'de' ? 'Versorgungsquote:' : 'Income Replacement Ratio:'}</strong>
                  {' '}
                  {(((totalStatutoryPension + pensionData.privatePension + pensionData.riester) / netMonthlyIncome) * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  {language === 'de'
                    ? 'Ihr Renteneinkommen im Verhältnis zu Ihrem aktuellen Netto-Einkommen'
                    : 'Your retirement income relative to your current net income'}
                </p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};
