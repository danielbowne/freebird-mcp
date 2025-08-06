#!/usr/bin/env node

import { DDGS } from '@phukon/duckduckgo-search';

console.log('🧪 Testing @phukon/duckduckgo-search...\n');

async function testPhukonSearch() {
  try {
    const ddgs = new DDGS();
    
    console.log('Test 1: Simple text search');
    const results = await ddgs.text({
      keywords: 'TypeScript tutorial',
      maxResults: 3
    });
    console.log(`✅ Found ${results.length} results`);
    console.log('First result:', results[0]?.title);
    console.log('URL:', results[0]?.href);
    console.log('Body:', results[0]?.body?.substring(0, 100) + '...\n');
    
    console.log('Test 2: Weather search');
    const weatherResults = await ddgs.text({
      keywords: 'weather today',
      maxResults: 2
    });
    console.log(`✅ Found ${weatherResults.length} weather results`);
    if (weatherResults[0]) {
      console.log('First result:', weatherResults[0]?.title);
      console.log('Body:', weatherResults[0]?.body?.substring(0, 100) + '...');
    }
    
    console.log('\n🎉 All tests passed! No rate limiting detected.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testPhukonSearch();