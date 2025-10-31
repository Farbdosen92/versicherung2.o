/**
 * Retirement Reality Timeline Chart
 * 
 * Stacked area chart showing dramatic income cliff at retirement:
 * - Phase 1 (Working): Current net income (rich blue)
 * - Phase 2 (Retirement): Stacked income streams (GRV, Riester, bAV, Private, etc.)
 * - Reference lines: Lifestyle target (80%), Basic coverage (60%)
 * - Apple-style toggle for Basis vs. Complete view
 */

import React, { useState, useMemo } from 'react';
import { Settings, Info } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface RetirementTimelineInput {
  currentNetIncome: number;
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  
  // Income sources at retirement
  statutoryPension: number;
  companyPension?: number;
  riesterPension?: number;
  ruerupPension?: number;
  privatePension?: number;
  versorgungswerk?: number;
  civilServantPension?: number;
  zvkVblPension?: number;
}

interface TimelineDataPoint {
  age: number;
  currentIncome: number;
  statutoryPension: number;
  companyPension: number;
  riesterPension: number;
  ruerupPension: number;
  privatePension: number;
  versorgungswerk: number;
  civilServantPension: number;
  zvkVblPension: number;
  totalRetirementIncome: number;
  lifestyleTarget: number;
  basicCoverage: number;
}

// ============================================================================
// CHART COLORS (From UNIFIED_SPECIFICATION.md)
// ============================================================================

const CHART_COLORS = {
  currentIncome: '#1e40af',      // Rich blue
  grv: '#9ca3af',                // Pale gray
  riester: '#fde047',            // Light yellow
  company: '#fb923c',            // Orange
  private: '#059669',            // Strong green (THE SOLUTION)
  ruerup: '#3b82f6',             // Blue
  pension: '#1e3a8a',            // Dark blue (civil servant)
  versorgungswerk: '#a855f7',    // Purple
  zvkVbl: '#06b6d4',             // Cyan
  lifestyleTarget: '#374151',    // Dark gray
  basicCoverage: '#f97316',      // Orange
  gapRed: '#fecaca',             // Light red for gap area
  gapOrange: '#fed7aa'           // Light orange for gap area
};

// ============================================================================
// DATA PREPARATION
// ============================================================================

function prepareTimelineData(input: RetirementTimelineInput): TimelineDataPoint[] {
  const {
    currentNetIncome,
    currentAge,
    retirementAge,
    lifeExpectancy,
    statutoryPension,
    companyPension = 0,
    riesterPension = 0,
    ruerupPension = 0,
    privatePension = 0,
    versorgungswerk = 0,
    civilServantPension = 0,
    zvkVblPension = 0
  } = input;

  const data: TimelineDataPoint[] = [];
  const lifestyleTarget = currentNetIncome * 0.80; // 80% rule
  const basicCoverage = currentNetIncome * 0.60;   // 60% rule

  // Working phase (current age to retirement)
  for (let age = currentAge; age < retirementAge; age++) {
    data.push({
      age,
      currentIncome: currentNetIncome,
      statutoryPension: 0,
      companyPension: 0,
      riesterPension: 0,
      ruerupPension: 0,
      privatePension: 0,
      versorgungswerk: 0,
      civilServantPension: 0,
      zvkVblPension: 0,
      totalRetirementIncome: 0,
      lifestyleTarget,
      basicCoverage
    });
  }

  // Retirement phase (retirement to life expectancy)
  for (let age = retirementAge; age <= lifeExpectancy; age++) {
    const totalRetirementIncome = 
      statutoryPension +
      companyPension +
      riesterPension +
      ruerupPension +
      privatePension +
      versorgungswerk +
      civilServantPension +
      zvkVblPension;

    data.push({
      age,
      currentIncome: 0,
      statutoryPension,
      companyPension,
      riesterPension,
      ruerupPension,
      privatePension,
      versorgungswerk,
      civilServantPension,
      zvkVblPension,
      totalRetirementIncome,
      lifestyleTarget,
      basicCoverage
    });
  }

  return data;
}

// ============================================================================
// CUSTOM TOOLTIP
// ============================================================================

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: number;
  showAllSources: boolean;
}

