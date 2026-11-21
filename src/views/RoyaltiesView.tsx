import React, { useMemo, useState } from 'react';
import { FileSpreadsheet, Info } from 'lucide-react';
import { useCommerce } from '../context/CommerceContext';
import { StatusTag } from '../components/common/StatusTag';
import { Drawer } from '../components/common/Drawer';

export const RoyaltiesView: React.FC = () => {
  const { royaltyStatements, updateRoyaltyRates, toggleRoyaltyPaymentStatus } = useCommerce();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedStatement = useMemo(
    () => royaltyStatements.find((s) => s.id === selectedId) ?? null,
    [royaltyStatements, selectedId]
  );

  const [editWholesaleRate, setEditWholesaleRate] = useState<string>('14');

  const openInspector = (id: string) => {
    const st = royaltyStatements.find((s) => s.id === id);
    if (st) {
      setEditWholesaleRate(st.assumedWholesaleRatePct.toString());
    }
    setSelectedId(id);
  };

  const totals = useMemo(() => {
    return royaltyStatements.reduce(
      (acc, st) => ({
        launch: acc.launch + st.launchWholesaleRevenue,
        replenishment: acc.replenishment + st.replenishmentWholesaleRevenue,
        royalties: acc.royalties + st.illustrativeRoyaltyTotal,
      }),
      { launch: 0, replenishment: 0, royalties: 0 }
    );
  }, [royaltyStatements]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-[#BC1F2F] mb-1">
          Illustrative Amazon UK Wholesale Royalty Engine · Non-Contractual Assumptions (£ GBP)
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          iShowSpeed Royalties & Sample Statements
        </h1>
        <p className="text-sm text-zinc-600 mt-1">
          Inspect how Mercenta Partners models transparent SKU-level royalty calculations across Amazon UK Vendor Central launch and replenishment POs.
        </p>
      </div>

      {/* Explicit Honest Disclaimer */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-md p-4 flex items-start gap-3 text-xs text-zinc-600">
        <Info className="w-4 h-4 text-[#BC1F2F] shrink-0 mt-0.5" />
        <p>
          <strong className="text-zinc-900 font-semibold">Illustrative Assumptions Only:</strong>{' '}
          Royalty rates (e.g. 14% Amazon UK wholesale) and GBP statement figures shown below are demonstration benchmarks for CAA review. No contractual royalty terms exist, and no payments are owed or scheduled.
        </p>
      </div>

      {/* Totals Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-zinc-200 border border-zinc-200 rounded-md overflow-hidden">
        <div className="bg-white p-4">
          <p className="text-xs text-zinc-500">Amazon UK Launch PO Revenue</p>
          <p className="font-mono-tabular text-2xl font-semibold text-zinc-900 mt-1">
            £{totals.launch.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4">
          <p className="text-xs text-zinc-500">Amazon UK Replenishment PO Revenue</p>
          <p className="font-mono-tabular text-2xl font-semibold text-zinc-900 mt-1">
            £{totals.replenishment.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4">
          <p className="text-xs text-zinc-500">Calculated Illustrative Royalties</p>
          <p className="font-mono-tabular text-2xl font-semibold text-[#BC1F2F] mt-1">
            £{totals.royalties.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Statements Table */}
      <div className="bg-white border border-zinc-200 rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-medium text-zinc-500">
                <th className="py-3 px-4">Statement Ref</th>
                <th className="py-3 px-3">Reporting Period (Illustrative)</th>
                <th className="py-3 px-3 text-right">Launch POs</th>
                <th className="py-3 px-3 text-right">Replenishment POs</th>
                <th className="py-3 px-3 text-right">Wholesale Rate</th>
                <th className="py-3 px-3 text-right">Illustrative Royalty</th>
                <th className="py-3 px-3">Demo Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs">
              {royaltyStatements.map((st) => (
                <tr key={st.id} className="hover:bg-zinc-50">
                  <td className="py-3.5 px-4 font-mono-tabular font-semibold text-zinc-900">
                    {st.statementRef}
                  </td>
                  <td className="py-3.5 px-3">
                    <p className="font-medium text-zinc-900">{st.period}</p>
                    <p className="font-mono-tabular text-[11px] text-zinc-500">
                      {st.periodStart} → {st.periodEnd}
                    </p>
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono-tabular">
                    £{st.launchWholesaleRevenue.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono-tabular">
                    £{st.replenishmentWholesaleRevenue.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono-tabular text-zinc-600">
                    {st.assumedWholesaleRatePct}%
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono-tabular font-semibold text-[#BC1F2F]">
                    £{st.illustrativeRoyaltyTotal.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3">
                    <button
                      type="button"
                      onClick={() => toggleRoyaltyPaymentStatus(st.id)}
                      title="Click to cycle demonstration status"
                    >
                      <StatusTag status={st.paymentStatus} />
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => openInspector(st.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-zinc-800 border border-zinc-300 hover:bg-zinc-100 rounded transition-colors"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statement Line-Item Inspector Drawer */}
      <Drawer
        open={Boolean(selectedStatement)}
        onClose={() => setSelectedId(null)}
        title={selectedStatement?.statementRef ?? ''}
        subtitle={
          selectedStatement
            ? `${selectedStatement.period} · Illustrative Amazon UK Wholesale Royalty Calculation`
            : undefined
        }
        widthClass="max-w-3xl"
      >
        {selectedStatement && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <StatusTag status={selectedStatement.paymentStatus} />
              <span className="font-mono-tabular text-xs text-zinc-500">
                {selectedStatement.periodStart} to {selectedStatement.periodEnd}
              </span>
            </div>

            {/* Interactive Rate Assumption Controls */}
            <div className="bg-zinc-50 border border-zinc-200 rounded p-4 space-y-3">
              <p className="text-xs font-semibold text-zinc-900">
                Adjust Assumed Amazon UK Wholesale Royalty Rate (Recalculates Statement & Dashboard)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end text-xs">
                <div>
                  <label className="block text-zinc-600 mb-1">
                    Assumed Amazon UK Wholesale Rate (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={editWholesaleRate}
                    onChange={(e) => setEditWholesaleRate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-zinc-300 rounded font-mono-tabular"
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateRoyaltyRates(
                      selectedStatement.id,
                      Math.max(1, Number(editWholesaleRate) || 14)
                    )
                  }
                  className="px-3.5 py-2 font-medium text-white bg-zinc-900 hover:bg-[#BC1F2F] rounded transition-colors"
                >
                  Recalculate GBP Model
                </button>
              </div>
            </div>

            {/* Line-item breakdown */}
            <div className="border border-zinc-200 rounded overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-medium text-zinc-500">
                    <th className="py-2.5 px-3">Product & SP-API PO Stream</th>
                    <th className="py-2.5 px-2 text-right">Units</th>
                    <th className="py-2.5 px-2 text-right">Wholesale</th>
                    <th className="py-2.5 px-2 text-right">Net Base</th>
                    <th className="py-2.5 px-2 text-right">Rate</th>
                    <th className="py-2.5 px-3 text-right">Royalty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {selectedStatement.lineItems.map((li, i) => (
                    <tr key={`${li.sku}-${li.channel}-${i}`}>
                      <td className="py-2.5 px-3">
                        <p className="font-medium text-zinc-900">{li.productName}</p>
                        <p className="text-[11px] text-zinc-500">
                          <span className="font-mono-tabular">{li.sku}</span> · {li.channel}
                        </p>
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono-tabular">
                        {li.units.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono-tabular">
                        £{li.grossRevenue.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono-tabular">
                        £{li.netSalesBase.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono-tabular">
                        {li.illustrativeRatePct}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono-tabular font-semibold text-zinc-900">
                        £{li.calculatedRoyalty.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-zinc-50 border-t border-zinc-200 font-semibold">
                    <td colSpan={5} className="py-3 px-3 text-right text-zinc-700">
                      Total Illustrative Talent Royalty (£ GBP)
                    </td>
                    <td className="py-3 px-3 text-right font-mono-tabular text-[#BC1F2F]">
                      £{selectedStatement.illustrativeRoyaltyTotal.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <p className="text-xs text-zinc-500 leading-relaxed">{selectedStatement.notes}</p>
          </div>
        )}
      </Drawer>
    </div>
  );
};
