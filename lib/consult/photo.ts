// ─── PHOTO NORMALIZATION (BROWSER) ──────────────────────────────────────────
// Every field photo is re-encoded on the device before upload:
//  - HEIC/WebP/PNG → JPEG, so the PDF renderer can use it
//  - long edge capped at 1600px, so uploads survive weak hospital signal
//  - EXIF (incl. GPS) dropped by the canvas re-encode — hospital photos
//    shouldn't carry the consultant's location
// createImageBitmap applies EXIF orientation, so portrait shots stay upright.

const MAX_EDGE = 1600
const QUALITY  = 0.82

export async function normalizePhoto(file: File): Promise<Blob> {
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    // Browsers without a HEIC decoder (most non-Apple) land here.
    throw new Error(`Can't read ${file.name}. Use a JPEG or PNG, or set the iPhone camera to "Most Compatible".`)
  }
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Image processing is not available in this browser')
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', QUALITY))
  if (!blob) throw new Error('Could not convert the photo')
  return blob
}

/** "IMG_0042.HEIC" → "IMG_0042.jpg" */
export function jpegName(name: string): string {
  const base = name.replace(/\.[^.]+$/, '').replace(/[^\w.\-]+/g, '_').slice(-60) || 'photo'
  return `${base}.jpg`
}
