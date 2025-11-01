#!/usr/bin/env node

/**
 * Fetch Debeka Global Shares data
 * Runs daily at 4 AM CET via GitHub Actions
 * Extracts current price and historical chart data
 */

import { writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DEBEKA_URL = 'https://www.debeka.de/landingpages/sonstige/debeka-global-shares.html';

async function fetchDebekaData() {
  console.log('🔍 Fetching Debeka Global Shares data...');
  console.log(`📅 Time: ${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}`);
  
  try {
    const response = await fetch(DEBEKA_URL);
    const html = await response.text();
    
    // Extract current price (e.g., "233,38 EUR")
    const priceMatch = html.match(/Aktueller Anteilswert:\s*([0-9,.]+)\s*EUR/i);
    const currentPrice = priceMatch ? priceMatch[1] : null;
    
    // Extract date (e.g., "Stand: 30.10.2025")
    const dateMatch = html.match(/Stand:\s*([0-9]{2}\.[0-9]{2}\.[0-9]{4})/i);
    const priceDate = dateMatch ? dateMatch[1] : null;
    
    // Try to extract chart data (this might be in a script tag or data attribute)
    // We'll look for common patterns in financial websites
    let chartData = null;
    
    // Look for JSON data embedded in the page
    const jsonMatch = html.match(/chartData\s*[=:]\s*(\[[\s\S]*?\])/);
    if (jsonMatch) {
      try {
        chartData = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.log('⚠️  Could not parse chart data from page');
      }
    }
    
    // Look for data-* attributes with chart information
    const dataAttrMatch = html.match(/data-chart[^>]*=["']([^"']+)["']/);
    if (dataAttrMatch && !chartData) {
      try {
        chartData = JSON.parse(dataAttrMatch[1]);
      } catch (e) {
        console.log('⚠️  Could not parse chart data from data attribute');
      }
    }
    
    const result = {
      lastUpdate: new Date().toISOString(),
      lastUpdateCET: new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }),
      source: DEBEKA_URL,
      currentPrice: currentPrice ? parseFloat(currentPrice.replace(',', '.')) : null,
      priceFormatted: currentPrice,
      priceDate: priceDate,
      currency: 'EUR',
      fundName: 'Debeka Global Shares',
      chartData: chartData,
      rawDataAvailable: !!chartData,
    };
    
    console.log('✅ Successfully fetched data:');
    console.log(`   Price: ${result.priceFormatted} EUR`);
    console.log(`   Date: ${result.priceDate}`);
    console.log(`   Chart data: ${result.rawDataAvailable ? 'Available' : 'Not found (may need scraping)'}`);
    
    // Save to public folder so it's included in the build
    const outputPath = join(process.cwd(), 'public', 'debeka-data.json');
    writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`💾 Saved to: ${outputPath}`);
    
    // Also save a timestamped version for historical tracking
    const timestamp = new Date().toISOString().split('T')[0];
    const historicalPath = join(process.cwd(), 'public', `debeka-data-${timestamp}.json`);
    writeFileSync(historicalPath, JSON.stringify(result, null, 2));
    console.log(`📊 Historical copy: ${historicalPath}`);
    
    return result;
    
  } catch (error) {
    console.error('❌ Error fetching Debeka data:', error.message);
    
    // Create fallback data file
    const fallback = {
      lastUpdate: new Date().toISOString(),
      error: error.message,
      fallback: true,
      currentPrice: null,
      message: 'Using cached data or manual input'
    };
    
    const outputPath = join(process.cwd(), 'public', 'debeka-data.json');
    writeFileSync(outputPath, JSON.stringify(fallback, null, 2));
    
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
