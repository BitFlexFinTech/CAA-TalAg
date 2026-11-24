import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Package,
  Plus,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { useCommerce } from '../context/CommerceContext';
import {
  ApprovalStatus,
  CatalogBlankProduct,
  CatalogFilterGroup,
  DevelopmentStage,
  ProductCategory,
  ProductConcept,
} from '../types/commerce';
import { MediaFrame } from '../components/common/MediaFrame';
import { StatusTag } from '../components/common/StatusTag';
import { Drawer } from '../components/common/Drawer';
import { Modal } from '../components/common/Modal';
import { CatalogConfiguratorModal } from '../components/catalog/CatalogConfiguratorModal';
import { LiveMockupStudio } from '../components/products/LiveMockupStudio';

const STAGES: DevelopmentStage[] = [
  'Concept Draft',
  'Tech Pack',
  'Sampling',
  'Pre-Production',
  'Production Ready',
];

const CATALOG_FILTERS: CatalogFilterGroup[] = [
  'All',
  'T-Shirts',
  'Jerseys & Kits',
  'Hoodies & Fleece',
  'Caps & Headwear',
  'Accessories',
  'Collectibles & Prints',
  'Drinkware & Lifestyle',
];

const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Graphic T-Shirts',
  'Hoodies',
  'Caps & Headwear',
  'Accessories',
  'Collectibles',
  'Lifestyle Merchandise',
];

interface ProductsViewProps {
  openAddSignal?: number;
}

