import React, { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  Monitor,
  Plus,
  Send,
  ShieldAlert,
  Smartphone,
  Sparkles,
  Store,
  Trash2,
} from 'lucide-react';
import { useCommerce } from '../context/CommerceContext';
import { BrandStoreModule } from '../types/commerce';
import { StatusTag } from '../components/common/StatusTag';
import { TalentAvatar } from '../components/common/TalentAvatar';
import { BrandVisual, ProductVisual } from '../components/common/BrandVisual';
import { Modal } from '../components/common/Modal';

export const BrandStoreView: React.FC = () => {
  const {
    brandStores,
    brands,
    talents,
    discoveredProducts,
    assets,
    acquisitions,
    createBrandStore,
    updateBrandStore,
    deleteBrandStore,
    submitBrandStoreForApproval,
    publishSimulatedBrandStore,
  } = useCommerce();

  const [selectedStoreId, setSelectedStoreId] = useState<string>(brandStores[0]?.id ?? '');
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [activePreviewPage, setActivePreviewPage] = useState<string>('Home');
  const [newPageDraft, setNewPageDraft] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  // Create Modal state
  const [newBrandId, setNewBrandId] = useState(brands[0]?.id ?? '');
  const [newTalentId, setNewTalentId] = useState(talents[0]?.id ?? '');
  const [newStoreName, setNewStoreName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newHeadline, setNewHeadline] = useState('');
  const [newSubheadline, setNewSubheadline] = useState('');

  const activeStore = useMemo(
    () => brandStores.find((s) => s.id === selectedStoreId) ?? brandStores[0] ?? null,
    [brandStores, selectedStoreId]
  );

  const activeBrand = activeStore
    ? brands.find((b) => b.id === activeStore.brandId)
    : undefined;
  const activeTalent = activeStore
    ? talents.find((t) => t.id === activeStore.talentId)
    : undefined;
  const brandAcq = activeBrand
    ? acquisitions.find((a) => a.brandId === activeBrand.id)
    : undefined;

  const brandProducts = useMemo(() => {
    if (!activeBrand) return [];
    return discoveredProducts.filter((p) => p.brandId === activeBrand.id);
  }, [discoveredProducts, activeBrand]);

  const imageAssets = useMemo(
    () => assets.filter((a) => !a.mediaType || a.mediaType === 'image'),
    [assets]
  );

  const handleOpenCreate = () => {
    const b = brands[0];
    setNewBrandId(b?.id ?? '');
    setNewTalentId(talents[0]?.id ?? '');
    setNewStoreName(b ? `${b.name} Official Amazon UK Store` : '');
    setNewSlug(b ? `amazon.co.uk/stores/${b.normalizedName.slice(0, 18)}` : '');
    setNewHeadline(b ? `Official ${b.name} Collection on Amazon UK` : '');
    setNewSubheadline('Verified Brand Registry storefront — Next-Day UK Prime Delivery');
    setCreateOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim() || !newBrandId || !newTalentId) return;
    const created = createBrandStore({
      brandId: newBrandId,
      talentId: newTalentId,
      storeName: newStoreName,
      amazonUkSlug: newSlug,
      headline: newHeadline || `${newStoreName} — Official Flagship`,
      subheadline: newSubheadline,
    });
    setSelectedStoreId(created.id);
    setActivePreviewPage('Home');
    setCreateOpen(false);
  };

  const handleMoveModule = (index: number, direction: -1 | 1) => {
    if (!activeStore) return;
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= activeStore.modules.length) return;
    const nextModules = [...activeStore.modules];
    const [moved] = nextModules.splice(index, 1);
    nextModules.splice(targetIdx, 0, moved);
    updateBrandStore(activeStore.id, { modules: nextModules });
  };

  const handleUpdateModule = (modId: string, patch: Partial<BrandStoreModule>) => {
    if (!activeStore) return;
    updateBrandStore(activeStore.id, {
      modules: activeStore.modules.map((m) => (m.id === modId ? { ...m, ...patch } : m)),
    });
  };

  const handleAddModule = () => {
    if (!activeStore) return;
    const nextMod: BrandStoreModule = {
      id: `mod-${Date.now()}`,
      type: 'Featured Collection',
      title: `${activeBrand?.name ?? 'Brand'} UK Highlights`,
      subtitle: 'Curated Amazon.co.uk Prime Vendor Central assortment',
      ctaLabel: 'Shop Collection',
      ctaTargetPage: activeStore.navPages[1] ?? 'Home',
      selectedProductIds: brandProducts.map((p) => p.id),
      bannerImage: activeStore.heroImage || imageAssets[0]?.src || '',
    };
    updateBrandStore(activeStore.id, {
      modules: [...activeStore.modules, nextMod],
    });
  };

  const handleAddNavPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStore || !newPageDraft.trim()) return;
    if (activeStore.navPages.includes(newPageDraft.trim())) return;
    updateBrandStore(activeStore.id, {
      navPages: [...activeStore.navPages, newPageDraft.trim()],
    });
    setNewPageDraft('');
  };

  const handleRemoveNavPage = (page: string) => {
    if (!activeStore || activeStore.navPages.length <= 1) return;
    const nextPages = activeStore.navPages.filter((p) => p !== page);
    updateBrandStore(activeStore.id, { navPages: nextPages });
    if (activePreviewPage === page) {
      setActivePreviewPage(nextPages[0] ?? 'Home');
    }
  };

  const permissionConfirmed =
    brandAcq?.wholesalePermissionConfirmed ||
    activeBrand?.ukWholesaleRouteStatus === 'Wholesale Authorised';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#BC1F2F] mb-1">
            Simulated Amazon.co.uk Storefront Builder · Dedicated Per-Brand Creative Studio
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Amazon UK Brand Store Studio ({brandStores.length} Store Projects)
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            Build, reorder modules, assign Talent & Brand imagery, preview Desktop vs Mobile layouts on amazon.co.uk, submit to Approvals, and simulate publishing.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#BC1F2F] hover:bg-[#9E1927] rounded transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Brand Store Project</span>
        </button>
      </div>

      {/* Store Selector Bar */}
      <div className="bg-white border border-zinc-200 rounded-md p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {brandStores.map((st) => {
            const stBrand = brands.find((b) => b.id === st.brandId);
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  setSelectedStoreId(st.id);
                  setActivePreviewPage(st.navPages[0] ?? 'Home');
                }}
                className={`px-3 py-1.5 text-xs rounded border transition-colors flex items-center gap-2 ${
                  activeStore?.id === st.id
                    ? 'bg-zinc-900 text-white border-zinc-900 font-medium'
                    : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-400'
                }`}
              >
                <BrandVisual brand={stBrand} nameFallback={st.storeName} size="xs" className="w-5 h-5" />
                <span>{st.storeName}</span>
              </button>
            );
          })}
        </div>

        <div className="inline-flex rounded border border-zinc-300 bg-white p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setViewport('desktop')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${
              viewport === 'desktop'
                ? 'bg-zinc-900 text-white font-medium'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setViewport('mobile')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${
              viewport === 'mobile'
                ? 'bg-zinc-900 text-white font-medium'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
        </div>
      </div>

      {activeStore ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left: Live Amazon.co.uk Desktop / Mobile Storefront Preview */}
          <div className="xl:col-span-7 bg-white border border-zinc-200 rounded-md p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <BrandVisual brand={activeBrand} nameFallback={activeStore.storeName} size="sm" />
                {activeTalent && <TalentAvatar talent={activeTalent} size="sm" />}
                <div>
                  <p className="text-[11px] font-mono-tabular text-zinc-500">
                    {activeStore.code} · {activeStore.amazonUkSlug}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StatusTag status={activeStore.approvalStatus} />
                    {activeStore.simulatedPublished && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        <Check className="w-3 h-3" />
                        <span>Simulated Published Storefront</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {activeStore.approvalStatus !== 'Pending Review' &&
                  activeStore.approvalStatus !== 'Approved' && (
                    <button
                      type="button"
                      onClick={() => submitBrandStoreForApproval(activeStore.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-[#BC1F2F] rounded"
                    >
                      <Send className="w-3 h-3" />
                      <span>Submit for Approval</span>
                    </button>
                  )}
                <button
                  type="button"
                  onClick={() => publishSimulatedBrandStore(activeStore.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
                    activeStore.simulatedPublished
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-white text-zinc-800 border-zinc-300 hover:bg-zinc-50'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>
                    {activeStore.simulatedPublished
                      ? 'Simulated Live (Click to Unpublish)'
                      : 'Simulate Publish Store'}
                  </span>
                </button>
              </div>
            </div>

            {!permissionConfirmed && (
              <div className="bg-amber-50 border border-amber-200 rounded p-3 flex items-start gap-2 text-xs text-amber-950">
                <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Simulated Draft Only:</strong> UK wholesale distribution permission is not yet confirmed for{' '}
                  <strong>{activeBrand?.name}</strong>. Use this preview strictly for CAA & brand pitch alignment.
                </span>
              </div>
            )}

            {/* Simulated Amazon UK Storefront Viewport */}
            <div
              className={`mx-auto border border-zinc-300 rounded-md overflow-hidden bg-white shadow-xs transition-all ${
                viewport === 'mobile' ? 'max-w-[380px]' : 'w-full'
              }`}
            >
              {/* Simulated Amazon UK Top Strip */}
              <div className="bg-[#131921] text-white px-4 py-2 flex items-center justify-between text-[11px]">
                <span className="font-bold tracking-tight">
                  amazon<span className="text-[#FF9900]">.co.uk</span>
                </span>
                <span className="text-zinc-300 truncate font-mono-tabular">
                  {activeStore.amazonUkSlug}
                </span>
              </div>

              {/* Store Navigation Bar */}
              <div className="bg-zinc-900 text-white px-4 py-3 space-y-2.5 border-b border-zinc-800">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <BrandVisual brand={activeBrand} size="xs" />
                    <span className="text-sm font-bold tracking-tight truncate">
                      {activeBrand?.name || activeStore.storeName}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-white/10 rounded text-zinc-200 shrink-0">
                    Official UK Store Preview
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {activeStore.navPages.map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setActivePreviewPage(page)}
                      className={`px-2.5 py-1 text-[11px] rounded transition-colors ${
                        activePreviewPage === page
                          ? 'bg-[#BC1F2F] text-white font-semibold'
                          : 'text-zinc-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hero Banner */}
              <div className="relative bg-zinc-950 text-white overflow-hidden">
                {activeStore.heroImage && (
                  <img
                    src={activeStore.heroImage}
                    alt={activeStore.storeName}
                    referrerPolicy="no-referrer"
                    className="w-full h-52 object-cover object-top opacity-45"
                  />
                )}
                <div
                  className={`${
                    activeStore.heroImage
                      ? 'absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent flex flex-col justify-end p-5'
                      : 'p-6 bg-gradient-to-br from-zinc-900 to-zinc-800'
                  }`}
                >
                  <p className="text-[10px] font-mono-tabular uppercase tracking-wider text-amber-400">
                    Viewing Store Tab: {activePreviewPage} · {activeTalent?.name}
                  </p>
                  <h3 className="text-lg font-bold leading-snug mt-1">
                    {activeStore.headline}
                  </h3>
                  <p className="text-xs text-zinc-200 mt-1 max-w-lg">
                    {activeStore.subheadline}
                  </p>
                </div>
              </div>

              {/* Ordered Storefront Modules */}
              <div className="p-4 space-y-4 bg-zinc-50">
                {activeStore.modules.map((mod) => (
                  <div
                    key={mod.id}
                    className="bg-white border border-zinc-200 rounded p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono-tabular uppercase text-[#BC1F2F]">
                          {mod.type}
                        </span>
                        <h4 className="text-sm font-bold text-zinc-900">{mod.title}</h4>
                        <p className="text-xs text-zinc-600">{mod.subtitle}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActivePreviewPage(mod.ctaTargetPage)}
                        className="px-2.5 py-1 text-[11px] font-medium bg-[#FFD814] hover:bg-[#F7CA00] text-zinc-900 rounded shrink-0"
                      >
                        {mod.ctaLabel}
                      </button>
                    </div>

                    {brandProducts.length > 0 && (
                      <div
                        className={`grid gap-3 ${
                          viewport === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'
                        }`}
                      >
                        {brandProducts.slice(0, 4).map((prod) => (
                          <div
                            key={prod.id}
                            className="border border-zinc-200 rounded p-2.5 bg-white flex flex-col justify-between gap-2"
                          >
                            <ProductVisual
                              product={prod}
                              brand={activeBrand}
                              aspect="4:3"
                            />
                            <div>
                              <p className="text-[11px] font-semibold text-zinc-900 line-clamp-2">
                                {prod.title}
                              </p>
                              <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-1">
                                {prod.variantSummary}
                              </p>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs">
                              <span className="font-mono-tabular font-bold text-zinc-900">
                                {prod.ukRrpGBP ? `£${prod.ukRrpGBP.toFixed(2)}` : '£29.99'}
                              </span>
                              <span className="text-[10px] font-semibold text-sky-700">
                                ✓ Prime UK
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Store Configuration & Module Reordering */}
          <div className="xl:col-span-5 bg-white border border-zinc-200 rounded-md p-5 space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h2 className="text-sm font-bold text-zinc-900">
                Storefront Editor & Layout Ordering
              </h2>
              <button
                type="button"
                onClick={() => deleteBrandStore(activeStore.id)}
                className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-[#BC1F2F]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Store</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                  Linked Talent
                </label>
                <select
                  value={activeStore.talentId}
                  onChange={(e) =>
                    updateBrandStore(activeStore.id, { talentId: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white"
                >
                  {talents.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                  Linked Brand
                </label>
                <select
                  value={activeStore.brandId}
                  onChange={(e) =>
                    updateBrandStore(activeStore.id, { brandId: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white"
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                  Amazon.co.uk Storefront Slug
                </label>
                <input
                  type="text"
                  value={activeStore.amazonUkSlug}
                  onChange={(e) =>
                    updateBrandStore(activeStore.id, { amazonUkSlug: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 border border-zinc-300 rounded font-mono-tabular"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                  Hero Banner Headline
                </label>
                <input
                  type="text"
                  value={activeStore.headline}
                  onChange={(e) =>
                    updateBrandStore(activeStore.id, { headline: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 border border-zinc-300 rounded"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                  Hero Subheadline
                </label>
                <input
                  type="text"
                  value={activeStore.subheadline}
                  onChange={(e) =>
                    updateBrandStore(activeStore.id, { subheadline: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 border border-zinc-300 rounded"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                  Hero Banner Image (Creative Assets or Talent Portrait)
                </label>
                <select
                  value={activeStore.heroImage}
                  onChange={(e) =>
                    updateBrandStore(activeStore.id, { heroImage: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white"
                >
                  <option value="">Clean Dark Gradient (No Photo)</option>
                  {activeBrand?.imageUrl && (
                    <option value={activeBrand.imageUrl}>
                      [Brand Official] {activeBrand.name}
                    </option>
                  )}
                  {brandProducts
                    .filter((p) => Boolean(p.image))
                    .map((p) => (
                      <option key={p.id} value={p.image!}>
                        [Product] {p.title.slice(0, 42)}
                      </option>
                    ))}
                  {imageAssets.map((a) => (
                    <option key={a.id} value={a.src}>
                      [Asset] {a.title}
                    </option>
                  ))}
                  {activeTalent?.portraitUrl && (
                    <option value={activeTalent.portraitUrl}>
                      [Talent Portrait] {activeTalent.name}
                    </option>
                  )}
                  <option value="/images/talent/speed-rr25.jpg">Arena Visual (/images/talent/speed-rr25.jpg)</option>
                </select>
              </div>
            </div>

            {/* Store Navigation Pages */}
            <div className="space-y-2 pt-3 border-t border-zinc-100">
              <label className="block font-semibold text-zinc-900">
                Store Navigation Tabs
              </label>
              <div className="flex flex-wrap gap-1.5">
                {activeStore.navPages.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-100 border border-zinc-200 rounded text-[11px]"
                  >
                    <span>{p}</span>
                    {activeStore.navPages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveNavPage(p)}
                        className="text-zinc-400 hover:text-[#BC1F2F]"
                        aria-label={`Remove tab ${p}`}
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
              <form onSubmit={handleAddNavPage} className="flex gap-2">
                <input
                  type="text"
                  value={newPageDraft}
                  onChange={(e) => setNewPageDraft(e.target.value)}
                  placeholder="Add nav tab (e.g. Gift Sets)..."
                  className="flex-1 px-2.5 py-1.5 border border-zinc-300 rounded"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-zinc-900 text-white rounded hover:bg-[#BC1F2F]"
                >
                  Add Tab
                </button>
              </form>
            </div>

            {/* Storefront Modules (Reorderable) */}
            <div className="space-y-2.5 pt-3 border-t border-zinc-100">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-900">
                  Storefront Content Modules ({activeStore.modules.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddModule}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-[#BC1F2F] hover:underline"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Module</span>
                </button>
              </div>
              <div className="space-y-2">
                {activeStore.modules.map((mod, idx) => (
                  <div
                    key={mod.id}
                    className="p-3 border border-zinc-200 rounded bg-zinc-50/70 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono-tabular font-semibold text-zinc-700">
                        #{idx + 1} · {mod.type}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveModule(idx, -1)}
                          title="Move module up"
                          className="p-1 border border-zinc-300 bg-white rounded disabled:opacity-35 hover:bg-zinc-100"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === activeStore.modules.length - 1}
                          onClick={() => handleMoveModule(idx, 1)}
                          title="Move module down"
                          className="p-1 border border-zinc-300 bg-white rounded disabled:opacity-35 hover:bg-zinc-100"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={mod.title}
                      onChange={(e) =>
                        handleUpdateModule(mod.id, { title: e.target.value })
                      }
                      className="w-full px-2 py-1 border border-zinc-300 rounded bg-white text-xs font-medium"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-dashed border-zinc-300 rounded-md p-10 text-center text-xs text-zinc-500">
          No Brand Store projects created yet. Click “New Brand Store Project” above to build an Amazon.co.uk storefront.
        </div>
      )}

      {/* Create Brand Store Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New Amazon UK Brand Store Project"
        subtitle="Create a dedicated per-brand simulated Amazon.co.uk storefront linked to CAA Talent & UK catalogue"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Talent</label>
              <select
                value={newTalentId}
                onChange={(e) => setNewTalentId(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded bg-white"
              >
                {talents.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.vertical})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Brand</label>
              <select
                value={newBrandId}
                onChange={(e) => {
                  const nextB = brands.find((b) => b.id === e.target.value);
                  setNewBrandId(e.target.value);
                  if (nextB) {
                    setNewStoreName(`${nextB.name} Official Amazon UK Store`);
                    setNewSlug(`amazon.co.uk/stores/${nextB.normalizedName.slice(0, 18)}`);
                    setNewHeadline(`Official ${nextB.name} Collection on Amazon UK`);
                  }
                }}
                className="w-full px-3 py-2 border border-zinc-300 rounded bg-white"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-zinc-700 mb-1">Storefront Project Name</label>
            <input
              type="text"
              required
              value={newStoreName}
              onChange={(e) => setNewStoreName(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 rounded"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-700 mb-1">Amazon UK Storefront URL</label>
            <input
              type="text"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 rounded font-mono-tabular"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-700 mb-1">Hero Banner Headline</label>
            <input
              type="text"
              required
              value={newHeadline}
              onChange={(e) => setNewHeadline(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 rounded"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-700 mb-1">Hero Subheadline</label>
            <input
              type="text"
              value={newSubheadline}
              onChange={(e) => setNewSubheadline(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 rounded"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="px-3.5 py-2 border border-zinc-300 rounded text-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#BC1F2F] hover:bg-[#9E1927] text-white font-medium rounded"
            >
              Create Brand Store
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
