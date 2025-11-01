import React from 'react';
import { useDebekaData } from '@/hooks/useDebekaData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, RefreshCw, AlertCircle, Clock, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DebekaPriceWidgetProps {
  className?: string;
  showLastUpdate?: boolean;
  compact?: boolean;
}

export function DebekaPriceWidget({ 
  className, 
  showLastUpdate = true,
  compact = false 
}: DebekaPriceWidgetProps) {
  const { data, loading, error, lastUpdate, isStale } = useDebekaData();

  if (loading) {
    return (
      <Card className={cn("animate-pulse border-blue-200 bg-gradient-to-br from-blue-50/30 to-white", className)}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
              <div className="absolute inset-0 h-5 w-5 rounded-full bg-blue-600/20 animate-ping" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="h-4 w-32 bg-blue-200 rounded animate-pulse" />
              <div className="h-6 w-24 bg-blue-100 rounded animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className={cn("border-amber-300 bg-gradient-to-br from-amber-50/50 to-white", className)}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-700" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-amber-900 text-sm">Daten nicht verfügbar</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Verwende Fallback-Wert
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg", className)}>
        <TrendingUp className="h-4 w-4 text-green-600" />
        <span className="font-semibold text-lg text-slate-900">
          {data.priceFormatted} {data.currency}
        </span>
        {isStale ? (
          <Badge variant="outline" className="text-xs text-amber-700 border-amber-300 bg-amber-50">
            <AlertCircle className="h-3 w-3 mr-1" />
            veraltet
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs text-green-700 border-green-300 bg-green-50">
            <Activity className="h-3 w-3 mr-1" />
            live
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className={cn("border-blue-200 hover:shadow-md transition-shadow duration-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-blue-600" />
                {!isStale && <div className="absolute inset-0 w-2 h-2 rounded-full bg-blue-400 animate-ping" />}
              </div>
              {data.fundName}
            </CardTitle>
            {data.priceDate && (
              <CardDescription className="text-xs mt-1 flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                Stand: {data.priceDate}
              </CardDescription>
            )}
          </div>
          {isStale ? (
            <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50 text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              veraltet
            </Badge>
          ) : (
            <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50 text-xs">
              <Activity className="h-3 w-3 mr-1" />
              live
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Price Display */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg p-5 text-white shadow-sm">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight">
                {data.priceFormatted}
              </span>
              <span className="text-lg font-semibold text-blue-100">
                {data.currency}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-100">
              <TrendingUp className="h-3 w-3" />
              <span>Preis pro Anteil</span>
            </div>
          </div>
          
          {/* Update Info */}
          {showLastUpdate && lastUpdate && (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <RefreshCw className="h-3 w-3" />
                <span>
                  Aktualisiert: {new Date(data.lastUpdateCET.split(',')[0].split('.').reverse().join('-')).toLocaleDateString('de-DE', { 
                    day: '2-digit', 
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
              {data.method && (
                <Badge variant="secondary" className="text-xs">
                  {data.method === 'puppeteer' ? '🤖 Auto' : data.method === 'manual-update' ? '✏️ Manuell' : '💾 Cache'}
                </Badge>
              )}
            </div>
          )}
          
          {data.chartDataPoints > 0 && (
            <div className="pt-2 border-t border-slate-200">
              <Badge variant="outline" className="text-xs text-slate-600">
                📊 {data.chartDataPoints} historische Datenpunkte verfügbar
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Inline price display for use in text
 */
export function DebekaPriceInline({ className }: { className?: string }) {
  const { data, loading } = useDebekaData();

  if (loading) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 rounded", className)}>
        <RefreshCw className="h-3 w-3 animate-spin text-blue-600" />
        <span className="text-sm text-blue-600 font-medium">lädt...</span>
      </span>
    );
  }

  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded font-semibold text-blue-900",
      className
    )}>
      {data?.priceFormatted || '233,38'} {data?.currency || 'EUR'}
    </span>
  );
}
