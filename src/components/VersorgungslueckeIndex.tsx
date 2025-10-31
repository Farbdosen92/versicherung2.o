/**
 * Versorgungslücke Index Gauge Component
 * 
 * Large speedometer/gauge visualization showing pension gap coverage
 * Color zones: Green (100%+), Yellow (70-99%), Orange (50-69%), Red (<50%)
 */

import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { PensionGapCalculator, type PensionGapResult, type PensionGapInput } from '@/services/pensionGapCalculator';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

// ============================================================================
// GAUGE SVG COMPONENT
// ============================================================================

interface GaugeSVGProps {
  percentage: number; // 0-150
  color: string;
}

function GaugeSVG({ percentage, color }: GaugeSVGProps) {
  // Gauge parameters
  const size = 300;
  const strokeWidth = 30;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // Half circle
  
  // Calculate needle rotation (-90 to +90 degrees)
  // 0% = -90deg, 100% = 0deg, 150% = +90deg
  const needleRotation = -90 + (percentage / 150) * 180;
  
  // Zone colors and ranges
  const zones = [
    { start: 0, end: 50, color: '#dc2626' },    // Red
    { start: 50, end: 70, color: '#f97316' },   // Orange
    { start: 70, end: 100, color: '#fbbf24' },  // Yellow
    { start: 100, end: 150, color: '#059669' }  // Green
  ];

  return (
    <svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.6}`}>
      {/* Background zones */}
      {zones.map((zone, i) => {
        const startAngle = -90 + (zone.start / 150) * 180;
        const endAngle = -90 + (zone.end / 150) * 180;
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;
        
        const x1 = center + radius * Math.cos(startRad);
        const y1 = center + radius * Math.sin(startRad);
        const x2 = center + radius * Math.cos(endRad);
        const y2 = center + radius * Math.sin(endRad);
        
        const largeArc = endAngle - startAngle > 180 ? 1 : 0;
        
        return (
          <path
            key={i}
            d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`}
            fill="none"
            stroke={zone.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            opacity={0.3}
          />
        );
      })}
      
      {/* Active indicator */}
      <path
        d={`M ${center} ${center} L ${center} ${center - radius}`}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        transform={`rotate(${needleRotation} ${center} ${center})`}
        style={{ transition: 'transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      />
      
      {/* Center circle */}
      <circle
        cx={center}
        cy={center}
        r={15}
        fill={color}
        style={{ transition: 'fill 300ms ease-in-out' }}
      />
      
      {/* Zone labels */}
      <text x={40} y={center + 10} fontSize="12" fill="#6b7280" textAnchor="middle">0%</text>
      <text x={center - 40} y={40} fontSize="12" fill="#6b7280" textAnchor="middle">50%</text>
      <text x={center} y={25} fontSize="12" fill="#6b7280" textAnchor="middle">100%</text>
      <text x={center + 40} y={40} fontSize="12" fill="#6b7280" textAnchor="middle">150%</text>
      <text x={size - 40} y={center + 10} fontSize="12" fill="#6b7280" textAnchor="middle">200%</text>
    </svg>
  );
}

// ============================================================================
// SETTINGS DIALOG
// ============================================================================

interface SettingsDialogProps {
  workExpensePercent: number;
  healthcareCostIncrease: number;
  targetIncomePercent: number;
  onUpdate: (settings: {
    workExpensePercent: number;
    healthcareCostIncrease: number;
    targetIncomePercent: number;
  }) => void;
}

