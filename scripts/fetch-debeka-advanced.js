#!/usr/bin/env node

/**
 * Advanced Debeka data fetcher using Puppeteer
 * Can extract chart data rendered by JavaScript
 * Falls back to basic fetch if Puppeteer fails
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

const DEBEKA_URL = 'https://www.debeka.de/landingpages/sonstige/debeka-global-shares.html';

async function fetchWithPuppeteer() {
  console.log('🎭 Attempting fetch with Puppeteer (headless browser)...');
  
  try {
    // Dynamic import to handle if puppeteer is not installed
    const puppeteer = await import('puppeteer');
    
    const browser = await puppeteer.default.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set user agent to avoid bot detection
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    
    console.log('🌐 Loading page...');
    await page.goto(DEBEKA_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for chart to load
    await page.waitForTimeout(3000);
    
    // Extract data from the page
    const data = await page.evaluate(() => {
      const result = {
        price: null,
        priceDate: null,
        chartData: [],
      };
      
      // Extract current price
      const priceElement = document.querySelector('[class*="anteilswert"], [class*="price"], [class*="kurs"]');
      if (priceElement) {
        const priceText = priceElement.textContent.trim();
        const priceMatch = priceText.match(/([0-9,.]+)/);
        result.price = priceMatch ? priceMatch[1] : null;
      }
      
      // Alternative: look for specific text patterns
      const bodyText = document.body.innerText;
      const priceMatch = bodyText.match(/Aktueller Anteilswert:\s*([0-9,.]+)\s*EUR/i);
      if (priceMatch) {
        result.price = priceMatch[1];
      }
      
      const dateMatch = bodyText.match(/Stand:\s*([0-9]{2}\.[0-9]{2}\.[0-9]{4})/i);
      if (dateMatch) {
        result.priceDate = dateMatch[1];
      }
      
      // Try to extract chart data from window objects
      if (window.chartData) {
        result.chartData = window.chartData;
      }
      
      // Look for Highcharts or similar chart libraries
      if (window.Highcharts && window.Highcharts.charts) {
        const charts = window.Highcharts.charts.filter(c => c);
        if (charts.length > 0) {
          const chart = charts[0];
          if (chart.series && chart.series[0]) {
            result.chartData = chart.series[0].data.map(point => ({
              date: point.x || point.category,
              value: point.y
            }));
          }
        }
      }
      
      // Look for Chart.js
      if (window.Chart && window.Chart.instances) {
        const charts = Object.values(window.Chart.instances);
        if (charts.length > 0) {
          const chart = charts[0];
          if (chart.data && chart.data.datasets) {
            result.chartData = chart.data.datasets[0].data.map((value, index) => ({
              date: chart.data.labels[index],
              value: value
            }));
          }
        }
      }
      
      return result;
    });
    
    await browser.close();
    
    console.log('✅ Puppeteer extraction successful');
    console.log(`   Price: ${data.price}`);
    console.log(`   Date: ${data.priceDate}`);
    console.log(`   Chart points: ${data.chartData.length}`);
    
    return data;
    
  } catch (error) {
    console.log('⚠️  Puppeteer failed:', error.message);
    console.log('   Falling back to basic fetch...');
    return null;
  }
}

async function fetchBasic() {
  console.log('📡 Using basic fetch...');
  
  const response = await fetch(DEBEKA_URL);
  const html = await response.text();
  
  const priceMatch = html.match(/Aktueller Anteilswert:\s*([0-9,.]+)\s*EUR/i);
  const dateMatch = html.match(/Stand:\s*([0-9]{2}\.[0-9]{2}\.[0-9]{4})/i);
  
  return {
    price: priceMatch ? priceMatch[1] : null,
    priceDate: dateMatch ? dateMatch[1] : null,
    chartData: []
  };
}

async function fetchDebekaData() {
  console.log('🔍 Fetching Debeka Global Shares data...');
  console.log(`📅 Time: ${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}`);
  
  try {
    // Try Puppeteer first, fall back to basic fetch
    let data = await fetchWithPuppeteer();
    
    if (!data || !data.price) {
      data = await fetchBasic();
    }
    
    const result = {
      lastUpdate: new Date().toISOString(),
      lastUpdateCET: new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }),
      source: DEBEKA_URL,
      currentPrice: data.price ? parseFloat(data.price.replace(',', '.')) : null,
      priceFormatted: data.price,
      priceDate: data.priceDate,
      currency: 'EUR',
      fundName: 'Debeka Global Shares',
      chartData: data.chartData,
      chartDataPoints: data.chartData.length,
      method: data.chartData.length > 0 ? 'puppeteer' : 'basic-fetch',
    };
    
    console.log('✅ Data fetched successfully:');
    console.log(`   Price: ${result.priceFormatted} EUR`);
    console.log(`   Date: ${result.priceDate}`);
    console.log(`   Chart points: ${result.chartDataPoints}`);
    console.log(`   Method: ${result.method}`);
    
    // Save to public folder
    const outputPath = join(process.cwd(), 'public', 'debeka-data.json');
    writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`💾 Saved to: ${outputPath}`);
    
    return result;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchDebekaData()
    .then(() => {
      console.log('✨ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

export { fetchDebekaData };
