/**
 * Retail price estimates for the Fabrio catalogue (UGX).
 * Used by scripts/seed-product-prices.js and scripts/seed-catalogue.js
 */

const WHOLESALE_RATIO = 0.72

const SUBCATEGORY_RETAIL = {
  'Lubricants & Adhesives': 18_000,
  'Saws & Cutting Tools': 28_000,
  'Digging & Garden Tools': 42_000,
  'Levels & Measuring Tools': 32_000,
  'Fasteners & Fixings': 14_000,
  'Hand Tools & Scrapers': 24_000,
  'Trowels & Masonry Tools': 28_000,
  'Cleaning & Janitorial': 22_000,
  'Electrical Accessories': 38_000,
  'Abrasives & Surface Prep': 9_000,
  'Paint & Painting Supplies': 32_000,
  'Plumbing & Pipe Fittings': 16_000,
  'Building Line & Setting Out': 14_000,
  'Spanners & Wrenches': 30_000,
  'Padlocks & Security': 48_000,
  'Welding Supplies': 38_000,
  'Site Supplies & Sundries': 95_000,
  'Hearing Protection': 28_000,
  'Rainwear & Weatherproof Clothing': 65_000,
  'Reflective & High-Visibility Jackets': 85_000,
  'Safety Footwear': 195_000,
  Gloves: 18_000,
  'Helmets & Head Protection': 48_000,
  'Eye & Face Protection': 25_000,
  'Respiratory Protection': 38_000,
  'Warning & Site Safety': 48_000,
  'Workwear & Uniforms': 105_000,
  'First Aid & Fire Safety': 165_000,
  'Waste Management': 135_000,
}

