import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useCommerce } from '../context/CommerceContext';
import { StatusTag } from '../components/common/StatusTag';

export const InventoryView: React.FC = () => {
  const { inventory, updateInventoryUnits } = useCommerce();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return inventory.filter(
      (i) =>
        !q ||
        i.productName.toLowerCase().includes(q) ||
        i.sku.toLowerCase().includes(q) ||
        i.hubLocation.toLowerCase().includes(q)
    );
  }, [inventory, search]);

  const totals = useMemo(() => {
    return inventory.reduce(
      (acc, i) => ({
        samples: acc.samples + i.sampleUnits,
        planned: acc.planned + i.proposedInitialRun,
        available: acc.available + i.availableBuffer,
      }),
      { samples: 0, planned: 0, available: 0 }
    );
  }, [inventory]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-[#BC1F2F] mb-1">
          Illustrative Allocation & Sample Readiness · Proposed Stock Model
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          iShowSpeed Inventory & Allocation
        </h1>
        <p className="text-sm text-zinc-600 mt-1">
          Adjust sample counts and proposed initial production run quantities to model regional 3PL readiness.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-zinc-200 border border-zinc-200 rounded-md overflow-hidden">
        <div className="bg-white p-4">
          <p className="text-xs text-zinc-500">Sample Units on Hand (Demo)</p>
          <p className="font-mono-tabular text-2xl font-semibold text-zinc-900 mt-1">
            {totals.samples}
          </p>
        </div>
        <div className="bg-white p-4">
          <p className="text-xs text-zinc-500">Proposed Initial Run Units</p>
          <p className="font-mono-tabular text-2xl font-semibold text-zinc-900 mt-1">
            {totals.planned.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4">
          <p className="text-xs text-zinc-500">Available Demo Buffer</p>
          <p className="font-mono-tabular text-2xl font-semibold text-zinc-900 mt-1">
            {totals.available.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-md p-4">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by SKU, product, or 3PL hub..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-300 rounded focus:outline-none focus:border-zinc-900"
          />
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-medium text-zinc-500">
                <th className="py-3 px-4">SKU & Product</th>
                <th className="py-3 px-3">Hub Location (Illustrative)</th>
                <th className="py-3 px-3 text-right">Sample Units</th>
                <th className="py-3 px-3 text-right">Proposed Run</th>
                <th className="py-3 px-3 text-right">Demo Allocated</th>
                <th className="py-3 px-3 text-right">Available Buffer</th>
                <th className="py-3 px-4">Readiness</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-zinc-900">{item.productName}</p>
                    <p className="font-mono-tabular text-[11px] text-zinc-500">
                      {item.sku} · {item.category}
                    </p>
                  </td>
                  <td className="py-3 px-3 text-zinc-600">{item.hubLocation}</td>
                  <td className="py-3 px-3 text-right">
                    <input
                      type="number"
                      min="0"
                      value={item.sampleUnits}
                      onChange={(e) =>
                        updateInventoryUnits(
                          item.id,
                          Math.max(0, Number(e.target.value) || 0),
                          item.proposedInitialRun
                        )
                      }
                      aria-label={`Sample units for ${item.productName}`}
                      className="w-16 px-2 py-1 text-right font-mono-tabular border border-zinc-300 rounded bg-white"
                    />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={item.proposedInitialRun}
                      onChange={(e) =>
                        updateInventoryUnits(
                          item.id,
                          item.sampleUnits,
                          Math.max(0, Number(e.target.value) || 0)
                        )
                      }
                      aria-label={`Proposed run for ${item.productName}`}
                      className="w-20 px-2 py-1 text-right font-mono-tabular border border-zinc-300 rounded bg-white"
                    />
                  </td>
                  <td className="py-3 px-3 text-right font-mono-tabular text-zinc-600">
                    {item.allocatedDemoUnits.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono-tabular font-semibold text-zinc-900">
                    {item.availableBuffer.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <StatusTag status={item.readinessStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
