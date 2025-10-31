import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '@/stores/onboardingStore';
import {
  Calculator,
  TrendingUp,
  PieChart,
  DollarSign,
  Calendar,
  Percent,
  Download,
  Share2,
  Sparkles,
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
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  TaxCockpit,
  CostImpactWaterfall,
  FundSavingsPlanComparison,
  FlexiblePayoutSimulator,
  PensionGapCard,
} from '@/components/pension';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface PremiumCalculatorProps {
  language?: 'de' | 'en';
}

interface CalculatorInputs {
  currentAge: number;
  retirementAge: number;
  monthlyContribution: number;
  startCapital: number;
  expectedReturn: number;
  inflationRate: number;
}

export const PremiumCalculator: React.FC<PremiumCalculatorProps> = ({ language = 'de' }) => {
  const { data: onboardingData, isCompleted } = useOnboardingStore();
  const [activeTab, setActiveTab] = useState('private-pension');
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showFundComparison, setShowFundComparison] = useState(false);
  const [showPayoutSimulator, setShowPayoutSimulator] = useState(false);

  const [inputs, setInputs] = useState<CalculatorInputs>({
    currentAge: 35,
    retirementAge: 67,
    monthlyContribution: 300,
    startCapital: 10000,
    expectedReturn: 6,
    inflationRate: 2,
  });

  // Load data from onboarding if available
  useEffect(() => {
    if (isCompleted && onboardingData) {
      const currentYear = new Date().getFullYear();
      const birthYear = onboardingData.personal?.birthYear;
      const age = onboardingData.personal?.age;
      const currentAge = age || (birthYear ? currentYear - birthYear : 30); // Fallback: 30 Jahre

      const scopeBoth = onboardingData?.personal?.maritalStatus === 'verheiratet' &&
        onboardingData?.personal?.calcScope === 'beide_personen';
      
      const contribution = scopeBoth
        ? ((onboardingData?.privatePension?.contribution_A || 0) + (onboardingData?.privatePension?.contribution_B || 0))
        : (onboardingData?.privatePension?.contribution || 0);

      setInputs(prev => ({
        ...prev,
        currentAge,
        monthlyContribution: contribution || prev.monthlyContribution,
      }));
      setShowResults(true); // Auto-show results if data is available
    }
  }, [onboardingData, isCompleted]);

  const scopeBoth = onboardingData?.personal?.maritalStatus === 'verheiratet' &&
    onboardingData?.personal?.calcScope === 'beide_personen';

  const onboardingFundBalance = scopeBoth
    ? ((onboardingData?.funds?.balance_A || 0) + (onboardingData?.funds?.balance_B || 0))
    : (onboardingData?.funds?.balance || 0);

  const texts = {
    de: {
      title: 'Rentenrechner',
      subtitle: 'Berechnen Sie Ihre zukünftige Altersvorsorge',
      privatePension: 'Private Rente',
      riester: 'Riester-Rente',
      ruerup: 'Rürup-Rente',
      occupational: 'Betriebliche AV',
      yourInputs: 'Ihre Eingaben',
      currentAge: 'Aktuelles Alter',
      retirementAge: 'Renteneintrittsalter',
      monthlyContribution: 'Monatliche Einzahlung',
      startCapital: 'Startkapital',
      expectedReturn: 'Erwartete Rendite',
      inflationRate: 'Inflationsrate',
      calculate: 'Berechnen',
      calculating: 'Berechne...',
      results: 'Ergebnisse',
      finalCapital: 'Endkapital',
      monthlyPension: 'Monatliche Rente',
      totalContributions: 'Gesamte Einzahlungen',
      returns: 'Erträge',
      years: 'Jahre',
      yearsLabel: 'bis Rente',
      download: 'Herunterladen',
      share: 'Teilen',
      chartTitle: 'Vermögensentwicklung',
      contributions: 'Einzahlungen',
      growth: 'Wachstum',
    },
    en: {
      title: 'Pension Calculator',
      subtitle: 'Calculate your future retirement savings',
      privatePension: 'Private Pension',
      riester: 'Riester Pension',
      ruerup: 'Rürup Pension',
      occupational: 'Occupational Pension',
      yourInputs: 'Your Inputs',
      currentAge: 'Current Age',
      retirementAge: 'Retirement Age',
      monthlyContribution: 'Monthly Contribution',
      startCapital: 'Starting Capital',
      expectedReturn: 'Expected Return',
      inflationRate: 'Inflation Rate',
      calculate: 'Calculate',
      calculating: 'Calculating...',
      results: 'Results',
      finalCapital: 'Final Capital',
      monthlyPension: 'Monthly Pension',
      totalContributions: 'Total Contributions',
      returns: 'Returns',
      years: 'Years',
      yearsLabel: 'until retirement',
      download: 'Download',
      share: 'Share',
      chartTitle: 'Wealth Development',
      contributions: 'Contributions',
      growth: 'Growth',
    },
  };

  const t = texts[language];

  // Calculate pension
  const calculatePension = () => {
    setIsCalculating(true);
    // Simulate calculation delay
    setTimeout(() => {
      setIsCalculating(false);
      setShowResults(true);
    }, 1500);
  };

  // Generate chart data
  const years = inputs.retirementAge - inputs.currentAge;
  const chartData = [];
  let currentCapital = inputs.startCapital;

  for (let year = 0; year <= years; year++) {
    const contributions = inputs.monthlyContribution * 12 * year;
    const totalInvested = inputs.startCapital + contributions;
    const returns = currentCapital * (inputs.expectedReturn / 100);
    currentCapital = currentCapital + (inputs.monthlyContribution * 12) + returns;

    chartData.push({
      year: inputs.currentAge + year,
      capital: Math.round(currentCapital),
      contributions: Math.round(totalInvested),
      returns: Math.round(currentCapital - totalInvested),
    });
  }

  const finalCapital = chartData[chartData.length - 1]?.capital || 0;
  const totalContributions = chartData[chartData.length - 1]?.contributions || 0;
  const totalReturns = chartData[chartData.length - 1]?.returns || 0;
  const monthlyPension = Math.round((finalCapital * 0.04) / 12);

  const InputField = ({
    label,
    value,
    onChange,
    type = 'number',
    suffix,
    min = 0,
    max
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    type?: string;
    suffix?: string;
    min?: number;
    max?: number;
  }) => (
    <div className="space-y-3">
      <Label className="text-sm font-semibold text-foreground/90">{label}</Label>
      <div className="relative">
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          className="input-premium pr-12"
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
            {suffix}
          </span>
        )}
      </div>
      {(type === 'range' || max) && (
        <Slider
          value={[value]}
          onValueChange={(vals) => onChange(vals[0])}
          min={min}
          max={max}
          step={1}
          className="mt-2"
        />
      )}
    </div>
  );

  const ResultCard = ({
    icon: Icon,
    label,
    value,
    subtitle,
    color
  }: {
    icon: React.ElementType;
    label: string;
    value: string;
    subtitle?: string;
    color: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="kpi-card-premium">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={cn(
              "p-3 rounded-xl bg-gradient-to-r shadow-soft-lg",
              color
            )}>
              <Icon className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="stat-number">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

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
              <Calculator className="h-4 w-4" />
              <span>{language === 'de' ? 'Intelligente Berechnung' : 'Smart Calculation'}</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                {t.title}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {t.subtitle}
            </p>

            {isCompleted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 text-success font-medium text-sm"
              >
                <Check className="h-4 w-4" />
                <span>
                  {language === 'de'
                    ? 'Daten aus Ihrem Profil geladen'
                    : 'Data loaded from your profile'}
                </span>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-success/5 rounded-full blur-3xl -z-10" />
      </section>

      <div className="container mx-auto px-4 lg:px-8 py-12">
        {/* Pension Type Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
            <TabsList className="tabs-premium w-full justify-start overflow-x-auto">
              <TabsTrigger value="private-pension" className="tab-premium">
                <PieChart className="h-4 w-4 mr-2" />
                {t.privatePension}
              </TabsTrigger>
              <TabsTrigger value="riester" className="tab-premium">
                <TrendingUp className="h-4 w-4 mr-2" />
                {t.riester}
              </TabsTrigger>
              <TabsTrigger value="ruerup" className="tab-premium">
                <DollarSign className="h-4 w-4 mr-2" />
                {t.ruerup}
              </TabsTrigger>
              <TabsTrigger value="occupational" className="tab-premium">
                <Calendar className="h-4 w-4 mr-2" />
                {t.occupational}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="lg:col-span-1"
          >
            <Card className="premium-card sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  {t.yourInputs}
                </CardTitle>
                <CardDescription>
                  {language === 'de' ? 'Passen Sie die Parameter an' : 'Adjust the parameters'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <InputField
                  label={t.currentAge}
                  value={inputs.currentAge}
                  onChange={(val) => setInputs({ ...inputs, currentAge: val })}
                  suffix={t.years}
                  min={18}
                  max={67}
                />

                <InputField
                  label={t.retirementAge}
                  value={inputs.retirementAge}
                  onChange={(val) => setInputs({ ...inputs, retirementAge: val })}
                  suffix={t.years}
                  min={inputs.currentAge + 1}
                  max={75}
                />

                <InputField
                  label={t.monthlyContribution}
                  value={inputs.monthlyContribution}
                  onChange={(val) => setInputs({ ...inputs, monthlyContribution: val })}
                  suffix="€"
                  min={0}
                  max={2000}
                />

                <InputField
                  label={t.startCapital}
                  value={inputs.startCapital}
                  onChange={(val) => setInputs({ ...inputs, startCapital: val })}
                  suffix="€"
                  min={0}
                  max={100000}
                />

                <InputField
                  label={t.expectedReturn}
                  value={inputs.expectedReturn}
                  onChange={(val) => setInputs({ ...inputs, expectedReturn: val })}
                  suffix="%"
                  min={0}
                  max={15}
                />

                <InputField
                  label={t.inflationRate}
                  value={inputs.inflationRate}
                  onChange={(val) => setInputs({ ...inputs, inflationRate: val })}
                  suffix="%"
                  min={0}
                  max={10}
                />

                <Button
                  onClick={calculatePension}
                  disabled={isCalculating}
                  className="btn-premium-primary w-full"
                  size="lg"
                >
                  {isCalculating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mr-2"
                      >
                        <Calculator className="h-4 w-4" />
                      </motion.div>
                      {t.calculating}
                    </>
                  ) : (
                    <>
                      <Calculator className="mr-2 h-4 w-4" />
                      {t.calculate}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="lg:col-span-2 space-y-8"
          >
            <AnimatePresence mode="wait">
              {showResults ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* KPI Results */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold">{t.results}</h2>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="btn-premium-ghost">
                          <Download className="h-4 w-4 mr-2" />
                          {t.download}
                        </Button>
                        <Button variant="outline" size="sm" className="btn-premium-ghost">
                          <Share2 className="h-4 w-4 mr-2" />
                          {t.share}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <ResultCard
                        icon={PieChart}
                        label={t.finalCapital}
                        value={`€${finalCapital.toLocaleString('de-DE')}`}
                        subtitle={`${years} ${t.yearsLabel}`}
                        color="from-blue-500 to-blue-600"
                      />
                      <ResultCard
                        icon={TrendingUp}
                        label={t.monthlyPension}
                        value={`€${monthlyPension.toLocaleString('de-DE')}`}
                        subtitle={language === 'de' ? 'bei 4% Entnahme' : 'at 4% withdrawal'}
                        color="from-green-500 to-green-600"
                      />
                      <ResultCard
                        icon={DollarSign}
                        label={t.totalContributions}
                        value={`€${totalContributions.toLocaleString('de-DE')}`}
                        color="from-purple-500 to-purple-600"
                      />
                      <ResultCard
                        icon={Percent}
                        label={t.returns}
                        value={`€${totalReturns.toLocaleString('de-DE')}`}
                        subtitle={`${Math.round((totalReturns / totalContributions) * 100)}% ${language === 'de' ? 'Gewinn' : 'Gain'}`}
                        color="from-orange-500 to-orange-600"
                      />
                    </div>
                  </div>

                  {/* Chart */}
                  <Card className="chart-container-premium">
                    <CardHeader>
                      <CardTitle>{t.chartTitle}</CardTitle>
                      <CardDescription>
                        {language === 'de' ? 'Entwicklung über die Jahre' : 'Development over the years'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorCapital" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorContributions" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                          <XAxis
                            dataKey="year"
                            stroke="hsl(var(--muted-foreground))"
                            style={{ fontSize: '12px' }}
                          />
                          <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            style={{ fontSize: '12px' }}
                            tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '12px',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                            }}
                            labelStyle={{ color: 'hsl(var(--foreground))' }}
                            formatter={(value: number) => [`€${value.toLocaleString('de-DE')}`, '']}
                          />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="capital"
                            stroke="hsl(var(--primary))"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorCapital)"
                            name={t.growth}
                          />
                          <Area
                            type="monotone"
                            dataKey="contributions"
                            stroke="hsl(var(--success))"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorContributions)"
                            name={t.contributions}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <div className="space-y-8">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      <PensionGapCard language={language} retirementAge={inputs.retirementAge} />
                      <TaxCockpit
                        language={language}
                        currentAgeOverride={inputs.currentAge}
                        retirementAgeOverride={inputs.retirementAge}
                        monthlyContributionOverride={inputs.monthlyContribution}
                        fundBalanceOverride={onboardingFundBalance || inputs.startCapital}
                      />
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 justify-end">
                      <Button variant="outline" onClick={() => setShowFundComparison(true)}>
                        {language === 'de' ? 'Fonds vs. Police' : 'Fund vs. Insurance'}
                      </Button>
                      <Button onClick={() => setShowPayoutSimulator(true)}>
                        {language === 'de' ? 'Flexible Entnahme simulieren' : 'Simulate flexible withdrawals'}
                      </Button>
                    </div>

                    <CostImpactWaterfall
                      language={language}
                      monthlyContribution={inputs.monthlyContribution}
                      contractYears={Math.max(12, inputs.retirementAge - inputs.currentAge)}
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center h-[600px]"
                >
                  <Card className="glass-card p-12 text-center max-w-md">
                    <div className="inline-flex p-6 rounded-3xl bg-primary/10 mb-6">
                      <Calculator className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">
                      {language === 'de' ? 'Bereit zum Berechnen?' : 'Ready to Calculate?'}
                    </h3>
                    <p className="text-muted-foreground">
                      {language === 'de'
                        ? 'Passen Sie die Parameter an und klicken Sie auf "Berechnen", um Ihre persönliche Rentenprognose zu sehen.'
                        : 'Adjust the parameters and click "Calculate" to see your personalized pension projection.'}
                    </p>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
      <FundSavingsPlanComparison
        isOpen={showFundComparison}
        onClose={() => setShowFundComparison(false)}
        monthlyContribution={inputs.monthlyContribution}
        currentAge={inputs.currentAge}
        retirementAge={inputs.retirementAge}
        language={language}
      />

      <FlexiblePayoutSimulator
        isOpen={showPayoutSimulator}
        onClose={() => setShowPayoutSimulator(false)}
        portfolioValue={finalCapital || inputs.startCapital}
        payoutStartAge={inputs.retirementAge}
        payoutEndAge={Math.min(inputs.retirementAge + 18, 85)}
        language={language}
      />
    </>
  );
};

export default PremiumCalculator;
