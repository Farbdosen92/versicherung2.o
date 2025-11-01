import React from 'react';
import { DebekaEmbed } from '@/components/DebekaEmbed';
import { DebekaPriceWidget, DebekaPriceInline } from '@/components/DebekaPriceWidget';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'wouter';

/**
 * Demo page showcasing the enhanced Debeka components
 * Shows different variations and usage examples
 */
export function DebekaDemo() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück
          </Button>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-slate-900">
              Debeka Integration Demo
            </h1>
            <p className="text-lg text-slate-600">
              Automatische Preisaktualisierung mit eleganten UI-Komponenten
            </p>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Widget - Full Width */}
          <div className="lg:col-span-2">
            <DebekaEmbed />
          </div>

          {/* Sidebar with Variations */}
          <div className="space-y-6">
            {/* Standard Widget */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
                Standard Widget
              </h3>
              <DebekaPriceWidget />
            </div>

            {/* Compact Widget */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
                Compact Widget
              </h3>
              <DebekaPriceWidget compact showLastUpdate={false} />
            </div>

            {/* Inline Example */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Inline Verwendung</CardTitle>
                <CardDescription>
                  Preis eingebettet im Text
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Der aktuelle Preis für den Debeka Global Shares beträgt{' '}
                  <DebekaPriceInline /> pro Anteil.
                </p>
              </CardContent>
            </Card>

            {/* Features Card */}
            <Card className="border-green-200 bg-gradient-to-br from-green-50/50 to-white">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Tägliche Auto-Updates um 4:00 Uhr</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Puppeteer-basiertes Web Scraping</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>GitHub Actions Automatisierung</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Responsive Design (Mobile-first)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Fallback für offline Betrieb</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Iframe-Modal mit Graceful Degradation</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Info Sections */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle>Technische Details</CardTitle>
              <CardDescription>
                Wie die Integration funktioniert
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-slate-900 mb-2">
                  🤖 Puppeteer Scraper
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Headless Chrome rendert die Debeka-Website und extrahiert den 
                  aktuellen Anteilspreis. Läuft täglich automatisch via GitHub Actions.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-slate-900 mb-2">
                  ⚡ Smart Deployment
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Deployment erfolgt nur bei Preisänderung. Spart Ressourcen und 
                  vermeidet unnötige Builds.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-slate-900 mb-2">
                  💾 Fallback System
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Bei Fetch-Fehlern werden gecachte Werte verwendet. Manueller 
                  Update-Script als Backup verfügbar (5 Sekunden).
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Usage Examples */}
          <Card>
            <CardHeader>
              <CardTitle>Verwendungsbeispiele</CardTitle>
              <CardDescription>
                Verschiedene Integration-Optionen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-slate-900 mb-2">
                  📊 Dashboard Integration
                </h4>
                <pre className="text-xs bg-slate-100 p-3 rounded border border-slate-200 overflow-x-auto">
                  <code>{`<DebekaEmbed />`}</code>
                </pre>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-slate-900 mb-2">
                  🎯 Sidebar Widget
                </h4>
                <pre className="text-xs bg-slate-100 p-3 rounded border border-slate-200 overflow-x-auto">
                  <code>{`<DebekaPriceWidget 
  compact 
  showLastUpdate={false} 
/>`}</code>
                </pre>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-slate-900 mb-2">
                  📝 Inline im Text
                </h4>
                <pre className="text-xs bg-slate-100 p-3 rounded border border-slate-200 overflow-x-auto">
                  <code>{`Der Preis beträgt 
<DebekaPriceInline /> 
pro Anteil.`}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Info */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 text-4xl">ℹ️</div>
            <div className="space-y-2">
              <h3 className="font-bold text-blue-900 text-lg">
                Produktions-Status
              </h3>
              <p className="text-blue-800 leading-relaxed">
                Diese Komponenten sind <strong>production-ready</strong> und können 
                sofort in jeder Seite der App verwendet werden. Die Daten werden 
                automatisch täglich aktualisiert. Kein manueller Eingriff erforderlich.
              </p>
              <div className="flex gap-3 mt-4">
                <Button
                  variant="default"
                  size="sm"
                  asChild
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Link href="/premium">Zum Dashboard</Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <Link href="/premium/funds">Fonds-Übersicht</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DebekaDemo;
