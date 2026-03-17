/**
 * THE RESIDENTIALIST — Reddit Power User Filter
 * 
 * Mechanical filter: searches Reddit for product mentions, identifies power users
 * based on strict criteria (karma, account age, trade subreddit activity),
 * and returns their relevant comments.
 * 
 * This is a DUMB bot — no AI judgment. Just numbers and rules.
 * 
 * Usage:
 *   const { findPowerUsers } = require('./reddit_power_users');
 *   const results = await findPowerUsers('Andersen E-Series', 'Andersen', checklist);
 *   // results = { power_users: [...], all_comments: [...], stats: {...} }
 */

const https = require('https');

// ─── CONFIG ──────────────────────────────────────────────────────────────────

// Reddit blocks bot-like User-Agents from Node.js https module (403).
// Using a browser-like UA resolves this. curl works either way but Node.js doesn't.
const REDDIT_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

const DEFAULT_CRITERIA = {
  min_combined_karma: 1000,
  min_account_age_months: 12,
  trade_subreddits: [
    'Construction', 'HVAC', 'Plumbing', 'electricians',
    'HomeInspections', 'Carpentry', 'bluecollarwomen', 'Roofing',
    'Contractors'
  ],
  quality_subreddits: [
    'PassiveHouse', 'buildingscience', 'HomeImprovement'
  ],
  disqualify_patterns: [
    /referral|affiliate|discount code/i,
    /\b(our company|we install|we offer|call us|visit us)\b/i,
  ]
};

// ─── HTTP HELPERS ────────────────────────────────────────────────────────────

