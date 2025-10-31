import React, { useState } from 'react';
import TaxCalculator from '@/components/TaxCalculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Shield, PiggyBank } from 'lucide-react';
import {
  CAPITAL_GAINS_TAX_RATE_PERCENT,
  GOVERNMENT_PARAMETERS_2025,
} from '@/data/governmentParameters';
import { TaxCockpit } from '@/components/pension';

const TaxCalculatorPage: React.FC = () => {
  const [language] = useState<'de' | 'en'>('de');
  const taxYear = GOVERNMENT_PARAMETERS_2025.tax.year;

  const ruerupMaxFormattedDE = GOVERNMENT_PARAMETERS_2025.tax.ruerupMaxContribution.toLocaleString('de-DE');
  const ruerupMaxFormattedEN = GOVERNMENT_PARAMETERS_2025.tax.ruerupMaxContribution.toLocaleString('en-US');
  const ruerupDeductiblePercent = Math.round(GOVERNMENT_PARAMETERS_2025.tax.ruerupDeductibleRate * 100);
  const capitalGainsPercentDE = CAPITAL_GAINS_TAX_RATE_PERCENT.toLocaleString('de-DE', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
  const capitalGainsPercentEN = CAPITAL_GAINS_TAX_RATE_PERCENT.toLocaleString('en-US', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });

  const texts = {
    de: {
      title: 'Steuerrechner für Private Altersvorsorge',
      subtitle: 'Vergleichen Sie verschiedene Anlagestrategien für Ihre Altersvorsorge',
      benefits: {
        title: 'Steuerliche Aspekte der Altersvorsorge:',
        items: [
          {
            icon: Shield,
            title: 'Sonderausgabenabzug',
            description: `Bis zu ${ruerupMaxFormattedDE}€ (${taxYear}) können als Sonderausgaben abgesetzt werden – ${ruerupDeductiblePercent}% absetzbar, 100% ab 2025`
          },
          {
            icon: TrendingUp,
            title: 'Sofortige Steuerersparnis',
            description: 'Reduzierung der Einkommensteuer bereits im Jahr der Einzahlung'
          },
          {
            icon: PiggyBank,
            title: 'Nachgelagerte Besteuerung',
            description: 'Besteuerung erst in der Rente, oft zu einem niedrigeren Steuersatz'
          }
        ]
      },
      etfTaxes: {
        title: 'ETF-Besteuerung im Vergleich:',
        items: [
          'Vorabpauschale: Jährliche Besteuerung auch ohne Verkauf',
          `Abgeltungsteuer: ${capitalGainsPercentDE}% auf alle Gewinne`,
          'Keine Steuervorteile bei Einzahlung',
          'Sofortige Besteuerung von Erträgen'
        ]
      },
      disclaimer: 'Hinweis: Diese Berechnung dient nur zur Orientierung. Für eine individuelle Beratung wenden Sie sich an einen Steuerberater oder Finanzberater.'
    },
    en: {
      title: 'Tax Calculator for Private Pension Plans',
      subtitle: 'Compare different investment strategies for your retirement planning',
      benefits: {
        title: 'Tax aspects of retirement planning:',
        items: [
          {
            icon: Shield,
            title: 'Special Expense Deduction',
            description: `Up to €${ruerupMaxFormattedEN} (${taxYear}) can be deducted as special expenses – ${ruerupDeductiblePercent}% deductible, 100% from 2025`
          },
          {
            icon: TrendingUp,
            title: 'Immediate Tax Savings',
            description: 'Reduction of income tax already in the year of payment'
          },
          {
            icon: PiggyBank,
            title: 'Deferred Taxation',
            description: 'Taxation only in retirement, often at a lower tax rate'
          }
        ]
      },
      etfTaxes: {
        title: 'ETF taxation in comparison:',
        items: [
          'Advance lump sum: Annual taxation even without sale',
          `Capital gains tax: ${capitalGainsPercentEN}% on all profits`,
          'No tax advantages on contributions',
          'Immediate taxation of returns'
        ]
      },
      disclaimer: 'Note: This calculation is for guidance only. For individual advice, consult a tax advisor or financial advisor.'
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{texts[language].title}</h1>
          <p className="text-gray-600 mt-2">{texts[language].subtitle}</p>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">{texts[language].benefits.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {texts[language].benefits.items.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={index} className="flex items-start gap-3">
                      <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                        <Icon className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {benefit.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">{texts[language].etfTaxes.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {texts[language].etfTaxes.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">{item}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tax Cockpit */}
        <div className="mt-10">
          <TaxCockpit language={language} />
        </div>

        {/* Tax Calculator Component */}
        <TaxCalculator language={language} />

        {/* Disclaimer */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>⚠️ {texts[language].disclaimer}</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaxCalculatorPage;
