import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Check,
  X,
  Plus,
  Trash2,
  Download,
  Share2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useOnboardingStore } from '@/stores/onboardingStore';
import {
  AllPensionComparison,
  CostImpactWaterfall,
  FundSavingsPlanComparison,
  FlexiblePayoutSimulator,
  PensionGapCard,
  TaxCockpit,
} from '@/components/pension';
import {
  calculateCostImpact,
  projectPrivatePension,
  calculateRetirementGap,
  qualifiesFor1262,
} from '@/lib/retirementMath';
import { formatCurrency } from '@/lib/utils';
import {
  ResponsiveContainer,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';

interface PremiumComparisonProps {
  language?: 'de' | 'en';
}

interface Product {
  id: string;
  name: string;
  type: string;
  monthlyContribution: number;
  expectedReturn: number;
  taxBenefit: number;
  flexibility: number;
  guarantee: number;
  costs: number;
  features: string[];
  pros: string[];
  cons: string[];
}

export const PremiumComparison: React.FC<PremiumComparisonProps> = ({ language = 'de' }) => {
  const [selectedProducts, setSelectedProducts] = useState<string[]>(['riester', 'ruerup', 'private']);
  const { data } = useOnboardingStore();
  const [showFundComparison, setShowFundComparison] = useState(false);
  const [showPayoutSimulator, setShowPayoutSimulator] = useState(false);

  const scopeBoth = data?.personal?.maritalStatus === 'verheiratet' && data?.personal?.calcScope === 'beide_personen';
  const netMonthlyIncome = scopeBoth
    ? ((data?.income?.netMonthly_A || 0) + (data?.income?.netMonthly_B || 0))
    : (data?.income?.netMonthly || 0);

  const currentAge = data?.personal?.age
    ? data.personal.age
    : data?.personal?.birthYear
      ? new Date().getFullYear() - data.personal.birthYear
      : 35;

  const privateContribution = scopeBoth
    ? ((data?.privatePension?.contribution_A || 0) + (data?.privatePension?.contribution_B || 0))
    : (data?.privatePension?.contribution || 0);

  const fundBalance = scopeBoth
    ? ((data?.funds?.balance_A || 0) + (data?.funds?.balance_B || 0))
    : (data?.funds?.balance || 0);

  const retirementAge = 67;
  const estimatedPortfolioValue = (() => {
    if (fundBalance && fundBalance > 0) return fundBalance;
    if (privateContribution && privateContribution > 0) {
      const years = Math.max(0, retirementAge - currentAge);
      const annual = privateContribution * 12;
      const assumedReturn = 0.05;
      return annual * (Math.pow(1 + assumedReturn, years) - 1) / assumedReturn;
    }
    return 25000;
  })();

  const contractYears = Math.max(0, retirementAge - currentAge);

  const insuranceProjection = useMemo(() => {
    if (privateContribution <= 0 || contractYears <= 0) {
      return null;
    }

    return projectPrivatePension({
      monthlyContribution: privateContribution,
      years: contractYears,
      retirementAge,
      useHalfIncomeTaxation: qualifiesFor1262(retirementAge, contractYears),
    });
  }, [privateContribution, contractYears, retirementAge]);

  const statutory = useMemo(() => (
    (scopeBoth
      ? (data.pensions.public67_A || 0) + (data.pensions.public67_B || 0)
      : data.pensions.public67 || 0) || 0
  ), [data.pensions.public67, data.pensions.public67_A, data.pensions.public67_B, scopeBoth]);

  const occupational = useMemo(() => (
    (scopeBoth
      ? (data.occupationalPension.amount_A || 0) + (data.occupationalPension.amount_B || 0)
      : data.occupationalPension.amount || 0) || 0
  ), [data.occupationalPension.amount, data.occupationalPension.amount_A, data.occupationalPension.amount_B, scopeBoth]);

  const riesterIncome = useMemo(() => (
    (scopeBoth
      ? (data.riester.amount_A || 0) + (data.riester.amount_B || 0)
      : data.riester.amount || 0) || 0
  ), [data.riester.amount, data.riester.amount_A, data.riester.amount_B, scopeBoth]);

  const insuranceNetMonthly = insuranceProjection?.netMonthly ?? 0;

  const gapSummary = useMemo(() => calculateRetirementGap({
    netIncome: netMonthlyIncome,
    statutory,
    occupational,
    riester: riesterIncome,
    privateNet: insuranceNetMonthly,
  }), [netMonthlyIncome, statutory, occupational, riesterIncome, insuranceNetMonthly]);

  const costSummary = useMemo(() => calculateCostImpact({
    monthlyContribution: privateContribution > 0 ? privateContribution : 300,
    contractYears: Math.max(12, contractYears),
    etfFrontLoad: 0.05,
    etfMgmtFee: 0.0075,
    taxDragRate: 0.0125,
  }), [contractYears, privateContribution]);

  const insuranceProjectedValue = insuranceProjection?.projectedValue ?? 0;
  const etfAdvantageAt67 = costSummary.summary.insuranceNet - costSummary.summary.etfNet;
  const gapSeverityClass = gapSummary.gapRatio <= 0
    ? 'text-emerald-600'
    : gapSummary.gapRatio <= 0.1
      ? 'text-yellow-600'
      : 'text-red-500';
  const advantageClass = etfAdvantageAt67 >= 0 ? 'text-emerald-600' : 'text-red-500';

  const texts = {
    de: {
      title: 'Produktvergleich',
      subtitle: 'Vergleichen Sie Altersvorsorgeprodukte und finden Sie die beste Lösung',
      addProduct: 'Produkt hinzufügen',
      removeProduct: 'Entfernen',
      selectProduct: 'Produkt auswählen',
      riester: 'Riester-Rente',
      ruerup: 'Rürup-Rente',
      private: 'Private Rente',
      occupational: 'Betriebsrente',
      features: 'Eigenschaften',
      pros: 'Vorteile',
      cons: 'Nachteile',
      monthlyContribution: 'Monatlicher Beitrag',
      expectedReturn: 'Erwartete Rendite',
      taxBenefit: 'Steuervorteil',
      flexibility: 'Flexibilität',
      guarantee: 'Garantie',
      costs: 'Kosten',
      comparison: 'Vergleich',
      scoreCard: 'Bewertung',
      download: 'Herunterladen',
      share: 'Teilen',
      recommendation: 'Empfehlung',
      summaryTitle: 'Zentrale Kennzahlen',
      gapLabel: 'Monatliche Versorgungslücke',
      insuranceNetLabel: 'Debeka Netto (monatlich)',
      insuranceValueLabel: 'Prognose Kapital (67)',
      etfAdvantageLabel: 'Vorteil Steuerstundung',
    },
    en: {
      title: 'Product Comparison',
      subtitle: 'Compare pension products and find the best solution',
      addProduct: 'Add Product',
      removeProduct: 'Remove',
      selectProduct: 'Select Product',
      riester: 'Riester Pension',
      ruerup: 'Rürup Pension',
      private: 'Private Pension',
      occupational: 'Occupational Pension',
      features: 'Features',
      pros: 'Advantages',
      cons: 'Disadvantages',
      monthlyContribution: 'Monthly Contribution',
      expectedReturn: 'Expected Return',
      taxBenefit: 'Tax Benefit',
      flexibility: 'Flexibility',
      guarantee: 'Guarantee',
      costs: 'Costs',
      comparison: 'Comparison',
      scoreCard: 'Score Card',
      download: 'Download',
      share: 'Share',
      recommendation: 'Recommendation',
      summaryTitle: 'Key Takeaways',
      gapLabel: 'Monthly pension gap',
      insuranceNetLabel: 'Debeka net (monthly)',
      insuranceValueLabel: 'Projected capital (age 67)',
      etfAdvantageLabel: 'Tax deferral advantage',
    },
  };

  const t = texts[language];

  const products: Record<string, Product> = {
    riester: {
      id: 'riester',
      name: t.riester,
      type: language === 'de' ? 'Staatlich gefördert' : 'Government-subsidized',
      monthlyContribution: 175,
      expectedReturn: 4.5,
      taxBenefit: 9,
      flexibility: 5,
      guarantee: 8,
      costs: 6,
      features: [
        language === 'de' ? 'Staatliche Zulagen' : 'State subsidies',
        language === 'de' ? 'Steuervorteile' : 'Tax benefits',
        language === 'de' ? 'Garantierte Beiträge' : 'Guaranteed contributions',
      ],
      pros: [
        language === 'de' ? 'Hohe staatliche Förderung' : 'High government support',
        language === 'de' ? 'Beitragsgarantie' : 'Contribution guarantee',
        language === 'de' ? 'Pfändungsschutz' : 'Protection from seizure',
      ],
      cons: [
        language === 'de' ? 'Begrenzte Flexibilität' : 'Limited flexibility',
        language === 'de' ? 'Niedrige Rendite' : 'Low returns',
        language === 'de' ? 'Komplexe Förderlogik' : 'Complex subsidy logic',
      ],
    },
    ruerup: {
      id: 'ruerup',
      name: t.ruerup,
      type: language === 'de' ? 'Steuerbegünstigt' : 'Tax-advantaged',
      monthlyContribution: 300,
      expectedReturn: 5.2,
      taxBenefit: 10,
      flexibility: 3,
      guarantee: 7,
      costs: 7,
      features: [
        language === 'de' ? 'Hohe Steuerersparnis' : 'High tax savings',
        language === 'de' ? 'Für Selbstständige' : 'For self-employed',
        language === 'de' ? 'Insolvenzschutz' : 'Bankruptcy protection',
      ],
      pros: [
        language === 'de' ? 'Maximale Steuerersparnis' : 'Maximum tax savings',
        language === 'de' ? 'Ideal für Selbstständige' : 'Ideal for self-employed',
        language === 'de' ? 'Hoher Insolvenzschutz' : 'High bankruptcy protection',
      ],
      cons: [
        language === 'de' ? 'Keine Kapitalauszahlung' : 'No capital payout',
        language === 'de' ? 'Nicht vererbbar' : 'Not inheritable',
        language === 'de' ? 'Keine vorzeitige Kündigung' : 'No early termination',
      ],
    },
    private: {
      id: 'private',
      name: t.private,
      type: language === 'de' ? 'Flexibel' : 'Flexible',
      monthlyContribution: 250,
      expectedReturn: 7.5,
      taxBenefit: 3,
      flexibility: 10,
      guarantee: 4,
      costs: 5,
      features: [
        language === 'de' ? 'Maximale Flexibilität' : 'Maximum flexibility',
        language === 'de' ? 'Weltweite Investments' : 'Global investments',
        language === 'de' ? 'Vererbbar' : 'Inheritable',
      ],
      pros: [
        language === 'de' ? 'Höchste Renditechance' : 'Highest return potential',
        language === 'de' ? 'Volle Kontrolle' : 'Full control',
        language === 'de' ? 'Jederzeit kündbar' : 'Cancellable anytime',
      ],
      cons: [
        language === 'de' ? 'Keine staatliche Förderung' : 'No government support',
        language === 'de' ? 'Höheres Risiko' : 'Higher risk',
        language === 'de' ? 'Kapitalertragssteuer' : 'Capital gains tax',
      ],
    },
    occupational: {
      id: 'occupational',
      name: t.occupational,
      type: language === 'de' ? 'Arbeitgeber-gefördert' : 'Employer-sponsored',
      monthlyContribution: 200,
      expectedReturn: 5.8,
      taxBenefit: 8,
      flexibility: 6,
      guarantee: 9,
      costs: 4,
      features: [
        language === 'de' ? 'Arbeitgeberzuschuss' : 'Employer contribution',
        language === 'de' ? 'Sozialabgabenfrei' : 'Social security exempt',
        language === 'de' ? 'Insolvenzgeschützt' : 'Insolvency protected',
      ],
      pros: [
        language === 'de' ? 'Arbeitgeber-Beteiligung' : 'Employer participation',
        language === 'de' ? 'Steuer- und Sozialabgabenfrei' : 'Tax and social security exempt',
        language === 'de' ? 'Hohe Sicherheit' : 'High security',
      ],
      cons: [
        language === 'de' ? 'An Arbeitgeber gebunden' : 'Tied to employer',
        language === 'de' ? 'Eingeschränkte Portabilität' : 'Limited portability',
        language === 'de' ? 'Begrenzte Wahlmöglichkeiten' : 'Limited choices',
      ],
    },
  };

  const selectedProductData = selectedProducts.map((id) => products[id]);

  // Radar chart data
  const radarData = [
    {
      metric: t.expectedReturn,
      ...Object.fromEntries(selectedProducts.map((id) => [id, products[id].expectedReturn])),
    },
    {
      metric: t.taxBenefit,
      ...Object.fromEntries(selectedProducts.map((id) => [id, products[id].taxBenefit])),
    },
    {
      metric: t.flexibility,
      ...Object.fromEntries(selectedProducts.map((id) => [id, products[id].flexibility])),
    },
    {
      metric: t.guarantee,
      ...Object.fromEntries(selectedProducts.map((id) => [id, products[id].guarantee])),
    },
    {
      metric: t.costs,
      ...Object.fromEntries(selectedProducts.map((id) => [id, 10 - products[id].costs])), // Inverted for better visualization
    },
  ];

  const addProduct = (productId: string) => {
    if (!selectedProducts.includes(productId) && selectedProducts.length < 4) {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const removeProduct = (productId: string) => {
    if (selectedProducts.length > 1) {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    }
  };

  return (
    <>
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
              <BarChart3 className="h-4 w-4" />
              <span>{language === 'de' ? 'Intelligenter Vergleich' : 'Smart Comparison'}</span>
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
        {/* Retirement Overview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="space-y-10 mb-12"
        >
          <AllPensionComparison
            language={language}
            currentAge={currentAge}
            netMonthlyIncome={netMonthlyIncome}
            privatePensionMonthly={privateContribution || 0}
            retirementAge={retirementAge}
          />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <PensionGapCard language={language} retirementAge={retirementAge} />
            <div className="xl:col-span-2">
              <TaxCockpit
                language={language}
                currentAgeOverride={currentAge}
                retirementAgeOverride={retirementAge}
                monthlyContributionOverride={privateContribution || undefined}
                fundBalanceOverride={fundBalance || undefined}
              />
            </div>
          </div>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>
                {language === 'de'
                  ? 'Debeka Police vs. ETF-Sparplan auf einen Blick'
                  : 'Debeka policy vs. ETF savings plan at a glance'}
              </CardTitle>
              <CardDescription>
                {language === 'de'
                  ? 'Steuerliche Vorteile, Kostenstruktur und Risikokennzahlen nach KID'
                  : 'Tax benefits, cost structure and risk metrics based on the KID'}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
              <ul className="list-disc list-inside space-y-2">
                <li>{language === 'de'
                  ? 'Ansparphase steuerfrei, Vorteil beim Zinseszinseffekt'
                  : 'Tax deferral in accumulation phase maximises compounding'}</li>
                <li>{language === 'de'
                  ? 'Auszahlung: Ertragsanteilsbesteuerung oder 12/62 – oft deutlich unter Abgeltungsteuer'
                  : 'Payout: earnings portion taxation or 12/62 rule – usually below capital gains tax'}</li>
                <li>{language === 'de'
                  ? 'Garantiebestandteile 1% p.a., Überschüsse 2024: 2,25% (nicht garantiert)'
                  : 'Guarantee component 1% p.a., surplus 2024: 2.25% (non-guaranteed)'}</li>
              </ul>
              <ul className="list-disc list-inside space-y-2">
                <li>{language === 'de'
                  ? 'ETF-Depot: Vorabpauschale, Abgeltungsteuer 26,375%, Teilfreistellung 30%/15%'
                  : 'ETF depot: advance lump sum, 26.375% capital gains tax, partial exemption 30%/15%'}</li>
                <li>{language === 'de'
                  ? 'Kosten laut KID: 2,5% Einstiegskosten (über 5 Jahre), 0,3% p.a. laufend + 12 €'
                  : 'KID costs: 2.5% entry (over 5 years), 0.3% p.a. ongoing + €12'}</li>
                <li>{language === 'de'
                  ? 'Produkt-Risikoklasse 3/7 vs. Fondsrisiko 6/7 – differenziert erklärt'
                  : 'Product risk class 3/7 vs. fund risk 6/7 – explained transparently'}</li>
              </ul>
            </CardContent>
          </Card>

          <CostImpactWaterfall
            language={language}
            monthlyContribution={privateContribution || 300}
            contractYears={Math.max(12, retirementAge - currentAge)}
          />

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>{t.summaryTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="rounded-lg border border-border/40 bg-background/60 p-4">
                  <p className="text-muted-foreground mb-1">{t.gapLabel}</p>
                  <p className={`text-2xl font-semibold ${gapSeverityClass}`}>
                    {formatCurrency(gapSummary.gapValue)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'de'
                      ? `Rentenströme gesamt: ${formatCurrency(gapSummary.totalRetirement)}`
                      : `Total retirement income: ${formatCurrency(gapSummary.totalRetirement)}`}
                  </p>
                </div>
                <div className="rounded-lg border border-border/40 bg-background/60 p-4">
                  <p className="text-muted-foreground mb-1">{t.insuranceNetLabel}</p>
                  <p className="text-2xl font-semibold text-emerald-700">
                    {formatCurrency(insuranceNetMonthly)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t.insuranceValueLabel}: {formatCurrency(insuranceProjectedValue)}
                  </p>
                </div>
                <div className="rounded-lg border border-border/40 bg-background/60 p-4">
                  <p className="text-muted-foreground mb-1">{t.etfAdvantageLabel}</p>
                  <p className={`text-2xl font-semibold ${advantageClass}`}>
                    {formatCurrency(etfAdvantageAt67)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'de'
                      ? `Netto nach 30 Jahren: ${formatCurrency(costSummary.summary.insuranceNet)} vs. ${formatCurrency(costSummary.summary.etfNet)}`
                      : `Net after 30 years: ${formatCurrency(costSummary.summary.insuranceNet)} vs. ${formatCurrency(costSummary.summary.etfNet)}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col md:flex-row gap-4 justify-end">
            <Button variant="outline" onClick={() => setShowFundComparison(true)}>
              {language === 'de' ? 'Fonds vs. Police simulieren' : 'Simulate fund vs. insurance'}
            </Button>
            <Button onClick={() => setShowPayoutSimulator(true)}>
              {language === 'de' ? 'Flexible Entnahme' : 'Flexible withdrawals'}
            </Button>
          </div>
        </motion.section>

        {/* Product Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-12"
        >
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-4">
                <h3 className="font-semibold">{language === 'de' ? 'Produkte auswählen:' : 'Select products:'}</h3>
                {Object.values(products).map((product) => (
                  <Button
                    key={product.id}
                    variant={selectedProducts.includes(product.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      selectedProducts.includes(product.id)
                        ? removeProduct(product.id)
                        : addProduct(product.id)
                    }
                    disabled={!selectedProducts.includes(product.id) && selectedProducts.length >= 4}
                    className={selectedProducts.includes(product.id) ? "btn-premium-primary" : "btn-premium-ghost"}
                  >
                    {selectedProducts.includes(product.id) ? (
                      <Check className="mr-2 h-4 w-4" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    {product.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Radar Comparison Chart */}
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
                  <CardTitle>{t.scoreCard}</CardTitle>
                  <CardDescription>
                    {language === 'de' ? 'Bewertung nach Kriterien' : 'Rating by criteria'}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="btn-premium-ghost">
                    <Download className="mr-2 h-4 w-4" />
                    {t.download}
                  </Button>
                  <Button variant="outline" size="sm" className="btn-premium-ghost">
                    <Share2 className="mr-2 h-4 w-4" />
                    {t.share}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="metric" style={{ fontSize: '12px' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 10]} style={{ fontSize: '10px' }} />
                  {selectedProducts.map((id, index) => (
                    <Radar
                      key={id}
                      name={products[id].name}
                      dataKey={id}
                      stroke={`hsl(var(--chart-${index + 1}))`}
                      fill={`hsl(var(--chart-${index + 1}))`}
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  ))}
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detailed Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {selectedProductData.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
            >
              <Card className="premium-card h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{product.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">{product.type}</Badge>
                    </div>
                    {selectedProducts.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeProduct(product.id)}
                        className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Key Metrics */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t.monthlyContribution}</span>
                      <span className="font-semibold">€{product.monthlyContribution}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t.expectedReturn}</span>
                      <span className="font-semibold text-success">{product.expectedReturn}%</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">{t.features}</h4>
                    <ul className="space-y-1">
                      {product.features.map((feature, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pros */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-success">{t.pros}</h4>
                    <ul className="space-y-1">
                      {product.pros.map((pro, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <TrendingUp className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Cons */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-destructive">{t.cons}</h4>
                    <ul className="space-y-1">
                      {product.cons.map((con, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <X className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button className="w-full btn-premium-primary">
                    {language === 'de' ? 'Mehr erfahren' : 'Learn more'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>

      <FundSavingsPlanComparison
        isOpen={showFundComparison}
        onClose={() => setShowFundComparison(false)}
        monthlyContribution={privateContribution || 300}
        currentAge={currentAge}
        retirementAge={retirementAge}
        language={language}
      />

      <FlexiblePayoutSimulator
        isOpen={showPayoutSimulator}
        onClose={() => setShowPayoutSimulator(false)}
        portfolioValue={estimatedPortfolioValue}
        payoutStartAge={retirementAge}
        payoutEndAge={Math.min(retirementAge + 18, 85)}
        language={language}
      />
    </>
  );
};

export default PremiumComparison;
