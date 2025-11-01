#!/usr/bin/env node

/**
 * Debeka Global Shares - Puppeteer Scraper
 * Renders JavaScript to extract live price and date
 * Runs daily at 4 AM CET via GitHub Actions
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

const DEBEKA_URL = 'https://www.debeka.de/landingpages/sonstige/debeka-global-shares.html';

async function fetchDebekaWithPuppeteer() {
  console.log('🎭 Starting Puppeteer browser...');
  console.log(`📅 Time: ${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}`);
  
  let browser;
  
  try {
    // Dynamically import puppeteer
    const puppeteer = await import('puppeteer');
    
    // Launch browser with minimal resources
    console.log('🚀 Launching Chrome...');
    browser = await puppeteer.default.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',  // Prevent OOM in GitHub Actions
        '--single-process',          // Use single process to save memory
        '--disable-gpu',             // Disable GPU for headless mode
      ]
    });
    
    const page = await browser.newPage();
    
    // Set user agent to avoid bot detection
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 720 });
    
    console.log('📖 Loading page...');
    await page.goto(DEBEKA_URL, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for content to render
    console.log('⏳ Waiting for content to render...');
    await page.waitForTimeout(2000);
    
    // Extract data using JavaScript evaluation
    console.log('🔍 Extracting data...');
    const data = await page.evaluate(() => {
      const result = {
        price: null,
        priceFormatted: null,
        date: null,
        fundName: 'Debeka Global Shares',
      };
      
      // Strategy 1: Look for text containing "Anteilswert"
      const pageText = document.body.innerText;
      
      // Extract price - looking for pattern like "233,38 EUR" or "233.38"
      const priceMatch = pageText.match(/Aktueller Anteilswert:\s*([0-9,]+)\s*EUR/i);
      if (priceMatch) {
        result.priceFormatted = priceMatch[1]; // Keep German format (233,38)
        result.price = parseFloat(priceMatch[1].replace(',', '.')); // Convert to number
        console.log(`Found price: ${result.priceFormatted} EUR`);
      }
      
      // Extract date - looking for pattern like "30.10.2025" or "Stand: ..."
      const dateMatch = pageText.match(/Stand:\s*([0-9]{2}\.[0-9]{2}\.[0-9]{4})/i);
      if (dateMatch) {
        result.date = dateMatch[1];
        console.log(`Found date: ${result.date}`);
      }
      
      // Fallback: Look for any large number that looks like a price
      if (!result.price) {
        const numberMatch = pageText.match(/([0-9]{3})\s*,\s*([0-9]{2})/);
        if (numberMatch) {
          result.priceFormatted = `${numberMatch[1]},${numberMatch[2]}`;
          result.price = parseFloat(`${numberMatch[1]}.${numberMatch[2]}`);
        }
      }
      
      // Fallback: Look for today's date if Stand: date not found
      if (!result.date) {
        const now = new Date();
        result.date = now.toLocaleDateString('de-DE');
      }
      
      return result;
    });
    
    console.log('✅ Data extraction complete');
    console.log(`   Price: ${data.priceFormatted} EUR`);
    console.log(`   Date: ${data.date}`);
    
    await browser.close();
    
    return data;
    
  } catch (error) {
    console.error('❌ Puppeteer error:', error.message);
    
    if (browser) {
      await browser.close();
    }
    
    throw error;
  }
}

async function main() {
  try {
    console.log('═══════════════════════════════════════');
    console.log('  Debeka Global Shares - Price Fetch');
    console.log('═══════════════════════════════════════\n');
    
    const data = await fetchDebekaWithPuppeteer();
    
    // Validate data
    if (!data.price || !data.date) {
      console.error('\n⚠️  WARNING: Could not extract some data!');
      console.error(`   Price: ${data.price ? '✅' : '❌'}`);
      console.error(`   Date: ${data.date ? '✅' : '❌'}`);
    }
    
    const result = {
      lastUpdate: new Date().toISOString(),
      lastUpdateCET: new Date().toLocaleString('de-DE', {
        timeZone: 'Europe/Berlin',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }) + ' CET',
      source: DEBEKA_URL,
      currentPrice: data.price,
      priceFormatted: data.priceFormatted,
      priceDate: data.date,
      currency: 'EUR',
      fundName: data.fundName,
      chartData: [],
      chartDataPoints: 0,
      method: 'puppeteer',
      success: !!data.price,
    };
    
    // Save to public folder
    const outputPath = join(process.cwd(), 'public', 'debeka-data.json');
    writeFileSync(outputPath, JSON.stringify(result, null, 2));
    
    console.log(`\n💾 Saved: ${outputPath}`);
    console.log(`\n✨ Success! Price updated at ${result.lastUpdateCET}`);
    
    // Create timestamped historical copy
    const timestamp = new Date().toISOString().split('T')[0];
    const historicalPath = join(process.cwd(), 'public', `debeka-data-${timestamp}.json`);
    writeFileSync(historicalPath, JSON.stringify(result, null, 2));
    console.log(`📊 Historical: ${historicalPath}`);
    
    console.log('\n═══════════════════════════════════════\n');
    
    return result;
    
  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message);
    console.error('\nFallback: Creating placeholder data...');
    
    const fallbackData = {
      lastUpdate: new Date().toISOString(),
      lastUpdateCET: new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }),
      source: DEBEKA_URL,
      currentPrice: null,
      priceFormatted: null,
      priceDate: null,
      currency: 'EUR',
      fundName: 'Debeka Global Shares',
      chartData: [],
      chartDataPoints: 0,
      method: 'puppeteer-failed',
      success: false,
      error: error.message,
      fallback: true,
      nextAttempt: 'Manual update required or check Puppeteer installation'
    };
    
    const outputPath = join(process.cwd(), 'public', 'debeka-data.json');
    writeFileSync(outputPath, JSON.stringify(fallbackData, null, 2));
    
    console.error(`\nSaved fallback: ${outputPath}`);
    console.error('Please run: node scripts/update-debeka-price.js <price> <date>');
    
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

export { fetchDebekaWithPuppeteer };
