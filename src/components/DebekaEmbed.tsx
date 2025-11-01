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
import { ExternalLink, TrendingUp, RefreshCw, AlertCircle } from 'lucide-react';
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
      <Card className={cn('animate-pulse', className)}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Loading Debeka data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !data) {
    return (
      <Card className={cn('border-destructive/50', className)}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>Failed to load Debeka data</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600" />
                {data?.fundName || 'Debeka Global Shares'}
              </CardTitle>
              <CardDescription>
                Current share price
              </CardDescription>
            </div>
            <Dialog open={showFullPage} onOpenChange={setShowFullPage}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Full Site
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Debeka Global Shares</DialogTitle>
                  <DialogDescription>
                    Full information from Debeka's official website
                  </DialogDescription>
                </DialogHeader>
                <DebekaWebsiteEmbed />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Price Display */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-50/50 rounded-lg p-6">
            <div className="flex items-end justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Price per share
                </p>
                <p className="text-4xl font-bold text-blue-600">
                  {data?.priceFormatted || '—'} {data?.currency}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </div>

          {/* Date and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">
                Stand
              </p>
              <p className="text-lg font-semibold">
                {data?.priceDate || '—'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-muted-foreground uppercase">
                Last Update
              </p>
              <p className="text-sm text-muted-foreground">
                {data?.lastUpdateCET
                  ? data.lastUpdateCET.split(',')[1]?.trim()
                  : '—'}
              </p>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {data?.method === 'puppeteer' ? '🤖 Automated' : 'Manual'}
            </Badge>
            {isStale && (
              <Badge variant="destructive" className="text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />
                Data outdated
              </Badge>
            )}
            {data?.success !== false && (
              <Badge variant="secondary" className="text-xs">
                ✓ Updated
              </Badge>
            )}
          </div>

          {/* Info Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Info:</strong> This price is updated daily at 4 AM CET.
              Click "View Full Site" for complete information from Debeka.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="default"
              className="flex-1 gap-2"
              asChild
            >
              <a
                href="https://www.debeka.de/landingpages/sonstige/debeka-global-shares.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                Visit Debeka Site
              </a>
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <a
                href="https://www.debeka.de/content/dam/de/webauftritt/sonstige/landingpages/fonds/produktinformation-debeka-global-shares.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                📄 Factsheet
              </a>
            </Button>
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

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> Loading the full Debeka website. This may take a moment.
          If it doesn't load, use the direct link below.
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-[400px] bg-muted rounded-lg">
          <div className="text-center space-y-2">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Loading Debeka website...</p>
          </div>
        </div>
      )}

      {/* Iframe - may be blocked by CORS but worth trying */}
      <iframe
        src="https://www.debeka.de/landingpages/sonstige/debeka-global-shares.html"
        title="Debeka Global Shares"
        className="w-full h-[600px] border rounded-lg"
        onLoad={() => setLoading(false)}
        onError={() => setLoading(false)}
      />

      {!loading && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-900">
            <strong>Can't see the content?</strong> The website may not allow embedding.
            Open it directly:{' '}
            <a
              href="https://www.debeka.de/landingpages/sonstige/debeka-global-shares.html"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold"
            >
              https://www.debeka.de/...
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

export default DebekaEmbed;
