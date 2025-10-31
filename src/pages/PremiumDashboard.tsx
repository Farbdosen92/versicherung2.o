import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  Calculator,
  TrendingUp,
  BarChart3,
  DollarSign,
  PieChart,
  ArrowRight,
  Sparkles,
  Target,
  TrendingDown,
  Clock,
  Shield,
  Zap,
  Award,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useOnboardingStore } from '@/stores/onboardingStore';
import {
  AllPensionComparison,
  CostImpactWaterfall,
  FundSavingsPlanComparison,
  FlexiblePayoutSimulator,
  PensionGapCard,
  TaxCockpit,
} from '@/components/pension';

interface PremiumDashboardProps {
  language?: 'de' | 'en';
}

export const PremiumDashboard: React.FC<PremiumDashboardProps> = ({ language = 'de' }) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const { data } = useOnboardingStore();
  const [showFundComparison, setShowFundComparison] = useState(false);
  const [showPayoutSimulator, setShowPayoutSimulator] = useState(false);

  const scopeBoth = data.personal?.maritalStatus === 'verheiratet' && data.personal?.calcScope === 'beide_personen';
  const netMonthlyIncome = scopeBoth
    ? (data.income.netMonthly_A || 0) + (data.income.netMonthly_B || 0)
    : data.income.netMonthly || 0;

  const currentAge = data.personal?.age
    ? data.personal.age
    : data.personal?.birthYear
      ? new Date().getFullYear() - data.personal.birthYear
      : 35;

  const privateContribution = scopeBoth
    ? (data.privatePension.contribution_A || 0) + (data.privatePension.contribution_B || 0)
    : data.privatePension.contribution || 0;

  const fundBalance = scopeBoth
    ? (data.funds.balance_A || 0) + (data.funds.balance_B || 0)
    : data.funds.balance || 0;

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

  const texts = {
    de: {
      welcome: 'Willkommen zurück',
      subtitle: 'Ihre finanzielle Zukunft im Überblick',
      quickActions: 'Schnellzugriff',
      calculator: 'Rente berechnen',
      calculatorDesc: 'Berechnen Sie Ihre zukünftige Altersvorsorge',
      comparison: 'Produkte vergleichen',
      comparisonDesc: 'Vergleichen Sie verschiedene Vorsorgemodelle',
      funds: 'Fonds analysieren',
      fundsDesc: 'Analysieren Sie Fondsperformance und Renditen',
      taxCalculator: 'Steuern berechnen',
      taxCalculatorDesc: 'Berechnen Sie Ihre Steuerbelastung',
      insights: 'Ihre Übersicht',
      currentSavings: 'Aktuelle Ersparnisse',
      projectedRetirement: 'Prognostizierte Rente',
      monthlyContribution: 'Monatliche Einzahlung',
      yearsUntilRetirement: 'Jahre bis Rente',
      features: 'Premium Features',
      secureData: 'Sichere Daten',
      secureDataDesc: 'Ihre Daten sind verschlüsselt und geschützt',
      instantCalc: 'Sofort-Berechnung',
      instantCalcDesc: 'Ergebnisse in Echtzeit',
      expertAdvice: 'Expertenrat',
      expertAdviceDesc: 'Professionelle Finanzberatung',
      getStarted: 'Jetzt starten',
      recentActivity: 'Kürzliche Aktivitäten',
      noActivity: 'Noch keine Aktivitäten',
    },
    en: {
      welcome: 'Welcome back',
      subtitle: 'Your financial future at a glance',
      quickActions: 'Quick Actions',
      calculator: 'Calculate Pension',
      calculatorDesc: 'Calculate your future retirement savings',
      comparison: 'Compare Products',
      comparisonDesc: 'Compare different pension models',
      funds: 'Analyze Funds',
      fundsDesc: 'Analyze fund performance and returns',
      taxCalculator: 'Calculate Taxes',
      taxCalculatorDesc: 'Calculate your tax burden',
      insights: 'Your Overview',
      currentSavings: 'Current Savings',
      projectedRetirement: 'Projected Pension',
      monthlyContribution: 'Monthly Contribution',
      yearsUntilRetirement: 'Years to Retirement',
      features: 'Premium Features',
      secureData: 'Secure Data',
      secureDataDesc: 'Your data is encrypted and protected',
      instantCalc: 'Instant Calculation',
      instantCalcDesc: 'Real-time results',
      expertAdvice: 'Expert Advice',
      expertAdviceDesc: 'Professional financial consulting',
      getStarted: 'Get Started',
      recentActivity: 'Recent Activity',
      noActivity: 'No recent activity',
    },
  };

  const t = texts[language];

  const quickActions = [
    {
      id: 'calculator',
      title: t.calculator,
      description: t.calculatorDesc,
      icon: Calculator,
      href: '/calculator',
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-500/10 to-blue-600/5',
    },
    {
      id: 'comparison',
      title: t.comparison,
      description: t.comparisonDesc,
      icon: BarChart3,
      href: '/vergleich',
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-500/10 to-purple-600/5',
    },
    {
      id: 'funds',
      title: t.funds,
      description: t.fundsDesc,
      icon: TrendingUp,
      href: '/fonds',
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-500/10 to-green-600/5',
    },
    {
      id: 'tax',
      title: t.taxCalculator,
      description: t.taxCalculatorDesc,
      icon: DollarSign,
      href: '/tax-calculator',
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-500/10 to-orange-600/5',
    },
  ];

  // Calculate real KPI values from onboarding data
  const yearsUntilRetirement = Math.max(0, retirementAge - currentAge);
  const retirementYear = new Date().getFullYear() + yearsUntilRetirement;
  
  // Estimate monthly pension based on portfolio value
  const monthlyPension = estimatedPortfolioValue > 0 
    ? Math.round(estimatedPortfolioValue * 0.04 / 12) 
    : 0;
  
  const kpis = [
    {
      label: t.currentSavings,
      value: fundBalance > 0 
        ? `€${fundBalance.toLocaleString('de-DE')}` 
        : estimatedPortfolioValue > 0 
          ? `€${Math.round(estimatedPortfolioValue).toLocaleString('de-DE')}` 
          : '€0',
      change: fundBalance > 0 || estimatedPortfolioValue > 0 ? '+12.5%' : '0%',
      trend: (fundBalance > 0 || estimatedPortfolioValue > 0 ? 'up' : 'neutral') as 'up' | 'neutral',
      icon: PieChart,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: t.projectedRetirement,
      value: monthlyPension > 0 ? `€${monthlyPension.toLocaleString('de-DE')}` : '€0',
      change: language === 'de' ? 'pro Monat' : 'per month',
      trend: (monthlyPension > 0 ? 'up' : 'neutral') as 'up' | 'neutral',
      icon: Target,
      color: 'from-green-500 to-green-600',
    },
    {
      label: t.monthlyContribution,
      value: privateContribution > 0 ? `€${Math.round(privateContribution).toLocaleString('de-DE')}` : '€0',
      change: language === 'de' 
        ? (privateContribution > 0 ? `${Math.round(netMonthlyIncome * 0.15)} € empfohlen` : 'Noch nicht festgelegt')
        : (privateContribution > 0 ? `€${Math.round(netMonthlyIncome * 0.15)} recommended` : 'Not set yet'),
      trend: 'neutral' as const,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
    },
    {
      label: t.yearsUntilRetirement,
      value: yearsUntilRetirement.toString(),
      change: language === 'de' ? `Bis ${retirementYear}` : `Until ${retirementYear}`,
      trend: 'neutral' as const,
      icon: Clock,
      color: 'from-orange-500 to-orange-600',
    },
  ];

  const features = [
    {
      icon: Shield,
      title: t.secureData,
      description: t.secureDataDesc,
    },
    {
      icon: Zap,
      title: t.instantCalc,
      description: t.instantCalcDesc,
    },
    {
      icon: Award,
      title: t.expertAdvice,
      description: t.expertAdviceDesc,
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-accent/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8 pt-16 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-semibold text-sm">
              <Sparkles className="h-4 w-4" />
              <span>{language === 'de' ? 'Premium Finanzplanung' : 'Premium Financial Planning'}</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                {t.welcome}
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              {t.subtitle}
            </p>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute top-20 right-1/4 w-64 h-64 bg-success/5 rounded-full blur-3xl -z-10" />
      </section>

      <div className="container mx-auto px-4 lg:px-8 pb-20">
        {/* KPI Cards */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, index) => {
              const Icon = kpi.icon;
              return (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index, duration: 0.4 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group"
                >
                  <Card className="kpi-card-premium group-hover:border-primary/30 transition-all duration-500 h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={cn(
                          "p-3 rounded-xl bg-gradient-to-r shadow-soft-lg",
                          kpi.color
                        )}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        {kpi.trend === 'up' && (
                          <div className="flex items-center gap-1 text-xs font-semibold text-success bg-success-light px-2 py-1 rounded-full">
                            <TrendingUp className="h-3 w-3" />
                            {kpi.change}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                        <p className="stat-number">{kpi.value}</p>
                        {kpi.trend === 'neutral' && (
                          <p className="text-xs text-muted-foreground">{kpi.change}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Quick Actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-16"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{t.quickActions}</h2>
              <p className="text-muted-foreground mt-2">
                {language === 'de' ? 'Starten Sie Ihre Finanzplanung' : 'Start your financial planning'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              const isHovered = hoveredCard === action.id;

              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.4 }}
                >
                  <Link href={action.href}>
                    <motion.div
                      onHoverStart={() => setHoveredCard(action.id)}
                      onHoverEnd={() => setHoveredCard(null)}
                      whileHover={{ y: -8, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card className={cn(
                        "premium-card cursor-pointer group overflow-hidden h-full transition-all duration-500",
                        isHovered && "border-primary/40 shadow-soft-2xl"
                      )}>
                        <div className={cn(
                          "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                          action.bgGradient
                        )} />
                        <CardHeader className="relative z-10 pb-4">
                          <div className="flex items-start justify-between">
                            <div className={cn(
                              "p-4 rounded-2xl bg-gradient-to-r shadow-soft-lg transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6",
                              action.gradient
                            )}>
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            <motion.div
                              animate={{ x: isHovered ? 4 : 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                            </motion.div>
                          </div>
                          <CardTitle className="text-2xl mt-6 group-hover:text-primary transition-colors duration-300">
                            {action.title}
                          </CardTitle>
                          <CardDescription className="text-base mt-2">
                            {action.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="relative z-10">
                          <div className="flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all duration-300">
                            <span>{t.getStarted}</span>
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Premium Features */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">{t.features}</h2>
            <p className="text-muted-foreground text-lg">
              {language === 'de' ? 'Alles was Sie für Ihre Altersvorsorge brauchen' : 'Everything you need for your retirement planning'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 * index, duration: 0.4 }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="glass-card text-center h-full">
                    <CardContent className="p-8">
                      <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-6">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Retirement Intelligence */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mb-16 space-y-12"
        >
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <PensionGapCard language={language} retirementAge={retirementAge} />
            <TaxCockpit
              language={language}
              currentAgeOverride={currentAge}
              retirementAgeOverride={retirementAge}
              monthlyContributionOverride={privateContribution || undefined}
              fundBalanceOverride={fundBalance || undefined}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'de' ? 'Produkt- & Rechtsfundament' : 'Product & Legal Foundation'}
                </CardTitle>
                <CardDescription>
                  {language === 'de'
                    ? 'Debeka Global Shares & private Rentenpolice gemäß VAG §124'
                    : 'Debeka Global Shares & private pension policy under German VAG §124'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <ul className="list-disc list-inside space-y-2">
                  <li>{language === 'de'
                    ? 'Chance Invest / Balance / Garant – individuelle Garantie-/Fonds-Mischung'
                    : 'Chance Invest / Balance / Garant – flexible guarantee vs. fund mix'}</li>
                  <li>{language === 'de'
                    ? 'Ansparphase steuerfrei, in der Rentenphase Ertragsanteil bzw. 12/62-Regel'
                    : 'Tax deferred in accumulation, earnings portion or 12/62 in payout'}</li>
                  <li>{language === 'de'
                    ? 'KID CA6I: 2,5% Einstiegskosten (über 5 Jahre), 0,3% p.a. laufende Kosten, RIY ≈ 1,0%'
                    : 'KID CA6I: 2.5% entry cost (over 5 years), 0.3% p.a. running cost, RIY ≈ 1.0%'}</li>
                  <li>{language === 'de'
                    ? 'Fundierte ESG-Ausrichtung, BaFin-reguliert, historische Performance kein Garant'
                    : 'ESG aligned, BaFin supervised; historic performance not a guarantee'}</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'de' ? 'Problem → Mechanik → Lösung' : 'Problem → Mechanics → Solution'}
                </CardTitle>
                <CardDescription>
                  {language === 'de'
                    ? 'Transparente Darstellung ohne Emotionalisierung'
                    : 'Transparent storytelling without emotional framing'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <ul className="list-disc list-inside space-y-2">
                  <li>{language === 'de'
                    ? 'Problem: Netto-Einkommen heute vs. Netto-Rentenströme ab Rentenbeginn → Versorgungslücke'
                    : 'Problem: Today’s net income vs. net pension flows in retirement → gap'}</li>
                  <li>{language === 'de'
                    ? 'Mechanik: Vollständige Nachsteuerlogik inkl. Vorabpauschale, Teilfreistellung, 12/62'
                    : 'Mechanics: Full after-tax logic incl. lump sum, partial exemption, 12/62'}</li>
                  <li>{language === 'de'
                    ? 'Lösung: Szenarien GRV / ETF / Debeka / Kombination inklusive Sensitivitäten'
                    : 'Solution: Scenarios GRV / ETF / Debeka / combination with sensitivities'}</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <AllPensionComparison
              language={language}
              currentAge={currentAge}
              netMonthlyIncome={netMonthlyIncome || 0}
              privatePensionMonthly={privateContribution || 0}
              retirementAge={retirementAge}
            />

            <div className="flex flex-col md:flex-row gap-4 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowFundComparison(true)}
              >
                {language === 'de' ? 'Fonds vs. Police' : 'Fund vs. Insurance'}
              </Button>
              <Button onClick={() => setShowPayoutSimulator(true)}>
                {language === 'de' ? 'Flexible Entnahme simulieren' : 'Simulate flexible withdrawals'}
              </Button>
            </div>

            <CostImpactWaterfall
              language={language}
              monthlyContribution={privateContribution || 300}
              contractYears={Math.max(12, retirementAge - currentAge)}
            />
          </div>
        </motion.section>

        {/* Call to Action */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Card className="gradient-card text-center overflow-hidden">
            <CardContent className="p-12 md:p-16">
              <div className="max-w-2xl mx-auto space-y-6">
                <h2 className="text-4xl font-bold tracking-tight">
                  {language === 'de' ? 'Bereit für Ihre finanzielle Zukunft?' : 'Ready for your financial future?'}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {language === 'de'
                    ? 'Starten Sie jetzt mit der Planung Ihrer Altersvorsorge und sichern Sie sich eine sorgenfreie Zukunft.'
                    : 'Start planning your retirement now and secure a worry-free future.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Link href="/calculator">
                    <Button size="lg" className="btn-premium-primary group">
                      {language === 'de' ? 'Jetzt berechnen' : 'Calculate Now'}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/vergleich">
                    <Button size="lg" variant="outline" className="btn-premium-secondary">
                      {language === 'de' ? 'Produkte vergleichen' : 'Compare Products'}
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>
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

export default PremiumDashboard;
