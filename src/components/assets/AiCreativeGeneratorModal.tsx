import React, { useMemo, useState } from 'react';
import { RefreshCw, Sparkles, Wand2 } from 'lucide-react';
import { CreativeAsset } from '../../types/commerce';
import { Modal } from '../common/Modal';

interface AiCreativeGeneratorModalProps {
  open: boolean;
  onClose: () => void;
  assets?: CreativeAsset[];
  onSaveAsset: (asset: Omit<CreativeAsset, 'id' | 'dateAdded'>) => void;
}

type FormatPreset = {
  id: string;
  label: string;
  width: number;
  height: number;
  assetType: CreativeAsset['assetType'];
  usageScope: string;
};

const FORMAT_PRESETS: FormatPreset[] = [
  {
    id: 'sb-banner',
    label: 'Amazon UK Banner (1200 × 625)',
    width: 1200,
    height: 625,
    assetType: 'Social & Ad Banners',
    usageScope: 'Amazon UK Sponsored Brands 1200×625 Custom Image & Brand Store Hero',
  },
  {
    id: 'apparel-concept',
    label: 'Apparel & Merch Artwork (1408 × 1056)',
    width: 1408,
    height: 1056,
    assetType: 'Apparel & Product Designs',
    usageScope: 'UK Apparel Chest Graphic, Tech Pack Reference & ASIN Visual',
  },
  {
    id: 'crest-tile',
    label: 'Brand Crest / Store Tile (800 × 800)',
    width: 800,
    height: 800,
    assetType: 'Official Logos & Marks',
    usageScope: 'Amazon UK Sponsored Brands Brand Mark & Storefront Category Tile',
  },
  {
    id: 'sd-rect',
    label: 'Sponsored Display Unit (600 × 500)',
    width: 600,
    height: 500,
    assetType: 'Social & Ad Banners',
    usageScope: 'Amazon UK Sponsored Display 300×250 Retina Remarketing Slot',
  },
];

const THEME_PALETTES = {
  crimson: {
    label: 'Crimson & Obsidian Stadium',
    bgStart: '#09090B',
    bgMid: '#1C090D',
    bgEnd: '#BC1F2F',
    accent: '#F59E0B',
    text: '#FFFFFF',
  },
  gold: {
    label: 'Metallic Gold Heritage',
    bgStart: '#0B0B0D',
    bgMid: '#1E1910',
    bgEnd: '#856012',
    accent: '#FCD34D',
    text: '#FFFFFF',
  },
  monochrome: {
    label: 'Obsidian Streetwear',
    bgStart: '#09090B',
    bgMid: '#18181B',
    bgEnd: '#27272A',
    accent: '#BC1F2F',
    text: '#FAFAFA',
  },
  pitch: {
    label: 'Floodlight Matchday',
    bgStart: '#0A0D12',
    bgMid: '#141B29',
    bgEnd: '#9E1927',
    accent: '#FBBF24',
    text: '#FFFFFF',
  },
} as const;

type ThemeKey = keyof typeof THEME_PALETTES;