/** Exact retail prices (UGX) where catalogue items need fixed values */
const SKU_RETAIL = {
  'gh-wd40': 22_000,
  'gh-silicon-tube': 12_000,
  'gh-industrial-silicon': 18_000,
  'gh-hacksaw-frame': 28_000,
  'gh-hacksaw-blades': 8_000,
  'gh-bowsaw-frame': 35_000,
  'gh-bowsaw-blades': 12_000,
  'gh-cutting-disc-7in': 9_000,
  'gh-cutting-disc-4-5in': 7_000,
  'gh-paper-cutter': 6_000,
  'gh-tin-snip-cutters': 42_000,
  'gh-pick-axe': 65_000,
  'gh-hoe-head': 38_000,
  'gh-panga-19in': 45_000,
  'gh-panga-18in': 42_000,
  'gh-slashers': 55_000,
  'gh-steel-handle-spades': 48_000,
  'gh-spirit-level-1ft': 28_000,
  'gh-spirit-level-1-5ft': 35_000,
  'gh-spirit-level-2ft': 42_000,
  'gh-water-level-s': 22_000,
  'gh-water-level-b': 32_000,
  'gh-plumb-bob': 18_000,
  'gh-try-square-6in': 24_000,
  'gh-try-square-10in': 32_000,
  'gh-tape-lak-3m': 18_000,
  'gh-tape-lak-5m': 22_000,
  'gh-tape-lak-7-5m': 28_000,
  'gh-tape-orange-30m': 85_000,
  'gh-tape-orange-50m': 115_000,
  'gh-tape-50m-blue': 115_000,
  'gh-tape-50m-maroon': 115_000,
  'gh-tape-30m-green': 85_000,
  'gh-concrete-nails-1-5in': 12_000,
  'gh-concrete-nails-2in': 14_000,
  'gh-concrete-nails-3in': 16_000,
  'gh-roofing-nails': 15_000,
  'gh-nails-1-5in': 8_000,
  'gh-nails-2in': 9_000,
  'gh-nails-3in': 11_000,
  'gh-nails-4in': 13_000,
  'gh-nails-6in': 16_000,
  'gh-screws-1in': 10_000,
  'gh-screws-1-5in': 12_000,
  'gh-screws-2in': 14_000,
  'gh-hinges-2in': 8_000,
  'gh-hinges-3in': 10_000,
  'gh-hinges-4in': 12_000,
  'gh-gate-latch-8in': 28_000,
  'gh-pad-belt': 18_000,
  'gh-screwdriver-4in': 12_000,
  'gh-screwdriver-6in': 15_000,
  'gh-screwdriver-changer': 18_000,
  'gh-scraper-3in': 14_000,
  'gh-scraper-4in': 16_000,
  'gh-filer-8in': 22_000,
  'gh-filer-10in': 28_000,
  'gh-chisel-set-red': 85_000,
  'gh-chisel-set-blue': 85_000,
  'gh-trowel-6in': 22_000,
  'gh-trowel-7in': 25_000,
  'gh-trowel-8in': 28_000,
  'gh-building-square': 32_000,
  'gh-plastering-trowel': 28_000,
  'gh-soft-broom-s': 18_000,
  'gh-squeezer-s': 22_000,
  'gh-hard-brush-s': 15_000,
  'gh-hard-brush-b': 22_000,
  'gh-mopper-s': 35_000,
  'gh-mop-head-sdb01': 18_000,
  'gh-mop-head-sdb02': 20_000,
  'gh-rubber-squeezer-s01': 28_000,
  'gh-broom-br001': 25_000,
  'gh-brush-bs001': 16_000,
  'gh-mk-single': 28_000,
  'gh-mk-double': 42_000,
  'gh-insulation-tape': 6_000,
  'gh-extension-4way': 65_000,
  'gh-extension-6way': 85_000,
  'gh-sandpaper-p60': 5_000,
  'gh-sandpaper-p80': 5_000,
  'gh-sandpaper-p120': 5_000,
  'gh-art-brush': 8_000,
  'gh-baby-roller': 12_000,
  'gh-baby-roller-4in-wiseup': 14_000,
  'gh-roller-9in-acron': 18_000,
  'gh-roller-9in-robinson': 18_000,
  'gh-roller-9in-wiseup': 18_000,
  'gh-paint-brush-1in': 6_000,
  'gh-paint-brush-2in': 8_000,
  'gh-paint-brush-3in': 10_000,
  'gh-paint-brush-4in': 12_000,
  'gh-budget-emulsion-undercoat-20l': 285_000,
  'gh-budget-emulsion-undercoat-4l': 78_000,
  'gh-budget-emulsion-matt-20l': 295_000,
  'gh-budget-gloss-4l': 125_000,
  'gh-budget-gloss-1l': 38_000,
  'gh-wood-paint-mahogany': 48_000,
  'gh-wood-paint-clear': 45_000,
  'gh-vinyl-matt-20l': 385_000,
  'gh-vinyl-matt-4l': 105_000,
  'gh-vinyl-silk-20l': 425_000,
  'gh-vinyl-silk-4l': 115_000,
  'gh-white-spirit-5l': 42_000,
  'gh-spray-paint': 22_000,
  'gh-thread-tape-s': 4_000,
  'gh-thread-tape-b': 6_000,
  'gh-pipe-hammers': 55_000,
  'gh-building-line-s': 12_000,
  'gh-building-line-b': 18_000,
  'gh-spanner-8mm': 12_000,
  'gh-spanner-10mm': 14_000,
  'gh-spanner-11mm': 15_000,
  'gh-spanner-12mm': 16_000,
  'gh-spanner-13mm': 17_000,
  'gh-spanner-14mm': 18_000,
  'gh-spanner-15mm': 19_000,
  'gh-spanner-17mm': 22_000,
  'gh-spanner-18mm': 24_000,
  'gh-spanner-19mm': 25_000,
  'gh-spanner-21mm': 28_000,
  'gh-spanner-22mm': 30_000,
  'gh-spanner-24mm': 34_000,
  'gh-spanner-28mm': 40_000,
  'gh-spanner-34mm': 48_000,
  'gh-spanner-36mm': 52_000,
  'gh-ring-spanner-30x32': 38_000,
  'gh-spanner-set-a': 145_000,
  'gh-spanner-set-b': 145_000,
  'gh-buckler-50g': 35_000,
  'gh-mindy-70ng': 42_000,
  'gh-mindy-70g': 45_000,
  'gh-casa-94mm': 55_000,
  'gh-baoling-100mm': 62_000,
  'gh-stelar-60mm': 38_000,
  'gh-stelar-70mm': 42_000,
  'gh-solte-70mm': 40_000,
  'gh-padlock-32x38x50': 28_000,
  'gh-casa-40x50x60': 48_000,
  'gh-ara-circle-32x38x50': 32_000,
  'gh-welding-rods-6013-a': 35_000,
  'gh-welding-rods-6013-b': 35_000,
  'gh-novical-250g': 18_000,
  'gh-shade-net-g95': 580_000,
  'gh-shade-net-g105': 620_000,
  'gh-yellow-sisal-1ply': 45_000,
  'ppe-ear-muffs': 42_000,
  'ppe-ear-plug': 8_000,
  'ppe-silicon-ear-plug': 12_000,
  'ppe-raincoat-adult': 55_000,
  'ppe-raincoat-kids': 38_000,
  'ppe-rain-suit-black': 125_000,
  'ppe-rain-suit-navy': 125_000,
  'ppe-refl-jacket-blue-p': 95_000,
  'ppe-refl-jacket-black-p': 95_000,
  'ppe-refl-jacket-mixed': 88_000,
  'ppe-refl-jacket-lemon-p': 95_000,
  'ppe-refl-jacket-orange-p': 95_000,
  'ppe-refl-jacket-ord-orange': 65_000,
  'ppe-refl-jacket-ord-lemon': 65_000,
  'ppe-refl-jacket-ord-blue': 65_000,
  'ppe-refl-jacket-ord-maroon': 65_000,
  'ppe-refl-jacket-net': 55_000,
  'ppe-press-jackets': 75_000,
  'ppe-shoes-horse-power': 245_000,
  'ppe-shoes-safety-boy': 185_000,
  'ppe-shoes-safety-jogger': 265_000,
  'ppe-shoes-rocklander': 195_000,
  'ppe-shoes-tjm': 175_000,
  'ppe-gumboots-yellow': 85_000,
  'ppe-gumboots-black': 82_000,
  'ppe-gumboots-ordinary': 65_000,
  'ppe-gloves-pvc-red': 15_000,
  'ppe-gloves-pvc-blue': 15_000,
  'ppe-gloves-pvc-black': 15_000,
  'ppe-gloves-pvc-green': 15_000,
  'ppe-gloves-300-yellow': 12_000,
  'ppe-gloves-300-black': 12_000,
  'ppe-gloves-leather': 28_000,
  'ppe-gloves-black': 10_000,
  'ppe-gloves-blue': 10_000,
  'ppe-gloves-grey': 10_000,
  'ppe-gloves-single-dot': 14_000,
  'ppe-gloves-double-dot': 16_000,
  'ppe-gloves-welding': 45_000,
  'ppe-gloves-riding-full': 55_000,
  'ppe-gloves-riding-half': 38_000,
  'ppe-gloves-riding-gym': 32_000,
  'ppe-helmet-vented': 52_000,
  'ppe-helmet-rocky': 42_000,
  'ppe-helmet-rocky-orange': 45_000,
  'ppe-glasses-clear': 18_000,
  'ppe-glasses-dark': 20_000,
  'ppe-glasses-dark-imperial': 25_000,
  'ppe-welding-goggles': 35_000,
  'ppe-welding-shield': 48_000,
  'ppe-mask-double-canister': 125_000,
  'ppe-mask-single-canister': 85_000,
  'ppe-mask-afton': 12_000,
  'ppe-warning-tape-300m': 85_000,
  'ppe-warning-tape-500m': 125_000,
  'ppe-caution-warning': 35_000,
  'ppe-caution-wet-floor': 42_000,
  'ppe-caution-men-at-work': 42_000,
  'ppe-welding-aprons': 65_000,
  'ppe-overalls-flyton': 115_000,
  'ppe-uniform-yellow': 95_000,
  'ppe-uniform-orange': 95_000,
  'ppe-uniform-orange-grey': 98_000,
  'ppe-uniform-grey': 88_000,
  'ppe-uniform-grey-black': 92_000,
  'ppe-uniform-orange-line-black': 98_000,
  'ppe-overcoats-flyton': 125_000,
  'ppe-white-overcoat': 75_000,
  'ppe-riding-suits': 185_000,
  'ppe-reflective-belts': 22_000,
  'ppe-knee-elbow-guard': 55_000,
  'ppe-first-aid-25p': 195_000,
  'ppe-fire-ext-6kg': 285_000,
  'ppe-fire-ext-9kg': 385_000,
  'ppe-bin-100l-green': 145_000,
  'ppe-bin-100l-red': 145_000,
  'ppe-bin-120l-blue': 165_000,
  'SV-ANSI-2-ORG': 48_000,
}

