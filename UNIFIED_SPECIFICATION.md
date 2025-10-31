# Unified Technical Specification: Retirement Insurance Web Application

**Last Updated:** October 31, 2025  
**Project:** Debeka Global Shares - Problem-Centric Retirement Planning Tool  
**Approach:** Fact-based, non-emotional, mathematically precise

---

## Executive Summary

This application solves the retirement income gap problem through transparent visualization and comparison of three pension approaches:
1. **Statutory Pension (GRV)** - Base layer, insufficient alone
2. **ETF Savings Plan** - Tax-heavy, self-managed
3. **Fund-Linked Insurance (Debeka)** - Tax-optimized, professionally managed

### Core Philosophy
- **Problem-centric, not product-centric**
- Show the gap mathematically, not emotionally
- Complete German tax compliance
- Apple-style UX (clean, intuitive, guided)
- Real-time synchronization (no recalculate buttons)

---

## 1. Legal & Tax Foundation (Germany)

### 1.1 Product Information

#### Debeka Global Shares
- **Type:** Internal VAG fund (§124 Abs. 2 VAG)
- **Strategy:** Long-term equity growth, risk mitigation
- **Composition:** Debeka equity funds covering North America, Europe, Asia
- **ESG Criteria:** Yes
- **Direct Investment:** Not possible (only via insurance wrapper)
- **Historical Performance Disclaimer:** Required on all displays

#### Debeka Private Pension (Privatrente Modern)
- **Product Variants:**
  - **Chance Invest (0/100):** 0% guarantee, 100% fund
  - **Chance Balance (50/50):** 50% guarantee, 50% fund
  - **Chance Garant (100/0):** 100% guarantee, 0% fund
- **Guarantee Component:** 1% p.a. base, 2.25% total 2024 (incl. non-guaranteed surplus)
- **Fund Component:** Invests in Debeka Global Shares
- **Special Payments:** Only to investment component
- **Withdrawals:** Permitted
- **Expiry Management:** Available

#### KID (Key Information Document) - Tariff CA6I
- **Entry Costs:** 2.5% over 5 years (included in investment amount)
- **Ongoing Costs:** 0.3% p.a. on fund assets + €12 unit costs
- **RIY (30 years):** ~1.0% p.a. (0.2% entry, 0.8% ongoing)
- **Product Risk Class:** 3/7
- **Fund Risk Class:** 6/7
- **Supervisor:** BaFin

### 1.2 German Tax Law

#### ETF/Depot Taxation (Outside Insurance)
```
Abgeltungsteuer: 25% + 5.5% Soli = 26.375%
+ Kirchensteuer: 8% (BY/BW) or 9% (other states) on Abgeltungsteuer
= Effective: ~27.8% to ~27.995%

Sparer-Pauschbetrag (Tax Allowance):
- Single: €1,000 per year
- Married (joint): €2,000 per year

Teilfreistellung (Partial Exemption) per § 20 EStG:
- Equity funds (≥51% stocks): 30% tax-free
- Mixed funds (≥25% stocks): 15% tax-free
- Other funds: 0% tax-free

Vorabpauschale (Advance Lump-Sum) per § 18 InvStG:
- Formula: Fund value (Jan 1) × BMF base rate × 0.7
- BMF Base Rate 2025: 2.53%
- Applied annually, reduces reinvestment
- Maximum: Actual value increase of the year
- Teilfreistellung applies to Vorabpauschale
```

#### Insurance (Debeka Policy) Taxation
```
ACCUMULATION PHASE:
- No Abgeltungsteuer (tax deferral)
- No Vorabpauschale
- Tax stundung over entire contract term

DISTRIBUTION PHASE - Option A (Annuity):
Ertragsanteilbesteuerung per § 22 Nr. 1 S. 3a EStG:
Age 63: 20% taxable
Age 65: 18% taxable
Age 67: 17% taxable
Age 70: 15% taxable

DISTRIBUTION PHASE - Option B (Lump Sum):
12/62 Rule (Halbeinkünfteverfahren) per § 20 Abs. 1 Nr. 6 EStG:
Requirements:
- Contract duration ≥12 years
- Payout from age ≥62
Effect:
- Only 50% of gains taxable
- Teilfreistellung 15% (for fund-linked insurance)
- Personal tax rate applies (not Abgeltungsteuer)

Calculation Example:
Total payout: €200,000
Contributions: €66,000
Gains: €134,000
× Teilfreistellung: 85% = €113,900 taxable base
× Halbeinkünfteverfahren: 50% = €56,950 actually taxable
× Personal tax rate (30%): = €17,085 tax
Effective rate: 12.5% on gains (vs. 26.375% ETF)
```

#### Statutory Pension (GRV) Taxation
```
Besteuerungsanteil (Taxable Portion) per § 22 EStG:
2025 start: 83.5% taxable
2026 start: 84.0% taxable
...increasing 0.5% annually...
2058+: 100% taxable

Table must be updateable yearly.
```

---

## 2. Core Features & User Journey

### 2.1 Onboarding Flow (Centralized)

**Design Principle:** Single guided questionnaire (iPhone setup style)

#### Block 1: Personal Data
1. **Birth Year / Age** (auto-sync both fields)
2. **Marital Status** (Single-choice)
   - Ledig, Verheiratet, Geschieden, Getrennt lebend, Verwitwet
3. **Children** (Yes/No + count if yes)
4. **Couple Mode** (if married): "Calculate for you alone or both?"

#### Block 2: Current Income
5. **Monthly Net Income** (€)
6. **Annual Gross Income** (€, optional)
7. **Other Income** (Yes/No)
   - If yes: Type (dropdown) + Amount

#### Block 3: Retirement Income Expectations
8. **Expected Statutory Pension at 67** (€/month) - REQUIRED
   - Tooltip: "Found in your annual pension information (Renteninformation)"
