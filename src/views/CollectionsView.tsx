import React, { useMemo, useRef, useState } from 'react';
import {
  Edit3,
  FolderPlus,
  ImagePlus,
  Layers,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useCommerce } from '../context/CommerceContext';
import { Collection } from '../types/commerce';
import { MediaFrame } from '../components/common/MediaFrame';
import { StatusTag } from '../components/common/StatusTag';
import { Modal } from '../components/common/Modal';

const COLLECTION_STATUSES: Collection['status'][] = [
  'Proposed Concept',
  'In Development',
  'Ready for Review',
];

export const CollectionsView: React.FC = () => {
  const {
    collections,
    products,
    assets,
    addCollection,
    updateCollection,
    deleteCollection,
    toggleProductInCollection,
    setActiveSection,
  } = useCommerce();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

  const [colName, setColName] = useState('');
  const [colCode, setColCode] = useState('');
  const [colWindow, setColWindow] = useState('Proposed Q2/Q3 UK Drop');
  const [colStatus, setColStatus] = useState<Collection['status']>('Proposed Concept');
  const [colPos, setColPos] = useState('');
  const [colHeroImage, setColHeroImage] = useState('');
  const [colHeroCredit, setColHeroCredit] = useState('Manual Collection Cover');

  const imageAssets = useMemo(
    () => assets.filter((a) => !a.mediaType || a.mediaType === 'image'),
    [assets]
  );

  const openCreateModal = () => {
    setEditingCollection(null);
    const nextNum = collections.length + 1;
    setColName('');
    setColCode(`CAPSULE-${String(nextNum).padStart(2, '0')}`);
    setColWindow('Proposed Q2/Q3 UK Drop');
    setColStatus('Proposed Concept');
    setColPos('');
    setColHeroImage('');
    setColHeroCredit('Manual Collection Cover');
    setModalOpen(true);
  };

  const openEditModal = (col: Collection) => {
    setEditingCollection(col);
    setColName(col.name);
    setColCode(col.code);
    setColWindow(col.seasonWindow);
    setColStatus(col.status);
    setColPos(col.positioning);
    setColHeroImage(col.heroImage);
    setColHeroCredit(col.heroCredit || 'Manual Collection Cover');
    setModalOpen(true);
  };

  const handleUploadCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setColHeroImage(reader.result);
        setColHeroCredit(`Uploaded: ${file.name}`);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colName.trim()) return;

    if (editingCollection) {
      updateCollection(editingCollection.id, {
        name: colName.trim(),
        code: colCode.trim() || editingCollection.code,
        seasonWindow: colWindow.trim() || 'Proposed UK Drop Window',
        status: colStatus,
        positioning:
          colPos.trim() || 'Curated iShowSpeed capsule collection for Amazon UK.',
        heroImage: colHeroImage,
        heroCredit: colHeroImage ? colHeroCredit : 'No Cover Selected',
      });
    } else {
      addCollection({
        name: colName.trim(),
        code: colCode.trim() || undefined,
        seasonWindow: colWindow.trim(),
        status: colStatus,
        positioning: colPos.trim(),
        heroImage: colHeroImage,
        heroCredit: colHeroImage ? colHeroCredit : 'No Cover Selected',
      });
    }
    setModalOpen(false);
    setEditingCollection(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#BC1F2F] mb-1">
            Curated Capsule Architecture · Manual Drop Management
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            iShowSpeed Capsule Collections
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            Create, edit, and delete capsule collections manually, assign cover artwork from your Creative Assets, and link product concepts.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#BC1F2F] hover:bg-[#9E1927] rounded transition-colors whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Collection</span>
        </button>
      </div>

      {collections.length === 0 ? (
        <div className="bg-white border border-dashed border-zinc-300 rounded-md p-10 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center mx-auto">
            <Layers className="w-5 h-5 text-zinc-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">
              No Capsule Collections Created Yet
            </h2>
            <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
              Start by creating your first iShowSpeed capsule drop, then assign your manually created or catalog-configured product concepts.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#BC1F2F] hover:bg-[#9E1927] rounded transition-colors"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Create First Collection</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('concepts')}
              className="px-3.5 py-2 text-xs font-medium text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50 rounded transition-colors"
            >
              Go to Product Concepts ({products.length})
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {collections.map((col) => {
            const assignedProducts = products.filter((p) => p.collectionId === col.id);
            const assignableProducts = products.filter((p) => p.collectionId !== col.id);
            const avgRetail =
              assignedProducts.length > 0
                ? assignedProducts.reduce((s, p) => s + p.proposedRetail, 0) /
                  assignedProducts.length
                : 0;

            return (
              <section
                key={col.id}
                className="bg-white border border-zinc-200 rounded-md overflow-hidden"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                  {/* Cover Visual or Sleek Gradient Fallback */}
                  <div className="lg:col-span-4 relative border-b lg:border-b-0 lg:border-r border-zinc-200 bg-zinc-950 min-h-[220px] lg:min-h-[290px]">
                    {col.heroImage ? (
                      <div className="w-full h-full lg:absolute lg:inset-0">
                        <MediaFrame
                          src={col.heroImage}
                          alt={col.name}
                          className="w-full h-full border-0"
                          aspectClass="aspect-[4/3] lg:aspect-auto lg:h-full"
                          imgClassName="object-cover object-center"
                          caption={col.heroCredit || col.code}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full min-h-[220px] bg-gradient-to-br from-zinc-950 via-[#24090D] to-[#7A131E] p-6 flex flex-col justify-between text-white">
                        <div className="flex items-center justify-between text-[11px] font-mono-tabular text-amber-300">
                          <span>{col.code}</span>
                          <span>{col.seasonWindow}</span>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-zinc-400">
                            Capsule Cover
                          </p>
                          <p className="text-lg font-bold leading-snug mt-0.5">{col.name}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => openEditModal(col)}
                          className="self-start inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium bg-white/10 hover:bg-white/20 border border-white/20 rounded text-white transition-colors"
                        >
                          <ImagePlus className="w-3 h-3" />
                          <span>Attach Cover Visual</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Collection Details & Assigned Products */}
                  <div className="lg:col-span-8 p-6 flex flex-col justify-between gap-5">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="font-mono-tabular text-xs text-zinc-500">
                          {col.code} · {col.seasonWindow}
                        </span>
                        <div className="flex items-center gap-2">
                          <select
                            value={col.status}
                            onChange={(e) =>
                              updateCollection(col.id, {
                                status: e.target.value as Collection['status'],
                              })
                            }
                            aria-label={`Update status for ${col.name}`}
                            className="text-[11px] border border-zinc-300 rounded px-2 py-1 bg-white text-zinc-700"
                          >
                            {COLLECTION_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                          <StatusTag status={col.status} />
                          <button
                            type="button"
                            onClick={() => openEditModal(col)}
                            title="Edit Collection"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50 rounded transition-colors"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteCollection(col.id)}
                            title="Delete Collection"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-red-700 bg-white border border-red-200 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                      <h2 className="text-xl font-bold text-zinc-900">{col.name}</h2>
                      <p className="text-sm text-zinc-600 mt-1.5 leading-relaxed">
                        {col.positioning}
                      </p>
                    </div>

                    {/* Assigned Products */}
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2.5">
                        <span className="font-semibold text-zinc-800">
                          Assigned Product Concepts ({assignedProducts.length})
                        </span>
                        <div className="flex items-center gap-3">
                          {assignableProducts.length > 0 && (
                            <select
                              value=""
                              onChange={(e) => {
                                if (e.target.value) {
                                  toggleProductInCollection(e.target.value, col.id);
                                }
                              }}
                              aria-label={`Assign a product concept to ${col.name}`}
                              className="text-[11px] border border-zinc-300 rounded px-2 py-1 bg-white text-zinc-700"
                            >
                              <option value="">+ Assign Product Concept...</option>
                              {assignableProducts.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.sku} — {p.name}
                                </option>
                              ))}
                            </select>
                          )}
                          <span className="font-mono-tabular text-zinc-500">
                            Avg. UK RRP: £{avgRetail.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {assignedProducts.length === 0 ? (
                        <div className="text-xs text-zinc-500 border border-dashed border-zinc-200 rounded p-4 flex flex-wrap items-center justify-between gap-2">
                          <span>
                            {products.length === 0
                              ? 'No product concepts created yet. Create concepts in Product Concepts first.'
                              : 'No concepts currently assigned to this collection. Use the Assign dropdown above.'}
                          </span>
                          {products.length === 0 && (
                            <button
                              type="button"
                              onClick={() => setActiveSection('concepts')}
                              className="text-xs font-medium text-[#BC1F2F] hover:underline"
                            >
                              Open Product Concepts →
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {assignedProducts.map((prod) => (
                            <div
                              key={prod.id}
                              className="flex items-center justify-between gap-2 p-2.5 border border-zinc-200 rounded bg-zinc-50/70"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <MediaFrame
                                  src={prod.image}
                                  alt={prod.name}
                                  aspectClass="aspect-square"
                                  imgClassName="object-contain bg-white p-1"
                                  className="w-16 h-16 rounded shrink-0"
                                />
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-zinc-900 truncate">
                                    {prod.name}
                                  </p>
                                  <p className="text-[11px] font-mono-tabular text-zinc-500 truncate">
                                    {prod.sku} · £{prod.proposedRetail.toFixed(2)}
                                  </p>
                                  {prod.imageNote && (
                                    <p className="text-[10px] text-[#BC1F2F] truncate mt-0.5">
                                      {prod.imageNote}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <select
                                  value={prod.collectionId}
                                  onChange={(e) =>
                                    toggleProductInCollection(prod.id, e.target.value)
                                  }
                                  aria-label={`Move ${prod.name} to collection`}
                                  className="text-[11px] border border-zinc-300 rounded px-1.5 py-1 bg-white text-zinc-700"
                                >
                                  <option value="">Unassigned</option>
                                  {collections.map((c) => (
                                    <option key={c.id} value={c.id}>
                                      {c.code}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  onClick={() => toggleProductInCollection(prod.id, '')}
                                  title="Remove from this collection"
                                  className="p-1 text-zinc-400 hover:text-red-700 rounded hover:bg-red-50 transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Create / Edit Collection Modal */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingCollection(null);
        }}
        title={editingCollection ? `Edit ${editingCollection.code}` : 'Create Capsule Collection'}
        subtitle="Configure drop details, cover artwork from Creative Assets, and status"
        maxWidthClass="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-medium text-zinc-700 mb-1">Capsule Name</label>
              <input
                type="text"
                required
                value={colName}
                onChange={(e) => setColName(e.target.value)}
                placeholder="e.g. UK Stadium Drop 01"
                className="w-full px-3 py-2 border border-zinc-300 rounded"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Capsule Code</label>
              <input
                type="text"
                value={colCode}
                onChange={(e) => setColCode(e.target.value)}
                placeholder="CAPSULE-01"
                className="w-full px-3 py-2 border border-zinc-300 rounded font-mono-tabular"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Proposed Drop Window</label>
              <input
                type="text"
                value={colWindow}
                onChange={(e) => setColWindow(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Status</label>
              <select
                value={colStatus}
                onChange={(e) => setColStatus(e.target.value as Collection['status'])}
                className="w-full px-3 py-2 border border-zinc-300 rounded bg-white"
              >
                {COLLECTION_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-zinc-700 mb-1">Positioning Summary</label>
            <textarea
              rows={2}
              value={colPos}
              onChange={(e) => setColPos(e.target.value)}
              placeholder="Core theme, silhouette focus, and UK wholesale drop cadence..."
              className="w-full px-3 py-2 border border-zinc-300 rounded"
            />
          </div>

          {/* Cover Image Selector */}
          <div className="space-y-2 pt-2 border-t border-zinc-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="font-medium text-zinc-700">
                Collection Cover Visual (Optional)
              </label>
              <div className="flex items-center gap-2">
                {colHeroImage && (
                  <button
                    type="button"
                    onClick={() => {
                      setColHeroImage('');
                      setColHeroCredit('No Cover Selected');
                    }}
                    className="text-[11px] text-zinc-500 hover:text-zinc-900 underline"
                  >
                    Use Gradient Card
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadCover}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50 rounded"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload Cover Image</span>
                </button>
              </div>
            </div>

            {imageAssets.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-32 overflow-y-auto p-1 border border-zinc-200 rounded bg-zinc-50">
                {imageAssets.map((ast) => {
                  const selected = colHeroImage === ast.src;
                  return (
                    <button
                      key={ast.id}
                      type="button"
                      onClick={() => {
                        setColHeroImage(ast.src);
                        setColHeroCredit(ast.title);
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
                No images in Creative Assets yet — upload a cover above, or leave blank for a clean editorial card cover.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200">
            <button
              type="button"
              onClick={() => {
                setModalOpen(false);
                setEditingCollection(null);
              }}
              className="px-3.5 py-2 font-medium text-zinc-700 border border-zinc-300 rounded hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-medium text-white bg-[#BC1F2F] hover:bg-[#9E1927] rounded"
            >
              {editingCollection ? 'Save Collection' : 'Create Collection'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
