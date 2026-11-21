import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  Download,
  Eye,
  EyeOff,
  ImagePlus,
  Layers,
  RotateCcw,
  Search,
  Sparkles,
  Type,
  Upload,
} from 'lucide-react';
import { useCommerce } from '../../context/CommerceContext';
import { fetchLiveCatalogVariants } from '../../data/catalogData';
import {
  CatalogBlankProduct,
  CatalogBlankVariant,
  CatalogFilterGroup,
  ProductCategory,
} from '../../types/commerce';
import {
  bakeMockupToDataUrl,
  DEFAULT_MOCKUP_PLACEMENT,
  MOCKUP_PRESETS,
  MockupBlendMode,
  MockupPlacement,
  MockupTextOverlay,
} from '../../utils/mockupCompositor';
import { LiveMockupStage } from './LiveMockupStage';

interface LiveMockupStudioProps {
  initialBlank?: CatalogBlankProduct | null;
  initialAssetSrc?: string | null;
  onSavedConcept?: (conceptName: string) => void;
}

const STUDIO_FILTER_GROUPS: CatalogFilterGroup[] = [
  'All',
  'T-Shirts',
  'Hoodies & Fleece',
  'Jerseys & Kits',
  'Caps & Headwear',
  'Drinkware & Lifestyle',
];

const STAMP_COLORS = ['#FFFFFF', '#111111', '#BC1F2F', '#F59E0B', '#E4E4E7'];

