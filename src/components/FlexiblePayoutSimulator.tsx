import React, { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, TrendingDown, Info } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { calculateMonthlyPayoutAfterTax, TaxSettings, DEFAULT_TAX_SETTINGS } from '@/utils/germanTaxCalculations';
import { Switch } from '@/components/ui/switch';

interface FlexiblePayoutSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  portfolioValue: number;
  payoutStartAge: number;
  payoutEndAge: number;
  language?: 'de' | 'en';
}

interface PayoutSimulationPoint {
  year: number;
  age: number;
  portfolioValue: number;
  annualWithdrawal: number;
  annualGains: number;
  annualTax: number;
  netAnnualPayout: number;
  netMonthlyPayout: number;
}

export const FlexiblePayoutSimulator: React.FC<FlexiblePayoutSimulatorProps> = ({
  isOpen,
  onClose,
  portfolioValue,
  payoutStartAge,
  payoutEndAge,
  language = 'de'
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [annualWithdrawalAmount, setAnnualWithdrawalAmount] = useState(
    Math.round(portfolioValue * 0.04) // 4% rule default
  );
  const [hasCustomWithdrawal, setHasCustomWithdrawal] = useState(false);

  const [taxSettings, setTaxSettings] = useState<TaxSettings>({
    ...DEFAULT_TAX_SETTINGS,
    allowance: 1000, // Freistellungsauftrag default
    useHalfIncomeTaxation: false,
    partialExemption: 0.30 // 30% für Aktienfonds (§20 InvStG)
  });

  useEffect(() => {
    if (!isOpen) {
      setHasCustomWithdrawal(false);
      setAnnualWithdrawalAmount(Math.round(portfolioValue * 0.04));
      return;
    }

    if (!hasCustomWithdrawal) {
      setAnnualWithdrawalAmount(Math.round(portfolioValue * 0.04));
    }
  }, [portfolioValue, isOpen, hasCustomWithdrawal]);

  // Calculate payout simulation
  const simulationData = useMemo((): PayoutSimulationPoint[] => {
    const data: PayoutSimulationPoint[] = [];
    let remainingValue = portfolioValue;
    const years = payoutEndAge - payoutStartAge;
    const expectedReturn = 0.05; // 5% conservative return during payout

    for (let year = 0; year <= years; year++) {
      const age = payoutStartAge + year;

      // Calculate gains for this year (assuming growth continues)
      const annualGains = remainingValue * expectedReturn;

      // Apply tax calculation
      const taxResult = calculateMonthlyPayoutAfterTax(
        annualWithdrawalAmount,
        annualGains,
        age,
        taxSettings
      );

      data.push({
        year: year + 1,
        age,
        portfolioValue: Math.max(0, remainingValue),
        annualWithdrawal: annualWithdrawalAmount,
        annualGains,
        annualTax: taxResult.annualTax,
        netAnnualPayout: taxResult.annualNet,
        netMonthlyPayout: taxResult.monthlyNet
      });

      // Update portfolio value for next year
      remainingValue = remainingValue + annualGains - annualWithdrawalAmount;

      // Stop if portfolio depleted
      if (remainingValue <= 0) {
        remainingValue = 0;
        break;
      }
    }

    return data;
  }, [portfolioValue, payoutStartAge, payoutEndAge, annualWithdrawalAmount, taxSettings]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    if (simulationData.length === 0) return null;

    const totalWithdrawn = simulationData.reduce((sum, point) => sum + point.annualWithdrawal, 0);
    const totalTaxes = simulationData.reduce((sum, point) => sum + point.annualTax, 0);
    const totalNetPayout = simulationData.reduce((sum, point) => sum + point.netAnnualPayout, 0);
    const averageMonthlyNet = totalNetPayout / simulationData.length / 12;
    const finalPortfolioValue = simulationData[simulationData.length - 1]?.portfolioValue || 0;

    return {
      totalWithdrawn,
      totalTaxes,
      totalNetPayout,
      averageMonthlyNet,
      finalPortfolioValue,
      yearsOfPayout: simulationData.length
    };
  }, [simulationData]);

  const texts = {
    de: {
      title: 'Flexible Entnahmephase Simulator',
      description: 'Simulieren Sie Ihre flexible Entnahmephase mit individuellen Steuereinstellungen',
      annualWithdrawal: 'Jährliche Entnahme',
      settings: 'Einstellungen',
      allowance: 'Freistellungsauftrag',
      halfIncome: 'Halbeinkünfteverfahren ab 62',
      partialExemption: 'Teilfreistellung (30%)',
      summary: 'Zusammenfassung',
      totalWithdrawn: 'Gesamte Entnahmen',
      totalTaxes: 'Gesamte Steuern',
      netPayout: 'Netto-Auszahlung',
      monthlyNet: 'Monatlich nach Steuern',
      finalValue: 'Restwert mit',
      chart: 'Vermögensentwicklung',
      infoTitle: 'Steuerberechnung',
      infoText: 'Die Berechnung berücksichtigt Freistellungsauftrag, Teilfreistellung (30% auf Erträge für Aktienfonds) und optional das Halbeinkünfteverfahren ab 62 Jahren.'
    },
    en: {
      title: 'Flexible Payout Phase Simulator',
      description: 'Simulate your flexible payout phase with individual tax settings',
      annualWithdrawal: 'Annual Withdrawal',
      settings: 'Settings',
      allowance: 'Tax Allowance',
      halfIncome: 'Half-Income Taxation from 62',
      partialExemption: 'Partial Exemption (30%)',
      summary: 'Summary',
      totalWithdrawn: 'Total Withdrawals',
      totalTaxes: 'Total Taxes',
      netPayout: 'Net Payout',
      monthlyNet: 'Monthly After Tax',
      finalValue: 'Remaining Value at',
      chart: 'Portfolio Development',
      infoTitle: 'Tax Calculation',
      infoText: 'The calculation considers tax allowance, partial exemption (30% on gains for equity funds) and optionally half-income taxation from age 62.'
    }
  };

  const t = texts[language];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-2xl">
            <TrendingDown className="w-6 h-6 text-primary" />
            <span>{t.title}</span>
          </DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{t.annualWithdrawal}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {t.settings}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.annualWithdrawal}</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={annualWithdrawalAmount}
                      onChange={(e) => {
                        const nextValue = Number(e.target.value);
                        setAnnualWithdrawalAmount(Number.isFinite(nextValue) ? nextValue : 0);
                        setHasCustomWithdrawal(true);
                      }}
                      className="text-lg font-bold pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      €
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {language === 'de' ? 'Monatlich: ' : 'Monthly: '}
                    {formatCurrency(annualWithdrawalAmount / 12)}
                  </p>
                </div>

                {showSettings && (
                  <>
                    <div className="space-y-2">
                      <Label>{t.allowance}</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={taxSettings.allowance}
                          onChange={(e) => setTaxSettings(prev => ({
                            ...prev,
                            allowance: Number(e.target.value)
                          }))}
                          className="pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          €
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>{t.halfIncome}</Label>
                        <Switch
                          checked={taxSettings.useHalfIncomeTaxation}
                          onCheckedChange={(checked) => setTaxSettings(prev => ({
                            ...prev,
                            useHalfIncomeTaxation: checked
                          }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>{t.partialExemption}</Label>
                        <span className="text-sm font-medium">
                          {(taxSettings.partialExemption! * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(summary.averageMonthlyNet)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{t.monthlyNet}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(summary.totalNetPayout)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{t.netPayout}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(summary.totalTaxes)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{t.totalTaxes}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(summary.finalPortfolioValue)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t.finalValue} {payoutEndAge}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Info Box */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">{t.infoTitle}</h4>
                  <p className="text-sm text-blue-800">{t.infoText}</p>
                  {summary && (
                    <div className="mt-3 text-sm text-blue-900 font-medium">
                      {language === 'de' ? 'Effektive Steuerbelastung: ' : 'Effective Tax Rate: '}
                      {((summary.totalTaxes / summary.totalWithdrawn) * 100).toFixed(2)}%
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle>{t.chart}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={simulationData}>
                  <defs>
                    <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
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
                  <Area
                    type="monotone"
                    dataKey="portfolioValue"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorPortfolio)"
                    name={language === 'de' ? 'Portfoliowert' : 'Portfolio Value'}
                  />
                  <Area
                    type="monotone"
                    dataKey="netAnnualPayout"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorNet)"
                    name={language === 'de' ? 'Netto-Auszahlung' : 'Net Payout'}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Detailed Table */}
          <Card>
            <CardHeader>
              <CardTitle>{t.summary}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">{language === 'de' ? 'Alter' : 'Age'}</th>
                      <th className="text-right p-2">{language === 'de' ? 'Portfoliowert' : 'Portfolio'}</th>
                      <th className="text-right p-2">{language === 'de' ? 'Entnahme' : 'Withdrawal'}</th>
                      <th className="text-right p-2">{language === 'de' ? 'Steuern' : 'Taxes'}</th>
                      <th className="text-right p-2">{language === 'de' ? 'Netto/Monat' : 'Net/Month'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {simulationData.filter((_, i) => i % 5 === 0 || i === simulationData.length - 1).map((point) => (
                      <tr key={point.year} className="border-b hover:bg-accent/50">
                        <td className="p-2">{point.age}</td>
                        <td className="text-right p-2 font-mono">{formatCurrency(point.portfolioValue)}</td>
                        <td className="text-right p-2 font-mono">{formatCurrency(point.annualWithdrawal)}</td>
                        <td className="text-right p-2 font-mono text-red-600">{formatCurrency(point.annualTax)}</td>
                        <td className="text-right p-2 font-mono text-green-600 font-bold">
                          {formatCurrency(point.netMonthlyPayout)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
