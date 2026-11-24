import React, { useMemo, useState } from 'react';
import { Download, Film, Music, Plus, Search, Shirt, Sparkles, Trash2, Upload } from 'lucide-react';
import { useCommerce } from '../context/CommerceContext';
import { CreativeAsset } from '../types/commerce';
import { MediaFrame } from '../components/common/MediaFrame';
import { Modal } from '../components/common/Modal';
import { AssetsLibrary, triggerAssetDownload } from '../components/assets/AssetsLibrary';
import { AiCreativeGeneratorModal } from '../components/assets/AiCreativeGeneratorModal';

const ASSET_TYPES: ('All' | CreativeAsset['assetType'])[] = [
  'All',
  'Official Logos & Marks',
  'Apparel & Product Designs',
  'Social & Ad Banners',
  'Talent Photography',
  'Campaign Video Asset',
];

export const AssetsView: React.FC = () => {
  const { assets, addGeneratedAsset, deleteAsset, setActiveSection, openLiveMockupStudio } =
    useCommerce();
  const [typeFilter, setTypeFilter] = useState<'All' | CreativeAsset['assetType']>('All');
  const [search, setSearch] = useState('');
  const [activeAsset, setActiveAsset] = useState<CreativeAsset | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState<CreativeAsset['assetType']>('Social & Ad Banners');
  const [uploadAttribution, setUploadAttribution] = useState('Internal CAA / Mercenta Creative Upload');
  const [uploadFileUrl, setUploadFileUrl] = useState<string | null>(null);
  const [uploadMediaType, setUploadMediaType] = useState<'image' | 'video'>('image');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return assets.filter((a) => {
      const matchType = typeFilter === 'All' || a.assetType === typeFilter;
      const matchSearch =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.attribution.toLowerCase().includes(q) ||
        a.linkedEntity.toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  }, [assets, typeFilter, search]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    setUploadMediaType(isVideo ? 'video' : 'image');
    if (isVideo) {
      setUploadType('Campaign Video Asset');
    }
    if (!uploadTitle.trim()) {
      setUploadTitle(file.name.replace(/\.[^.]+$/, ''));
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadFileUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFileUrl) return;
    addGeneratedAsset({
      title: uploadTitle.trim() || 'Uploaded Amazon UK Ad Creative',
      assetType: uploadType,
      mediaType: uploadMediaType,
      src: uploadFileUrl,
      dimensions: uploadMediaType === 'video' ? 'Uploaded Video Spot' : 'Custom Upload',
      licenseLabel: 'Local Workspace Upload (PoC)',
      attribution: uploadAttribution.trim() || 'CAA / Mercenta Studio',
      usageScope: 'Amazon UK Sponsored Brands & Sponsored Display Preview',
      linkedEntity: 'Amazon UK Campaigns',
    });
    setUploadOpen(false);
    setUploadTitle('');
    setUploadFileUrl(null);
  };

  const getMarkBgClass = (asset: CreativeAsset) => {
    if (asset.assetType !== 'Official Logos & Marks') {
      return 'object-cover object-top';
    }
    if (asset.src.includes('logo-white') || asset.src.includes('favicon')) {
      return 'object-contain p-6 bg-zinc-950';
    }
    return 'object-contain p-6 bg-zinc-50';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#BC1F2F] mb-1">
            Brand Logos, Custom Apparel Artwork, Ad Banners & Rights Repository
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            iShowSpeed Creative Assets
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            Upload your own brand logos, apparel designs, 16:9 Amazon UK ad banners, or generate creative variations with AI.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSection('campaigns')}
            className="px-3.5 py-2 text-xs font-medium text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50 rounded transition-colors whitespace-nowrap shrink-0"
          >
            Preview in Amazon Ads
          </button>
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-800 bg-white border border-zinc-300 hover:bg-zinc-100 rounded transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Creative</span>
          </button>
          <button
            type="button"
            onClick={() => setAiOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#BC1F2F] hover:bg-[#9E1927] rounded transition-colors whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate with AI</span>
          </button>
        </div>
      </div>

      {/* Top Section: Official Logos & Downloadable Design Team AssetsLibrary */}
      <AssetsLibrary
        assets={assets}
        onInspectAsset={setActiveAsset}
        onUseInCampaigns={() => setActiveSection('campaigns')}
        onMockupInStudio={(asset) => openLiveMockupStudio(asset.src)}
        onDeleteAsset={(id) => {
          deleteAsset(id);
          if (activeAsset?.id === id) setActiveAsset(null);
        }}
        onOpenUpload={() => setUploadOpen(true)}
        onOpenGenerateAi={() => setAiOpen(true)}
      />

      {/* Full Searchable Rights & Asset Archive */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-zinc-900">
            Complete Creative & Talent Rights Repository ({filtered.length})
          </h2>
        </div>
        <div className="bg-white border border-zinc-200 rounded-md p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {ASSET_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 text-xs rounded transition-colors ${
                typeFilter === t
                  ? 'bg-zinc-900 text-white font-medium'
                  : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter assets..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-zinc-300 rounded focus:outline-none focus:border-zinc-900"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-zinc-300 rounded-md p-10 text-center text-xs text-zinc-500">
          No assets match your active filter. Upload creative files or generate an asset using the buttons above.
        </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filtered.map((asset) => (
          <article
            key={asset.id}
            className="bg-white border border-zinc-200 rounded-md overflow-hidden text-left hover:border-zinc-400 transition-colors flex flex-col justify-between"
          >
            <button
              type="button"
              onClick={() => setActiveAsset(asset)}
              className="w-full text-left flex-1 flex flex-col focus:outline-none group"
            >
              {asset.mediaType === 'video' ? (
                <div className="aspect-[4/3] w-full bg-zinc-950 relative overflow-hidden">
                  <video src={asset.src} muted playsInline className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 bg-black/75 text-white text-[10px] px-2 py-0.5 rounded-xs inline-flex items-center gap-1">
                    <Film className="w-3 h-3" />
                    VIDEO
                  </span>
                </div>
              ) : asset.mediaType === 'audio' ? (
                <div className="aspect-[4/3] w-full bg-zinc-900 flex flex-col items-center justify-center p-4 text-center text-white">
                  <Music className="w-8 h-8 text-[#BC1F2F] mb-2" />
                  <span className="text-[11px] font-mono-tabular text-zinc-300">
                    {asset.dimensions}
                  </span>
                </div>
              ) : (
                <MediaFrame
                  src={asset.src}
                  alt={asset.title}
                  aspectClass="aspect-[4/3]"
                  imgClassName={`${getMarkBgClass(asset)} group-hover:scale-[1.02] transition-transform duration-200`}
                  className="w-full"
                />
              )}
              <div className="p-4 flex-1 flex flex-col justify-between gap-2 w-full">
                <div>
                  <p className="text-[11px] text-[#BC1F2F] font-medium">{asset.assetType}</p>
                  <h2 className="text-xs font-semibold text-zinc-900 mt-0.5 line-clamp-2">
                    {asset.title}
                  </h2>
                </div>
                <div className="pt-2 border-t border-zinc-100 text-[11px] text-zinc-500 space-y-0.5">
                  <p className="truncate">{asset.licenseLabel}</p>
                  <p className="font-mono-tabular text-zinc-400">{asset.dimensions}</p>
                </div>
              </div>
            </button>

            <div className="px-4 py-2.5 border-t border-zinc-100 bg-zinc-50/70 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => triggerAssetDownload(asset)}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-700 hover:text-zinc-900 transition-colors whitespace-nowrap shrink-0"
              >
                <Download className="w-3 h-3" />
                <span>Download</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteAsset(asset.id);
                  if (activeAsset?.id === asset.id) setActiveAsset(null);
                }}
                aria-label={`Delete ${asset.title}`}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-[#BC1F2F] transition-colors whitespace-nowrap shrink-0"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          </article>
        ))}
        </div>
      )}
      </div>

      {/* Asset Inspection Modal */}
      <Modal
        open={Boolean(activeAsset)}
        onClose={() => setActiveAsset(null)}
        title={activeAsset?.title ?? ''}
        subtitle={activeAsset ? `${activeAsset.assetType} · ${activeAsset.dimensions}` : undefined}
        maxWidthClass="max-w-2xl"
      >
        {activeAsset && (
          <div className="space-y-4">
            {activeAsset.mediaType === 'video' ? (
              <video
                src={activeAsset.src}
                controls
                playsInline
                className="w-full max-h-[360px] rounded bg-black"
              />
            ) : activeAsset.mediaType === 'audio' ? (
              <div className="bg-zinc-900 rounded p-5 space-y-3">
                <audio src={activeAsset.src} controls className="w-full" />
              </div>
            ) : (
              <MediaFrame
                src={activeAsset.src}
                alt={activeAsset.title}
                aspectClass="aspect-[4/3]"
                imgClassName={
                  activeAsset.assetType === 'Official Logos & Marks'
                    ? activeAsset.src.includes('signature')
                      ? 'object-contain p-8 bg-zinc-50'
                      : 'object-contain p-8 bg-zinc-950'
                    : 'object-contain bg-zinc-950'
                }
                className="rounded"
              />
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-zinc-50 border border-zinc-200 rounded p-4">
              <div>
                <p className="text-zinc-500">License / Classification</p>
                <p className="font-medium text-zinc-900 mt-0.5">{activeAsset.licenseLabel}</p>
              </div>
              <div>
                <p className="text-zinc-500">Attribution</p>
                <p className="font-medium text-zinc-900 mt-0.5">{activeAsset.attribution}</p>
              </div>
              <div>
                <p className="text-zinc-500">Linked Programme Entity</p>
                <p className="font-medium text-zinc-900 mt-0.5">{activeAsset.linkedEntity}</p>
              </div>
              <div>
                <p className="text-zinc-500">Permitted PoC Scope</p>
                <p className="font-medium text-zinc-900 mt-0.5">{activeAsset.usageScope}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-200">
              <button
                type="button"
                onClick={() => {
                  deleteAsset(activeAsset.id);
                  setActiveAsset(null);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#BC1F2F] border border-red-200 bg-red-50/60 hover:bg-red-100 rounded transition-colors whitespace-nowrap shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Asset</span>
              </button>
              <div className="flex items-center gap-2">
                {(!activeAsset.mediaType || activeAsset.mediaType === 'image') && (
                  <button
                    type="button"
                    onClick={() => {
                      const src = activeAsset.src;
                      setActiveAsset(null);
                      openLiveMockupStudio(src);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#BC1F2F] hover:bg-[#9E1927] rounded transition-colors whitespace-nowrap shrink-0"
                  >
                    <Shirt className="w-3.5 h-3.5" />
                    <span>Mockup in Studio</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => triggerAssetDownload(activeAsset)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-zinc-900 hover:bg-[#BC1F2F] rounded transition-colors whitespace-nowrap shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Local Creative Upload Modal */}
      <Modal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Upload Campaign Creative Asset"
        subtitle="Attach local 1200×625 banners, apparel artwork, or 16:9 Sponsored Brands video spots"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-zinc-700 mb-1">Select Image or Video File</label>
            <label className="flex items-center justify-center gap-2 px-4 py-6 border border-dashed border-zinc-300 rounded cursor-pointer hover:bg-zinc-50">
              <Upload className="w-4 h-4 text-zinc-500" />
              <span className="text-zinc-700 font-medium">
                {uploadFileUrl ? 'File loaded and ready' : 'Choose PNG, JPG, or MP4 file'}
              </span>
              <input
                type="file"
                accept="image/*,video/mp4,video/webm"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="block font-medium text-zinc-700 mb-1">Asset Title</label>
            <input
              type="text"
              required
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="e.g. UK Sponsored Brands 1200x625 Banner"
              className="w-full px-3 py-2 border border-zinc-300 rounded"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Asset Category</label>
              <select
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value as CreativeAsset['assetType'])}
                className="w-full px-3 py-2 border border-zinc-300 rounded bg-white"
              >
                <option value="Social & Ad Banners">Social & Ad Banners</option>
                <option value="Apparel & Product Designs">Apparel & Product Designs</option>
                <option value="Official Logos & Marks">Official Logos & Marks</option>
                <option value="Campaign Video Asset">Campaign Video Asset</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Attribution / Source</label>
              <input
                type="text"
                value={uploadAttribution}
                onChange={(e) => setUploadAttribution(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200">
            <button
              type="button"
              onClick={() => setUploadOpen(false)}
              className="px-3.5 py-2 font-medium text-zinc-700 border border-zinc-300 rounded hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!uploadFileUrl}
              className="px-4 py-2 font-medium text-white bg-[#BC1F2F] hover:bg-[#9E1927] disabled:opacity-50 rounded"
            >
              Save to Asset Library
            </button>
          </div>
        </form>
      </Modal>

      {/* AI Prompt Creative Generator Modal */}
      <AiCreativeGeneratorModal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        assets={assets}
        onSaveAsset={(asset) => {
          addGeneratedAsset(asset);
        }}
      />
    </div>
  );
};
