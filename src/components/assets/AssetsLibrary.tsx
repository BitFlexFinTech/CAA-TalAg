import React, { useMemo, useState } from 'react';
import { Check, Download, Eye, FileDown, Megaphone, Palette, Shirt, Sparkles, Trash2, Upload } from 'lucide-react';
import { CreativeAsset } from '../../types/commerce';
import { MediaFrame } from '../common/MediaFrame';

interface AssetsLibraryProps {
  assets: CreativeAsset[];
  onInspectAsset: (asset: CreativeAsset) => void;
  onUseInCampaigns: () => void;
  onMockupInStudio?: (asset: CreativeAsset) => void;
  onDeleteAsset?: (assetId: string) => void;
  onOpenUpload?: () => void;
  onOpenGenerateAi?: () => void;
}

type KitCategory = 'all' | 'logos' | 'apparel' | 'banners';

function buildSafeFilename(asset: CreativeAsset): string {
  const slug = asset.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  const cleanPath = asset.src.split('?')[0];
  const extMatch = cleanPath.match(/\.(png|jpg|jpeg|svg|webp|mp4|webm)$/i);
  const ext = extMatch ? extMatch[1].toLowerCase() : 'png';
  return `${slug}.${ext}`;
}

export async function triggerAssetDownload(asset: CreativeAsset): Promise<void> {
  const filename = buildSafeFilename(asset);
  try {
    const response = await fetch(asset.src);
    if (!response.ok) throw new Error('Fetch failed');
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
  } catch {
    const link = document.createElement('a');
    link.href = asset.src;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}

export const AssetsLibrary: React.FC<AssetsLibraryProps> = ({
  assets,
  onInspectAsset,
  onUseInCampaigns,
  onMockupInStudio,
  onDeleteAsset,
  onOpenUpload,
  onOpenGenerateAi,
}) => {
  const [kitFilter, setKitFilter] = useState<KitCategory>('all');
  const [downloadedId, setDownloadedId] = useState<string | null>(null);
  const [specDownloaded, setSpecDownloaded] = useState(false);

  const curatedAssets = useMemo(() => {
    return assets.filter((a) => {
      if (a.assetType === 'Talent Photography') return false;
      if (kitFilter === 'logos') return a.assetType === 'Official Logos & Marks';
      if (kitFilter === 'apparel') return a.assetType === 'Apparel & Product Designs';
      if (kitFilter === 'banners') {
        return a.assetType === 'Social & Ad Banners' || a.assetType === 'Campaign Video Asset';
      }
      return true;
    });
  }, [assets, kitFilter]);

  const logoAssets = useMemo(
    () => assets.filter((a) => a.assetType === 'Official Logos & Marks'),
    [assets]
  );

  const handleDownload = async (asset: CreativeAsset) => {
    await triggerAssetDownload(asset);
    setDownloadedId(asset.id);
    setTimeout(() => {
      setDownloadedId((curr) => (curr === asset.id ? null : curr));
    }, 1800);
  };

  const handleDownloadBrandSpec = () => {
    const manifest = {
      brand: 'iShowSpeed (Darren Watkins Jr.) — CAA Talent Commerce PoC',
      partner: 'Mercenta Partners',
      marketplace: 'Amazon UK Vendor Central (amazon.co.uk)',
      palette: {
        obsidian: '#111111',
        caaCrimson: '#BC1F2F',
        metallicGold: '#C69214',
        chalkWhite: '#F4F4F5',
      },
      officialLogos: logoAssets.map((a) => ({
        title: a.title,
        file: buildSafeFilename(a),
        dimensions: a.dimensions,
        usageScope: a.usageScope,
      })),
      brandedMockups: curatedAssets
        .filter((a) => a.assetType !== 'Official Logos & Marks')
        .map((a) => ({
          title: a.title,
          file: buildSafeFilename(a),
          dimensions: a.dimensions,
          linkedProduct: a.linkedEntity,
        })),
    };
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ishowspeed-uk-brand-kit-manifest.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    setSpecDownloaded(true);
    setTimeout(() => setSpecDownloaded(false), 1800);
  };

  const getVisualClass = (asset: CreativeAsset) => {
    if (asset.assetType === 'Official Logos & Marks') {
      if (asset.src.includes('signature')) {
        return 'object-contain p-5 bg-zinc-50';
      }
      return 'object-contain p-5 bg-zinc-950';
    }
    return 'object-cover';
  };

  return (
    <section
      aria-label="Official Brand Kit & Design Team Assets Library"
      className="bg-white border border-zinc-200 rounded-md overflow-hidden"
    >
      {/* Library Header */}
      <div className="px-6 py-5 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-4 bg-zinc-50/70">
        <div>
          <p className="text-[11px] font-medium text-[#BC1F2F] mb-0.5">
            Design Team Pack · Upload Custom Logos, Artwork & Ad Creatives
          </p>
          <h2 className="text-lg font-bold tracking-tight text-zinc-900">
            AssetsLibrary — Uploaded Logos & Branded Design Files
          </h2>
          <p className="text-xs text-zinc-600 mt-0.5 max-w-2xl">
            Upload the official logos, apparel artwork, and ad graphics you want to use — then attach them directly when creating manual product concepts, collections, and Amazon UK ad campaigns.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenGenerateAi && (
            <button
              type="button"
              onClick={onOpenGenerateAi}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#BC1F2F] hover:bg-[#9E1927] rounded transition-colors whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate with AI</span>
            </button>
          )}
          {onOpenUpload && (
            <button
              type="button"
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-800 bg-white border border-zinc-300 hover:bg-zinc-100 rounded transition-colors whitespace-nowrap shrink-0"
            >
              <Upload className="w-3.5 h-3.5 text-zinc-600" />
              <span>Upload Creative</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleDownloadBrandSpec}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-800 bg-white border border-zinc-300 hover:bg-zinc-100 rounded transition-colors whitespace-nowrap shrink-0"
          >
            {specDownloaded ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <FileDown className="w-3.5 h-3.5 text-[#BC1F2F]" />
            )}
            <span>{specDownloaded ? 'Spec Downloaded' : 'Download Brand Kit Manifest'}</span>
          </button>
          <button
            type="button"
            onClick={onUseInCampaigns}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-zinc-900 hover:bg-[#BC1F2F] rounded transition-colors whitespace-nowrap shrink-0"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Open Amazon UK Ad Builder</span>
          </button>
        </div>
      </div>

      {/* Official Brand Swatches & Filter Bar */}
      <div className="px-6 py-3.5 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'all', label: `All Brand Files (${curatedAssets.length})` },
              { id: 'logos', label: `Official Logos (${logoAssets.length})` },
              { id: 'apparel', label: 'Branded Apparel & Merch' },
              { id: 'banners', label: 'Ad Key Visuals' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setKitFilter(tab.id)}
              className={`px-3 py-1.5 text-xs rounded transition-colors whitespace-nowrap shrink-0 ${
                kitFilter === tab.id
                  ? 'bg-zinc-900 text-white font-medium'
                  : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Brand Palette Reference */}
        <div className="flex items-center gap-3 text-[11px] text-zinc-600 font-mono-tabular">
          <span className="inline-flex items-center gap-1 text-zinc-500 font-sans">
            <Palette className="w-3.5 h-3.5" />
            <span>Capsule Palette:</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#111111] border border-zinc-300 inline-block" />
            <span>#111111</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#BC1F2F] inline-block" />
            <span>#BC1F2F</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#C69214] inline-block" />
            <span>#C69214</span>
          </span>
        </div>
      </div>

      {/* Downloadable Brand Kit Grid or Clean Empty State */}
      {curatedAssets.length === 0 ? (
        <div className="p-10 text-center space-y-3">
          <p className="text-sm font-semibold text-zinc-900">
            No Creative Assets Uploaded Yet
          </p>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            Preloaded store logos and mockup images have been removed. Upload your own iShowSpeed logos, product graphics, or ad banners — or generate one with AI.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {onOpenUpload && (
              <button
                type="button"
                onClick={onOpenUpload}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-zinc-900 hover:bg-[#BC1F2F] rounded transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Logos or Artwork</span>
              </button>
            )}
            {onOpenGenerateAi && (
              <button
                type="button"
                onClick={onOpenGenerateAi}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#BC1F2F] border border-[#BC1F2F]/40 bg-red-50/40 hover:bg-red-50 rounded transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate with AI</span>
              </button>
            )}
          </div>
        </div>
      ) : (
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {curatedAssets.map((asset) => {
          const isDownloaded = downloadedId === asset.id;
          return (
            <article
              key={asset.id}
              className="border border-zinc-200 rounded-md overflow-hidden bg-white flex flex-col justify-between"
            >
              <div>
                <button
                  type="button"
                  onClick={() => onInspectAsset(asset)}
                  className="w-full block text-left group focus:outline-none"
                >
                  {asset.mediaType === 'video' ? (
                    <div className="aspect-[4/3] w-full bg-zinc-950 relative overflow-hidden">
                      <video
                        src={asset.src}
                        muted
                        playsInline
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                      />
                    </div>
                  ) : (
                    <MediaFrame
                      src={asset.src}
                      alt={asset.title}
                      aspectClass="aspect-[4/3]"
                      imgClassName={`${getVisualClass(asset)} group-hover:scale-[1.02] transition-transform duration-200`}
                    />
                  )}
                </button>
                <div className="p-4 space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="font-medium text-[#BC1F2F] truncate">{asset.assetType}</span>
                    <span className="font-mono-tabular text-zinc-400 shrink-0">
                      {buildSafeFilename(asset).split('.').pop()?.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-zinc-900 line-clamp-2 leading-snug">
                    {asset.title}
                  </h3>
                  <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                    {asset.usageScope}
                  </p>
                </div>
              </div>

              <div className="px-4 py-3 border-t border-zinc-100 bg-zinc-50/70 flex items-center justify-between gap-2">
                <span className="font-mono-tabular text-[10px] text-zinc-500 truncate">
                  {asset.dimensions}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {onMockupInStudio && (!asset.mediaType || asset.mediaType === 'image') && (
                    <button
                      type="button"
                      onClick={() => onMockupInStudio(asset)}
                      aria-label={`Mockup ${asset.title} in Live Studio`}
                      title="Mockup in Live Studio"
                      className="p-1.5 text-zinc-700 hover:text-[#BC1F2F] hover:border-[#BC1F2F] border border-zinc-200 bg-white rounded transition-colors"
                    >
                      <Shirt className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onDeleteAsset && (
                    <button
                      type="button"
                      onClick={() => onDeleteAsset(asset.id)}
                      aria-label={`Delete ${asset.title}`}
                      title="Delete file"
                      className="p-1.5 text-zinc-500 hover:text-[#BC1F2F] hover:border-red-200 border border-zinc-200 bg-white rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onInspectAsset(asset)}
                    aria-label={`Inspect ${asset.title}`}
                    title="Inspect file"
                    className="p-1.5 text-zinc-600 hover:text-zinc-900 border border-zinc-200 bg-white rounded transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload(asset)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                      isDownloaded
                        ? 'bg-emerald-700 text-white'
                        : 'bg-zinc-900 text-white hover:bg-[#BC1F2F]'
                    }`}
                  >
                    {isDownloaded ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Downloaded</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      )}
    </section>
  );
};
