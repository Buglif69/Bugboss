export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Image failed to load'))
    img.src = url
  })
}

export async function imageSizeFromBlob(blob: Blob): Promise<{ w: number; h: number }> {
  const url = URL.createObjectURL(blob)
  try {
    const img = await loadImage(url)
    // SVGs without explicit width/height can report 0 — fall back to a sane default
    const w = img.naturalWidth || 1000
    const h = img.naturalHeight || 700
    return { w, h }
  } finally {
    URL.revokeObjectURL(url)
  }
}

/**
 * Rasterize the base map blob to a PNG/JPEG data URL for PDF embedding.
 * SVGs are drawn at high resolution so they stay crisp on the page.
 */
export async function rasterizeMap(
  blob: Blob,
  mapW: number,
  mapH: number,
  targetWidthPx = 2400,
): Promise<{ dataUrl: string; format: 'PNG' | 'JPEG' }> {
  const url = URL.createObjectURL(blob)
  try {
    const img = await loadImage(url)
    const isJpeg = blob.type === 'image/jpeg'
    const scale = Math.min(targetWidthPx / mapW, 3)
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(mapW * Math.max(scale, isJpeg ? 0 : 1)))
    canvas.height = Math.max(1, Math.round(canvas.width * (mapH / mapW)))
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    if (isJpeg) return { dataUrl: canvas.toDataURL('image/jpeg', 0.88), format: 'JPEG' }
    return { dataUrl: canvas.toDataURL('image/png'), format: 'PNG' }
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result as string)
    r.onerror = () => reject(r.error)
    r.readAsDataURL(blob)
  })
}