export const LiveMockupStudio: React.FC<LiveMockupStudioProps> = ({
  initialBlank,
  initialAssetSrc,
  onSavedConcept,
}) => {
  const {
    catalogProducts,
    assets,
    collections,
    products,
    addProduct,
    addGeneratedAsset,
    promoteCatalogVariantToConcept,
  } = useCommerce();

  const artworkInputRef = useRef<HTMLInputElement | null>(null);
  const blankUploadRef = useRef<HTMLInputElement | null>(null);

  // Blank selection state
  const [blankSearch, setBlankSearch] = useState('');
  const [blankGroup, setBlankGroup] = useState<CatalogFilterGroup>('All');
  const [selectedBlankId, setSelectedBlankId] = useState<string>(
    initialBlank?.id ?? catalogProducts[0]?.id ?? ''
  );
  const [customBlankSrc, setCustomBlankSrc] = useState<string | null>(null);
  const [customBlankLabel, setCustomBlankLabel] = useState<string>('');

  // Live variant fetching for chosen blank
  const [variants, setVariants] = useState<CatalogBlankVariant[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('L');

  // Artwork & text overlay state
  const imageAssets = useMemo(
    () => assets.filter((a) => !a.mediaType || a.mediaType === 'image'),
    [assets]
  );
  const [selectedArtworkSrc, setSelectedArtworkSrc] = useState<string>(
    initialAssetSrc ?? imageAssets[0]?.src ?? ''
  );
  const [selectedArtworkTitle, setSelectedArtworkTitle] = useState<string>(
    imageAssets[0]?.title ?? 'Custom Graphic'
  );
  const [useTextStamp, setUseTextStamp] = useState<boolean>(
    !initialAssetSrc && imageAssets.length === 0
  );
  const [textOverlay, setTextOverlay] = useState<MockupTextOverlay>({
    text: 'SPEED',
    color: '#FFFFFF',
    sizePct: 6,
    uppercase: true,
  });

  // Real-time placement state
  const [placement, setPlacement] = useState<MockupPlacement>(DEFAULT_MOCKUP_PLACEMENT);
  const [showGuides, setShowGuides] = useState(true);

  // Save concept state
  const [conceptName, setConceptName] = useState('');
  const [collectionId, setCollectionId] = useState<string>(collections[0]?.id ?? '');
  const [wholesalePrice, setWholesalePrice] = useState('24.00');
  const [retailPrice, setRetailPrice] = useState('44.99');
  const [alsoSaveToAssets, setAlsoSaveToAssets] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Sync external pre-selections
  useEffect(() => {
    if (initialBlank) {
      setSelectedBlankId(initialBlank.id);
      setCustomBlankSrc(null);
    }
  }, [initialBlank]);

  useEffect(() => {
    if (initialAssetSrc) {
      setSelectedArtworkSrc(initialAssetSrc);
      const matched = imageAssets.find((a) => a.src === initialAssetSrc);
      if (matched) setSelectedArtworkTitle(matched.title);
    }
  }, [initialAssetSrc, imageAssets]);

  useEffect(() => {
    setCollectionId((prev) =>
      collections.some((c) => c.id === prev) ? prev : collections[0]?.id ?? ''
    );
  }, [collections]);

  // Default first catalog blank once catalog hydrates
  useEffect(() => {
    if (!selectedBlankId && catalogProducts.length > 0) {
      const preferred =
        catalogProducts.find((p) => p.filterGroup === 'Hoodies & Fleece') ||
        catalogProducts.find((p) => p.filterGroup === 'T-Shirts') ||
        catalogProducts[0];
      setSelectedBlankId(preferred.id);
    }
  }, [catalogProducts, selectedBlankId]);

  const filteredBlanks = useMemo(() => {
    const q = blankSearch.trim().toLowerCase();
    return catalogProducts
      .filter((b) => {
        const matchGroup = blankGroup === 'All' || b.filterGroup === blankGroup;
        const matchQ =
          !q ||
          `${b.title} ${b.typeName} ${b.brandSpec} ${b.skuCode}`.toLowerCase().includes(q);
        return matchGroup && matchQ;
      })
      .slice(0, 24);
  }, [catalogProducts, blankSearch, blankGroup]);

  const activeBlank = useMemo(
    () => catalogProducts.find((b) => b.id === selectedBlankId) ?? catalogProducts[0] ?? null,
    [catalogProducts, selectedBlankId]
  );

  // Fetch live variants whenever blank changes
  useEffect(() => {
    if (!activeBlank || customBlankSrc) {
      setVariants([]);
      setLoadingVariants(false);
      return;
    }
    if (activeBlank.variants && activeBlank.variants.length > 0) {
      setVariants(activeBlank.variants);
      setLoadingVariants(false);
      return;
    }
    let alive = true;
    setLoadingVariants(true);
    fetchLiveCatalogVariants(activeBlank).then((vars) => {
      if (alive) {
        setVariants(vars);
        setLoadingVariants(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [activeBlank, customBlankSrc]);

  const uniqueColors = useMemo(() => {
    const map = new Map<string, { color: string; hex: string; image: string }>();
    for (const v of variants) {
      if (!map.has(v.color)) {
        map.set(v.color, {
          color: v.color,
          hex: v.colorHex || '#18181B',
          image: v.image,
        });
      }
    }
    return Array.from(map.values());
  }, [variants]);

  useEffect(() => {
    if (uniqueColors.length > 0 && !uniqueColors.some((c) => c.color === selectedColor)) {
      setSelectedColor(uniqueColors[0].color);
    }
  }, [uniqueColors, selectedColor]);

  const activeVariant = useMemo(() => {
    if (!variants.length) return null;
    return (
      variants.find((v) => v.color === selectedColor && v.size === selectedSize) ||
      variants.find((v) => v.color === selectedColor) ||
      variants[0]
    );
  }, [variants, selectedColor, selectedSize]);

  // Suggest sensible concept name and pricing when blank changes
  useEffect(() => {
    if (customBlankSrc) {
      if (!conceptName) setConceptName(`iShowSpeed × ${customBlankLabel || 'Custom Concept'}`);
      return;
    }
    if (!activeBlank) return;
    setConceptName(`iShowSpeed × ${activeBlank.title}`);
    const baseCost = activeVariant ? activeVariant.singleUnitCostGBP * 0.72 : 12;
    const whsl = Number((baseCost * 1.95).toFixed(2));
    const rrp = Number((whsl * 1.85).toFixed(2));
    setWholesalePrice(whsl.toFixed(2));
    setRetailPrice(rrp.toFixed(2));

    // Auto adjust placement preset cleanly if switching to cap or mug
    if (activeBlank.filterGroup === 'Caps & Headwear') {
      setPlacement((p) => ({ ...p, xPct: 50, yPct: 47, scalePct: 22, rotationDeg: 0 }));
    } else if (activeBlank.filterGroup === 'Drinkware & Lifestyle') {
      setPlacement((p) => ({ ...p, xPct: 50, yPct: 54, scalePct: 26, rotationDeg: 0 }));
    }
  }, [activeBlank?.id, activeVariant?.singleUnitCostGBP, customBlankSrc, customBlankLabel]);

  const currentBlankSrc = customBlankSrc || activeVariant?.image || activeBlank?.image || '';
  const currentColorHex =
    uniqueColors.find((c) => c.color === selectedColor)?.hex || '#18181B';

  const handleUploadArtwork = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const cleanName = file.name.replace(/\.[^.]+$/, '');
        const createdAsset = addGeneratedAsset({
          title: cleanName || 'Uploaded Artwork',
          assetType: 'Official Logos & Marks',
          mediaType: 'image',
          src: reader.result,
          dimensions: 'Custom Upload',
          licenseLabel: 'Local Workspace Upload (PoC)',
          attribution: 'Live Mockup Studio Upload',
          usageScope: 'Real-time garment mockup & Amazon UK campaigns',
          linkedEntity: 'Product Mockups',
        });
        setSelectedArtworkSrc(createdAsset.src);
        setSelectedArtworkTitle(createdAsset.title);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleUploadCustomBlank = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const cleanName = file.name.replace(/\.[^.]+$/, '');
        setCustomBlankSrc(reader.result);
        setCustomBlankLabel(cleanName);
        setConceptName(`iShowSpeed × ${cleanName}`);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const bakeCurrentMockup = async () => {
    return bakeMockupToDataUrl({
      blankSrc: currentBlankSrc,
      blankColorHex: currentColorHex,
      artworkSrc: selectedArtworkSrc || undefined,
      textOverlay: useTextStamp ? textOverlay : null,
      placement,
      outputSize: 1000,
    });
  };

  const handleDownloadPng = async () => {
    if (!currentBlankSrc) return;
    setDownloading(true);
    try {
      const dataUrl = await bakeCurrentMockup();
      const link = document.createElement('a');
      link.href = dataUrl;
      const slug = (conceptName || 'ishowspeed-mockup')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 40);
      link.download = `${slug}-mockup.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      setDownloading(false);
    }
  };

  const handleSaveMockupConcept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBlankSrc || !conceptName.trim()) return;
    setSaving(true);
    try {
      const bakedImageUrl = await bakeCurrentMockup();
      const noteText = `Mockup Studio: ${
        selectedArtworkSrc ? selectedArtworkTitle : textOverlay.text
      } (${Math.round(placement.scalePct)}% scale)`;

      if (!customBlankSrc && activeBlank && activeVariant) {
        promoteCatalogVariantToConcept(activeBlank, activeVariant, {
          customName: conceptName.trim(),
          wholesalePrice: Number(wholesalePrice) || 24,
          retailPrice: Number(retailPrice) || 44.99,
          collectionId,
          customImage: bakedImageUrl,
          imageNote: noteText,
        });
      } else {
        const category: ProductCategory = activeBlank?.category ?? 'Graphic T-Shirts';
        addProduct({
          sku: `ISS-UK-${String(products.length + 1).padStart(3, '0')}`,
          name: conceptName.trim(),
          description: `Real-time baked product mockup created in Mockup Studio using ${
            customBlankLabel || activeBlank?.title || 'custom blank'
          }.`,
          category,
          collectionId,
          developmentStage: 'Concept Draft',
          proposedCost: activeVariant ? Number((activeVariant.singleUnitCostGBP * 0.72).toFixed(2)) : 12.5,
          proposedWholesale: Math.max(1, Number(wholesalePrice) || 24),
          proposedRetail: Math.max(1, Number(retailPrice) || 44.99),
          fabricSpec: activeBlank?.fabricSummary || 'Custom Studio Blank Spec',
          targetRelease: 'Q2 2027',
          image: bakedImageUrl,
          imageNote: noteText,
        });
      }

      if (alsoSaveToAssets) {
        addGeneratedAsset({
          title: `Mockup — ${conceptName.trim()}`,
          assetType: 'Apparel & Product Designs',
          mediaType: 'image',
          src: bakedImageUrl,
          dimensions: '1000 × 1000 px (PNG)',
          licenseLabel: 'Live Mockup Studio Composite',
          attribution: `${selectedColor || 'Custom'} · ${selectedArtworkTitle || textOverlay.text}`,
          usageScope: 'Amazon UK ASIN Packshot & Creative Approvals',
          linkedEntity: conceptName.trim(),
        });
      }

      onSavedConcept?.(conceptName.trim());
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-md overflow-hidden">
      <div className="grid grid-cols-1 xl:grid-cols-12">
        {/* LEFT: Real-Time Interactive Preview Stage */}
        <div className="xl:col-span-7 p-5 sm:p-6 border-b xl:border-b-0 xl:border-r border-zinc-200 space-y-4 bg-zinc-50/40">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-medium text-[#BC1F2F]">
                Real-Time Interactive Mockup Canvas
              </p>
              <h2 className="text-base font-bold text-zinc-900">
                {customBlankSrc
                  ? customBlankLabel || 'Custom Uploaded Blank'
                  : activeBlank?.title || 'Select a Product Blank'}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowGuides((v) => !v)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50 rounded"
              >
                {showGuides ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{showGuides ? 'Guides On' : 'Guides Off'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadPng}
                disabled={downloading || !currentBlankSrc}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-zinc-800 bg-white border border-zinc-300 hover:bg-zinc-100 rounded disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloading ? 'Exporting...' : 'Download PNG'}</span>
              </button>
            </div>
          </div>

          <div className="max-w-lg mx-auto">
            {currentBlankSrc ? (
              <LiveMockupStage
                blankSrc={currentBlankSrc}
                blankAlt={activeBlank?.title || 'Product blank'}
                artworkSrc={selectedArtworkSrc || undefined}
                textOverlay={useTextStamp ? textOverlay : null}
                placement={placement}
                onChangePlacement={setPlacement}
                loadingBlank={loadingVariants}
                showGuides={showGuides}
              />
            ) : (
              <div className="aspect-square bg-zinc-100 border border-dashed border-zinc-300 rounded-md flex items-center justify-center text-xs text-zinc-500 p-6 text-center">
                Select a blank product from the right panel or upload a blank image to start previewing mockups in real time.
              </div>
            )}
          </div>

          {/* Live Color Variant Swatches */}
          {!customBlankSrc && uniqueColors.length > 0 && (
            <div className="bg-white border border-zinc-200 rounded p-3 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-zinc-800">
                  Live Blank Colors ({uniqueColors.length}) — Switches Preview Instantly
                </span>
                <span className="font-mono-tabular text-zinc-600">{selectedColor}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {uniqueColors.map((c) => {
                  const active = c.color === selectedColor;
                  return (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => setSelectedColor(c.color)}
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border text-[11px] transition-colors ${
                        active
                          ? 'bg-zinc-900 text-white border-zinc-900 font-medium'
                          : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-400'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="truncate max-w-[110px]">{c.color}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Placement Presets */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white border border-zinc-200 rounded p-3">
            <span className="text-[11px] font-semibold text-zinc-700">Quick Placement:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {MOCKUP_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() =>
                    setPlacement((prev) => ({
                      ...prev,
                      ...preset.placement,
                    }))
                  }
                  className="px-2.5 py-1 text-[11px] font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-900 hover:text-white rounded transition-colors"
                >
                  {preset.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPlacement(DEFAULT_MOCKUP_PLACEMENT)}
                title="Reset placement"
                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] text-zinc-500 hover:text-zinc-900"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Blank Picker + Design Layer + Placement + Save Concept */}
        <div className="xl:col-span-5 p-5 sm:p-6 space-y-5 text-xs">
          {/* 1. Base Blank Selector */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-zinc-900 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#BC1F2F]" />
                <span>1. Choose Base Blank ({catalogProducts.length} Live Products)</span>
              </label>
              <div>
                <input
                  ref={blankUploadRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadCustomBlank}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => blankUploadRef.current?.click()}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-[#BC1F2F] hover:underline"
                >
                  <ImagePlus className="w-3 h-3" />
                  <span>{customBlankSrc ? 'Change Custom Blank' : 'Upload Blank Photo'}</span>
                </button>
              </div>
            </div>

            {customBlankSrc && (
              <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded px-3 py-2 text-[11px]">
                <span className="font-medium text-amber-900 truncate">
                  Using custom uploaded blank: {customBlankLabel}
                </span>
                <button
                  type="button"
                  onClick={() => setCustomBlankSrc(null)}
                  className="text-amber-800 underline shrink-0 ml-2"
                >
                  Switch to Live Catalog
                </button>
              </div>
            )}

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={blankSearch}
                onChange={(e) => setBlankSearch(e.target.value)}
                placeholder="Search blanks (e.g. hoodie, jersey, t-shirt, cap, mug)..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-zinc-300 rounded focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div className="flex flex-wrap gap-1">
              {STUDIO_FILTER_GROUPS.map((grp) => (
                <button
                  key={grp}
                  type="button"
                  onClick={() => setBlankGroup(grp)}
                  className={`px-2 py-1 text-[10px] rounded transition-colors ${
                    blankGroup === grp
                      ? 'bg-zinc-900 text-white font-medium'
                      : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {grp}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto p-1.5 border border-zinc-200 rounded bg-zinc-50">
              {filteredBlanks.map((b) => {
                const isSelected = !customBlankSrc && selectedBlankId === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setCustomBlankSrc(null);
                      setSelectedBlankId(b.id);
                    }}
                    title={b.title}
                    className={`p-1 rounded border text-left bg-white transition-colors ${
                      isSelected
                        ? 'border-[#BC1F2F] ring-1 ring-[#BC1F2F]'
                        : 'border-zinc-200 hover:border-zinc-400'
                    }`}
                  >
                    <img
                      src={b.image}
                      alt={b.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-12 object-contain bg-zinc-50 rounded-xs"
                    />
                    <p className="text-[9px] text-zinc-700 truncate mt-1">{b.title}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Artwork / Logo Layer */}
          <div className="space-y-2.5 pt-3 border-t border-zinc-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="font-semibold text-zinc-900">
                2. Apply Logo / Artwork Layer
              </label>
              <div className="flex items-center gap-2">
                {selectedArtworkSrc && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedArtworkSrc('');
                      setSelectedArtworkTitle('');
                    }}
                    className="text-[11px] text-zinc-500 hover:text-zinc-900 underline"
                  >
                    Clear Image
                  </button>
                )}
                <input
                  ref={artworkInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadArtwork}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => artworkInputRef.current?.click()}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-white bg-zinc-900 hover:bg-[#BC1F2F] rounded transition-colors"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload Logo / Graphic</span>
                </button>
              </div>
            </div>

            {imageAssets.length > 0 ? (
              <div className="grid grid-cols-4 gap-1.5 max-h-28 overflow-y-auto p-1.5 border border-zinc-200 rounded bg-zinc-50">
                {imageAssets.map((ast) => {
                  const active = selectedArtworkSrc === ast.src;
                  return (
                    <button
                      key={ast.id}
                      type="button"
                      onClick={() => {
                        setSelectedArtworkSrc(ast.src);
                        setSelectedArtworkTitle(ast.title);
                      }}
                      className={`p-1 rounded border text-left bg-white transition-colors ${
                        active
                          ? 'border-[#BC1F2F] ring-1 ring-[#BC1F2F]'
                          : 'border-zinc-200 hover:border-zinc-400'
                      }`}
                    >
                      <img
                        src={ast.src}
                        alt={ast.title}
                        className="w-full h-11 object-contain bg-zinc-950 rounded-xs"
                      />
                      <p className="text-[9px] text-zinc-700 truncate mt-1">{ast.title}</p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="bg-zinc-50 border border-dashed border-zinc-300 rounded p-3 text-[11px] text-zinc-600 flex items-center justify-between gap-2">
                <span>Upload any PNG/SVG logo or enable Text Stamp below to preview live.</span>
              </div>
            )}

            {/* Quick Text Stamp toggle */}
            <div className="bg-zinc-50 border border-zinc-200 rounded p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-1.5 font-medium text-zinc-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useTextStamp}
                    onChange={(e) => setUseTextStamp(e.target.checked)}
                  />
                  <Type className="w-3.5 h-3.5 text-[#BC1F2F]" />
                  <span>Add Custom Text Stamp</span>
                </label>
                {useTextStamp && (
                  <div className="flex items-center gap-1">
                    {STAMP_COLORS.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => setTextOverlay((t) => ({ ...t, color: hex }))}
                        className={`w-4 h-4 rounded-full border ${
                          textOverlay.color === hex
                            ? 'ring-2 ring-[#BC1F2F] border-white'
                            : 'border-zinc-300'
                        }`}
                        style={{ backgroundColor: hex }}
                        title={`Text color ${hex}`}
                      />
                    ))}
                  </div>
                )}
              </div>
              {useTextStamp && (
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={textOverlay.text}
                    onChange={(e) => setTextOverlay((t) => ({ ...t, text: e.target.value }))}
                    placeholder="SPEED"
                    className="col-span-2 px-2.5 py-1 border border-zinc-300 rounded bg-white font-semibold"
                  />
                  <input
                    type="range"
                    min={3}
                    max={14}
                    step={0.5}
                    value={textOverlay.sizePct}
                    onChange={(e) =>
                      setTextOverlay((t) => ({ ...t, sizePct: Number(e.target.value) }))
                    }
                    title="Text Size"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 3. Fine Placement & Blend Controls */}
          <div className="space-y-2.5 pt-3 border-t border-zinc-200">
            <label className="block font-semibold text-zinc-900">
              3. Fine Size, Rotation & Print Finish
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-[11px] text-zinc-600 mb-0.5">
                  <span>Design Size</span>
                  <span className="font-mono-tabular">{placement.scalePct}%</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={85}
                  value={placement.scalePct}
                  onChange={(e) =>
                    setPlacement((p) => ({ ...p, scalePct: Number(e.target.value) }))
                  }
                  className="w-full"
                />
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-zinc-600 mb-0.5">
                  <span>Rotation</span>
                  <span className="font-mono-tabular">{placement.rotationDeg}°</span>
                </div>
                <input
                  type="range"
                  min={-45}
                  max={45}
                  value={placement.rotationDeg}
                  onChange={(e) =>
                    setPlacement((p) => ({ ...p, rotationDeg: Number(e.target.value) }))
                  }
                  className="w-full"
                />
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-zinc-600 mb-0.5">
                  <span>Ink Opacity</span>
                  <span className="font-mono-tabular">{Math.round(placement.opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={25}
                  max={100}
                  value={Math.round(placement.opacity * 100)}
                  onChange={(e) =>
                    setPlacement((p) => ({ ...p, opacity: Number(e.target.value) / 100 }))
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-600 mb-0.5">Fabric Blend</label>
                <select
                  value={placement.blendMode}
                  onChange={(e) =>
                    setPlacement((p) => ({
                      ...p,
                      blendMode: e.target.value as MockupBlendMode,
                    }))
                  }
                  className="w-full px-2 py-1 border border-zinc-300 rounded bg-white text-[11px]"
                >
                  <option value="normal">Standard DTG / Patch</option>
                  <option value="multiply">Multiply (Light Garment Ink)</option>
                  <option value="screen">Screen (Dark Garment Ink)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 4. Save Mockup Form */}
          <form onSubmit={handleSaveMockupConcept} className="space-y-3 pt-3 border-t border-zinc-200">
            <label className="block font-semibold text-zinc-900">
              4. Save Live Mockup as Product Concept
            </label>
            <input
              type="text"
              required
              value={conceptName}
              onChange={(e) => setConceptName(e.target.value)}
              placeholder="Concept Title..."
              className="w-full px-3 py-2 border border-zinc-300 rounded"
            />
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] text-zinc-600 mb-1">Amz UK Whsl (£)</label>
                <input
                  type="number"
                  step="0.01"
                  value={wholesalePrice}
                  onChange={(e) => setWholesalePrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-zinc-300 rounded font-mono-tabular"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-600 mb-1">UK RRP (£)</label>
                <input
                  type="number"
                  step="0.01"
                  value={retailPrice}
                  onChange={(e) => setRetailPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-zinc-300 rounded font-mono-tabular"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-600 mb-1">Collection</label>
                <select
                  value={collectionId}
                  onChange={(e) => setCollectionId(e.target.value)}
                  className="w-full px-2 py-1.5 border border-zinc-300 rounded bg-white"
                >
                  <option value="">Unassigned</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2 text-[11px] text-zinc-600 cursor-pointer">
              <input
                type="checkbox"
                checked={alsoSaveToAssets}
                onChange={(e) => setAlsoSaveToAssets(e.target.checked)}
              />
              <span>Also save rendered mockup PNG to Creative Assets library</span>
            </label>

            <button
              type="submit"
              disabled={saving || !currentBlankSrc}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#BC1F2F] hover:bg-[#9E1927] rounded transition-colors disabled:opacity-50"
            >
              {saving ? (
                <span>Baking High-Res Mockup...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Bake & Save Mockup to Product Concepts</span>
                  <Check className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