/** Legacy demo products outside the markdown catalogue */
const NAME_RETAIL = {
  'Claw Hammer 16oz': 22_000,
  'Cordless Drill Driver 18V': 125_000,
  'Hard Hat Yellow OSHA Compliant': 48_000,
  'Reflective Safety Vest': 48_000,
  'Safety Glasses Anti-Fog': 22_000,
  'Steel Toe Work Boots': 195_000,
  'Work Gloves Nitrile Dipped': 18_000,
}

function roundPrice(amount) {
  if (amount < 10_000) return Math.max(3_000, Math.round(amount / 500) * 500)
  if (amount < 100_000) return Math.round(amount / 1_000) * 1_000
  return Math.round(amount / 5_000) * 5_000
}

function getNameMultiplier(name) {
  const n = name.toLowerCase()

  if (n.includes('20ltr') || n.includes('20l')) return 9
  if (n.includes('4ltr') || n.includes('4l')) return 2.8
  if (n.includes('1ltr') || n.includes('1l')) return 1
  if (n.includes('5ltr') || n.includes('5l')) return 1.6
  if (n.includes('shade net')) return 6.5
  if (n.includes('500m')) return 2.8
  if (n.includes('300m')) return 2
  if (n.includes('fire extinguisher')) return 1.8
  if (n.includes('first aid')) return 1.2
  if (n.includes('gumboot') || n.includes('shoes')) return 1
  if (n.includes('set')) return 2.5
  if (n.includes('extension')) return 2.2
  if (n.includes('50m')) return 3.5
  if (n.includes('30m')) return 2.5
  if (n.includes('7.5m')) return 1.4
  if (n.includes('premium')) return 1.2
  if (n.includes('ordinary')) return 0.85

  const mmMatch = n.match(/(\d+)mm/)
  if (mmMatch && n.includes('spanner')) {
    const mm = Number(mmMatch[1])
    return 0.35 + mm * 0.045
  }

  return 1
}

function computeRetailPrice(product) {
  if (SKU_RETAIL[product.sku]) {
    return SKU_RETAIL[product.sku]
  }

  if (NAME_RETAIL[product.name]) {
    return NAME_RETAIL[product.name]
  }

  const base = SUBCATEGORY_RETAIL[product.subcategory] ?? 25_000
  const raw = base * getNameMultiplier(product.name)
  return roundPrice(raw)
}

function computeProductPrices(product) {
  const retailPrice = computeRetailPrice(product)
  const wholesalePrice = roundPrice(retailPrice * WHOLESALE_RATIO)

  return {
    retailPrice,
    wholesalePrice,
    basePrice: retailPrice,
  }
}

module.exports = {
  WHOLESALE_RATIO,
  SUBCATEGORY_RETAIL,
  SKU_RETAIL,
  computeProductPrices,
  computeRetailPrice,
  roundPrice,
}