function redditGet(path, retries = 2) {
  return new Promise((resolve, reject) => {
    // IMPORTANT: Must pass hostname/path as options object, NOT url string.
    // Node.js https.get(urlString, options) ignores headers in options.
    const options = {
      hostname: 'www.reddit.com',
      path: path,
      headers: {
        'User-Agent': REDDIT_USER_AGENT,
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    };

    const makeRequest = (attemptsLeft) => {
      https.get(options, (res) => {
        // Handle Reddit rate limiting
        if (res.statusCode === 429) {
          const retryAfter = parseInt(res.headers['retry-after'] || '5', 10);
          console.log(`[REDDIT] Rate limited, waiting ${retryAfter}s...`);
          if (attemptsLeft > 0) {
            setTimeout(() => makeRequest(attemptsLeft - 1), retryAfter * 1000);
          } else {
            resolve(null);
          }
          res.resume();
          return;
        }

        if (res.statusCode !== 200) {
          console.log(`[REDDIT] HTTP ${res.statusCode} for ${path}`);
          res.resume();
          resolve(null);
          return;
        }

        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            console.log(`[REDDIT] JSON parse error for ${path}`);
            resolve(null);
          }
        });
      }).on('error', (err) => {
        console.log(`[REDDIT] Request error: ${err.message}`);
        if (attemptsLeft > 0) {
          setTimeout(() => makeRequest(attemptsLeft - 1), 2000);
        } else {
          resolve(null);
        }
      });
    };

    makeRequest(retries);
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── SEARCH REDDIT ───────────────────────────────────────────────────────────

async function searchSubreddit(subreddit, query, limit = 25) {
  // Reddit search JSON endpoint
  const encodedQuery = encodeURIComponent(query);
  const path = `/r/${subreddit}/search.json?q=${encodedQuery}&restrict_sr=on&sort=relevance&limit=${limit}`;
  
  const data = await redditGet(path);
  if (!data?.data?.children) return [];

  const posts = [];
  for (const child of data.data.children) {
    const post = child.data;
    posts.push({
      id: post.id,
      title: post.title,
      author: post.author,
      subreddit: post.subreddit,
      score: post.score,
      num_comments: post.num_comments,
      url: `https://reddit.com${post.permalink}`,
      selftext: (post.selftext || '').slice(0, 1000),
      created_utc: post.created_utc,
    });
  }
  return posts;
}

async function getPostComments(postId, subreddit, limit = 50) {
  const path = `/r/${subreddit}/comments/${postId}.json?limit=${limit}&sort=top`;
  
  const data = await redditGet(path);
  if (!Array.isArray(data) || data.length < 2) return [];

  const comments = [];
  function extractComments(listing) {
    if (!listing?.data?.children) return;
    for (const child of listing.data.children) {
      if (child.kind !== 't1') continue;
      const c = child.data;
      if (!c.author || c.author === '[deleted]' || c.author === 'AutoModerator') continue;
      comments.push({
        author: c.author,
        body: (c.body || '').slice(0, 2000),
        score: c.score,
        created_utc: c.created_utc,
      });
      // Get replies too (one level deep)
      if (c.replies) extractComments(c.replies);
    }
  }
  extractComments(data[1]);
  return comments;
}

// ─── USER PROFILE CHECK ─────────────────────────────────────────────────────

async function getUserProfile(username) {
  const path = `/user/${username}/about.json`;
  const data = await redditGet(path);
  if (!data?.data) return null;

  const user = data.data;
  const accountAge = (Date.now() / 1000 - user.created_utc) / (30 * 24 * 60 * 60); // months

  return {
    username: user.name,
    combined_karma: (user.link_karma || 0) + (user.comment_karma || 0),
    link_karma: user.link_karma || 0,
    comment_karma: user.comment_karma || 0,
    account_age_months: Math.round(accountAge),
    created_utc: user.created_utc,
    is_suspended: user.is_suspended || false,
  };
}

async function getUserSubreddits(username, limit = 100) {
  // Check user's recent comments to see which subreddits they post in
  const path = `/user/${username}/comments.json?limit=${limit}&sort=new`;
  const data = await redditGet(path);
  if (!data?.data?.children) return [];

  const subredditCounts = {};
  for (const child of data.data.children) {
    const sub = child.data?.subreddit;
    if (sub) {
      subredditCounts[sub] = (subredditCounts[sub] || 0) + 1;
    }
  }

  return Object.entries(subredditCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

// ─── POWER USER CLASSIFICATION ──────────────────────────────────────────────

function classifyUser(profile, subredditActivity, criteria = DEFAULT_CRITERIA) {
  const result = {
    username: profile.username,
    is_power_user: false,
    meets_karma: false,
    meets_age: false,
    has_trade_activity: false,
    has_quality_activity: false,
    is_disqualified: false,
    disqualify_reason: null,
    trade_subs_found: [],
    quality_subs_found: [],
    score: 0, // 0-10 mechanical score
  };

  // Check karma
  result.meets_karma = profile.combined_karma >= criteria.min_combined_karma;

  // Check account age
  result.meets_age = profile.account_age_months >= criteria.min_account_age_months;

  // Check trade subreddit activity
  const activeSubNames = subredditActivity.map(s => s.name);
  result.trade_subs_found = criteria.trade_subreddits.filter(ts => activeSubNames.includes(ts));
  result.has_trade_activity = result.trade_subs_found.length > 0;

  // Check quality subreddit activity
  result.quality_subs_found = criteria.quality_subreddits.filter(qs => activeSubNames.includes(qs));
  result.has_quality_activity = result.quality_subs_found.length > 0;

  // Suspended accounts
  if (profile.is_suspended) {
    result.is_disqualified = true;
    result.disqualify_reason = 'Account suspended';
    return result;
  }

  // Mechanical power user threshold:
  // Must meet karma + age, AND have either trade or quality subreddit activity
  result.is_power_user = result.meets_karma && result.meets_age && 
    (result.has_trade_activity || result.has_quality_activity);

  // Score (mechanical, 0-10):
  let score = 0;
  if (result.meets_karma) score += 2;
  if (profile.combined_karma >= 5000) score += 1;
  if (profile.combined_karma >= 20000) score += 1;
  if (result.meets_age) score += 1;
  if (profile.account_age_months >= 36) score += 1;
  if (result.has_trade_activity) score += 2;
  if (result.trade_subs_found.length >= 2) score += 1;
  if (result.has_quality_activity) score += 1;
  result.score = Math.min(score, 10);

  return result;
}

// ─── MAIN: FIND POWER USERS ────────────────────────────────────────────────

async function findPowerUsers(productName, manufacturer, options = {}) {
  const subreddits = options.subreddits || [
    'homeowners', 'HomeImprovement', 'Construction',
    'homebuilding', 'windows', 'PassiveHouse', 'buildingscience'
  ];
  const criteria = options.criteria || DEFAULT_CRITERIA;
  const maxPostsPerSub = options.maxPostsPerSub || 10;
  const maxUsersToCheck = options.maxUsersToCheck || 30;

  console.log(`[REDDIT POWER USERS] Searching for "${productName}" / "${manufacturer}" across ${subreddits.length} subreddits`);

  // Step 1: Search all target subreddits
  const allPosts = [];
  for (const sub of subreddits) {
    console.log(`[REDDIT] Searching r/${sub}...`);
    
    // Search for product name
    const posts1 = await searchSubreddit(sub, productName, maxPostsPerSub);
    allPosts.push(...posts1);
    await sleep(1500); // Rate limit courtesy

    // Search for manufacturer name (broader)
    const posts2 = await searchSubreddit(sub, `${manufacturer} windows`, maxPostsPerSub);
    // Deduplicate
    const existingIds = new Set(allPosts.map(p => p.id));
    allPosts.push(...posts2.filter(p => !existingIds.has(p.id)));
    await sleep(1500);
  }

  console.log(`[REDDIT] Found ${allPosts.length} relevant posts`);

  // Step 2: Pull comments from top posts (sorted by relevance/score)
  const sortedPosts = allPosts.sort((a, b) => b.score - a.score).slice(0, 15);
  const allComments = [];
  const seenAuthors = new Set();

  for (const post of sortedPosts) {
    console.log(`[REDDIT] Pulling comments from: ${post.title.slice(0, 60)}...`);
    const comments = await getPostComments(post.id, post.subreddit);
    
    for (const comment of comments) {
      // Filter: must mention product or manufacturer
      const text = comment.body.toLowerCase();
      const prodLower = productName.toLowerCase();
      const mfgLower = manufacturer.toLowerCase();
      if (text.includes(prodLower) || text.includes(mfgLower) || 
          text.includes(prodLower.replace('-', ' ')) || text.includes(prodLower.replace('-', ''))) {
        allComments.push({
          ...comment,
          post_title: post.title,
          post_url: post.url,
          subreddit: post.subreddit,
        });
        seenAuthors.add(comment.author);
      }
    }
    await sleep(1500);
  }

  console.log(`[REDDIT] Found ${allComments.length} relevant comments from ${seenAuthors.size} unique users`);

  // Step 3: Check user profiles (up to maxUsersToCheck)
  const authorsToCheck = [...seenAuthors].slice(0, maxUsersToCheck);
  const userProfiles = {};
  const powerUsers = [];
  const regularUsers = [];

  for (const author of authorsToCheck) {
    console.log(`[REDDIT] Checking profile: u/${author}`);
    const profile = await getUserProfile(author);
    await sleep(1200);

    if (!profile) {
      console.log(`[REDDIT]   -> Profile not accessible`);
      continue;
    }

    const subs = await getUserSubreddits(author);
    await sleep(1200);

    const classification = classifyUser(profile, subs, criteria);
    userProfiles[author] = { profile, subredditActivity: subs, classification };

    // Check disqualifiers in their comments
    const userComments = allComments.filter(c => c.author === author);
    let disqualified = false;
    for (const comment of userComments) {
      for (const pattern of criteria.disqualify_patterns) {
        if (pattern.test(comment.body)) {
          classification.is_disqualified = true;
          classification.disqualify_reason = `Pattern match: ${pattern}`;
          classification.is_power_user = false;
          disqualified = true;
          break;
        }
      }
      if (disqualified) break;
    }

    if (classification.is_power_user) {
      powerUsers.push({
        ...classification,
        combined_karma: profile.combined_karma,
        account_age_months: profile.account_age_months,
        comments: userComments.map(c => ({
          body: c.body,
          score: c.score,
          subreddit: c.subreddit,
          post_title: c.post_title,
          post_url: c.post_url,
        })),
      });
    } else {
      regularUsers.push({
        username: author,
        reason: classification.is_disqualified ? classification.disqualify_reason :
          !classification.meets_karma ? `Low karma (${profile.combined_karma})` :
          !classification.meets_age ? `New account (${profile.account_age_months}mo)` :
          'No trade/quality subreddit activity',
        comment_count: userComments.length,
      });
    }
  }

  // Sort power users by score descending
  powerUsers.sort((a, b) => b.score - a.score);

  const result = {
    product: productName,
    manufacturer: manufacturer,
    search_date: new Date().toISOString(),
    stats: {
      posts_found: allPosts.length,
      comments_relevant: allComments.length,
      unique_authors: seenAuthors.size,
      profiles_checked: authorsToCheck.length,
      power_users_found: powerUsers.length,
      regular_users_filtered: regularUsers.length,
    },
    power_users: powerUsers,
    filtered_users: regularUsers,
    _note: 'Power users are mechanically filtered by karma, account age, and trade subreddit activity. Price-bias flag must be applied by editorial review — this module does NOT assess price-bias.'
  };

  console.log(`[REDDIT POWER USERS] Complete: ${powerUsers.length} power users, ${regularUsers.length} filtered out`);
  return result;
}

// ─── GENERATE BOT 1 SUPPLEMENT ──────────────────────────────────────────────

function generateBot1Supplement(powerUserResult) {
  let output = `# Reddit Power User Analysis: ${powerUserResult.product}\n`;
  output += `# Generated: ${powerUserResult.search_date}\n`;
  output += `# Stats: ${powerUserResult.stats.posts_found} posts searched, ${powerUserResult.stats.power_users_found} power users found\n\n`;

  if (powerUserResult.power_users.length === 0) {
    output += `NO QUALIFIED POWER USERS FOUND for ${powerUserResult.product}.\n`;
    output += `Searched ${powerUserResult.stats.posts_found} posts across target subreddits.\n`;
    output += `${powerUserResult.stats.profiles_checked} user profiles checked — none met power user criteria.\n`;
    return output;
  }

  output += `## QUALIFIED REDDIT POWER USERS\n\n`;
  output += `These users met ALL mechanical criteria: 1000+ karma, 12+ month account age, active in trade/quality subreddits.\n`;
  output += `Price-bias assessment: PENDING EDITORIAL REVIEW (not assessed by this filter).\n\n`;

  for (const pu of powerUserResult.power_users) {
    output += `### u/${pu.username} (Score: ${pu.score}/10)\n`;
    output += `- Karma: ${pu.combined_karma} | Account age: ${pu.account_age_months} months\n`;
    output += `- Trade subs: ${pu.trade_subs_found.join(', ') || 'none'}\n`;
    output += `- Quality subs: ${pu.quality_subs_found.join(', ') || 'none'}\n`;
    output += `- Price-bias: NOT YET ASSESSED\n\n`;

    for (const comment of pu.comments) {
      output += `  > **r/${comment.subreddit}** (score: ${comment.score}) — "${comment.post_title}"\n`;
      output += `  > ${comment.body.slice(0, 500)}\n\n`;
    }
    output += `---\n\n`;
  }

  if (powerUserResult.filtered_users.length > 0) {
    output += `## FILTERED OUT (did not meet power user criteria)\n\n`;
    for (const fu of powerUserResult.filtered_users) {
      output += `- u/${fu.username}: ${fu.reason} (${fu.comment_count} relevant comments)\n`;
    }
  }

  return output;
}

module.exports = { findPowerUsers, generateBot1Supplement, classifyUser, DEFAULT_CRITERIA };

// CLI mode
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: node reddit_power_users.js "Product Name" "Manufacturer"');
    process.exit(1);
  }
  findPowerUsers(args[0], args[1])
    .then(result => {
      const supplement = generateBot1Supplement(result);
      const fs = require('fs');
      const slug = args[0].toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      const outPath = `./inputs/${slug}_reddit_power_users.md`;
      fs.writeFileSync(outPath, supplement);
      fs.writeFileSync(`./inputs/${slug}_reddit_power_users.json`, JSON.stringify(result, null, 2));
      console.log(`\nResults written to: ${outPath}`);
      console.log(`JSON data written to: ./inputs/${slug}_reddit_power_users.json`);
    })
    .catch(err => {
      console.error('Error:', err);
      process.exit(1);
    });
}
