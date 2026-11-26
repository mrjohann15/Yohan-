import { PRODUCT_CONSTRAINTS } from '../types/product';

/**
 * Compresses a user-selected image file to a JPEG data URI small enough
 * to satisfy Firestore document & schema limits (< 200,000 chars).
 */
export async function compressImageFile(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Pumili ng valid na image file (JPG, PNG, or WebP).');
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Hindi mabasa ang image file.'));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Hindi ma-load ang image.'));
    image.src = dataUrl;
  });

  const maxDim = 760;
  let width = img.width;
  let height = img.height;

  if (width > maxDim || height > maxDim) {
    if (width >= height) {
      height = Math.round((height * maxDim) / width);
      width = maxDim;
    } else {
      width = Math.round((width * maxDim) / height);
      height = maxDim;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Hindi ma-process ang image sa browser.');
  }

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  let quality = 0.78;
  let compressed = canvas.toDataURL('image/jpeg', quality);

  while (compressed.length > PRODUCT_CONSTRAINTS.IMAGE_URL_MAX - 10000 && quality > 0.3) {
    quality -= 0.12;
    compressed = canvas.toDataURL('image/jpeg', quality);
  }

  if (compressed.length > PRODUCT_CONSTRAINTS.IMAGE_URL_MAX) {
    throw new Error('Masyadong malaki ang image file. Gumamit ng mas maliit na larawan.');
  }

  return compressed;
}

export function formatPhpPrice(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