const QUICK_PROMPTS = [
  'Speed FC Matchday Drop — Crimson & Gold Stadium Floodlight Banner',
  'Heavyweight Black Fleece Chest Graphic with Distressed Lightning Bolt',
  'Amazon UK Prime Next-Day Streetwear Capsule Storefront Hero',
  'Limited Collector Drop 01 Archival Crest Lockup on Obsidian Matte',
];

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function loadImageSafe(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function extractHeadline(prompt: string): string {
  const cleaned = prompt
    .replace(/[^a-zA-Z0-9\s\-&£]/g, ' ')
    .trim()
    .split(/\s+/)
    .slice(0, 6)
    .join(' ');
  return (cleaned || 'ISHOWSPEED UK DROP').toUpperCase();
}

export const AiCreativeGeneratorModal: React.FC<AiCreativeGeneratorModalProps> = ({
  open,
  onClose,
  assets = [],
  onSaveAsset,
}) => {
  const [prompt, setPrompt] = useState(QUICK_PROMPTS[0]);
  const [title, setTitle] = useState('');
  const [formatId, setFormatId] = useState<string>('sb-banner');
  const [themeKey, setThemeKey] = useState<ThemeKey>('crimson');
  const [selectedLogoId, setSelectedLogoId] = useState<string>('auto');
  const [selectedBackdropId, setSelectedBackdropId] = useState<string>('none');
  const [variationSeed, setVariationSeed] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const selectedFormat = FORMAT_PRESETS.find((f) => f.id === formatId) ?? FORMAT_PRESETS[0];

  const uploadedLogos = useMemo(
    () =>
      assets.filter(
        (a) => a.assetType === 'Official Logos & Marks' && (!a.mediaType || a.mediaType === 'image')
      ),
    [assets]
  );

  const uploadedImages = useMemo(
    () => assets.filter((a) => !a.mediaType || a.mediaType === 'image'),
    [assets]
  );

  const runGeneration = async (nextSeed = variationSeed) => {
    setGenerating(true);
    try {
      const { width, height } = selectedFormat;
      const palette = THEME_PALETTES[themeKey];
      const seed = hashString(`${prompt}|${themeKey}|${formatId}|${nextSeed}`);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Base gradient background
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, palette.bgStart);
      grad.addColorStop(0.55, palette.bgMid);
      grad.addColorStop(1, palette.bgEnd);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 2. Optional user-uploaded visual blend
      if (selectedBackdropId !== 'none') {
        const bgAsset = uploadedImages.find((a) => a.id === selectedBackdropId);
        if (bgAsset) {
          const bgImg = await loadImageSafe(bgAsset.src);
          if (bgImg) {
            ctx.save();
            ctx.globalAlpha = 0.28;
            const scale = Math.max(width / bgImg.width, height / bgImg.height);
            const dw = bgImg.width * scale;
            const dh = bgImg.height * scale;
            ctx.drawImage(bgImg, (width - dw) / 2, (height - dh) / 2, dw, dh);
            ctx.restore();
          }
        }
      }

      // 3. Radial spotlight & architectural pitch lines driven by seed
      const spotX = width * (0.25 + ((seed % 50) / 100));
      const spotY = height * (0.25 + (((seed >> 4) % 40) / 100));
      const rad = ctx.createRadialGradient(spotX, spotY, 10, spotX, spotY, width * 0.65);
      rad.addColorStop(0, 'rgba(188, 31, 47, 0.42)');
      rad.addColorStop(0.5, 'rgba(198, 146, 20, 0.14)');
      rad.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
      ctx.fillStyle = rad;
      ctx.fillRect(0, 0, width, height);

      // Architectural grid & diagonal kinetic slashes
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      const step = Math.round(width / 16);
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      ctx.strokeStyle = palette.accent;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = Math.max(3, Math.round(width * 0.004));
      const offset = (seed % 180) - 90;
      ctx.beginPath();
      ctx.moveTo(width * 0.68 + offset, 0);
      ctx.lineTo(width * 0.48 + offset, height);
      ctx.stroke();
      ctx.restore();

      // 4. Crisp outer editorial frame
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 2;
      const pad = Math.round(Math.min(width, height) * 0.045);
      ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);

      // 5. Logo mark: either user-uploaded logo or crisp vector monogram
      const chosenLogo =
        selectedLogoId === 'none'
          ? null
          : selectedLogoId === 'auto'
          ? uploadedLogos[0] ?? null
          : uploadedLogos.find((l) => l.id === selectedLogoId) ?? null;

      if (chosenLogo) {
        const logoImg = await loadImageSafe(chosenLogo.src);
        if (logoImg) {
          const targetH = Math.round(height * 0.18);
          const targetW = Math.round((logoImg.width / logoImg.height) * targetH);
          ctx.drawImage(logoImg, pad * 1.8, pad * 1.7, targetW, targetH);
        }
      } else if (selectedLogoId !== 'none') {
        ctx.save();
        ctx.fillStyle = palette.accent;
        ctx.font = `900 ${Math.round(height * 0.075)}px "Plus Jakarta Sans", sans-serif`;
        ctx.fillText('SPEED', pad * 1.8, pad * 2.5);
        ctx.restore();
      }

      // 6. Prompt-driven kinetic typography
      const headlineText = extractHeadline(prompt);
      ctx.fillStyle = palette.accent;
      ctx.font = `600 ${Math.round(height * 0.032)}px "IBM Plex Mono", monospace`;
      ctx.fillText(
        `ISHOWSPEED · AMAZON UK CREATIVE STUDIO · VAR #${nextSeed}`,
        pad * 1.8,
        height - pad * 3.1
      );

      ctx.fillStyle = palette.text;
      const fontSize = Math.round(Math.min(width * 0.052, height * 0.092));
      ctx.font = `800 ${fontSize}px "Plus Jakarta Sans", sans-serif`;
      const maxTextWidth = width - pad * 3.6;
      ctx.fillText(headlineText, pad * 1.8, height - pad * 1.8, maxTextWidth);

      setPreviewUrl(canvas.toDataURL('image/jpeg', 0.92));
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    runGeneration(variationSeed);
  };

  const handleRegenerate = () => {
    const next = variationSeed + 1;
    setVariationSeed(next);
    runGeneration(next);
  };

  const handleSave = () => {
    if (!previewUrl) return;
    const finalTitle =
      title.trim() || `AI Studio — ${extractHeadline(prompt).slice(0, 38)}`;
    onSaveAsset({
      title: finalTitle,
      assetType: selectedFormat.assetType,
      mediaType: 'image',
      src: previewUrl,
      dimensions: `${selectedFormat.width} × ${selectedFormat.height} px (JPG)`,
      licenseLabel: 'AI Studio Generated Asset (PoC)',
      attribution: `Prompt: "${prompt.trim().slice(0, 64)}"`,
      usageScope: selectedFormat.usageScope,
      linkedEntity: 'Amazon UK Campaigns & Product Concepts',
    });
    setPreviewUrl(null);
    setTitle('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Generate Creative Asset with AI"
      subtitle="Generate a custom banner, apparel graphic, or brand tile — optionally incorporating your uploaded logos"
      maxWidthClass="max-w-3xl"
    >
      <div className="space-y-4 text-xs">
        <form onSubmit={handleGenerateClick} className="space-y-4">
          <div>
            <label className="block font-medium text-zinc-700 mb-1">Creative Prompt</label>
            <textarea
              rows={2}
              required
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the iShowSpeed banner, hoodie chest artwork, or Amazon UK ad visual..."
              className="w-full px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:border-zinc-900"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {QUICK_PROMPTS.map((qp) => (
                <button
                  key={qp}
                  type="button"
                  onClick={() => setPrompt(qp)}
                  className="px-2.5 py-1 text-[11px] bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded transition-colors text-left"
                >
                  {qp}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Output Format</label>
              <select
                value={formatId}
                onChange={(e) => setFormatId(e.target.value)}
                className="w-full px-2.5 py-2 border border-zinc-300 rounded bg-white"
              >
                {FORMAT_PRESETS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">Color Direction</label>
              <select
                value={themeKey}
                onChange={(e) => setThemeKey(e.target.value as ThemeKey)}
                className="w-full px-2.5 py-2 border border-zinc-300 rounded bg-white"
              >
                {Object.entries(THEME_PALETTES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">Logo Overlay</label>
              <select
                value={selectedLogoId}
                onChange={(e) => setSelectedLogoId(e.target.value)}
                className="w-full px-2.5 py-2 border border-zinc-300 rounded bg-white"
              >
                <option value="auto">
                  {uploadedLogos.length > 0 ? `Use Uploaded (${uploadedLogos[0].title})` : 'Typographic SPEED Mark'}
                </option>
                {uploadedLogos.map((logo) => (
                  <option key={logo.id} value={logo.id}>
                    {logo.title}
                  </option>
                ))}
                <option value="none">No Logo Overlay</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">Uploaded Visual Blend</label>
              <select
                value={selectedBackdropId}
                onChange={(e) => setSelectedBackdropId(e.target.value)}
                className="w-full px-2.5 py-2 border border-zinc-300 rounded bg-white"
              >
                <option value="none">Pure Graphic Canvas</option>
                {uploadedImages.map((img) => (
                  <option key={img.id} value={img.id}>
                    {img.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <span className="text-[11px] text-zinc-500">
              Exports a high-resolution image ready for download, Product Concepts, and Amazon UK Ads.
            </span>
            <div className="flex items-center gap-2">
              {previewUrl && (
                <button
                  type="button"
                  onClick={handleRegenerate}
                  disabled={generating}
                  className="inline-flex items-center gap-1.5 px-3 py-2 font-medium text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50 rounded"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>New Variation</span>
                </button>
              )}
              <button
                type="submit"
                disabled={generating || !prompt.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 font-medium text-white bg-zinc-900 hover:bg-[#BC1F2F] rounded transition-colors disabled:opacity-50"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>{generating ? 'Rendering...' : 'Generate Creative'}</span>
              </button>
            </div>
          </div>
        </form>

        {previewUrl && (
          <div className="border-t border-zinc-200 pt-4 space-y-3">
            <div className="bg-zinc-950 border border-zinc-200 rounded overflow-hidden flex items-center justify-center max-h-[300px]">
              <img
                src={previewUrl}
                alt="Generated creative preview"
                className="max-h-[290px] w-auto object-contain"
              />
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[220px]">
                <label className="block font-medium text-zinc-700 mb-1">
                  Asset Library Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`AI Studio — ${extractHeadline(prompt).slice(0, 38)}`}
                  className="w-full px-3 py-2 border border-zinc-300 rounded"
                />
              </div>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 px-4 py-2 font-medium text-white bg-[#BC1F2F] hover:bg-[#9E1927] rounded transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Save to Asset Library</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
