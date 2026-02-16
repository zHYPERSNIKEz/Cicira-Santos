/**
 * Comprime e redimensiona uma imagem no navegador antes do upload.
 * @param {File} file - O arquivo de imagem original.
 * @returns {Promise<Blob>} - A imagem comprimida em formato Blob (JPEG).
 */
export async function comprimirImagem(file) {
    // Tamanho máximo (largura ou altura)
    const maxWidthOrHeight = 300;
    const quality = 0.8; // 80% de qualidade JPEG

    // Cria uma imagem bitmap a partir do arquivo (mais moderno e rápido)
    const imageBitmap = await createImageBitmap(file);

    // Calcula as novas dimensões mantendo a proporção
    let { width, height } = imageBitmap;
    if (width > height) {
        if (width > maxWidthOrHeight) {
            height = Math.round((height * maxWidthOrHeight) / width);
            width = maxWidthOrHeight;
        }
    } else {
        if (height > maxWidthOrHeight) {
            width = Math.round((width * maxWidthOrHeight) / height);
            height = maxWidthOrHeight;
        }
    }

    // Cria um canvas invisível para desenhar a imagem redimensionada
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Desenha a imagem no canvas
    ctx.drawImage(imageBitmap, 0, 0, width, height);

    // Converte o canvas de volta para um arquivo Blob (JPEG comprimido)
    return new Promise((resolve) => {
        canvas.toBlob(
            (blob) => {
                resolve(blob);
            },
            'image/jpeg',
            quality
        );
    });
}