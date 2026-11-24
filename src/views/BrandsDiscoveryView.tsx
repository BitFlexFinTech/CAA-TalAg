import React, { useMemo, useState } from 'react';
import {
  Building2,
  ExternalLink,
  Globe2,
  Handshake,
  Megaphone,
  Search,
  Store,
} from 'lucide-react';
import { useCommerce } from '../context/CommerceContext';
import { UkOpportunityType } from '../types/commerce';
import { StatusTag } from '../components/common/StatusTag';
import { TalentAvatar } from '../components/common/TalentAvatar';
import { BrandVisual, ProductVisual } from '../components/common/BrandVisual';
import { ScoreBreakdownPanel } from '../components/intelligence/ScoreBreakdownPanel';
import { VerificationBadgePanel } from '../components/intelligence/VerificationBadgePanel';

export const BrandsDiscoveryView: React.FC = () => {
  const {
    talents,
    brands,
    relationships,
    discoveredProducts,
    intlListings,
    ukAssessments,
    acquisitions,
    brandScoresById,
    productScoresById,
    selectedBrandId,
    setSelectedBrandId,
    setSelectedTalentId,
    setActiveSection,
    addResearchEvidence,
    createAcquisitionWorkflow,
  } = useCommerce();

  const [search, setSearch] = useState('');
  const [routeFilter, setRouteFilter] = useState('All');

  const filteredBrands = useMemo(() => {
    const q = search.trim().toLowerCase();
    return brands
      .filter((b) => {
        const matchRoute = routeFilter === 'All' || b.ukWholesaleRouteStatus === routeFilter;
        const linkedNames = relationships
          .filter((r) => r.brandId === b.id)
          .map((r) => talents.find((t) => t.id === r.talentId)?.name ?? '')
          .join(' ')
          .toLowerCase();
        const matchSearch =
          !q ||
          b.name.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          linkedNames.includes(q);
        return matchRoute && matchSearch;
      })
      .sort((a, b) => (brandScoresById[b.id]?.total ?? 0) - (brandScoresById[a.id]?.total ?? 0));
  }, [brands, relationships, talents, search, routeFilter, brandScoresById]);

  const activeBrand = useMemo(
    () =>
      brands.find((b) => b.id === selectedBrandId) ??
      filteredBrands[0] ??
      brands[0] ??
      null,
    [brands, filteredBrands, selectedBrandId]
  );

  const activeBrandRels = useMemo(
    () => (activeBrand ? relationships.filter((r) => r.brandId === activeBrand.id) : []),
    [relationships, activeBrand]
  );

  const activeBrandProducts = useMemo(
    () => (activeBrand ? discoveredProducts.filter((p) => p.brandId === activeBrand.id) : []),
    [discoveredProducts, activeBrand]
  );

  const activeBrandListings = useMemo(
    () => (activeBrand ? intlListings.filter((l) => l.brandId === activeBrand.id) : []),
    [intlListings, activeBrand]
  );

  const activeBrandUk = useMemo(
    () => (activeBrand ? ukAssessments.filter((u) => u.brandId === activeBrand.id) : []),
    [ukAssessments, activeBrand]
  );

  const activeAcq = useMemo(
    () => (activeBrand ? acquisitions.find((a) => a.brandId === activeBrand.id) : undefined),
    [acquisitions, activeBrand]
  );

  const handleLaunchAcquisition = () => {
    if (!activeBrand) return;
    const primaryRel = activeBrandRels.find((r) => r.isCurrent) ?? activeBrandRels[0];
    const isOwned = activeBrandRels.some(
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
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#BC1F2F] mb-1">
            Normalized Multi-Talent Knowledge Graph · International Marketplace Research
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Brands, Discovered Products & International Markets ({brands.length} Canonical Brands)
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            Zero-duplication brand registry linking shared talent ties, SKU portfolios, US/CA/AU/DE/FR research listings, and Amazon UK entry assessments.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-zinc-200 rounded-md p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brands, categories, or linked talent (e.g. Prime Hydration, Feastables, Beyoncé)..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-300 rounded focus:outline-none focus:border-zinc-900"
          />
        </div>
        <select
          value={routeFilter}
          onChange={(e) => setRouteFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-zinc-300 rounded bg-white text-zinc-700"
        >
          <option value="All">All UK Wholesale Route Statuses</option>
          <option value="Wholesale Authorised">Wholesale Authorised</option>
          <option value="Direct Brand Contact">Direct Brand Contact</option>
          <option value="CAA Relationship Intro">CAA Relationship Intro</option>
          <option value="Route Unclear">Route Unclear</option>
          <option value="Existing UK Distributor">Existing UK Distributor</option>
          <option value="Blocked / Unsuitable">Blocked / Unsuitable</option>
        </select>
      </div>

      {/* Master-Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Canonical Brand Directory */}
        <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-md overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-900 flex items-center justify-between">
            <span>Canonical Brand Registry ({filteredBrands.length})</span>
            <span className="font-mono-tabular text-[11px] text-zinc-500">Ranked by Score</span>
          </div>
          <div className="divide-y divide-zinc-100 max-h-[780px] overflow-y-auto">
            {filteredBrands.map((brand) => {
              const isSelected = activeBrand?.id === brand.id;
              const bRels = relationships.filter((r) => r.brandId === brand.id);
              const primaryTalent = bRels
                .map((r) => talents.find((t) => t.id === r.talentId))
                .find((t): t is NonNullable<typeof t> => Boolean(t));
              const score = brandScoresById[brand.id]?.total ?? 0;
              const prodCount = discoveredProducts.filter((p) => p.brandId === brand.id).length;

              return (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => setSelectedBrandId(brand.id)}
                  className={`w-full text-left p-4 transition-colors ${
                    isSelected
                      ? 'bg-zinc-50 ring-1 ring-inset ring-[#BC1F2F]/40'
                      : 'hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <BrandVisual brand={brand} size="sm" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-zinc-900 truncate">{brand.name}</p>
                        <p className="text-[11px] text-zinc-500 truncate mt-0.5 flex items-center gap-1.5">
                          {primaryTalent && <span className="truncate">{primaryTalent.name}</span>}
                          {!primaryTalent && <span>{brand.category}</span>}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono-tabular text-xs font-bold text-zinc-900 shrink-0">
                      {score}/100
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-2 text-[11px]">
                    <span className="text-zinc-600 truncate">
                      {bRels.length} talent link(s) · {prodCount} product(s)
                    </span>
                    <StatusTag status={brand.ukWholesaleRouteStatus} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Brand Intelligence Inspector */}
        <div className="lg:col-span-8 space-y-6">
          {activeBrand ? (
            <>
              <section className="bg-white border border-zinc-200 rounded-md p-6 space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-100 pb-4">
                  <div className="flex items-start gap-4 flex-1 min-w-[260px]">
                    <BrandVisual brand={activeBrand} size="xl" mode="hero" />
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                        <Building2 className="w-3.5 h-3.5 text-[#BC1F2F]" />
                        <span>{activeBrand.category}</span>
                        <span>·</span>
                        <span>Origin: {activeBrand.originCountry}</span>
                        <span>·</span>
                        <a
                          href={activeBrand.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[#BC1F2F] hover:underline"
                        >
                          <span>{activeBrand.websiteUrl.replace(/^https?:\/\//, '')}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
                        {activeBrand.name}
                      </h2>
                      <p className="text-sm text-zinc-600 max-w-2xl">{activeBrand.description}</p>
                      {activeBrand.imageCredit && (
                        <p className="text-[10px] text-zinc-400">
                          Visual Source: {activeBrand.imageCredit}
                        </p>
                      )}
                    </div>
                  </div>

                  <StatusTag status={activeBrand.ukWholesaleRouteStatus} />
                </div>

                {/* Action Strip */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleLaunchAcquisition}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#BC1F2F] hover:bg-[#9E1927] rounded transition-colors"
                  >
                    <Handshake className="w-3.5 h-3.5" />
                    <span>
                      {activeAcq
                        ? `Open Acquisition (${activeAcq.stage})`
                        : 'Initiate UK Brand Acquisition'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (activeBrandRels[0]) setSelectedTalentId(activeBrandRels[0].talentId);
                      setActiveSection('campaigns');
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-800 bg-white border border-zinc-300 hover:bg-zinc-50 rounded transition-colors"
                  >
                    <Megaphone className="w-3.5 h-3.5" />
                    <span>Activate in Campaigns</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (activeBrandRels[0]) setSelectedTalentId(activeBrandRels[0].talentId);
                      setActiveSection('brand-stores');
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-800 bg-white border border-zinc-300 hover:bg-zinc-50 rounded transition-colors"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Design Amazon UK Brand Store</span>
                  </button>
                </div>

                {/* Many-to-Many Linked Talent Relationships */}
                <div className="space-y-2.5">
                  <h3 className="text-sm font-semibold text-zinc-900">
                    Associated CAA Roster & Talent Ties ({activeBrandRels.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeBrandRels.map((rel) => {
                      const tal = talents.find((t) => t.id === rel.talentId);
                      if (!tal) return null;
                      return (
                        <button
                          key={rel.id}
                          type="button"
                          onClick={() => {
                            setSelectedTalentId(tal.id);
                            setActiveSection('profile');
                          }}
                          className="text-left p-3 border border-zinc-200 rounded hover:border-zinc-400 transition-colors flex items-start gap-3"
                        >
                          <TalentAvatar talent={tal} size="sm" />
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-zinc-900 truncate">
                                {tal.name}
                              </span>
                              <StatusTag
                                status={rel.relationshipType}
                                tone={
                                  rel.relationshipType === 'Owned Business' ||
                                  rel.relationshipType === 'Founder' ||
                                  rel.relationshipType === 'Co-Owned'
                                    ? 'success'
                                    : 'neutral'
                                }
                              />
                            </div>
                            <p className="text-[11px] text-zinc-600 line-clamp-2">{rel.summary}</p>
                            <p className="text-[10px] font-mono-tabular text-zinc-500">
                              UK Rights: {rel.ukDistributionRightsConfirmed}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* International Marketplace Intelligence Matrix */}
                <div className="space-y-2.5 pt-2 border-t border-zinc-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-1.5">
                      <Globe2 className="w-4 h-4 text-[#BC1F2F]" />
                      <span>
                        International Marketplace Research Sources ({activeBrandListings.length})
                      </span>
                    </h3>
                    <span className="text-[11px] text-zinc-500">
                      Research Only · Sales Target Remains Amazon UK
                    </span>
                  </div>
                  {activeBrandListings.length === 0 ? (
                    <p className="text-xs text-zinc-500 bg-zinc-50 border border-zinc-200 rounded p-3">
                      No international marketplace listings logged yet for {activeBrand.name}.
                    </p>
                  ) : (
                    <div className="overflow-x-auto border border-zinc-200 rounded">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-medium text-zinc-500">
                            <th className="py-2 px-3">Source Market</th>
                            <th className="py-2 px-3">Presence Status</th>
                            <th className="py-2 px-3">Seller Channel</th>
                            <th className="py-2 px-3 text-right">Observed Price</th>
                            <th className="py-2 px-3">Verification</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {activeBrandListings.map((lst) => (
                            <tr key={lst.id}>
                              <td className="py-2 px-3 font-semibold text-zinc-900">{lst.market}</td>
                              <td className="py-2 px-3">
                                <StatusTag status={lst.presenceStatus} />
                              </td>
                              <td className="py-2 px-3 text-zinc-600">{lst.sellerType}</td>
                              <td className="py-2 px-3 text-right font-mono-tabular text-zinc-900">
                                {typeof lst.observedPrice === 'number'
                                  ? `${lst.currency} ${lst.observedPrice.toFixed(2)}`
                                  : '—'}
                              </td>
                              <td className="py-2 px-3">
                                <StatusTag status={lst.verification.verificationTier} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Discovered Product Catalog & Product Opportunity Scores */}
                <div className="space-y-3 pt-2 border-t border-zinc-100">
                  <h3 className="text-sm font-semibold text-zinc-900">
                    Discovered Product Catalogue & UK SKU Scores ({activeBrandProducts.length})
                  </h3>
                  <div className="space-y-3">
                    {activeBrandProducts.map((prod) => {
                      const pScore = productScoresById[prod.id];
                      const pUk =
                        ukAssessments.find((u) => u.productId === prod.id) ??
                        activeBrandUk[0];
                      return (
                        <div
                          key={prod.id}
                          className="border border-zinc-200 rounded p-4 bg-white flex flex-col sm:flex-row gap-4"
                        >
                          <div className="w-full sm:w-28 shrink-0">
                            <ProductVisual
                              product={prod}
                              brand={activeBrand}
                              aspect="square"
                            />
                          </div>

                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono-tabular text-zinc-500">
                                  <span>{prod.skuOrRef || 'SKU TBD'}</span>
                                  <span>·</span>
                                  <span>{prod.category}</span>
                                  {prod.asinUk && <span>· UK ASIN: {prod.asinUk}</span>}
                                  {prod.asinUs && <span>· US ASIN: {prod.asinUs}</span>}
                                </div>
                                <p className="text-sm font-semibold text-zinc-900 mt-0.5">
                                  {prod.title}
                                </p>
                                <p className="text-xs text-zinc-600 mt-0.5">{prod.variantSummary}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="font-mono-tabular text-base font-bold text-zinc-900 block">
                                  {pScore?.total ?? 0}/100
                                </span>
                                <StatusTag status={pScore?.priorityTier ?? 'Watchlist'} />
                              </div>
                            </div>

                            <p className="text-xs text-zinc-700">{prod.summary}</p>
                            {prod.imageCredit && (
                              <p className="text-[10px] text-zinc-400">
                                Product Photo: {prod.imageCredit}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100 text-[11px]">
                              <span className="text-zinc-600">
                                UK Amazon Vendor Central:{' '}
                                <strong className="text-zinc-900">
                                  {pUk?.opportunityType ?? ('Type C — Amazon UK Present, Unclear Wholesale' as UkOpportunityType)}
                                </strong>
                              </span>
                              <span className="font-mono-tabular font-semibold text-zinc-800">
                                {prod.ukRrpGBP ? `UK Est. RRP: £${prod.ukRrpGBP.toFixed(2)}` : ''}
                                {prod.usPriceUSD ? ` · US: $${prod.usPriceUSD.toFixed(2)}` : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Brand Deterministic Score Breakdown */}
              {brandScoresById[activeBrand.id] && (
                <ScoreBreakdownPanel
                  title={`${activeBrand.name} — Brand Opportunity Score`}
                  subtitle="Recalculates automatically when international listings, UK assessments, or verification evidence change"
                  breakdown={brandScoresById[activeBrand.id]}
                />
              )}

              {/* Brand Source & Verification Evidence */}
              <VerificationBadgePanel
                stamp={activeBrand.verification}
                targetType="brand"
                targetId={activeBrand.id}
                onAddEvidence={addResearchEvidence}
              />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
