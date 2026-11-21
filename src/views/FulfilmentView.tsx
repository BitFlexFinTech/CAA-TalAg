import React, { useMemo, useState } from 'react';
import { Check, Search } from 'lucide-react';
import { useCommerce } from '../context/CommerceContext';
import { FulfilmentOrder, FulfilmentStage } from '../types/commerce';
import { StatusTag } from '../components/common/StatusTag';
import { Drawer } from '../components/common/Drawer';

const DELIVERY_STAGES: FulfilmentStage[] = [
  'Allocated (Demo)',
  'In Production',
  'Packed at 3PL',
  'Dispatched',
  'In Transit',
  'Delivered (Demo)',
];

export const FulfilmentView: React.FC = () => {
  const { fulfilmentOrders, advanceOrderDelivery } = useCommerce();
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<'All' | FulfilmentStage>('All');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return fulfilmentOrders.filter((o) => {
      const matchStage = stageFilter === 'All' || o.deliveryStatus === stageFilter;
      const matchSearch =
        !q ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.productName.toLowerCase().includes(q) ||
        o.region.toLowerCase().includes(q);
      return matchStage && matchSearch;
    });
  }, [fulfilmentOrders, search, stageFilter]);

  const selectedOrder: FulfilmentOrder | null = useMemo(
    () => fulfilmentOrders.find((o) => o.id === selectedOrderId) ?? null,
    [fulfilmentOrders, selectedOrderId]
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-[#BC1F2F] mb-1">
          Demonstration Fulfilment Simulation · Sample Order Records Only
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Orders & Fulfilment Tracker
        </h1>
        <p className="text-sm text-zinc-600 mt-1">
          Click any demonstration order to inspect its end-to-end production, 3PL dispatch, and delivery timeline.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-zinc-200 rounded-md p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order ID, product, or destination..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-300 rounded focus:outline-none focus:border-zinc-900"
          />
        </div>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value as 'All' | FulfilmentStage)}
          aria-label="Filter by delivery status"
          className="px-3 py-2 text-xs border border-zinc-300 rounded bg-white"
        >
          <option value="All">All Delivery Stages</option>
          {DELIVERY_STAGES.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-zinc-200 rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-medium text-zinc-500">
                <th className="py-3 px-4">Demo Order</th>
                <th className="py-3 px-3">Channel & Region</th>
                <th className="py-3 px-3">iShowSpeed Product</th>
                <th className="py-3 px-3 text-right">Qty</th>
                <th className="py-3 px-3 text-right">Value</th>
                <th className="py-3 px-3">Dispatch Status</th>
                <th className="py-3 px-4">Delivery Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs">
              {filtered.map((ord) => (
                <tr
                  key={ord.id}
                  onClick={() => setSelectedOrderId(ord.id)}
                  className="hover:bg-zinc-50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4">
                    <p className="font-mono-tabular font-semibold text-zinc-900">
                      {ord.orderNumber}
                    </p>
                    <p className="text-[11px] text-zinc-500 font-mono-tabular">{ord.createdAt}</p>
                  </td>
                  <td className="py-3 px-3">
                    <p className="text-zinc-800">{ord.channel}</p>
                    <p className="text-[11px] text-zinc-500">{ord.region}</p>
                  </td>
                  <td className="py-3 px-3 font-medium text-zinc-900">{ord.productName}</td>
                  <td className="py-3 px-3 text-right font-mono-tabular">{ord.quantity}</td>
                  <td className="py-3 px-3 text-right font-mono-tabular font-semibold">
                    £{ord.orderValue.toLocaleString()}
                  </td>
                  <td className="py-3 px-3">
                    <StatusTag status={ord.dispatchStatus} />
                  </td>
                  <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={ord.deliveryStatus}
                      onChange={(e) =>
                        advanceOrderDelivery(ord.id, e.target.value as FulfilmentStage)
                      }
                      aria-label={`Update delivery status for ${ord.orderNumber}`}
                      className="text-xs border border-zinc-300 rounded px-2 py-1 bg-white"
                    >
                      {DELIVERY_STAGES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail & Timeline Drawer */}
      <Drawer
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrderId(null)}
        title={selectedOrder?.orderNumber ?? ''}
        subtitle={
          selectedOrder
            ? `${selectedOrder.channel} · ${selectedOrder.region} · Demonstration Record`
            : undefined
        }
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <StatusTag status={selectedOrder.deliveryStatus} />
              <select
                value={selectedOrder.deliveryStatus}
                onChange={(e) =>
                  advanceOrderDelivery(selectedOrder.id, e.target.value as FulfilmentStage)
                }
                className="text-xs border border-zinc-300 rounded px-2.5 py-1.5 bg-white font-medium"
              >
                {DELIVERY_STAGES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-50 border border-zinc-200 rounded text-xs">
              <div>
                <p className="text-zinc-500">Product</p>
                <p className="font-semibold text-zinc-900 mt-0.5">{selectedOrder.productName}</p>
              </div>
              <div>
                <p className="text-zinc-500">Quantity & Order Value</p>
                <p className="font-mono-tabular font-semibold text-zinc-900 mt-0.5">
                  {selectedOrder.quantity} units · £{selectedOrder.orderValue.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-zinc-500">Production Status</p>
                <p className="font-medium text-zinc-900 mt-0.5">{selectedOrder.productionStage}</p>
              </div>
              <div>
                <p className="text-zinc-500">Dispatch Status</p>
                <p className="font-medium text-zinc-900 mt-0.5">{selectedOrder.dispatchStatus}</p>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-zinc-900 mb-3">
                Fulfilment & Delivery Timeline (Click a step to update status)
              </h3>
              <ol className="space-y-2.5">
                {selectedOrder.timeline.map((step) => (
                  <li key={step.label}>
                    <button
                      type="button"
                      onClick={() =>
                        advanceOrderDelivery(selectedOrder.id, step.label as FulfilmentStage)
                      }
                      className={`w-full text-left p-3 rounded border flex items-start justify-between gap-3 transition-colors ${
                        step.completed
                          ? 'bg-white border-zinc-300 hover:border-zinc-500'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 ${
                            step.completed
                              ? 'bg-emerald-700 text-white'
                              : 'bg-zinc-200 text-zinc-500'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-zinc-900">{step.label}</p>
                          <p className="text-[11px] text-zinc-500 mt-0.5">{step.detail}</p>
                        </div>
                      </div>
                      <span className="font-mono-tabular text-[11px] text-zinc-500 shrink-0">
                        {step.timestamp}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
