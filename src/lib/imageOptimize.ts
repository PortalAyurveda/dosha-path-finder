// Otimização de imagem no browser via Canvas API.
// Redimensiona para no máximo `maxWidth` (mantendo proporção) e exporta WebP.

export interface OptimizedImage {
  file: File;
  blob: Blob;
  originalSize: number;
  optimizedSize: number;
  width: number;
  height: number;
  optimized: boolean; // false se fallback (usa original)
}

export interface OptimizeOptions {
  maxWidth?: number;
  quality?: number;
}

function stripExt(name: string): string {
  const i = name.lastIndexOf(".");
  return i > 0 ? name.slice(0, i) : name;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

export async function optimizeImageToWebP(
  file: File,
  opts: OptimizeOptions = {},
): Promise<OptimizedImage> {
  const maxWidth = opts.maxWidth ?? 1600;
  const quality = opts.quality ?? 0.85;

  try {
    const img = await loadImage(file);
    const ratio = img.naturalWidth > maxWidth ? maxWidth / img.naturalWidth : 1;
    const w = Math.round(img.naturalWidth * ratio);
    const h = Math.round(img.naturalHeight * ratio);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context indisponível");
    ctx.drawImage(img, 0, 0, w, h);

    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("toBlob retornou null"))),
        "image/webp",
        quality,
      );
    });

    const newName = `${stripExt(file.name)}.webp`;
    const newFile = new File([blob], newName, { type: "image/webp" });

    return {
      file: newFile,
      blob,
      originalSize: file.size,
      optimizedSize: blob.size,
      width: w,
      height: h,
      optimized: true,
    };
  } catch {
    // Fallback: devolve o arquivo original
    return {
      file,
      blob: file,
      originalSize: file.size,
      optimizedSize: file.size,
      width: 0,
      height: 0,
      optimized: false,
    };
  }
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}
