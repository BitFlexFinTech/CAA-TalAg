import React, { useMemo, useState } from 'react';
import { Check, RefreshCw, Sparkles, Wand2 } from 'lucide-react';
import {
  AmazonAdType,
  Campaign,
  CreativeAsset,
  ProductConcept,
} from '../../types/commerce';
import { Modal } from '../common/Modal';
import { AD_TEMPLATES, AmazonAdPreviewCanvas } from './AmazonAdPreviewCanvas';

interface AiCampaignGeneratorModalProps {
  open: boolean;
  onClose: () => void;
  products: ProductConcept[];
  assets: CreativeAsset[];
  activeTalentName?: string;
  activeBrandName?: string;
  onCreateGeneratedSuite: (payload: {
    creativeAsset: Omit<CreativeAsset, 'id' | 'dateAdded'>;
    campaigns: Array<{
      name: string;
      objective: string;
      associatedProductIds: string[];
      proposedStartDate: string;
      proposedEndDate: string;
      channels: string[];
      heroImage: string;
      heroCredit: string;
      illustrativeEstRevenue: number;
      illustrativeEstOrders: number;
      amazonAds: Campaign['amazonAds'];
    }>;
  }) => void;
}

const CAMPAIGN_QUICK_PROMPTS = [
  'Launch Speed FC Matchday Jersey & Lightning Hoodie across Amazon UK with stadium energy and Prime next-day delivery',
  'Heavyweight Fleece & 3D Bolt Trucker Cap autumn UK streetwear drop targeting creator apparel & football fans',
  'Collector Drop 01 archival desk sculpture & jacquard scarf gift campaign for UK Q4 gifting',
  'Full-funnel Prime Video UK, Twitch CTV & Alexa Audio push for iShowSpeed Official Storefront',
];

const PALETTE_THEMES = {
  crimson: { label: 'Crimson Stadium', start: '#09090B', mid: '#26080D', end: '#BC1F2F', accent: '#F59E0B' },
  gold: { label: 'Metallic Gold Drop', start: '#0B0B0D', mid: '#1E180D', end: '#856012', accent: '#FCD34D' },
  obsidian: { label: 'Obsidian Pitch', start: '#09090B', mid: '#18181B', end: '#3F3F46', accent: '#BC1F2F' },
} as const;

type PaletteKey = keyof typeof PALETTE_THEMES;

function loadImgSafe(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function buildShortHeadline(
  prompt: string,
  adType: AmazonAdType,
  prodName: string,
  brandName = 'iShowSpeed Official'
): string {
  const lower = prompt.toLowerCase();
  const base =
    lower.includes('hoodie') || lower.includes('fleece')
      ? `Official ${brandName} Fleece UK`
      : lower.includes('collector') || lower.includes('sculpture')
      ? `${brandName} Collector Edition UK`
      : lower.includes('cap') || lower.includes('trucker')
      ? `${brandName} Headwear & Kit UK`
      : `Official ${brandName} UK Prime Drop`;

  if (adType === 'Amazon Audio Ads') {
    return `Say "Alexa, Shop ${brandName} UK"`.slice(0, 50);
  }
  if (adType === 'Brand Store & Posts') {
    return `Explore Official ${brandName} UK Store`.slice(0, 50);
  }
  if (adType === 'Sponsored TV') {
    return `${base} · Out Now`.slice(0, 50);
  }
  if (adType === 'Sponsored Products') {
    return `${prodName}`.slice(0, 50);
  }
  return base.slice(0, 50);
}

function buildKeywordsFromPrompt(prompt: string, prods: ProductConcept[]): string[] {
  const tokens = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !['with', 'across', 'amazon', 'official', 'using'].includes(w));
  const prodTerms = prods.slice(0, 2).map((p) => p.name.toLowerCase().split(' ').slice(0, 3).join(' '));
  const merged = Array.from(
    new Set([
      'ishowspeed merch uk',
      'speed fc jersey',
      ...prodTerms,
      ...tokens.slice(0, 3).map((t) => `ishowspeed ${t}`),
    ])
  );
  return merged.slice(0, 6);
}

