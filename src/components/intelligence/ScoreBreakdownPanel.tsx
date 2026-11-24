import React from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, HelpCircle } from 'lucide-react';
import { ScoreBreakdown } from '../../types/commerce';
import { StatusTag } from '../common/StatusTag';

interface ScoreBreakdownPanelProps {
  title: string;
  subtitle?: string;
  breakdown: ScoreBreakdown;
}

export const ScoreBreakdownPanel: React.FC<ScoreBreakdownPanelProps> = ({
  title,
  subtitle,
  breakdown,
}) => {
  const tierTone =
    breakdown.priorityTier === 'High Priority'
      ? 'success'
      : breakdown.priorityTier === 'Medium Priority'
      ? 'accent'
      : breakdown.priorityTier === 'Watchlist'
      ? 'warning'
      : 'danger';

  return (
    <div className="bg-white border border-zinc-200 rounded-md p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-100 pb-3">
        <div>
          <p className="text-[11px] font-medium text-[#BC1F2F]">
            Deterministic Opportunity Scoring Breakdown
          </p>
          <h3 className="text-sm font-bold text-zinc-900 mt-0.5">{title}</h3>
          {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          <StatusTag status={breakdown.priorityTier} tone={tierTone} />
          <div className="text-right">
            <span className="font-mono-tabular text-2xl font-bold text-zinc-900">
              {breakdown.total}
            </span>
            <span className="font-mono-tabular text-xs text-zinc-400">/100</span>
          </div>
        </div>
      </div>

      {/* Factor Bars */}
      <div className="space-y-3">
        {breakdown.factors.map((f) => {
          const pct = f.maxScore > 0 ? Math.round((f.score / f.maxScore) * 100) : 0;
          return (
            <div key={f.key} className="space-y-1">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-medium text-zinc-800">{f.label}</span>
                <span className="font-mono-tabular font-semibold text-zinc-900 shrink-0">
                  {f.score}/{f.maxScore}
                </span>
              </div>
              <div className="h-1.5 w-full bg-zinc-100 rounded-xs overflow-hidden">
                <div
                  style={{ width: `${pct}%` }}
                  className={`h-full transition-all duration-300 ${
                    pct >= 75
                      ? 'bg-emerald-600'
                      : pct >= 50
                      ? 'bg-zinc-900'
                      : pct >= 30
                      ? 'bg-amber-600'
                      : 'bg-[#BC1F2F]'
                  }`}
                />
              </div>
              <p className="text-[11px] text-zinc-500">{f.rationale}</p>
            </div>
          );
        })}
      </div>

      {/* Supporting Evidence, Missing Info, Risks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-zinc-100 text-xs">
        <div className="bg-zinc-50 border border-zinc-200 rounded p-3 space-y-1.5">
          <p className="font-semibold text-zinc-900 flex items-center gap-1.5 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>Supporting Evidence</span>
          </p>
          <ul className="space-y-1 text-[11px] text-zinc-600">
            {breakdown.supportingEvidence.map((item, i) => (
              <li key={i} className="leading-snug">
                • {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-zinc-50 border border-zinc-200 rounded p-3 space-y-1.5">
          <p className="font-semibold text-zinc-900 flex items-center gap-1.5 text-[11px]">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Missing Information</span>
          </p>
          {breakdown.missingInformation.length === 0 ? (
            <p className="text-[11px] text-emerald-700">Core checklist data complete.</p>
          ) : (
            <ul className="space-y-1 text-[11px] text-zinc-600">
              {breakdown.missingInformation.map((item, i) => (
                <li key={i} className="leading-snug">
                  • {item}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-zinc-50 border border-zinc-200 rounded p-3 space-y-1.5">
          <p className="font-semibold text-zinc-900 flex items-center gap-1.5 text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5 text-[#BC1F2F] shrink-0" />
            <span>Key Risks</span>
          </p>
          <ul className="space-y-1 text-[11px] text-zinc-600">
            {breakdown.keyRisks.map((item, i) => (
              <li key={i} className="leading-snug">
                • {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommended Next Action */}
      <div className="bg-zinc-900 text-white rounded px-4 py-3 flex items-center justify-between gap-3 text-xs">
        <div className="min-w-0">
          <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">
            Recommended Next Action
          </span>
          <span className="font-medium text-zinc-100">{breakdown.recommendedNextAction}</span>
        </div>
        <ArrowRight className="w-4 h-4 text-[#BC1F2F] shrink-0" />
      </div>
    </div>
  );
};
