// Spec Sheet Parser
// Extracts products from spec sheets across 16 categories
// Used by IMAP monitor and manual upload handler

const CATEGORIES = [
  'Windows',
  'Cabinets',
  'Countertops',
  'Flooring',
  'Faucets',
  'Sinks',
  'Toilets',
  'HVAC',
  'Range/Cooktop',
  'Oven',
  'Refrigerator',
  'Dishwasher',
  'Microwave',
  'Vent Hood',
  'Paint',
  'Hot water heater'
];

class SpecSheetParser {
  constructor() {
    this.categories = CATEGORIES;
    this.extractionPatterns = this.buildPatterns();
  }

  buildPatterns() {
    return {
      windows: {
        keywords: ['window', 'fenestration', 'glass door', 'sliding door', 'casement', 'double-hung'],
        brands: ['marvin', 'andersen', 'pella', 'jeld-wen', 'alpen', 'loewen', 'sierra pacific', 'internorm']
      },
      cabinets: {
        keywords: ['cabinet', 'cabinetry', 'kitchen cabinet', 'bathroom cabinet', 'vanity'],
        brands: ['plain & fancy', 'ultracraft', 'kraftmaid', 'thomasville', 'merillat', 'schrock']
      },
      countertops: {
        keywords: ['countertop', 'counter top', 'granite', 'quartz', 'laminate', 'butcher block', 'marble', 'slate'],
        brands: ['caesarstone', 'cambria', 'silestone', 'viatera', 'zodiaq']
      },
      flooring: {
        keywords: ['floor', 'flooring', 'hardwood', 'carpet', 'tile', 'laminate', 'vinyl', 'stone', 'wood floor'],
        brands: ['mohawk', 'pergo', 'armstrong', 'shaw', 'mullican', 'carlisle']
      },
      faucets: {
        keywords: ['faucet', 'sink faucet', 'kitchen faucet', 'bathroom faucet', 'tub faucet', 'shower faucet', 'fixture'],
        brands: ['kohler', 'moen', 'delta', 'grohe', 'hansgrohe', 'rohl', 'waterstone', 'newport brass']
      },
      sinks: {
        keywords: ['sink', 'kitchen sink', 'bathroom sink', 'vessel sink', 'undermount sink', 'drop-in sink'],
        brands: ['kohler', 'rohl', 'franke', 'elkay', 'blanco', 'native trails']
      },
      toilets: {
        keywords: ['toilet', 'water closet', 'commode', 'lavatory'],
        brands: ['kohler', 'toto', 'american standard', 'dxv', 'caroma']
      },
      hvac: {
        keywords: ['hvac', 'air conditioning', 'furnace', 'heat pump', 'air handler', 'conditioner', 'ductless'],
        brands: ['carrier', 'lennox', 'york', 'daikin', 'fujitsu', 'mitsubishi', 'trane']
      },
      rangeStove: {
        keywords: ['range', 'cooktop', 'stove', 'cooking range', 'gas cooktop', 'electric cooktop'],
        brands: ['wolf', 'viking', 'sub-zero', 'bluestar', 'thermador', 'lacanche', 'la cornue']
      },
      oven: {
        keywords: ['oven', 'wall oven', 'convection oven', 'steam oven', 'microwave oven'],
        brands: ['wolf', 'sub-zero', 'miele', 'thermador', 'bosch', 'siemens']
      },
      refrigerator: {
        keywords: ['refrigerator', 'fridge', 'built-in refrigerator', 'side-by-side', 'french door'],
        brands: ['sub-zero', 'miele', 'thermador', 'wolf', 'gaggenau']
      },
      dishwasher: {
        keywords: ['dishwasher', 'built-in dishwasher', 'drawer dishwasher'],
        brands: ['miele', 'bosch', 'siemens', 'thermador', 'sub-zero']
      },
      microwave: {
        keywords: ['microwave', 'microwave oven', 'convection microwave', 'over-the-range'],
        brands: ['miele', 'thermador', 'sub-zero', 'cove']
      },
      ventHood: {
        keywords: ['vent hood', 'range hood', 'ventilation', 'exhaust hood', 'chimney hood'],
        brands: ['wolf', 'sub-zero', 'best', 'vent-a-hood', 'zephyr']
      },
      paint: {
        keywords: ['paint', 'interior paint', 'exterior paint', 'finish', 'coating'],
        brands: ['benjamin moore', 'sherwin-williams', 'farrow & ball', 'pratt & lambert', 'fine paints of europe']
      },
      hotWaterHeater: {
        keywords: ['water heater', 'hot water', 'tankless water heater', 'water heating'],
        brands: ['rheem', 'ao smith', 'navien', 'rinnai', 'takagi', 'tankless']
      }
    };
  }

