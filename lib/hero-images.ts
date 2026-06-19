import fs from 'fs'
import path from 'path'

const IMAGE_EXTENSIONS = /\.(webp|gif|jpe?g|png|avif)$/i
const MIN_HERO_WIDTH = 1600
const MIN_HERO_HEIGHT = 400

export interface HeroImage {
  src: string
  width: number
  height: number
}

function readWebpDimensions(buffer: Buffer): { width: number; height: number } | null {
  if (buffer.length < 30) return null

  if (buffer.toString('ascii', 12, 16) === 'VP8X' && buffer.length >= 30) {
    return {
      width: 1 + buffer.readUIntLE(24, 3),
      height: 1 + buffer.readUIntLE(27, 3),
    }
  }

  const vp8Index = buffer.indexOf('VP8 ')
  if (vp8Index >= 0 && buffer.length >= vp8Index + 18) {
    return {
      width: buffer.readUInt16LE(vp8Index + 14) & 0x3fff,
      height: buffer.readUInt16LE(vp8Index + 16) & 0x3fff,
    }
  }

  const vp8lIndex = buffer.indexOf('VP8L')
  if (vp8lIndex >= 0 && buffer.length >= vp8lIndex + 13) {
    const bits = buffer.readUInt32LE(vp8lIndex + 9)
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    }
  }

  return null
}

function readImageDimensions(filePath: string): { width: number; height: number } | null {
  const buffer = fs.readFileSync(filePath)
  const ext = path.extname(filePath).toLowerCase()

  if (ext === '.webp') {
    return readWebpDimensions(buffer)
  }

  if (ext === '.gif' && buffer.length >= 10) {
    return {
      width: buffer.readUInt16LE(6),
      height: buffer.readUInt16LE(8),
    }
  }

  if (ext === '.png' && buffer.length >= 24) {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    }
  }

  if ((ext === '.jpg' || ext === '.jpeg') && buffer.length > 4) {
    let offset = 2
    while (offset < buffer.length - 8) {
      if (buffer[offset] !== 0xff) break
      const marker = buffer[offset + 1]
      const length = buffer.readUInt16BE(offset + 2)
      if (marker === 0xc0 || marker === 0xc2) {
        return {
          height: buffer.readUInt16BE(offset + 5),
          width: buffer.readUInt16BE(offset + 7),
        }
      }
      offset += 2 + length
    }
  }

  return null
}

function isHeroQuality(dimensions: { width: number; height: number }) {
  return dimensions.width >= MIN_HERO_WIDTH && dimensions.height >= MIN_HERO_HEIGHT
}

export function getHeroImages(): HeroImage[] {
  const heroDir = path.join(process.cwd(), 'public', 'hero')

  if (!fs.existsSync(heroDir)) {
    return []
  }

  const images = fs
    .readdirSync(heroDir)
    .filter((file) => IMAGE_EXTENSIONS.test(file))
    .map((file) => {
      const dimensions = readImageDimensions(path.join(heroDir, file))
      if (!dimensions) return null

      return {
        src: `/hero/${file}`,
        width: dimensions.width,
        height: dimensions.height,
      }
    })
    .filter((image): image is HeroImage => image !== null)

  const highQuality = images.filter(isHeroQuality)
  const selected = highQuality.length > 0 ? highQuality : images

  return selected.sort((a, b) => b.width * b.height - a.width * a.height)
}