function SettingsDialog({ workExpensePercent, healthcareCostIncrease, targetIncomePercent, onUpdate }: SettingsDialogProps) {
  const [localWorkExpense, setLocalWorkExpense] = useState(workExpensePercent * 100);
  const [localHealthcare, setLocalHealthcare] = useState(healthcareCostIncrease);
  const [localTarget, setLocalTarget] = useState(targetIncomePercent * 100);

  const handleApply = () => {
    onUpdate({
      workExpensePercent: localWorkExpense / 100,
      healthcareCostIncrease: localHealthcare,
      targetIncomePercent: localTarget / 100
    });
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Berechnungseinstellungen</DialogTitle>
        <DialogDescription>
          Passen Sie die Parameter für die Versorgungslücken-Berechnung an.
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6 py-4">
        {/* Work expense savings */}
        <div className="space-y-2">
          <Label>Arbeitskostenersparnis im Ruhestand</Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[localWorkExpense]}
              onValueChange={([value]) => setLocalWorkExpense(value)}
              min={6}
              max={15}
              step={1}
              className="flex-1"
            />
            <span className="w-12 text-right font-medium">{localWorkExpense}%</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Wegfallende Kosten: Pendeln, Arbeitskleidung, Außer-Haus-Verpflegung
          </p>
        </div>

        {/* Healthcare cost increase */}
        <div className="space-y-2">
          <Label>Zusätzliche Gesundheitskosten</Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[localHealthcare]}
              onValueChange={([value]) => setLocalHealthcare(value)}
              min={0}
              max={500}
              step={10}
              className="flex-1"
            />
            <span className="w-20 text-right font-medium">€{localHealthcare}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Monatliche Mehrkosten für Gesundheit im Alter
          </p>
        </div>

        {/* Target income percentage */}
        <div className="space-y-2">
          <Label>Ziel-Einkommen im Ruhestand</Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[localTarget]}
              onValueChange={([value]) => setLocalTarget(value)}
              min={60}
              max={100}
              step={5}
              className="flex-1"
            />
            <span className="w-12 text-right font-medium">{localTarget}%</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Prozent des heutigen Einkommens (Standard: 70%)
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => {
          setLocalWorkExpense(10);
          setLocalHealthcare(150);
          setLocalTarget(70);
        }}>
          Zurücksetzen
        </Button>
        <Button onClick={handleApply}>Anwenden</Button>
      </div>
    </DialogContent>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export interface VersorgungslueckeIndexProps {
  input: PensionGapInput;
  onSettingsChange?: (settings: Partial<PensionGapInput>) => void;
  showInflationToggle?: boolean;
  className?: string;
}