  parse(text) {
    /**
     * Parse spec sheet text and extract products by category
     * Returns: {
     *   extraction_summary: { category: count, ... },
     *   extracted_products: [
     *     { category, item, confidence, source_text },
     *     ...
     *   ],
     *   items_needing_review: [
     *     { text, reason, category_hint },
     *     ...
     *   ]
     * }
     */

    const results = {
      extraction_summary: {},
      extracted_products: [],
      items_needing_review: [],
      raw_matches: {}
    };

    // Initialize summary
    this.categories.forEach(cat => results.extraction_summary[cat] = 0);

    // Normalize text
    const normalizedText = text.toLowerCase();
    const lines = text.split('\n');

    // Scan for category mentions
    this.categories.forEach((category, idx) => {
      const categoryKey = Object.keys(this.extractionPatterns)[idx];
      const patterns = this.extractionPatterns[categoryKey];

      if (!patterns) return;

      const categoryMatches = [];

      // Search for keywords
      patterns.keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}s?\\b|\\b${keyword.replace(/s$/, '')}\\w+`, 'gi');
        let match;
        while ((match = regex.exec(text)) !== null) {
          const context = text.substring(
            Math.max(0, match.index - 50),
            Math.min(text.length, match.index + 150)
          );
          categoryMatches.push({
            keyword: match[0],
            context,
            confidence: 0.8
          });
        }
      });

      // Search for brand mentions
      patterns.brands.forEach(brand => {
        const regex = new RegExp(`\\b${brand}\\b`, 'gi');
        let match;
        while ((match = regex.exec(text)) !== null) {
          const context = text.substring(
            Math.max(0, match.index - 50),
            Math.min(text.length, match.index + 150)
          );
          categoryMatches.push({
            brand: match[0],
            context,
            confidence: 0.9  // Brands are high confidence
          });
        }
      });

      // Group and deduplicate matches for this category
      if (categoryMatches.length > 0) {
        results.extraction_summary[category] = categoryMatches.length;
        results.raw_matches[category] = categoryMatches;

        // High confidence: extract as products
        categoryMatches.forEach(m => {
          results.extracted_products.push({
            category,
            item: m.brand || m.keyword,
            confidence: m.confidence,
            source_text: m.context.trim()
          });
        });
      }
    });

    // Identify ambiguous or unreadable items
    // Look for model numbers, specifications without clear product names
    const ambiguousPatterns = [
      /model[\s:]+([A-Z0-9\-]+)/gi,
      /spec[\s:]+([^\n]+)/gi,
      /sku[\s:]+([A-Z0-9\-]+)/gi,
      /part[\s:]+([A-Z0-9\-]+)/gi
    ];

    ambiguousPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const itemText = match[1].substring(0, 50);
        // Only flag if we don't already have this item
        if (!results.extracted_products.some(p => p.item.includes(itemText))) {
          results.items_needing_review.push({
            text: itemText,
            reason: 'Model/spec number without clear product name',
            category_hint: this.guessCategory(itemText)
          });
        }
      }
    });

    // Count items needing review
    results.items_needing_review_count = results.items_needing_review.length;
    results.total_items_extracted = results.extracted_products.length;

    return results;
  }

  guessCategory(text) {
    /**
     * Heuristic: given a text fragment, guess which category it might belong to
     */
    const lower = text.toLowerCase();
    
    // Quick heuristics
    if (lower.includes('model') || lower.includes('spec')) {
      // Look for clues in surrounding context or pattern
      if (lower.match(/\d{2,4}[a-z]?/)) {
        // Could be any product. Return null for manual review
        return null;
      }
    }

    return null;
  }

  crossReference(extractedProducts, productCatalog) {
    /**
     * Cross-reference extracted products against the product catalog
     * Returns products found in catalog vs new/unscored products
     */

    const results = {
      found_in_catalog: [],
      new_products: [],
      already_scored: []
    };

    extractedProducts.forEach(extracted => {
      // Simple string matching against catalog
      const match = productCatalog.find(p =>
        p.product_name.toLowerCase().includes(extracted.item.toLowerCase()) ||
        extracted.item.toLowerCase().includes(p.product_name.toLowerCase())
      );

      if (match) {
        results.found_in_catalog.push({
          extracted,
          catalog_match: match,
          scored: !!match.overall_score
        });

        if (match.overall_score) {
          results.already_scored.push(match);
        }
      } else {
        results.new_products.push({
          category: extracted.category,
          product_name: extracted.item,
          needs_evaluation: true
        });
      }
    });

    return results;
  }
}

module.exports = SpecSheetParser;
