import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  ArrowRight,
  Star,
  Filter,
  Search,
  Download,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { DebekaEmbed } from '@/components/DebekaEmbed';
import { realFundsData, FundData } from '@/data/realFundsData';
import { FundDetailsModal } from '@/components/FundDetailsModal';

interface PremiumFundsProps {
  language?: 'de' | 'en';
}

export const PremiumFunds: React.FC<PremiumFundsProps> = ({ language = 'de' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFund, setSelectedFund] = useState<FundData | null>(null);
  const texts = {
    de: {
      title: 'Fondsanalyse',
      subtitle: 'Vergleichen Sie Fondsperformance und treffen Sie fundierte Entscheidungen',
      searchPlaceholder: 'Nach Fonds suchen...',
      filter: 'Filtern',
      category: 'Kategorie',
      allCategories: 'Alle Kategorien',
      equity: 'Aktien',
      bond: 'Anleihen',
      mixed: 'Mischfonds',
      realEstate: 'Immobilien',
      return1y: '1 Jahr',
      return3y: '3 Jahre',
      return5y: '5 Jahre',
      ter: 'TER',
      volume: 'Volumen',
      rating: 'Rating',
      risk: 'Risiko',
      riskLow: 'Niedrig',
      riskMedium: 'Mittel',
      riskHigh: 'Hoch',
      performance: 'Performance',
      details: 'Details',
      topFunds: 'Top Fonds',
      marketOverview: 'Marktübersicht',
      compare: 'Vergleichen',
      download: 'Herunterladen',
    },
    en: {
      title: 'Fund Analysis',
      subtitle: 'Compare fund performance and make informed decisions',
      searchPlaceholder: 'Search funds...',
      filter: 'Filter',
      category: 'Category',
      allCategories: 'All Categories',
      equity: 'Equity',
      bond: 'Bonds',
      mixed: 'Mixed',
      realEstate: 'Real Estate',
      return1y: '1 Year',
      return3y: '3 Years',
      return5y: '5 Years',
      ter: 'TER',
      volume: 'Volume',
      rating: 'Rating',
      risk: 'Risk',
      riskLow: 'Low',
      riskMedium: 'Medium',
      riskHigh: 'High',
      performance: 'Performance',
      details: 'Details',
      topFunds: 'Top Funds',
      marketOverview: 'Market Overview',
      compare: 'Compare',
      download: 'Download',
    },
  };

  const t = texts[language];

  // Use real funds data instead of placeholder
  const funds = realFundsData;

  const performanceData = [
    { year: '2020', equity: 100, bond: 100, mixed: 100, realEstate: 100 },
    { year: '2021', equity: 125, bond: 103, mixed: 115, realEstate: 108 },
    { year: '2022', equity: 115, bond: 95, mixed: 105, realEstate: 112 },
    { year: '2023', equity: 145, bond: 98, mixed: 125, realEstate: 121 },
    { year: '2024', equity: 168, bond: 102, mixed: 142, realEstate: 132 },
  ];

  const filteredFunds = funds.filter((fund) => {
    const matchesSearch = fund.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fund.isin.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || fund.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  const FundCard = ({ fund }: { fund: FundData }) => (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => setSelectedFund(fund)}
    >
      <Card className="premium-card cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-1">{fund.name}</CardTitle>
              <CardDescription className="text-xs font-mono">{fund.isin}</CardDescription>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3 w-3",
                    i < fund.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                  )}
                />
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Returns */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t.return1y}</p>
              <p className={cn(
                "text-lg font-bold flex items-center gap-1",
                fund.return1y > 0 ? "text-success" : "text-destructive"
              )}>
                {fund.return1y > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {fund.return1y.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t.return3y}</p>
              <p className={cn(
                "text-lg font-bold flex items-center gap-1",
                fund.return3y > 0 ? "text-success" : "text-destructive"
              )}>
                {fund.return3y > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {fund.return3y.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t.return5y}</p>
              <p className={cn(
                "text-lg font-bold flex items-center gap-1",
                fund.return5y > 0 ? "text-success" : "text-destructive"
              )}>
                {fund.return5y > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {fund.return5y.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-2">
            <Badge className={cn("badge-premium bg-gradient-to-r", getRiskColor(fund.risk))}>
              {getRiskText(fund.risk)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              TER: {fund.ter}%
            </Badge>
            <Badge variant="outline" className="text-xs">
              {fund.volume}
            </Badge>
          </div>

          <Button variant="outline" size="sm" className="w-full btn-premium-ghost">
            {t.details}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-accent/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/30">
        <div className="container mx-auto px-4 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-semibold text-sm">
              <TrendingUp className="h-4 w-4" />
              <span>{language === 'de' ? 'Professionelle Fondsanalyse' : 'Professional Fund Analysis'}</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-foreground via-foreground to-foreground bg-clip-text text-transparent">
                {t.title}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {t.subtitle}
            </p>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-success/5 rounded-full blur-3xl -z-10" />
      </section>

      <div className="container mx-auto px-4 lg:px-8 py-12">
        {/* Debeka Info Card */}
        <Card className="glass-card mb-10">
          <CardHeader>
            <CardTitle>{language === 'de' ? 'Debeka Global Shares & Fondspolice' : 'Debeka Global Shares & insurance wrapper'}</CardTitle>
            <CardDescription>
              {language === 'de'
                ? 'Kernaussagen aus KID CA6I 0-100 und regulatorischem Rahmen (Stand 2025)'
                : 'Key facts from KID CA6I 0-100 and regulatory framework (as of 2025)'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
            <ul className="list-disc list-inside space-y-2">
              <li>{language === 'de'
                ? 'Interner Debeka-Fonds gem. VAG §124; ESG-Selektionsprozess, Regionen Europa/Nordamerika/Asien'
                : 'Internal Debeka fund under VAG §124; ESG selection across Europe/NA/Asia'}</li>
              <li>{language === 'de'
                ? 'Tarife Chance Invest / Balance / Garant: individuelle 0/50/100%-Garantiewahl, Überschüsse 2024: 2,25%'
                : 'Chance Invest / Balance / Garant tariff: customise guarantee (0/50/100%), 2024 surplus 2.25%'}</li>
              <li>{language === 'de'
                ? 'Kosten laut KID: 2,5% Einstieg über 5 Jahre (eingepreist), 0,3% p.a. laufend + 12 € Stückkosten'
                : 'KID costs: 2.5% entry (spread 5 years), 0.3% p.a. ongoing + €12 policy fee'}</li>
              <li>{language === 'de'
                ? 'Ansparphase steuerfrei; Auszahlung über Ertragsanteil (z. B. 17% bei Start mit 67) oder Halbeinkünfte 12/62'
                : 'Accumulation tax-free; payout via earnings portion (e.g. 17% at 67) or half-income 12/62 rule'}</li>
            </ul>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  {language === 'de' ? 'Teilfreistellung & Vorabpauschale' : 'Partial exemption & advance lump sum'}
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg border border-border/50 p-3 bg-muted/40">
                    <p className="font-semibold text-foreground">
                      {language === 'de' ? 'Aktienfonds' : 'Equity funds'}
                    </p>
                    <p>30% {language === 'de' ? 'Teilfreistellung' : 'partial exemption'}</p>
                  </div>
                  <div className="rounded-lg border border-border/50 p-3 bg-muted/40">
                    <p className="font-semibold text-foreground">
                      {language === 'de' ? 'Mischfonds' : 'Mixed funds'}
                    </p>
                    <p>15% {language === 'de' ? 'Teilfreistellung' : 'partial exemption'}</p>
                  </div>
                  <div className="rounded-lg border border-border/50 p-3 bg-muted/40 col-span-2">
                    <p className="font-semibold text-foreground">
                      {language === 'de' ? 'Vorabpauschale 2025' : 'Advance lump sum 2025'}
                    </p>
                    <p>Basiszins 2,53% (BMF, 21.12.2024)</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-border/50 p-3 bg-muted/40">
                <p>
                  {language === 'de'
                    ? 'Hinweis: Historische Wertentwicklungen sind keine verlässlichen Indikatoren für zukünftige Ergebnisse.'
                    : 'Note: Historical performance is not a reliable indicator of future results.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Debeka Price Widget - NEW */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="mb-10"
        >
          <DebekaEmbed />
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8"
        >
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t.searchPlaceholder}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-premium pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="select-premium w-full md:w-[200px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder={t.category} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allCategories}</SelectItem>
                    <SelectItem value="equity">{t.equity}</SelectItem>
                    <SelectItem value="bond">{t.bond}</SelectItem>
                    <SelectItem value="mixed">{t.mixed}</SelectItem>
                    <SelectItem value="realEstate">{t.realEstate}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Market Overview Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-12"
        >
          <Card className="chart-container-premium">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t.marketOverview}</CardTitle>
                  <CardDescription>
                    {language === 'de' ? 'Performance-Entwicklung nach Kategorie' : 'Performance by category'}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="btn-premium-ghost">
                  <Download className="mr-2 h-4 w-4" />
                  {t.download}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis
                    dataKey="year"
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    }}
                    formatter={(value: number) => [`${value}%`, '']}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="equity" stroke="hsl(var(--chart-1))" strokeWidth={3} name={t.equity} />
                  <Line type="monotone" dataKey="bond" stroke="hsl(var(--chart-2))" strokeWidth={3} name={t.bond} />
                  <Line type="monotone" dataKey="mixed" stroke="hsl(var(--chart-3))" strokeWidth={3} name={t.mixed} />
                  <Line type="monotone" dataKey="realEstate" stroke="hsl(var(--chart-4))" strokeWidth={3} name={t.realEstate} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Funds Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{t.topFunds}</h2>
            <Badge variant="outline" className="text-sm">
              {filteredFunds.length} {language === 'de' ? 'Fonds' : 'Funds'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFunds.map((fund, index) => (
              <motion.div
                key={fund.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.4 }}
              >
                <FundCard fund={fund} />
              </motion.div>
            ))}
          </div>

          {filteredFunds.length === 0 && (
            <Card className="glass-card p-12 text-center">
              <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {language === 'de' ? 'Keine Fonds gefunden' : 'No funds found'}
              </h3>
              <p className="text-muted-foreground">
                {language === 'de'
                  ? 'Versuchen Sie es mit anderen Suchbegriffen oder Filtern.'
                  : 'Try different search terms or filters.'}
              </p>
            </Card>
          )}
        </motion.div>
      </div>

      {/* Fund Details Modal */}
      {selectedFund && (
        <FundDetailsModal
          fund={selectedFund}
          open={!!selectedFund}
          onOpenChange={(open) => !open && setSelectedFund(null)}
          language={language}
        />
      )}
    </div>
  );
};

export default PremiumFunds;
