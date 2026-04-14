
const { findPowerUsers } = require('./reddit_power_users');

async function test() {
  console.log('[TEST] Starting Reddit power user search...');
  console.log('[TEST] Time:', new Date().toISOString());
  
  try {
    const result = await findPowerUsers('Andersen E-Series', 'Andersen', {
      maxPostsPerSub: 5,
      maxUsersToCheck: 10
    });
    
    console.log('\n[TEST] === RESULTS ===');
    console.log('[TEST] Stats:', JSON.stringify(result.stats, null, 2));
    console.log('[TEST] Power users found:', result.power_users.length);
    
    for (const u of result.power_users) {
      console.log(`[TEST]   - ${u.username} (score: ${u.score}/10, karma: ${u.combined_karma})`);
      console.log(`[TEST]     Trade subs: ${u.trade_subs_found.join(', ') || 'none'}`);
    }
    
    if (result.filtered_users.length > 0) {
      console.log('[TEST] Filtered out:', result.filtered_users.length);
      for (const u of result.filtered_users) {
        console.log(`[TEST]   - ${u.username}: ${u.reason}`);
      }
    }
    
    // Save results
    const fs = require('fs');
    fs.writeFileSync('/tmp/reddit_test_results.json', JSON.stringify(result, null, 2));
    console.log('[TEST] Results saved to /tmp/reddit_test_results.json');
    console.log('[TEST] Done at:', new Date().toISOString());
  } catch(e) {
    console.error('[TEST] Error:', e);
  }
}

test();
