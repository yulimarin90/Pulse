
export async function resizeImage(file: File, width: number, height: number, maxLength: number): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file');
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not process the image');

  // "Cover" crop: fill the whole area and cut what does not fit.
  const scale = Math.max(width / bitmap.width, height / bitmap.height);
  const drawWidth = bitmap.width * scale;
  const drawHeight = bitmap.height * scale;
  context.fillStyle = '#000';
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
  bitmap.close();

  for (let quality = 0.85; quality > 0.2; quality -= 0.15) {
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    if (dataUrl.length <= maxLength) return dataUrl;
  }
  throw new Error('The image is too big, choose another one');
}

export async function resizeImageToFit(file: File, maxSide: number, maxLength: number): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file');
  const bitmap = await createImageBitmap(file);
  let scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  // If the photo is still too heavy, make it smaller a few times before giving up.
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not process the image');
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    for (let quality = 0.85; quality > 0.4; quality -= 0.15) {
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      if (dataUrl.length <= maxLength) {
        bitmap.close();
        return dataUrl;
      }
    }
    scale *= 0.7;
  }
  bitmap.close();
  throw new Error('The image is too big, choose another one');
}
