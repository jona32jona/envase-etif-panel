// src/utils/image/logoTools.js
// 1080x1080, fondo blanco, el logo ocupa 90% del ancho, centrado, exporta JPEG.

export async function processLogoToJpegSquare(
  file,
  { size = 1080, widthPercent = 0.9, background = '#ffffff', quality = 0.92, filename = null } = {}
) {
  const { image, width: sw, height: sh, cleanup } = await loadImage(file)

  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')

  // fondo blanco
  ctx.fillStyle = background
  ctx.fillRect(0, 0, size, size)

  // Escala a 90% del ancho
  const maxWidth = Math.floor(size * widthPercent)
  const ratio = sw > 0 ? maxWidth / sw : 1
  let newW = maxWidth
  let newH = Math.round(sh * ratio)

  // Si se pasa en altura, recalcular por altura
  if (newH > size) {
    newH = size
    newW = Math.round(sw * (size / sh))
  }

  // Centrar
  const dx = Math.floor((size - newW) / 2)
  const dy = Math.floor((size - newH) / 2)

  // ✅ image es SIEMPRE un tipo aceptado por drawImage
  ctx.drawImage(image, 0, 0, sw, sh, dx, dy, newW, newH)

  const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', quality))
  const outName = (filename ?? baseName(file.name)) + '.jpg'

  // cleanup de recursos temporales
  try { cleanup && cleanup() } catch {}

  return new File([blob], outName, { type: 'image/jpeg' })
}

function baseName(name = 'logo') {
  const i = name.lastIndexOf('.')
  return i > 0 ? name.slice(0, i) : name
}

async function loadImage(file) {
  // 1) Intentar ImageBitmap (rápido y soportado por drawImage)
  if (typeof createImageBitmap === 'function' && file.type?.startsWith('image/')) {
    try {
      const bmp = await createImageBitmap(file)
      return {
        image: bmp,                       // ImageBitmap
        width: bmp.width,
        height: bmp.height,
        cleanup: () => bmp.close && bmp.close(),
      }
    } catch {
      // sigue al fallback
    }
  }

  // 2) Fallback: HTMLImageElement
  const url = URL.createObjectURL(file)
  const img = new Image()
  img.decoding = 'async'
  img.src = url
  await img.decode()
  return {
    image: img,                           // HTMLImageElement
    width: img.naturalWidth || img.width,
    height: img.naturalHeight || img.height,
    cleanup: () => URL.revokeObjectURL(url),
  }
}