export function VersorgungslueckeIndex({
  input,
  onSettingsChange,
  showInflationToggle = false,
  className = ''
}: VersorgungslueckeIndexProps) {
  const [useInflation, setUseInflation] = useState(false);
  
  // Calculate pension gap
  const gap = PensionGapCalculator.calculate(input);
  const zone = PensionGapCalculator.getGaugeZone(gap.coverageRatioAdjusted);
  const summary = PensionGapCalculator.generateSummaryText(gap);

  // Calculate required savings
  const yearsUntilRetirement = (input.retirementAge || 67) - input.currentAge;
  const requiredSavings = PensionGapCalculator.calculateRequiredSavings(
    gap,
    yearsUntilRetirement,
    0.065,
    useInflation,
    0.02
  );

  const handleSettingsUpdate = (settings: {
    workExpensePercent: number;
    healthcareCostIncrease: number;
    targetIncomePercent: number;
  }) => {
    if (onSettingsChange) {
      onSettingsChange({
        workExpenseSavingsPercent: settings.workExpensePercent,
        healthcareCostIncrease: settings.healthcareCostIncrease,
        targetIncomePercent: settings.targetIncomePercent
      });
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      {/* Header with settings button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Versorgungslücke Index</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5 text-gray-500" />
            </Button>
          </DialogTrigger>
          <SettingsDialog
            workExpensePercent={input.workExpenseSavingsPercent || 0.10}
            healthcareCostIncrease={input.healthcareCostIncrease || 150}
            targetIncomePercent={input.targetIncomePercent || 0.70}
            onUpdate={handleSettingsUpdate}
          />
        </Dialog>
      </div>

      {/* Gauge visualization */}
      <div className="flex justify-center mb-6">
        <GaugeSVG
          percentage={Math.min(gap.coverageRatioAdjusted, 150)}
          color={zone.color}
        />
      </div>

      {/* Status display */}
      <div className="text-center mb-6">
        <div 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-lg mb-2"
          style={{ backgroundColor: `${zone.color}20`, color: zone.color }}
        >
          <span>{PensionGapCalculator.formatPercent(gap.coverageRatioAdjusted)}</span>
        </div>
        <p className="text-sm text-gray-600">{zone.description}</p>
      </div>

      {/* Summary text */}
      <div className="space-y-4 mb-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">{summary.title}</h3>
          <p className="text-sm text-gray-700 mb-2">{summary.description}</p>
          {gap.monthlyGap > 0 && (
            <p className="text-sm font-medium" style={{ color: zone.color }}>
              {summary.action}
            </p>
          )}
        </div>

        {/* Detailed breakdown */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Benötigt:</span>
            <p className="font-semibold text-gray-900">
              {PensionGapCalculator.formatEUR(gap.requiredRetirementIncome)}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Aktueller Pfad:</span>
            <p className="font-semibold text-gray-900">
              {PensionGapCalculator.formatEUR(gap.actualRetirementIncome)}
            </p>
          </div>
          {gap.monthlyGap > 0 && (
            <>
              <div>
                <span className="text-gray-600">Monatliche Lücke:</span>
                <p className="font-semibold" style={{ color: zone.color }}>
                  {PensionGapCalculator.formatEUR(gap.monthlyGap)}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Lebenslange Lücke:</span>
                <p className="font-semibold" style={{ color: zone.color }}>
                  {PensionGapCalculator.formatEUR(gap.lifetimeGap)}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Required savings (if gap exists) */}
      {gap.monthlyGap > 0 && requiredSavings.monthlyRequired > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            💡 Empfohlene monatliche Sparrate
          </h3>
          <p className="text-2xl font-bold text-blue-900 mb-1">
            {PensionGapCalculator.formatEUR(requiredSavings.monthlyRequired)}
          </p>
          <p className="text-sm text-blue-700">
            Um die Lücke zu schließen, sollten Sie monatlich ca.{' '}
            {PensionGapCalculator.formatEUR(requiredSavings.monthlyRequired)} zurücklegen
            ({yearsUntilRetirement} Jahre bis zur Rente, 6,5% Rendite p.a.).
          </p>
          <p className="text-xs text-blue-600 mt-2">
            Benötigtes Kapital mit 67: {PensionGapCalculator.formatEUR(requiredSavings.projectedValue)}
          </p>
        </div>
      )}

      {/* Inflation toggle */}
      {showInflationToggle && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <Label htmlFor="inflation-toggle" className="text-sm text-gray-600">
            Mit Inflationsanpassung (2% p.a.)
          </Label>
          <Switch
            id="inflation-toggle"
            checked={useInflation}
            onCheckedChange={setUseInflation}
          />
        </div>
      )}

      {/* Income sources breakdown */}
      <details className="mt-4 pt-4 border-t border-gray-200">
        <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
          Einkommensquellen im Detail
        </summary>
        <div className="mt-3 space-y-2 text-sm">
          {gap.breakdown.statutoryPension > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Gesetzliche Rente (GRV)</span>
              <span className="font-medium">{PensionGapCalculator.formatEUR(gap.breakdown.statutoryPension)}</span>
            </div>
          )}
          {gap.breakdown.companyPension > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Betriebsrente (bAV)</span>
              <span className="font-medium">{PensionGapCalculator.formatEUR(gap.breakdown.companyPension)}</span>
            </div>
          )}
          {gap.breakdown.riesterPension > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Riester-Rente</span>
              <span className="font-medium">{PensionGapCalculator.formatEUR(gap.breakdown.riesterPension)}</span>
            </div>
          )}
          {gap.breakdown.privatePension > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Private Rentenversicherung</span>
              <span className="font-medium">{PensionGapCalculator.formatEUR(gap.breakdown.privatePension)}</span>
            </div>
          )}
          {gap.breakdown.versorgungswerk > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Versorgungswerk</span>
              <span className="font-medium">{PensionGapCalculator.formatEUR(gap.breakdown.versorgungswerk)}</span>
            </div>
          )}
          {gap.breakdown.civilServantPension > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Beamtenpension</span>
              <span className="font-medium">{PensionGapCalculator.formatEUR(gap.breakdown.civilServantPension)}</span>
            </div>
          )}
          <div className="pt-2 border-t border-gray-200">
            <div className="flex justify-between font-semibold">
              <span>Gesamt-Renteneinkommen</span>
              <span>{PensionGapCalculator.formatEUR(gap.breakdown.totalPensionIncome)}</span>
            </div>
          </div>
          {gap.breakdown.netAdjustments !== 0 && (
            <>
              <div className="pt-2 text-gray-600 text-xs">Anpassungen:</div>
              {gap.breakdown.savedWorkExpenses > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>+ Wegfallende Arbeitskosten</span>
                  <span>+{PensionGapCalculator.formatEUR(gap.breakdown.savedWorkExpenses)}</span>
                </div>
              )}
              {gap.breakdown.mortgageSavings > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>+ Abbezahlte Hypothek</span>
                  <span>+{PensionGapCalculator.formatEUR(gap.breakdown.mortgageSavings)}</span>
                </div>
              )}
              {gap.breakdown.healthcareCostIncrease > 0 && (
                <div className="flex justify-between text-red-700">
                  <span>- Zusätzliche Gesundheitskosten</span>
                  <span>-{PensionGapCalculator.formatEUR(gap.breakdown.healthcareCostIncrease)}</span>
                </div>
              )}
            </>
          )}
        </div>
      </details>
    </Card>
  );
}

export default VersorgungslueckeIndex;
