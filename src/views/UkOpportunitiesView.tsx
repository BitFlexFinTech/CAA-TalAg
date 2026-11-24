import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Globe2,
  Handshake,
  Search,
} from 'lucide-react';
import { useCommerce } from '../context/CommerceContext';
import { UkOpportunityType } from '../types/commerce';
import { StatusTag } from '../components/common/StatusTag';
import { TalentAvatar } from '../components/common/TalentAvatar';
import { BrandVisual, ProductVisual } from '../components/common/BrandVisual';
import { ScoreBreakdownPanel } from '../components/intelligence/ScoreBreakdownPanel';
import { VerificationBadgePanel } from '../components/intelligence/VerificationBadgePanel';

const ALL_UK_TYPES: UkOpportunityType[] = [
  'Type A — No UK Presence',
  'Type B — 3P / Unauthorised UK Sellers',
  'Type C — Amazon UK Present, Unclear Wholesale',
  'Type D — UK DTC Site Only, No Amazon UK',
  'Type E — Partial / Limited UK Catalogue',
  'Type F — Existing UK Distributor (Caution)',
  'Type G — Unsuitable / UK Market Barriers',
];

export const UkOpportunitiesView: React.FC = () => {
  const {
    brands,
    talents,
    relationships,
    discoveredProducts,
    intlListings,
    ukAssessments,
    brandScoresById,
    setSelectedBrandId,
    setActiveSection,
    updateUkAssessmentType,
    addResearchEvidence,
    createAcquisitionWorkflow,
  } = useCommerce();

  const [typeFilter, setTypeFilter] = useState<'All' | UkOpportunityType>('All');
  const [search, setSearch] = useState('');
  const [selectedUkId, setSelectedUkId] = useState<string>(ukAssessments[0]?.id ?? '');

  const filteredUk = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ukAssessments
      .filter((u) => {
        const matchType = typeFilter === 'All' || u.opportunityType === typeFilter;
        const brand = brands.find((b) => b.id === u.brandId);
        const matchSearch =
          !q ||
          (brand?.name ?? '').toLowerCase().includes(q) ||
          u.estimatedGapSummary.toLowerCase().includes(q) ||
          u.opportunityType.toLowerCase().includes(q);
        return matchType && matchSearch;
      })
      .sort(
        (a, b) =>
          (brandScoresById[b.brandId]?.total ?? 0) -
          (brandScoresById[a.brandId]?.total ?? 0)
      );
  }, [ukAssessments, brands, typeFilter, search, brandScoresById]);

  const activeUk = useMemo(
    () =>
      ukAssessments.find((u) => u.id === selectedUkId) ??
      filteredUk[0] ??
      ukAssessments[0] ??
      null,
    [ukAssessments, filteredUk, selectedUkId]
  );

  const activeBrand = activeUk ? brands.find((b) => b.id === activeUk.brandId) : undefined;
  const activeProduct = activeUk?.productId
    ? discoveredProducts.find((p) => p.id === activeUk.productId)
    : discoveredProducts.find((p) => p.brandId === activeUk?.brandId);

  const activeBrandScore = activeBrand ? brandScoresById[activeBrand.id] : undefined;

  const activePrimaryTalent = useMemo(() => {
    if (!activeBrand) return undefined;
    const rel = relationships.find((r) => r.brandId === activeBrand.id);
    return rel ? talents.find((t) => t.id === rel.talentId) : undefined;
  }, [activeBrand, relationships, talents]);

  const activeIntlSummary = useMemo(() => {
    if (!activeBrand) return [];
    return intlListings.filter((l) => l.brandId === activeBrand.id);
  }, [intlListings, activeBrand]);

  const handleOpenAcquisition = () => {
    if (!activeBrand) return;
    const rels = relationships.filter((r) => r.brandId === activeBrand.id);
    const primaryRel = rels.find((r) => r.isCurrent) ?? rels[0];
    const isOwned = rels.some(
      (r) =>
        r.isCurrent &&
        (r.relationshipType === 'Owned Business' ||
          r.relationshipType === 'Founder' ||
          r.relationshipType === 'Co-Owned' ||
          r.relationshipType === 'Talent-Authorised')
    );
    createAcquisitionWorkflow(
      activeBrand.id,
      primaryRel?.talentId ?? talents[0].id,
      isOwned ? 'Route 2 — Talent-Owned / Authorised' : 'Route 1 — Relationship-Led'
    );
    setActiveSection('acquisition');
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-[#BC1F2F] mb-1">
          United Kingdom Sole Distribution Target · Opportunity Types A–G
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          UK Market Opportunity Intelligence ({ukAssessments.length} Assessments)
        </h1>
        <p className="text-sm text-zinc-600 mt-1">
          Compare verified international demand against UK supply gaps on Amazon.co.uk and UK DTC, flag existing UK distributors or compliance barriers, and launch authorised wholesale onboarding.
        </p>
      </div>

      {/* Type A–G Filter Strip */}
      <div className="bg-white border border-zinc-200 rounded-md p-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter UK opportunities by brand name, gap rationale, or Type A–G..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-300 rounded focus:outline-none focus:border-zinc-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setTypeFilter('All')}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              typeFilter === 'All'
                ? 'bg-zinc-900 text-white font-medium'
                : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900'
            }`}
          >
            All Types ({ukAssessments.length})
          </button>
          {ALL_UK_TYPES.map((t) => {
            const count = ukAssessments.filter((u) => u.opportunityType === t).length;
            const shortLabel = t.split('—')[0].trim();
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${
                  typeFilter === t
                    ? 'bg-[#BC1F2F] text-white font-medium'
                    : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {shortLabel} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Master-Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Opportunity Queue */}
        <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-md divide-y divide-zinc-100 overflow-hidden">
          {filteredUk.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              No UK opportunity records match the active filter.
            </div>
          ) : (
            filteredUk.map((item) => {
              const brand = brands.find((b) => b.id === item.brandId);
              const primaryTalent = relationships
                .filter((r) => r.brandId === item.brandId)
                .map((r) => talents.find((t) => t.id === r.talentId))
                .find((t): t is NonNullable<typeof t> => Boolean(t));
              const score = brandScoresById[item.brandId]?.total ?? 0;
              const isSelected = activeUk?.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedUkId(item.id)}
                  className={`w-full text-left p-4 transition-colors ${
                    isSelected
                      ? 'bg-zinc-50 ring-1 ring-inset ring-[#BC1F2F]/40'
                      : 'hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] font-semibold text-[#BC1F2F]">
                      {item.opportunityType}
                    </span>
                    <span className="font-mono-tabular text-xs font-bold text-zinc-900 shrink-0">
                      {score}/100
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 mt-1">
                    <BrandVisual brand={brand} nameFallback={item.brandId} size="xs" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-zinc-900 truncate">
                        {brand?.name ?? item.brandId}
                      </p>
                      {primaryTalent && (
                        <p className="text-[11px] text-zinc-500 truncate">
                          {primaryTalent.name}
                        </p>
                      )}
                    </div>
                    {primaryTalent && <TalentAvatar talent={primaryTalent} size="xs" />}
                  </div>
                  <p className="text-[11px] text-zinc-600 line-clamp-2 mt-1.5">
                    {item.estimatedGapSummary}
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-2 text-[11px] text-zinc-500">
                    <span>Amazon UK: {item.amazonUkPresence}</span>
                    <span>UK DTC: {item.ukDtcPresence}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Opportunity Inspector */}
        <div className="lg:col-span-7 space-y-6">
          {activeUk && activeBrand ? (
            <>
              <section className="bg-white border border-zinc-200 rounded-md p-6 space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-100 pb-4">
                  <div className="flex items-start gap-3.5">
                    <BrandVisual brand={activeBrand} size="lg" />
                    <div>
                      <p className="text-xs font-semibold text-[#BC1F2F] mb-1">
                        Amazon UK Vendor Central Opportunity
                      </p>
                      <h2 className="text-xl font-bold text-zinc-900">{activeBrand.name}</h2>
                      {activePrimaryTalent && (
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-600">
                          <TalentAvatar talent={activePrimaryTalent} size="xs" />
                          <span>Linked Talent: {activePrimaryTalent.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBrandId(activeBrand.id);
                        setActiveSection('brands');
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-zinc-700 border border-zinc-300 rounded hover:bg-zinc-50 inline-flex items-center gap-1"
                    >
                      <span>Brand Profile</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenAcquisition}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-[#BC1F2F] hover:bg-[#9E1927] rounded"
                    >
                      <Handshake className="w-3.5 h-3.5" />
                      <span>Start Acquisition</span>
                    </button>
                  </div>
                </div>

                {activeProduct && (
                  <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded border border-zinc-200 bg-zinc-50/70">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <ProductVisual
                        product={activeProduct}
                        brand={activeBrand}
                        aspect="thumb"
                        className="shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-[10px] font-mono-tabular uppercase tracking-wide text-zinc-500">
                          Anchor Target SKU · {activeProduct.skuOrRef || 'Catalog SKU'}
                        </p>
                        <p className="text-xs font-bold text-zinc-900 truncate">
                          {activeProduct.title}
                        </p>
                        <p className="text-[11px] text-zinc-600 truncate">
                          {activeProduct.variantSummary}
                        </p>
                      </div>
                    </div>
                    <div className="text-right font-mono-tabular text-xs shrink-0">
                      {activeProduct.ukRrpGBP && (
                        <p className="font-bold text-zinc-900">
                          UK RRP £{activeProduct.ukRrpGBP.toFixed(2)}
                        </p>
                      )}
                      {activeProduct.usPriceUSD && (
                        <p className="text-[11px] text-zinc-500">
                          US Benchmark ${activeProduct.usPriceUSD.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {activeUk.existingDistributorDetected && (
                  <div className="bg-amber-50 border border-amber-200 rounded p-3.5 flex items-start gap-2.5 text-xs text-amber-950">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Existing UK Distributor Caution</p>
                      <p className="mt-0.5">
                        {activeBrand.distributorNote ||
                          'An existing UK distributor is present. Confirm Amazon UK carve-outs or sub-distribution rights before investing.'}
                      </p>
                    </div>
                  </div>
                )}

                {activeUk.complianceOrBarrierNote && (
                  <div className="bg-red-50 border border-red-200 rounded p-3.5 text-xs text-red-950">
                    <strong>UK Market Barrier Note:</strong> {activeUk.complianceOrBarrierNote}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-zinc-50 border border-zinc-200 rounded p-4">
                  <div>
                    <p className="text-zinc-500">Amazon.co.uk Presence</p>
                    <p className="font-semibold text-zinc-900 mt-0.5">
                      {activeUk.amazonUkPresence}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Official UK DTC Site</p>
                    <p className="font-semibold text-zinc-900 mt-0.5">{activeUk.ukDtcPresence}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Intl Markets Verified</p>
                    <p className="font-semibold text-zinc-900 mt-0.5 flex items-center gap-1">
                      <Globe2 className="w-3.5 h-3.5 text-[#BC1F2F]" />
                      <span>
                        {activeIntlSummary.map((l) => l.market).join(', ') || 'Pending scan'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <label className="block font-semibold text-zinc-900">
                    Reclassify UK Opportunity Type (Recalculates Brand & Product Scores Live)
                  </label>
                  <select
                    value={activeUk.opportunityType}
                    onChange={(e) =>
                      updateUkAssessmentType(activeUk.id, e.target.value as UkOpportunityType)
                    }
                    className="w-full px-3 py-2 border border-zinc-300 rounded bg-white text-zinc-900"
                  >
                    {ALL_UK_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <p className="text-sm text-zinc-700 leading-relaxed">
                  {activeUk.estimatedGapSummary}
                </p>
              </section>

              {activeBrandScore && (
                <ScoreBreakdownPanel
                  title={`${activeBrand.name} — Live UK Opportunity Score`}
                  breakdown={activeBrandScore}
                />
              )}

              <VerificationBadgePanel
                stamp={activeUk.verification}
                targetType="uk-assessment"
                targetId={activeUk.id}
                onAddEvidence={addResearchEvidence}
              />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
