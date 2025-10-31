import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, TrendingUp, AlertCircle } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import {
  calculateVorabpauschale,
  getEffectiveTaxRate,
  DEFAULT_TAX_SETTINGS,
  TaxSettings
} from '@/utils/germanTaxCalculations';
import { PARTIAL_EXEMPTION_RATES } from '@/data/governmentParameters';

interface FundSavingsPlanComparisonProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyContribution: number;
  currentAge: number;
  retirementAge: number;
  language?: 'de' | 'en';
}

interface SimulationPoint {
  year: number;
  age: number;
  // Fondsparrplan
  fundContributions: number;
  fundGrossValue: number;
  fundTaxesPaid: number;
  fundNetValue: number;
  // Private Rentenversicherung (fondgebunden)
  pensionContributions: number;
  pensionGrossValue: number;
  pensionTaxesPaid: number;
  pensionNetValue: number;
}

export const FundSavingsPlanComparison: React.FC<FundSavingsPlanComparisonProps> = ({
  isOpen,
  onClose,
  monthlyContribution,
  currentAge,
  retirementAge,
  language = 'de'
}) => {
  const [showSettings, setShowSettings] = useState(false);

  // Fund Savings Plan parameters
  const [fundParams, setFundParams] = useState({
    returnRate: 7.0, // % p.a.
    frontLoad: 5.0, // % one-time
    managementFee: 0.75 // % p.a. vom Guthaben
  });

  // Private Pension Insurance parameters
  const [pensionParams, setPensionParams] = useState({
    returnRate: 6.5, // % p.a.
    managementFee: 1.0, // % p.a. vom Guthaben
    policyFee: 0.4 // % p.a.
  });

  const [fundType, setFundType] = useState<'equity' | 'mixed' | 'other'>('equity');
  const [allowanceValue, setAllowanceValue] = useState(DEFAULT_TAX_SETTINGS.allowance);

  const taxSettings = useMemo<TaxSettings>(() => ({
    ...DEFAULT_TAX_SETTINGS,
    allowance: allowanceValue,
    partialExemption: PARTIAL_EXEMPTION_RATES[fundType],
  }), [allowanceValue, fundType]);

  // Simulation calculation
  const simulationData = useMemo((): SimulationPoint[] => {
    const data: SimulationPoint[] = [];
    const years = retirementAge - currentAge;
    const yearsExtended = 18; // Show until age 85

    let fundValue = 0;
    let fundTaxesPaidTotal = 0;
    let fundContributionsTotal = 0;

    let pensionValue = 0;
    let pensionTaxesPaidTotal = 0;
    let pensionContributionsTotal = 0;

    for (let year = 0; year <= years + yearsExtended; year++) {
      const age = currentAge + year;
      const isAccumulationPhase = age < retirementAge;

      if (isAccumulationPhase) {
        // ===== FONDSPARRPLAN =====
        const annualContribution = monthlyContribution * 12;
        const frontLoadFee = year === 0 ? annualContribution * (fundParams.frontLoad / 100) : 0;
        const netContribution = annualContribution - frontLoadFee;

        fundContributionsTotal += annualContribution;

        // Growth
        const fundGrowth = fundValue * (fundParams.returnRate / 100);
        fundValue += netContribution + fundGrowth;

        // Management fee
        const managementFee = fundValue * (fundParams.managementFee / 100);
        fundValue -= managementFee;

        // Vorabpauschale (annual tax on unrealized gains)
        const actualGains = fundValue - fundContributionsTotal;
        const vorabpauschale = calculateVorabpauschale(
          fundValue,
          taxSettings.baseRate,
          fundParams.managementFee,
          actualGains
        );

        const taxRate = getEffectiveTaxRate(taxSettings) / 100;
        const annualTax = Math.max(0, Math.min(vorabpauschale * taxRate, actualGains * taxRate));
        fundValue -= annualTax;
        fundTaxesPaidTotal += annualTax;

        // ===== PRIVATE RENTENVERSICHERUNG (FONDGEBUNDEN) =====
        pensionContributionsTotal += annualContribution;

        // Growth (with fees)
        const pensionGrowth = pensionValue * (pensionParams.returnRate / 100);
        pensionValue += annualContribution + pensionGrowth;

        // Fees
        const pensionMgmtFee = pensionValue * (pensionParams.managementFee / 100);
        const policyFee = pensionValue * (pensionParams.policyFee / 100);
        pensionValue -= (pensionMgmtFee + policyFee);

        // NO annual tax during accumulation for insurance products!
      } else {
        // Payout phase: continue growth without further contributions
        const fundGrowth = fundValue * (fundParams.returnRate / 100);
        fundValue += fundGrowth;

        const managementFee = fundValue * (fundParams.managementFee / 100);
        fundValue -= managementFee;

        const actualGains = Math.max(0, fundValue - fundContributionsTotal);
        const vorabpauschale = calculateVorabpauschale(
          fundValue,
          taxSettings.baseRate,
          fundParams.managementFee,
          actualGains
        );
        const taxRate = getEffectiveTaxRate(taxSettings) / 100;
        const annualTax = Math.max(0, Math.min(vorabpauschale * taxRate, actualGains * taxRate));
        fundValue -= annualTax;
        fundTaxesPaidTotal += annualTax;

        const pensionGrowth = pensionValue * (pensionParams.returnRate / 100);
        pensionValue += pensionGrowth;

        const pensionMgmtFee = pensionValue * (pensionParams.managementFee / 100);
        const policyFee = pensionValue * (pensionParams.policyFee / 100);
        pensionValue -= (pensionMgmtFee + policyFee);
      }

      data.push({
        year: year + 1,
        age,
        fundContributions: fundContributionsTotal,
        fundGrossValue: fundValue + fundTaxesPaidTotal,
        fundTaxesPaid: fundTaxesPaidTotal,
        fundNetValue: fundValue,
        pensionContributions: pensionContributionsTotal,
        pensionGrossValue: pensionValue,
        pensionTaxesPaid: pensionTaxesPaidTotal,
        pensionNetValue: pensionValue
      });
    }

    return data;
  }, [monthlyContribution, currentAge, retirementAge, fundParams, pensionParams, taxSettings]);

  // Get values at retirement (age 67) and age 85
  const valueAt67 = useMemo(() => {
    return simulationData.find(d => d.age === 67) || simulationData[simulationData.length - 1];
  }, [simulationData]);

  const valueAt85 = useMemo(() => {
    return simulationData.find(d => d.age === 85) || simulationData[simulationData.length - 1];
  }, [simulationData]);

  const texts = {
    de: {
      title: 'Fondsparrplan vs. Private Rentenversicherung',
      description: 'Vergleich der steuerlichen Behandlung und Wertentwicklung',
      fundPlan: 'Fondsparrplan',
      pensionInsurance: 'Private Rentenversicherung (fondgebunden)',
      settings: 'Einstellungen',
      returnRate: 'Rendite p.a.',
      frontLoad: 'Ausgabeaufschlag',
      managementFee: 'Jährliche Verwaltungsgebühr',
      policyFee: 'Policengebühr',
      taxSettings: 'Steuer-Einstellungen',
      fundTypeLabel: 'Fondsart',
      allowance: 'Freistellungsauftrag (€ / Jahr)',
      fundTypeOptions: {
        equity: 'Aktienfonds (30%)',
        mixed: 'Mischfonds (15%)',
        other: 'Sonstige (0%)'
      },
      valueAt67: 'Wert mit 67',
      valueAt85: 'Wert mit 85',
      afterTax: 'Nach Steuern',
      taxesPaid: 'Gezahlte Steuern',
      advantage: 'Vorteil',
      areaChart: 'Vermögensentwicklung (Flächendiagramm)',
      lineChart: 'Vermögensvergleich (Liniendiagramm)',
      taxInfo: 'Steuerliche Unterschiede',
      taxInfoFund: '25% Kapitalertragssteuer jährlich auf Vorabpauschale',
      taxInfoPension: 'Keine laufende Besteuerung, Steuervorteile bei Auszahlung'
    },
    en: {
      title: 'Fund Savings Plan vs. Private Pension Insurance',
      description: 'Comparison of tax treatment and value development',
      fundPlan: 'Fund Savings Plan',
      pensionInsurance: 'Private Pension Insurance (fund-based)',
      settings: 'Settings',
      returnRate: 'Return p.a.',
      frontLoad: 'Front Load',
      managementFee: 'Annual Management Fee',
      policyFee: 'Policy Fee',
      taxSettings: 'Tax settings',
      fundTypeLabel: 'Fund type',
      allowance: 'Saver allowance (€ / year)',
      fundTypeOptions: {
        equity: 'Equity fund (30%)',
        mixed: 'Mixed fund (15%)',
        other: 'Other (0%)'
      },
      valueAt67: 'Value at 67',
      valueAt85: 'Value at 85',
      afterTax: 'After Tax',
      taxesPaid: 'Taxes Paid',
      advantage: 'Advantage',
      areaChart: 'Portfolio Development (Area Chart)',
      lineChart: 'Portfolio Comparison (Line Chart)',
      taxInfo: 'Tax Differences',
      taxInfoFund: '25% capital gains tax annually on advance lump sum',
      taxInfoPension: 'No ongoing taxation, tax benefits on payout'
    }
  };

  const t = texts[language];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-2xl">
            <TrendingUp className="w-6 h-6 text-primary" />
            <span>{t.title}</span>
          </DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Settings Panel */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{t.settings}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {showSettings ? 'Verbergen' : 'Anzeigen'}
                </Button>
              </div>
            </CardHeader>
            {showSettings && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Fondsparrplan Settings */}
                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900">{t.fundPlan}</h4>
                    <div className="space-y-3">
                      <div>
                        <Label>{t.returnRate} (%)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={fundParams.returnRate}
                          onChange={(e) => setFundParams(prev => ({
                            ...prev,
                            returnRate: Number(e.target.value)
                          }))}
                        />
                      </div>
                      <div>
                        <Label>{t.frontLoad} (%)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={fundParams.frontLoad}
                          onChange={(e) => setFundParams(prev => ({
                            ...prev,
                            frontLoad: Number(e.target.value)
                          }))}
                        />
                      </div>
                      <div>
                        <Label>{t.managementFee} (% vom Guthaben)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={fundParams.managementFee}
                          onChange={(e) => setFundParams(prev => ({
                            ...prev,
                            managementFee: Number(e.target.value)
                          }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Private Pension Insurance Settings */}
                  <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900">{t.pensionInsurance}</h4>
                    <div className="space-y-3">
                      <div>
                        <Label>{t.returnRate} (%)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={pensionParams.returnRate}
                          onChange={(e) => setPensionParams(prev => ({
                            ...prev,
                            returnRate: Number(e.target.value)
                          }))}
                        />
                      </div>
                      <div>
                        <Label>{t.managementFee} (% vom Guthaben)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={pensionParams.managementFee}
                          onChange={(e) => setPensionParams(prev => ({
                            ...prev,
                            managementFee: Number(e.target.value)
                          }))}
                        />
                      </div>
                      <div>
                        <Label>{t.policyFee} (% vom Guthaben)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={pensionParams.policyFee}
                          onChange={(e) => setPensionParams(prev => ({
                            ...prev,
                            policyFee: Number(e.target.value)
                          }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tax Settings */}
                  <div className="space-y-4 p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold text-orange-900">{t.taxSettings}</h4>
                    <div className="space-y-3">
                      <div>
                        <Label>{t.fundTypeLabel}</Label>
                        <Select value={fundType} onValueChange={(value) => setFundType(value as 'equity' | 'mixed' | 'other')}>
                          <SelectTrigger>
                            <SelectValue placeholder={t.fundTypeLabel} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equity">{t.fundTypeOptions.equity}</SelectItem>
                            <SelectItem value="mixed">{t.fundTypeOptions.mixed}</SelectItem>
                            <SelectItem value="other">{t.fundTypeOptions.other}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>{t.allowance}</Label>
                        <Input
                          type="number"
                          min={0}
                          value={allowanceValue}
                          onChange={(e) => setAllowanceValue(Number(e.target.value) || 0)}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {language === 'de'
                          ? `Teilfreistellung: ${(PARTIAL_EXEMPTION_RATES[fundType] * 100).toFixed(0)}%`
                          : `Partial exemption: ${(PARTIAL_EXEMPTION_RATES[fundType] * 100).toFixed(0)}%`}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-blue-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-sm text-blue-600 font-medium mb-1">{t.fundPlan}</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {formatCurrency(valueAt67?.fundNetValue || 0)}
                  </div>
                  <p className="text-xs text-blue-700 mt-1">{t.valueAt67} {t.afterTax}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-sm text-green-600 font-medium mb-1">{t.pensionInsurance}</div>
                  <div className="text-2xl font-bold text-green-900">
                    {formatCurrency(valueAt67?.pensionNetValue || 0)}
                  </div>
                  <p className="text-xs text-green-700 mt-1">{t.valueAt67} {t.afterTax}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-sm text-purple-600 font-medium mb-1">{t.advantage}</div>
                  <div className={`text-2xl font-bold ${
                    (valueAt67?.pensionNetValue || 0) > (valueAt67?.fundNetValue || 0)
                      ? 'text-green-600'
                      : 'text-blue-600'
                  }`}>
                    {formatCurrency(Math.abs((valueAt67?.pensionNetValue || 0) - (valueAt67?.fundNetValue || 0)))}
                  </div>
                  <p className="text-xs text-purple-700 mt-1">
                    {(valueAt67?.pensionNetValue || 0) > (valueAt67?.fundNetValue || 0)
                      ? t.pensionInsurance
                      : t.fundPlan}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-sm text-orange-600 font-medium mb-1">{t.taxesPaid}</div>
                  <div className="text-2xl font-bold text-orange-900">
                    {formatCurrency(valueAt67?.fundTaxesPaid || 0)}
                  </div>
                  <p className="text-xs text-orange-700 mt-1">{t.fundPlan}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tax Info Alert */}
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-900 mb-2">{t.taxInfo}</h4>
                  <div className="space-y-1 text-sm text-amber-800">
                    <div className="flex items-start space-x-2">
                      <span className="font-semibold">•</span>
                      <span><strong>{t.fundPlan}:</strong> {t.taxInfoFund}</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="font-semibold">•</span>
                      <span><strong>{t.pensionInsurance}:</strong> {t.taxInfoPension}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts */}
          <Tabs defaultValue="area" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="area">{t.areaChart}</TabsTrigger>
              <TabsTrigger value="line">{t.lineChart}</TabsTrigger>
            </TabsList>

            <TabsContent value="area">
              <Card>
                <CardContent className="pt-6">
                  <ResponsiveContainer width="100%" height={500}>
                    <AreaChart data={simulationData}>
                      <defs>
                        <linearGradient id="colorFund" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorPension" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
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
                        dataKey="fundNetValue"
                        stroke="#3b82f6"
                        fill="url(#colorFund)"
                        name={t.fundPlan}
                      />
                      <Area
                        type="monotone"
                        dataKey="pensionNetValue"
                        stroke="#10b981"
                        fill="url(#colorPension)"
                        name={t.pensionInsurance}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="line">
              <Card>
                <CardContent className="pt-6">
                  <ResponsiveContainer width="100%" height={500}>
                    <LineChart data={simulationData}>
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
                      <Line
                        type="monotone"
                        dataKey="fundNetValue"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={false}
                        name={t.fundPlan}
                      />
                      <Line
                        type="monotone"
                        dataKey="pensionNetValue"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={false}
                        name={t.pensionInsurance}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
