#!/usr/bin/env node

/**
 * Manual Debeka price updater
 * Usage: node scripts/update-debeka-price.js 235.50 "31.10.2025"
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const args = process.argv.slice(2);

if (args.length < 1) {
  console.log(`
📊 Manual Debeka Price Updater
Usage: node scripts/update-debeka-price.js <price> [date]

Examples:
  node scripts/update-debeka-price.js 235.50
  node scripts/update-debeka-price.js 235.50 "31.10.2025"
  node scripts/update-debeka-price.js 235,50 "31.10.2025"
  
Current data:
  `);
  
  try {
    const currentData = JSON.parse(
      readFileSync(join(process.cwd(), 'public', 'debeka-data.json'), 'utf8')
    );
    console.log(`  Price: ${currentData.priceFormatted} EUR`);
    console.log(`  Date: ${currentData.priceDate}`);
    console.log(`  Last update: ${currentData.lastUpdateCET}`);
  } catch (e) {
    console.log('  (No data file found)');
  }
  
  process.exit(1);
}

const priceInput = args[0].replace(',', '.');
const price = parseFloat(priceInput);

if (isNaN(price)) {
  console.error('❌ Invalid price:', args[0]);
  process.exit(1);
}

const priceFormatted = price.toFixed(2).replace('.', ',');
const priceDate = args[1] || new Date().toLocaleDateString('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

const data = {
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
  source: 'https://www.debeka.de/landingpages/sonstige/debeka-global-shares.html',
  currentPrice: price,
  priceFormatted: priceFormatted,
  priceDate: priceDate,
  currency: 'EUR',
  fundName: 'Debeka Global Shares',
  chartData: [],
  chartDataPoints: 0,
  method: 'manual-update',
};

const outputPath = join(process.cwd(), 'public', 'debeka-data.json');
writeFileSync(outputPath, JSON.stringify(data, null, 2));

console.log('✅ Updated Debeka data:');
console.log(`   Price: ${priceFormatted} EUR`);
console.log(`   Date: ${priceDate}`);
console.log(`   File: ${outputPath}`);
console.log('');
console.log('💡 Next steps:');
console.log('   1. Build: npm run build:client');
console.log('   2. Commit: git add public/debeka-data.json && git commit -m "Update Debeka price to ' + priceFormatted + ' EUR"');
console.log('   3. Push: git push');
