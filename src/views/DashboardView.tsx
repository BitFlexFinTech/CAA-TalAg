import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Globe2,
  Handshake,
  ShieldCheck,
  Store,
  Users,
} from 'lucide-react';
import { useCommerce } from '../context/CommerceContext';
import { UkOpportunityType } from '../types/commerce';
import { StatusTag } from '../components/common/StatusTag';
import { TalentAvatar } from '../components/common/TalentAvatar';
import { BrandVisual } from '../components/common/BrandVisual';

interface DashboardViewProps {
  onOpenAddProduct: () => void;
  onOpenAddCampaign: () => void;
  onOpenAddTalent?: () => void;
}

const UK_OPP_ORDER: { type: UkOpportunityType; shortLabel: string; tone: string }[] = [
  { type: 'Type A — No UK Presence', shortLabel: 'Type A · No UK Presence', tone: 'bg-emerald-600' },
  { type: 'Type B — 3P / Unauthorised UK Sellers', shortLabel: 'Type B · Unauthorised 3P', tone: 'bg-[#BC1F2F]' },
  { type: 'Type C — Amazon UK Present, Unclear Wholesale', shortLabel: 'Type C · Unclear Wholesale', tone: 'bg-amber-600' },
  { type: 'Type D — UK DTC Site Only, No Amazon UK', shortLabel: 'Type D · UK DTC Only', tone: 'bg-zinc-900' },
  { type: 'Type E — Partial / Limited UK Catalogue', shortLabel: 'Type E · Partial Range', tone: 'bg-zinc-600' },
  { type: 'Type F — Existing UK Distributor (Caution)', shortLabel: 'Type F · Existing Dist. (Caution)', tone: 'bg-amber-800' },
  { type: 'Type G — Unsuitable / UK Market Barriers', shortLabel: 'Type G · Unsuitable / Barriers', tone: 'bg-zinc-400' },
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAddProduct,
  onOpenAddCampaign,
  onOpenAddTalent,
}) => {
  const {
    talents,
    brands,
    relationships,
    ukAssessments,
    acquisitions,
    brandStores,
    brandScoresById,
    talentScoresById,
    intelligenceMetrics,
    products,
    campaigns,
    approvals,
    activities,
    metrics,
    setActiveSection,
    setSelectedTalentId,
    setSelectedBrandId,
    decideApproval,
  } = useCommerce();

  const topBrands = [...brands]
    .sort((a, b) => (brandScoresById[b.id]?.total ?? 0) - (brandScoresById[a.id]?.total ?? 0))
    .slice(0, 6);

  const topTalents = [...talents]
    .sort((a, b) => (talentScoresById[b.id]?.total ?? 0) - (talentScoresById[a.id]?.total ?? 0))
    .slice(0, 5);

  const flaggedTalents = talents.filter(
    (t) => t.identityCheckRequired || t.caaStatus === 'Requires Verification'
  );

  const pendingApprovalsList = approvals.filter(
    (a) => a.status === 'Pending Review' || a.status === 'Changes Requested'
  );

  const kpiCards = [
    {
      label: 'CAA Talent Roster Tracked',
      value: intelligenceMetrics.totalTalents.toString(),
      sub: `${intelligenceMetrics.verifiedCaaCount} Verified Publicly · ${intelligenceMetrics.verificationFlagCount} Flagged`,
      icon: Users,
      target: 'profile' as const,
    },
    {
      label: 'Brands & Commercial Ties',
      value: intelligenceMetrics.brandsDiscovered.toString(),
      sub: `${relationships.length} non-duplicate talent-brand links`,
      icon: Building2,
      target: 'brands' as const,
    },
    {
      label: 'Discovered Products & Intl',
      value: intelligenceMetrics.productsDiscovered.toString(),
      sub: `${intelligenceMetrics.intlListingsCount} US/CA/AU/DE/FR/DTC checks`,
      icon: Globe2,
      target: 'brands' as const,
    },
    {
      label: 'High-Priority UK Opps',
      value: intelligenceMetrics.highPriorityBrandsCount.toString(),
      sub: 'Score ≥ 76/100 for Amazon UK',
      icon: ShieldCheck,
      target: 'uk-opportunities' as const,
    },
    {
      label: 'Wholesale Verification Needed',
      value: intelligenceMetrics.wholesaleVerificationNeededCount.toString(),
      sub: 'Unclear route or pending consent',
      icon: AlertTriangle,
      target: 'acquisition' as const,
    },
    {
      label: 'Awaiting CAA Introductions',
      value: intelligenceMetrics.awaitingIntroCount.toString(),
      sub: 'Route 1 Relationship-Led queue',
      icon: Handshake,
      target: 'acquisition' as const,
    },
    {
      label: 'Amazon UK Brand Stores',
      value: intelligenceMetrics.brandStoresCount.toString(),
      sub: `${intelligenceMetrics.simulatedLiveStoresCount} simulated live · ${campaigns.length} UK Ads`,
      icon: Store,
      target: 'brand-stores' as const,
    },
    {
      label: 'Operations SKUs & Approvals',
      value: `${metrics.activeProductConcepts} SKUs`,
      sub: `${metrics.outstandingApprovals} open approvals · £${metrics.demonstrationRevenue.toLocaleString()} model`,
      icon: CheckCircle2,
      target: 'concepts' as const,
    },
  ];

  const maxUkCount = Math.max(
    1,
    ...UK_OPP_ORDER.map((o) => intelligenceMetrics.ukOpportunityCounts[o.type] || 0)
  );

  return (
    <div className="space-y-7">
      {/* Executive Commercial Intelligence Hero */}
      <section className="bg-white border border-zinc-200 rounded-md p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              <span className="font-semibold text-[#BC1F2F]">
                CAA × Mercenta Commercial Intelligence Platform
              </span>
              <span aria-hidden="true">·</span>
              <span>Target Market: Amazon UK Only (£ GBP)</span>
              <span aria-hidden="true">·</span>
              <span>International Markets = Discovery Sources</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
              Global Talent Commercial Portfolio & UK Opportunity Overview
            </h1>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Investigate commercial relationships across {intelligenceMetrics.totalTalents} talent profiles, verify international marketplace demand, classify UK supply gaps (Types A–G), score wholesale priority deterministically, and convert approved brands into Amazon UK campaigns and Brand Stores.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onOpenAddTalent && (
              <button
                type="button"
                onClick={onOpenAddTalent}
                className="px-3.5 py-2 text-xs font-medium text-white bg-[#BC1F2F] hover:bg-[#9E1927] rounded transition-colors whitespace-nowrap"
              >
                + Add Talent & Run Discovery
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveSection('uk-opportunities')}
              className="px-3.5 py-2 text-xs font-medium text-zinc-800 bg-white border border-zinc-300 hover:bg-zinc-50 rounded transition-colors whitespace-nowrap"
            >
              Inspect UK Opportunities
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('brand-stores')}
              className="px-3.5 py-2 text-xs font-medium text-zinc-800 bg-white border border-zinc-300 hover:bg-zinc-50 rounded transition-colors whitespace-nowrap"
            >
              Brand Store Studio
            </button>
          </div>
        </div>

        {/* Commercial Journey Strip */}
        <div className="mt-5 pt-4 border-t border-zinc-100 flex flex-wrap items-center gap-1.5 text-[11px] font-mono-tabular text-zinc-600">
          {[
            { label: '1. Talent Roster', section: 'profile' as const },
            { label: '2. Portfolio & Brands', section: 'brands' as const },
            { label: '3. Intl & UK Gaps (A–G)', section: 'uk-opportunities' as const },
            { label: '4. Acquisition (R1/R2)', section: 'acquisition' as const },
            { label: '5. Amazon UK Ads', section: 'campaigns' as const },
            { label: '6. Brand Stores', section: 'brand-stores' as const },
            { label: '7. UK Wholesale Ops', section: 'concepts' as const },
          ].map((step, i) => (
            <React.Fragment key={step.label}>
              <button
                type="button"
                onClick={() => setActiveSection(step.section)}
                className="px-2 py-1 rounded bg-zinc-50 border border-zinc-200 hover:border-[#BC1F2F] hover:text-[#BC1F2F] transition-colors"
              >
                {step.label}
              </button>
              {i < 6 && <span className="text-zinc-300">→</span>}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* 8 Clickable Portfolio & Pipeline KPIs */}
      <section aria-label="Commercial Intelligence KPIs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-200 border border-zinc-200 rounded-md overflow-hidden">
          {kpiCards.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <button
                key={kpi.label}
                type="button"
                onClick={() => setActiveSection(kpi.target)}
                className="bg-white p-4 text-left hover:bg-zinc-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#BC1F2F]"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-zinc-500 truncate">{kpi.label}</p>
                  <Icon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                </div>
                <p className="font-mono-tabular text-2xl font-bold text-zinc-900 mt-1.5 tracking-tight">
                  {kpi.value}
                </p>
                <p className="text-[11px] text-zinc-500 mt-1 truncate">{kpi.sub}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* UK Opportunity Distribution (A-G) + Brand Acquisition Pipeline */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-md p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                UK Market Opportunity Classification (Types A–G)
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Every discovered brand & product classified strictly for Amazon UK wholesale suitability
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveSection('uk-opportunities')}
              className="text-xs font-medium text-[#BC1F2F] hover:underline inline-flex items-center gap-1 shrink-0"
            >
              <span>Inspect All ({ukAssessments.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 pt-1">
            {UK_OPP_ORDER.map((item) => {
              const count = intelligenceMetrics.ukOpportunityCounts[item.type] || 0;
              const widthPct = count > 0 ? Math.max(8, Math.round((count / maxUkCount) * 100)) : 0;
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setActiveSection('uk-opportunities')}
                  className="w-full text-left group space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-800 group-hover:text-[#BC1F2F] transition-colors">
                      {item.shortLabel}
                    </span>
                    <span className="font-mono-tabular text-zinc-600 font-semibold">
                      {count}
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-100 rounded-xs overflow-hidden">
                    <div
                      style={{ width: `${widthPct}%` }}
                      className={`h-full ${item.tone} transition-all duration-300`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Brand Acquisition Pipeline Summary */}
        <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-md p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-semibold text-zinc-900">
                  Brand Acquisition Pipeline
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Route 1 (Relationship-Led) vs Route 2 (Talent-Owned / Authorised)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSection('acquisition')}
                className="text-xs font-medium text-[#BC1F2F] hover:underline inline-flex items-center gap-1 shrink-0"
              >
                <span>Open Board</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-zinc-100 border border-zinc-200 rounded">
              {acquisitions.slice(0, 4).map((acq) => {
                const brand = brands.find((b) => b.id === acq.brandId);
                const talent = talents.find((t) => t.id === acq.primaryTalentId);
                return (
                  <button
                    key={acq.id}
                    type="button"
                    onClick={() => setActiveSection('acquisition')}
                    className="w-full text-left p-3 hover:bg-zinc-50 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <BrandVisual brand={brand} nameFallback={acq.brandId} size="sm" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-zinc-900 truncate">
                          {brand?.name ?? acq.brandId}
                        </p>
                        <p className="text-[11px] text-zinc-500 truncate mt-0.5 flex items-center gap-1.5">
                          {talent && <TalentAvatar talent={talent} size="xs" className="w-4 h-4 text-[8px]" />}
                          <span className="truncate">{talent?.name ?? ''} · {acq.route}</span>
                        </p>
                      </div>
                    </div>
                    <StatusTag status={acq.stage} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
            <span className="text-zinc-500">
              {acquisitions.filter((a) => a.wholesalePermissionConfirmed).length}/{acquisitions.length} brands confirmed UK wholesale rights
            </span>
            <button
              type="button"
              onClick={() => setActiveSection('acquisition')}
              className="font-medium text-zinc-900 hover:text-[#BC1F2F]"
            >
              Manage Permission Gates →
            </button>
          </div>
        </div>
      </section>

      {/* Top Scored UK Brands Table + Verification Flags & Top Talents */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-md overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                Highest-Scored UK Brand Opportunities
              </h2>
              <p className="text-xs text-zinc-500">
                Computed deterministically from UK gap, relationship equity, catalog depth & evidence
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveSection('brands')}
              className="text-xs font-medium text-[#BC1F2F] hover:underline inline-flex items-center gap-1"
            >
              <span>All Brands ({brands.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-medium text-zinc-500">
                  <th className="py-2.5 px-4">Brand & Linked Talent</th>
                  <th className="py-2.5 px-3">UK Gap Type</th>
                  <th className="py-2.5 px-3 text-right">Score</th>
                  <th className="py-2.5 px-4">Route Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {topBrands.map((brand) => {
                  const score = brandScoresById[brand.id];
                  const linkedRels = relationships.filter((r) => r.brandId === brand.id);
                  const linkedTalents = linkedRels
                    .map((r) => talents.find((t) => t.id === r.talentId))
                    .filter((t): t is NonNullable<typeof t> => Boolean(t));
                  const linkedTalentNames = linkedTalents.map((t) => t.name).join(', ');
                  const uk = ukAssessments.find((u) => u.brandId === brand.id);

                  return (
                    <tr
                      key={brand.id}
                      onClick={() => {
                        setSelectedBrandId(brand.id);
                        setActiveSection('brands');
                      }}
                      className="hover:bg-zinc-50 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <BrandVisual brand={brand} size="xs" />
                          {linkedTalents.length > 0 && (
                            <div className="flex -space-x-1.5 shrink-0">
                              {linkedTalents.slice(0, 2).map((lt) => (
                                <TalentAvatar
                                  key={lt.id}
                                  talent={lt}
                                  size="xs"
                                  className="ring-2 ring-white"
                                />
                              ))}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-zinc-900 truncate">{brand.name}</p>
                            <p className="text-[11px] text-zinc-500 truncate max-w-[230px]">
                              {linkedTalentNames || brand.category}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-zinc-700 whitespace-nowrap">
                        {uk?.opportunityType.split('—')[0].trim() || 'Type C'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono-tabular font-bold text-zinc-900">
                        {score?.total ?? 0}/100
                      </td>
                      <td className="py-2.5 px-4">
                        <StatusTag status={brand.ukWholesaleRouteStatus} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Flagged Verification Alerts & Top Scored Talent */}
        <div className="lg:col-span-5 space-y-6">
          {flaggedTalents.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-md p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-amber-950 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <span>Verification Flags ({flaggedTalents.length})</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveSection('profile')}
                  className="text-xs font-medium text-amber-900 underline"
                >
                  Inspect Roster
                </button>
              </div>
              {flaggedTalents.map((ft) => (
                <button
                  key={ft.id}
                  type="button"
                  onClick={() => {
                    setSelectedTalentId(ft.id);
                    setActiveSection('profile');
                  }}
                  className="w-full text-left bg-white border border-amber-200 rounded p-3 hover:border-amber-400 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <TalentAvatar talent={ft} size="sm" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-900">{ft.name}</p>
                      <p className="text-[11px] text-amber-800 line-clamp-1">
                        {ft.identityCheckNote || 'Manual identity & CAA verification required'}
                      </p>
                    </div>
                  </div>
                  <StatusTag status={ft.caaStatus} tone="warning" />
                </button>
              ))}
            </div>
          )}

          <div className="bg-white border border-zinc-200 rounded-md p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-900">
                Top Portfolio Opportunity Talents
              </h2>
              <button
                type="button"
                onClick={() => setActiveSection('profile')}
                className="text-xs font-medium text-[#BC1F2F] hover:underline"
              >
                Directory ({talents.length})
              </button>
            </div>
            <div className="divide-y divide-zinc-100">
              {topTalents.map((tal) => {
                const score = talentScoresById[tal.id];
                return (
                  <button
                    key={tal.id}
                    type="button"
                    onClick={() => {
                      setSelectedTalentId(tal.id);
                      setActiveSection('profile');
                    }}
                    className="w-full py-2.5 flex items-center justify-between gap-3 text-left hover:bg-zinc-50 px-1 rounded transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <TalentAvatar talent={tal} size="sm" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-zinc-900 truncate">{tal.name}</p>
                        <p className="text-[11px] text-zinc-500 truncate">
                          {tal.vertical} · {tal.caaStatus}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono-tabular text-xs font-bold text-zinc-900 shrink-0">
                      {score?.total ?? 0}/100
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Pending Approvals + Operations & Recent Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-md flex flex-col">
          <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">Pending Approvals</h2>
              <p className="text-xs text-zinc-500">
                Products, campaigns & Amazon Brand Stores awaiting sign-off
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveSection('approvals')}
              className="text-xs font-medium text-[#BC1F2F] hover:underline inline-flex items-center gap-1"
            >
              <span>Queue ({pendingApprovalsList.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-zinc-100 flex-1">
            {pendingApprovalsList.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-zinc-900">All queued approvals resolved</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Submit a Brand Store, Campaign, or Product Concept to test review flows.
                </p>
              </div>
            ) : (
              pendingApprovalsList.slice(0, 4).map((item) => (
                <div key={item.id} className="p-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono-tabular mb-1">
                      <span>{item.reference}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.type}</span>
                    </div>
                    <p className="text-xs font-semibold text-zinc-900 line-clamp-1">{item.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{item.linkedName}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => decideApproval(item.id, 'Approved')}
                      className="px-2.5 py-1 text-[11px] font-medium text-white bg-zinc-900 hover:bg-[#BC1F2F] rounded transition-colors whitespace-nowrap"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection('approvals')}
                      className="px-2.5 py-1 text-[11px] font-medium text-zinc-700 border border-zinc-300 hover:bg-zinc-50 rounded transition-colors whitespace-nowrap"
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-md p-6 flex flex-col justify-between space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                Recent Commercial Discoveries & Operations Log
              </h2>
              <p className="text-xs text-zinc-500">
                Synchronized discovery scans, acquisition gates, Brand Stores & UK operations
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenAddProduct}
                className="px-2.5 py-1.5 text-[11px] font-medium text-zinc-700 bg-zinc-50 border border-zinc-200 hover:border-zinc-400 rounded"
              >
                Catalog & Mockups ({products.length})
              </button>
              <button
                type="button"
                onClick={onOpenAddCampaign}
                className="px-2.5 py-1.5 text-[11px] font-medium text-zinc-700 bg-zinc-50 border border-zinc-200 hover:border-zinc-400 rounded"
              >
                UK Ads & Stores ({brandStores.length})
              </button>
            </div>
          </div>

          <ul className="divide-y divide-zinc-100">
            {activities.slice(0, 5).map((act) => (
              <li key={act.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-zinc-900">{act.title}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">{act.detail}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[11px] font-medium text-[#BC1F2F] block">{act.category}</span>
                  <span className="font-mono-tabular text-[10px] text-zinc-400">{act.timestamp}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};
