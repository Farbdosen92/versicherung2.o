import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { calculateCostImpact } from '@/lib/retirementMath';

interface CostImpactWaterfallProps {
  language?: 'de' | 'en';
  monthlyContribution?: number;
  contractYears?: number;
  annuityYears?: number;
  etfFrontLoad?: number;
  etfMgmtFee?: number;
  taxDragRate?: number;
}

export const CostImpactWaterfall: React.FC<CostImpactWaterfallProps> = ({
  language = 'de',
  monthlyContribution = 300,
  contractYears = 30,
  etfFrontLoad = 0.05,
  etfMgmtFee = 0.0075,
  taxDragRate = 0.0125,
}) => {
  const waterfall = useMemo(() => calculateCostImpact({
    monthlyContribution,
    contractYears,
    etfFrontLoad,
    etfMgmtFee,
    taxDragRate,
  }), [contractYears, etfFrontLoad, etfMgmtFee, monthlyContribution, taxDragRate]);

  const texts = {
    de: {
      title: 'Kostenwirkung über die Laufzeit',
      insurance: 'Debeka Police',
      etf: 'ETF / Depot',
      entry: 'Einstiegskosten (2,5% über 5 Jahre, inkl.)',
      ongoing: 'Laufende Kosten (0,3% p.a. + 12 €)',
      tax: 'Steuerlicher Drag (Vorabpauschale)',
      net: 'Netto nach Steuern & Kosten',
      summary: 'Zusammenfassung nach Laufzeit',
      totalCosts: 'Gesamte Kostenbelastung',
      netAssets: 'Netto-Vermögen',
      contribution: 'Gesamtbeitrag',
    },
    en: {
      title: 'Cost impact over contract term',
      insurance: 'Insurance policy',
      etf: 'ETF / brokerage',
      entry: 'Entry costs (2.5% over 5 years, included)',
      ongoing: 'Ongoing costs (0.3% p.a. + €12)',
      tax: 'Tax drag (advance lump sum)',
      net: 'Net after tax & costs',
      summary: 'Summary at end of term',
      totalCosts: 'Total cost impact',
      netAssets: 'Net assets',
      contribution: 'Total contribution',
    },
  };

  const t = texts[language];

  const tooltipFormatter = (value: number) => formatCurrency(value);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="chart">
          <TabsList>
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="table">Details</TabsTrigger>
          </TabsList>
          <TabsContent value="chart" className="mt-6">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={waterfall.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="step" />
                  <YAxis tickFormatter={(value) => `${(value / 1_000).toFixed(0)}k`} />
                  <Tooltip formatter={tooltipFormatter} />
                  <Legend />
                  <Bar dataKey="insurance" name={t.insurance} fill="#059669" />
                  <Bar dataKey="etf" name={t.etf} fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="table" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t.contribution}</span>
                  <span className="font-medium">
                    {formatCurrency(monthlyContribution * 12 * contractYears)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t.entry}</span>
                  <span>{formatCurrency(waterfall.data[1].insurance * -1)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t.ongoing}</span>
                  <span>{formatCurrency(waterfall.data[2].insurance * -1)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t.net}</span>
                  <span className="font-semibold text-emerald-600">
                    {formatCurrency(waterfall.summary.insuranceNet)}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t.entry}</span>
                  <span>{formatCurrency(waterfall.data[1].etf * -1)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t.ongoing}</span>
                  <span>{formatCurrency(waterfall.data[2].etf * -1)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t.tax}</span>
                  <span>{formatCurrency(waterfall.data[3].etf * -1)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t.net}</span>
                  <span className="font-semibold text-blue-600">
                    {formatCurrency(waterfall.summary.etfNet)}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-muted/50 rounded-lg p-4">
          <div>
            <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{t.summary}</h3>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t.totalCosts}</span>
              <span className="font-medium">{formatCurrency(waterfall.summary.insuranceCosts)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t.netAssets}</span>
              <span className="font-semibold text-emerald-600">{formatCurrency(waterfall.summary.insuranceNet)}</span>
            </div>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{t.summary}</h3>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t.totalCosts}</span>
              <span className="font-medium">{formatCurrency(waterfall.summary.etfCosts)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t.netAssets}</span>
              <span className="font-semibold text-blue-600">{formatCurrency(waterfall.summary.etfNet)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