9. **Pension (Civil Servants)** (€/month, optional)
10. **Versorgungswerk** (Professional pension fund) (€/month, optional)
11. **ZVK/VBL** (Public service additional) (€/month, optional)

#### Block 4: Existing Private Pensions
12. **Private Pension Insurance** (€/month at 67)
13. **Riester-Rente** (€/month at 67)
14. **Rürup-Rente** (€/month at 67)
15. **Company Pension (bAV)** (€/month at 67)

#### Block 5: Assets
16. **Life Insurance** (€ lump sum at payout)
17. **Fund Balance / Savings** (€ current)
18. **ETF Depot / Securities** (€ current)

#### Block 6: Liabilities
19. **Mortgage Outstanding?** (Yes/No)
    - If yes:
      - Current balance (€)
      - Interest lock-in end (dropdown: years)
      - Balance at lock-in end (€)
      - Current interest rate (%)

#### Block 7: Planning Goals
20. **Planned Retirement Age** (dropdown: 63/65/67/70)
21. **Monthly Savings Amount** (€ for insurance calculation)
22. **Contract Duration** (years until retirement)

**UI Requirements:**
- Progress indicator (12 steps of 12)
- "Back" and "Next" buttons
- Auto-save in browser localStorage or backend
- "Welcome back" message on return visits
- "Reset all data" option in footer

### 2.2 Problem Visualization Features

#### Feature A: Versorgungslücke Index (Dashboard Gauge)
**Visual:** Large speedometer/gauge

**Zones:**
- Green (100%+): "Lebensstandard gesichert"
- Yellow (70-99%): "Moderate Einschränkungen notwendig"
- Orange (50-69%): "Erhebliche Versorgungslücke"
- Red (<50%): "Kritische Unterversorgung"

**Calculation:**
```javascript
current_net = user_input.net_income;
required_retirement = current_net * 0.70; // 70% rule

total_retirement_income = 
  statutory_pension +
  company_pension +
  riester +
  ruerup +
  private_pension;

coverage_ratio = (total_retirement_income / required_retirement) * 100;
monthly_gap = required_retirement - total_retirement_income;
```

**Display Below Gauge:**
```
Zur Sicherung Ihres Lebensstandards benötigen Sie €2.850 monatlich (netto).
Ihr aktueller Pfad sichert €1.720 (60%).
Versorgungslücke: €1.130 monatlich
```

**Interactive:**
- Gear icon: Adjust work expense % (6-15%), healthcare increase % (10-25%)
- Toggle: "Mit Inflationsanpassung" vs "Heutige Kaufkraft"
- Slider: Test retirement age (63-70)

#### Feature B: Retirement Reality Timeline (Area Chart)
**Chart Type:** Stacked area chart with dramatic cliff effect

**X-Axis:** Age (current to 90)
**Y-Axis:** Monthly net income (€)

