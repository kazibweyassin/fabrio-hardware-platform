/**
 * Downloads partner brand logos into public/brands/
 * Run: npm run brands:fetch-logos
 * Manual: drop files into public/brands/{slug}.png|.svg|.webp
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const brandsDir = path.join(__dirname, '..', 'public', 'brands')

const SIMPLE_ICON_SLUGS = {
  bosch: 'bosch',
  makita: 'makita',
  dewalt: 'dewalt',
  stanley: 'stanley',
  'black-decker': ['blackdeckercorporation', 'stanleyblackanddecker'],
  honda: 'honda',
  stihl: 'stihl',
  'schneider-electric': 'schneiderelectric',
}

const WIKIMEDIA_SEARCH = {
  'tororo-cement': 'Tororo Cement logo',
  'hima-cement': 'Hima Cement logo',
  'simba-cement': 'Simba Cement Uganda logo',
  roofings: 'Roofings Group logo',
  'uganda-baati': 'Uganda Baati logo',
  ingco: 'INGCO logo',
  makita: 'Makita logo',
  dewalt: 'DeWalt logo',
  stihl: 'Stihl logo',
  stanley: 'Stanley Tools logo',
  'black-decker': 'Black Decker logo',
  'crown-paints': 'Crown Paints logo',
  'simba-cement': 'Simba Cement logo',
  'kampala-cement': 'Kampala Cement logo',
  'metro-cement': 'Metro Cement Uganda logo',
  'steel-and-tube': 'Steel and Tube logo',
  'uganda-clays': 'Uganda Clays logo',
  'total-tools': 'Total Tools logo',
}

const DIRECT_LOGO_URLS = {
  'tororo-cement': [
    'https://www.tororocement.com/wp-content/uploads/2019/05/tororo-cement-logo.png',
    'https://www.tororocement.com/wp-content/uploads/2018/06/logo.png',
  ],
  'hima-cement': [
    'https://www.himacement.co.ug/wp-content/uploads/2020/06/hima-cement-logo.png',
    'https://www.himacement.co.ug/wp-content/uploads/2019/05/cropped-hima-logo.png',
  ],
  'simba-cement': [
    'https://www.nationalcement.co.ug/wp-content/uploads/2021/03/Simba-Cement-Logo.png',
  ],
  roofings: [
    'https://www.roofingsgroup.com/images/logo.png',
    'https://www.roofingsgroup.com/templates/roofings/images/logo.png',
  ],
  'uganda-baati': [
    'https://ugandabaati.com/wp-content/uploads/2019/05/uganda-baati-logo.png',
    'https://ugandabaati.com/wp-content/uploads/2020/01/logo.png',
  ],
  'uganda-clays': [
    'https://www.ugandaclays.com/images/logo.png',
  ],
  'crown-paints': [
    'https://www.crownpaints.co.ug/wp-content/uploads/2020/01/crown-paints-logo.png',
  ],
  ingco: [
    'https://www.ingco.com/static/images/logo.png',
    'https://ingco.com/Public/Home/images/logo.png',
  ],
}

const FAVICON_DOMAINS = {
  'tororo-cement': 'tororocement.com',
  'simba-cement': 'nationalcement.co.ug',
  'kampala-cement': 'kampalacement.co.ug',
  'metro-cement': 'metrocement.co.ug',
  'uganda-baati': 'ugandabaati.com',
  'steel-and-tube': 'steelandtube.co.ug',
  'uganda-clays': 'ugandaclays.com',
  'crown-paints': 'crownpaints.co.ug',
  'total-tools': 'totaltools.co.za',
  'dong-cheng': 'dongchengtool.com',
  wadfow: 'wadfow.com',
  makita: 'makita.com',
  dewalt: 'dewalt.com',
  stihl: 'stihl.com',
  stanley: 'stanleytools.com',
  'black-decker': 'blackanddecker.com',
}

const PARTNER_SLUGS = [
  'tororo-cement',
  'hima-cement',
  'simba-cement',
  'kampala-cement',
  'metro-cement',
  'roofings',
  'uganda-baati',
  'steel-and-tube',
  'uganda-clays',
  'crown-paints',
  'ingco',
  'total-tools',
  'dong-cheng',
  'wadfow',
  'bosch',
  'makita',
  'dewalt',
  'stanley',
  'black-decker',
  'honda',
  'stihl',
  'schneider-electric',
]

function ensureDir() {
  fs.mkdirSync(brandsDir, { recursive: true })
}

function logoExists(slug) {
  return ['.svg', '.png', '.webp', '.jpg', '.jpeg'].some((ext) =>
    fs.existsSync(path.join(brandsDir, `${slug}${ext}`)),
  )
}

function extFromContentType(contentType = '', url = '') {
  if (contentType.includes('svg')) return '.svg'
  if (contentType.includes('png')) return '.png'
  if (contentType.includes('webp')) return '.webp'
  if (contentType.includes('jpeg') || contentType.includes('jpg')) return '.jpg'
  if (url.endsWith('.svg')) return '.svg'
  if (url.endsWith('.png')) return '.png'
  if (url.endsWith('.webp')) return '.webp'
  return '.png'
}

async function downloadUrl(url, slug, forceExt) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'FabrioHardware/1.0 (brand-logo-fetch)' },
    signal: AbortSignal.timeout(15000),
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.length < 200) {
    throw new Error('File too small')
  }

  const ext = forceExt ?? extFromContentType(response.headers.get('content-type'), url)
  const outPath = path.join(brandsDir, `${slug}${ext}`)
  fs.writeFileSync(outPath, buffer)
  return outPath
}

async function tryDirectUrls(slug, urls) {
  let lastError = new Error('No URLs tried')
  for (const url of urls) {
    try {
      return await downloadUrl(url, slug)
    } catch (error) {
      lastError = error
    }
  }
  throw lastError
}

async function trySimpleIcon(slug, iconSlug) {
  const candidates = Array.isArray(iconSlug) ? iconSlug : [iconSlug]
  let lastError = new Error('No icon slugs tried')

  for (const candidate of candidates) {
    for (const base of [
      `https://cdn.simpleicons.org/${candidate}`,
      `https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/${candidate}.svg`,
    ]) {
      try {
        return await downloadUrl(base, slug, '.svg')
      } catch (error) {
        lastError = error
      }
    }
  }

  throw lastError
}

async function tryWikimedia(slug, query) {
  const api = new URL('https://commons.wikimedia.org/w/api.php')
  api.searchParams.set('action', 'query')
  api.searchParams.set('format', 'json')
  api.searchParams.set('generator', 'search')
  api.searchParams.set('gsrsearch', query)
  api.searchParams.set('gsrnamespace', '6')
  api.searchParams.set('gsrlimit', '5')
  api.searchParams.set('prop', 'imageinfo')
  api.searchParams.set('iiprop', 'url|mime')
  api.searchParams.set('iiurlwidth', '320')

  const response = await fetch(api, {
    headers: { 'User-Agent': 'FabrioHardware/1.0 (brand-logo-fetch)' },
    signal: AbortSignal.timeout(15000),
  })

  if (!response.ok) {
    throw new Error(`Wikimedia HTTP ${response.status}`)
  }

  const data = await response.json()
  const pages = data?.query?.pages ?? {}
  const files = Object.values(pages)
    .map((page) => page.imageinfo?.[0])
    .filter(Boolean)

  for (const file of files) {
    const url = file.thumburl || file.url
    if (!url) continue
    try {
      return await downloadUrl(url, slug)
    } catch {
      // try next result
    }
  }

  throw new Error('No usable Wikimedia result')
}

async function tryFavicon(slug, domain) {
  const url = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
  return downloadUrl(url, slug)
}

async function fetchBrand(slug) {
  if (logoExists(slug)) {
    return { slug, status: 'skipped', detail: 'already exists' }
  }

  const attempts = []

  if (SIMPLE_ICON_SLUGS[slug]) {
    attempts.push({
      label: 'simple-icons',
      run: () => trySimpleIcon(slug, SIMPLE_ICON_SLUGS[slug]),
    })
  }

  if (WIKIMEDIA_SEARCH[slug]) {
    attempts.push({
      label: 'wikimedia',
      run: () => tryWikimedia(slug, WIKIMEDIA_SEARCH[slug]),
    })
  }

  if (DIRECT_LOGO_URLS[slug]) {
    attempts.push({
      label: 'direct',
      run: () => tryDirectUrls(slug, DIRECT_LOGO_URLS[slug]),
    })
  }

  if (FAVICON_DOMAINS[slug]) {
    attempts.push({
      label: 'favicon',
      run: () => tryFavicon(slug, FAVICON_DOMAINS[slug]),
    })
  }

  for (const attempt of attempts) {
    try {
      const file = await attempt.run()
      return { slug, status: 'ok', detail: `${attempt.label} → ${path.basename(file)}` }
    } catch {
      // try next source
    }
  }

  return { slug, status: 'manual', detail: `add public/brands/${slug}.png` }
}

async function main() {
  ensureDir()

  console.log('Fetching brand logos into public/brands/\n')

  const results = []
  for (const slug of PARTNER_SLUGS) {
    const result = await fetchBrand(slug)
    results.push(result)
    const icon = result.status === 'ok' ? '✓' : result.status === 'skipped' ? '·' : result.status === 'manual' ? '!' : '✗'
    console.log(`${icon} ${slug.padEnd(22)} ${result.detail}`)
  }

  const ok = results.filter((r) => r.status === 'ok').length
  const manual = results.filter((r) => r.status === 'manual' || r.status === 'fail')

  console.log(`\nDone: ${ok} downloaded, ${manual.length} need manual logos.`)
  if (manual.length > 0) {
    console.log('\nTo add missing logos manually:')
    console.log('  1. Open the brand website and save their logo image')
    console.log('  2. Or search: "{brand name} logo png"')
    console.log('  3. Save as public/brands/{slug}.png')
    console.log('\nMissing:')
    for (const item of manual) {
      console.log(`  - ${item.slug}`)
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})