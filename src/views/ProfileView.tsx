import React, { useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  CheckCircle2,
  Link2,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Upload,
} from 'lucide-react';
import { useCommerce } from '../context/CommerceContext';
import {
  CaaRepresentationStatus,
  TalentVertical,
} from '../types/commerce';
import { TalentAvatar } from '../components/common/TalentAvatar';
import { BrandVisual, ProductVisual } from '../components/common/BrandVisual';
import { StatusTag } from '../components/common/StatusTag';
import { Modal } from '../components/common/Modal';
import { ScoreBreakdownPanel } from '../components/intelligence/ScoreBreakdownPanel';
import { VerificationBadgePanel } from '../components/intelligence/VerificationBadgePanel';

const VERTICALS: ('All' | TalentVertical)[] = [
  'All',
  'Film & TV',
  'Sports',
  'Digital Creators',
  'Music',
  'Podcasts & Media',
];

const CAA_STATUS_FILTERS: ('All' | CaaRepresentationStatus)[] = [
  'All',
  'Verified Publicly',
  'Reported / Unconfirmed',
  'Requires Verification',
  'Historical / Unclear',
  'Unknown',
];

interface ProfileViewProps {
  openAddTalentSignal?: number;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ openAddTalentSignal }) => {
  const {
    talents,
    brands,
    relationships,
    discoveredProducts,
    ukAssessments,
    talentScoresById,
    brandScoresById,
    selectedTalentId,
    setSelectedTalentId,
    setSelectedBrandId,
    setActiveSection,
    addTalentAndDiscover,
    runPortfolioDiscovery,
    updateTalentPortrait,
    refreshTalentPortraitFromWiki,
    addResearchEvidence,
  } = useCommerce();

  const portraitFileRef = useRef<HTMLInputElement | null>(null);
  const newTalentFileRef = useRef<HTMLInputElement | null>(null);

  const [verticalFilter, setVerticalFilter] = useState<'All' | TalentVertical>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | CaaRepresentationStatus>('All');
  const [search, setSearch] = useState('');
  const [discoveryBanner, setDiscoveryBanner] = useState<string | null>(null);

  // Portrait Editor State
  const [showUrlEditor, setShowUrlEditor] = useState(false);
  const [portraitUrlDraft, setPortraitUrlDraft] = useState('');
  const [wikiLookupBusy, setWikiLookupBusy] = useState(false);

  // Add Talent Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newVertical, setNewVertical] = useState<TalentVertical>('Film & TV');
  const [newRole, setNewRole] = useState('');
  const [newMarket, setNewMarket] = useState('United States / United Kingdom');
  const [newCaaStatus, setNewCaaStatus] = useState<CaaRepresentationStatus>('Reported / Unconfirmed');
  const [newSummary, setNewSummary] = useState('');
  const [newPortraitUrl, setNewPortraitUrl] = useState('');
  const [runAuto, setRunAuto] = useState(true);

  React.useEffect(() => {
    if (openAddTalentSignal && openAddTalentSignal > 0) {
      setAddModalOpen(true);
    }
  }, [openAddTalentSignal]);

  const filteredTalents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return talents.filter((t) => {
      const matchVertical = verticalFilter === 'All' || t.vertical === verticalFilter;
      const matchStatus = statusFilter === 'All' || t.caaStatus === statusFilter;
      const matchQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.roleSummary.toLowerCase().includes(q) ||
        t.portfolioSummary.toLowerCase().includes(q);
      return matchVertical && matchStatus && matchQuery;
    });
  }, [talents, verticalFilter, statusFilter, search]);

  const activeTalent = useMemo(
    () =>
      talents.find((t) => t.id === selectedTalentId) ??
      filteredTalents[0] ??
      talents[0],
    [talents, filteredTalents, selectedTalentId]
  );

  const activeRelationships = useMemo(() => {
    if (!activeTalent) return [];
    return relationships.filter((r) => r.talentId === activeTalent.id);
  }, [relationships, activeTalent]);

  const activeTalentScore = activeTalent ? talentScoresById[activeTalent.id] : undefined;

  const handleRunDiscovery = (talentId: string) => {
    const msg = runPortfolioDiscovery(talentId);
    setDiscoveryBanner(msg);
  };

  const handlePortraitFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeTalent) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateTalentPortrait(
          activeTalent.id,
          reader.result,
          `Uploaded Portrait (${file.name})`
        );
        setDiscoveryBanner(`Updated portrait photograph for ${activeTalent.name}.`);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSavePortraitUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTalent || !portraitUrlDraft.trim()) return;
    updateTalentPortrait(
      activeTalent.id,
      portraitUrlDraft.trim(),
      'Verified External Portrait URL'
    );
    setShowUrlEditor(false);
    setPortraitUrlDraft('');
    setDiscoveryBanner(`Saved verified portrait URL for ${activeTalent.name}.`);
  };

  const handleRefreshWikiPortrait = async () => {
    if (!activeTalent) return;
    setWikiLookupBusy(true);
    try {
      const ok = await refreshTalentPortraitFromWiki(activeTalent.id);
      setDiscoveryBanner(
        ok
          ? `Fetched verified public Wikipedia portrait for ${activeTalent.name}.`
          : `No verified Wikipedia portrait found for ${activeTalent.name}. Use Upload Photo or Photo URL instead.`
      );
    } finally {
      setWikiLookupBusy(false);
    }
  };

  const handleNewTalentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewPortraitUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCreateTalent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const created = addTalentAndDiscover({
      name: newName,
      vertical: newVertical,
      roleSummary: newRole,
      primaryMarket: newMarket,
      caaStatus: newCaaStatus,
      portfolioSummary: newSummary,
      portraitUrl: newPortraitUrl.trim() || undefined,
      portraitCredit: newPortraitUrl.trim() ? 'Uploaded / Verified Reference' : undefined,
      runDiscoveryImmediately: runAuto,
    });
    setAddModalOpen(false);
    setNewName('');
    setNewRole('');
    setNewSummary('');
    setNewPortraitUrl('');
    setDiscoveryBanner(
      runAuto
        ? `Created talent profile for ${created.name} and completed automated commercial portfolio discovery.`
        : `Created talent profile for ${created.name}.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#BC1F2F] mb-1">
            CAA Multi-Vertical Ecosystem · Automated Commercial Portfolio Discovery
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Talent Directory & Commercial Discovery ({talents.length} Profiles)
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            Explore Film & TV, Sports, Digital Creators, Music, and Podcasts & Media. Representation status and commercial ownership are strictly separated and verified.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#BC1F2F] hover:bg-[#9E1927] rounded transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Talent & Auto-Discover</span>
        </button>
      </div>

      {discoveryBanner && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-md px-4 py-3 flex items-center justify-between gap-3 text-xs text-emerald-900">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{discoveryBanner}</span>
          </span>
          <button
            type="button"
            onClick={() => setDiscoveryBanner(null)}
            className="text-emerald-700 hover:text-emerald-950 font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Multi-Facet Filter Bar */}
      <div className="bg-white border border-zinc-200 rounded-md p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search any of the 86+ talents, brands, or commercial notes (e.g. KSI, MrBeast, Zendaya, Joely Shop)..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-300 rounded focus:outline-none focus:border-zinc-900"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as 'All' | CaaRepresentationStatus)
            }
            aria-label="Filter by CAA representation verification"
            className="px-3 py-2 text-xs border border-zinc-300 rounded bg-white text-zinc-700"
          >
            {CAA_STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All CAA Verification Statuses' : s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {VERTICALS.map((v) => {
            const count =
              v === 'All'
                ? talents.length
                : talents.filter((t) => t.vertical === v).length;
            return (
              <button
                key={v}
                type="button"
                onClick={() => setVerticalFilter(v)}
                className={`px-3 py-1.5 text-xs rounded transition-colors ${
                  verticalFilter === v
                    ? 'bg-zinc-900 text-white font-medium'
                    : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {v} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Master-Detail Workspace: Left Roster List + Right Commercial Portfolio Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Roster List */}
        <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-md overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-900">
              Showing {filteredTalents.length} Talent Profile(s)
            </span>
            <span className="font-mono-tabular text-[11px] text-zinc-500">
              Click profile to inspect
            </span>
          </div>

          {filteredTalents.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              No talent profiles match your search criteria. Clear filters or add a new talent.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 max-h-[760px] overflow-y-auto">
              {filteredTalents.map((t) => {
                const isSelected = activeTalent?.id === t.id;
                const score = talentScoresById[t.id]?.total ?? 0;
                const brandCount = relationships.filter((r) => r.talentId === t.id).length;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTalentId(t.id)}
                    className={`w-full text-left p-3.5 transition-colors flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-zinc-50 ring-1 ring-inset ring-[#BC1F2F]/40'
                        : 'hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <TalentAvatar talent={t} size="sm" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-zinc-900 truncate">
                            {t.name}
                          </p>
                          {t.identityCheckRequired && (
                            <AlertTriangle
                              className="w-3.5 h-3.5 text-amber-600 shrink-0"
                              aria-label="Identity verification required"
                            />
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 truncate">
                          {t.vertical} · {brandCount} linked brand(s)
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 space-y-1">
                      <span className="font-mono-tabular text-xs font-bold text-zinc-900 block">
                        {score}/100
                      </span>
                      <span
                        className={`text-[10px] font-medium block ${
                          t.caaStatus === 'Verified Publicly'
                            ? 'text-emerald-700'
                            : t.caaStatus === 'Requires Verification'
                            ? 'text-amber-700'
                            : 'text-zinc-500'
                        }`}
                      >
                        {t.caaStatus}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Commercial Portfolio Inspector */}
        <div className="lg:col-span-7 space-y-6">
          {activeTalent ? (
            <>
              {/* Talent Header & Discovery Trigger */}
              <section className="bg-white border border-zinc-200 rounded-md p-6 space-y-5">
                <input
                  ref={portraitFileRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePortraitFileChange}
                  className="hidden"
                />
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="relative group shrink-0">
                      <TalentAvatar talent={activeTalent} size="xl" />
                      <button
                        type="button"
                        onClick={() => portraitFileRef.current?.click()}
                        title="Upload talent portrait"
                        className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-zinc-900 hover:bg-[#BC1F2F] text-white border-2 border-white flex items-center justify-center shadow-xs transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-[#BC1F2F]">
                          {activeTalent.vertical}
                        </span>
                        <span aria-hidden="true" className="text-zinc-300">
                          ·
                        </span>
                        <StatusTag status={activeTalent.caaStatus} />
                      </div>
                      <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
                        {activeTalent.name}
                      </h2>
                      <p className="text-xs text-zinc-600">
                        {activeTalent.roleSummary} · Focus Market: {activeTalent.primaryMarket}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px]">
                        <button
                          type="button"
                          onClick={() => portraitFileRef.current?.click()}
                          className="inline-flex items-center gap-1 px-2 py-1 text-zinc-700 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded transition-colors"
                        >
                          <Upload className="w-3 h-3" />
                          <span>Upload Photo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPortraitUrlDraft(activeTalent.portraitUrl ?? '');
                            setShowUrlEditor((prev) => !prev);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 text-zinc-700 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded transition-colors"
                        >
                          <Link2 className="w-3 h-3" />
                          <span>Set Photo URL</span>
                        </button>
                        {!activeTalent.identityCheckRequired && (
                          <button
                            type="button"
                            disabled={wikiLookupBusy}
                            onClick={handleRefreshWikiPortrait}
                            className="inline-flex items-center gap-1 px-2 py-1 text-zinc-700 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded transition-colors disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3 h-3 ${wikiLookupBusy ? 'animate-spin' : ''}`} />
                            <span>{wikiLookupBusy ? 'Searching...' : 'Verify Public Photo'}</span>
                          </button>
                        )}
                      </div>
                      {activeTalent.portraitCredit && (
                        <p className="text-[10px] text-zinc-400 truncate max-w-md">
                          Photo: {activeTalent.portraitCredit}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRunDiscovery(activeTalent.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-zinc-900 hover:bg-[#BC1F2F] rounded transition-colors whitespace-nowrap shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Run Commercial Portfolio Discovery</span>
                  </button>
                </div>

                {showUrlEditor && (
                  <form
                    onSubmit={handleSavePortraitUrl}
                    className="flex flex-wrap items-center gap-2 p-3 bg-zinc-50 border border-zinc-200 rounded text-xs"
                  >
                    <input
                      type="url"
                      required
                      value={portraitUrlDraft}
                      onChange={(e) => setPortraitUrlDraft(e.target.value)}
                      placeholder="https://upload.wikimedia.org/... or verified portrait image URL"
                      className="flex-1 min-w-[220px] px-2.5 py-1.5 border border-zinc-300 rounded bg-white"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 font-medium text-white bg-zinc-900 hover:bg-[#BC1F2F] rounded"
                    >
                      Save Photo URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUrlEditor(false)}
                      className="px-2.5 py-1.5 border border-zinc-300 rounded text-zinc-600 bg-white"
                    >
                      Cancel
                    </button>
                  </form>
                )}

                {activeTalent.identityCheckRequired && (
                  <div className="bg-amber-50 border border-amber-300 rounded p-4 flex flex-wrap items-start justify-between gap-3 text-xs text-amber-950">
                    <div className="flex items-start gap-3 flex-1 min-w-[240px]">
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Identity & Representation Verification Required</p>
                        <p className="mt-1 leading-relaxed">
                          {activeTalent.identityCheckNote ||
                            'Do not assume CAA roster status or initiate commercial brand outreach until identity and representation are confirmed.'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => portraitFileRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 font-medium text-amber-950 bg-white border border-amber-400 hover:bg-amber-100 rounded whitespace-nowrap shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Verified Photo</span>
                    </button>
                  </div>
                )}

                <p className="text-sm text-zinc-700 leading-relaxed border-t border-zinc-100 pt-4">
                  {activeTalent.portfolioSummary}
                </p>

                {/* Discovered Commercial Relationships Table */}
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-900">
                      Classified Commercial Relationships ({activeRelationships.length})
                    </h3>
                    <span className="text-[11px] text-zinc-500">
                      Ownership ≠ Endorsement · Historical ≠ Current
                    </span>
                  </div>

                  {activeRelationships.length === 0 ? (
                    <div className="border border-dashed border-zinc-300 rounded p-6 text-center space-y-2">
                      <p className="text-xs font-medium text-zinc-800">
                        No brands indexed yet for {activeTalent.name}
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        Run Commercial Portfolio Discovery above to investigate businesses, sponsorships, and UK Amazon opportunities.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleRunDiscovery(activeTalent.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#BC1F2F] rounded"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Discover Portfolio Now</span>
                      </button>
                    </div>
                  ) : (
                    <div className="border border-zinc-200 rounded divide-y divide-zinc-100">
                      {activeRelationships.map((rel) => {
                        const brand = brands.find((b) => b.id === rel.brandId);
                        const brandProds = discoveredProducts.filter(
                          (p) => p.brandId === rel.brandId
                        );
                        const uk = ukAssessments.find((u) => u.brandId === rel.brandId);
                        const bScore = brand ? brandScoresById[brand.id]?.total ?? 0 : 0;

                        return (
                          <div
                            key={rel.id}
                            className="p-4 space-y-3 hover:bg-zinc-50/70 transition-colors"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div className="flex items-start gap-3 min-w-0 flex-1">
                                <BrandVisual brand={brand} nameFallback={rel.brandId} size="md" />
                                <div className="space-y-1 min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-bold text-zinc-900">
                                      {brand?.name ?? rel.brandId}
                                    </span>
                                    <StatusTag
                                      status={
                                        rel.isCurrent
                                          ? rel.relationshipType
                                          : `Historical · ${rel.relationshipType}`
                                      }
                                      tone={
                                        !rel.isCurrent
                                          ? 'neutral'
                                          : rel.relationshipType === 'Owned Business' ||
                                            rel.relationshipType === 'Founder' ||
                                            rel.relationshipType === 'Co-Owned'
                                          ? 'success'
                                          : 'accent'
                                      }
                                    />
                                  </div>
                                  <p className="text-xs text-zinc-600">{rel.summary}</p>
                                  <div className="flex flex-wrap items-center gap-3 pt-0.5 text-[11px] text-zinc-500 font-mono-tabular">
                                    <span>{brandProds.length} product(s)</span>
                                    <span>·</span>
                                    <span>
                                      UK Gap: {uk?.opportunityType.split('—')[0].trim() ?? 'Pending'}
                                    </span>
                                    <span>·</span>
                                    <span>
                                      UK Wholesale Rights: {rel.ukDistributionRightsConfirmed}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <div className="text-right">
                                  <span className="text-[10px] text-zinc-400 block">
                                    Brand Score
                                  </span>
                                  <span className="font-mono-tabular text-sm font-bold text-zinc-900">
                                    {bScore}/100
                                  </span>
                                </div>
                                {brand && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedBrandId(brand.id);
                                      setActiveSection('brands');
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-zinc-800 bg-white border border-zinc-300 hover:border-zinc-900 rounded whitespace-nowrap"
                                  >
                                    <span>Inspect Brand</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {brandProds.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-0 sm:pl-14">
                                {brandProds.slice(0, 2).map((bp) => (
                                  <div
                                    key={bp.id}
                                    className="flex items-center gap-2.5 p-2 rounded border border-zinc-200 bg-zinc-50/70"
                                  >
                                    <ProductVisual
                                      product={bp}
                                      brand={brand}
                                      aspect="thumb"
                                      className="shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <p className="text-[11px] font-semibold text-zinc-900 line-clamp-1">
                                        {bp.title}
                                      </p>
                                      <p className="text-[10px] text-zinc-500 font-mono-tabular truncate mt-0.5">
                                        {bp.ukRrpGBP ? `UK Est. £${bp.ukRrpGBP.toFixed(2)}` : bp.category}
                                        {bp.usPriceUSD ? ` · US $${bp.usPriceUSD.toFixed(2)}` : ''}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Quick Jump to Operations for Selected Talent */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 text-xs">
                  <span className="text-zinc-500">
                    Active Talent Context set to <strong className="text-zinc-900">{activeTalent.name}</strong>
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveSection('campaigns')}
                      className="px-3 py-1.5 text-xs font-medium text-zinc-700 border border-zinc-300 rounded hover:bg-zinc-50"
                    >
                      Open Amazon UK Campaigns
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection('brand-stores')}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-[#BC1F2F] hover:bg-[#9E1927] rounded"
                    >
                      Open Brand Store Studio
                    </button>
                  </div>
                </div>
              </section>

              {/* Talent Deterministic Score Breakdown */}
              {activeTalentScore && (
                <ScoreBreakdownPanel
                  title={`${activeTalent.name} — Talent Portfolio Score`}
                  subtitle={`Calculated from CAA verification status, owned/authorised brand ties, ecosystem reach, and UK opportunity quality`}
                  breakdown={activeTalentScore}
                />
              )}

              {/* Talent Source & Verification Audit */}
              <VerificationBadgePanel
                stamp={activeTalent.verification}
                targetType="talent"
                targetId={activeTalent.id}
                onAddEvidence={addResearchEvidence}
              />
            </>
          ) : null}
        </div>
      </div>

      {/* Add Talent & Auto-Discover Modal */}
      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Talent Profile & Run Portfolio Discovery"
        subtitle="Automatically investigates businesses, brand partnerships, UK availability gaps, and deterministic priority scores"
      >
        <form onSubmit={handleCreateTalent} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-zinc-700 mb-1">Talent / Property Name</label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Zendaya, Emma Stone, or New Creator"
              className="w-full px-3 py-2 border border-zinc-300 rounded"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Vertical</label>
              <select
                value={newVertical}
                onChange={(e) => setNewVertical(e.target.value as TalentVertical)}
                className="w-full px-3 py-2 border border-zinc-300 rounded bg-white"
              >
                <option value="Film & TV">Film & TV</option>
                <option value="Sports">Sports</option>
                <option value="Digital Creators">Digital Creators</option>
                <option value="Music">Music</option>
                <option value="Podcasts & Media">Podcasts & Media</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                CAA Representation Status
              </label>
              <select
                value={newCaaStatus}
                onChange={(e) =>
                  setNewCaaStatus(e.target.value as CaaRepresentationStatus)
                }
                className="w-full px-3 py-2 border border-zinc-300 rounded bg-white"
              >
                <option value="Verified Publicly">Verified Publicly</option>
                <option value="Reported / Unconfirmed">Reported / Unconfirmed</option>
                <option value="Requires Verification">Requires Verification</option>
                <option value="Historical / Unclear">Historical / Unclear</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Primary Role</label>
              <input
                type="text"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                placeholder="e.g. Actor & Lifestyle Founder"
                className="w-full px-3 py-2 border border-zinc-300 rounded"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Origin Market</label>
              <input
                type="text"
                value={newMarket}
                onChange={(e) => setNewMarket(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-zinc-700 mb-1">
              Initial Portfolio Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={newSummary}
              onChange={(e) => setNewSummary(e.target.value)}
              placeholder="Known brands, licensing deals, or UK verification questions..."
              className="w-full px-3 py-2 border border-zinc-300 rounded"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-700 mb-1">
              Talent Portrait Photo (Optional — auto-fetches verified Wikipedia photo if blank)
            </label>
            <div className="flex items-center gap-2">
              <input
                ref={newTalentFileRef}
                type="file"
                accept="image/*"
                onChange={handleNewTalentFileChange}
                className="hidden"
              />
              <input
                type="text"
                value={newPortraitUrl}
                onChange={(e) => setNewPortraitUrl(e.target.value)}
                placeholder="Paste portrait URL or upload an image file..."
                className="flex-1 px-3 py-2 border border-zinc-300 rounded"
              />
              <button
                type="button"
                onClick={() => newTalentFileRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-zinc-300 rounded bg-zinc-50 hover:bg-zinc-100 text-zinc-700 whitespace-nowrap"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={runAuto}
              onChange={(e) => setRunAuto(e.target.checked)}
              className="w-4 h-4 accent-[#BC1F2F]"
            />
            <span className="font-medium text-zinc-800">
              Automatically run Commercial Portfolio Discovery upon creation
            </span>
          </label>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-3.5 py-2 font-medium text-zinc-700 border border-zinc-300 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-medium text-white bg-[#BC1F2F] hover:bg-[#9E1927] rounded"
            >
              Create & Discover Portfolio
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