**Phase 1 (Current → 67):**
- Rich blue (#1e40af) full-height area
- Represents current net income

**Phase 2 (67 → 90):**
Stacked areas from bottom:
1. **GRV** (Gesetzliche Rente): Pale gray (#9ca3af)
2. **Riester**: Light yellow (#fde047) - if applicable
3. **Betriebsrente**: Orange (#fb923c) - if applicable
4. **Private Insurance**: Strong green (#059669) - THE SOLUTION
5. **Rürup/Other**: Blue (#3b82f6) - if applicable

**Reference Lines:**
- "Lebensstandard-Ziel" (80%): Solid dark gray line
- "Grundversorgung" (60%): Dashed orange line

**Visual Drama:**
- Vertical line at age 67: "Renteneintritt"
- White gap between pension stack and target line = THE PROBLEM
- Red shading in gap area below 60% line
- Orange shading between 60-80% lines

**Interactive:**
- Hover: Tooltip with exact € amounts per source
- Gear icon: Retirement age slider (moves cliff), inflation toggle, life expectancy
- Auto-annotations at ages 67, 85

#### Feature C: Switchable View (Apple-Style Toggle)
**Implementation:** Checkbox in top-right corner of timeline chart

**Unchecked (Gray) - "Basis-Absicherung":**
- Shows only: GRV + Private Insurance (Debeka)

**Checked (Green) - "Vollständige Vorsorge":**
- Shows all: GRV, Riester, bAV, Rürup, Private, Versorgungswerk, Pension
- Semi-transparent overlapping colors
- See cumulative income height

**Animation:** 300ms smooth transition when toggling

#### Feature D: Monthly Budget Reality Table
**Location:** Bottom of comparison page

**Structure:**
```
| Category              | Working (Today) | Retirement (67+) | Change       |
|-----------------------|-----------------|------------------|--------------|
| Net Monthly Income    | €2,820          | -                | -€2,820 (-100%)|
| Statutory Pension     | -               | €1,420           | +€1,420      |
| Private Pension       | -               | €580             | +€580        |
| TOTAL INCOME          | €2,820          | €2,445           | -€375 (-13%) |
|                       |                 |                  |              |
| Work Commute          | -€180           | €0               | +€180        |
| Work Clothing         | -€60            | €0               | +€60         |
| Out-of-Home Meals     | -€140           | €0               | +€140        |
| Mortgage Payment      | -€950           | €0               | +€950        |
| AVAILABLE FOR LIVING  | €1,490          | €2,445           | +€955 (+64%) |
```

**Color Coding:**
- Red: Income losses
- Green: Savings/gains
- Bold: Totals

**Interactive:**
- Info icons: Explain each calculation
- Gear icon: Customize expense categories
- Toggle: Show/hide tax deductions

**Contextual Messages:**
- Green box if net positive
- Orange/red warning if net negative
- Explanation of why numbers differ

### 2.3 Comparison Engine Features

#### Feature E: ETF vs Insurance Comparison Tool
**Trigger:** Button "Mit Fondsparplan vergleichen"

**Input Section (Modal or Expandable):**

**ETF Savings Plan:**
- Expected return: 7% (default)
- Front-end load: 0-5% (default 0%)
- Annual TER: 0.07-0.8% (default 0.20%)
- Depot fees: €0-50/year
- Fund type (sets Teilfreistellung): Equity 30% / Mixed 15% / Other 0%

**Insurance (Debeka):**
- Expected return: 6.5% (default, slightly lower)
- Effective cost ratio: 1.0-1.5% (default 1.2%)
- Product variant: Chance Invest 100%

**Tax Settings:**
- Personal tax rate: Auto-calculated or manual (%)
- Sparerpauschbetrag: €1,000 (single) / €2,000 (married)
- Vorabpauschale: Yes/No (default yes)
- Kirchensteuer: Yes/No + rate (8% or 9%)

#### Feature F: Wealth Accumulation Chart (Dual Area)
**Chart Type:** Two overlapping area charts

**Line 1: ETF Savings Plan (Light Blue #60a5fa)**
- Annual tax drag from Vorabpauschale
- Annual Abgeltungsteuer on distributions
- TER costs
- Lower growth curve

**Line 2: Insurance (Vibrant Green #10b981)**
- No tax during accumulation
- Higher costs but tax deferral
- Steeper growth over time

**Key Points Marked:**
- Breakeven point (where insurance overtakes ETF)
- Age 67: Show both values with callout
- Age 85: Show both values with callout

**Annotations:**
```
Jahr 12: Ab hier kompensiert der Steuervorteil die höheren Kosten.
Die Rentenversicherung baut mehr Vermögen auf.

Tax drag on ETF: -€XX,XXX over lifetime
Tax advantage Insurance: +€XX,XXX
```

#### Feature G: At-Retirement Value Comparison (Bar Chart)
**Chart Type:** Grouped bar chart

**Group 1: At Age 67**
- ETF Gross (dark blue)
- ETF Net after tax (light blue)
- Insurance Gross (dark teal)
- Insurance Net after tax (light teal)

**Group 2: At Age 85**
- Same structure

**Expandable Details Below:**
- ETF: "Already taxed annually. Lump sum withdrawal triggers no additional tax, but growth was limited."
- Insurance: "Untaxed during accumulation. Withdrawals taxed at favorable Halbeinkünfteverfahren (only 50% of gains taxable after age 62)."

**Numerical Display:**
```
═════════════════════════════════════════
VERMÖGENSSTAND BEI RENTENEINTRITT (67)
─────────────────────────────────────────
ETF-Sparplan:        €242,500
Rentenversicherung:  €268,300
─────────────────────────────────────────
Vorteil RV:          €25,800 (+11%)
═════════════════════════════════════════
```

#### Feature H: Withdrawal Phase Simulator (Popup/Modal)
**Trigger:** Button "Entnahmephase simulieren"

**Input Panel (Left Side):**
```
STARTKAPITAL MIT 67 JAHREN
Angespartes Vermögen (nach Steuern): €268,300
Davon eingezahlt: €66,000
Davon Ertrag: €202,300

ENTNAHMESTRATEGIE
○ Einmalkapital sofort
○ Lebenslange Rente
● Flexible Teilauszahlungen

Jährliche Entnahme: [Slider €5,000-€50,000] €15,600
Entnahmedauer: [Slider 5-40 years] 20 Jahre
Restkapital investiert mit: 4.0% Rendite

⚙️ ERWEITERTE STEUEREINSTELLUNGEN
✓ Halbeinkünfteverfahren (ab 62)
Freistellungsauftrag: €1,000
Persönlicher Steuersatz: 30%
Teilfreistellung: 15%
```

**Visualization (Right Side):**

**Depletion Chart (Line Chart):**
- X-axis: Age (67-95)
- Y-axis: Remaining capital (€)
- Descending curve showing asset depletion
- Color gradient: Green → Yellow → Orange → Red

**Critical Points:**
- Statistical life expectancy (84.5): Vertical line
- Age 90: Vertical line
- Zero-crossing: "⛔ Vermögen aufgebraucht" if occurs

**Dashboard Box (Top):**
```
═══════════════════════════════════════════════
           IHRE NETTO-AUSZAHLUNG
───────────────────────────────────────────────
Brutto-Entnahme pro Jahr:        €15,600

Abzüge:
  Einkommensteuer:              -€2,847
  Kirchensteuer:                -€256
  Solidaritätszuschlag:         €0
───────────────────────────────────────────────

✓ Netto pro Jahr:                €12,497
✓ Netto pro Monat:               €1,041

Zusätzlich: Gesetzliche Rente    +€1,420
Ihr gesamtes Einkommen:          €2,461/Monat
═══════════════════════════════════════════════
```

**Comparison Toggle:**
Checkbox "Mit Fondsparplan-Entnahme vergleichen"
- Shows second line on chart
- Side-by-side tax impact
- Longevity difference

#### Feature I: Product Scorecard (Comparison Table)
**Layout:** Clean table or card-based

```
┌────────────────────────────────────────────────────────────────┐
│  MERKMAL              │ NUR GRV  │ ETF-SPARPLAN │ VERSICHERUNG │
├────────────────────────────────────────────────────────────────┤
│ Tax During Accumulation│    ✓     │      ✗       │      ✓       │
│ Tax on Distribution    │   ~35%   │    ~18.5%    │    ~12.5%    │
│ Longevity Protection   │    ✓     │      ✗       │      ✓       │
│ Return (historical)    │   0-2%   │     6-8%     │     5-7%     │
│ Annual Costs           │    0%    │   0.2-0.5%   │   1.2-1.5%   │
│ Flexibility            │    ✗     │      ✓✓      │      ~       │
│ Beneficiary Protection │    ~     │      ✗       │      ✓       │
│ Projected Value at 67  │   N/A    │  €156,500    │  €182,900    │
│ Lifetime Tax Savings   │   N/A    │  Baseline    │  +€XX,XXX    │
└────────────────────────────────────────────────────────────────┘

✓✓ = Excellent, ✓ = Good, ~ = Moderate, ✗ = Poor
```

**Visual Scoring:**
- Green cells: Advantages
- Gray cells: Neutral
- Red cells: Disadvantages

**Strategic Note:**
"While ETF offers more flexibility, Insurance provides €XX,XXX more in lifetime value due to tax advantages—equivalent to X years of additional retirement income."

### 2.4 Technical Infrastructure

#### Feature J: Universal State Management
**Architecture:** Central data cache/store

**Requirements:**
- All inputs feed single source of truth
- Changes propagate instantly (<500ms)
- No "recalculate" buttons
- Smooth transitions (not jarring updates)
- Maintain scroll position
- Highlight changed values briefly (pulse effect)

**Technology Options:**
- React Context + useReducer
- Redux / Redux Toolkit
- Zustand
- Jotai

#### Feature K: Scenario Saving
**Functionality:**
- "Save Current Scenario" button → Creates named snapshot
- "Load Scenario" dropdown
- "Compare Scenarios" → Split screen showing two scenarios side-by-side
- Highlight differences in yellow
- Show delta values

**Use Cases:**
- "Retire at 63 vs. 67"
- "€300/month vs. €500/month contributions"
- "With vs. without Riester"

---

## 3. Calculation Engines (Detailed Formulas)

### 3.1 Tax Calculations

#### 3.1.1 Vorabpauschale (ETF)
```javascript
function calculateVorabpauschale(
  fundValueYearStart,
  basiszins = 0.0253, // BMF 2025
  teilfreistellung = 0.30 // 30% for equity funds
) {
  // Step 1: Calculate gross Vorabpauschale
  const vorabpauschaleGross = fundValueYearStart * basiszins * 0.7;
  
  // Step 2: Apply Teilfreistellung
  const taxableAmount = vorabpauschaleGross * (1 - teilfreistellung);
  
  // Step 3: Apply Abgeltungsteuer + Soli
  const tax = taxableAmount * 0.26375; // 25% + 5.5% Soli
  
  // Step 4: Kirchensteuer (optional)
  const kirchensteuer = tax * 0.09; // 9% in most states
  
  return {
    vorabpauschaleGross,
    taxableAmount,
    taxWithoutKirche: tax,
    taxWithKirche: tax + kirchensteuer,
    effectiveRate: (tax / vorabpauschaleGross) * 100
  };
}
```

#### 3.1.2 Halbeinkünfteverfahren (12/62 Rule)
```javascript
function calculateHalbeinkunfte(
  totalPayout,
  totalContributions,
  contractDuration,
  payoutAge,
  teilfreistellung = 0.15, // 15% for insurance
  personalTaxRate = 0.30
) {
  // Check eligibility
  const eligible = contractDuration >= 12 && payoutAge >= 62;
  
  if (!eligible) {
    return {
      eligible: false,
      message: "12/62-Regel nicht erfüllt. Volle Gewinnbesteuerung."
    };
  }
  
  // Calculate gains
  const gains = totalPayout - totalContributions;
  
  // Step 1: Apply Teilfreistellung
  const afterTeilfreistellung = gains * (1 - teilfreistellung);
  
  // Step 2: Apply Halbeinkünfteverfahren (50%)
  const taxableGains = afterTeilfreistellung * 0.50;
  
  // Step 3: Apply personal tax rate
  const tax = taxableGains * personalTaxRate;
  
  // Calculate net
  const netPayout = totalPayout - tax;
  
  return {
    eligible: true,
    totalPayout,
    gains,
    afterTeilfreistellung,
    taxableGains,
    tax,
    netPayout,
    effectiveRateOnGains: (tax / gains) * 100,
    effectiveRateOnPayout: (tax / totalPayout) * 100
  };
}
```

#### 3.1.3 Ertragsanteil (Annuity Taxation)
```javascript
// § 22 EStG Ertragsanteil table
const ERTRAGSANTEIL_TABLE = {
  60: 0.22, 61: 0.21, 62: 0.20, 63: 0.19,
  64: 0.19, 65: 0.18, 66: 0.18, 67: 0.17,
  68: 0.16, 69: 0.16, 70: 0.15, 71: 0.15,
  // ... continue to age 95+
};

function calculateAnnuityTax(
  monthlyPension,
  retirementAge,
  personalTaxRate = 0.30,
  kirchensteuer = 0.09
) {
  const ertragsanteil = ERTRAGSANTEIL_TABLE[retirementAge] || 0.17;
  
  // Monthly calculation
  const taxablePerMonth = monthlyPension * ertragsanteil;
  const taxPerMonth = taxablePerMonth * personalTaxRate;
  const kirchensteuerPerMonth = taxPerMonth * kirchensteuer;
  const netPensionPerMonth = monthlyPension - taxPerMonth - kirchensteuerPerMonth;
  
  // Annual calculation
  const taxablePerYear = taxablePerMonth * 12;
  const taxPerYear = taxPerMonth * 12;
  
  return {
    grossMonthly: monthlyPension,
    ertragsanteil: ertragsanteil * 100, // as percentage
    taxableMonthly: taxablePerMonth,
    taxMonthly: taxPerMonth,
    netMonthly: netPensionPerMonth,
    taxableYearly: taxablePerYear,
    taxYearly: taxPerYear,
    effectiveRate: (taxPerMonth / monthlyPension) * 100
  };
}
```

#### 3.1.4 GRV Besteuerungsanteil
```javascript
// BMF table - updates yearly
const GRV_BESTEUERUNGSANTEIL = {
  2025: 0.835,
  2026: 0.840,
  2027: 0.845,
  2028: 0.850,
  // ... continues 0.5% per year
  2058: 1.000
};

function calculateGRVTax(
  monthlyPension,
  retirementYear,
  personalTaxRate = 0.25,
  kvPvContributions = 0.11 // Health + care insurance ~11%
) {
  const besteuerungsanteil = GRV_BESTEUERUNGSANTEIL[retirementYear] || 1.0;
  
  const yearlyPension = monthlyPension * 12;
  const taxableYearly = yearlyPension * besteuerungsanteil;
  const taxYearly = taxableYearly * personalTaxRate;
  const kvPvYearly = yearlyPension * kvPvContributions;
  
  const netYearly = yearlyPension - taxYearly - kvPvYearly;
  const netMonthly = netYearly / 12;
  
  return {
    grossMonthly: monthlyPension,
    besteuerungsanteil: besteuerungsanteil * 100,
    taxableYearly,
    taxYearly,
    kvPvYearly,
    netMonthly,
    effectiveDeductionRate: ((taxYearly + kvPvYearly) / yearlyPension) * 100
  };
}
```

### 3.2 Cost Calculations

#### 3.2.1 Debeka Insurance Costs (KID CA6I)
```javascript
function calculateInsuranceCosts(
  monthlyContribution,
  durationYears,
  fundReturn = 0.065 // 6.5% annual
) {
  const totalContributions = monthlyContribution * 12 * durationYears;
  
  // Entry costs: 2.5% over first 5 years
  const entryCoststotal = totalContributions * 0.025;
  const entryCostsPerYear = entryCoststotal / 5;
  
  // Ongoing costs
  const gammaRate = 0.003; // 0.3% on fund assets
  const unitCosts = 12; // €12 per year
  
  // Simulation year by year
  let capital = 0;
  let totalCosts = 0;
  
  for (let year = 1; year <= durationYears; year++) {
    // Contributions this year
    const yearlyContribution = monthlyContribution * 12;
    const effectiveContribution = year <= 5 
      ? yearlyContribution - entryCostsPerYear
      : yearlyContribution;
    
    // Add contributions monthly
    for (let month = 1; month <= 12; month++) {
      capital += effectiveContribution / 12;
      capital *= (1 + fundReturn / 12);
    }
    
    // Annual ongoing costs
    const gammaCosts = capital * gammaRate;
    capital -= (gammaCosts + unitCosts);
    totalCosts += (year <= 5 ? entryCostsPerYear : 0) + gammaCosts + unitCosts;
  }
  
  // RIY calculation
  const withoutCostsCapital = monthlyContribution * 12 * 
    ((Math.pow(1 + fundReturn / 12, durationYears * 12) - 1) / (fundReturn / 12));
  const riy = ((withoutCostsCapital - capital) / withoutCostsCapital) / durationYears;
  
  return {
    totalContributions,
    entryCosts: entryCoststotal,
    ongoingCosts: totalCosts - entryCoststotal,
    totalCosts,
    finalCapital: capital,
    riy: riy * 100, // as percentage
    effectiveAnnualCostRate: (totalCosts / totalContributions / durationYears) * 100
  };
}
```

#### 3.2.2 ETF Savings Plan Costs
```javascript
function calculateETFCosts(
  monthlyContribution,
  durationYears,
  grossReturn = 0.07,
  ter = 0.002, // 0.20%
  frontLoad = 0.0, // Usually 0% for ETF
  orderCosts = 1.5, // €1.50 per execution
  depotFees = 0 // €0 for many online brokers
) {
  let capital = 0;
  let totalCosts = 0;
  
  for (let year = 1; year <= durationYears; year++) {
    for (let month = 1; month <= 12; month++) {
      // Front load
      const contribution = monthlyContribution * (1 - frontLoad);
      totalCosts += monthlyContribution * frontLoad + orderCosts;
      
      capital += contribution;
      
      // TER and return
      const netReturn = (grossReturn - ter) / 12;
      capital *= (1 + netReturn);
    }
    
    // Depot fees
    capital -= depotFees;
    totalCosts += depotFees;
    
    // TER costs
    const terCosts = capital * ter;
    totalCosts += terCosts;
  }
  
  return {
    totalContributions: monthlyContribution * 12 * durationYears,
    totalCosts,
    finalCapital: capital,
    effectiveAnnualCostRate: (totalCosts / (monthlyContribution * 12 * durationYears) / durationYears) * 100
  };
}
```

### 3.3 Pension Gap Calculation

```javascript
function calculatePensionGap(userData) {
  const {
    currentNetIncome,
    retirementAge = 67,
    lifeExpectancy = 85,
    
    // Income sources
    statutoryPension = 0,
    companyPension = 0,
    riesterPension = 0,
    ruerupPension = 0,
    privatePension = 0,
    versorgungswerk = 0,
    civilServantPension = 0,
    
    // Adjustments
    workExpenseSavings = 0.10, // 10% of income
    mortgagePayment = 0,
    mortgageEndsAtAge = 67,
    healthcareCostIncrease = 150 // €/month
  } = userData;
  
  // Calculate required retirement income (70% rule)
  const savedWorkExpenses = currentNetIncome * workExpenseSavings;
  const requiredRetirementIncome = (currentNetIncome - savedWorkExpenses) * 0.70;
  
  // Sum all pension sources
  const totalPensionIncome = 
    statutoryPension +
    companyPension +
    riesterPension +
    ruerupPension +
    privatePension +
    versorgungswerk +
    civilServantPension;
  
  // Adjust for expenses in retirement
  const mortgageSavings = retirementAge >= mortgageEndsAtAge ? mortgagePayment : 0;
  const adjustedRetirementIncome = totalPensionIncome + savedWorkExpenses + mortgageSavings;
  const adjustedNetIncome = adjustedRetirementIncome - healthcareCostIncrease;
  
  // Calculate gap
  const monthlyGap = requiredRetirementIncome - adjustedNetIncome;
  const yearlyGap = monthlyGap * 12;
  const retirementYears = lifeExpectancy - retirementAge;
  const lifetimeGap = yearlyGap * retirementYears;
  
  // Coverage ratio
  const coverageRatio = (adjustedNetIncome / requiredRetirementIncome) * 100;
  
  // Status
  let status, color;
  if (coverageRatio >= 100) {
    status = "Ausreichend";
    color = "green";
  } else if (coverageRatio >= 70) {
    status = "Lücke vorhanden";
    color = "yellow";
  } else if (coverageRatio >= 50) {
    status = "Erhebliche Lücke";
    color = "orange";
  } else {
    status = "Kritische Lücke";
    color = "red";
  }
  
  return {
    currentNetIncome,
    requiredRetirementIncome,
    actualRetirementIncome: adjustedNetIncome,
    monthlyGap,
    yearlyGap,
    lifetimeGap,
    coverageRatio,
    status,
    color,
    breakdown: {
      statutoryPension,
      companyPension,
      riesterPension,
      ruerupPension,
      privatePension,
      versorgungswerk,
      civilServantPension,
      savedWorkExpenses,
      mortgageSavings,
      healthcareCostIncrease
    }
  };
}
```

---

## 4. UI/UX Specifications

### 4.1 Design System

#### Colors
```css
/* Primary Colors */
--color-primary: #21808D;        /* Teal - Main brand */
--color-primary-dark: #1A6873;   /* Dark teal */
--color-primary-light: #32B8C6;  /* Light teal */

/* Status Colors */
--color-success: #059669;        /* Green - Good status */
--color-warning: #E88161;        /* Orange - Warning */
--color-danger: #C0152F;         /* Red - Critical */
--color-info: #2563eb;           /* Blue - Information */

/* Neutral Colors */
--color-gray-100: #f3f4f6;
--color-gray-300: #d1d5db;
--color-gray-500: #6b7280;
--color-gray-700: #374151;
--color-gray-900: #111827;

/* Chart Colors */
--chart-current-income: #1e40af;  /* Rich blue */
--chart-grv: #9ca3af;             /* Pale gray */
--chart-riester: #fde047;         /* Light yellow */
--chart-company: #fb923c;         /* Orange */
--chart-private: #059669;         /* Strong green */
--chart-ruerup: #3b82f6;          /* Blue */
--chart-pension: #1e3a8a;         /* Dark blue */
--chart-versorgungswerk: #a855f7; /* Purple */
```

#### Typography
```css
--font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-family-display: 'Inter', sans-serif;

--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.25rem;    /* 20px */
--font-size-2xl: 1.5rem;    /* 24px */
--font-size-3xl: 1.875rem;  /* 30px */
--font-size-4xl: 2.25rem;   /* 36px */
```

#### Spacing
```css
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
--spacing-12: 3rem;     /* 48px */
--spacing-16: 4rem;     /* 64px */
```

#### Animations
```css
--transition-fast: 150ms ease-in-out;
--transition-base: 300ms ease-in-out;
--transition-slow: 500ms ease-in-out;
```

### 4.2 Component Specifications

#### Toggle Switch (Apple-Style)
```
Visual: Gray circle in gray track (unchecked)
        Green circle in green track (checked)
Size: 44px width × 24px height (iOS standard)
Animation: 200ms spring ease
Position: Top-right of charts
Label: "Alle Einkommensquellen anzeigen"
```

#### Gear Icon (Settings)
```
Icon: ⚙️ Settings cog
Size: 20px × 20px
Position: Next to adjustable values
Action: Opens settings panel/modal
Color: Gray-500, hover: Primary
```

#### Info Icon (Tooltips)
```
Icon: ℹ️ Info circle
Size: 16px × 16px
Action: Hover shows tooltip, click shows modal
Position: Next to technical terms
Color: Gray-400, hover: Gray-600
```

#### Progress Indicator (Onboarding)
```
Style: Dots (●●●○○○) or bar
Position: Bottom center of onboarding page
Colors: Completed: Primary, Current: Primary-light, Upcoming: Gray-300
Animation: Smooth fill on progress
```

#### Numerical Display Boxes
```
Border: 1px solid Gray-200
Border-radius: 8px
Padding: 16px
Background: White
Shadow: 0 1px 3px rgba(0,0,0,0.1)

Large numbers: 
  Font-size: 2xl or 3xl
  Font-weight: 700 (bold)
  Color: Gray-900

Labels:
  Font-size: sm
  Font-weight: 400
  Color: Gray-600
```

#### Warning/Info Boxes
```
⚠️ Warning:
  Background: Orange-50
  Border-left: 4px solid Orange-500
  Text: Orange-900

✓ Success:
  Background: Green-50
  Border-left: 4px solid Green-500
  Text: Green-900

ℹ️ Info:
  Background: Blue-50
  Border-left: 4px solid Blue-500
  Text: Blue-900
```

### 4.3 Responsive Breakpoints
```css
/* Mobile-first approach */
--breakpoint-sm: 640px;   /* Small tablets */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Laptops */
--breakpoint-xl: 1280px;  /* Desktops */
--breakpoint-2xl: 1536px; /* Large desktops */
```

**Mobile Optimizations:**
- Stack charts vertically
- Simplify tables (hide less critical columns)
- Use accordions for expandable sections
- Larger touch targets (min 44px × 44px)
- Horizontal scroll for wide tables
- Sticky headers on tables
- Bottom sheet modals instead of center modals

---

## 5. Content & Compliance

### 5.1 Neutral Text Blocks (No Marketing Tone)

#### Main Chart Explanation
```
Die Darstellung zeigt Ihr heutiges Netto in heutiger Kaufkraft sowie die 
voraussichtlichen Netto-Rentenströme ab Rentenbeginn. Alle Werte 
berücksichtigen Kosten und Steuern gemäß Ihren Annahmen (anpassbar über 
das Zahnrad).
```

#### Product Comparison Tax Differences
```
In der Police fallen in der Ansparphase keine Abgeltungsteuern an. Im Depot 
werden Erträge laufend besteuert (inkl. Vorabpauschale). In der Leistungsphase 
gelten unterschiedliche Regelungen: Ertragsanteil bzw. 12/62 bei der Police, 
Abgeltungsteuer (ggf. mit Teilfreistellung) im Depot.
```

#### Cost Transparency (KID-Compliant)
```
Gemäß Basisinformationsblatt Tarif CA6I (01/25): Einstiegskosten 2,5% (über 
die ersten fünf Jahre, im Anlagebetrag enthalten); laufende Kosten u.a. 0,3% 
p.a. Fondskosten; jährliche Kostenwirkung (RIY) bei 30 Jahren ~ 1,0% p.a.
```

#### Risk Notice
```
Debeka Global Shares: Interner VAG-Fonds, Risikoklasse 6/7, ESG-Kriterien, 
Regionen EU/NA/Asien; historische Wertentwicklungen sind keine verlässlichen 
Indikatoren für künftige Ergebnisse.
```

#### Sustainability Notice
```
Debeka erklärt, dass Produkte je nach Anlageform (Chance/Balance/Garant) aus 
Global Shares, Global Bonds und/oder Sicherungsvermögen bestehen; diverse 
Offenlegungen/Art. 8-Dokumente sind verfügbar.
```

#### Legal Disclaimer (Footer)
```
Diese Informationen ersetzen keine steuerliche Beratung. Steuerliche Behandlung 
hängt von persönlichen Verhältnissen ab und kann sich ändern. Historische 
Entwicklungen sind kein verlässlicher Indikator für künftige Ergebnisse. 
BaFin-Aufsicht für Debeka-Produktinformationen.
```

### 5.2 Debeka-Specific Content

#### "Was ist Debeka Global Shares?"
```
Interner Fonds im Sinne des VAG (§124 Abs. 2), ausgerichtet auf langfristigen, 
dauerhaften Wertzuwachs mit Risikominderungstechniken. Enthält Debeka-
Aktienfonds für Nordamerika, Europa und Asien. In die enthaltenen Fonds kann 
nicht einzeln investiert werden. ESG-Kriterien werden berücksichtigt.
```

#### Product Variants Explanation
```
Chance Invest (0/100): 0% Garantie, 100% Fonds – renditeorientiert, höhere 
Schwankungen möglich.

Chance Balance (50/50): 50% Garantie, 50% Fonds – ausgewogen, moderate 
Schwankungen.

Chance Garant (100/0): 100% Garantie, 0% Fonds – konservativ, 1% Verzinsung 
(Mindestleistungen), Überschuss 2024: 2,25% (nicht garantiert).
```

#### Special Payments & Withdrawals
```
Sonderzahlungen fließen ausschließlich in den chancenorientierten Baustein 
(Debeka Global Shares oder Debeka Global Bonds – je nach Grundvertrag). 
Entnahmen sind möglich. Steuerlich: Stundung in der Ansparphase, 12/62-Regel 
oder Ertragsanteilsbesteuerung je nach Auszahlungsform.
```

---

## 6. Technical Architecture

### 6.1 Frontend Stack (Recommended)
- **Framework:** React 18+ with TypeScript
- **State Management:** Zustand or Redux Toolkit
- **Charts:** Recharts or Chart.js
- **Forms:** React Hook Form
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Date/Number:** date-fns, decimal.js

### 6.2 Data Flow
```
User Input (Onboarding)
    ↓
Central State Store
    ↓
├─→ Tax Engine ─────→ Tax Results
├─→ Cost Engine ────→ Cost Results
├─→ Pension Gap ────→ Gap Metrics
└─→ Comparison ─────→ Comparison Data
    ↓
All Components Re-render (<500ms)
```

### 6.3 Performance Targets
- Initial page load: <2 seconds
- Calculation update: <500ms
- Chart re-render: <300ms
- Animation duration: 200-300ms
- Mobile scroll: 60 FPS

### 6.4 Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile: iOS 14+, Android 10+

---

## 7. Testing Strategy

### 7.1 Unit Tests (Critical Calculations)
```javascript
describe('Tax Calculations', () => {
  test('Vorabpauschale with 30% Teilfreistellung', () => {
    const result = calculateVorabpauschale(50000, 0.0253, 0.30);
    expect(result.taxWithoutKirche).toBeCloseTo(148.21, 2);
  });
  
  test('12/62 rule eligibility check', () => {
    const eligible = calculateHalbeinkunfte(200000, 66000, 12, 62, 0.15, 0.30);
    expect(eligible.eligible).toBe(true);
    expect(eligible.effectiveRateOnGains).toBeCloseTo(12.75, 2);
  });
  
  test('Ertragsanteil at age 67', () => {
    const result = calculateAnnuityTax(780, 67, 0.30, 0.09);
    expect(result.ertragsanteil).toBe(17);
    expect(result.netMonthly).toBeCloseTo(740, 0);
  });
});

describe('Cost Calculations', () => {
  test('Debeka insurance RIY after 30 years', () => {
    const result = calculateInsuranceCosts(250, 30, 0.065);
    expect(result.riy).toBeCloseTo(1.0, 1);
  });
});

describe('Pension Gap', () => {
  test('Critical gap detection', () => {
    const result = calculatePensionGap({
      currentNetIncome: 3000,
      statutoryPension: 1200,
      privatePension: 0
    });
    expect(result.status).toBe('Kritische Lücke');
    expect(result.color).toBe('red');
  });
});
```

### 7.2 Integration Tests
- Full onboarding flow completion
- State synchronization across components
- Scenario saving and loading
- Chart interactions and updates
- Modal/popup behaviors

### 7.3 E2E Tests (Cypress/Playwright)
- Complete user journey from landing to comparison
- Mobile responsive behavior
- Cross-browser compatibility
- Performance metrics collection

---

## 8. Deployment & Updates

### 8.1 Yearly Parameter Updates
**Must Update Annually:**
1. BMF Basiszins (Vorabpauschale) - Usually announced in January
2. GRV Besteuerungsanteil table - Add new year
3. Ertragsanteil table - Check for changes (rare)
4. KID cost figures - Check Debeka updates
5. Debeka product details - Check for changes

**Update Process:**
```javascript
// config/taxParameters.ts
export const TAX_PARAMETERS = {
  year: 2025,
  vorabpauschale: {
    basiszins: 0.0253, // UPDATE YEARLY
    factor: 0.7
  },
  grvBesteuerungsanteil: {
    2025: 0.835,
    2026: 0.840, // ADD NEW YEAR
    // ...
  },
  ertragsanteilTable: {
    // Usually stable, check annually
  },
  sparerpauschbetrag: {
    single: 1000,
    married: 2000
  }
};
```

### 8.2 Monitoring
- Error tracking (Sentry)
- Analytics (Plausible or Google Analytics)
- Performance monitoring (Web Vitals)
- User session recordings (optional, privacy-compliant)

---

## 9. Accessibility (a11y)

### 9.1 Requirements
- WCAG 2.1 Level AA compliance
- Keyboard navigation for all interactive elements
- Screen reader compatibility
- Color contrast ratios ≥4.5:1 for text
- Alt text for all images and icons
- ARIA labels for complex components
- Focus indicators visible

### 9.2 Specific Considerations
- Chart accessibility: Provide data tables as alternatives
- Form validation: Clear error messages
- Modal traps: Focus management
- Touch targets: Minimum 44×44px

---

## 10. Privacy & GDPR

### 10.1 Data Handling
- All calculations client-side (no server processing)
- LocalStorage for session persistence (optional)
- Cookie consent for analytics
- No PII transmission to third parties
- Clear data deletion options

### 10.2 Disclaimers
- "Keine Anlageberatung"
- "Keine Steuerberatung"
- "Berechnungen basieren auf Ihren Annahmen"
- "Historische Werte keine Zukunftsgarantie"

---

## Appendix A: Glossary (German Terms)

- **Abgeltungsteuer:** Capital gains tax (25% + Soli)
- **Basisinformationsblatt (KID):** Key Information Document
- **Besteuerungsanteil:** Taxable portion (GRV pensions)
- **Betriebsrente (bAV):** Company pension
- **Ertragsanteil:** Taxable earnings portion (annuities)
- **Freistellungsauftrag:** Tax exemption order
- **Gesetzliche Rente (GRV):** Statutory pension
- **Halbeinkünfteverfahren:** Half-income procedure (12/62 rule)
- **Kirchensteuer:** Church tax
- **Rentenpunkte:** Pension points
- **Riester-Rente:** State-subsidized pension
- **Rürup-Rente:** Basis pension (self-employed)
- **Solidaritätszuschlag (Soli):** Solidarity surcharge
- **Sparer-Pauschbetrag:** Saver's allowance
- **Teilfreistellung:** Partial exemption
- **Versorgungslücke:** Pension gap
- **Versorgungswerk:** Professional pension fund
- **Vorabpauschale:** Advance lump-sum (ETF taxation)
- **ZVK/VBL:** Public sector supplementary pension

---

## Appendix B: Implementation Priorities

### Phase 1 (MVP - 4 weeks)
1. ✅ Centralized onboarding flow
2. ✅ Basic pension gap calculation
3. ✅ Versorgungslücke Index gauge
4. ✅ Retirement Reality Timeline chart
5. ✅ Basic tax engine (Abgeltungsteuer, 12/62, Ertragsanteil)

### Phase 2 (Core Features - 4 weeks)
6. ✅ Switchable chart view
7. ✅ Monthly Budget Reality Table
8. ✅ ETF vs Insurance comparison tool
9. ✅ Wealth accumulation chart
10. ✅ Cost calculation engines

### Phase 3 (Advanced Features - 4 weeks)
11. ✅ Withdrawal phase simulator
12. ✅ Product scorecard
13. ✅ Tax cockpit dashboard
14. ✅ Scenario saving
15. ✅ Data validation

### Phase 4 (Polish - 2 weeks)
16. ✅ Responsive design
17. ✅ Animations
18. ✅ Debeka content sections
19. ✅ Compliance text
20. ✅ Testing

### Phase 5 (Production - 1 week)
21. ✅ Performance optimization
22. ✅ SEO
23. ✅ Analytics setup
24. ✅ Deployment
25. ✅ Documentation

---

**Total Estimated Timeline:** 15 weeks (3.75 months)

**Team Required:**
- 1-2 Frontend Developers (React/TypeScript)
- 1 UI/UX Designer
- 1 QA Tester
- 1 Product Manager (part-time)

---

*End of Unified Specification*
