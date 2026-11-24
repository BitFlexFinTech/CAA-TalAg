import React, { useMemo, useState } from 'react';
import {
  CheckSquare,
  Handshake,
  Megaphone,
  ShieldAlert,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { useCommerce } from '../context/CommerceContext';
import { AcquisitionRoute, AcquisitionStage } from '../types/commerce';
import { StatusTag } from '../components/common/StatusTag';
import { TalentAvatar } from '../components/common/TalentAvatar';
import { BrandVisual, ProductVisual } from '../components/common/BrandVisual';
import { VerificationBadgePanel } from '../components/intelligence/VerificationBadgePanel';

const STAGES: AcquisitionStage[] = [
  'Discovery',
  'Evidence & Verification',
  'CAA Liaison / Intro Requested',
  'UK Wholesale Permission Review',
  'Commercial Terms & Onboarding',
  'Amazon UK Ready',
  'On Hold / Unsuitable',
];

export const AcquisitionView: React.FC = () => {
  const {
    acquisitions,
    brands,
    talents,
    relationships,
    discoveredProducts,
    brandScoresById,
    createAcquisitionWorkflow,
    advanceAcquisitionStage,
    toggleAcquisitionChecklist,
    setActiveSection,
    setSelectedBrandId,
    setSelectedTalentId,
  } = useCommerce();

  const [routeFilter, setRouteFilter] = useState<'All' | AcquisitionRoute>('All');
  const [selectedAcqId, setSelectedAcqId] = useState<string>(acquisitions[0]?.id ?? '');
  const [newBrandId, setNewBrandId] = useState<string>(brands[0]?.id ?? '');
  const [newRoute, setNewRoute] = useState<AcquisitionRoute>(
    'Route 2 — Talent-Owned / Authorised'
  );

  const filtered = useMemo(() => {
    return acquisitions.filter(
      (a) => routeFilter === 'All' || a.route === routeFilter
    );
  }, [acquisitions, routeFilter]);

  const activeAcq = useMemo(
    () =>
      acquisitions.find((a) => a.id === selectedAcqId) ??
      filtered[0] ??
      acquisitions[0] ??
      null,
    [acquisitions, filtered, selectedAcqId]
  );

  const activeBrand = activeAcq
    ? brands.find((b) => b.id === activeAcq.brandId)
    : undefined;
  const activeTalent = activeAcq
    ? talents.find((t) => t.id === activeAcq.primaryTalentId)
    : undefined;
  const activeBrandProducts = activeBrand
    ? discoveredProducts.filter((p) => p.brandId === activeBrand.id)
    : [];

  const availableBrandsToAdd = useMemo(
    () => brands.filter((b) => !acquisitions.some((a) => a.brandId === b.id)),
    [brands, acquisitions]
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandId) return;
    const rel = relationships.find((r) => r.brandId === newBrandId);
    const created = createAcquisitionWorkflow(
      newBrandId,
      rel?.talentId ?? talents[0].id,
      newRoute
    );
    setSelectedAcqId(created.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#BC1F2F] mb-1">
            CAA Introductions · Explicit UK Wholesale Distribution Authorisation Gate
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Brand Acquisition & UK Wholesale Authorisation ({acquisitions.length} Active)
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            Manage Route 1 (Relationship-Led Endorsement Intros) and Route 2 (Talent-Owned / Authorised Brands) without ever assuming ownership or endorsement equals UK wholesale permission.
          </p>
        </div>

        {/* Route Filter */}
        <div className="flex items-center gap-1 p-1 bg-zinc-100 border border-zinc-200 rounded-md">
          {(
            [
              'All',
              'Route 1 — Relationship-Led',
              'Route 2 — Talent-Owned / Authorised',
            ] as const
          ).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRouteFilter(r)}
              className={`px-3 py-1.5 text-xs rounded transition-colors whitespace-nowrap ${
                routeFilter === r
                  ? 'bg-white text-zinc-900 font-semibold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {r === 'All' ? 'All Routes' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Add Brand to Acquisition Pipeline */}
      {availableBrandsToAdd.length > 0 && (
        <form
          onSubmit={handleCreate}
          className="bg-white border border-zinc-200 rounded-md p-4 flex flex-wrap items-center gap-3 text-xs"
        >
          <span className="font-semibold text-zinc-900">Add Brand to Pipeline:</span>
          <select
            value={newBrandId}
            onChange={(e) => setNewBrandId(e.target.value)}
            className="px-3 py-1.5 border border-zinc-300 rounded bg-white min-w-[220px]"
          >
            {availableBrandsToAdd.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({brandScoresById[b.id]?.total ?? 0}/100)
              </option>
            ))}
          </select>
          <select
            value={newRoute}
            onChange={(e) => setNewRoute(e.target.value as AcquisitionRoute)}
            className="px-3 py-1.5 border border-zinc-300 rounded bg-white"
          >
            <option value="Route 2 — Talent-Owned / Authorised">
              Route 2 — Talent-Owned / Authorised
            </option>
            <option value="Route 1 — Relationship-Led">
              Route 1 — Relationship-Led
            </option>
          </select>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 font-medium text-white bg-zinc-900 hover:bg-[#BC1F2F] rounded transition-colors"
          >
            <Handshake className="w-3.5 h-3.5" />
            <span>Open Workflow</span>
          </button>
        </form>
      )}

      {/* Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-md divide-y divide-zinc-100 overflow-hidden">
          {filtered.map((acq) => {
            const brand = brands.find((b) => b.id === acq.brandId);
            const tal = talents.find((t) => t.id === acq.primaryTalentId);
            const isSelected = activeAcq?.id === acq.id;
            return (
              <button
                key={acq.id}
                type="button"
                onClick={() => setSelectedAcqId(acq.id)}
                className={`w-full text-left p-4 transition-colors ${
                  isSelected
                    ? 'bg-zinc-50 ring-1 ring-inset ring-[#BC1F2F]/40'
                    : 'hover:bg-zinc-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[11px] font-medium text-[#BC1F2F]">{acq.route}</span>
                  <StatusTag status={acq.stage} />
                </div>
                <div className="flex items-center gap-2.5">
                  <BrandVisual brand={brand} nameFallback={acq.brandId} size="xs" />
                  <p className="text-xs font-bold text-zinc-900 truncate">
                    {brand?.name ?? acq.brandId}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-2 mt-2 text-[11px] text-zinc-500">
                  <span className="inline-flex items-center gap-1.5 min-w-0 truncate">
                    {tal && <TalentAvatar talent={tal} size="xs" />}
                    <span className="truncate">Talent Anchor: {tal?.name ?? '—'}</span>
                  </span>
                  <span
                    className={
                      acq.wholesalePermissionConfirmed
                        ? 'text-emerald-700 font-medium shrink-0'
                        : 'text-amber-700 font-medium shrink-0'
                    }
                  >
                    {acq.wholesalePermissionConfirmed ? 'UK Consent Confirmed' : 'Permission Pending'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-7 space-y-6">
          {activeAcq && activeBrand ? (
            <>
              <section className="bg-white border border-zinc-200 rounded-md p-6 space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-100 pb-4">
                  <div className="flex items-start gap-3.5">
                    <BrandVisual brand={activeBrand} size="lg" />
                    <div>
                      <p className="text-xs font-semibold text-[#BC1F2F]">{activeAcq.route}</p>
                      <h2 className="text-xl font-bold text-zinc-900">{activeBrand.name}</h2>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 mt-1">
                        {activeTalent && <TalentAvatar talent={activeTalent} size="xs" />}
                        <span>
                          Primary Talent: {activeTalent?.name ?? 'Unassigned'} · Brand Score:{' '}
                          <strong className="font-mono-tabular text-zinc-900">
                            {brandScoresById[activeBrand.id]?.total ?? 0}/100
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>
                  <StatusTag status={activeAcq.stage} />
                </div>

                {activeBrandProducts.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeBrandProducts.slice(0, 2).map((bp) => (
                      <div
                        key={bp.id}
                        className="flex items-center gap-2.5 p-2.5 rounded border border-zinc-200 bg-zinc-50/70"
                      >
                        <ProductVisual product={bp} brand={activeBrand} aspect="thumb" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-semibold text-zinc-900 line-clamp-1">
                            {bp.title}
                          </p>
                          <p className="text-[10px] text-zinc-500 font-mono-tabular mt-0.5">
                            {bp.ukRrpGBP ? `UK Est. £${bp.ukRrpGBP.toFixed(2)}` : bp.category}
                            {bp.skuOrRef ? ` · ${bp.skuOrRef}` : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Permission Safeguard Gate */}
                <div
                  className={`border rounded p-4 flex flex-wrap items-center justify-between gap-3 text-xs ${
                    activeAcq.wholesalePermissionConfirmed
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-amber-50 border-amber-200 text-amber-950'
                  }`}
                >
                  <div className="flex items-start gap-2.5 max-w-md">
                    {activeAcq.wholesalePermissionConfirmed ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-semibold">
                        {activeAcq.wholesalePermissionConfirmed
                          ? 'Written UK Wholesale Distribution Permission Confirmed'
                          : 'UK Wholesale Distribution Permission Required'}
                      </p>
                      <p className="mt-0.5 text-[11px]">
                        Brands cannot advance to Commercial Terms or Amazon UK Ready without explicit permission confirmation.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      advanceAcquisitionStage(
                        activeAcq.id,
                        activeAcq.stage,
                        !activeAcq.wholesalePermissionConfirmed
                      )
                    }
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                      activeAcq.wholesalePermissionConfirmed
                        ? 'bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                        : 'bg-zinc-900 text-white hover:bg-[#BC1F2F]'
                    }`}
                  >
                    {activeAcq.wholesalePermissionConfirmed
                      ? 'Revoke Confirmation'
                      : 'Confirm UK Wholesale Permission'}
                  </button>
                </div>

                {/* Stage Progression */}
                <div className="space-y-2 text-xs">
                  <label className="block font-semibold text-zinc-900">
                    Workflow Stage
                  </label>
                  <select
                    value={activeAcq.stage}
                    onChange={(e) =>
                      advanceAcquisitionStage(
                        activeAcq.id,
                        e.target.value as AcquisitionStage
                      )
                    }
                    className="w-full px-3 py-2 border border-zinc-300 rounded bg-white text-zinc-900"
                  >
                    {STAGES.map((st) => (
                      <option
                        key={st}
                        value={st}
                        disabled={
                          (st === 'Commercial Terms & Onboarding' ||
                            st === 'Amazon UK Ready') &&
                          !activeAcq.wholesalePermissionConfirmed
                        }
                      >
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Checklist */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-[#BC1F2F]" />
                    <span>Compliance & Authorisation Checklist</span>
                  </p>
                  <div className="border border-zinc-200 rounded divide-y divide-zinc-100">
                    {activeAcq.checklist.map((item, idx) => (
                      <label
                        key={idx}
                        className="p-3 flex items-center gap-3 text-xs cursor-pointer hover:bg-zinc-50"
                      >
                        <input
                          type="checkbox"
                          checked={item.done}
                          onChange={() => toggleAcquisitionChecklist(activeAcq.id, idx)}
                          className="w-4 h-4 accent-[#BC1F2F]"
                        />
                        <span className={item.done ? 'line-through text-zinc-400' : 'text-zinc-800'}>
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-zinc-600 bg-zinc-50 border border-zinc-200 rounded p-3">
                  <strong className="text-zinc-900">Next Step:</strong> {activeAcq.nextStep}
                </p>

                {/* Launch Operations / Creative */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBrandId(activeBrand.id);
                      setActiveSection('brands');
                    }}
                    className="text-xs font-medium text-zinc-600 hover:text-zinc-900 underline"
                  >
                    Inspect Brand & International Research
                  </button>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (activeTalent) setSelectedTalentId(activeTalent.id);
                        setActiveSection('campaigns');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-800 bg-white border border-zinc-300 hover:bg-zinc-50 rounded"
                    >
                      <Megaphone className="w-3.5 h-3.5" />
                      <span>Campaign Studio</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (activeTalent) setSelectedTalentId(activeTalent.id);
                        setActiveSection('brand-stores');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-[#BC1F2F] rounded"
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>Build Brand Store</span>
                    </button>
                  </div>
                </div>
              </section>

              <VerificationBadgePanel
                stamp={activeAcq.verification}
                targetType="brand"
                targetId={activeBrand.id}
              />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
