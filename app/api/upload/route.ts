import { requireAdmin } from '@/lib/auth-helpers'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { buildUploadFilename, storeUploadedImage } from '@/lib/upload'
import { NextRequest, NextResponse } from 'next/server'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

export async function POST(request: NextRequest) {
  const rateLimited = checkRateLimit(request, 'api:upload', 20, RATE_LIMITS.api.windowMs)
  if (rateLimited) return rateLimited

  try {
    await requireAdmin(request.headers)

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Use JPEG, PNG, WebP, or GIF.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5 MB.' }, { status: 400 })
    }

    const filename = buildUploadFilename(file.name)
    const buffer = Buffer.from(await file.arrayBuffer())
    const { url } = await storeUploadedImage(filename, buffer)

    return NextResponse.json({ url })
  } catch (error) {
    if (error instanceof Response) return error
    console.error('Upload error:', error)
    const message =
      error instanceof Error ? error.message : 'Failed to upload image'
    const status = message.includes('BLOB_READ_WRITE_TOKEN') ? 503 : 500
    return NextResponse.json({ error: message }, { status })
  }
}