#!/usr/bin/env node

import { search, SafeSearchType } from 'duck-duck-scrape';

console.log('🧪 Testing DuckDuckGo search directly...\n');

// Add delay function
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function testSearch() {
  try {
    console.log('Test 1: Simple search for "TypeScript tutorial"');
    const result1 = await search('TypeScript tutorial', { safeSearch: SafeSearchType.MODERATE });
    console.log(`✅ Found ${result1.results.length} results`);
    console.log(`First result: ${result1.results[0]?.title}\n`);
    
    // Wait before next request
    console.log('⏳ Waiting 2 seconds before next request...\n');
    await delay(2000);
    
    console.log('Test 2: Search for "weather today"');
    const result2 = await search('weather today', { safeSearch: SafeSearchType.MODERATE });
    console.log(`✅ Found ${result2.results.length} results`);
    console.log(`First result: ${result2.results[0]?.title}\n`);
    
    // Wait before next request
    console.log('⏳ Waiting 2 seconds before next request...\n');
    await delay(2000);
    
    console.log('Test 3: Search for "Node.js MCP server"');
    const result3 = await search('Node.js MCP server', { safeSearch: SafeSearchType.MODERATE });
    console.log(`✅ Found ${result3.results.length} results`);
    console.log(`First result: ${result3.results[0]?.title}\n`);
    
    console.log('🎉 All tests passed! No rate limiting detected.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('DDG detected an anomaly')) {
      console.error('⚠️  Rate limited! DuckDuckGo is blocking requests.');
      console.error('💡 Try waiting longer between requests or using a VPN.');
    }
  }
}

testSearch();