/**
 * Resizes an image file to fit within `maxDimension` and re-encodes it as a
 * JPEG data URI, suitable for storing directly on a Firestore document (see
 * "Admin / authoring UI" in CLAUDE.md for why — short version: avoids the
 * Blaze-plan requirement of Firebase Storage, and Firestore caps documents at
 * 1 MiB so the result needs to land well under that after base64 overhead).
 */
export async function compressImageToDataUrl(
  file: File,
  { maxDimension = 1200, quality = 0.8 } = {},
): Promise<string> {
  const bitmap = await createImageBitmap(file)
  try {
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D context unavailable')
    ctx.drawImage(bitmap, 0, 0, width, height)

    return canvas.toDataURL('image/jpeg', quality)
  } finally {
    bitmap.close()
  }
}

/** Rough byte size of a base64 data URI's encoded payload. */
export function dataUrlByteSize(dataUrl: string): number {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
  return Math.ceil((base64.length * 3) / 4)
}