function CustomTooltip({ active, payload, label, showAllSources }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload as TimelineDataPoint;
  const isWorking = data.currentIncome > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-900 mb-2">Alter {label}</p>
      
      {isWorking ? (
        <div className="space-y-1">
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Netto-Einkommen:</span>
            <span className="font-medium">{formatEUR(data.currentIncome)}</span>
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          {data.statutoryPension > 0 && (
            <div className="flex justify-between gap-4">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS.grv }}></span>
                <span className="text-gray-600">GRV:</span>
              </span>
              <span className="font-medium">{formatEUR(data.statutoryPension)}</span>
            </div>
          )}
          {showAllSources && data.riesterPension > 0 && (
            <div className="flex justify-between gap-4">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS.riester }}></span>
                <span className="text-gray-600">Riester:</span>
              </span>
              <span className="font-medium">{formatEUR(data.riesterPension)}</span>
            </div>
          )}
          {showAllSources && data.companyPension > 0 && (
            <div className="flex justify-between gap-4">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS.company }}></span>
                <span className="text-gray-600">Betriebsrente:</span>
              </span>
              <span className="font-medium">{formatEUR(data.companyPension)}</span>
            </div>
          )}
          {data.privatePension > 0 && (
            <div className="flex justify-between gap-4">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS.private }}></span>
                <span className="text-gray-600">Private RV:</span>
              </span>
              <span className="font-medium">{formatEUR(data.privatePension)}</span>
            </div>
          )}
          {showAllSources && data.ruerupPension > 0 && (
            <div className="flex justify-between gap-4">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS.ruerup }}></span>
                <span className="text-gray-600">Rürup:</span>
              </span>
              <span className="font-medium">{formatEUR(data.ruerupPension)}</span>
            </div>
          )}
          {showAllSources && data.versorgungswerk > 0 && (
            <div className="flex justify-between gap-4">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS.versorgungswerk }}></span>
                <span className="text-gray-600">Versorgungswerk:</span>
              </span>
              <span className="font-medium">{formatEUR(data.versorgungswerk)}</span>
            </div>
          )}
          {showAllSources && data.civilServantPension > 0 && (
            <div className="flex justify-between gap-4">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS.pension }}></span>
                <span className="text-gray-600">Beamtenpension:</span>
              </span>
              <span className="font-medium">{formatEUR(data.civilServantPension)}</span>
            </div>
          )}
          {showAllSources && data.zvkVblPension > 0 && (
            <div className="flex justify-between gap-4">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS.zvkVbl }}></span>
                <span className="text-gray-600">ZVK/VBL:</span>
              </span>
              <span className="font-medium">{formatEUR(data.zvkVblPension)}</span>
            </div>
          )}
          <div className="pt-1 mt-1 border-t border-gray-200">
            <div className="flex justify-between gap-4">
              <span className="font-semibold text-gray-900">Gesamt:</span>
              <span className="font-semibold">{formatEUR(data.totalRetirementIncome)}</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            <div>Ziel (80%): {formatEUR(data.lifestyleTarget)}</div>
            <div>Grundversorgung (60%): {formatEUR(data.basicCoverage)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SETTINGS DIALOG
// ============================================================================

interface SettingsDialogProps {
  retirementAge: number;
  lifeExpectancy: number;
  onUpdate: (settings: { retirementAge: number; lifeExpectancy: number }) => void;
}

function SettingsDialog({ retirementAge, lifeExpectancy, onUpdate }: SettingsDialogProps) {
  const [localRetirementAge, setLocalRetirementAge] = useState(retirementAge);
  const [localLifeExpectancy, setLocalLifeExpectancy] = useState(lifeExpectancy);

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Zeitstrahl-Einstellungen</DialogTitle>
        <DialogDescription>
          Passen Sie das Rentenalter und die Lebenserwartung an.
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6 py-4">
        <div className="space-y-2">
          <Label>Geplantes Rentenalter</Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[localRetirementAge]}
              onValueChange={([value]) => setLocalRetirementAge(value)}
              min={63}
              max={70}
              step={1}
              className="flex-1"
            />
            <span className="w-12 text-right font-medium">{localRetirementAge}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Lebenserwartung</Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[localLifeExpectancy]}
              onValueChange={([value]) => setLocalLifeExpectancy(value)}
              min={75}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="w-12 text-right font-medium">{localLifeExpectancy}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Durchschnittliche Lebenserwartung in Deutschland: ~84 Jahre
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => {
          setLocalRetirementAge(67);
          setLocalLifeExpectancy(85);
        }}>
          Zurücksetzen
        </Button>
        <Button onClick={() => onUpdate({ 
          retirementAge: localRetirementAge, 
          lifeExpectancy: localLifeExpectancy 
        })}>
          Anwenden
        </Button>
      </div>
    </DialogContent>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export interface RetirementRealityTimelineProps {
  input: RetirementTimelineInput;
  onSettingsChange?: (settings: Partial<RetirementTimelineInput>) => void;
  className?: string;
}

