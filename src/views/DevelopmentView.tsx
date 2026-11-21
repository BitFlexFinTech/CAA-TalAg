import React, { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Send,
  SlidersHorizontal,
} from 'lucide-react';
import { useCommerce } from '../context/CommerceContext';
import { CatalogBlankProduct, DevelopmentStage } from '../types/commerce';
import { StatusTag } from '../components/common/StatusTag';
import { CatalogConfiguratorModal } from '../components/catalog/CatalogConfiguratorModal';

const STAGES: DevelopmentStage[] = [
  'Concept Draft',
  'Tech Pack',
  'Sampling',
  'Pre-Production',
  'Production Ready',
];

export const DevelopmentView: React.FC = () => {
  const {
    products,
    catalogProducts,
    changeProductStage,
    submitProductForApproval,
  } = useCommerce();

  const [tab, setTab] = useState<'all-blanks' | 'pipeline'>('all-blanks');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const [configuring, setConfiguring] = useState<CatalogBlankProduct | null>(null);

  const filteredCatalog = useMemo(() => {
    const q = search.trim().toLowerCase();
    return catalogProducts.filter((p) => {
      return (
        !q ||
        `${p.title} ${p.typeName} ${p.brandSpec} ${p.skuCode} ${p.productionLine}`
          .toLowerCase()
          .includes(q)
      );
    });
  }, [catalogProducts, search]);

  const totalPages = Math.max(1, Math.ceil(filteredCatalog.length / PAGE_SIZE));
  const pagedCatalog = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredCatalog.slice(start, start + PAGE_SIZE);
  }, [filteredCatalog, page, totalPages]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#BC1F2F] mb-1">
            UK Multi-Line Blank Directory & Stage-Gate Pipeline
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Product Development
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            Explore all {catalogProducts.length} UK-ready blanks across apparel, Speed FC kits, collector editions, and drinkware, or manage iShowSpeed SKUs across development gates.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-zinc-100 border border-zinc-200 rounded-md">
          <button
            type="button"
            onClick={() => setTab('all-blanks')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              tab === 'all-blanks'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            All Catalog Blanks ({catalogProducts.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('pipeline')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              tab === 'pipeline'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Stage-Gate Board ({products.length})
          </button>
        </div>
      </div>

      {tab === 'all-blanks' ? (
        <div className="space-y-4">
          <div className="bg-white border border-zinc-200 rounded-md p-4">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Filter catalog blanks by title, spec, production line, or blank code..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-300 rounded focus:outline-none focus:border-zinc-900"
              />
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-medium text-zinc-500">
                    <th className="py-3 px-4">Blank Code</th>
                    <th className="py-3 px-3">Blank Product</th>
                    <th className="py-3 px-3">Production Line</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3 text-right">From (Bulk £)</th>
                    <th className="py-3 px-3 text-right">Variants</th>
                    <th className="py-3 px-4 text-right">Configure</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-xs">
                  {pagedCatalog.map((item) => {
                    const lowestCost =
                      item.variants.length > 0
                        ? Math.min(...item.variants.map((v) => v.singleUnitCostGBP))
                        : null;
                    const variantTotal = item.variantCount ?? item.variants.length;
                    return (
                      <tr key={item.id} className="hover:bg-zinc-50">
                        <td className="py-2.5 px-4 font-mono-tabular text-zinc-500">
                          {item.skuCode}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image}
                              alt={item.title}
                              referrerPolicy="no-referrer"
                              className="w-9 h-9 rounded object-contain bg-zinc-50 border border-zinc-200 shrink-0"
                            />
                            <div>
                              <span className="font-medium text-zinc-900 block">{item.title}</span>
                              <span className="text-[11px] text-zinc-500">{item.brandSpec}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-zinc-600">{item.productionLine}</td>
                        <td className="py-2.5 px-3 text-zinc-600">{item.filterGroup}</td>
                        <td className="py-2.5 px-3 text-right font-mono-tabular text-zinc-900 font-medium">
                          {lowestCost !== null ? `£${(lowestCost * 0.72).toFixed(2)}` : 'Live Tier'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono-tabular text-zinc-800">
                          {variantTotal}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setConfiguring(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-[#BC1F2F] rounded transition-colors whitespace-nowrap"
                          >
                            <SlidersHorizontal className="w-3 h-3" />
                            <span>Select Variant</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3 text-xs bg-zinc-50">
                <span className="font-mono-tabular text-zinc-600">
                  {filteredCatalog.length} catalog blanks matched
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-zinc-300 rounded disabled:opacity-40"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>
                  <span className="font-mono-tabular text-zinc-700">
                    Page {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-zinc-300 rounded disabled:opacity-40"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 5-Column Stage-Gate Board */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 items-start">
          {STAGES.map((stage, stageIdx) => {
            const items = products.filter((p) => p.developmentStage === stage);
            return (
              <div
                key={stage}
                className="bg-zinc-100/80 border border-zinc-200 rounded-md p-3 space-y-3 min-h-[420px]"
              >
                <div className="flex items-center justify-between px-1 pb-2 border-b border-zinc-200">
                  <div>
                    <p className="text-[11px] font-mono-tabular text-zinc-500">
                      Stage 0{stageIdx + 1}
                    </p>
                    <h2 className="text-xs font-semibold text-zinc-900">{stage}</h2>
                  </div>
                  <span className="font-mono-tabular text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 px-2 py-0.5 rounded">
                    {items.length}
                  </span>
                </div>

                {items.length === 0 ? (
                  <div className="p-4 border border-dashed border-zinc-300 rounded text-center text-xs text-zinc-400">
                    No concepts in {stage}
                  </div>
                ) : (
                  items.map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-white border border-zinc-200 rounded p-3 space-y-2.5"
                    >
                      <div className="flex items-start gap-2.5">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-11 h-11 rounded object-contain bg-zinc-50 border border-zinc-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-mono-tabular text-[10px] text-zinc-500">{prod.sku}</p>
                          <p className="text-xs font-semibold text-zinc-900 leading-snug">
                            {prod.name}
                          </p>
                        </div>
                      </div>

                      <p className="text-[11px] text-zinc-600 line-clamp-2">{prod.fabricSpec}</p>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <StatusTag status={prod.approvalStatus} />
                        {prod.approvalStatus !== 'Approved' &&
                          prod.approvalStatus !== 'Pending Review' && (
                            <button
                              type="button"
                              onClick={() => submitProductForApproval(prod.id)}
                              title="Submit for Approval"
                              className="p-1.5 text-zinc-600 hover:text-[#BC1F2F] hover:bg-zinc-100 rounded"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          )}
                      </div>

                      <div className="flex items-center justify-between gap-1 pt-2 border-t border-zinc-100">
                        <button
                          type="button"
                          disabled={stageIdx === 0}
                          onClick={() => changeProductStage(prod.id, STAGES[stageIdx - 1])}
                          className="inline-flex items-center gap-0.5 px-2 py-1 text-[11px] text-zinc-600 hover:bg-zinc-100 rounded disabled:opacity-30"
                        >
                          <ChevronLeft className="w-3 h-3" />
                          <span>Back</span>
                        </button>
                        <button
                          type="button"
                          disabled={stageIdx === STAGES.length - 1}
                          onClick={() => changeProductStage(prod.id, STAGES[stageIdx + 1])}
                          className="inline-flex items-center gap-0.5 px-2 py-1 text-[11px] font-medium text-zinc-900 hover:bg-zinc-100 rounded disabled:opacity-30"
                        >
                          <span>Advance</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      )}

      <CatalogConfiguratorModal
        product={configuring}
        onClose={() => setConfiguring(null)}
        onPromoted={() => setTab('pipeline')}
      />
    </div>
  );
};
