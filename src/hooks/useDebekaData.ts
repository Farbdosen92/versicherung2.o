import { useState, useEffect } from 'react';

export interface DebekaData {
  lastUpdate: string;
  lastUpdateCET: string;
  source: string;
  currentPrice: number | null;
  priceFormatted: string | null;
  priceDate: string | null;
  currency: string;
  fundName: string;
  chartData: Array<{ date: string | number; value: number }>;
  chartDataPoints: number;
  method?: string;
}

export interface UseDebekaDataResult {
  data: DebekaData | null;
  loading: boolean;
  error: Error | null;
  lastUpdate: Date | null;
  isStale: boolean; // More than 24 hours old
}

/**
 * Hook to fetch and use Debeka Global Shares data
 * Data is updated daily at 4 AM CET via GitHub Actions
 */
export function useDebekaData(): UseDebekaDataResult {
  const [data, setData] = useState<DebekaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch from public folder (bundled with build)
        const response = await fetch('/versicherung2.o/debeka-data.json');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch Debeka data: ${response.status}`);
        }
        
        const jsonData = await response.json();
        setData(jsonData);
        setError(null);
        
      } catch (err) {
        console.error('Error loading Debeka data:', err);
        setError(err as Error);
        
        // Fallback to hardcoded data
        setData({
          lastUpdate: new Date().toISOString(),
          lastUpdateCET: new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }),
          source: 'fallback',
          currentPrice: 233.38,
          priceFormatted: '233,38',
          priceDate: '30.10.2025',
          currency: 'EUR',
          fundName: 'Debeka Global Shares',
          chartData: [],
          chartDataPoints: 0,
          method: 'fallback',
        });
        
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Check if data is stale (more than 25 hours old)
  const isStale = data?.lastUpdate 
    ? (Date.now() - new Date(data.lastUpdate).getTime()) > 25 * 60 * 60 * 1000
    : false;

  const lastUpdate = data?.lastUpdate ? new Date(data.lastUpdate) : null;

  return { data, loading, error, lastUpdate, isStale };
}

/**
 * Get current Debeka price synchronously (if data already loaded)
 */
export function useDebekaPrice(): number {
  const { data } = useDebekaData();
  
  // Fallback to a reasonable default if data not available
  return data?.currentPrice ?? 233.38;
}

/**
 * Get Debeka chart data for visualization
 */
export function useDebekaChartData() {
  const { data, loading } = useDebekaData();
  
  return {
    chartData: data?.chartData ?? [],
    hasChartData: (data?.chartDataPoints ?? 0) > 0,
    loading,
  };
}
