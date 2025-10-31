# Retirement Insurance Web App - Complete Development Plan

**Generated:** 2025-10-31  
**Purpose:** Comprehensive requirements and specifications for fondsgebundene Rentenversicherung web application

---

## Table of Contents

1. [Product & Legal Foundation](#1-product--legal-foundation)
2. [Core Principles](#2-core-principles)
3. [Onboarding Flow](#3-onboarding-flow)
4. [Tax Engine](#4-tax-engine)
5. [Cost Engine](#5-cost-engine)
6. [Main Features & Charts](#6-main-features--charts)
7. [Parameters & Defaults](#7-parameters--defaults)
8. [Pension Gap Calculation](#8-pension-gap-calculation)
9. [ETF vs Insurance Comparison](#9-etf-vs-insurance-comparison)
10. [Debeka-Specific Content](#10-debeka-specific-content)

---

## 1. Product & Legal Foundation

### Debeka Product World

**Debeka Global Shares:**
- Internal fund per VAG § 124 Abs. 2
- Long-term growth focus with risk mitigation
- Contains Debeka equity funds for North America, Europe, and Asia
- ESG criteria applied
- **Cannot invest in individual contained funds separately**
- Historical values disclaimer: "Not reliable indicators of future results"

**Private Pension (Modern):**
- Individual weighting between guarantee and fund components:
  - **Chance Invest:** 0% guarantee / 100% funds
  - **Chance Balance:** 50% guarantee / 50% funds  
  - **Chance Garant:** 100% guarantee / 0% funds
- Guarantee component: Currently 1% p.a. (minimum benefits)
- 2024 total return including non-guaranteed surplus: 2.25%
- Surpluses flow into Debeka Global Shares
- Direct investment in Debeka Global Shares via fund component
- Favorable factor verification (guaranteed vs. current)
- Additional payments/withdrawals possible
- Maturity management offered

**Tax Treatment:**
- **Accumulation phase:** Tax-free
- **Pension phase:** Taxed with earnings portion
- **Capital payout:** Partially taxable depending on duration/age

### German Tax & Legal Framework

**Capital Gains Tax (Abgeltungsteuer):**
- 25% + solidarity surcharge + optional church tax
- Saver allowance: €1,000 (single) / €2,000 (married)
- Exemption order possible

**Partial Exemption (Teilfreistellung):**
- 30% for equity funds (≥51% stocks)
- 15% for mixed funds (≥25% stocks)
- Applies to distributions, sales, and Vorabpauschale

**Vorabpauschale (Advance Flat-Rate Tax):**
- Annual flat-rate taxation per InvStG §18
- BMF publishes base rate annually (must be updated in app)
- 2025 base rate: 2.53%

**Private Annuities:**
- Earnings portion depends on pension start age (e.g., 67 = 17%)
- Capital payout after min. 12 years and from age 62 → only 50% of gains taxable
- This is the **12/62 rule** (Halbeinkünfteverfahren)

### KID/Contract Documents

**KID (CA6I 0-100):**
- Entry costs: 2.5% (spread over 5 years, included in investment amount)
- Ongoing costs: 0.3% p.a. on fund assets + €12 flat costs
- Product risk class: 3/7
- RIY (30 years): ≈1.0% p.a. (0.2% entry, 0.8% ongoing)
- BaFin supervision noted

**Debeka Global Shares Fund Info:**
- Fund risk class: 6/7
- Equity focus, ESG selection
- International diversification

---

## 2. Core Principles

### Problem → Mechanism → Solution (No Emotionalization)

**Problem Visualization:**
- Current net income (in today's purchasing power) vs.
- Net pension streams from retirement start (statutory pension, occupational pension, Riester/Rürup, Debeka private pension, ETF withdrawals)
- = Monthly gap

**Mechanism:**
- Complete after-tax logic:
  - Capital gains tax including saver allowance
  - Partial exemption
  - Vorabpauschale in depot
  - Earnings portion/12-62 rule in insurance policy
- Costs per KID priced into return paths ex-ante

**Solution:**
- Robust scenarios (statutory pension only / + ETF / + Debeka / + ETF + Debeka)
- With sensitivities (inflation, returns, contributions, retirement age, withdrawal rules)

---

## 3. Onboarding Flow

### Apple-Style Guided Questionnaire

**One central page** instead of scattered input fields throughout the app.

**Required Fields:**

1. **Personal Data:**
   - Birth year/age (auto-sync)
   - Marital status (single/married/divorced/separated/widowed)
   - Children (yes/no, count)
   - If married: "Calculate for one person or both?"

2. **Current Income:**
   - Monthly net income
   - Gross annual income (optional - for tax rate indication)
   - Other income (rental, business, maintenance, etc.)

3. **Expected Retirement Income:**
   - Statutory pension at 67 (monthly) - **REQUIRED**
   - Civil servant pension (if applicable)
   - Professional association (Versorgungswerk)
   - ZVK/VBL pension
   - Occupational pension
   - Riester pension
   - Rürup/Base pension

4. **Existing Capital:**
   - Life insurance payout
   - Fund/savings balance
   - ETF depot value

5. **Liabilities:**
   - Mortgage outstanding? (yes/no)
   - If yes: Remaining debt, end of fixed-rate period, interest rate

6. **Planning Goals:**
   - Planned retirement age (63/65/67/70)
   - Monthly savings amount for retirement
   - Desired contract duration

---

## 4. Tax Engine

### ETF/Depot (Outside Insurance)

**Implementation:**
- Capital gains tax: 25% + solidarity surcharge 5.5% = 26.375% effective
- Saver allowance: €1,000/€2,000 (adjustable)
- Partial exemption by fund type:
  - Equity funds ≥51%: 30%
  - Mixed funds ≥25%: 15%
  - Others: 0%
- Vorabpauschale: Annual fictitious income based on BMF base rate
  - Calculated on year-start value, reduced by distributions
  - Partial exemption also applies here

**UI Controls:**
- Fund type selector (sets partial exemption)
- Church tax toggle (8% or 9%)
- Saver allowance field (default €1,000 single / €2,000 married)

### Debeka Insurance Policy

**Accumulation Phase:**
- No capital gains tax (tax deferral)
- UI note: "Tax only due in benefit phase"

**Benefit Phase - Pension:**
- Earnings portion taxation by entry age (e.g., 67 = 17%)
- Retirement start slider changes earnings portion live

**Benefit Phase - Capital:**
- 12/62 rule: 50% of gains taxable with personal income tax rate
- Requirements: Contract duration ≥12 years AND payout from age 62
- Checkbox "12/62 fulfilled" (auto-calculated)
- If not fulfilled: Full gain taxation note

### Statutory Pension (GRV)

**Taxation:**
- Taxable portion depends on pension start cohort
- 2025: 83.5% taxable (BMF table)
- Increases 0.5% annually until full taxation in 2058
- Dropdown "Pension start year" → automatic taxable portion

---

## 5. Cost Engine

### Debeka (KID CA6I)

**Entry Costs:**
- 2.5% of investment amount
- Spread over first 5 insurance years
- Included in investment amount

**Ongoing Costs:**
- 0.3% p.a. on fund assets
- Plus lump-sum costs per KID
- RIY presentation as effect on return

**Risk Classes:**
- KID product: 3/7
- Debeka Global Shares fund: 6/7
- UI must explain why these differ (insurance product ≠ pure fund)

**Visualization:**
- Cost waterfall (annual effect in € and % on return)
- Scenario slider (holding period)

### ETF/Depot

**Costs:**
- TER / Front-end load
- Transaction costs (optional flat-rate)
- **Taxes separate** from costs (to make tax deferral advantage of insurance visible)

---

## 6. Main Features & Charts

### 6.1 "Income & Gap" (Core Visual)

**Chart Type:** Stacked area chart with mode switcher (checkmark top-right)

**Mode A (Default):**
- X: Age, Y: Net monthly (today's purchasing power)
- Until retirement: Today's net income (flat in purchasing power)
- From retirement: Statutory pension + Debeka private pension (net after tax/deductions)
- Overlay: Coverage gap (hatched)

**Mode B (via checkmark):**
- Like A, but all sources: Statutory, Riester, occupational pension, private pension (fund-based), Rürup, ETF withdrawals (all net)

**Interactive:**
- Retirement start slider (affects earnings portion insurance and statutory pension tax portion)
- Inflation settings
- Target net line (e.g., 80% of current net income)

### 6.2 "Insurance vs. ETF Savings Plan" (After-Tax Assets)

**A) Accumulation (Savings Phase) - Line Chart (2 lines)**

- **Insurance (Debeka):** Gross fund value and after-tax equivalent value for pension option (earnings portion) or capital option (12/62); no capital gains tax during accumulation
- **ETF/Depot:** After-tax balance including capital gains tax, partial exemption, and Vorabpauschale (with saver allowance)
- **Callouts:** Values at 67 and 85 (in today's purchasing power)
- **Explanation:** ETF has ongoing tax outflows, insurance has tax deferral → compound interest effect

**B) Benefit Phase (Cashflows) - Annual bars "Gross → Tax → Net"**

- **Insurance:** Pension (earnings portion depending on start, e.g., 17% at 67) or capital (12/62) with 50% gain taxation
- **ETF:** Partial withdrawal (constant annual amount), taxation realized + partial exemption, saver allowance

**Comparison Settings:**
- ETF return assumption (nominal)
- Front-end load
- TER
- Fund type (sets partial exemption 30%/15%/0%)

### 6.3 "Cost Impact" - Waterfall & RIY

- **Insurance:** Year 1/5/30 - Contribution → entry costs 2.5% (5 years, included) → ongoing costs incl. 0.3% p.a. fund/€12 → RIY effect (~1.0% p.a. at 30 years)
- **ETF:** TER/transaction costs separate; taxes not as "costs" but own level (to make tax deferral tangible)

### 6.4 "Tax Cockpit"

Two compact tiles, accessible everywhere:

1. **ETF/Depot:** Used allowance, ongoing tax burden (incl. Vorabpauschale), effective tax rate after partial exemption
2. **Insurance:** "Accumulation phase tax-free", pension: earnings portion (by age), capital: 12/62 (fulfilled yes/no) + "Net at retirement start" notice

### 6.5 Flexible Withdrawal Pop-up (Separate Tool)

**Inputs (gear icon):**
- Annual partial withdrawal amount
- Start age, duration
- Order (insurance/ETF/proportional)
- Gross/net toggle

**Calculation:**
- All tax-relevant parameters applied (exemption order, partial exemption, Vorabpauschale, earnings portion/12-62)
- Net annual value ÷ 12 as monthly value
- Chart + number

**Consistency:** Annual withdrawal amount stays constant over phase

### 6.6 Comparison Page "All Retirement Options"

**Data Sync:**
- Pulls directly from cache/DB (no duplicate entries)
- All changes from other modules reflect live

**Layout:**
- Top: One active area chart with two switchable variants (via checkmark; see 6.1)
- Bottom: Number tile with central KPIs (monthly net gap, after-tax balance 67/85, net withdrawal, remaining balance, etc.)

---

## 7. Parameters & Defaults

### Macro

- Inflation: 2.0% (0-6% adjustable)
- Real wage: +0.5% (-1% to +2%)
- Statutory pension adjustment: +1.5% (0-3%)

### Tax

- Church/solidarity toggle
- Saver allowance: €1,000 (single)/€2,000 (married) - adjustable via gear icon

### ETF

- Return (nominal)
- TER
- Distribution quota
- Fund type (sets partial exemption 30%/15%)
- Vorabpauschale based on BMF base rate (annually updated)

### Insurance (Debeka)

- Product tariff: Chance Invest (CA6I) as reference
- Entry costs: 2.5% (over 5 years) - fixed product parameter
- Ongoing costs: 0.3% p.a. on fund assets + lump-sum costs
- Retirement start slider → earnings portion (e.g., 67 = 17%)
- Capital option: Toggle. 12/62 auto-detected, otherwise "full gain taxation" note

### Statutory Pension

- Pension start year dropdown → taxable portion (e.g., 2025 = 83.5%)
- Table annually updatable

---

## 8. Pension Gap Calculation

**Definition (monthly, in today's purchasing power):**

```
Gap = Today's net income (inflation-adjusted) 
      - Sum of net pension streams (statutory, Debeka private pension, others, ETF withdrawals)
```

**UI:**
- Traffic light bar (neutral: green ≤0, yellow -10% to 0, red <-10%)
- Reasoning tooltip with amount
- "Lever bar": Increase contributions / vary retirement start / change withdrawal rule / insurance/ETF mix

---

## 9. ETF vs Insurance Comparison

### Key Facts to Highlight

**Tax Deferral Effect:**
- Insurance: No capital gains tax or Vorabpauschale during accumulation
- ETF: Ongoing tax outflows reduce compound interest effect

**Benefit Phase:**
- **Insurance (Pension):** Earnings portion (e.g., 17% at 67) → low ongoing tax rate, accumulation phase gains remain tax-free
- **Insurance (Capital):** 12/62 → only 50% of gain taxable
- **ETF:** Realization taxation on withdrawal, partial exemption, saver allowance

**Costs:**
- Insurance: KID-transparent 2.5% entry, 0.3% p.a. fund, RIY ~1.0%
- ETF: TER etc., but no tax deferral advantage

**Risk Indicators:**
- Product 3/7 vs. fund 6/7
- UI must explain why values differ (insurance product ≠ pure fund; includes contract components)

---

## 10. Debeka-Specific Content

### Must Include in App

**What is Debeka Global Shares?**
- Internal VAG fund
- ESG criteria
- Regions EU/NA/Asia
- Not individually investable
- Historical values not reliable signal

**Mix Models:**
- Chance Invest (0/100)
- Balance (50/50)
- Garant (100/0)
- Brief description per package, including note on volatility/loss risk with low guarantee

**Additional Payments & Withdrawals:**
- Additional payment only in risk-oriented component
- Withdrawals possible
- Tax advantages (deferral/12-62/earnings portion)

**Guarantee Component:**
- 1% interest (minimum benefits)
- Surplus 2024: 2.25% (not guaranteed)
- Surplus investment in Global Shares

**Favorable Factor Verification:**
- Guaranteed vs. pension start factor
- Always the better one applies

---

## Quality Assurance & Updates

### Regular Tests

**Unit Tests for:**
- Earnings portion/12-62 rule
- Capital gains tax + partial exemption + allowance + Vorabpauschale
- KID costs

### Annual Updates

**Must update yearly:**
- BMF base rate (Vorabpauschale)
- KID versions/costs
- Statutory pension tax table

---

## Neutral Text Blocks

### Above Main Chart

> "The display shows your current net income in today's purchasing power and the expected net pension streams from retirement start. All values consider costs and taxes according to your assumptions (adjustable via gear icon)."

### In Product Comparison

> "The after-tax effect differs: In the insurance, no capital gains taxes apply during the accumulation phase. In the depot, earnings are continuously taxed (including Vorabpauschale). Different rules apply in the benefit phase: earnings portion or 12/62 for insurance, capital gains tax (possibly with partial exemption) for depot."

### Cost Notice (Insurance)

> "According to Key Information Document Tariff CA6I (01/25): Entry costs 2.5% (over the first five years, included in investment amount); ongoing costs including 0.3% p.a. fund costs; annual cost impact (RIY) at 30 years ~1.0% p.a."

### Risk/Sustainability Notice (Fund)

> "Debeka Global Shares: Internal VAG fund, risk class 6/7, ESG criteria, regions EU/NA/Asia; historical performance is not a reliable indicator for future results."

---

## Implementation Checklist

### Core Requirements

- ✅ One central questionnaire page (required fields including statutory monthly pension)
- ✅ Remove "Sirup Rente" (deprecated item)
- ✅ Tax tool (private pension page): 12/62 toggle, saver allowance €1,000 (gear icon), info field "Net at retirement start"
- ✅ Flexible withdrawal as pop-up: Number + chart, annual amount constant, monthly equivalent
- ✅ Comparison page pulls directly from cache/DB, top: area chart (2 switchable variants), bottom: number tile
- ✅ ETF comparison with capital gains tax/Vorabpauschale/partial exemption

---

**End of Development Plan**

*For implementation details, refer to specific feature documentation.*
