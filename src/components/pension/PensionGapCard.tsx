import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle2, MinusCircle } from 'lucide-react';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { formatCurrency } from '@/lib/utils';
import {
  projectPrivatePension,
  calculateRetirementGap,
  qualifiesFor1262,
} from '@/lib/retirementMath';

interface PensionGapCardProps {
  language?: 'de' | 'en';
  retirementAge?: number;
}

export const PensionGapCard: React.FC<PensionGapCardProps> = ({
  language = 'de',
  retirementAge = 67,
}) => {
  const { data } = useOnboardingStore();
  const isMarried = data.personal?.maritalStatus === 'verheiratet';
  const scopeBoth = isMarried && data.personal?.calcScope === 'beide_personen';

  const netIncome = scopeBoth
    ? (data.income.netMonthly_A || 0) + (data.income.netMonthly_B || 0)
    : data.income.netMonthly || 0;

  const statutory = scopeBoth
    ? (data.pensions.public67_A || 0) + (data.pensions.public67_B || 0)
    : data.pensions.public67 || 0;

  const riester = scopeBoth
    ? (data.riester.amount_A || 0) + (data.riester.amount_B || 0)
    : data.riester.amount || 0;

  const occupational = scopeBoth
    ? (data.occupationalPension.amount_A || 0) + (data.occupationalPension.amount_B || 0)
    : data.occupationalPension.amount || 0;

  const privateContribution = scopeBoth
    ? (data.privatePension.contribution_A || 0) + (data.privatePension.contribution_B || 0)
    : data.privatePension.contribution || 0;

  const currentAge = useMemo(() => {
    if (data.personal?.age) return data.personal.age;
    if (data.personal?.birthYear) {
      return new Date().getFullYear() - data.personal.birthYear;
    }
    return 35;
  }, [data.personal?.age, data.personal?.birthYear]);

  const contributionYears = Math.max(0, retirementAge - currentAge);

  const privateProjection = useMemo(() => {
    if (privateContribution <= 0 || contributionYears <= 0) {
      return null;
    }

    return projectPrivatePension({
      monthlyContribution: privateContribution,
      years: contributionYears,
      retirementAge,
      useHalfIncomeTaxation: qualifiesFor1262(retirementAge, contributionYears),
    });
  }, [privateContribution, contributionYears, retirementAge]);

  const privateNetMonthly = privateProjection?.netMonthly ?? 0;

  const totals = useMemo(() => calculateRetirementGap({
    netIncome,
    statutory,
    occupational,
    riester,
    privateNet: privateNetMonthly,
  }), [netIncome, statutory, occupational, riester, privateNetMonthly]);

  const texts = {
    de: {
      title: 'Monatliche Versorgungslücke',
      today: 'Heutiges Netto in Kaufkraft',
      retirement: 'Netto-Rentenströme',
      statutory: 'Gesetzliche Rente',
      private: 'Private Vorsorge (netto)',
      riester: 'Riester / bAV',
      gapClosed: 'Lücke geschlossen',
      gapOpen: 'Offene Lücke',
    },
    en: {
      title: 'Monthly Pension Gap',
      today: 'Current net in real terms',
      retirement: 'Net pension streams',
      statutory: 'Statutory pension',
      private: 'Private pension (net)',
      riester: 'Riester / occupational plans',
      gapClosed: 'Gap closed',
      gapOpen: 'Gap remaining',
    },
  };

  const t = texts[language];

  const status =
    totals.gapValue <= 0
      ? 'closed'
      : totals.gapRatio <= 0.1
        ? 'warning'
        : 'open';

  const Icon =
    status === 'closed'
      ? CheckCircle2
      : status === 'warning'
        ? MinusCircle
        : AlertTriangle;

  const progressValue = Math.min(
    100,
    Math.max(0, (totals.totalRetirement / (netIncome || 1)) * 100),
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{t.title}</CardTitle>
        <Icon
          className={`w-6 h-6 ${
            status === 'closed'
              ? 'text-green-600'
              : status === 'warning'
                ? 'text-yellow-600'
                : 'text-red-500'
          }`}
        />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t.today}</span>
          <span className="font-medium">{formatCurrency(netIncome)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t.retirement}</span>
          <span className="font-medium">{formatCurrency(totals.totalRetirement)}</span>
        </div>

        <Progress value={progressValue} className="h-2" />

        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>{t.statutory}</span>
            <span>{formatCurrency(statutory)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>{t.riester}</span>
            <span>{formatCurrency(riester + occupational)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>{t.private}</span>
            <span>{formatCurrency(privateNetMonthly)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-base font-semibold">
          <span>{status === 'closed' ? t.gapClosed : t.gapOpen}</span>
          <span
            className={
              status === 'closed'
                ? 'text-green-600'
                : status === 'warning'
                  ? 'text-yellow-600'
                  : 'text-red-500'
            }
          >
            {formatCurrency(totals.gapValue)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
