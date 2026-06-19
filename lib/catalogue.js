const fs = require('fs')
const path = require('path')

const CATALOGUE_CATEGORIES = [
  {
    name: 'General Hardware',
    description: 'Industrial hardware, tools, fasteners, paint, and building supplies',
  },
  {
    name: 'Personal Protective Equipment (PPE)',
    description: 'Safety gear, workwear, helmets, gloves, and site protection',
  },
]

function parseCatalogueMarkdown(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const products = []
  let currentCategory = ''
  let currentSubcategory = ''

  for (const line of content.split('\n')) {
    const categoryMatch = line.match(/^## Category \d+: (.+)$/)
    if (categoryMatch) {
      currentCategory = categoryMatch[1].trim()
      continue
    }

    const subcategoryMatch = line.match(/^### Subcategory: (.+)$/)
    if (subcategoryMatch) {
      currentSubcategory = subcategoryMatch[1].trim()
      continue
    }

    if (!line.startsWith('|') || line.includes('----') || line.includes('ID | Name')) {
      continue
    }

    const parts = line
      .split('|')
      .map((part) => part.trim())
      .filter(Boolean)

    if (parts.length < 3) continue

    const catalogId = parts[0]
    if (!/^(GH|PPE)-/.test(catalogId)) continue

    products.push({
      catalogId,
      name: parts[1],
      sku: parts[2],
      category: currentCategory,
      subcategory: currentSubcategory,
    })
  }

  return products
}

function getCatalogueProducts() {
  const cataloguePath = path.join(process.cwd(), 'product_catalogue.md')
  return parseCatalogueMarkdown(cataloguePath)
}

module.exports = {
  CATALOGUE_CATEGORIES,
  getCatalogueProducts,
  parseCatalogueMarkdown,
}