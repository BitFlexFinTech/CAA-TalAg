import React, { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useCommerce } from '../context/CommerceContext';
import { POStage, PurchaseOrder } from '../types/commerce';
import { StatusTag } from '../components/common/StatusTag';
import { Drawer } from '../components/common/Drawer';
import { Modal } from '../components/common/Modal';

const PO_STAGES: POStage[] = [
  'Draft PO',
  'Sample Approved',
  'Bulk Cutting',
  'Sewing & Finishing',
  'QC Inspection',
  'Ex-Factory Ready',
];

export const PurchaseOrdersView: React.FC = () => {
  const { purchaseOrders, products, createPurchaseOrder, advancePOStage } = useCommerce();
  const [selectedPOId, setSelectedPOId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const [productId, setProductId] = useState(products[0]?.id ?? '');
  const [quantity, setQuantity] = useState('1000');
  const [supplier, setSupplier] = useState('UK Apparel Production Hub (Birmingham)');
  const [region, setRegion] = useState('United Kingdom (Bulk Wholesale Tier)');
  const [exFactory, setExFactory] = useState('2027-01-18');
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
    if (!productId && products[0]?.id) {
      setProductId(products[0].id);
    }
  }, [products, productId]);

  const selectedPO: PurchaseOrder | null = useMemo(
    () => purchaseOrders.find((p) => p.id === selectedPOId) ?? null,
    [purchaseOrders, selectedPOId]
  );

  const totalPOCommitment = purchaseOrders.reduce((sum, p) => sum + p.totalValue, 0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const targetProdId = productId || products[0]?.id;
    if (!targetProdId) return;
    createPurchaseOrder({
      productId: targetProdId,
      quantity: Math.max(50, Number(quantity) || 500),
      illustrativeSupplier: supplier,
      supplierRegion: region,
      targetExFactoryDate: exFactory,
      notes,
    });
    setCreateOpen(false);
    setNotes('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#BC1F2F] mb-1">
            Illustrative Manufacturing Planning · No Live Supplier Commitments
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            iShowSpeed Purchase Orders
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            Model proposed production runs, illustrative factory partners, and ex-factory milestones.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          disabled={products.length === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#BC1F2F] hover:bg-[#9E1927] disabled:opacity-45 rounded transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Illustrative PO</span>
        </button>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-zinc-200 border border-zinc-200 rounded-md overflow-hidden">
        <div className="bg-white p-4">
          <p className="text-xs text-zinc-500">Proposed Purchase Orders</p>
          <p className="font-mono-tabular text-2xl font-semibold text-zinc-900 mt-1">
            {purchaseOrders.length}
          </p>
        </div>
        <div className="bg-white p-4">
          <p className="text-xs text-zinc-500">Total Proposed Units</p>
          <p className="font-mono-tabular text-2xl font-semibold text-zinc-900 mt-1">
            {purchaseOrders.reduce((s, p) => s + p.quantity, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4">
          <p className="text-xs text-zinc-500">Illustrative Production Value (£)</p>
          <p className="font-mono-tabular text-2xl font-semibold text-zinc-900 mt-1">
            £{totalPOCommitment.toLocaleString()}
          </p>
        </div>
      </div>

      {/* PO Table */}
      <div className="bg-white border border-zinc-200 rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-medium text-zinc-500">
                <th className="py-3 px-4">PO Reference</th>
                <th className="py-3 px-3">iShowSpeed Product</th>
                <th className="py-3 px-3">Illustrative Supplier</th>
                <th className="py-3 px-3 text-right">Qty</th>
                <th className="py-3 px-3 text-right">Unit Cost</th>
                <th className="py-3 px-3 text-right">PO Value</th>
                <th className="py-3 px-3">Production Stage</th>
                <th className="py-3 px-4">Target Ex-Factory</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs">
              {purchaseOrders.map((po) => (
                <tr
                  key={po.id}
                  onClick={() => setSelectedPOId(po.id)}
                  className="hover:bg-zinc-50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-mono-tabular font-semibold text-zinc-900">
                    {po.poNumber}
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-medium text-zinc-900">{po.productName}</p>
                    <p className="font-mono-tabular text-[11px] text-zinc-500">{po.sku}</p>
                  </td>
                  <td className="py-3 px-3">
                    <p className="text-zinc-800">{po.illustrativeSupplier}</p>
                    <p className="text-[11px] text-zinc-500">{po.supplierRegion}</p>
                  </td>
                  <td className="py-3 px-3 text-right font-mono-tabular">
                    {po.quantity.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono-tabular">
                    £{po.unitCost.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono-tabular font-semibold text-zinc-900">
                    £{po.totalValue.toLocaleString()}
                  </td>
                  <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={po.stage}
                      onChange={(e) => advancePOStage(po.id, e.target.value as POStage)}
                      aria-label={`Production stage for ${po.poNumber}`}
                      className="text-xs border border-zinc-300 rounded px-2 py-1 bg-white"
                    >
                      {PO_STAGES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4 font-mono-tabular text-zinc-600">
                    {po.targetExFactoryDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Drawer
        open={Boolean(selectedPO)}
        onClose={() => setSelectedPOId(null)}
        title={selectedPO?.poNumber ?? ''}
        subtitle={selectedPO ? `${selectedPO.productName} · Illustrative PO Record` : undefined}
      >
        {selectedPO && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <StatusTag status={selectedPO.stage} />
              <select
                value={selectedPO.stage}
                onChange={(e) => advancePOStage(selectedPO.id, e.target.value as POStage)}
                className="text-xs border border-zinc-300 rounded px-2.5 py-1.5 bg-white font-medium"
              >
                {PO_STAGES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-50 border border-zinc-200 rounded text-xs">
              <div>
                <p className="text-zinc-500">Quantity</p>
                <p className="font-mono-tabular text-base font-semibold text-zinc-900">
                  {selectedPO.quantity.toLocaleString()} units
                </p>
              </div>
              <div>
                <p className="text-zinc-500">Total Value (Illustrative)</p>
                <p className="font-mono-tabular text-base font-semibold text-zinc-900">
                  £{selectedPO.totalValue.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-zinc-500">Sample Supplier</p>
                <p className="font-medium text-zinc-900">{selectedPO.illustrativeSupplier}</p>
              </div>
              <div>
                <p className="text-zinc-500">Target Ex-Factory</p>
                <p className="font-mono-tabular font-medium text-zinc-900">
                  {selectedPO.targetExFactoryDate}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-zinc-900 mb-3">
                Production Milestone Progress
              </h3>
              <ol className="space-y-2.5">
                {PO_STAGES.map((st, idx) => {
                  const currentIdx = PO_STAGES.indexOf(selectedPO.stage);
                  const reached = idx <= currentIdx;
                  return (
                    <li
                      key={st}
                      className={`flex items-center justify-between p-2.5 rounded border text-xs ${
                        reached
                          ? 'bg-zinc-900 text-white border-zinc-900'
                          : 'bg-white text-zinc-500 border-zinc-200'
                      }`}
                    >
                      <span>
                        0{idx + 1}. {st}
                      </span>
                      <span className="font-mono-tabular text-[11px]">
                        {reached ? 'Completed / Active' : 'Pending'}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>

            <p className="text-xs text-zinc-500 border-t border-zinc-200 pt-3">
              {selectedPO.notes}
            </p>
          </div>
        )}
      </Drawer>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Illustrative Purchase Order"
        subtitle="Demonstration production planning record — no live supplier obligation"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-zinc-700 mb-1">iShowSpeed Product</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 rounded bg-white"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku} — {p.name} (£{p.proposedCost.toFixed(2)} est. cost)
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Proposed Quantity</label>
              <input
                type="number"
                min="50"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded font-mono-tabular"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Target Ex-Factory</label>
              <input
                type="date"
                value={exFactory}
                onChange={(e) => setExFactory(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded font-mono-tabular"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Sample Supplier Label
              </label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Region (Illustrative)</label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded"
              />
            </div>
          </div>
          <div>
            <label className="block font-medium text-zinc-700 mb-1">Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Packaging, hangtag, or QC instructions..."
              className="w-full px-3 py-2 border border-zinc-300 rounded"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="px-3.5 py-2 font-medium text-zinc-700 border border-zinc-300 rounded hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-medium text-white bg-[#BC1F2F] hover:bg-[#9E1927] rounded"
            >
              Create Illustrative PO
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
