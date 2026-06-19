import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const brandsDir = path.join(__dirname, '..', 'public', 'brands')

const TARGETS = {
  'simba-cement': [
    'https://nccke.com/wp-content/uploads/2020/06/Simba-Cement-Logo.png',
    'https://nccke.com/wp-content/uploads/2019/05/simba-cement.png',
    'https://www.nationalcement.co.ug/wp-content/uploads/2021/03/Simba-Cement-Logo.png',
    'https://upload.wikimedia.org/wikipedia/en/thumb/8/8e/Simba_Cement_logo.svg/320px-Simba_Cement_logo.svg.png',
  ],
  'steel-and-tube': [
    'https://www.stil.co.ug/wp-content/uploads/2020/01/STIL-Logo.png',
    'https://www.stil.co.ug/wp-content/uploads/2019/06/logo.png',
    'https://cdn.brandfetch.io/stil.co.ug/logo',
  ],
  'uganda-clays': [
    'https://www.ugandaclays.com/images/ugcl_logo.png',
    'https://www.ugandaclays.com/images/logo.png',
    'https://ugandaclays.com/wp-content/uploads/2019/05/logo.png',
  ],
  'total-tools': [
    'https://www.totaltools.co.za/cdn/shop/files/Total_Tools_Logo_1.png',
    'https://seeklogo.com/images/T/total-tools-logo-8B5B5E5E5E-seeklogo.com.png',
    'https://cdn.brandfetch.io/totaltools.co.za/logo',
  ],
}

async function download(slug, url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 FabrioHardware/1.0' },
    signal: AbortSignal.timeout(20000),
    redirect: 'follow',
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < 300) throw new Error('too small')
  const ct = res.headers.get('content-type') || ''
  const ext = ct.includes('svg') ? '.svg' : ct.includes('png') ? '.png' : ct.includes('jpeg') ? '.jpg' : '.png'
  const out = path.join(brandsDir, `${slug}${ext}`)
  fs.writeFileSync(out, buf)
  return out
}

async function scrapeOg(domain) {
  const res = await fetch(`https://${domain}`, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(15000),
  })
  const html = await res.text()
  const match =
    html.match(/property="og:image" content="([^"]+)"/) ||
    html.match(/content="([^"]+)" property="og:image"/)
  return match?.[1]
}

async function main() {
  fs.mkdirSync(brandsDir, { recursive: true })

  const ogDomains = {
    'simba-cement': 'nccke.com',
    'uganda-clays': 'www.ugandaclays.com',
    'steel-and-tube': 'www.stil.co.ug',
    'total-tools': 'www.totaltools.co.za',
  }

  for (const slug of Object.keys(TARGETS)) {
    if (fs.readdirSync(brandsDir).some((f) => f.startsWith(slug + '.'))) {
      console.log(`skip ${slug} (exists)`)
      continue
    }

    let saved = false
    for (const url of TARGETS[slug]) {
      try {
        const file = await download(slug, url)
        console.log(`ok ${slug} <- ${url}`)
        console.log(`   saved ${path.basename(file)}`)
        saved = true
        break
      } catch (e) {
        console.log(`fail ${slug} ${url} (${e.message})`)
      }
    }

    if (!saved && ogDomains[slug]) {
      try {
        const og = await scrapeOg(ogDomains[slug])
        if (og) {
          const file = await download(slug, og)
          console.log(`ok ${slug} <- og:image ${og}`)
          console.log(`   saved ${path.basename(file)}`)
          saved = true
        }
      } catch (e) {
        console.log(`fail ${slug} og scrape (${e.message})`)
      }
    }

    if (!saved) console.log(`MANUAL ${slug}`)
  }
}

main()