import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Calculator, Info, PiggyBank } from 'lucide-react';
import { calculateGermanTax, calculatePensionTaxSavings } from '@/utils/germanTaxCalculator';
import { GOVERNMENT_PARAMETERS_2025 } from '@/data/governmentParameters';
import { formatCurrency } from '@/lib/utils';

const taxFormSchema = z.object({
  annualGrossIncome: z.number().min(0).max(10000000),
  maritalStatus: z.enum(['single', 'married']),
  children: z.number().min(0).max(20),
  churchTaxRate: z.number().min(0).max(0.09),
  includeChurchTax: z.boolean(),
  specialExpenses: z.number().min(0).max(1000000),
  extraordinaryExpenses: z.number().min(0).max(1000000),
  pensionContribution: z.number().min(0).max(100000),
});

type TaxFormData = z.infer<typeof taxFormSchema>;

interface TaxCalculatorProps {
  language?: 'de' | 'en';
  initialIncome?: number;
}

export const TaxCalculator: React.FC<TaxCalculatorProps> = ({ language = 'de', initialIncome = 60000 }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const taxYear = GOVERNMENT_PARAMETERS_2025.tax.year;

  const form = useForm<TaxFormData>({
    resolver: zodResolver(taxFormSchema),
    defaultValues: {
      annualGrossIncome: initialIncome,
      maritalStatus: 'single',
      children: 0,
      churchTaxRate: 0.09,
      includeChurchTax: false,
      specialExpenses: 0,
      extraordinaryExpenses: 0,
      pensionContribution: 0,
    },
  });

  const watchedValues = form.watch();

  const taxResult = useMemo(() => {
    return calculateGermanTax({
      annualGrossIncome: watchedValues.annualGrossIncome,
      maritalStatus: watchedValues.maritalStatus,
      children: watchedValues.children,
      churchTaxRate: watchedValues.includeChurchTax ? watchedValues.churchTaxRate : 0,
      specialExpenses: watchedValues.specialExpenses,
      extraordinaryExpenses: watchedValues.extraordinaryExpenses,
    });
  }, [watchedValues]);

  const pensionSavings = useMemo(() => {
    if (watchedValues.pensionContribution === 0) return null;

    return calculatePensionTaxSavings(
      watchedValues.annualGrossIncome,
      watchedValues.pensionContribution,
      watchedValues.maritalStatus,
      watchedValues.children
    );
  }, [watchedValues]);

  const pieChartData = [
    { name: language === 'de' ? 'Einkommensteuer' : 'Income Tax', value: taxResult.incomeTax, color: '#3b82f6' },
    { name: language === 'de' ? 'Solidaritätszuschlag' : 'Solidarity Surcharge', value: taxResult.solidaritySurcharge, color: '#8b5cf6' },
  ];

  if (taxResult.churchTax > 0) {
    pieChartData.push({
      name: language === 'de' ? 'Kirchensteuer' : 'Church Tax',
      value: taxResult.churchTax,
      color: '#f59e0b',
    });
  }

  const barChartData = [
    {
      name: language === 'de' ? 'Brutto' : 'Gross',
      value: watchedValues.annualGrossIncome,
      fill: '#10b981',
    },
    {
      name: language === 'de' ? 'Steuern' : 'Taxes',
      value: taxResult.totalTax,
      fill: '#ef4444',
    },
    {
      name: language === 'de' ? 'Netto' : 'Net',
      value: taxResult.netIncome,
      fill: '#3b82f6',
    },
  ];

  const texts = {
    de: {
      title: `Steuerrechner ${taxYear}`,
      description: 'Berechnen Sie Ihre Einkommensteuer nach deutschem Steuerrecht',
      income: 'Bruttoeinkommen (Jahr)',
      maritalStatus: 'Familienstand',
      single: 'Ledig',
      married: 'Verheiratet',
      children: 'Anzahl Kinder',
      churchTax: 'Kirchensteuer',
      churchTaxRate: 'Kirchensteuersatz',
      advanced: 'Erweiterte Einstellungen',
      specialExpenses: 'Sonderausgaben',
      extraordinaryExpenses: 'Außergewöhnliche Belastungen',
      pensionContribution: 'Altersvorsorgebeiträge',
      results: 'Ergebnisse',
      taxableIncome: 'Zu versteuerndes Einkommen',
      incomeTax: 'Einkommensteuer',
      solidaritySurcharge: 'Solidaritätszuschlag',
      totalTax: 'Gesamtsteuerlast',
      netIncome: 'Nettoeinkommen',
      averageTaxRate: 'Durchschnitts­steuersatz',
      marginalTaxRate: 'Grenzsteuersatz',
      taxBracket: 'Steuerklasse',
      breakdown: 'Steueraufschlüsselung',
      comparison: 'Brutto-Netto-Vergleich',
      pensionSavings: 'Steuerersparnis durch Altersvorsorge',
      savingsAmount: 'Ersparnis',
      savingsRate: 'Ersparnis-Quote',
      monthly: '/Monat',
      annually: '/Jahr',
    },
    en: {
      title: `Tax Calculator ${taxYear}`,
      description: 'Calculate your income tax according to German tax law',
      income: 'Gross Income (Annual)',
      maritalStatus: 'Marital Status',
      single: 'Single',
      married: 'Married',
      children: 'Number of Children',
      churchTax: 'Church Tax',
      churchTaxRate: 'Church Tax Rate',
      advanced: 'Advanced Settings',
      specialExpenses: 'Special Expenses',
      extraordinaryExpenses: 'Extraordinary Expenses',
      pensionContribution: 'Pension Contributions',
      results: 'Results',
      taxableIncome: 'Taxable Income',
      incomeTax: 'Income Tax',
      solidaritySurcharge: 'Solidarity Surcharge',
      totalTax: 'Total Tax',
      netIncome: 'Net Income',
      averageTaxRate: 'Average Tax Rate',
      marginalTaxRate: 'Marginal Tax Rate',
      taxBracket: 'Tax Bracket',
      breakdown: 'Tax Breakdown',
      comparison: 'Gross-Net Comparison',
      pensionSavings: 'Tax Savings from Pension',
      savingsAmount: 'Savings',
      savingsRate: 'Savings Rate',
      monthly: '/month',
      annually: '/year',
    },
  };

  const t = texts[language];

  const QuickPreset = ({ income, label }: { income: number; label: string }) => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => form.setValue('annualGrossIncome', income)}
      className="text-xs"
    >
      {label}: {formatCurrency(income)}
    </Button>
  );

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            {t.title}
          </CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              {/* Quick Presets */}
              <div className="flex flex-wrap gap-2">
                <QuickPreset income={30000} label="30k" />
                <QuickPreset income={45000} label="45k" />
                <QuickPreset income={60000} label="60k" />
                <QuickPreset income={80000} label="80k" />
                <QuickPreset income={100000} label="100k" />
              </div>

              <Separator />

              {/* Main Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="annualGrossIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.income}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          className="text-lg font-semibold"
                        />
                      </FormControl>
                      <FormDescription>
                        {formatCurrency(watchedValues.annualGrossIncome / 12)} {t.monthly}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maritalStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.maritalStatus}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="single">{t.single}</SelectItem>
                          <SelectItem value="married">{t.married}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="children"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.children}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="includeChurchTax"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">{t.churchTax}</FormLabel>
                        <FormDescription>
                          {watchedValues.churchTaxRate * 100}%
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Advanced Settings */}
              <div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full"
                >
                  {t.advanced} {showAdvanced ? '▲' : '▼'}
                </Button>

                {showAdvanced && (
                  <div className="mt-4 space-y-4 p-4 bg-muted/50 rounded-lg">
                    <FormField
                      control={form.control}
                      name="specialExpenses"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.specialExpenses}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>
                            z.B. Versicherungsbeiträge, Spenden
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="extraordinaryExpenses"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.extraordinaryExpenses}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>
                            z.B. Krankheitskosten, Pflegekosten
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pensionContribution"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t.pensionContribution}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>
                            Für Berechnung der Steuerersparnis
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">{t.results}</TabsTrigger>
          <TabsTrigger value="breakdown">{t.breakdown}</TabsTrigger>
          <TabsTrigger value="comparison">{t.comparison}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t.taxableIncome}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(taxResult.taxableIncome)}</p>
                <p className="text-xs text-muted-foreground mt-1">{t.annually}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t.totalTax}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(taxResult.totalTax)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(taxResult.totalTax / 12)} {t.monthly}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t.netIncome}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(taxResult.netIncome)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(taxResult.netIncome / 12)} {t.monthly}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t.averageTaxRate}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{taxResult.averageTaxRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t.marginalTaxRate}: {taxResult.marginalTaxRate.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tax Bracket Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-semibold">{t.taxBracket}: {taxResult.taxBracket}</p>
                  <p className="text-sm text-muted-foreground">
                    Ihr Grenzsteuersatz beträgt {taxResult.marginalTaxRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pension Savings */}
          {pensionSavings && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <PiggyBank className="h-5 w-5" />
                  {t.pensionSavings}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>{t.savingsAmount}:</span>
                  <span className="text-xl font-bold text-green-700">
                    {formatCurrency(pensionSavings.savings)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>{t.savingsRate}:</span>
                  <span className="text-lg font-semibold text-green-700">
                    {pensionSavings.savingsRate.toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-green-700 mt-2">
                  Durch Altersvorsorgebeiträge von {formatCurrency(watchedValues.pensionContribution)} sparen
                  Sie {formatCurrency(pensionSavings.savings)} an Steuern!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="breakdown">
          <Card>
            <CardHeader>
              <CardTitle>{t.breakdown}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Pie Chart */}
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>

                <Separator />

                {/* Detailed Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">{t.incomeTax}:</span>
                    <span className="font-semibold">{formatCurrency(taxResult.incomeTax)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">{t.solidaritySurcharge}:</span>
                    <span className="font-semibold">{formatCurrency(taxResult.solidaritySurcharge)}</span>
                  </div>
                  {taxResult.churchTax > 0 && (
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">{t.churchTax}:</span>
                      <span className="font-semibold">{formatCurrency(taxResult.churchTax)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between py-2 text-lg font-bold">
                    <span>{t.totalTax}:</span>
                    <span className="text-red-600">{formatCurrency(taxResult.totalTax)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>{t.comparison}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaxCalculator;
