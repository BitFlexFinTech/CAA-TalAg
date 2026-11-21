import React, { useState } from 'react';
import {
  Check,
  Film,
  Headphones,
  LayoutTemplate,
  MonitorPlay,
  QrCode,
  ShoppingBag,
  Sparkles,
  Store,
  Tag,
  Tv,
  Volume2,
} from 'lucide-react';
import {
  AmazonAdType,
  AmazonDisplaySize,
  AmazonDspSize,
  Campaign,
  CreativeAsset,
  ProductConcept,
} from '../../types/commerce';

export interface AdTemplateMeta {
  type: AmazonAdType;
  code: string;
  shortLabel: string;
  title: string;
  placement: string;
  specs: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const AD_TEMPLATES: AdTemplateMeta[] = [
  {
    type: 'Sponsored Products',
    code: 'SP',
    shortLabel: 'Sponsored Products',
    title: 'Sponsored Products',
    placement: 'amazon.co.uk Search Grid & ASIN Detail Pages',
    specs: 'CPC · Live SP-API Vendor ASINs · Dynamic Bids',
    description:
      'Promotes individual iShowSpeed wholesale ASINs directly inside Amazon UK search results and complementary streetwear listings.',
    icon: ShoppingBag,
  },
  {
    type: 'Sponsored Brands — Product Collection',
    code: 'SBC',
    shortLabel: 'SB · Collection',
    title: 'Sponsored Brands · Collection',
    placement: 'Top-of-Search Banner + 3-ASIN Shelf',
    specs: 'CPC · 400×400 Brand Crest · 1200×625 Banner · ≤50 Chars',
    description:
      'Headline banner pairing your uploaded brand mark and 1200×625 visual with up to 3 Amazon UK wholesale products.',
    icon: Tag,
  },
  {
    type: 'Sponsored Brands — Store Spotlight',
    code: 'SBS',
    shortLabel: 'SB · Store Spotlight',
    title: 'Sponsored Brands · Store Spotlight',
    placement: 'Top-of-Search 3-Tile Brand Store Shelf',
    specs: 'CPC · Links to 3 amazon.co.uk/ishowspeed Sub-Pages',
    description:
      'Drives high-intent UK shoppers straight from top-of-search into curated iShowSpeed Brand Store capsule categories.',
    icon: Store,
  },
  {
    type: 'Sponsored Brands — Video',
    code: 'SBV',
    shortLabel: 'SB · Video',
    title: 'Sponsored Brands · Video',
    placement: 'Mid-Search Autoplay 16:9 Video + Featured ASIN',
    specs: 'CPC · 16:9 MP4 (6s–45s) · Single Featured ASIN',
    description:
      'High-attention autoplay video unit inside UK search results paired with a single-click featured product card.',
    icon: Film,
  },
  {
    type: 'Sponsored Display',
    code: 'SD',
    shortLabel: 'Sponsored Display',
    title: 'Sponsored Display',
    placement: 'On-Amazon Detail Pages & Web Remarketing',
    specs: 'CPC / vCPM · Slots: 300×250 · 728×90 · 300×600 · 320×50',
    description:
      'Re-engages UK shoppers who viewed iShowSpeed ASINs or browsed football & creator streetwear categories.',
    icon: LayoutTemplate,
  },
  {
    type: 'Sponsored TV',
    code: 'STV',
    shortLabel: 'Sponsored TV',
    title: 'Sponsored TV',
    placement: 'Prime Video UK, Twitch UK & Fire TV Channels',
    specs: 'vCPM · 15s/30s Living-Room Streaming Spot + QR Overlay',
    description:
      'Full-screen connected TV video spots reaching UK 18–34 football and streaming audiences with instant QR/ASIN shopping.',
    icon: Tv,
  },
  {
    type: 'Amazon DSP Display',
    code: 'DSP',
    shortLabel: 'Amazon DSP',
    title: 'Amazon DSP Display',
    placement: 'Off-Site UK Publishers, IMDb UK & Open Exchange',
    specs: 'Programmatic CPM · 970×250 · 300×250 · 320×50',
    description:
      'Programmatic off-Amazon retargeting and lookalike reach across major UK media with dynamic Prime delivery badging.',
    icon: MonitorPlay,
  },
  {
    type: 'Brand Store & Posts',
    code: 'STR',
    shortLabel: 'Brand Store & Posts',
    title: 'Brand Store & Amazon Posts',
    placement: 'amazon.co.uk/ishowspeed Storefront & Feed',
    specs: 'Organic & Paid Landing · Multi-Page Brand Registry Hub',
    description:
      'Dedicated UK Brand Store home page and shoppable lifestyle Posts showcasing the full Speed FC capsule.',
    icon: Sparkles,
  },
  {
    type: 'Amazon Audio Ads',
    code: 'AUD',
    shortLabel: 'Audio Ads',
    title: 'Amazon Audio Ads',
    placement: 'Amazon Music UK Free Tier & Alexa / Echo Show',
    specs: 'CPM · 15s/30s Audio Spot + Companion Display Tile',
    description:
      'Voice-actionable 15s/30s audio spots on Amazon Music UK and Alexa devices with companion ASIN checkout cards.',
    icon: Headphones,
  },
];

interface AmazonAdPreviewCanvasProps {
  campaign: Campaign;
  products: ProductConcept[];
  assets: CreativeAsset[];
  compact?: boolean;
}

function buildPlaceholderProductSvg(label: string): string {
  const safe = label.replace(/[<>&"']/g, '').slice(0, 22) || 'DRAFT CONCEPT';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#18181B"/><rect x="20" y="20" width="360" height="360" fill="none" stroke="#3F3F46" stroke-width="2"/><path d="M24 340 L376 60" stroke="#BC1F2F" stroke-width="3" opacity="0.5"/><text x="36" y="72" fill="#BC1F2F" font-family="monospace" font-size="14" font-weight="bold">AMAZON UK · DRAFT ASIN</text><text x="36" y="206" fill="#FFFFFF" font-family="sans-serif" font-size="24" font-weight="800">${safe}</text><text x="36" y="236" fill="#A1A1AA" font-family="sans-serif" font-size="13">Create concepts to populate live SKUs</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function buildPlaceholderBannerSvg(label: string): string {
  const safe = label.replace(/[<>&"']/g, '').slice(0, 32) || 'AMAZON UK CAMPAIGN';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="625" viewBox="0 0 1200 625"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#09090B"/><stop offset="60%" stop-color="#26080D"/><stop offset="100%" stop-color="#BC1F2F"/></linearGradient></defs><rect width="1200" height="625" fill="url(#g)"/><text x="64" y="290" fill="#F59E0B" font-family="monospace" font-size="22" font-weight="bold">AMAZON.CO.UK AD PLACEMENT</text><text x="64" y="355" fill="#FFFFFF" font-family="sans-serif" font-size="46" font-weight="800">${safe}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const BrandMarkBadge: React.FC<{
  logoSrc?: string;
  variant?: 'square' | 'wide-light' | 'compact';
}> = ({ logoSrc, variant = 'wide-light' }) => {
  if (logoSrc) {
    if (variant === 'square') {
      return (
        <div className="w-9 h-9 rounded border border-zinc-800 bg-zinc-950 p-1.5 flex items-center justify-center shrink-0">
          <img src={logoSrc} alt="Brand Mark" className="w-full h-full object-contain" />
        </div>
      );
    }
    if (variant === 'compact') {
      return (
        <img
          src={logoSrc}
          alt="Brand Mark"
          className="w-7 h-7 object-contain bg-zinc-900 rounded p-0.5 shrink-0"
        />
      );
    }
    return <img src={logoSrc} alt="Brand Mark" className="h-5 w-auto object-contain shrink-0" />;
  }

  if (variant === 'square') {
    return (
      <div className="w-9 h-9 rounded border border-zinc-800 bg-zinc-950 flex items-center justify-center shrink-0">
        <span className="text-[9px] font-black tracking-tighter text-amber-300">SPEED</span>
      </div>
    );
  }
  if (variant === 'compact') {
    return (
      <div className="w-7 h-7 rounded bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0">
        <span className="text-[7px] font-black tracking-tighter text-amber-300">SPD</span>
      </div>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[10px] font-black tracking-widest text-white shrink-0">
      SPEED
    </span>
  );
};

const DRAFT_FALLBACK_PRODUCT: ProductConcept = {
  id: 'draft-asin-slot',
  sku: 'ISS-UK-DRAFT',
  name: 'iShowSpeed UK Product Concept (Draft Slot)',
  image: buildPlaceholderProductSvg('UK CONCEPT SLOT'),
  imageNote: 'Illustrative draft slot',
  description: 'Draft placement preview until you create a product concept.',
  category: 'Graphic T-Shirts',
  collectionId: '',
  developmentStage: 'Concept Draft',
  proposedCost: 11.5,
  proposedRetail: 38.0,
  proposedWholesale: 21.0,
  approvalStatus: 'Draft',
  fabricSpec: '240gsm Heavyweight Cotton',
  targetRelease: 'Q2 2027',
  createdAt: '2026-11-20',
  updatedAt: '2026-11-20',
  amazonAsinDemo: 'B0ISSUK01',
};

export const AmazonAdPreviewCanvas: React.FC<AmazonAdPreviewCanvasProps> = ({
  campaign,
  products,
  assets,
  compact = false,
}) => {
  const [audioPreviewPlaying, setAudioPreviewPlaying] = useState(false);

  const cfg = campaign.amazonAds;
  const linkedProducts = products.filter((p) => campaign.associatedProductIds.includes(p.id));
  const fallbackProds = linkedProducts.length > 0 ? linkedProducts : products.slice(0, 3);
  const primaryProd = fallbackProds[0] ?? products[0] ?? DRAFT_FALLBACK_PRODUCT;
  const shelfProds = fallbackProds.length > 0 ? fallbackProds.slice(0, 3) : [DRAFT_FALLBACK_PRODUCT];

  const uploadedLogo = assets.find(
    (a) => a.assetType === 'Official Logos & Marks' && (!a.mediaType || a.mediaType === 'image')
  );

  const customImageSrc =
    cfg.customMediaUrl ||
    campaign.heroImage ||
    buildPlaceholderBannerSvg(cfg.headline || campaign.name);
  const customVideoAsset = assets.find(
    (a) =>
      a.src === cfg.customVideoUrl ||
      (a.mediaType === 'video' && campaign.creativeAssetIds.includes(a.id))
  );
  const videoSrc = cfg.customVideoUrl || customVideoAsset?.src;

  const wrapperPad = compact ? 'p-3.5' : 'p-5';

  if (cfg.adType === 'Sponsored Products') {
    return (
      <div className={`bg-zinc-100 border border-zinc-200 rounded-md ${wrapperPad}`}>
        <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-3 gap-2">
          <span className="font-medium text-zinc-700 truncate">
            amazon.co.uk Search Placement · Sponsored Products
          </span>
          <span className="font-mono-tabular shrink-0">{cfg.marketplaceId}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-2xl mx-auto">
          {(shelfProds.length >= 2 ? shelfProds.slice(0, 2) : [primaryProd]).map((prod, i) => (
            <div
              key={prod.id + i}
              className="bg-white border border-zinc-200 rounded p-3 flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-2">
                  <span>Sponsored</span>
                  <span className="font-mono-tabular">{prod.amazonAsinDemo || 'B0ISSUK01'}</span>
                </div>
                <div className="aspect-square bg-zinc-50 rounded overflow-hidden border border-zinc-100 mb-2.5">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain p-2"
                  />
                </div>
                <p className="text-[11px] font-medium text-zinc-500">{cfg.brandName}</p>
                <p className="text-xs font-semibold text-zinc-900 line-clamp-2 mt-0.5 leading-snug">
                  {prod.name}
                </p>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-amber-600">
                  <span>★★★★☆</span>
                  <span className="text-zinc-400 font-mono-tabular">(UK Prime)</span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-zinc-100 flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] align-top text-zinc-700">£</span>
                  <span className="font-mono-tabular text-base font-bold text-zinc-900">
                    {Math.floor(prod.proposedRetail)}
                  </span>
                  <span className="text-[11px] font-mono-tabular text-zinc-700">
                    .{(prod.proposedRetail % 1).toFixed(2).slice(2)}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-sky-700 inline-flex items-center gap-0.5">
                  <Check className="w-3 h-3 text-amber-500" />
                  prime
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (
    cfg.adType === 'Sponsored Brands — Product Collection' ||
    cfg.adType === 'Sponsored Brands — Store Spotlight' ||
    cfg.adType === 'Sponsored Brands — Video'
  ) {
    const sbMode =
      cfg.adType === 'Sponsored Brands — Store Spotlight'
        ? 'STORE_SPOTLIGHT'
        : cfg.adType === 'Sponsored Brands — Video'
        ? 'VIDEO'
        : 'PRODUCT_COLLECTION';

    return (
      <div className={`bg-zinc-100 border border-zinc-200 rounded-md ${wrapperPad} space-y-3`}>
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-500">
          <span className="font-medium text-zinc-700">
            amazon.co.uk Top-of-Search · {cfg.adType}
          </span>
          <span className="font-mono-tabular">
            Headline ({cfg.headline.length}/50)
          </span>
        </div>

        <div className="bg-white border border-zinc-300 rounded overflow-hidden shadow-xs">
          <div className="px-4 py-2.5 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3 bg-white">
            <div className="flex items-center gap-3 min-w-0">
              <BrandMarkBadge logoSrc={uploadedLogo?.src} variant="square" />
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                  <span>Sponsored</span>
                  <span aria-hidden="true">·</span>
                  <span>{cfg.brandName}</span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-zinc-900 leading-tight truncate">
                  {cfg.headline || 'Official iShowSpeed UK Core Apparel Drop'}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-medium text-sky-700 shrink-0">
              Shop on Amazon UK →
            </span>
          </div>

          {sbMode === 'PRODUCT_COLLECTION' && (
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-5 relative bg-zinc-900 min-h-[190px]">
                <img
                  src={customImageSrc}
                  alt={campaign.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center max-h-[240px]"
                />
                <div className="absolute bottom-2 left-2 bg-black/75 text-white text-[10px] px-2 py-0.5 rounded-xs font-mono-tabular">
                  1200×625 Custom Image
                </div>
              </div>
              <div className="lg:col-span-7 grid grid-cols-3 divide-x divide-zinc-200 bg-white">
                {shelfProds.map((prod) => (
                  <div key={prod.id} className="p-2.5 flex flex-col justify-between">
                    <div>
                      <div className="aspect-square bg-zinc-50 rounded overflow-hidden mb-1.5 border border-zinc-100">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain p-1.5"
                        />
                      </div>
                      <p className="text-[11px] font-medium text-zinc-900 line-clamp-2 leading-snug">
                        {prod.name}
                      </p>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-zinc-100 flex items-center justify-between text-[11px]">
                      <span className="font-mono-tabular font-semibold text-zinc-900">
                        £{prod.proposedRetail.toFixed(2)}
                      </span>
                      <span className="text-[10px] font-mono-tabular text-zinc-400">
                        {prod.amazonAsinDemo || 'B0ISSUK'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sbMode === 'STORE_SPOTLIGHT' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 bg-white">
              {[
                {
                  title: 'Speed FC Kits & Tees',
                  sub: 'UK Matchday Capsule',
                  prod: shelfProds[0] || primaryProd,
                },
                {
                  title: 'Heavyweight Fleece & Caps',
                  sub: 'UK Embroidery Hub',
                  prod: shelfProds[1] || primaryProd,
                },
                {
                  title: 'Collector Editions',
                  sub: 'Archival Foil Boxed',
                  prod: shelfProds[2] || primaryProd,
                },
              ].map((tile) => (
                <div key={tile.title} className="p-3.5 flex flex-col justify-between bg-zinc-50/40">
                  <div>
                    <p className="text-xs font-semibold text-zinc-900">{tile.title}</p>
                    <p className="text-[11px] text-zinc-500">{tile.sub}</p>
                  </div>
                  <div className="my-2.5 aspect-[4/3] bg-white border border-zinc-200 rounded overflow-hidden">
                    <img
                      src={tile.prod.image}
                      alt={tile.prod.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                  <span className="text-[11px] font-medium text-sky-700">Visit Store Page →</span>
                </div>
              ))}
            </div>
          )}

          {sbMode === 'VIDEO' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 bg-zinc-950 text-white">
              <div className="lg:col-span-8 relative flex items-center justify-center bg-black min-h-[210px]">
                {videoSrc ? (
                  <video
                    src={videoSrc}
                    controls
                    playsInline
                    className="w-full max-h-[250px] object-contain"
                  />
                ) : (
                  <div className="relative w-full h-full min-h-[210px]">
                    <img
                      src={customImageSrc}
                      alt={campaign.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full max-h-[240px] object-cover object-center opacity-85"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/45 p-4 text-center">
                      <Film className="w-6 h-6 text-white mb-1.5" />
                      <p className="text-xs font-semibold text-white">
                        16:9 Sponsored Brands Video Slot
                      </p>
                      <p className="text-[11px] text-zinc-300 mt-1 max-w-sm">
                        Autoplay search video frame · Attach an MP4 in Creative Assets for live video playback.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="lg:col-span-4 bg-white text-zinc-900 p-3.5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono-tabular text-zinc-400">
                    FEATURED ASIN · {primaryProd.amazonAsinDemo || 'B0ISSUK01'}
                  </span>
                  <div className="aspect-square bg-zinc-50 border border-zinc-200 rounded my-2 overflow-hidden">
                    <img
                      src={primaryProd.image}
                      alt={primaryProd.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                  <p className="text-xs font-semibold text-zinc-900 line-clamp-2">
                    {primaryProd.name}
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-zinc-200 flex items-center justify-between">
                  <span className="font-mono-tabular text-sm font-bold text-zinc-900">
                    £{primaryProd.proposedRetail.toFixed(2)}
                  </span>
                  <span className="text-[11px] font-medium px-2 py-1 bg-amber-300 text-zinc-900 rounded">
                    Shop Now
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (cfg.adType === 'Sponsored TV') {
    return (
      <div className={`bg-zinc-100 border border-zinc-200 rounded-md ${wrapperPad} space-y-3`}>
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-500">
          <span className="font-medium text-zinc-700">
            Prime Video UK & Twitch CTV · Sponsored TV ({cfg.tvFormat || '15s Streaming Spot'})
          </span>
          <span className="font-mono-tabular">1920×1080 16:9</span>
        </div>

        <div className="bg-zinc-950 rounded-md border-4 border-zinc-800 overflow-hidden shadow-sm relative aspect-video">
          {videoSrc ? (
            <video src={videoSrc} controls playsInline className="w-full h-full object-cover" />
          ) : (
            <img
              src={customImageSrc}
              alt={campaign.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/45 p-4 flex flex-col justify-between pointer-events-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BrandMarkBadge logoSrc={uploadedLogo?.src} variant="wide-light" />
                <span className="text-[10px] font-mono-tabular text-zinc-200 bg-black/60 px-2 py-0.5 rounded-xs">
                  Ad · {cfg.tvFormat === '30s Prime Video Spot' ? '0:30' : '0:15'}
                </span>
              </div>
              <span className="text-[10px] text-zinc-200 bg-black/60 px-2 py-0.5 rounded-xs">
                Prime Video UK · Twitch CTV
              </span>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="max-w-xs">
                <p className="text-[10px] font-medium text-amber-300">Amazon.co.uk Official Drop</p>
                <p className="text-sm sm:text-base font-bold text-white leading-tight mt-0.5">
                  {cfg.headline || 'Official Speed FC UK Drop'}
                </p>
                <p className="text-[11px] text-zinc-300 mt-0.5 truncate">
                  {primaryProd.name} · £{primaryProd.proposedRetail.toFixed(2)} Prime UK
                </p>
              </div>

              <div className="bg-white text-zinc-900 rounded p-2 flex items-center gap-2 shadow-md">
                <div className="w-8 h-8 bg-zinc-100 border border-zinc-200 rounded flex items-center justify-center shrink-0">
                  <QrCode className="w-5 h-5 text-zinc-900" />
                </div>
                <div className="text-[10px] leading-tight">
                  <p className="font-bold text-zinc-900">Scan to Shop</p>
                  <p className="text-zinc-600 font-mono-tabular">
                    {primaryProd.amazonAsinDemo || 'B0ISSSFC1UK'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cfg.adType === 'Amazon DSP Display') {
    const dspSize: AmazonDspSize = cfg.dspSize || '970x250';
    return (
      <div className={`bg-zinc-100 border border-zinc-200 rounded-md ${wrapperPad} space-y-3`}>
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-500">
          <span className="font-medium text-zinc-700">
            Off-Amazon UK Publisher Preview · Amazon DSP ({dspSize})
          </span>
          <span className="font-mono-tabular">IMDb UK · UK Sports Media</span>
        </div>

        <div className="flex justify-center overflow-x-auto py-1">
          {dspSize === '970x250' && (
            <div className="w-full max-w-[680px] bg-zinc-950 text-white border border-zinc-800 rounded overflow-hidden grid grid-cols-12 shadow-xs">
              <div className="col-span-5 bg-zinc-900 p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <BrandMarkBadge logoSrc={uploadedLogo?.src} variant="wide-light" />
                  <span className="text-[9px] text-zinc-400">AdChoices</span>
                </div>
                <div className="my-2">
                  <p className="text-xs sm:text-sm font-bold text-white leading-snug">
                    {cfg.headline || 'Official SPEED Streetwear — Next-Day Prime UK'}
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-1 truncate">{primaryProd.name}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800 gap-2">
                  <span className="font-mono-tabular text-sm font-bold text-amber-300">
                    £{primaryProd.proposedRetail.toFixed(2)}
                  </span>
                  <span className="px-2.5 py-1 bg-[#BC1F2F] text-white text-[10px] font-semibold rounded-xs whitespace-nowrap">
                    Shop Amazon.co.uk
                  </span>
                </div>
              </div>
              <div className="col-span-7 grid grid-cols-2 bg-white">
                <img
                  src={customImageSrc}
                  alt={primaryProd.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full max-h-[190px] object-cover"
                />
                <img
                  src={primaryProd.image}
                  alt={primaryProd.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full max-h-[190px] object-contain p-2.5 bg-zinc-50"
                />
              </div>
            </div>
          )}

          {dspSize === '300x250' && (
            <div className="w-[300px] h-[250px] bg-zinc-950 text-white border border-zinc-800 flex flex-col justify-between overflow-hidden shrink-0">
              <div className="relative h-[132px] bg-zinc-900">
                <img
                  src={primaryProd.image}
                  alt={primaryProd.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain p-2 bg-zinc-100"
                />
                <span className="absolute top-1.5 right-1.5 bg-black/75 text-white text-[9px] px-1.5 py-0.5 rounded-xs">
                  DSP · Ad
                </span>
              </div>
              <div className="p-3 flex flex-col justify-between flex-1">
                <p className="text-xs font-bold text-white line-clamp-1">
                  {cfg.headline || primaryProd.name}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-mono-tabular text-sm font-bold text-amber-300">
                    £{primaryProd.proposedRetail.toFixed(2)} · prime
                  </span>
                  <span className="px-2.5 py-1 bg-[#BC1F2F] text-white text-[10px] font-semibold rounded-xs">
                    Shop Now
                  </span>
                </div>
              </div>
            </div>
          )}

          {dspSize === '320x50' && (
            <div className="w-[320px] h-[54px] bg-zinc-950 text-white border border-zinc-800 px-2.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <BrandMarkBadge logoSrc={uploadedLogo?.src} variant="compact" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold truncate">{cfg.headline}</p>
                  <p className="text-[9px] text-amber-300 font-mono-tabular">
                    £{primaryProd.proposedRetail.toFixed(2)} · Amazon.co.uk
                  </p>
                </div>
              </div>
              <span className="px-2 py-1 bg-[#BC1F2F] text-white text-[10px] font-semibold rounded-xs shrink-0">
                Shop
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (cfg.adType === 'Brand Store & Posts') {
    return (
      <div className={`bg-zinc-100 border border-zinc-200 rounded-md ${wrapperPad} space-y-3`}>
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-500">
          <span className="font-medium text-zinc-700">
            Amazon UK Brand Store & Shoppable Posts Preview
          </span>
          <span className="font-mono-tabular">{cfg.storeSlug || 'amazon.co.uk/ishowspeed'}</span>
        </div>

        <div className="bg-white border border-zinc-300 rounded overflow-hidden shadow-xs">
          <div className="bg-zinc-950 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <BrandMarkBadge logoSrc={uploadedLogo?.src} variant="wide-light" />
              <span className="text-[11px] text-zinc-400 font-mono-tabular">
                {cfg.storeSlug || 'amazon.co.uk/ishowspeed'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-zinc-300">
              <span className="text-white font-semibold border-b border-[#BC1F2F] pb-0.5">Home</span>
              <span>Speed FC</span>
              <span>Fleece</span>
              <span>Archive</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-5 relative bg-zinc-900 min-h-[190px]">
              <img
                src={customImageSrc}
                alt="iShowSpeed Brand Store Hero"
                referrerPolicy="no-referrer"
                className="w-full h-full max-h-[240px] object-cover object-center"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3 text-white">
                <p className="text-[10px] text-amber-300 font-medium">Amazon Post · Shoppable</p>
                <p className="text-xs font-bold mt-0.5">{cfg.headline}</p>
              </div>
            </div>
            <div className="lg:col-span-7 p-3.5 grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-white">
              {shelfProds.map((prod) => (
                <div key={prod.id} className="border border-zinc-200 rounded p-2 flex flex-col justify-between">
                  <div>
                    <div className="aspect-square bg-zinc-50 rounded overflow-hidden mb-1.5">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <p className="text-[11px] font-medium text-zinc-900 line-clamp-2">{prod.name}</p>
                  </div>
                  <p className="font-mono-tabular text-xs font-bold text-zinc-900 mt-1.5">
                    £{prod.proposedRetail.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cfg.adType === 'Amazon Audio Ads') {
    return (
      <div className={`bg-zinc-100 border border-zinc-200 rounded-md ${wrapperPad} space-y-3`}>
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-500">
          <span className="font-medium text-zinc-700">
            Amazon Music UK & Echo Show · {cfg.audioLength || '15s Alexa Spot'}
          </span>
          <span className="font-mono-tabular">Voice CTA + Companion Tile</span>
        </div>

        <div className="bg-zinc-950 text-white border border-zinc-800 rounded-md p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-7 space-y-2.5">
            <div className="flex items-center gap-2 text-[11px] text-sky-300">
              <Volume2 className="w-4 h-4" />
              <span>Amazon Music UK Ad-Supported Stream · Echo Show</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-white leading-snug">
              {cfg.headline || 'Say "Alexa, Shop iShowSpeed UK"'}
            </p>
            <p className="text-xs text-zinc-300 italic leading-relaxed border-l-2 border-[#BC1F2F] pl-3">
              "Official {primaryProd.name} UK drop is live on Amazon.co.uk with Prime next-day delivery. Say: Alexa, add iShowSpeed merch to my basket."
            </p>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setAudioPreviewPlaying((p) => !p)}
                className="px-3 py-1.5 text-xs font-medium bg-[#BC1F2F] hover:bg-[#9E1927] text-white rounded transition-colors whitespace-nowrap"
              >
                {audioPreviewPlaying ? 'Stop Spot Simulation' : 'Simulate Audio Spot'}
              </button>
              <span className="font-mono-tabular text-[11px] text-zinc-400">
                {audioPreviewPlaying ? 'Playing 0:04 / 0:15' : '0:15 · 44.1kHz Stereo'}
              </span>
            </div>
          </div>

          <div className="md:col-span-5 bg-white text-zinc-900 rounded p-3 flex items-center gap-3">
            <img
              src={primaryProd.image}
              alt={primaryProd.name}
              referrerPolicy="no-referrer"
              className="w-14 h-14 object-contain border border-zinc-200 rounded p-1 bg-zinc-50 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold text-[#BC1F2F]">{cfg.brandName}</p>
              <p className="text-xs font-bold text-zinc-900 line-clamp-2">{primaryProd.name}</p>
              <p className="font-mono-tabular text-xs font-bold text-zinc-900 mt-1">
                £{primaryProd.proposedRetail.toFixed(2)} · prime
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sponsored Display Preview
  const sdSize: AmazonDisplaySize = cfg.sdSize || '300x250';

  return (
    <div className={`bg-zinc-100 border border-zinc-200 rounded-md ${wrapperPad} space-y-3`}>
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-500">
        <span className="font-medium text-zinc-700">
          Sponsored Display Placement · Responsive Slot ({sdSize})
        </span>
        <span className="font-mono-tabular">Audience: {cfg.keywords[0] || 'viewsRemarketing:30d'}</span>
      </div>

      <div className="flex justify-center overflow-x-auto py-1">
        {sdSize === '300x250' && (
          <div className="w-[300px] h-[250px] bg-white border border-zinc-300 shadow-xs flex flex-col justify-between overflow-hidden shrink-0">
            <div className="relative h-[128px] bg-zinc-900 overflow-hidden">
              <img
                src={customImageSrc}
                alt={campaign.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
              <span className="absolute top-1.5 right-1.5 bg-white/90 text-zinc-700 text-[9px] px-1.5 py-0.5 rounded-xs font-medium">
                Ad
              </span>
            </div>
            <div className="p-2.5 flex items-center gap-2.5 flex-1">
              <img
                src={primaryProd.image}
                alt={primaryProd.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 object-contain border border-zinc-200 rounded p-1 shrink-0 bg-zinc-50"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold text-[#BC1F2F] truncate">{cfg.brandName}</p>
                <p className="text-[11px] font-semibold text-zinc-900 line-clamp-2 leading-tight">
                  {cfg.headline || primaryProd.name}
                </p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="font-mono-tabular text-xs font-bold text-zinc-900">
                    £{primaryProd.proposedRetail.toFixed(2)}
                  </span>
                  <span className="px-2 py-0.5 bg-zinc-900 text-white text-[10px] font-medium rounded-xs">
                    Shop now
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {sdSize === '728x90' && (
          <div className="w-[728px] h-[90px] bg-white border border-zinc-300 shadow-xs flex items-center justify-between overflow-hidden shrink-0">
            <div className="flex items-center gap-3 h-full">
              <div className="w-[140px] h-full bg-zinc-900 overflow-hidden shrink-0">
                <img
                  src={customImageSrc}
                  alt={campaign.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <img
                src={primaryProd.image}
                alt={primaryProd.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 object-contain border border-zinc-200 rounded p-1 bg-zinc-50 shrink-0"
              />
              <div className="min-w-0 max-w-[300px]">
                <p className="text-[10px] font-semibold text-[#BC1F2F]">
                  {cfg.brandName} · amazon.co.uk
                </p>
                <p className="text-xs font-bold text-zinc-900 truncate">
                  {cfg.headline || primaryProd.name}
                </p>
                <p className="text-[11px] text-zinc-500 truncate">{primaryProd.name}</p>
              </div>
            </div>
            <div className="pr-4 flex items-center gap-3 shrink-0">
              <span className="font-mono-tabular text-sm font-bold text-zinc-900">
                £{primaryProd.proposedRetail.toFixed(2)}
              </span>
              <span className="px-3 py-1.5 bg-zinc-900 text-white text-xs font-medium rounded-xs">
                Shop now
              </span>
            </div>
          </div>
        )}

        {sdSize === '300x600' && (
          <div className="w-[300px] h-[420px] bg-white border border-zinc-300 shadow-xs flex flex-col justify-between overflow-hidden shrink-0">
            <div className="relative h-[190px] bg-zinc-900 overflow-hidden">
              <img
                src={customImageSrc}
                alt={campaign.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
              <span className="absolute top-2 right-2 bg-white/90 text-zinc-700 text-[10px] px-1.5 py-0.5 rounded-xs font-medium">
                Ad · 300×600
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div className="text-center">
                <p className="text-[11px] font-semibold text-[#BC1F2F]">{cfg.brandName}</p>
                <p className="text-xs font-bold text-zinc-900 mt-1 line-clamp-2">
                  {cfg.headline || primaryProd.name}
                </p>
              </div>
              <div className="my-2 flex justify-center">
                <img
                  src={primaryProd.image}
                  alt={primaryProd.name}
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 object-contain border border-zinc-200 rounded p-1.5 bg-zinc-50"
                />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                <span className="font-mono-tabular text-sm font-bold text-zinc-900">
                  £{primaryProd.proposedRetail.toFixed(2)}
                </span>
                <span className="px-3 py-1 bg-zinc-900 text-white text-xs font-medium rounded-xs">
                  Shop on Amazon UK
                </span>
              </div>
            </div>
          </div>
        )}

        {sdSize === '320x50' && (
          <div className="w-[320px] h-[50px] bg-white border border-zinc-300 shadow-xs px-2 flex items-center justify-between overflow-hidden shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={primaryProd.image}
                alt={primaryProd.name}
                referrerPolicy="no-referrer"
                className="w-9 h-9 object-contain border border-zinc-200 rounded p-0.5 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-zinc-900 truncate">
                  {cfg.headline || primaryProd.name}
                </p>
                <p className="text-[9px] text-zinc-500 font-mono-tabular">
                  {cfg.brandName} · £{primaryProd.proposedRetail.toFixed(2)}
                </p>
              </div>
            </div>
            <span className="px-2 py-1 bg-zinc-900 text-white text-[10px] font-medium rounded-xs shrink-0">
              Shop
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
