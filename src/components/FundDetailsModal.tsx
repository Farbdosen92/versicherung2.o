import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FundData } from '@/data/realFundsData';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Info,
  Globe,
  BarChart3,
  Shield,
  Coins,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FundDetailsModalProps {
  fund: FundData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language?: 'de' | 'en';
}

export function FundDetailsModal({
  fund,
  open,
  onOpenChange,
  language = 'de',
}: FundDetailsModalProps) {
  if (!fund) return null;

  const texts = {
    de: {
      performance: 'Performance',
      details: 'Details',
      keyFacts: 'Kennzahlen',
      description: 'Beschreibung',
      isin: 'ISIN',
      ter: 'TER (Gesamtkostenquote)',
      volume: 'Fondsvolumen',
      domicile: 'Fondsdomizil',
      replication: 'Replikationsmethode',
      distribution: 'Ertragsverwendung',
      provider: 'Anbieter',
      currency: 'Handelswährung',
      risk: 'Risiko',
      rating: 'Rating',
      returns: 'Renditen',
      return1y: '1 Jahr',
      return3y: '3 Jahre',
      return5y: '5 Jahre',
      chartTitle: '5-Jahres-Performance',
      indexed: 'Indexiert auf 100',
      visitProvider: 'Anbieter-Website besuchen',
      moreInfo: 'Mehr Informationen',
      riskLow: 'Niedrig',
      riskMedium: 'Mittel',
      riskHigh: 'Hoch',
    },
    en: {
      performance: 'Performance',
      details: 'Details',
      keyFacts: 'Key Facts',
      description: 'Description',
      isin: 'ISIN',
      ter: 'TER (Total Expense Ratio)',
      volume: 'Fund Volume',
      domicile: 'Domicile',
      replication: 'Replication Method',
      distribution: 'Distribution Policy',
      provider: 'Provider',
      currency: 'Trading Currency',
      risk: 'Risk',
      rating: 'Rating',
      returns: 'Returns',
      return1y: '1 Year',
      return3y: '3 Years',
      return5y: '5 Years',
      chartTitle: '5-Year Performance',
      indexed: 'Indexed to 100',
      visitProvider: 'Visit Provider Website',
      moreInfo: 'More Information',
      riskLow: 'Low',
      riskMedium: 'Medium',
      riskHigh: 'High',
    },
  };

  const t = texts[language];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'from-green-500 to-green-600';
      case 'medium':
        return 'from-orange-500 to-orange-600';
      case 'high':
        return 'from-red-500 to-red-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getRiskText = (risk: string) => {
    switch (risk) {
      case 'low':
        return t.riskLow;
      case 'medium':
        return t.riskMedium;
      case 'high':
        return t.riskHigh;
      default:
        return risk;
    }
  };

  // Format chart data
  const chartData = fund.performanceHistory.map(item => ({
    date: item.date,
    value: item.value,
    displayDate: new Date(item.date + '-01').toLocaleDateString('de-DE', {
      month: 'short',
      year: '2-digit',
    }),
  }));

  const currentValue = fund.performanceHistory[fund.performanceHistory.length - 1]?.value || 100;
  const startValue = fund.performanceHistory[0]?.value || 100;
  const totalReturn = ((currentValue - startValue) / startValue) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{fund.name}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 text-base">
                <span className="font-mono text-sm">{fund.isin}</span>
                <Badge variant="outline" className="text-xs">
                  {fund.provider}
                </Badge>
              </DialogDescription>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                    i < fund.rating
                      ? 'bg-yellow-400 text-yellow-900'
                      : 'bg-gray-200 text-gray-400'
                  )}
                >
                  ★
                </div>
              ))}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Performance Chart */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {t.chartTitle}
                </h3>
                <p className="text-sm text-blue-700 mt-1">{t.indexed}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-700">{t.returns} (5J)</p>
                <p
                  className={cn(
                    'text-2xl font-bold flex items-center gap-1',
                    totalReturn >= 0 ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {totalReturn >= 0 ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <TrendingDown className="h-5 w-5" />
                  )}
                  {totalReturn > 0 && '+'}
                  {totalReturn.toFixed(1)}%
                </p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#93c5fd" opacity={0.3} />
                <XAxis
                  dataKey="displayDate"
                  stroke="#1e40af"
                  style={{ fontSize: '12px' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#1e40af"
                  style={{ fontSize: '12px' }}
                  domain={['dataMin - 5', 'dataMax + 5']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '2px solid #3b82f6',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  }}
                  formatter={(value: number) => [value.toFixed(2), 'Wert']}
                  labelFormatter={(label) => `Datum: ${label}`}
                />
                <ReferenceLine y={100} stroke="#6b7280" strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: '#2563eb' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Returns */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-green-900">{t.returns}</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700">{t.return1y}</span>
                  <span
                    className={cn(
                      'font-bold',
                      fund.return1y >= 0 ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {fund.return1y > 0 && '+'}
                    {fund.return1y.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700">{t.return3y}</span>
                  <span
                    className={cn(
                      'font-bold',
                      fund.return3y >= 0 ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {fund.return3y > 0 && '+'}
                    {fund.return3y.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700">{t.return5y}</span>
                  <span
                    className={cn(
                      'font-bold',
                      fund.return5y >= 0 ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {fund.return5y > 0 && '+'}
                    {fund.return5y.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Costs & Volume */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-5 border border-amber-200">
              <div className="flex items-center gap-2 mb-3">
                <Coins className="h-5 w-5 text-amber-600" />
                <h4 className="font-semibold text-amber-900">Kosten & Volumen</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-amber-700">{t.ter}</span>
                  <span className="font-bold text-amber-900">{fund.ter}% p.a.</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-amber-700">{t.volume}</span>
                  <span className="font-bold text-amber-900">{fund.volume}</span>
                </div>
                <div className="pt-2 border-t border-amber-200">
                  <div className="flex items-center gap-2">
                    <Badge
                      className={cn(
                        'badge-premium bg-gradient-to-r',
                        getRiskColor(fund.risk)
                      )}
                    >
                      {getRiskText(fund.risk)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Fund Structure */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold text-purple-900">Struktur</h4>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-purple-700 block">{t.replication}</span>
                  <span className="font-semibold text-purple-900 text-sm">
                    {fund.replicationMethod}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-purple-700 block">{t.distribution}</span>
                  <span className="font-semibold text-purple-900 text-sm">
                    {fund.distributionPolicy}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-purple-700 block">{t.domicile}</span>
                  <span className="font-semibold text-purple-900 text-sm">
                    {fund.domicile}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-5 w-5 text-slate-600" />
              <h4 className="font-semibold text-slate-900">{t.description}</h4>
            </div>
            <p className="text-slate-700 leading-relaxed">{fund.description}</p>
          </div>

          {/* Additional Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-slate-500" />
                <span className="text-slate-600">{t.currency}:</span>
                <span className="font-semibold">{fund.currency}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-600">{t.provider}:</span>
                <span className="font-semibold">{fund.provider}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <Button
              variant="default"
              className="flex-1 bg-blue-600 hover:bg-blue-700 gap-2"
              asChild
            >
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(
                  fund.name + ' ' + fund.isin
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                {t.moreInfo}
              </a>
            </Button>
            <Button variant="outline" className="flex-1 gap-2" onClick={() => onOpenChange(false)}>
              Schließen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