function buildFallbackBannerSvg(prompt: string): string {
  const safe = prompt.replace(/[<>&"']/g, '').slice(0, 36) || 'AMAZON UK CAMPAIGN';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="625" viewBox="0 0 1200 625"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#09090B"/><stop offset="50%" stop-color="#26080D"/><stop offset="100%" stop-color="#BC1F2F"/></linearGradient></defs><rect width="1200" height="625" fill="url(#g)"/><text x="64" y="290" fill="#F59E0B" font-family="monospace" font-size="22" font-weight="bold">AMAZON UK OFFICIAL DROP</text><text x="64" y="355" fill="#FFFFFF" font-family="sans-serif" font-size="44" font-weight="800">${safe}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

async function renderCampaignCreativeDataUrl(
  prompt: string,
  paletteKey: PaletteKey,
  leadProd: ProductConcept | undefined,
  seed: number,
  assets: CreativeAsset[]
): Promise<string> {
  const width = 1200;
  const height = 625;
  const pal = PALETTE_THEMES[paletteKey];

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return buildFallbackBannerSvg(prompt);

  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, pal.start);
  grad.addColorStop(0.5, pal.mid);
  grad.addColorStop(1, pal.end);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  const uploadedBg = assets.find(
    (a) =>
      (!a.mediaType || a.mediaType === 'image') &&
      a.assetType !== 'Official Logos & Marks'
  );
  if (uploadedBg) {
    const bgImg = await loadImgSafe(uploadedBg.src);
    if (bgImg) {
      ctx.save();
      ctx.globalAlpha = 0.24;
      const scale = Math.max(width / bgImg.width, height / bgImg.height);
      ctx.drawImage(
        bgImg,
        (width - bgImg.width * scale) / 2,
        (height - bgImg.height * scale) / 2,
        bgImg.width * scale,
        bgImg.height * scale
      );
      ctx.restore();
    }
  }

  // Spotlight & diagonal kinetic slash
  const spotX = 320 + ((seed * 97) % 340);
  const rad = ctx.createRadialGradient(spotX, 260, 20, spotX, 260, 560);
  rad.addColorStop(0, 'rgba(188, 31, 47, 0.45)');
  rad.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
  ctx.fillStyle = rad;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.strokeStyle = pal.accent;
  ctx.globalAlpha = 0.42;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(760, 0);
  ctx.lineTo(620, height);
  ctx.stroke();
  ctx.restore();

  if (leadProd?.image) {
    const prodImg = await loadImgSafe(leadProd.image);
    if (prodImg) {
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.94)';
      ctx.beginPath();
      ctx.roundRect(width - 420, 72, 348, 348, 12);
      ctx.fill();
      const pad = 22;
      const box = 348 - pad * 2;
      const sc = Math.min(box / prodImg.width, box / prodImg.height);
      const dw = prodImg.width * sc;
      const dh = prodImg.height * sc;
      ctx.drawImage(
        prodImg,
        width - 420 + (348 - dw) / 2,
        72 + (348 - dh) / 2,
        dw,
        dh
      );
      ctx.restore();
    }
  }

  const uploadedLogo = assets.find(
    (a) => a.assetType === 'Official Logos & Marks' && (!a.mediaType || a.mediaType === 'image')
  );
  let drewLogo = false;
  if (uploadedLogo) {
    const logoImg = await loadImgSafe(uploadedLogo.src);
    if (logoImg) {
      const th = 72;
      const tw = Math.min(260, Math.round((logoImg.width / logoImg.height) * th));
      ctx.drawImage(logoImg, 64, 58, tw, th);
      drewLogo = true;
    }
  }
  if (!drewLogo) {
    ctx.save();
    ctx.fillStyle = 'rgba(9, 9, 11, 0.85)';
    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(64, 58, 196, 56, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('ISHOWSPEED', 82, 96);
    ctx.restore();
  }

  const words = prompt
    .replace(/[^a-zA-Z0-9\s\-&£]/g, ' ')
    .trim()
    .split(/\s+/)
    .slice(0, 6)
    .join(' ')
    .toUpperCase();

  ctx.fillStyle = pal.accent;
  ctx.font = '600 18px "IBM Plex Mono", monospace';
  ctx.fillText(`AMAZON UK OFFICIAL DROP · PRIME NEXT-DAY`, 64, height - 154);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 44px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(words || 'SPEED FC UK MATCHDAY DROP', 64, height - 96, 650);

  if (leadProd) {
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${leadProd.name} · £${leadProd.proposedRetail.toFixed(2)} RRP`, 64, height - 54, 650);
  }

  return canvas.toDataURL('image/jpeg', 0.9);
}

export const AiCampaignGeneratorModal: React.FC<AiCampaignGeneratorModalProps> = ({
  open,
  onClose,
  products,
  assets,
  activeTalentName,
  activeBrandName,
  onCreateGeneratedSuite,
}) => {
  const resolvedBrand = activeBrandName || 'iShowSpeed Official';
  const resolvedSlug = resolvedBrand.toLowerCase().replace(/[^a-z0-9]+/g, '');
  const [prompt, setPrompt] = useState(CAMPAIGN_QUICK_PROMPTS[0]);
  const [selectedAdTypes, setSelectedAdTypes] = useState<AmazonAdType[]>([
    'Sponsored Products',
    'Sponsored Brands — Product Collection',
    'Sponsored Display',
    'Sponsored TV',
  ]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(
    products.slice(0, 3).map((p) => p.id)
  );
  const [totalDailyBudgetGBP, setTotalDailyBudgetGBP] = useState('450');
  const [paletteKey, setPaletteKey] = useState<PaletteKey>('crimson');
  const [seed, setSeed] = useState(1);
  const [generating, setGenerating] = useState(false);

  const [generatedMediaUrl, setGeneratedMediaUrl] = useState<string | null>(null);
  const [generatedCampaigns, setGeneratedCampaigns] = useState<Campaign[]>([]);
  const [activePreviewType, setActivePreviewType] = useState<AmazonAdType>('Sponsored Products');

  const toggleAdType = (type: AmazonAdType) => {
    setSelectedAdTypes((prev) =>
      prev.includes(type)
        ? prev.length > 1
          ? prev.filter((t) => t !== type)
          : prev
        : [...prev, type]
    );
  };

  const toggleProdId = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((p) => p !== id) : prev) : [...prev, id]
    );
  };

  const handleGenerate = async (nextSeed = seed) => {
    if (!prompt.trim() || selectedAdTypes.length === 0) return;
    setGenerating(true);
    try {
      const linkedProds = products.filter((p) => selectedProductIds.includes(p.id));
      const useProds = linkedProds.length > 0 ? linkedProds : products.slice(0, 3);
      const dataUrl = await renderCampaignCreativeDataUrl(
        prompt,
        paletteKey,
        useProds[0],
        nextSeed,
        assets
      );
      setGeneratedMediaUrl(dataUrl);

      const uploadedLogo = assets.find(
        (a) => a.assetType === 'Official Logos & Marks' && (!a.mediaType || a.mediaType === 'image')
      );
      const totalBudget = Math.max(50, Number(totalDailyBudgetGBP) || 400);
      const perCampaignBudget = Math.max(25, Math.round(totalBudget / selectedAdTypes.length));
      const keywords = buildKeywordsFromPrompt(prompt, useProds);
      const asins = useProds.map((p) => p.amazonAsinDemo || p.sku);

      const built: Campaign[] = selectedAdTypes.map((adType, idx) => {
        const headline = buildShortHeadline(
          prompt,
          adType,
          useProds[0]?.name || `${resolvedBrand} UK`,
          resolvedBrand
        );
        const tag = AD_TEMPLATES.find((t) => t.type === adType)?.code || 'UK';
        return {
          id: `ai-preview-${idx}`,
          code: `AI-UK-${tag}`,
          name: `AI · ${resolvedBrand} · ${adType}`,
          objective: `AI-generated ${adType} campaign (${activeTalentName ? `${activeTalentName} / ` : ''}${resolvedBrand}) from brief: "${prompt.trim()}"`,
          associatedProductIds: useProds.map((p) => p.id),
          creativeAssetIds: uploadedLogo ? [uploadedLogo.id] : [],
          heroImage: dataUrl,
          heroCredit: 'AI Campaign Studio · Custom Amazon UK Creative',
          status: 'Concept Outline',
          proposedStartDate: '2027-02-01',
          proposedEndDate: '2027-02-28',
          approvalStatus: 'Draft',
          channels: ['amazon.co.uk', 'Amazon UK Vendor Central (SP-API)'],
          illustrativeImpressions: perCampaignBudget * 2100,
          illustrativeEstOrders: Math.round(perCampaignBudget * 3.8),
          illustrativeEstRevenue: Math.round(perCampaignBudget * 3.8 * 44),
          notes: `Generated from AI campaign brief (Variation #${nextSeed}).`,
          amazonAds: {
            marketplaceId: 'A1F83G8C2ARO7P',
            marketplaceDomain: 'amazon.co.uk',
            endpointHost: 'https://advertising-api-eu.amazon.com',
            spApiSource: 'Amazon UK Vendor Central (SP-API)',
            adType,
            targetingType: adType === 'Sponsored Products' ? 'AUTO' : 'MANUAL',
            dailyBudgetGBP: perCampaignBudget,
            biddingStrategy: 'AUTO_FOR_SALES',
            adGroupName: `AI_${tag}_UK_${nextSeed}`,
            defaultBidGBP: adType === 'Sponsored Display' ? 0.65 : 0.85,
            headline,
            brandName: resolvedBrand,
            sbFormat:
              adType === 'Sponsored Brands — Store Spotlight'
                ? 'STORE_SPOTLIGHT'
                : adType === 'Sponsored Brands — Video'
                ? 'VIDEO'
                : adType === 'Sponsored Brands — Product Collection'
                ? 'PRODUCT_COLLECTION'
                : undefined,
            sdSize: adType === 'Sponsored Display' ? '300x250' : undefined,
            dspSize: adType === 'Amazon DSP Display' ? '970x250' : undefined,
            tvFormat: adType === 'Sponsored TV' ? '15s Streaming Spot' : undefined,
            audioLength: adType === 'Amazon Audio Ads' ? '15s Alexa Spot' : undefined,
            storeSlug: adType === 'Brand Store & Posts' ? `amazon.co.uk/${resolvedSlug}` : undefined,
            keywords,
            advertisedAsins: asins,
            customMediaUrl: dataUrl,
          },
        };
      });

      setGeneratedCampaigns(built);
      setActivePreviewType(built[0].amazonAds.adType);
    } finally {
      setGenerating(false);
    }
  };

  const activePreviewCampaign = useMemo(
    () =>
      generatedCampaigns.find((c) => c.amazonAds.adType === activePreviewType) ??
      generatedCampaigns[0] ??
      null,
    [generatedCampaigns, activePreviewType]
  );

  const handleSaveSuite = () => {
    if (!generatedMediaUrl || generatedCampaigns.length === 0) return;
    onCreateGeneratedSuite({
      creativeAsset: {
        title: `AI Campaign Key Visual — ${prompt.trim().slice(0, 34)}`,
        assetType: 'Social & Ad Banners',
        mediaType: 'image',
        src: generatedMediaUrl,
        dimensions: '1200 × 625 px (JPG)',
        licenseLabel: 'AI Campaign Studio Creative (PoC)',
        attribution: `Prompt: "${prompt.trim().slice(0, 64)}"`,
        usageScope: 'Multi-Format Amazon UK Campaign Suite (SB, SD, DSP, CTV)',
        linkedEntity: 'Amazon UK Campaigns',
      },
      campaigns: generatedCampaigns.map((c) => ({
        name: c.name,
        objective: c.objective,
        associatedProductIds: c.associatedProductIds,
        proposedStartDate: c.proposedStartDate,
        proposedEndDate: c.proposedEndDate,
        channels: c.channels,
        heroImage: c.heroImage,
        heroCredit: c.heroCredit,
        illustrativeEstRevenue: c.illustrativeEstRevenue,
        illustrativeEstOrders: c.illustrativeEstOrders,
        amazonAds: c.amazonAds,
      })),
    });
    setGeneratedCampaigns([]);
    setGeneratedMediaUrl(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Generate Amazon UK Campaigns with AI"
      subtitle="Describe your campaign brief, select ad formats, and preview how each AI-generated ad looks on Amazon UK"
      maxWidthClass="max-w-5xl"
    >
      <div className="space-y-5 text-xs">
        {/* Step 1: Prompt & Format Matrix */}
        <div className="space-y-4">
          <div>
            <label className="block font-semibold text-zinc-800 mb-1">
              Campaign Brief / AI Prompt
            </label>
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the products, target UK audience, promo hook, and visual mood..."
              className="w-full px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:border-zinc-900"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {CAMPAIGN_QUICK_PROMPTS.map((qp) => (
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

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <label className="font-semibold text-zinc-800">
                Select Amazon UK Ad Types to Generate ({selectedAdTypes.length} selected)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAdTypes(AD_TEMPLATES.map((t) => t.type))}
                  className="text-[11px] font-medium text-[#BC1F2F] hover:underline"
                >
                  Select All 9 Formats
                </button>
                <span className="text-zinc-300">|</span>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedAdTypes([
                      'Sponsored Products',
                      'Sponsored Brands — Product Collection',
                      'Sponsored Display',
                    ])
                  }
                  className="text-[11px] font-medium text-zinc-600 hover:text-zinc-900"
                >
                  Core 3 Trio
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {AD_TEMPLATES.map((tpl) => {
                const checked = selectedAdTypes.includes(tpl.type);
                const Icon = tpl.icon;
                return (
                  <button
                    key={tpl.type}
                    type="button"
                    onClick={() => toggleAdType(tpl.type)}
                    className={`px-2.5 py-2 rounded border text-left flex items-center justify-between gap-2 transition-colors ${
                      checked
                        ? 'border-[#BC1F2F] bg-[#BC1F2F]/5 text-zinc-900 font-semibold'
                        : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'
                    }`}
                  >
                    <span className="inline-flex items-center gap-1.5 min-w-0">
                      <Icon className="w-3.5 h-3.5 text-[#BC1F2F] shrink-0" />
                      <span className="truncate">{tpl.title}</span>
                    </span>
                    {checked && <Check className="w-3.5 h-3.5 text-[#BC1F2F] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block font-semibold text-zinc-800 mb-1">
                Total Daily Budget (£ GBP)
              </label>
              <input
                type="number"
                min={50}
                value={totalDailyBudgetGBP}
                onChange={(e) => setTotalDailyBudgetGBP(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded font-mono-tabular"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="block font-semibold text-zinc-800 mb-1">
                Creative Color Direction
              </label>
              <select
                value={paletteKey}
                onChange={(e) => setPaletteKey(e.target.value as PaletteKey)}
                className="w-full px-3 py-2 border border-zinc-300 rounded bg-white"
              >
                {Object.entries(PALETTE_THEMES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-1">
              <label className="block font-semibold text-zinc-800 mb-1">
                Promoted UK ASINs ({selectedProductIds.length})
              </label>
              <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto border border-zinc-200 rounded p-1.5 bg-zinc-50">
                {products.length === 0 ? (
                  <span className="text-[11px] text-zinc-500 px-1 py-0.5">
                    No concepts configured yet — draft ASIN slot used for preview.
                  </span>
                ) : (
                  products.map((p) => {
                    const active = selectedProductIds.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => toggleProdId(p.id)}
                        className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                          active
                            ? 'bg-zinc-900 text-white font-medium'
                            : 'bg-white border border-zinc-200 text-zinc-600'
                        }`}
                      >
                        {p.name.split(' ').slice(0, 2).join(' ')}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <span className="text-[11px] text-zinc-500">
              AI builds copy, targeting, £ GBP bids, bespoke branded artwork, and live Amazon UK placement previews for each selected type.
            </span>
            <div className="flex items-center gap-2">
              {generatedCampaigns.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const next = seed + 1;
                    setSeed(next);
                    handleGenerate(next);
                  }}
                  disabled={generating}
                  className="inline-flex items-center gap-1.5 px-3 py-2 font-medium text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50 rounded"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate Variation</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => handleGenerate(seed)}
                disabled={generating || !prompt.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 font-medium text-white bg-zinc-900 hover:bg-[#BC1F2F] rounded transition-colors disabled:opacity-50"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>{generating ? 'Generating Ad Suite...' : 'Generate Campaigns & Previews'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Step 2: Live Per-Ad-Type Visual Previews */}
        {activePreviewCampaign && (
          <div className="border-t border-zinc-200 pt-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-medium text-[#BC1F2F]">
                  Live Visual Preview per Ad Type ({generatedCampaigns.length} Formats Generated)
                </p>
                <h3 className="text-sm font-bold text-zinc-900">
                  {activePreviewCampaign.name} — Headline: "{activePreviewCampaign.amazonAds.headline}"
                </h3>
              </div>
              <span className="font-mono-tabular text-[11px] text-zinc-500">
                Daily Budget: £{activePreviewCampaign.amazonAds.dailyBudgetGBP}/day · Bid £{activePreviewCampaign.amazonAds.defaultBidGBP}
              </span>
            </div>

            {/* Format Switcher Tabs inside Generator */}
            <div className="flex flex-wrap gap-1.5">
              {generatedCampaigns.map((cmp) => {
                const isSelected = cmp.amazonAds.adType === activePreviewCampaign.amazonAds.adType;
                return (
                  <button
                    key={cmp.id}
                    type="button"
                    onClick={() => setActivePreviewType(cmp.amazonAds.adType)}
                    className={`px-2.5 py-1.5 text-[11px] rounded border transition-colors whitespace-nowrap ${
                      isSelected
                        ? 'bg-zinc-900 text-white border-zinc-900 font-medium'
                        : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50'
                    }`}
                  >
                    {cmp.amazonAds.adType}
                  </button>
                );
              })}
            </div>

            <AmazonAdPreviewCanvas
              campaign={activePreviewCampaign}
              products={products}
              assets={assets}
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-200">
              <p className="text-[11px] text-zinc-500">
                Keywords: <span className="font-mono-tabular text-zinc-700">{activePreviewCampaign.amazonAds.keywords.join(', ')}</span>
              </p>
              <button
                type="button"
                onClick={handleSaveSuite}
                className="inline-flex items-center gap-1.5 px-4 py-2 font-medium text-white bg-[#BC1F2F] hover:bg-[#9E1927] rounded transition-colors whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Launch {generatedCampaigns.length} Campaign{generatedCampaigns.length === 1 ? '' : 's'} into Workspace</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
