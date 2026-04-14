/**
 * Patch: Fix Bot 1 web search iteration handling
 * 
 * BUG: When Bot 1 gets a `pause_turn` stop reason from the Anthropic API,
 * the code strips tool_use/server_tool_use blocks and only passes text blocks
 * back, adding "Continue." as a user message. This breaks the server-side
 * web search tool chain.
 * 
 * FIX: Per Anthropic docs, on `pause_turn`, send response.content back AS-IS
 * (including all server_tool_use blocks) and do NOT add a "Continue." user message.
 * The API will continue its server-side sampling loop from where it left off.
 * 
 * For `tool_use` (client-side tools) and `max_tokens`, the existing behavior
 * of adding "Continue." is acceptable.
 * 
 * Run on Mac Mini: node patch_bot1_iterations.js
 */

const fs = require('fs');
const filePath = '/Users/Residentialist/.openclaw/workspace/residentialist/bot_orchestrator_v3.js';
let code = fs.readFileSync(filePath, 'utf8');

// Find the broken pause_turn handling block
const oldHandler = `    if (stopReason === 'end_turn') break;

    if (stopReason === 'pause_turn' || stopReason === 'tool_use' || stopReason === 'max_tokens') {
      // Only keep text blocks in history — never send tool_use blocks back
      const safeContent = textBlocks.length > 0
        ? textBlocks
        : [{ type: 'text', text: '...' }];
      messages.push({ role: 'assistant', content: safeContent });
      messages.push({ role: 'user', content: [{ type: 'text', text: 'Continue.' }] });
      continue;
    }`;

const newHandler = `    if (stopReason === 'end_turn') break;

    if (stopReason === 'pause_turn') {
      // Server-side tool execution paused — send response.content back AS-IS
      // per Anthropic docs: "continue the conversation by sending the response back"
      // Do NOT strip tool_use blocks. Do NOT add "Continue." user message.
      // The API will resume its server-side sampling loop from where it left off.
      messages = [
        { role: 'user', content: messages[0].content },  // original user message
        { role: 'assistant', content: response.content },  // full response including server_tool_use blocks
      ];
      continue;
    }

    if (stopReason === 'tool_use' || stopReason === 'max_tokens') {
      // Client-side tool use or token limit — existing behavior is fine
      const safeContent = textBlocks.length > 0
        ? textBlocks
        : [{ type: 'text', text: '...' }];
      messages.push({ role: 'assistant', content: safeContent });
      messages.push({ role: 'user', content: [{ type: 'text', text: 'Continue.' }] });
      continue;
    }`;

if (code.includes(oldHandler)) {
  code = code.replace(oldHandler, newHandler);
  fs.writeFileSync(filePath, code);
  console.log('✓ Patched pause_turn handler — now sends response.content back as-is');
  console.log('  Bot 1 should now run 5-15 iterations instead of 2');
} else {
  console.log('✗ Could not find the old pause_turn handler block');
  console.log('  The code may have already been patched or the format changed.');
}
