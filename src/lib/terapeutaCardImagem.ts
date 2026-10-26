/** JPEG compatível com o gerador de prévias, preservando a proporção da foto. */
export async function fotoCardJPG(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = Math.max(1, Math.round(bitmap.height * 600 / bitmap.width));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Não foi possível preparar a foto do convite.');
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('Não foi possível preparar a foto do convite.')), 'image/jpeg', 0.88));
  } finally { bitmap.close(); }
}