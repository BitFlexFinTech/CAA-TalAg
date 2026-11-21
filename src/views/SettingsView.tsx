import React, { useState } from 'react';
import { RotateCcw, ShieldCheck } from 'lucide-react';
import { useCommerce } from '../context/CommerceContext';
import { DemoSettings } from '../types/commerce';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetDemoState } = useCommerce();
  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <p className="text-xs font-medium text-[#BC1F2F] mb-1">
          Demonstration Environment Configuration
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Workspace Settings</h1>
        <p className="text-sm text-zinc-600 mt-1">
          Configure the simulated reviewer persona, illustrative disclosure banner, or reset demonstration data.
        </p>
      </div>

      {/* Reviewer Persona */}
      <form onSubmit={handleSave} className="bg-white border border-zinc-200 rounded-md p-6 space-y-5">
        <h2 className="text-base font-semibold text-zinc-900">
          Simulated Reviewer Identity (Used on Approvals & Comments)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-medium text-zinc-700 mb-1">Reviewer Display Name</label>
            <input
              type="text"
              value={settings.activeReviewerName}
              onChange={(e) => updateSettings({ activeReviewerName: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:border-zinc-900"
            />
          </div>
          <div>
            <label className="block font-medium text-zinc-700 mb-1">Workspace Role</label>
            <select
              value={settings.activeReviewerRole}
              onChange={(e) =>
                updateSettings({
                  activeReviewerRole: e.target.value as DemoSettings['activeReviewerRole'],
                })
              }
              className="w-full px-3 py-2 border border-zinc-300 rounded bg-white"
            >
              <option value="CAA Talent Agent">CAA Talent Agent</option>
              <option value="Mercenta Operations Lead">Mercenta Operations Lead</option>
              <option value="Talent Brand Representative">Talent Brand Representative</option>
            </select>
          </div>
        </div>

        <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-zinc-900">
              Show Proof-of-Concept Disclosure Banner
            </p>
            <p className="text-xs text-zinc-500">
              Displays the non-contractual demonstration notice across workspace views.
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.showWatermarkNotice}
            onChange={(e) => updateSettings({ showWatermarkNotice: e.target.checked })}
            className="w-4 h-4 accent-[#BC1F2F]"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
          <span className="text-xs text-emerald-700 font-medium">
            {savedFeedback ? 'Workspace preferences applied.' : ''}
          </span>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-medium text-white bg-zinc-900 hover:bg-[#BC1F2F] rounded transition-colors"
          >
            Apply Settings
          </button>
        </div>
      </form>

      {/* Governance & Honesty Notice */}
      <section className="bg-white border border-zinc-200 rounded-md p-6 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#BC1F2F]" />
          <h2 className="text-base font-semibold text-zinc-900">
            Proof of Concept Boundaries & Attribution
          </h2>
        </div>
        <p className="text-xs text-zinc-600 leading-relaxed">
          This interactive front-end prototype demonstrates how Mercenta Partners could operate a dedicated talent commerce workspace for CAA, centered exclusively on iShowSpeed (Darren Watkins Jr.). It does not imply an existing CAA–Mercenta partnership, an existing iShowSpeed merchandise agreement, approved products, live suppliers, or contractual financial terms.
        </p>
      </section>

      {/* Reset State */}
      <section className="bg-zinc-50 border border-zinc-200 rounded-md p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">Reset Demonstration Dataset</h2>
          <p className="text-xs text-zinc-600 mt-0.5">
            Restore all iShowSpeed products, campaigns, approvals, orders, and royalty assumptions to their initial state.
          </p>
        </div>
        <button
          type="button"
          onClick={resetDemoState}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#BC1F2F] bg-white border border-[#BC1F2F]/40 hover:bg-[#BC1F2F] hover:text-white rounded transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Demo Data</span>
        </button>
      </section>
    </div>
  );
};
