import fs from 'fs'
import path from 'path'

export interface PartnerBrand {
  name: string
  slug: string
  logo: string
}

const LOGO_EXTENSIONS = ['.webp', '.svg', '.png', '.jpg', '.jpeg'] as const

const EXT_PRIORITY: Record<string, number> = {
  '.webp': 5,
  '.svg': 4,
  '.png': 3,
  '.jpg': 2,
  '.jpeg': 2,
}

/** Older filenames that map to a preferred canonical slug */
const SLUG_ALIASES: Record<string, string> = {
  'tororo-cement': 'tororo',
  'hima-cement': 'hima',
  'steel-and-tube': 'steeltube',
  'uganda-baati': 'baati',
  dewalt: 'dewalt-1',
}

/** Corrupt, blank, wrong, or text-only document images — never use */
const BLOCKED_FILES = new Set([
  'crown-paints.jpg',
  'dewalt.png',
  'dong-cheng.png',
  'hima-cement.jpg',
  'ingco.jpg',
  'kampala-cement.jpg',
  'metro-cement.jpg',
  'roofings.jpg',
  'tororo.webp',
])

/**
 * Brands excluded from the ticker: no usable graphic logo on disk, or only
 * plain text / blank placeholders.
 */
const EXCLUDED_SLUGS = new Set([
  'bosch',
  'chint',
  'crown-paints',
  'dong-cheng',
  'ingco',
  'kampala-cement',
  'metro-cement',
  'plascon',
  'stihl',
  'wadfow',
])

/** When multiple files exist, prefer these over automatic scoring */
const PREFERRED_FILES: Record<string, string> = {
  baati: 'baati.webp',
  'dewalt-1': 'dewalt-1.webp',
  hima: 'hima.webp',
  roofings: 'roofings.webp',
  steeltube: 'steeltube.webp',
  tororo: 'tororo-cement.png',
}

/**
 * Only brands relevant to industrial hardware, tools, building materials,
 * paints, and construction electrical. Excludes automotive, sanitaryware, etc.
 */
const HARDWARE_BRAND_SLUGS = new Set([
  // Hand & power tools
  'bahco',
  'black-decker',
  'dewalt-1',
  'makita',
  'stanley',
  // Building materials
  'baati',
  'brazafric',
  'hima',
  'roofings',
  'simba',
  'steeltube',
  'tororo',
  // Construction electrical
  'schneider-electric',
])

const DISPLAY_NAMES: Record<string, string> = {
  baati: 'Uganda Baati',
  bahco: 'Bahco',
  'black-decker': 'Black+Decker',
  brazafric: 'Brazafric',
  'dewalt-1': 'DeWalt',
  hima: 'Hima Cement',
  makita: 'Makita',
  roofings: 'Roofings',
  'schneider-electric': 'Schneider Electric',
  simba: 'Simba Cement',
  stanley: 'Stanley',
  steeltube: 'Steel & Tube',
  tororo: 'Tororo Cement',
}

const MIN_LOGO_BYTES: Record<string, number> = {
  '.svg': 400,
  default: 800,
}

function formatBrandName(slug: string): string {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function getBrandsDir(): string {
  return path.join(process.cwd(), 'public', 'brands')
}

function scoreLogoFile(file: string, ext: string, size: number): number {
  const minBytes = MIN_LOGO_BYTES[ext] ?? MIN_LOGO_BYTES.default
  if (BLOCKED_FILES.has(file) || size < minBytes) return -1
  const formatBonus = EXT_PRIORITY[ext] ?? 0
  return size + formatBonus * 50
}

function discoverBrandLogos(): PartnerBrand[] {
  const brandsDir = getBrandsDir()
  if (!fs.existsSync(brandsDir)) return []

  const files = fs
    .readdirSync(brandsDir)
    .filter((file) => {
      if (file.startsWith('.')) return false
      const ext = path.extname(file).toLowerCase()
      return LOGO_EXTENSIONS.includes(ext as (typeof LOGO_EXTENSIONS)[number])
    })

  const candidatesBySlug = new Map<string, Array<{ file: string; score: number }>>()

  for (const file of files) {
    if (BLOCKED_FILES.has(file)) continue

    const ext = path.extname(file).toLowerCase()
    const rawSlug = path.basename(file, ext)
    const slug = SLUG_ALIASES[rawSlug] ?? rawSlug
    const filePath = path.join(brandsDir, file)
    const size = fs.statSync(filePath).size
    const score = scoreLogoFile(file, ext, size)
    if (score < 0) continue

    const existing = candidatesBySlug.get(slug) ?? []
    existing.push({ file, score })
    candidatesBySlug.set(slug, existing)
  }

  return [...candidatesBySlug.entries()]
    .filter(([slug]) => HARDWARE_BRAND_SLUGS.has(slug) && !EXCLUDED_SLUGS.has(slug))
    .map(([slug, candidates]) => {
      const preferred = PREFERRED_FILES[slug]
      const preferredCandidate = preferred
        ? candidates.find((candidate) => candidate.file === preferred)
        : undefined
      const best = preferredCandidate ?? candidates.sort((a, b) => b.score - a.score)[0]

      if (!best) return null

      return {
        slug,
        name: DISPLAY_NAMES[slug] ?? formatBrandName(slug),
        logo: `/brands/${best.file}`,
      }
    })
    .filter((brand): brand is PartnerBrand => brand !== null)
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function getPartnerBrands(): PartnerBrand[] {
  return discoverBrandLogos()
}