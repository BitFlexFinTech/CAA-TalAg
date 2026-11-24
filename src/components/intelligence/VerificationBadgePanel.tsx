import React, { useState } from 'react';
import { Check, ExternalLink, FileCheck2, PlusCircle } from 'lucide-react';
import {
  ConfidenceLevel,
  SourceVerificationStamp,
  VerificationTier,
} from '../../types/commerce';
import { StatusTag } from '../common/StatusTag';

interface VerificationBadgePanelProps {
  stamp: SourceVerificationStamp;
  targetType: 'brand' | 'product' | 'uk-assessment' | 'talent';
  targetId: string;
  onAddEvidence?: (input: {
    targetType: 'brand' | 'product' | 'uk-assessment' | 'talent';
    targetId: string;
    sourceName: string;
    sourceUrl: string;
    evidenceSummary: string;
    verificationTier: VerificationTier;
    confidence: ConfidenceLevel;
    notes?: string;
  }) => void;
}

const VERIFICATION_TIERS: VerificationTier[] = [
  'Verified Fact',
  'Publicly Reported',
  'Inference',
  'Unverified',
  'Demonstration Data',
];

export const VerificationBadgePanel: React.FC<VerificationBadgePanelProps> = ({
  stamp,
  targetType,
  targetId,
  onAddEvidence,
}) => {
  const [editing, setEditing] = useState(false);
  const [sourceName, setSourceName] = useState(stamp.sourceName);
  const [sourceUrl, setSourceUrl] = useState(stamp.sourceUrl);
  const [evidenceSummary, setEvidenceSummary] = useState(stamp.evidenceSummary);
  const [tier, setTier] = useState<VerificationTier>(stamp.verificationTier);
  const [confidence, setConfidence] = useState<ConfidenceLevel>(stamp.confidence);
  const [savedFlag, setSavedFlag] = useState(false);

  const tierTone =
    stamp.verificationTier === 'Verified Fact'
      ? 'success'
      : stamp.verificationTier === 'Publicly Reported'
      ? 'neutral'
      : stamp.verificationTier === 'Inference' || stamp.verificationTier === 'Demonstration Data'
      ? 'warning'
      : 'danger';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddEvidence || !sourceName.trim() || !evidenceSummary.trim()) return;
    onAddEvidence({
      targetType,
      targetId,
      sourceName,
      sourceUrl,
      evidenceSummary,
      verificationTier: tier,
      confidence,
    });
    setEditing(false);
    setSavedFlag(true);
    setTimeout(() => setSavedFlag(false), 1800);
  };

  return (
    <div className="bg-zinc-50 border border-zinc-200 rounded-md p-4 space-y-3 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-zinc-600 shrink-0" />
          <span className="font-semibold text-zinc-900">Source & Verification Audit</span>
          <StatusTag status={stamp.verificationTier} tone={tierTone} />
          <span className="font-mono-tabular text-[11px] text-zinc-500">
            Confidence: {stamp.confidence}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {savedFlag && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
              <Check className="w-3 h-3" />
              <span>Evidence Saved & Score Updated</span>
            </span>
          )}
          {onAddEvidence && (
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-zinc-800 bg-white border border-zinc-300 hover:bg-zinc-100 rounded transition-colors"
            >
              <PlusCircle className="w-3 h-3 text-[#BC1F2F]" />
              <span>{editing ? 'Cancel' : 'Update Verification Evidence'}</span>
            </button>
          )}
        </div>
      </div>

      {!editing ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <p className="text-[11px] text-zinc-500">Primary Source & Reference</p>
            <p className="font-medium text-zinc-900 mt-0.5">{stamp.sourceName}</p>
            {stamp.sourceUrl && (
              <a
                href={stamp.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-[#BC1F2F] hover:underline mt-0.5 break-all"
              >
                <span>{stamp.sourceUrl.replace(/^https?:\/\//, '')}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            )}
          </div>
          <div>
            <p className="text-[11px] text-zinc-500">Evidence Summary · Checked {stamp.dateChecked}</p>
            <p className="text-zinc-700 mt-0.5 leading-relaxed">{stamp.evidenceSummary}</p>
          </div>
          <div>
            <p className="text-[11px] text-zinc-500">Unknown / Unverified Fields</p>
            {stamp.unknownFields.length === 0 ? (
              <p className="text-emerald-700 font-medium mt-0.5">No open field gaps noted.</p>
            ) : (
              <ul className="mt-0.5 text-[11px] text-zinc-600 space-y-0.5">
                {stamp.unknownFields.map((u, idx) => (
                  <li key={idx}>• {u}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-3 pt-2 border-t border-zinc-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                Source Name
              </label>
              <input
                type="text"
                required
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                Reference URL
              </label>
              <input
                type="text"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                Verification Tier
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as VerificationTier)}
                className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white"
              >
                {VERIFICATION_TIERS.map((vt) => (
                  <option key={vt} value={vt}>
                    {vt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                Confidence Level
              </label>
              <select
                value={confidence}
                onChange={(e) => setConfidence(e.target.value as ConfidenceLevel)}
                className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-zinc-700 mb-1">
              Verified Evidence Description
            </label>
            <textarea
              rows={2}
              required
              value={evidenceSummary}
              onChange={(e) => setEvidenceSummary(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-3 py-1.5 border border-zinc-300 bg-white rounded text-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-[#BC1F2F] hover:bg-[#9E1927] text-white font-medium rounded"
            >
              Save Evidence & Recalculate
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
