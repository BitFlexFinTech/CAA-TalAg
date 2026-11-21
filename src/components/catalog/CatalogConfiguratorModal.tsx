import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, PackageCheck, RotateCcw, Upload } from 'lucide-react';
import { useCommerce } from '../../context/CommerceContext';
import { fetchLiveCatalogVariants } from '../../data/catalogData';
import { CatalogBlankProduct, CatalogBlankVariant } from '../../types/commerce';
import {
  bakeMockupToDataUrl,
  DEFAULT_MOCKUP_PLACEMENT,
  MOCKUP_PRESETS,
  MockupPlacement,
} from '../../utils/mockupCompositor';
import { Modal } from '../common/Modal';
import { LiveMockupStage } from '../products/LiveMockupStage';

interface CatalogConfiguratorModalProps {
  product: CatalogBlankProduct | null;
  onClose: () => void;
  onPromoted?: (skuName: string) => void;
}

export const CatalogConfiguratorModal: React.FC<CatalogConfiguratorModalProps> = ({
  product,
  onClose,
  onPromoted,
}) => {
  const { promoteCatalogVariantToConcept, collections, assets, addGeneratedAsset } = useCommerce();
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const [loadedVariants, setLoadedVariants] = useState<CatalogBlankVariant[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [collectionId, setCollectionId] = useState<string>(collections[0]?.id ?? '');
  const [selectedAssetSrc, setSelectedAssetSrc] = useState<string>('');
  const [placement, setPlacement] = useState<MockupPlacement>(DEFAULT_MOCKUP_PLACEMENT);
  const [wholesaleInput, setWholesaleInput] = useState<string>('');
  const [retailInput, setRetailInput] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const imageAssets = useMemo(
    () => assets.filter((a) => !a.mediaType || a.mediaType === 'image'),
    [assets]
  );

  useEffect(() => {
    setCollectionId((prev) =>
      collections.some((c) => c.id === prev) ? prev : collections[0]?.id ?? ''
    );
  }, [collections]);

  useEffect(() => {
    if (!product) {
      setLoadedVariants([]);
      setSelectedAssetSrc('');
      setPlacement(DEFAULT_MOCKUP_PLACEMENT);
      return;
    }
    setCustomTitle(`iShowSpeed × ${product.title}`);
    if (product.filterGroup === 'Caps & Headwear') {
      setPlacement({ ...DEFAULT_MOCKUP_PLACEMENT, xPct: 50, yPct: 47, scalePct: 22 });
    } else if (product.filterGroup === 'Drinkware & Lifestyle') {
      setPlacement({ ...DEFAULT_MOCKUP_PLACEMENT, xPct: 50, yPct: 54, scalePct: 26 });
    } else {
      setPlacement(DEFAULT_MOCKUP_PLACEMENT);
    }

    if (product.variants && product.variants.length > 0) {
      setLoadedVariants(product.variants);
      setLoadingVariants(false);
      return;
    }
    let active = true;
    setLoadingVariants(true);
    fetchLiveCatalogVariants(product).then((vars) => {
      if (active) {
        setLoadedVariants(vars);
        setLoadingVariants(false);
      }
    });
    return () => {
      active = false;
    };
  }, [product]);

  const uniqueColors = useMemo(() => {
    if (!loadedVariants.length) return [];
    const map = new Map<string, { color: string; hex: string; image: string }>();
    for (const v of loadedVariants) {
      if (!map.has(v.color)) {
        map.set(v.color, {
          color: v.color,
          hex: v.colorHex || '#18181B',
          image: v.image,
        });
      }
    }
    return Array.from(map.values());
  }, [loadedVariants]);

  useEffect(() => {
    if (uniqueColors.length > 0 && !uniqueColors.some((c) => c.color === selectedColor)) {
      setSelectedColor(uniqueColors[0].color);
    }
  }, [uniqueColors, selectedColor]);

  const sizesForColor = useMemo(() => {
    if (!loadedVariants.length) return [];
    return loadedVariants.filter((v) => v.color === selectedColor);
  }, [loadedVariants, selectedColor]);

  useEffect(() => {
    if (sizesForColor.length > 0 && !sizesForColor.some((s) => s.size === selectedSize)) {
      const preferred =
        sizesForColor.find((s) => s.size === 'L') ||
        sizesForColor.find((s) => s.inStock) ||
        sizesForColor[0];
      setSelectedSize(preferred.size);
    }
  }, [sizesForColor, selectedSize]);

  const activeVariant: CatalogBlankVariant | null = useMemo(() => {
    if (!loadedVariants.length) return null;
    return (
      loadedVariants.find((v) => v.color === selectedColor && v.size === selectedSize) ||
      sizesForColor[0] ||
      loadedVariants[0]
    );
  }, [loadedVariants, selectedColor, selectedSize, sizesForColor]);

  const baseCost = activeVariant ? activeVariant.singleUnitCostGBP : 10;
  const estBulkCost = Number((baseCost * 0.72).toFixed(2));
  const defaultWholesale = Number((estBulkCost * 1.95).toFixed(2));
  const defaultRetail = Number((defaultWholesale * 1.85).toFixed(2));

  useEffect(() => {
    if (activeVariant) {
      setWholesaleInput(defaultWholesale.toFixed(2));
      setRetailInput(defaultRetail.toFixed(2));
    }
  }, [activeVariant?.id, defaultWholesale, defaultRetail]);

  const handleUploadArtworkInline = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const asset = addGeneratedAsset({
          title: file.name.replace(/\.[^.]+$/, '') || 'Uploaded Artwork',
          assetType: 'Official Logos & Marks',
          mediaType: 'image',
          src: reader.result,
          dimensions: 'Custom Upload',
          licenseLabel: 'Local Workspace Upload (PoC)',
          attribution: 'Blank Configurator Upload',
          usageScope: 'Real-time product mockup overlay',
          linkedEntity: product?.title || 'Product Concepts',
        });
        setSelectedAssetSrc(asset.src);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !activeVariant) return;
    setSaving(true);
    try {
      const chosenAsset = imageAssets.find((a) => a.src === selectedAssetSrc);
      let finalMockupUrl: string | undefined;

      if (selectedAssetSrc) {
        finalMockupUrl = await bakeMockupToDataUrl({
          blankSrc: activeVariant.image || product.image,
          blankColorHex: activeVariant.colorHex,
          artworkSrc: selectedAssetSrc,
          placement,
          outputSize: 1000,
        });
      }

      const created = promoteCatalogVariantToConcept(product, activeVariant, {
        customName: customTitle,
        wholesalePrice: Number(wholesaleInput) || defaultWholesale,
        retailPrice: Number(retailInput) || defaultRetail,
        collectionId,
        customImage: finalMockupUrl,
        imageNote: chosenAsset
          ? `Live Mockup: ${chosenAsset.title} (${selectedColor})`
          : undefined,
      });
      setSelectedAssetSrc('');
      onPromoted?.(created.name);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={Boolean(product)}
      onClose={onClose}
      title={product?.title ?? 'Configure Blank SKU & Live Mockup'}
      subtitle={
        product
          ? `${product.skuCode} · ${product.productionLine} · ${product.typeName}`
          : undefined
      }
      maxWidthClass="max-w-4xl"
    >
      {product && (
        <form onSubmit={handlePromote} className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Real-Time Interactive Mockup Stage + UK Economics */}
          <div className="md:col-span-5 space-y-3">
            <LiveMockupStage
              blankSrc={activeVariant?.image || product.image}
              blankAlt={`${product.title} — ${selectedColor}`}
              artworkSrc={selectedAssetSrc || undefined}
              placement={placement}
              onChangePlacement={setPlacement}
              loadingBlank={loadingVariants}
              compact
            />

            {selectedAssetSrc && (
              <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded space-y-2 text-[11px]">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span className="font-semibold text-zinc-700">Placement Presets</span>
                  <button
                    type="button"
                    onClick={() => setPlacement(DEFAULT_MOCKUP_PLACEMENT)}
                    className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-900"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {MOCKUP_PRESETS.slice(0, 4).map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() =>
                        setPlacement((prev) => ({ ...prev, ...preset.placement }))
                      }
                      className="px-2 py-0.5 bg-white border border-zinc-300 hover:border-zinc-900 rounded text-[10px]"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <div>
                  <div className="flex justify-between text-zinc-600 mb-0.5">
                    <span>Artwork Size</span>
                    <span className="font-mono-tabular">{placement.scalePct}%</span>
                  </div>
                  <input
                    type="range"
                    min={8}
                    max={80}
                    value={placement.scalePct}
                    onChange={(e) =>
                      setPlacement((p) => ({ ...p, scalePct: Number(e.target.value) }))
                    }
                    className="w-full"
                  />
                </div>
              </div>
            )}

            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Blank Reference</span>
                <span className="font-mono-tabular font-semibold text-zinc-900">
                  {product.skuCode}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">UK Fulfillment</span>
                <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                  <PackageCheck className="w-3.5 h-3.5" />
                  {activeVariant?.ukStatus ?? 'UK Hub In Stock'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Single Blank Unit</span>
                <span className="font-mono-tabular text-zinc-900">
                  £{baseCost.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Est. UK Bulk Tier (~28% off)</span>
                <span className="font-mono-tabular font-semibold text-[#BC1F2F]">
                  £{estBulkCost.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Color Swatches, Sizes, Artwork Overlay & Amazon UK Wholesale */}
          <div className="md:col-span-7 space-y-4 text-xs">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                iShowSpeed SKU Concept Title
              </label>
              <input
                type="text"
                required
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:border-zinc-900"
              />
            </div>

            {/* Real-Time Mockup Artwork Overlay Picker */}
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="font-semibold text-zinc-800">
                  Real-Time Logo / Graphic Overlay
                </label>
                <div>
                  <input
                    ref={uploadInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUploadArtworkInline}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => uploadInputRef.current?.click()}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-white bg-zinc-900 hover:bg-[#BC1F2F] rounded transition-colors"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload Logo / Artwork</span>
                  </button>
                </div>
              </div>
              <select
                value={selectedAssetSrc}
                onChange={(e) => setSelectedAssetSrc(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white"
              >
                <option value="">No Graphic Overlay (Blank Garment Only)</option>
                {imageAssets.map((a) => (
                  <option key={a.id} value={a.src}>
                    Overlay: {a.title} ({a.assetType})
                  </option>
                ))}
              </select>
              {selectedAssetSrc && (
                <p className="text-[11px] text-zinc-500">
                  Drag your artwork directly on the product photo to position it in real time before saving.
                </p>
              )}
            </div>

            {/* Color Swatches */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-medium text-zinc-700">
                  Color ({uniqueColors.length} available)
                </span>
                <span className="font-mono-tabular text-zinc-900 font-medium">
                  {selectedColor}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1">
                {uniqueColors.map((c) => {
                  const active = c.color === selectedColor;
                  return (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => setSelectedColor(c.color)}
                      title={c.color}
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border text-[11px] transition-colors ${
                        active
                          ? 'border-zinc-900 bg-zinc-900 text-white font-medium'
                          : 'border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="truncate max-w-[120px]">{c.color}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-medium text-zinc-700">
                  Size ({sizesForColor.length} options)
                </span>
                <span className="font-mono-tabular text-zinc-900 font-medium">
                  {selectedSize}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sizesForColor.map((v) => {
                  const active = v.size === selectedSize;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedSize(v.size)}
                      className={`px-2.5 py-1.5 rounded border font-mono-tabular text-xs transition-colors ${
                        active
                          ? 'bg-[#BC1F2F] text-white border-[#BC1F2F] font-semibold'
                          : 'bg-white text-zinc-800 border-zinc-300 hover:border-zinc-600'
                      }`}
                    >
                      {v.size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amazon UK Wholesale & Collection */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-zinc-200">
              <div>
                <label className="block font-medium text-zinc-700 mb-1">
                  Amz UK Wholesale (£)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={wholesaleInput}
                  onChange={(e) => setWholesaleInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-zinc-300 rounded font-mono-tabular"
                />
              </div>
              <div>
                <label className="block font-medium text-zinc-700 mb-1">
                  Amazon UK RRP (£)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={retailInput}
                  onChange={(e) => setRetailInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-zinc-300 rounded font-mono-tabular"
                />
              </div>
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Collection</label>
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

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 font-medium text-zinc-700 border border-zinc-300 rounded hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!activeVariant || saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 font-medium text-white bg-[#BC1F2F] hover:bg-[#9E1927] rounded disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>
                  {saving
                    ? 'Baking Mockup...'
                    : selectedAssetSrc
                    ? 'Bake Mockup & Add Concept'
                    : 'Add to iShowSpeed Concepts'}
                </span>
              </button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};
