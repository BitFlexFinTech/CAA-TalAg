import React, { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { useCommerce } from '../context/CommerceContext';

type ScenarioKey = 'conservative' | 'base' | 'expansion';

const SCENARIO_MULTIPLIERS: Record<
  ScenarioKey,
  { label: string; factor: number; note: string }
> = {
  conservative: {
    label: 'Conservative (0.70×)',
    factor: 0.7,
    note: 'Lower Amazon UK PO reorder velocity (70% of base demonstration model).',
  },
  base: {
    label: 'Base PoC Model (1.00×)',
    factor: 1.0,
    note: 'Baseline illustrative iShowSpeed Amazon UK wholesale figures synchronized with Royalties.',
  },
  expansion: {
    label: 'Peak Q4 UK Scale (1.40×)',
    factor: 1.4,
    note: 'Expanded Amazon UK Vendor Central replenishment volume scenario (140% of base).',
  },
};

export const FinancialsView: React.FC = () => {
  const { royaltyStatements, products, purchaseOrders } = useCommerce();
  const [scenario, setScenario] = useState<ScenarioKey>('base');

  const multiplier = SCENARIO_MULTIPLIERS[scenario].factor;

  const summary = useMemo(() => {
    const baseLaunch = royaltyStatements.reduce((s, r) => s + r.launchWholesaleRevenue, 0);
    const baseReplenishment = royaltyStatements.reduce(
      (s, r) => s + r.replenishmentWholesaleRevenue,
      0
    );
    const baseRoyalty = royaltyStatements.reduce((s, r) => s + r.illustrativeRoyaltyTotal, 0);

    const launchRevenue = Math.round(baseLaunch * multiplier);
    const replenishmentRevenue = Math.round(baseReplenishment * multiplier);
    const grossRevenue = launchRevenue + replenishmentRevenue;
    const estCogs = Math.round(grossRevenue * 0.46);
    const estFreight = Math.round(grossRevenue * 0.06);
    const estRoyalties = Math.round(baseRoyalty * multiplier);
    const netProgrammeContribution = grossRevenue - estCogs - estFreight - estRoyalties;

    return {
      launchRevenue,
      replenishmentRevenue,
      grossRevenue,
      estCogs,
      estFreight,
      estRoyalties,
      netProgrammeContribution,
    };
  }, [royaltyStatements, multiplier]);

  const handleExportCSV = () => {
    const rows = [
      ['Metric (Illustrative Demonstration Data)', 'Scenario', 'Amount (GBP)'],
      [
        'Amazon UK Launch PO Revenue (Illustrative)',
        SCENARIO_MULTIPLIERS[scenario].label,
        summary.launchRevenue,
      ],
      [
        'Amazon UK Replenishment PO Revenue (Illustrative)',
        SCENARIO_MULTIPLIERS[scenario].label,
        summary.replenishmentRevenue,
      ],
      [
        'Total Gross Amazon UK Wholesale Revenue',
        SCENARIO_MULTIPLIERS[scenario].label,
        summary.grossRevenue,
      ],
      ['Estimated UK Production COGS', SCENARIO_MULTIPLIERS[scenario].label, -summary.estCogs],
      [
        'Estimated UK Carton & Amazon FC Freight',
        SCENARIO_MULTIPLIERS[scenario].label,
        -summary.estFreight,
      ],
      [
        'Estimated Talent Royalties (Non-Contractual)',
        SCENARIO_MULTIPLIERS[scenario].label,
        -summary.estRoyalties,
      ],
      [
        'Illustrative Operating Contribution',
        SCENARIO_MULTIPLIERS[scenario].label,
        summary.netProgrammeContribution,
      ],
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ishowspeed-caa-amazon-uk-financials-${scenario}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#BC1F2F] mb-1">
            Illustrative Amazon UK Wholesale P&L (£ GBP) · Not Actual Financial Results
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            iShowSpeed Financial Reports
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            Interactive scenario modeling for the proposed CAA × iShowSpeed Amazon UK Vendor Central wholesale programme.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-zinc-800 bg-white border border-zinc-300 hover:bg-zinc-50 rounded transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export GBP CSV</span>
        </button>
      </div>

      {/* Scenario Switcher */}
      <div className="bg-white border border-zinc-200 rounded-md p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {(Object.keys(SCENARIO_MULTIPLIERS) as ScenarioKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setScenario(key)}
              className={`px-3 py-1.5 text-xs rounded transition-colors ${
                scenario === key
                  ? 'bg-[#BC1F2F] text-white font-medium'
                  : 'bg-zinc-100 text-zinc-700 hover:text-zinc-900'
              }`}
            >
              {SCENARIO_MULTIPLIERS[key].label}
            </button>
          ))}
        </div>
        <p className="text-xs text-zinc-500">{SCENARIO_MULTIPLIERS[scenario].note}</p>
      </div>

      {/* Financial Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-200 border border-zinc-200 rounded-md overflow-hidden">
        <div className="bg-white p-4">
          <p className="text-xs text-zinc-500">Amazon UK Gross Wholesale</p>
          <p className="font-mono-tabular text-2xl font-semibold text-zinc-900 mt-1">
            £{summary.grossRevenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4">
          <p className="text-xs text-zinc-500">Est. UK Production & FC Freight</p>
          <p className="font-mono-tabular text-2xl font-semibold text-zinc-900 mt-1">
            £{(summary.estCogs + summary.estFreight).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4">
          <p className="text-xs text-zinc-500">Illustrative Talent Royalties</p>
          <p className="font-mono-tabular text-2xl font-semibold text-[#BC1F2F] mt-1">
            £{summary.estRoyalties.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4">
          <p className="text-xs text-zinc-500">Illustrative Operating Margin</p>
          <p className="font-mono-tabular text-2xl font-semibold text-emerald-700 mt-1">
            £{summary.netProgrammeContribution.toLocaleString()}
          </p>
        </div>
      </div>

      {/* P&L Breakdown & SKU Economics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white border border-zinc-200 rounded-md overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-200">
            <h2 className="text-sm font-semibold text-zinc-900">
              Illustrative Amazon UK P&L Statement ({SCENARIO_MULTIPLIERS[scenario].label})
            </h2>
          </div>
          <table className="w-full text-xs border-collapse">
            <tbody className="divide-y divide-zinc-100">
              <tr>
                <td className="py-3 px-5 text-zinc-700">
                  Amazon UK Launch PO Revenue (SP-API)
                </td>
                <td className="py-3 px-5 text-right font-mono-tabular text-zinc-900">
                  £{summary.launchRevenue.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-5 text-zinc-700">
                  Amazon UK Replenishment PO Revenue (SP-API)
                </td>
                <td className="py-3 px-5 text-right font-mono-tabular text-zinc-900">
                  £{summary.replenishmentRevenue.toLocaleString()}
                </td>
              </tr>
              <tr className="bg-zinc-50 font-semibold">
                <td className="py-3 px-5 text-zinc-900">Total Amazon UK Wholesale Revenue</td>
                <td className="py-3 px-5 text-right font-mono-tabular text-zinc-900">
                  £{summary.grossRevenue.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-5 text-zinc-600">Less: Estimated UK Production COGS (~46%)</td>
                <td className="py-3 px-5 text-right font-mono-tabular text-zinc-600">
                  (£{summary.estCogs.toLocaleString()})
                </td>
              </tr>
              <tr>
                <td className="py-3 px-5 text-zinc-600">
                  Less: Estimated UK Cartonization & FC Freight (~6%)
                </td>
                <td className="py-3 px-5 text-right font-mono-tabular text-zinc-600">
                  (£{summary.estFreight.toLocaleString()})
                </td>
              </tr>
              <tr>
                <td className="py-3 px-5 text-zinc-600">
                  Less: Illustrative Talent Royalties (Non-Contractual)
                </td>
                <td className="py-3 px-5 text-right font-mono-tabular text-[#BC1F2F]">
                  (£{summary.estRoyalties.toLocaleString()})
                </td>
              </tr>
              <tr className="bg-zinc-50 font-semibold border-t border-zinc-200">
                <td className="py-3.5 px-5 text-zinc-900">
                  Illustrative Programme Operating Contribution
                </td>
                <td className="py-3.5 px-5 text-right font-mono-tabular text-emerald-700">
                  £{summary.netProgrammeContribution.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="lg:col-span-6 bg-white border border-zinc-200 rounded-md overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">
              Amazon UK Wholesale Unit Economics (£ GBP)
            </h2>
            <span className="font-mono-tabular text-[11px] text-zinc-500">
              {purchaseOrders.length} Sample POs
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-medium text-zinc-500">
                  <th className="py-2.5 px-4 text-left">SKU</th>
                  <th className="py-2.5 px-3 text-right">Bulk Cost</th>
                  <th className="py-2.5 px-3 text-right">Amz UK Whsl</th>
                  <th className="py-2.5 px-3 text-right">UK RRP</th>
                  <th className="py-2.5 px-4 text-right">Whsl Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {products.map((p) => {
                  const marginPct =
                    p.proposedWholesale > 0
                      ? Math.round(
                          ((p.proposedWholesale - p.proposedCost) / p.proposedWholesale) * 100
                        )
                      : 0;
                  return (
                    <tr key={p.id}>
                      <td className="py-2.5 px-4">
                        <p className="font-medium text-zinc-900">{p.name}</p>
                        <p className="font-mono-tabular text-[11px] text-zinc-500">{p.sku}</p>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono-tabular">
                        £{p.proposedCost.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono-tabular font-semibold">
                        £{p.proposedWholesale.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono-tabular text-zinc-600">
                        £{p.proposedRetail.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono-tabular text-emerald-700 font-medium">
                        {marginPct}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