export function RetirementRealityTimeline({
  input,
  onSettingsChange,
  className = ''
}: RetirementRealityTimelineProps) {
  const [showAllSources, setShowAllSources] = useState(true);

  // Prepare chart data
  const data = useMemo(() => prepareTimelineData(input), [input]);

  // Calculate key metrics
  const totalRetirementIncome = useMemo(() => {
    return (
      input.statutoryPension +
      (input.companyPension || 0) +
      (input.riesterPension || 0) +
      (input.ruerupPension || 0) +
      (input.privatePension || 0) +
      (input.versorgungswerk || 0) +
      (input.civilServantPension || 0) +
      (input.zvkVblPension || 0)
    );
  }, [input]);

  const gap = input.currentNetIncome - totalRetirementIncome;
  const gapPercent = (gap / input.currentNetIncome) * 100;

  const handleSettingsUpdate = (settings: { retirementAge: number; lifeExpectancy: number }) => {
    if (onSettingsChange) {
      onSettingsChange(settings);
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Ihr Einkommensverlauf im Ruhestand
          </h2>
          <p className="text-sm text-gray-600">
            Die Darstellung zeigt Ihr heutiges Netto in heutiger Kaufkraft sowie die 
            voraussichtlichen Netto-Rentenströme ab Rentenbeginn.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5 text-gray-500" />
            </Button>
          </DialogTrigger>
          <SettingsDialog
            retirementAge={input.retirementAge}
            lifeExpectancy={input.lifeExpectancy}
            onUpdate={handleSettingsUpdate}
          />
        </Dialog>
      </div>

      {/* Toggle for Basis vs Complete view */}
      <div className="flex items-center justify-end gap-2 mb-4">
        <Label htmlFor="all-sources-toggle" className="text-sm text-gray-700">
          Alle Einkommensquellen anzeigen
        </Label>
        <Switch
          id="all-sources-toggle"
          checked={showAllSources}
          onCheckedChange={setShowAllSources}
        />
        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Info className="h-4 w-4 text-gray-400" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-xs">
                Aus: Zeigt nur GRV + Private RV (Basis-Absicherung)<br/>
                An: Zeigt alle Einkommensquellen (Vollständige Vorsorge)
              </p>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
      </div>

      {/* Chart */}
      <div className="mb-6" style={{ height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              {/* Gradient for current income */}
              <linearGradient id="currentIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.currentIncome} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={CHART_COLORS.currentIncome} stopOpacity={0.3}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="age" 
              label={{ value: 'Alter', position: 'insideBottom', offset: -5 }}
              stroke="#6b7280"
            />
            <YAxis 
              label={{ value: '€ pro Monat', angle: -90, position: 'insideLeft' }}
              stroke="#6b7280"
              tickFormatter={(value) => `${value.toLocaleString('de-DE')}€`}
            />
            <Tooltip content={<CustomTooltip showAllSources={showAllSources} />} />
            
            {/* Reference lines */}
            <ReferenceLine 
              y={input.currentNetIncome * 0.80} 
              stroke={CHART_COLORS.lifestyleTarget}
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{ 
                value: 'Lebensstandard-Ziel (80%)', 
                position: 'right',
                fill: CHART_COLORS.lifestyleTarget,
                fontSize: 12
              }}
            />
            <ReferenceLine 
              y={input.currentNetIncome * 0.60} 
              stroke={CHART_COLORS.basicCoverage}
              strokeDasharray="3 3"
              strokeWidth={2}
              label={{ 
                value: 'Grundversorgung (60%)', 
                position: 'right',
                fill: CHART_COLORS.basicCoverage,
                fontSize: 12
              }}
            />
            
            {/* Retirement age marker */}
            <ReferenceLine 
              x={input.retirementAge} 
              stroke="#374151"
              strokeWidth={2}
              label={{ 
                value: `Renteneintritt (${input.retirementAge})`, 
                position: 'top',
                fill: '#374151',
                fontSize: 12,
                fontWeight: 'bold'
              }}
            />

            {/* Working phase */}
            <Area
              type="monotone"
              dataKey="currentIncome"
              stroke={CHART_COLORS.currentIncome}
              strokeWidth={2}
              fill="url(#currentIncome)"
              name="Aktuelles Einkommen"
            />

            {/* Retirement phase - stacked areas */}
            {showAllSources && input.zvkVblPension && input.zvkVblPension > 0 && (
              <Area
                type="monotone"
                dataKey="zvkVblPension"
                stackId="retirement"
                stroke={CHART_COLORS.zvkVbl}
                fill={CHART_COLORS.zvkVbl}
                fillOpacity={0.6}
                name="ZVK/VBL"
              />
            )}
            {showAllSources && input.civilServantPension && input.civilServantPension > 0 && (
              <Area
                type="monotone"
                dataKey="civilServantPension"
                stackId="retirement"
                stroke={CHART_COLORS.pension}
                fill={CHART_COLORS.pension}
                fillOpacity={0.6}
                name="Beamtenpension"
              />
            )}
            {showAllSources && input.versorgungswerk && input.versorgungswerk > 0 && (
              <Area
                type="monotone"
                dataKey="versorgungswerk"
                stackId="retirement"
                stroke={CHART_COLORS.versorgungswerk}
                fill={CHART_COLORS.versorgungswerk}
                fillOpacity={0.6}
                name="Versorgungswerk"
              />
            )}
            {showAllSources && input.ruerupPension && input.ruerupPension > 0 && (
              <Area
                type="monotone"
                dataKey="ruerupPension"
                stackId="retirement"
                stroke={CHART_COLORS.ruerup}
                fill={CHART_COLORS.ruerup}
                fillOpacity={0.6}
                name="Rürup-Rente"
              />
            )}
            <Area
              type="monotone"
              dataKey="privatePension"
              stackId="retirement"
              stroke={CHART_COLORS.private}
              fill={CHART_COLORS.private}
              fillOpacity={0.8}
              name="Private Rentenversicherung"
            />
            {showAllSources && input.companyPension && input.companyPension > 0 && (
              <Area
                type="monotone"
                dataKey="companyPension"
                stackId="retirement"
                stroke={CHART_COLORS.company}
                fill={CHART_COLORS.company}
                fillOpacity={0.6}
                name="Betriebsrente"
              />
            )}
            {showAllSources && input.riesterPension && input.riesterPension > 0 && (
              <Area
                type="monotone"
                dataKey="riesterPension"
                stackId="retirement"
                stroke={CHART_COLORS.riester}
                fill={CHART_COLORS.riester}
                fillOpacity={0.6}
                name="Riester-Rente"
              />
            )}
            <Area
              type="monotone"
              dataKey="statutoryPension"
              stackId="retirement"
              stroke={CHART_COLORS.grv}
              fill={CHART_COLORS.grv}
              fillOpacity={0.6}
              name="Gesetzliche Rente (GRV)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="text-xs text-gray-600 mb-1">Heutiges Netto-Einkommen</p>
          <p className="text-xl font-bold text-gray-900">
            {formatEUR(input.currentNetIncome)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Geplantes Renteneinkommen</p>
          <p className="text-xl font-bold text-gray-900">
            {formatEUR(totalRetirementIncome)}
          </p>
          <p className="text-xs text-gray-500">
            {((totalRetirementIncome / input.currentNetIncome) * 100).toFixed(0)}% des aktuellen Einkommens
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Einkommensverlust</p>
          <p className={`text-xl font-bold ${gap > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {gap > 0 ? '-' : '+'}{formatEUR(Math.abs(gap))}
          </p>
          <p className="text-xs text-gray-500">
            {Math.abs(gapPercent).toFixed(0)}% {gap > 0 ? 'weniger' : 'mehr'}
          </p>
        </div>
      </div>

      {/* Warning if gap is critical */}
      {gap > input.currentNetIncome * 0.3 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-900 font-medium">
            ⚠️ Kritischer Einkommensverlust von {gapPercent.toFixed(0)}% im Ruhestand
          </p>
          <p className="text-xs text-red-700 mt-1">
            Sie verlieren über {formatEUR(gap)} monatlich. Erwägen Sie zusätzliche Altersvorsorge, 
            um Ihren Lebensstandard zu sichern.
          </p>
        </div>
      )}
    </Card>
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatEUR(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export default RetirementRealityTimeline;
