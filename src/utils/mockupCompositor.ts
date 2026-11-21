export type MockupBlendMode = 'normal' | 'multiply' | 'screen';

export interface MockupTextOverlay {
  text: string;
  color: string;
  sizePct: number;
  uppercase: boolean;
}

export interface MockupPlacement {
  xPct: number;
  yPct: number;
  scalePct: number;
  rotationDeg: number;
  opacity: number;
  blendMode: MockupBlendMode;
}

export interface MockupPreset {
  id: string;
  label: string;
  placement: Pick<MockupPlacement, 'xPct' | 'yPct' | 'scalePct' | 'rotationDeg'>;
}

export const DEFAULT_MOCKUP_PLACEMENT: MockupPlacement = {
  xPct: 50,
  yPct: 40,
  scalePct: 26,
  rotationDeg: 0,
  opacity: 0.96,
  blendMode: 'normal',
};

export const MOCKUP_PRESETS: MockupPreset[] = [
  {
    id: 'center-chest',
    label: 'Center Chest',
    placement: { xPct: 50, yPct: 40, scalePct: 26, rotationDeg: 0 },
  },
  {
    id: 'left-chest',
    label: 'Left Chest',
    placement: { xPct: 60, yPct: 33, scalePct: 12, rotationDeg: 0 },
  },
  {
    id: 'oversized',
    label: 'Oversized Front',
    placement: { xPct: 50, yPct: 44, scalePct: 38, rotationDeg: 0 },
  },
  {
    id: 'cap-crown',
    label: 'Cap Front',
    placement: { xPct: 50, yPct: 47, scalePct: 22, rotationDeg: 0 },
  },
  {
    id: 'drinkware',
    label: 'Mug / Bottle',
    placement: { xPct: 50, yPct: 54, scalePct: 28, rotationDeg: 0 },
  },
];

export function toCanvasSafeUrl(src: string): string {
  if (!src) return src;
  const cdnPrefix = 'https://files.cdn.printful.com';
  if (src.startsWith(cdnPrefix)) {
    return `/api/cdn-img${src.slice(cdnPrefix.length)}`;
  }
  return src;
}

function loadImage(src: string, useCors: boolean): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    if (useCors) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function loadImageForCanvas(src: string): Promise<HTMLImageElement | null> {
  if (!src) return null;
  if (src.startsWith('data:') || src.startsWith('/')) {
    return loadImage(src, false);
  }
  const proxied = toCanvasSafeUrl(src);
  if (proxied !== src) {
    const proxiedImg = await loadImage(proxied, false);
    if (proxiedImg) return proxiedImg;
  }
  const corsImg = await loadImage(src, true);
  if (corsImg) return corsImg;
  return null;
}

function drawBlankFallbackSilhouette(
  ctx: CanvasRenderingContext2D,
  size: number,
  colorHex = '#18181B'
): void {
  ctx.save();
  ctx.fillStyle = colorHex;
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(size * 0.34, size * 0.16);
  ctx.quadraticCurveTo(size * 0.5, size * 0.24, size * 0.66, size * 0.16);
  ctx.lineTo(size * 0.86, size * 0.28);
  ctx.lineTo(size * 0.78, size * 0.45);
  ctx.lineTo(size * 0.7, size * 0.41);
  ctx.lineTo(size * 0.7, size * 0.85);
  ctx.lineTo(size * 0.3, size * 0.85);
  ctx.lineTo(size * 0.3, size * 0.41);
  ctx.lineTo(size * 0.22, size * 0.45);
  ctx.lineTo(size * 0.14, size * 0.28);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export interface BakeMockupOptions {
  blankSrc: string;
  blankColorHex?: string;
  artworkSrc?: string;
  textOverlay?: MockupTextOverlay | null;
  placement: MockupPlacement;
  outputSize?: number;
}

export async function bakeMockupToDataUrl(opts: BakeMockupOptions): Promise<string> {
  const size = opts.outputSize ?? 1000;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return opts.artworkSrc || opts.blankSrc;

  // Studio neutral backdrop
  ctx.fillStyle = '#FAFAFA';
  ctx.fillRect(0, 0, size, size);

  // 1. Base blank image (fitted with small padding, matching LiveMockupStage)
  const blankImg = await loadImageForCanvas(opts.blankSrc);
  if (blankImg && blankImg.width > 0 && blankImg.height > 0) {
    const pad = size * 0.04;
    const avail = size - pad * 2;
    const sc = Math.min(avail / blankImg.width, avail / blankImg.height);
    const dw = blankImg.width * sc;
    const dh = blankImg.height * sc;
    ctx.drawImage(blankImg, (size - dw) / 2, (size - dh) / 2, dw, dh);
  } else {
    drawBlankFallbackSilhouette(ctx, size, opts.blankColorHex || '#18181B');
  }

  const cx = (opts.placement.xPct / 100) * size;
  const cy = (opts.placement.yPct / 100) * size;
  const rad = (opts.placement.rotationDeg * Math.PI) / 180;
  const compositeOp: GlobalCompositeOperation =
    opts.placement.blendMode === 'multiply'
      ? 'multiply'
      : opts.placement.blendMode === 'screen'
      ? 'screen'
      : 'source-over';

  // 2. Artwork layer
  if (opts.artworkSrc) {
    const artImg = await loadImageForCanvas(opts.artworkSrc);
    if (artImg && artImg.width > 0 && artImg.height > 0) {
      const targetW = (opts.placement.scalePct / 100) * size;
      const targetH = targetW * (artImg.height / artImg.width);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rad);
      ctx.globalAlpha = opts.placement.opacity;
      ctx.globalCompositeOperation = compositeOp;
      ctx.drawImage(artImg, -targetW / 2, -targetH / 2, targetW, targetH);
      ctx.restore();
    }
  }

  // 3. Optional text stamp layer
  if (opts.textOverlay && opts.textOverlay.text.trim()) {
    const rawText = opts.textOverlay.uppercase
      ? opts.textOverlay.text.trim().toUpperCase()
      : opts.textOverlay.text.trim();
    const px = Math.round((opts.textOverlay.sizePct / 100) * size);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rad);
    ctx.globalAlpha = opts.placement.opacity;
    ctx.globalCompositeOperation = compositeOp;
    ctx.fillStyle = opts.textOverlay.color;
    ctx.font = `900 ${px}px "Plus Jakarta Sans", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(rawText, 0, opts.artworkSrc ? px * 1.15 : 0, size * 0.72);
    ctx.restore();
  }

  try {
    return canvas.toDataURL('image/png');
  } catch {
    return opts.artworkSrc || opts.blankSrc;
  }
}
