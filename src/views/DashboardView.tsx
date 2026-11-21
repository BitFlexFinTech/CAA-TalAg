import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Info } from 'lucide-react';
import { useCommerce } from '../context/CommerceContext';
import { ILLUSTRATIVE_MONTHLY_REVENUE, TALENT_PROFILE } from '../data/seedData';
import { MediaFrame } from '../components/common/MediaFrame';
import { StatusTag } from '../components/common/StatusTag';

interface DashboardViewProps {
  onOpenAddProduct: () => void;
  onOpenAddCampaign: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAddProduct,
  onOpenAddCampaign,
}) => {
  const {
    products,
    campaigns,
    approvals,
    activities,
    metrics,
    setActiveSection,
    decideApproval,
  } = useCommerce();

  const [chartMode, setChartMode] = useState<'combined' | 'launch' | 'replenishment'>('combined');
  const [hoveredMonthIdx, setHoveredMonthIdx] = useState<number | null>(null);

  const pendingApprovalsList = approvals.filter(
    (a) => a.status === 'Pending Review' || a.status === 'Changes Requested'
  );

  const maxChartValue = Math.max(
    ...ILLUSTRATIVE_MONTHLY_REVENUE.map((d) =>
      chartMode === 'combined'
        ? d.launchPO + d.replenishmentPO
        : chartMode === 'launch'
        ? d.launchPO
        : d.replenishmentPO
    )
  );

  const kpiCards = [
    {
      label: 'Active Product Concepts',
      value: metrics.activeProductConcepts.toString(),
      sub: 'Amazon UK Wholesale SKUs',
      target: 'concepts' as const,
    },
    {
      label: 'Products Awaiting Approval',
      value: metrics.productsAwaitingApproval.toString(),
      sub: 'Pending CAA / Talent review',
      target: 'approvals' as const,
    },
    {
      label: 'Campaigns in Development',
      value: metrics.campaignsInDevelopment.toString(),
      sub: 'Amazon.co.uk Ads templates',
      target: 'campaigns' as const,
    },
    {
      label: 'Pending Creative Approvals',
      value: metrics.pendingCreativeApprovals.toString(),
      sub: 'Ads & bespoke creative assets',
      target: 'approvals' as const,
    },
    {
      label: 'Amazon UK Vendor POs',
      value: metrics.demonstrationOrders.toString(),
      sub: 'SP-API UK FC records',
      target: 'fulfilment' as const,
    },
    {
      label: 'Amazon UK Wholesale Model',
      value: `£${metrics.demonstrationRevenue.toLocaleString()}`,
      sub: 'Illustrative GBP Vendor Central',
      target: 'financials' as const,
    },
    {
      label: 'Estimated Talent Royalties',
      value: `£${metrics.estimatedTalentRoyalties.toLocaleString()}`,
      sub: 'Illustrative · Non-contractual',
      target: 'royalties' as const,
    },
    {
      label: 'Outstanding Approvals',
      value: metrics.outstandingApprovals.toString(),
      sub: 'Total open review items',
      target: 'approvals' as const,
    },
  ];

  const approvedProductsCount = products.filter((p) => p.approvalStatus === 'Approved').length;
  const prodReadyCount = products.filter(
    (p) => p.developmentStage === 'Pre-Production' || p.developmentStage === 'Production Ready'
  ).length;
  const approvedCampaignsCount = campaigns.filter((c) => c.approvalStatus === 'Approved').length;

  const progressRows = [
    {
      label: 'Product Concept Approvals',
      done: approvedProductsCount,
      total: products.length,
    },
    {
      label: 'Pre-Production & Sample Readiness',
      done: prodReadyCount,
      total: products.length,
    },
    {
      label: 'Amazon UK Campaign Sign-Offs',
      done: approvedCampaignsCount,
      total: campaigns.length,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Talent Hero Header */}
      <section className="bg-white border border-zinc-200 rounded-md p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-9 flex flex-col justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 mb-2">
                <span className="font-medium text-[#BC1F2F]">CAA Talent Commerce Proof of Concept</span>
                <span aria-hidden="true">·</span>
                <span>Sole Talent: Darren Watkins Jr. (iShowSpeed)</span>
                <span aria-hidden="true">·</span>
                <span>Operational Partner: Mercenta</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
                iShowSpeed — Talent Commerce Overview
              </h1>
              <p className="text-sm sm:text-base text-zinc-600 mt-2 max-w-2xl leading-relaxed">
                Manage proposed UK merchandise, Speed FC apparel concepts, Amazon UK Vendor Central wholesale POs, and Amazon.co.uk Ads campaigns for iShowSpeed.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-zinc-100">
              <div className="flex items-start gap-2 text-xs text-zinc-500 max-w-xl">
                <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  All GBP (£) figures, product concepts, campaign projections, Amazon UK POs, and royalty calculations below are{' '}
                  <strong className="font-medium text-zinc-700">illustrative demonstration data</strong>{' '}
                  and do not represent an active agreement or historical sales.
                </span>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={onOpenAddProduct}
                  className="px-3.5 py-2 text-xs font-medium text-white bg-[#BC1F2F] hover:bg-[#9E1927] rounded transition-colors whitespace-nowrap"
                >
                  Browse Production Catalog
                </button>
                <button
                  type="button"
                  onClick={onOpenAddCampaign}
                  className="px-3.5 py-2 text-xs font-medium text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50 rounded transition-colors whitespace-nowrap"
                >
                  New Amazon UK Campaign
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 flex flex-col justify-between">
            <MediaFrame
              src={TALENT_PROFILE.primaryPortrait}
              alt="iShowSpeed (Darren Watkins Jr.)"
              aspectClass="aspect-[4/3] lg:h-full"
              imgClassName="object-cover object-top"
              caption="iShowSpeed · CC BY-SA 2.0 (Chin Yu Chu)"
              className="rounded"
            />
          </div>
        </div>
      </section>

      {/* 8 Illustrative KPIs */}
      <section aria-label="Illustrative programme metrics">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-zinc-900">
            Programme Snapshot (Amazon UK Wholesale · Illustrative GBP)
          </h2>
          <span className="text-xs text-zinc-500">Click any metric to open module</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-200 border border-zinc-200 rounded-md overflow-hidden">
          {kpiCards.map((kpi) => (
            <button
              key={kpi.label}
              type="button"
              onClick={() => setActiveSection(kpi.target)}
              className="bg-white p-4 text-left hover:bg-zinc-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#BC1F2F]"
            >
              <p className="text-xs font-medium text-zinc-500 truncate">{kpi.label}</p>
              <p className="font-mono-tabular text-2xl font-semibold text-zinc-900 mt-1.5 tracking-tight">
                {kpi.value}
              </p>
              <p className="text-[11px] text-zinc-500 mt-1 truncate">{kpi.sub}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Illustrative Amazon UK Wholesale Revenue Chart + Programme Progress */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-md p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                Amazon UK Wholesale Revenue Model (Launch POs & Replenishment)
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Sample 6-month Amazon UK Vendor Central PO trajectory (£ GBP) · Not actual sales
              </p>
            </div>
            <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded border border-zinc-200">
              {(['combined', 'launch', 'replenishment'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setChartMode(mode)}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                    chartMode === mode
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {mode === 'combined'
                    ? 'Combined'
                    : mode === 'launch'
                    ? 'Launch POs'
                    : 'Replenishment'}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-6 gap-3 sm:gap-5 items-end h-52 pt-6 pb-2 border-b border-zinc-200">
              {ILLUSTRATIVE_MONTHLY_REVENUE.map((item, idx) => {
                const launchVal = chartMode === 'replenishment' ? 0 : item.launchPO;
                const repVal = chartMode === 'launch' ? 0 : item.replenishmentPO;
                const total = launchVal + repVal;
                const heightPct = maxChartValue > 0 ? Math.max(6, (total / maxChartValue) * 100) : 0;
                const launchSharePct = total > 0 ? (launchVal / total) * 100 : 0;
                const isHovered = hoveredMonthIdx === idx;

                return (
                  <div
                    key={item.month}
                    onMouseEnter={() => setHoveredMonthIdx(idx)}
                    onMouseLeave={() => setHoveredMonthIdx(null)}
                    className="h-full flex flex-col justify-end items-center group cursor-default"
                  >
                    <div className="text-[11px] font-mono-tabular text-zinc-600 mb-1.5">
                      £{Math.round(total / 1000)}k
                    </div>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full max-w-[44px] rounded-t-xs overflow-hidden flex flex-col justify-end transition-opacity ${
                        isHovered ? 'opacity-90 ring-1 ring-zinc-400' : 'opacity-100'
                      }`}
                    >
                      {repVal > 0 && (
                        <div
                          style={{ height: `${100 - launchSharePct}%` }}
                          className="w-full bg-zinc-800"
                          title={`Replenishment POs (Illustrative): £${repVal.toLocaleString()}`}
                        />
                      )}
                      {launchVal > 0 && (
                        <div
                          style={{ height: `${launchSharePct}%` }}
                          className="w-full bg-[#BC1F2F]"
                          title={`Launch POs (Illustrative): £${launchVal.toLocaleString()}`}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-6 gap-3 sm:gap-5 pt-2">
              {ILLUSTRATIVE_MONTHLY_REVENUE.map((item) => (
                <div key={item.month} className="text-center text-[11px] text-zinc-500 font-medium">
                  {item.month}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-3 border-t border-zinc-100 text-xs text-zinc-600">
              <div className="flex items-center gap-5">
                <span className="inline-flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#BC1F2F] inline-block rounded-xs" />
                  <span>Amazon UK Launch POs</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="w-3 h-3 bg-zinc-800 inline-block rounded-xs" />
                  <span>Amazon UK Replenishment POs</span>
                </span>
              </div>
              {hoveredMonthIdx !== null ? (
                <span className="font-mono-tabular text-zinc-800">
                  {ILLUSTRATIVE_MONTHLY_REVENUE[hoveredMonthIdx].month}: Launch £
                  {ILLUSTRATIVE_MONTHLY_REVENUE[hoveredMonthIdx].launchPO.toLocaleString()} · Replenishment £
                  {ILLUSTRATIVE_MONTHLY_REVENUE[hoveredMonthIdx].replenishmentPO.toLocaleString()}
                </span>
              ) : (
                <span className="text-zinc-400">Hover bars for monthly GBP PO breakdown</span>
              )}
            </div>
          </div>
        </div>

        {/* Programme Progress */}
        <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-md p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-semibold text-zinc-900">Programme Progress</h2>
              <span className="font-mono-tabular text-sm font-semibold text-[#BC1F2F]">
                {metrics.programmeCompletionPct}%
              </span>
            </div>
            <p className="text-xs text-zinc-500 mb-5">
              Live demonstration readiness across iShowSpeed concepts, approvals & Amazon UK campaigns
            </p>

            <div className="space-y-4">
              {progressRows.map((row) => {
                const pct = row.total > 0 ? Math.round((row.done / row.total) * 100) : 0;
                return (
                  <div key={row.label}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-zinc-700 font-medium">{row.label}</span>
                      <span className="font-mono-tabular text-zinc-500">
                        {row.done}/{row.total} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-100 rounded-xs overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full bg-zinc-900 transition-all duration-300"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
            <span className="text-xs text-zinc-500">Royalty Model Status</span>
            <button
              type="button"
              onClick={() => setActiveSection('royalties')}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#BC1F2F] hover:underline"
            >
              <span>Inspect Statements</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Product Development Overview & Pending Actions */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-md overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                Product Development Overview
              </h2>
              <p className="text-xs text-zinc-500">
                Proposed iShowSpeed SKUs & Amazon UK wholesale margins
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveSection('concepts')}
              className="text-xs font-medium text-[#BC1F2F] hover:underline inline-flex items-center gap-1"
            >
              <span>View All ({products.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-medium text-zinc-500">
                  <th className="py-2.5 px-4">Product Concept</th>
                  <th className="py-2.5 px-3">Stage</th>
                  <th className="py-2.5 px-3 text-right">UK Whsl</th>
                  <th className="py-2.5 px-3 text-right">Whsl Margin</th>
                  <th className="py-2.5 px-4">Approval</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 px-4 text-center text-zinc-500">
                      <p className="font-medium text-zinc-800">No product concepts created yet</p>
                      <p className="text-[11px] mt-1">
                        Upload logos & artwork in Creative Assets, then create concepts manually or configure blanks from the 586-item Production Catalog.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveSection('concepts')}
                        className="mt-3 px-3 py-1.5 text-[11px] font-medium text-white bg-[#BC1F2F] hover:bg-[#9E1927] rounded"
                      >
                        Create Product Concept
                      </button>
                    </td>
                  </tr>
                ) : (
                  products.slice(0, 6).map((prod) => {
                    const marginPct =
                      prod.proposedWholesale > 0
                        ? Math.round(
                            ((prod.proposedWholesale - prod.proposedCost) / prod.proposedWholesale) *
                              100
                          )
                        : 0;
                    return (
                      <tr
                        key={prod.id}
                        onClick={() => setActiveSection('concepts')}
                        className="hover:bg-zinc-50 cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-9 h-9 rounded object-cover border border-zinc-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-medium text-zinc-900 truncate max-w-[200px]">
                                {prod.name}
                              </p>
                              <p className="text-[11px] text-zinc-500 font-mono-tabular">
                                {prod.sku} · {prod.category}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-zinc-700 whitespace-nowrap">
                          {prod.developmentStage}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono-tabular text-zinc-900">
                          £{prod.proposedWholesale.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono-tabular text-zinc-700">
                          {marginPct}%
                        </td>
                        <td className="py-2.5 px-4">
                          <StatusTag status={prod.approvalStatus} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Actions */}
        <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-md flex flex-col">
          <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">Pending Actions</h2>
              <p className="text-xs text-zinc-500">
                Items awaiting CAA or talent representative decision
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveSection('approvals')}
              className="text-xs font-medium text-[#BC1F2F] hover:underline inline-flex items-center gap-1"
            >
              <span>Approval Centre</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-zinc-100 flex-1">
            {pendingApprovalsList.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-zinc-900">All queued approvals resolved</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Submit a product concept or campaign to test additional review flows.
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
      </section>

      {/* Campaign Activity & Recent iShowSpeed Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                Amazon UK Ads Campaigns
              </h2>
              <p className="text-xs text-zinc-500">
                Sponsored Products, Brands, Display, TV, DSP, Brand Store & Audio for amazon.co.uk
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveSection('campaigns')}
              className="text-xs font-medium text-[#BC1F2F] hover:underline inline-flex items-center gap-1"
            >
              <span>Manage Campaigns</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {campaigns.slice(0, 3).map((cmp) => (
              <div
                key={cmp.id}
                onClick={() => setActiveSection('campaigns')}
                className="border border-zinc-200 rounded overflow-hidden hover:border-zinc-400 transition-colors cursor-pointer flex flex-col"
              >
                <MediaFrame
                  src={cmp.heroImage}
                  alt={cmp.name}
                  aspectClass="aspect-[4/3]"
                  imgClassName="object-cover object-top"
                  caption={cmp.heroCredit}
                />
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-[11px] font-mono-tabular text-zinc-500">{cmp.code}</p>
                    <h3 className="text-xs font-semibold text-zinc-900 mt-0.5 line-clamp-2">
                      {cmp.name}
                    </h3>
                  </div>
                  <div className="mt-3 pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
                    <StatusTag status={cmp.approvalStatus} />
                    <span className="font-mono-tabular text-[11px] text-zinc-600">
                      £{Math.round(cmp.illustrativeEstRevenue / 1000)}k est.
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent iShowSpeed-related Activity */}
        <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                Recent iShowSpeed Activity
              </h2>
              <p className="text-xs text-zinc-500">Synchronized workspace event log</p>
            </div>
          </div>
          <ul className="divide-y divide-zinc-100">
            {activities.slice(0, 5).map((act) => (
              <li key={act.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-500 mb-0.5">
                  <span className="font-medium text-zinc-700">{act.category}</span>
                  <span className="font-mono-tabular">{act.timestamp}</span>
                </div>
                <p className="text-xs font-medium text-zinc-900">{act.title}</p>
                <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{act.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};
