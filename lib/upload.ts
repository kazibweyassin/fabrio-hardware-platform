import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { put } from '@vercel/blob'

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif'])

export function buildUploadFilename(originalName: string): string {
  const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg'
  const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : 'jpg'
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${safeExt}`
}

export async function storeUploadedImage(
  filename: string,
  buffer: Buffer
): Promise<{ url: string; storage: 'blob' | 'local' }> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`products/${filename}`, buffer, {
      access: 'public',
      contentType: guessContentType(filename),
    })
    return { url: blob.url, storage: 'blob' }
  }

  if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
    throw new Error(
      'Image upload requires BLOB_READ_WRITE_TOKEN in production. Add Vercel Blob storage or paste an image URL.'
    )
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products')
  await mkdir(uploadDir, { recursive: true })
  await writeFile(path.join(uploadDir, filename), buffer)
  return { url: `/uploads/products/${filename}`, storage: 'local' }
}

function guessContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'png':
      return 'image/png'
    case 'webp':
      return 'image/webp'
    case 'gif':
      return 'image/gif'
    default:
      return 'image/jpeg'
  }
}