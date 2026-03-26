
const fs = require('fs');
const jsPath = '/Users/Residentialist/.openclaw/workspace/residentialist/dashboard/public/js/curation.js';
let js = fs.readFileSync(jsPath, 'utf8');

// Add restore logic after the .join line in renderProductList
const target = "  }).join('');
}

function labelClass";
const replacement = "  }).join('');
  // Restore checked state after re-render
  if (window._checkedSlugs && window._checkedSlugs.size > 0) {
    container.querySelectorAll('.checkbox').forEach(cb => {
      if (window._checkedSlugs.has(cb.dataset.slug)) cb.checked = true;
    });
  }
}

function labelClass";

if (js.includes(target)) {
  js = js.replace(target, replacement);
  fs.writeFileSync(jsPath, js);
  console.log('RESTORED ✅');
} else {
  console.log('TARGET NOT FOUND');
  // Show what's actually there
  const idx = js.indexOf('.join('');');
  if (idx > -1) console.log('NEAR:', JSON.stringify(js.substring(idx, idx+80)));
}
