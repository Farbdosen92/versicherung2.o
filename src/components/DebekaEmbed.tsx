import React, { useState } from 'react';
import { useDebekaData } from '@/hooks/useDebekaData';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, TrendingUp, RefreshCw, AlertCircle, ArrowUpRight, FileText, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DebekaEmbedProps {
  showChart?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * Debeka Widget with embedded content
 * Shows price, date, and link to full Debeka website
 */
export function DebekaEmbed({
  showChart = true,
  compact = false,
  className,
}: DebekaEmbedProps) {
  const { data, loading, error, isStale } = useDebekaData();
  const [showFullPage, setShowFullPage] = useState(false);

  if (loading && !data) {
    return (
      <Card className={cn('animate-pulse border-blue-200 bg-gradient-to-br from-blue-50/50 to-white', className)}>
        <CardContent className="p-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
              <div className="absolute inset-0 h-6 w-6 rounded-full bg-blue-600/20 animate-ping" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="h-4 w-48 bg-blue-200 rounded animate-pulse" />
              <div className="h-3 w-32 bg-blue-100 rounded animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !data) {
    return (
      <Card className={cn('border-amber-300 bg-gradient-to-br from-amber-50 to-white', className)}>
        <CardContent className="p-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-amber-700" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="font-semibold text-amber-900">Daten temporär nicht verfügbar</p>
              <p className="text-sm text-amber-700">Verwende Fallback-Werte. Aktualisierung erfolgt automatisch.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <Card className="border-blue-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse" />
                  <div className="absolute inset-0 w-3 h-3 rounded-full bg-blue-400 animate-ping" />
                </div>
                <CardTitle className="text-xl">
                  {data?.fundName || 'Debeka Global Shares'}
                </CardTitle>
              </div>
              <CardDescription className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Aktueller Anteilswert • Täglich aktualisiert um 4:00 Uhr
              </CardDescription>
            </div>
            <Dialog open={showFullPage} onOpenChange={setShowFullPage}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Vollansicht
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Debeka Global Shares</DialogTitle>
                  <DialogDescription className="text-base">
                    Vollständige Informationen von der offiziellen Debeka-Website
                  </DialogDescription>
                </DialogHeader>
                <DebekaWebsiteEmbed />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Enhanced Price Display with Gradient */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600 rounded-xl p-8 text-white shadow-md">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />
            
            <div className="relative flex items-end justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-blue-100 uppercase tracking-wide">
                    Preis pro Anteil
                  </p>
                  {!isStale && (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-100 border-green-400/30 text-xs">
                      Live
                    </Badge>
                  )}
                </div>
                <div className="flex items-baseline gap-3">
                  <p className="text-5xl font-bold tracking-tight">
                    {data?.priceFormatted || '—'}
                  </p>
                  <p className="text-2xl font-semibold text-blue-100">
                    {data?.currency}
                  </p>
                </div>
                <p className="text-sm text-blue-100 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Stand: {data?.priceDate || '—'}
                </p>
              </div>
              <div className="hidden sm:block">
                <TrendingUp className="h-16 w-16 text-blue-300/30" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Status Information Grid */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-lg p-4 space-y-1 border border-slate-200">
              <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                Datenquelle
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {data?.method === 'puppeteer' ? '🤖 Automatisch' : 
                 data?.method === 'manual-update' ? '✏️ Manuell' : 
                 '💾 Fallback'}
              </p>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4 space-y-1 border border-slate-200">
              <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                Aktualisiert
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {data?.lastUpdateCET
                  ? new Date(data.lastUpdateCET.split(',')[0].split('.').reverse().join('-')).toLocaleDateString('de-DE', { 
                      day: '2-digit', 
                      month: 'short' 
                    })
                  : '—'}
              </p>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4 space-y-1 border border-slate-200">
              <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                Status
              </p>
              <div className="flex items-center gap-2">
                {isStale ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <p className="text-sm font-semibold text-amber-700">Veraltet</p>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-sm font-semibold text-green-700">Aktuell</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-5">
            <div className="flex gap-4">
              <div className="flex-shrink-0 mt-0.5">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-blue-900 text-sm">
                  Automatische Preisaktualisierung
                </p>
                <p className="text-sm text-blue-700 leading-relaxed">
                  Der Anteilspreis wird täglich um <strong>4:00 Uhr</strong> automatisch von der 
                  Debeka-Website abgerufen. Für vollständige Informationen und aktuelle Charts 
                  besuchen Sie die offizielle Website.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons - Improved */}
          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            <Button
              variant="default"
              className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200 h-12"
              asChild
            >
              <a
                href="https://www.debeka.de/landingpages/sonstige/debeka-global-shares.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-5 w-5" />
                <span className="font-semibold">Debeka Website öffnen</span>
                <ArrowUpRight className="h-4 w-4 ml-auto" />
              </a>
            </Button>
            <Button 
              variant="outline" 
              className="gap-2 hover:bg-slate-50 border-slate-300 hover:border-slate-400 transition-all duration-200 h-12" 
              asChild
            >
              <a
                href="https://www.debeka.de/content/dam/de/webauftritt/sonstige/landingpages/fonds/produktinformation-debeka-global-shares.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileText className="h-5 w-5" />
                <span className="font-semibold">Factsheet (PDF)</span>
              </a>
            </Button>
          </div>

          {/* Additional Fund Information */}
          <div className="pt-4 border-t border-slate-200">
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-xs text-slate-600 font-medium">ISIN</p>
                <p className="font-mono text-slate-900">DE000A2DMST6</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-600 font-medium">Fondstyp</p>
                <p className="text-slate-900">Aktienfonds Global</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Embedded Debeka Website in a Modal/Dialog
 * Shows key information without full site overhead
 */
function DebekaWebsiteEmbed() {
  const [loading, setLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-5">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ExternalLink className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-blue-900 text-sm">
              Externe Website wird geladen
            </p>
            <p className="text-sm text-blue-700 leading-relaxed">
              Die Debeka-Website wird direkt eingebettet. Falls die Anzeige nicht funktioniert, 
              nutzen Sie bitte den direkten Link unten.
            </p>
          </div>
        </div>
      </div>

      {loading && !iframeError && (
        <div className="flex items-center justify-center h-[500px] bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border-2 border-dashed border-slate-300">
          <div className="text-center space-y-4">
            <div className="relative inline-flex">
              <RefreshCw className="h-10 w-10 animate-spin text-blue-600" />
              <div className="absolute inset-0 h-10 w-10 rounded-full bg-blue-600/20 animate-ping" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-slate-700">Website wird geladen...</p>
              <p className="text-sm text-slate-500">Dies kann einen Moment dauern</p>
            </div>
          </div>
        </div>
      )}

      {/* Iframe - may be blocked by CORS but worth trying */}
      {!iframeError && (
        <iframe
          src="https://www.debeka.de/landingpages/sonstige/debeka-global-shares.html"
          title="Debeka Global Shares"
          className={cn(
            "w-full h-[600px] border-2 border-slate-200 rounded-lg shadow-inner transition-opacity duration-500",
            loading ? "opacity-0" : "opacity-100"
          )}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setIframeError(true);
          }}
        />
      )}

      {(iframeError || !loading) && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg p-5">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="p-2 bg-amber-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-700" />
              </div>
            </div>
            <div className="space-y-3 flex-1">
              <div>
                <p className="font-semibold text-amber-900 text-sm mb-1">
                  {iframeError ? 'Einbettung nicht möglich' : 'Alternative: Direkter Zugriff'}
                </p>
                <p className="text-sm text-amber-800 leading-relaxed">
                  {iframeError 
                    ? 'Die Debeka-Website erlaubt keine Einbettung. Bitte öffnen Sie die Website direkt:'
                    : 'Für die beste Erfahrung öffnen Sie die Website direkt im neuen Tab:'
                  }
                </p>
              </div>
              <Button
                variant="default"
                className="bg-amber-600 hover:bg-amber-700 gap-2"
                asChild
              >
                <a
                  href="https://www.debeka.de/landingpages/sonstige/debeka-global-shares.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                  Debeka Global Shares öffnen
                  <ArrowUpRight className="h-4 w-4 ml-auto" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DebekaEmbed;