export const ProductsView: React.FC<ProductsViewProps> = ({ openAddSignal }) => {
  const {
    products,
    collections,
    assets,
    catalogProducts,
    mockupPrefillAssetSrc,
    mockupTabRequestCount,
    addProduct,
    updateProduct,
    deleteProduct,
    changeProductStage,
    submitProductForApproval,
  } = useCommerce();

  const manualFileRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<'catalog' | 'mockup' | 'concepts'>('catalog');
  const [studioInitialBlank, setStudioInitialBlank] = useState<CatalogBlankProduct | null>(null);
  const [catSearch, setCatSearch] = useState('');
  const [catFilter, setCatFilter] = useState<CatalogFilterGroup>('All');
  const [catPage, setCatPage] = useState(1);
  const PAGE_SIZE = 16;

  const [configuringBlank, setConfiguringBlank] = useState<CatalogBlankProduct | null>(null);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  // Manual Concept Create Modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newCategory, setNewCategory] = useState<ProductCategory>('Graphic T-Shirts');
  const [newCollectionId, setNewCollectionId] = useState<string>(collections[0]?.id ?? '');
  const [newStage, setNewStage] = useState<DevelopmentStage>('Concept Draft');
  const [newCost, setNewCost] = useState('11.50');
  const [newWholesale, setNewWholesale] = useState('22.00');
  const [newRetail, setNewRetail] = useState('39.99');
  const [newFabric, setNewFabric] = useState('240gsm 100% Organic Cotton');
  const [newDesc, setNewDesc] = useState('');
  const [newImage, setNewImage] = useState('');
  const [newImageNote, setNewImageNote] = useState('');

  // Configured Concepts state
  const [conceptSearch, setConceptSearch] = useState('');
  const [approvalFilter, setApprovalFilter] = useState<'All' | ApprovalStatus>('All');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductConcept | null>(null);

  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCost, setEditCost] = useState('');
  const [editRetail, setEditRetail] = useState('');
  const [editWholesale, setEditWholesale] = useState('');
  const [editFabric, setEditFabric] = useState('');

  const imageAssets = useMemo(
    () => assets.filter((a) => !a.mediaType || a.mediaType === 'image'),
    [assets]
  );

  useEffect(() => {
    if (openAddSignal && openAddSignal > 0) {
      setActiveTab('catalog');
    }
  }, [openAddSignal]);

  useEffect(() => {
    if (mockupTabRequestCount > 0) {
      setActiveTab('mockup');
    }
  }, [mockupTabRequestCount]);

  const openCreateModal = () => {
    setNewName('');
    setNewSku(`ISS-UK-${String(products.length + 1).padStart(3, '0')}`);
    setNewCategory('Graphic T-Shirts');
    setNewCollectionId(collections[0]?.id ?? '');
    setNewStage('Concept Draft');
    setNewCost('11.50');
    setNewWholesale('22.00');
    setNewRetail('39.99');
    setNewFabric('240gsm 100% Organic Cotton');
    setNewDesc('');
    setNewImage(imageAssets[0]?.src ?? '');
    setNewImageNote(imageAssets[0] ? `Asset: ${imageAssets[0].title}` : '');
    setCreateOpen(true);
  };

  const handleUploadConceptImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewImage(reader.result);
        setNewImageNote(`Uploaded: ${file.name}`);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCreateManualConcept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const created = addProduct({
      sku: newSku.trim() || undefined,
      name: newName.trim(),
      description:
        newDesc.trim() ||
        `Custom iShowSpeed ${newCategory.toLowerCase()} concept configured for Amazon UK wholesale.`,
      category: newCategory,
      collectionId: newCollectionId,
      developmentStage: newStage,
      proposedCost: Math.max(0.5, Number(newCost) || 10),
      proposedWholesale: Math.max(1, Number(newWholesale) || 20),
      proposedRetail: Math.max(1, Number(newRetail) || 35),
      fabricSpec: newFabric.trim() || '240gsm Premium Cotton',
      targetRelease: 'Q2 2027',
      image: newImage || undefined,
      imageNote: newImageNote || undefined,
    });
    setCreateOpen(false);
    setActiveTab('concepts');
    setBannerMessage(`Created manual concept "${created.name}" (${created.sku}).`);
  };

  const filteredCatalog = useMemo(() => {
    const q = catSearch.trim().toLowerCase();
    return catalogProducts.filter((p) => {
      const matchSearch =
        !q ||
        `${p.title} ${p.typeName} ${p.brandSpec} ${p.skuCode} ${p.productionLine}`
          .toLowerCase()
          .includes(q);
      const matchType = catFilter === 'All' || p.filterGroup === catFilter;
      return matchSearch && matchType;
    });
  }, [catalogProducts, catSearch, catFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCatalog.length / PAGE_SIZE));
  const pagedCatalog = useMemo(() => {
    const safePage = Math.min(catPage, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredCatalog.slice(start, start + PAGE_SIZE);
  }, [filteredCatalog, catPage, totalPages]);

  const filteredConcepts = useMemo(() => {
    const q = conceptSearch.trim().toLowerCase();
    return products.filter((p) => {
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.selectedColor ?? '').toLowerCase().includes(q);
      const matchAppr = approvalFilter === 'All' || p.approvalStatus === approvalFilter;
      return matchSearch && matchAppr;
    });
  }, [products, conceptSearch, approvalFilter]);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) ?? null,
    [products, selectedProductId]
  );

  const openEdit = (prod: ProductConcept) => {
    setEditingProduct(prod);
    setEditName(prod.name);
    setEditDesc(prod.description);
    setEditCost(prod.proposedCost.toString());
    setEditRetail(prod.proposedRetail.toString());
    setEditWholesale(prod.proposedWholesale.toString());
    setEditFabric(prod.fabricSpec);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    updateProduct(editingProduct.id, {
      name: editName.trim() || editingProduct.name,
      description: editDesc.trim() || editingProduct.description,
      proposedCost: Math.max(1, Number(editCost) || editingProduct.proposedCost),
      proposedRetail: Math.max(1, Number(editRetail) || editingProduct.proposedRetail),
      proposedWholesale: Math.max(1, Number(editWholesale) || editingProduct.proposedWholesale),
      fabricSpec: editFabric.trim() || editingProduct.fabricSpec,
    });
    setEditingProduct(null);
  };

  const calcMargin = (cost: number, wholesale: number) => {
    if (wholesale <= 0) return 0;
    return Math.round(((wholesale - cost) / wholesale) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#BC1F2F] mb-1">
            UK Production Blanks & Bespoke Merch · Amazon UK Direct Wholesale (£ GBP)
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Product Concepts & Catalog
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            Browse UK-ready apparel, Speed FC matchday kits, collector editions, and drinkware blanks — select exact colors & sizes to configure iShowSpeed wholesale SKUs.
          </p>
        </div>

        {/* Mode Switcher + Manual Create CTA */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-zinc-100 border border-zinc-200 rounded-md">
            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                activeTab === 'catalog'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Production Catalog ({catalogProducts.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('mockup')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                activeTab === 'mockup'
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Sparkles className="w-3 h-3 text-[#BC1F2F]" />
              <span>Live Mockup Studio</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('concepts')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                activeTab === 'concepts'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Configured UK SKUs ({products.length})
            </button>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#BC1F2F] hover:bg-[#9E1927] rounded transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Concept Manually</span>
          </button>
        </div>
      </div>

      {bannerMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-md px-4 py-3 flex items-center justify-between gap-3 text-xs text-emerald-900">
          <span>{bannerMessage}</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('concepts')}
              className="font-semibold underline"
            >
              View Configured SKUs
            </button>
            <button
              type="button"
              onClick={() => setBannerMessage(null)}
              className="text-emerald-700 hover:text-emerald-950"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {activeTab === 'catalog' ? (
        <div className="space-y-5">
          {/* Catalog Search & Category Filters */}
          <div className="bg-white border border-zinc-200 rounded-md p-4 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={catSearch}
                onChange={(e) => {
                  setCatSearch(e.target.value);
                  setCatPage(1);
                }}
                placeholder="Search production catalog (e.g. hoodie, jersey, trucker cap, scarf, acrylic block, flask)..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-300 rounded focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {CATALOG_FILTERS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCatFilter(cat);
                    setCatPage(1);
                  }}
                  className={`px-2.5 py-1 text-xs rounded transition-colors ${
                    catFilter === cat
                      ? 'bg-zinc-900 text-white font-medium'
                      : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pagedCatalog.map((item) => {
              const uniqueSwatches = Array.from(
                new Map(item.variants.map((v) => [v.color, v.colorHex])).entries()
              );
              const lowestUnit =
                item.variants.length > 0
                  ? Math.min(...item.variants.map((v) => v.singleUnitCostGBP))
                  : null;
              const variantTotal = item.variantCount ?? item.variants.length;

              return (
                <div
                  key={item.id}
                  className="bg-white border border-zinc-200 rounded-md overflow-hidden flex flex-col justify-between hover:border-zinc-400 transition-colors"
                >
                  <div>
                    <button
                      type="button"
                      onClick={() => setConfiguringBlank(item)}
                      className="w-full block aspect-[4/3] bg-zinc-50 border-b border-zinc-100 overflow-hidden"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        className="w-full h-full object-contain p-2.5 hover:scale-[1.03] transition-transform duration-200"
                      />
                    </button>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-500">
                        <span className="font-mono-tabular font-medium text-zinc-700 truncate">
                          {item.skuCode}
                        </span>
                        <span className="truncate shrink-0">{item.filterGroup}</span>
                      </div>
                      <h2 className="text-xs font-semibold text-zinc-900 line-clamp-2 min-h-[32px]">
                        {item.title}
                      </h2>
                      <p className="text-[11px] text-zinc-500 line-clamp-1">{item.brandSpec}</p>

                      {/* Color Swatch Dots or Live Hub Status */}
                      <div className="flex items-center gap-1.5 pt-1">
                        {uniqueSwatches.length > 0 ? (
                          uniqueSwatches.slice(0, 5).map(([colorName, hex]) => (
                            <span
                              key={colorName}
                              title={colorName}
                              className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                              style={{ backgroundColor: hex }}
                            />
                          ))
                        ) : (
                          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-xs">
                            UK Hub Live Blank
                          </span>
                        )}
                        <span className="text-[10px] font-mono-tabular text-zinc-500 ml-1 truncate">
                          {lowestUnit !== null
                            ? `From £${(lowestUnit * 0.72).toFixed(2)} bulk`
                            : item.productionLine.replace('UK ', '')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between gap-2">
                    <span className="font-mono-tabular text-[11px] text-zinc-600">
                      {variantTotal} variants
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setStudioInitialBlank(item);
                          setActiveTab('mockup');
                        }}
                        className="px-2 py-1.5 text-[11px] font-medium text-zinc-800 bg-white border border-zinc-300 hover:border-zinc-900 rounded transition-colors whitespace-nowrap"
                      >
                        Mockup
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfiguringBlank(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-[#BC1F2F] rounded transition-colors whitespace-nowrap"
                      >
                        <SlidersHorizontal className="w-3 h-3" />
                        <span>Colors & Sizes</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white border border-zinc-200 rounded-md px-4 py-3 text-xs">
              <span className="text-zinc-600 font-mono-tabular">
                Showing {(catPage - 1) * PAGE_SIZE + 1}–
                {Math.min(catPage * PAGE_SIZE, filteredCatalog.length)} of {filteredCatalog.length}{' '}
                catalog blanks
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={catPage <= 1}
                  onClick={() => setCatPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 px-2.5 py-1 border border-zinc-300 rounded disabled:opacity-40 hover:bg-zinc-50"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>
                <span className="font-mono-tabular text-zinc-700">
                  Page {catPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={catPage >= totalPages}
                  onClick={() => setCatPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex items-center gap-1 px-2.5 py-1 border border-zinc-300 rounded disabled:opacity-40 hover:bg-zinc-50"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : activeTab === 'mockup' ? (
        <LiveMockupStudio
          initialBlank={studioInitialBlank}
          initialAssetSrc={mockupPrefillAssetSrc}
          onSavedConcept={(name) => {
            setBannerMessage(`Saved real-time mockup concept "${name}" to Configured UK SKUs.`);
            setActiveTab('concepts');
          }}
        />
      ) : (
        /* Configured UK Wholesale SKUs */
        <div className="space-y-5">
          <div className="bg-white border border-zinc-200 rounded-md p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={conceptSearch}
                onChange={(e) => setConceptSearch(e.target.value)}
                placeholder="Search configured iShowSpeed SKUs, colors, or specs..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-300 rounded focus:outline-none focus:border-zinc-900"
              />
            </div>

            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value as 'All' | ApprovalStatus)}
              className="px-3 py-2 text-xs border border-zinc-300 rounded bg-white"
            >
              <option value="All">All Approval Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Approved">Approved</option>
              <option value="Changes Requested">Changes Requested</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {filteredConcepts.length === 0 ? (
            <div className="bg-white border border-dashed border-zinc-300 rounded-md p-10 text-center space-y-3">
              <p className="text-sm font-semibold text-zinc-900">
                {products.length === 0
                  ? 'No iShowSpeed Product Concepts Created Yet'
                  : 'No Product Concepts Match Your Filters'}
              </p>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                {products.length === 0
                  ? 'Create a product concept manually using your uploaded Creative Assets, or select a blank from the 586-item Production Catalog.'
                  : 'Clear your search query or change the approval filter.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#BC1F2F] hover:bg-[#9E1927] rounded transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Concept Manually</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('catalog')}
                  className="px-3.5 py-2 text-xs font-medium text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50 rounded transition-colors"
                >
                  Browse Production Catalog ({catalogProducts.length})
                </button>
              </div>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredConcepts.map((prod) => {
              const wholesaleMargin = calcMargin(prod.proposedCost, prod.proposedWholesale);
              return (
                <div
                  key={prod.id}
                  className="bg-white border border-zinc-200 rounded-md overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <button
                      type="button"
                      onClick={() => setSelectedProductId(prod.id)}
                      className="w-full text-left block"
                    >
                      <MediaFrame
                        src={prod.image}
                        alt={prod.name}
                        aspectClass="aspect-[4/3]"
                        imgClassName="object-contain bg-zinc-50 p-2"
                      />
                    </button>
                    <div className="p-5">
                      <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-500 mb-1.5">
                        <span className="font-mono-tabular">{prod.sku}</span>
                        <span>{prod.category}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedProductId(prod.id)}
                        className="text-left text-base font-semibold text-zinc-900 hover:text-[#BC1F2F]"
                      >
                        {prod.name}
                      </button>

                      {/* Variant Color & Size Metadata */}
                      {(prod.selectedColor || prod.selectedSize) && (
                        <div className="flex items-center gap-3 mt-2 text-xs text-zinc-700">
                          {prod.selectedColor && (
                            <span className="inline-flex items-center gap-1.5">
                              <span
                                className="w-3 h-3 rounded-full border border-black/20"
                                style={{ backgroundColor: prod.selectedColorHex || '#18181B' }}
                              />
                              <span>{prod.selectedColor}</span>
                            </span>
                          )}
                          {prod.selectedSize && (
                            <span className="font-mono-tabular text-zinc-500">
                              Size: {prod.selectedSize}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-zinc-100 text-xs">
                        <div>
                          <p className="text-[11px] text-zinc-500">Bulk Cost</p>
                          <p className="font-mono-tabular font-medium text-zinc-900">
                            £{prod.proposedCost.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-zinc-500">Amz UK Whsl</p>
                          <p className="font-mono-tabular font-semibold text-zinc-900">
                            £{prod.proposedWholesale.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-zinc-500">UK RRP</p>
                          <p className="font-mono-tabular text-zinc-700">
                            £{prod.proposedRetail.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] text-zinc-500">Whsl Margin</p>
                          <p className="font-mono-tabular font-semibold text-emerald-700">
                            {wholesaleMargin}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-3.5 bg-zinc-50 border-t border-zinc-200 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <StatusTag status={prod.approvalStatus} />
                      <select
                        value={prod.developmentStage}
                        onChange={(e) =>
                          changeProductStage(prod.id, e.target.value as DevelopmentStage)
                        }
                        className="text-xs border border-zinc-300 rounded px-2 py-1 bg-white"
                      >
                        {STAGES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedProductId(prod.id)}
                          className="px-2.5 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-100 rounded"
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(prod)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-100 rounded"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => deleteProduct(prod.id)}
                          title="Delete Concept"
                          className="p-1.5 text-zinc-400 hover:text-red-700 bg-white border border-zinc-200 hover:border-red-200 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        {prod.approvalStatus !== 'Pending Review' &&
                          prod.approvalStatus !== 'Approved' && (
                            <button
                              type="button"
                              onClick={() => submitProductForApproval(prod.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-[#BC1F2F] rounded"
                            >
                              <Send className="w-3 h-3" />
                              <span>Submit</span>
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      )}

      {/* White-Labeled Variant Configurator */}
      <CatalogConfiguratorModal
        product={configuringBlank}
        onClose={() => setConfiguringBlank(null)}
        onPromoted={(name) => {
          setBannerMessage(`Added "${name}" to Configured iShowSpeed SKUs.`);
        }}
      />

      {/* Product Detail Drawer */}
      <Drawer
        open={Boolean(selectedProduct)}
        onClose={() => setSelectedProductId(null)}
        title={selectedProduct?.name ?? ''}
        subtitle={
          selectedProduct
            ? `${selectedProduct.sku} · ${selectedProduct.category} · ${selectedProduct.amazonAsinDemo ?? 'Amazon UK Wholesale'}`
            : undefined
        }
        footer={
          selectedProduct && (
            <>
              <button
                type="button"
                onClick={() => {
                  const id = selectedProduct.id;
                  setSelectedProductId(null);
                  deleteProduct(id);
                }}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-red-700 bg-white border border-red-200 rounded hover:bg-red-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const p = selectedProduct;
                  setSelectedProductId(null);
                  openEdit(p);
                }}
                className="px-3.5 py-2 text-xs font-medium text-zinc-700 bg-white border border-zinc-300 rounded hover:bg-zinc-50"
              >
                Edit Concept
              </button>
              {selectedProduct.approvalStatus !== 'Pending Review' &&
                selectedProduct.approvalStatus !== 'Approved' && (
                  <button
                    type="button"
                    onClick={() => submitProductForApproval(selectedProduct.id)}
                    className="px-4 py-2 text-xs font-medium text-white bg-[#BC1F2F] hover:bg-[#9E1927] rounded"
                  >
                    Submit for Approval
                  </button>
                )}
            </>
          )
        }
      >
        {selectedProduct && (
          <div className="space-y-5">
            <MediaFrame
              src={selectedProduct.image}
              alt={selectedProduct.name}
              aspectClass="aspect-[4/3]"
              imgClassName="object-contain bg-zinc-50 p-3"
              caption={selectedProduct.imageNote}
              className="rounded"
            />
            <div className="flex items-center justify-between">
              <StatusTag status={selectedProduct.approvalStatus} />
              <span className="inline-flex items-center gap-1.5 text-xs text-zinc-600">
                <Package className="w-3.5 h-3.5" />
                {selectedProduct.productionLine || 'UK Production Hub Ready'}
              </span>
            </div>
            <p className="text-sm text-zinc-700 leading-relaxed">{selectedProduct.description}</p>
            <div className="grid grid-cols-2 gap-3 p-4 bg-zinc-50 border border-zinc-200 rounded text-xs">
              <div>
                <p className="text-zinc-500">Est. Bulk Production Cost</p>
                <p className="font-mono-tabular text-base font-semibold text-zinc-900">
                  £{selectedProduct.proposedCost.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-zinc-500">Amazon UK Wholesale Price</p>
                <p className="font-mono-tabular text-base font-semibold text-zinc-900">
                  £{selectedProduct.proposedWholesale.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-zinc-500">Selected Color & Size</p>
                <p className="font-medium text-zinc-900">
                  {selectedProduct.selectedColor || 'Default'} ·{' '}
                  {selectedProduct.selectedSize || 'Standard'}
                </p>
              </div>
              <div>
                <p className="text-zinc-500">Assigned Collection</p>
                <p className="font-medium text-zinc-900">
                  {collections.find((c) => c.id === selectedProduct.collectionId)?.name ??
                    'Unassigned'}
                </p>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Edit Modal */}
      <Modal
        open={Boolean(editingProduct)}
        onClose={() => setEditingProduct(null)}
        title={`Edit ${editingProduct?.sku ?? ''}`}
        subtitle="Update Amazon UK wholesale economics (£ GBP) and specification"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-zinc-700 mb-1">Product Name</label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 rounded"
            />
          </div>
          <div>
            <label className="block font-medium text-zinc-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 rounded"
            />
          </div>
          <div>
            <label className="block font-medium text-zinc-700 mb-1">Material & Production Spec</label>
            <input
              type="text"
              value={editFabric}
              onChange={(e) => setEditFabric(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 rounded"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Bulk Cost (£)</label>
              <input
                type="number"
                step="0.01"
                value={editCost}
                onChange={(e) => setEditCost(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded font-mono-tabular"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Amz UK Whsl (£)</label>
              <input
                type="number"
                step="0.01"
                value={editWholesale}
                onChange={(e) => setEditWholesale(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded font-mono-tabular"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-700 mb-1">UK RRP (£)</label>
              <input
                type="number"
                step="0.01"
                value={editRetail}
                onChange={(e) => setEditRetail(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded font-mono-tabular"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200">
            <button
              type="button"
              onClick={() => setEditingProduct(null)}
              className="px-3.5 py-2 font-medium text-zinc-700 border border-zinc-300 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-medium text-white bg-zinc-900 hover:bg-[#BC1F2F] rounded"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Manual Create Product Concept Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Product Concept Manually"
        subtitle="Attach artwork from Creative Assets or upload a file, set Amazon UK £ economics, and assign to a collection"
        maxWidthClass="max-w-2xl"
      >
        <form onSubmit={handleCreateManualConcept} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-medium text-zinc-700 mb-1">Concept Name</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. iShowSpeed Lightning Heavyweight Tee"
                className="w-full px-3 py-2 border border-zinc-300 rounded"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-700 mb-1">SKU Code</label>
              <input
                type="text"
                value={newSku}
                onChange={(e) => setNewSku(e.target.value)}
                placeholder="ISS-UK-001"
                className="w-full px-3 py-2 border border-zinc-300 rounded font-mono-tabular"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as ProductCategory)}
                className="w-full px-3 py-2 border border-zinc-300 rounded bg-white"
              >
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Capsule Collection</label>
              <select
                value={newCollectionId}
                onChange={(e) => setNewCollectionId(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded bg-white"
              >
                <option value="">Unassigned</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Development Stage</label>
              <select
                value={newStage}
                onChange={(e) => setNewStage(e.target.value as DevelopmentStage)}
                className="w-full px-3 py-2 border border-zinc-300 rounded bg-white"
              >
                {STAGES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Bulk Cost (£)</label>
              <input
                type="number"
                step="0.01"
                min="0.5"
                value={newCost}
                onChange={(e) => setNewCost(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded font-mono-tabular"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Amz UK Wholesale (£)</label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={newWholesale}
                onChange={(e) => setNewWholesale(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded font-mono-tabular"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-700 mb-1">UK RRP (£)</label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={newRetail}
                onChange={(e) => setNewRetail(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded font-mono-tabular"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-zinc-700 mb-1">Material & Production Spec</label>
            <input
              type="text"
              value={newFabric}
              onChange={(e) => setNewFabric(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 rounded"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-700 mb-1">Concept Description</label>
            <textarea
              rows={2}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Placement notes, embroidery / print finish, packaging details..."
              className="w-full px-3 py-2 border border-zinc-300 rounded"
            />
          </div>

          {/* Concept Visual Picker */}
          <div className="space-y-2 pt-2 border-t border-zinc-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="font-medium text-zinc-700">
                Concept Visual (From Creative Assets or Upload)
              </label>
              <div className="flex items-center gap-2">
                {newImage && (
                  <button
                    type="button"
                    onClick={() => {
                      setNewImage('');
                      setNewImageNote('');
                    }}
                    className="text-[11px] text-zinc-500 hover:text-zinc-900 underline"
                  >
                    Use Draft Placeholder
                  </button>
                )}
                <input
                  ref={manualFileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadConceptImage}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => manualFileRef.current?.click()}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50 rounded"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload Mockup Image</span>
                </button>
              </div>
            </div>

            {imageAssets.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-32 overflow-y-auto p-1 border border-zinc-200 rounded bg-zinc-50">
                {imageAssets.map((ast) => {
                  const selected = newImage === ast.src;
                  return (
                    <button
                      key={ast.id}
                      type="button"
                      onClick={() => {
                        setNewImage(ast.src);
                        setNewImageNote(`Asset: ${ast.title}`);
                      }}
                      className={`p-1 rounded border text-left transition-colors bg-white ${
                        selected
                          ? 'border-[#BC1F2F] ring-1 ring-[#BC1F2F]'
                          : 'border-zinc-200 hover:border-zinc-400'
                      }`}
                    >
                      <img
                        src={ast.src}
                        alt={ast.title}
                        className="w-full h-14 object-contain bg-zinc-950 rounded-xs"
                      />
                      <p className="text-[10px] text-zinc-700 truncate mt-1">{ast.title}</p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-[11px] text-zinc-500 bg-zinc-50 border border-zinc-200 rounded p-2.5">
                {newImage
                  ? `Selected visual: ${newImageNote || 'Uploaded image'}`
                  : 'No images in Creative Assets yet — upload a mockup image above or save with a clean draft placeholder.'}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="px-3.5 py-2 font-medium text-zinc-700 border border-zinc-300 rounded hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-medium text-white bg-[#BC1F2F] hover:bg-[#9E1927] rounded"
            >
              Create Concept
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
