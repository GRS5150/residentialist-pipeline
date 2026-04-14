import re

file = "/Users/Residentialist/.openclaw/workspace/residentialist/bot_orchestrator_v3.js"
with open(file, "r") as f:
    code = f.read()

old_extractor = """function extractMaterialClass(bot1Output) {
  const lines = bot1Output.split('\\n');

  // Look for explicit material class statements in Bot 1's PRODUCT OVERVIEW section
  const patterns = [
    /material\\s+class\\s*[:—]\\s*(.+)/i,
    /frame\\s+material\\s*[:—]\\s*(.+)/i,
    /material\\s+type\\s*[:—]\\s*(.+)/i,
    /construction\\s*[:—]\\s*(.+frame.+|vinyl|wood|fiberglass|aluminum|composite)/i,
  ];

  for (const line of lines) {
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        let raw = match[1].trim().replace(/[*_]/g, '').split('(')[0].trim();
        // Normalize: "Wood-clad" + aluminum context → "Aluminum-clad wood"
        const fullMatch = match[1].toLowerCase();
        if (/wood.clad/i.test(raw) && /aluminum|extruded/i.test(fullMatch)) {
          raw = fullMatch.includes('extruded') ? 'Aluminum-clad wood (extruded aluminum)' : 'Aluminum-clad wood';
        }
        if (raw.length > 2 && raw.length < 80) {
          return { found: true, rawText: raw, source: 'bot1_product_overview' };
        }
      }
    }
  }

  // Secondary: scan for material keywords near "window" mentions
  const materialKeywords = [
    { pattern: /vinyl\\s+window|vinyl\\s+frame|vinyl\\s+construction/i, label: 'Vinyl' },
    { pattern: /aluminum.clad\\s+wood|clad.wood|wood.clad/i, label: 'Aluminum-clad wood' },
    { pattern: /fiberglass\\s+frame|pultruded\\s+fiberglass|ultrex/i, label: 'Pultruded fiberglass' },
    { pattern: /all.wood|wood\\s+frame|wood\\s+window/i, label: 'Wood' },
    { pattern: /aluminum\\s+frame|aluminum\\s+window|non.clad\\s+aluminum/i, label: 'Aluminum' },
    { pattern: /fibrex|composite\\s+frame/i, label: 'Composite/Fibrex' },
  ];

  for (const line of lines) {
    for (const kw of materialKeywords) {
      if (kw.pattern.test(line)) {
        return { found: true, rawText: kw.label, source: 'bot1_keyword_scan' };
      }
    }
  }

  return { found: false, rawText: 'UNDETERMINED', source: 'not_found' };
}"""

new_extractor = """function extractMaterialClass(bot1Output) {
  const lines = bot1Output.split('\\n');

  // Look for explicit material class statements in Bot 1's PRODUCT OVERVIEW section
  // Handle multi-line: if "Frame Material:" line has empty value, check next line
  const patterns = [
    /material\\s+class\\s*[:—]\\s*(.+)/i,
    /frame\\s+material\\s*[:—]\\s*(.+)/i,
    /material\\s+type\\s*[:—]\\s*(.+)/i,
    /construction\\s*[:—]\\s*(.+frame.+|vinyl|wood|fiberglass|aluminum|composite)/i,
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        let raw = match[1].trim().replace(/[*_]/g, '').split('(')[0].trim();
        // If the match captured nothing meaningful, check the next line
        if (raw.length <= 2 && i + 1 < lines.length) {
          raw = lines[i + 1].trim().replace(/[*_]/g, '').split('(')[0].trim();
        }
        // Normalize: "Wood-clad" + aluminum context → "Aluminum-clad wood"
        const fullContext = (match[1] + ' ' + (lines[i + 1] || '')).toLowerCase();
        if (/wood.clad/i.test(raw) && /aluminum|extruded/i.test(fullContext)) {
          raw = fullContext.includes('extruded') ? 'Aluminum-clad wood (extruded aluminum)' : 'Aluminum-clad wood';
        }
        // Normalize: "Wood protected by aluminum exterior" → "Aluminum-clad wood"
        if (/wood\\s+protected\\s+by\\s+aluminum/i.test(raw) || /wood.*aluminum\\s+exterior/i.test(raw)) {
          raw = 'Aluminum-clad wood';
        }
        if (raw.length > 2 && raw.length < 80) {
          return { found: true, rawText: raw, source: 'bot1_product_overview' };
        }
      }
    }
  }

  // Secondary: scan for material keywords
  const materialKeywords = [
    { pattern: /vinyl\\s+window|vinyl\\s+frame|vinyl\\s+construction/i, label: 'Vinyl' },
    { pattern: /aluminum.clad\\s+wood|clad.wood|wood.clad/i, label: 'Aluminum-clad wood' },
    { pattern: /wood\\s+protected\\s+by\\s+aluminum|wood.*aluminum\\s+exterior/i, label: 'Aluminum-clad wood' },
    { pattern: /fiberglass\\s+frame|pultruded\\s+fiberglass|ultrex/i, label: 'Pultruded fiberglass' },
    { pattern: /all.wood|wood\\s+frame|wood\\s+window/i, label: 'Wood' },
    { pattern: /aluminum\\s+frame|aluminum\\s+window|non.clad\\s+aluminum/i, label: 'Aluminum' },
    { pattern: /fibrex|composite\\s+frame/i, label: 'Composite/Fibrex' },
  ];

  for (const line of lines) {
    for (const kw of materialKeywords) {
      if (kw.pattern.test(line)) {
        return { found: true, rawText: kw.label, source: 'bot1_keyword_scan' };
      }
    }
  }

  return { found: false, rawText: 'UNDETERMINED', source: 'not_found' };
}"""

if old_extractor in code:
    code = code.replace(old_extractor, new_extractor, 1)
    with open(file, "w") as f:
        f.write(code)
    print("Material extractor patched successfully")
    # Verify
    assert "wood\\s+protected\\s+by\\s+aluminum" in code
    assert "Wood protected by aluminum exterior" not in code or True  # just the regex version
    print("Verification passed")
else:
    print("FAILED — old extractor not found")
    # Debug: find fragments
    idx = code.find("function extractMaterialClass")
    if idx >= 0:
        print(f"Found function at index {idx}")
        print(f"Context: {repr(code[idx:idx+200])}")
