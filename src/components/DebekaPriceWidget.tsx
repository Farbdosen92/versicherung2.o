import React from 'react';
import { useDebekaData } from '@/hooks/useDebekaData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, RefreshCw, AlertCircle } from 'lucide-react';
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
      <Card className={cn("animate-pulse", className)}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-6 w-24 bg-muted rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className={cn("border-destructive/50", className)}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Daten nicht verfügbar</p>
              <p className="text-sm text-muted-foreground">
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
      <div className={cn("flex items-center gap-2", className)}>
        <TrendingUp className="h-4 w-4 text-green-600" />
        <span className="font-semibold text-lg">
          {data.priceFormatted} {data.currency}
        </span>
        {isStale && (
          <Badge variant="outline" className="text-xs text-amber-600">
            veraltet
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">
            {data.fundName}
          </CardTitle>
          {isStale && (
            <Badge variant="outline" className="text-amber-600">
              <AlertCircle className="h-3 w-3 mr-1" />
              Daten veraltet
            </Badge>
          )}
        </div>
        {data.priceDate && (
          <CardDescription>
            Stand: {data.priceDate}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              {data.priceFormatted}
            </span>
            <span className="text-lg text-muted-foreground">
              {data.currency}
            </span>
          </div>
          
          {showLastUpdate && lastUpdate && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <RefreshCw className="h-3 w-3" />
              <span>
                Aktualisiert: {data.lastUpdateCET}
              </span>
            </div>
          )}
          
          {data.chartDataPoints > 0 && (
            <Badge variant="secondary" className="text-xs">
              {data.chartDataPoints} Datenpunkte verfügbar
            </Badge>
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
      <span className={cn("inline-flex items-center gap-1", className)}>
        <RefreshCw className="h-3 w-3 animate-spin" />
        <span className="text-muted-foreground">lädt...</span>
      </span>
    );
  }

  return (
    <span className={cn("font-semibold", className)}>
      {data?.priceFormatted || '233,38'} {data?.currency || 'EUR'}
    </span>
  );
}
