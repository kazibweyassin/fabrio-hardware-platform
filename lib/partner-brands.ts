import fs from 'fs'
import path from 'path'

export interface PartnerBrand {
  name: string
  slug: string
  logo?: string
}

const LOGO_EXTENSIONS = ['.svg', '.png', '.webp', '.jpg', '.jpeg']

export const PARTNER_BRANDS: PartnerBrand[] = [
  { name: 'Tororo Cement', slug: 'tororo-cement' },
  { name: 'Hima Cement', slug: 'hima-cement' },
  { name: 'Simba Cement', slug: 'simba-cement' },
  { name: 'Kampala Cement', slug: 'kampala-cement' },
  { name: 'Metro Cement', slug: 'metro-cement' },
  { name: 'Roofings', slug: 'roofings' },
  { name: 'Uganda Baati', slug: 'uganda-baati' },
  { name: 'Steel & Tube', slug: 'steel-and-tube' },
  { name: 'Uganda Clays', slug: 'uganda-clays' },
  { name: 'Crown Paints', slug: 'crown-paints' },
  { name: 'INGCO', slug: 'ingco' },
  { name: 'Total Tools', slug: 'total-tools' },
  { name: 'Dong Cheng', slug: 'dong-cheng' },
  { name: 'Wadfow', slug: 'wadfow' },
  { name: 'Bosch', slug: 'bosch' },
  { name: 'Makita', slug: 'makita' },
  { name: 'DeWalt', slug: 'dewalt' },
  { name: 'Stanley', slug: 'stanley' },
  { name: 'Black+Decker', slug: 'black-decker' },
  { name: 'Honda', slug: 'honda' },
  { name: 'Stihl', slug: 'stihl' },
  { name: 'Schneider Electric', slug: 'schneider-electric' },
]

export function resolveBrandLogo(slug: string): string | undefined {
  const brandsDir = path.join(process.cwd(), 'public', 'brands')

  if (!fs.existsSync(brandsDir)) {
    return undefined
  }

  for (const ext of LOGO_EXTENSIONS) {
    const filePath = path.join(brandsDir, `${slug}${ext}`)
    if (fs.existsSync(filePath)) {
      return `/brands/${slug}${ext}`
    }
  }

  return undefined
}

export function getPartnerBrands(): PartnerBrand[] {
  return PARTNER_BRANDS.map((brand) => ({
    ...brand,
    logo: resolveBrandLogo(brand.slug),
  }))
}