# Debeka Data Fetching Scripts

## Overview

These scripts fetch current price and chart data for Debeka Global Shares daily at 4 AM CET via GitHub Actions.

## Files

1. **`fetch-debeka-data.js`** - Basic fetch script (fast, simple)
2. **`fetch-debeka-advanced.js`** - Advanced script with Puppeteer (can extract JavaScript-rendered data)
3. **`.github/workflows/update-debeka-data.yml`** - Automated daily execution

## Current Status

⚠️ **Important**: The Debeka website loads price and chart data dynamically with JavaScript. A basic `fetch()` cannot extract this data.

### What Works
- ✅ Script runs successfully
- ✅ Daily schedule at 4 AM CET
- ✅ Saves data to `public/debeka-data.json`
- ✅ Auto-commits and redeploys when data changes

### What Needs Improvement
- ⚠️ **Price extraction**: Currently returns `null` because data is JavaScript-rendered
- ⚠️ **Chart data**: Not available with basic fetch

## Solutions

### Option 1: Manual Data Entry (Recommended for now)

Update `public/debeka-data.json` manually:

```json
{
  "lastUpdate": "2025-11-01T00:00:00.000Z",
  "lastUpdateCET": "01.11.2025, 04:00:00",
  "source": "https://www.debeka.de/landingpages/sonstige/debeka-global-shares.html",
  "currentPrice": 233.38,
  "priceFormatted": "233,38",
  "priceDate": "30.10.2025",
  "currency": "EUR",
  "fundName": "Debeka Global Shares",
  "chartData": [],
  "chartDataPoints": 0,
  "method": "manual"
}
```

The GitHub Action will preserve this data until you update it.

### Option 2: Use Puppeteer (Advanced)

Puppeteer can render JavaScript and extract the data.

**Requirements:**
```bash
npm install puppeteer --save-dev
```

**Usage:**
```bash
node scripts/fetch-debeka-advanced.js
```

**GitHub Actions Requirement:**
Add to workflow:
```yaml
- name: Install Puppeteer
  run: |
    npm install puppeteer
    # Install Chrome dependencies for Linux
    sudo apt-get update
    sudo apt-get install -y chromium-browser
```

### Option 3: Debeka API (If Available)

Check if Debeka has an official API or data feed:
- Contact Debeka technical support
- Check for JSON endpoints (e.g., `/api/funds/global-shares.json`)
- Look for RSS/CSV feeds

### Option 4: Screen Scraping Service

Use a third-party service:
- ScrapingBee
- Apify
- BrightData

## Testing Locally

```bash
# Test basic fetch
node scripts/fetch-debeka-data.js

# Check generated data
cat public/debeka-data.json

# Test advanced fetch (requires Puppeteer)
node scripts/fetch-debeka-advanced.js
```

## Using the Data in React

```tsx
import { useDebekaData } from '@/hooks/useDebekaData';
import { DebekaPriceWidget } from '@/components/DebekaPriceWidget';

function MyComponent() {
  const { data, loading, error } = useDebekaData();
  
  return (
    <div>
      <DebekaPriceWidget />
      <p>Current price: {data?.priceFormatted} EUR</p>
    </div>
  );
}
```

## GitHub Actions Workflow

**Schedule:** Daily at 3:00 AM UTC (4:00 AM CET in winter)

**Trigger manually:**
1. Go to Actions tab on GitHub
2. Select "Update Debeka Data Daily"
3. Click "Run workflow"

**What it does:**
1. Fetches data from Debeka
2. Checks if data changed
3. If changed: commits, builds, and deploys
4. If unchanged: skips deployment

## Troubleshooting

### Data is `null`
**Cause:** JavaScript-rendered content  
**Solution:** Use Puppeteer or manual entry

### Workflow not running
**Cause:** GitHub Actions schedule can have delays  
**Solution:** Trigger manually

### Build fails after fetch
**Cause:** Invalid JSON in `debeka-data.json`  
**Solution:** Validate JSON before commit

## Future Improvements

1. **Add Puppeteer support** to GitHub Actions
2. **Implement chart data extraction** from Highcharts/Chart.js
3. **Add historical tracking** with timestamped files
4. **Create admin UI** for manual price updates
5. **Add notifications** when data fetch fails

## Contact

For issues or questions, check:
- GitHub Issues
- Debeka website: https://www.debeka.de
- Technical documentation in `docs/`
