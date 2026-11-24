import React, { useMemo, useState } from 'react';
import { Check, MessageSquare, RotateCcw, X } from 'lucide-react';
import { useCommerce } from '../context/CommerceContext';
import { ApprovalItem, ApprovalType } from '../types/commerce';
import { StatusTag } from '../components/common/StatusTag';
import { MediaFrame } from '../components/common/MediaFrame';

const APPROVAL_TYPES: ('All' | ApprovalType)[] = [
  'All',
  'Product Concept',
  'Product Design',
  'Campaign Creative',
  'Brand Storefront',
  'Marketing Material',
  'Commercial Proposal',
];

const STATUS_FILTERS: ('All' | ApprovalItem['status'])[] = [
  'All',
  'Pending Review',
  'Changes Requested',
  'Approved',
  'Rejected',
];

export const ApprovalsView: React.FC = () => {
  const { approvals, decideApproval, addApprovalComment, settings } = useCommerce();

  const [typeFilter, setTypeFilter] = useState<'All' | ApprovalType>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | ApprovalItem['status']>('All');
  const [selectedId, setSelectedId] = useState<string>(approvals[0]?.id ?? '');
  const [decisionNote, setDecisionNote] = useState('');
  const [commentDraft, setCommentDraft] = useState('');

  const filtered = useMemo(() => {
    return approvals.filter((a) => {
      const matchType = typeFilter === 'All' || a.type === typeFilter;
      const matchStatus = statusFilter === 'All' || a.status === statusFilter;
      return matchType && matchStatus;
    });
  }, [approvals, typeFilter, statusFilter]);

  const activeApproval = useMemo(
    () =>
      approvals.find((a) => a.id === selectedId) ??
      filtered[0] ??
      approvals[0] ??
      null,
    [approvals, filtered, selectedId]
  );

  const handleDecision = (decision: 'Approved' | 'Rejected' | 'Changes Requested') => {
    if (!activeApproval) return;
    decideApproval(activeApproval.id, decision, decisionNote);
    setDecisionNote('');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApproval || !commentDraft.trim()) return;
    addApprovalComment(activeApproval.id, commentDraft);
    setCommentDraft('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#BC1F2F] mb-1">
            CAA & Talent Sign-Off Workflow · Synchronized Across Records
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            CAA × Mercenta Approval Centre
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            Review product concepts, designs, Amazon UK Brand Storefronts, campaign creative, and commercial proposals.
          </p>
        </div>
        <div className="text-xs text-zinc-600 bg-white border border-zinc-200 rounded px-3 py-2">
          Acting Reviewer: <strong className="text-zinc-900">{settings.activeReviewerName}</strong>{' '}
          <span className="text-zinc-400">({settings.activeReviewerRole})</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-zinc-200 rounded-md p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {APPROVAL_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                typeFilter === t
                  ? 'bg-zinc-900 text-white font-medium'
                  : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'All' | ApprovalItem['status'])}
          aria-label="Filter approvals by status"
          className="px-3 py-1.5 text-xs border border-zinc-300 rounded bg-white text-zinc-700"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s === 'All' ? 'All Statuses' : s}
            </option>
          ))}
        </select>
      </div>

      {/* Split Master-Detail Approval Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Queue List */}
        <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-md divide-y divide-zinc-100 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              No approval records match your active filters.
            </div>
          ) : (
            filtered.map((item) => {
              const isSelected = activeApproval?.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full text-left p-4 transition-colors ${
                    isSelected ? 'bg-zinc-50 ring-1 ring-inset ring-zinc-900/15' : 'hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono-tabular text-[11px] text-zinc-500">
                      {item.reference} · {item.type}
                    </span>
                    <StatusTag status={item.status} />
                  </div>
                  <p className="text-xs font-semibold text-zinc-900 line-clamp-1">{item.title}</p>
                  <div className="flex items-center justify-between gap-2 mt-1.5 text-[11px] text-zinc-500">
                    <span className="truncate">{item.linkedName}</span>
                    <span className="font-mono-tabular shrink-0">{item.submissionDate}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Active Inspection & Decision Panel */}
        <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-md p-6 space-y-6">
          {activeApproval ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 pb-4">
                <div>
                  <p className="font-mono-tabular text-xs text-zinc-500">
                    {activeApproval.reference} · {activeApproval.type} · Submitted{' '}
                    {activeApproval.submissionDate}
                  </p>
                  <h2 className="text-lg font-bold text-zinc-900 mt-1">{activeApproval.title}</h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    Associated Record:{' '}
                    <strong className="text-zinc-800">{activeApproval.linkedName}</strong> · By{' '}
                    {activeApproval.submittedBy}
                  </p>
                </div>
                <StatusTag status={activeApproval.status} />
              </div>

              {activeApproval.previewImage && (
                <div className="max-w-md">
                  <MediaFrame
                    src={activeApproval.previewImage}
                    alt={activeApproval.linkedName}
                    aspectClass="aspect-[4/3]"
                    imgClassName="object-cover object-top"
                    className="rounded"
                  />
                </div>
              )}

              <div>
                <h3 className="text-xs font-medium text-zinc-500 mb-1">Review Brief</h3>
                <p className="text-sm text-zinc-800 leading-relaxed">
                  {activeApproval.description}
                </p>
              </div>

              {/* Decision Controls */}
              <div className="bg-zinc-50 border border-zinc-200 rounded p-4 space-y-3">
                <label className="block text-xs font-medium text-zinc-700">
                  Decision Note (Optional — attached to audit history & comments)
                </label>
                <input
                  type="text"
                  value={decisionNote}
                  onChange={(e) => setDecisionNote(e.target.value)}
                  placeholder="Enter note for product/campaign team..."
                  className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded focus:outline-none focus:border-zinc-900"
                />
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleDecision('Approved')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecision('Changes Requested')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Request Changes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecision('Rejected')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#BC1F2F] hover:bg-[#9E1927] rounded transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>

              {/* Comments Thread */}
              <div className="space-y-3 border-t border-zinc-200 pt-5">
                <h3 className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Comments ({activeApproval.comments.length})</span>
                </h3>

                {activeApproval.comments.length === 0 ? (
                  <p className="text-xs text-zinc-500">No comments recorded yet.</p>
                ) : (
                  <ul className="space-y-2.5">
                    {activeApproval.comments.map((c) => (
                      <li
                        key={c.id}
                        className="p-3 bg-zinc-50 border border-zinc-200 rounded text-xs"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-semibold text-zinc-900">
                            {c.author}{' '}
                            <span className="font-normal text-zinc-500">· {c.role}</span>
                          </span>
                          <span className="font-mono-tabular text-[11px] text-zinc-400">
                            {c.timestamp}
                          </span>
                        </div>
                        <p className="text-zinc-700 leading-relaxed">{c.text}</p>
                      </li>
                    ))}
                  </ul>
                )}

                <form onSubmit={handleAddComment} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={commentDraft}
                    onChange={(e) => setCommentDraft(e.target.value)}
                    placeholder="Add a comment to this approval thread..."
                    className="flex-1 px-3 py-2 text-xs border border-zinc-300 rounded focus:outline-none focus:border-zinc-900"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 text-xs font-medium text-white bg-zinc-900 hover:bg-[#BC1F2F] rounded transition-colors whitespace-nowrap"
                  >
                    Add Comment
                  </button>
                </form>
              </div>

              {/* Audit History */}
              <div className="space-y-2 border-t border-zinc-200 pt-5">
                <h3 className="text-xs font-semibold text-zinc-900">Audit History</h3>
                <ul className="space-y-2 text-xs">
                  {activeApproval.history.map((h) => (
                    <li key={h.id} className="flex items-start justify-between gap-4">
                      <div>
                        <span className="font-medium text-zinc-900">{h.action}</span>
                        <span className="text-zinc-500"> · {h.actor}</span>
                        {h.note && <p className="text-zinc-600 mt-0.5">“{h.note}”</p>}
                      </div>
                      <span className="font-mono-tabular text-[11px] text-zinc-400 shrink-0">
                        {h.timestamp}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <p className="text-sm text-zinc-500">Select an approval record to inspect.</p>
          )}
        </div>
      </div>
    </div>
  );
};
