// Cria um elemento de imagem HTML a partir da URL
export const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', (error) => reject(error))
      image.setAttribute('crossOrigin', 'anonymous')
      image.src = url
    })
  
  // Esta é a função mágica que recorta a imagem
  export default async function getCroppedImg(imageSrc, pixelCrop) {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
  
    if (!ctx) {
      return null
    }
  
    // Define o tamanho do canvas igual ao tamanho do corte
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height
  
    // Desenha a imagem cortada no canvas
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    )
  
    // Transforma o canvas em um arquivo Blob (JPEG)
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'))
          return
        }
        blob.name = 'newFile.jpeg'
        resolve(blob)
      }, 'image/jpeg', 1) // Qualidade máxima no corte (a compressão vem depois)
    })
  }