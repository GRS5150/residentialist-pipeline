/**
 * Quick targeted test of Phase 6b relevance classification.
 * Uses a small fake source list to test the full flow without running Brave.
 */

require('dotenv').config({ path: '/Users/Residentialist/.openclaw/workspace/residentialist/.env' });
const { classifyRelevance, fetchPageText } = require('./relevance_classifier');

async function main() {
  console.log('=== Phase 6b Quick Test ===\n');
  
  // Test 1: Single page fetch
  console.log('Test 1: Fetching a single page...');
  const fetchResult = await fetchPageText('https://www.greenbuildingadvisor.com');
  console.log(`  Status: ${fetchResult.status}, Error: ${fetchResult.error}`);
  console.log(`  Text length: ${fetchResult.text.length}`);
  console.log(`  First 200 chars: ${fetchResult.text.slice(0, 200)}\n`);
  
  // Test 2: Small classify test with known true/false positives
  console.log('Test 2: Classifying 5 sources for Sierra Pacific...');
  
  const testSources = [
    // Should be RELEVANT — actual Sierra Pacific Windows page
    {
      name: 'Sierra Pacific Windows — Product Info',
      url: 'https://www.sierrapacificwindows.com',
      pool: 'certification',
      source_type: 'manufacturer',
      phase: 'phase_1_direct_fetches',
    },
    // Should be RELEVANT — a GBA discussion about Sierra Pacific windows (auto-relevant via skip list)
    {
      name: 'GBA — Sierra Pacific Discussion',
      url: 'https://www.greenbuildingadvisor.com/question/sierra-pacific-windows',
      pool: 'A',
      source_type: 'professional_forum',
      phase: 'phase_4_professional_forums',
    },
    // Should be REJECTED — GM Sierra truck
    {
      name: 'GM Sierra Pacific Truck Review',
      url: 'https://www.edmunds.com/gmc/sierra-1500/',
      pool: 'unknown',
      source_type: 'web',
      description: 'GMC Sierra 1500 truck review',
      phase: 'phase_2_web_searches',
    },
    // Should be RELEVANT — Reddit discussion about SP windows
    {
      name: 'Reddit — Sierra Pacific windows review',
      url: 'https://www.reddit.com/r/HomeImprovement/comments/example/',
      pool: 'C',
      source_type: 'reddit',
      description: 'Sierra Pacific windows quality discussion in homeimprovement',
      phase: 'phase_3_reddit',
    },
    // Should be REJECTED — Sierra Pacific Railroad
    {
      name: 'Wikipedia — Sierra Pacific Industries',
      url: 'https://en.wikipedia.org/wiki/Sierra_Pacific_Industries',
      pool: 'unknown',
      source_type: 'web',
      description: 'Sierra Pacific Industries is an American lumber company',
      phase: 'phase_2_web_searches',
    },
  ];
  
  try {
    const result = await classifyRelevance(
      testSources,
      'Sierra Pacific',
      'Sierra Pacific',
      'windows',
      { verbose: true }
    );
    
    console.log('\n=== Final Results ===');
    console.log(`Relevant: ${result.relevant.length}`);
    console.log(`Rejected: ${result.rejected.length}`);
    console.log('\nRelevant sources:');
    for (const s of result.relevant) {
      console.log(`  ✓ ${s.name} (${s._relevance_check?.reason?.slice(0, 60)})`);
    }
    console.log('\nRejected sources:');
    for (const r of result.rejected) {
      console.log(`  ✗ ${r.source.name} — ${r.reason}`);
    }
    console.log('\nStats:', JSON.stringify(result.stats, null, 2));
  } catch (err) {
    console.error('CLASSIFICATION ERROR:', err.message);
    console.error(err.stack);
  }
  
  console.log('\n=== Test Complete ===');
}

main().catch(err => {
  console.error('FATAL:', err.message);
  console.error(err.stack);
  process.exit(1);
});
