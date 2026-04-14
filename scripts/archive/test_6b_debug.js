/**
 * Debug test — trace every step of the fetch + classify flow.
 */

require('dotenv').config({ path: '/Users/Residentialist/.openclaw/workspace/residentialist/.env' });
const fs = require('fs');

const LOG = '/tmp/test_6b_debug.log';
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(LOG, line);
  process.stdout.write(line);
}

// Clear log
fs.writeFileSync(LOG, '');

process.on('uncaughtException', (err) => {
  log(`UNCAUGHT EXCEPTION: ${err.message}\n${err.stack}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  log(`UNHANDLED REJECTION: ${reason}`);
  process.exit(1);
});

async function main() {
  log('Starting debug test');
  
  const { fetchPageText, classifyWithHaiku, htmlToText } = require('./relevance_classifier');
  const Anthropic = require('@anthropic-ai/sdk');
  
  // Step 1: Fetch a page
  log('Step 1: Fetching edmunds.com...');
  try {
    const result = await fetchPageText('https://www.edmunds.com/gmc/sierra-1500/');
    log(`  Fetch result: status=${result.status}, error=${result.error}, text_len=${result.text.length}`);
    log(`  First 200 chars: ${result.text.slice(0, 200)}`);
  } catch (err) {
    log(`  Fetch ERROR: ${err.message}`);
  }
  
  // Step 2: Fetch Wikipedia (known to work)
  log('Step 2: Fetching wikipedia...');
  try {
    const result = await fetchPageText('https://en.wikipedia.org/wiki/Sierra_Pacific_Industries');
    log(`  Fetch result: status=${result.status}, error=${result.error}, text_len=${result.text.length}`);
  } catch (err) {
    log(`  Fetch ERROR: ${err.message}`);
  }
  
  // Step 3: Test Haiku directly
  log('Step 3: Testing Haiku classification...');
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const result = await classifyWithHaiku(
      client,
      'Sierra Pacific Industries is a lumber and forest products company. They manufacture wood products. This is not about windows.',
      'Sierra Pacific',
      'Sierra Pacific',
      'windows',
      'https://en.wikipedia.org/wiki/Sierra_Pacific_Industries',
      'Sierra Pacific Industries - Wikipedia'
    );
    log(`  Haiku result: ${JSON.stringify(result)}`);
  } catch (err) {
    log(`  Haiku ERROR: ${err.message}\n${err.stack}`);
  }
  
  // Step 4: Test the full classifyRelevance with 2 sources
  log('Step 4: Testing full classifyRelevance with 2 sources...');
  try {
    const { classifyRelevance } = require('./relevance_classifier');
    
    const testSources = [
      {
        name: 'Wikipedia — Sierra Pacific Industries',
        url: 'https://en.wikipedia.org/wiki/Sierra_Pacific_Industries',
        pool: 'unknown',
        source_type: 'web',
        phase: 'phase_2_web_searches',
      },
      {
        name: 'GBA Discussion',
        url: 'https://www.greenbuildingadvisor.com',
        pool: 'A',
        source_type: 'professional_forum',
        phase: 'phase_4_professional_forums',
      },
    ];
    
    const result = await classifyRelevance(
      testSources,
      'Sierra Pacific',
      'Sierra Pacific',
      'windows',
      { verbose: true }
    );
    
    log(`  Result: ${result.relevant.length} relevant, ${result.rejected.length} rejected`);
    log(`  Stats: ${JSON.stringify(result.stats)}`);
  } catch (err) {
    log(`  classifyRelevance ERROR: ${err.message}\n${err.stack}`);
  }
  
  log('=== Debug test complete ===');
}

main().catch(err => {
  log(`FATAL: ${err.message}\n${err.stack}`);
  process.exit(1);
});
