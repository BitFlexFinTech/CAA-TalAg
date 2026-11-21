import React, { useMemo, useRef, useState } from 'react';
import {
  Calendar,
  Code2,
  Eye,
  LayoutGrid,
  Layers,
  Megaphone,
  Plus,
  Send,
  Sparkles,
} from 'lucide-react';
import { useCommerce } from '../context/CommerceContext';
import { TALENT_PROFILE } from '../data/seedData';
import {
  AmazonAdType,
  AmazonDisplaySize,
  AmazonDspSize,
  AmazonTargetingType,
  Campaign,
  CampaignStatus,
} from '../types/commerce';
import { MediaFrame } from '../components/common/MediaFrame';
import { StatusTag } from '../components/common/StatusTag';
import { Drawer } from '../components/common/Drawer';
import { Modal } from '../components/common/Modal';
import {
  AD_TEMPLATES,
  AmazonAdPreviewCanvas,
} from '../components/campaigns/AmazonAdPreviewCanvas';
import { AiCampaignGeneratorModal } from '../components/campaigns/AiCampaignGeneratorModal';

const CAMPAIGN_STATUSES: CampaignStatus[] = [
  'Concept Outline',
  'Creative in Progress',
  'Awaiting Approval',
  'Ready for Launch (Demo)',
  'Paused',
];

const BASE_HERO_OPTIONS = [
  {
    label: 'Arena Appearance RR25 (CC BY 2.0)',
    src: TALENT_PROFILE.arenaPhoto,
    credit: 'Diego Serrano · CC BY 2.0',
  },
  {
    label: 'Chinatown Portrait 01 (CC BY-SA 2.0)',
    src: TALENT_PROFILE.primaryPortrait,
    credit: 'Chin Yu Chu · CC BY-SA 2.0',
  },
];

interface CampaignsViewProps {
  openAddSignal?: number;
}

export const CampaignsView: React.FC<CampaignsViewProps> = ({ openAddSignal }) => {
  const {
    campaigns,
    products,
    assets,
    addCampaign,
    addGeneratedAsset,
    updateCampaignStatus,
    updateCampaignAmazonAds,
    submitCampaignForApproval,
    setActiveSection,
  } = useCommerce();

  const studioRef = useRef<HTMLElement | null>(null);

  const [previewMode, setPreviewMode] = useState<'studio' | 'gallery'>('studio');
  const [selectedAdType, setSelectedAdType] = useState<AmazonAdType>(
    campaigns[0]?.amazonAds.adType ?? 'Sponsored Brands — Product Collection'
  );
  const [activeTemplateFilter, setActiveTemplateFilter] = useState<'ALL' | AmazonAdType>('ALL');
  const [studioCampaignId, setStudioCampaignId] = useState<string>(campaigns[0]?.id ?? 'cmp-01');
  const [drawerCampaignId, setDrawerCampaignId] = useState<string | null>(null);
  const [showJsonPayload, setShowJsonPayload] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  React.useEffect(() => {
    if (openAddSignal && openAddSignal > 0) {
      setAddModalOpen(true);
    }
  }, [openAddSignal]);

  // Add Campaign Manual Modal State
  const [newAdType, setNewAdType] = useState<AmazonAdType>('Sponsored Brands — Product Collection');
  const [newSdSize, setNewSdSize] = useState<AmazonDisplaySize>('300x250');
  const [newDspSize, setNewDspSize] = useState<AmazonDspSize>('970x250');
  const [newTargeting, setNewTargeting] = useState<AmazonTargetingType>('MANUAL');
  const [name, setName] = useState('');
  const [headline, setHeadline] = useState('Official iShowSpeed UK Capsule Drop');
  const [adGroupName, setAdGroupName] = useState('UK_Wholesale_Core_Exact');
  const [dailyBudgetGBP, setDailyBudgetGBP] = useState('250');
  const [defaultBidGBP, setDefaultBidGBP] = useState('0.75');
  const [keywordsText, setKeywordsText] = useState('ishowspeed hoodie uk, ishowspeed merch');
  const [objective, setObjective] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(() =>
    products.slice(0, 2).map((p) => p.id)
  );
  const [startDate, setStartDate] = useState('2027-02-10');
  const [endDate, setEndDate] = useState('2027-02-24');
  const [heroIdx, setHeroIdx] = useState(0);
  const [estOrders, setEstOrders] = useState('1500');
  const [estRevenue, setEstRevenue] = useState('92000');

  const studioCampaign = useMemo(
    () => campaigns.find((c) => c.id === studioCampaignId) ?? campaigns[0],
    [campaigns, studioCampaignId]
  );

  // If the user switches format tab and no saved campaign has that exact type,
  // still preview the selected format cleanly on top of the active studio campaign.
  const effectiveStudioCampaign = useMemo(() => {
    if (!studioCampaign) return null;
    if (studioCampaign.amazonAds.adType === selectedAdType) return studioCampaign;
    const match = campaigns.find((c) => c.amazonAds.adType === selectedAdType);
    if (match) return match;
    return {
      ...studioCampaign,
      amazonAds: {
        ...studioCampaign.amazonAds,
        adType: selectedAdType,
        sbFormat:
          selectedAdType === 'Sponsored Brands — Store Spotlight'
            ? 'STORE_SPOTLIGHT'
            : selectedAdType === 'Sponsored Brands — Video'
            ? 'VIDEO'
            : selectedAdType === 'Sponsored Brands — Product Collection'
            ? 'PRODUCT_COLLECTION'
            : undefined,
        sdSize: selectedAdType === 'Sponsored Display' ? '300x250' : undefined,
        dspSize: selectedAdType === 'Amazon DSP Display' ? '970x250' : undefined,
        tvFormat: selectedAdType === 'Sponsored TV' ? '15s Streaming Spot' : undefined,
        audioLength: selectedAdType === 'Amazon Audio Ads' ? '15s Alexa Spot' : undefined,
        storeSlug: selectedAdType === 'Brand Store & Posts' ? 'amazon.co.uk/ishowspeed' : undefined,
      },
    } as Campaign;
  }, [studioCampaign, selectedAdType, campaigns]);

  const drawerCampaign = useMemo(
    () => campaigns.find((c) => c.id === drawerCampaignId) ?? null,
    [campaigns, drawerCampaignId]
  );

  const filteredCampaigns = useMemo(() => {
    if (activeTemplateFilter === 'ALL') return campaigns;
    return campaigns.filter((c) => c.amazonAds.adType === activeTemplateFilter);
  }, [campaigns, activeTemplateFilter]);

  const imageAssets = useMemo(
    () => assets.filter((a) => !a.mediaType || a.mediaType === 'image'),
    [assets]
  );
  const videoAssets = useMemo(
    () => assets.filter((a) => a.mediaType === 'video'),
    [assets]
  );
  const heroVisualOptions = useMemo(
    () => [
      ...imageAssets.map((a) => ({
        label: `[Asset] ${a.title}`,
        src: a.src,
        credit: a.attribution || 'Uploaded Creative Asset',
      })),
      ...BASE_HERO_OPTIONS,
    ],
    [imageAssets]
  );

  const toggleProd = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSelectAdFormatTab = (type: AmazonAdType) => {
    setSelectedAdType(type);
    const match = campaigns.find((c) => c.amazonAds.adType === type);
    if (match) {
      setStudioCampaignId(match.id);
    }
    setPreviewMode('studio');
  };

  const handleLoadCampaignInStudio = (cmp: Campaign) => {
    setStudioCampaignId(cmp.id);
    setSelectedAdType(cmp.amazonAds.adType);
    setPreviewMode('studio');
    studioRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const hero = heroVisualOptions[heroIdx] ?? heroVisualOptions[0];
    const assocProds = products.filter((p) => selectedProductIds.includes(p.id));
    const asins = assocProds.map((p) => p.amazonAsinDemo || p.sku);

    const created = addCampaign({
      name,
      objective:
        objective.trim() ||
        `Amazon UK (${newAdType}) wholesale activation driving traffic to SP-API Vendor ASINs on amazon.co.uk.`,
      associatedProductIds: selectedProductIds,
      proposedStartDate: startDate,
      proposedEndDate: endDate,
      channels: ['amazon.co.uk', 'Amazon UK Vendor Central (SP-API)'],
      heroImage: hero.src,
      heroCredit: hero.credit,
      illustrativeEstOrders: Math.max(100, Number(estOrders) || 1200),
      illustrativeEstRevenue: Math.max(1000, Number(estRevenue) || 75000),
      amazonAds: {
        marketplaceId: 'A1F83G8C2ARO7P',
        marketplaceDomain: 'amazon.co.uk',
        endpointHost: 'https://advertising-api-eu.amazon.com',
        spApiSource: 'Amazon UK Vendor Central (SP-API)',
        adType: newAdType,
        targetingType: newTargeting,
        dailyBudgetGBP: Math.max(20, Number(dailyBudgetGBP) || 200),
        biddingStrategy: 'AUTO_FOR_SALES',
        adGroupName: adGroupName.trim() || 'UK_Default_AdGroup',
        defaultBidGBP: Math.max(0.1, Number(defaultBidGBP) || 0.65),
        headline: headline.trim().slice(0, 50) || 'Official iShowSpeed UK Drop',
        brandName: 'iShowSpeed Official',
        sbFormat:
          newAdType === 'Sponsored Brands — Store Spotlight'
            ? 'STORE_SPOTLIGHT'
            : newAdType === 'Sponsored Brands — Video'
            ? 'VIDEO'
            : newAdType === 'Sponsored Brands — Product Collection'
            ? 'PRODUCT_COLLECTION'
            : undefined,
        sdSize: newAdType === 'Sponsored Display' ? newSdSize : undefined,
        dspSize: newAdType === 'Amazon DSP Display' ? newDspSize : undefined,
        tvFormat: newAdType === 'Sponsored TV' ? '15s Streaming Spot' : undefined,
        audioLength: newAdType === 'Amazon Audio Ads' ? '15s Alexa Spot' : undefined,
        storeSlug: newAdType === 'Brand Store & Posts' ? 'amazon.co.uk/ishowspeed' : undefined,
        keywords: keywordsText
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean),
        advertisedAsins: asins.length > 0 ? asins : ['B0ISS3001UK'],
        customMediaUrl: hero.src,
      },
    });
    setAddModalOpen(false);
    setName('');
    setObjective('');
    setStudioCampaignId(created.id);
    setSelectedAdType(created.amazonAds.adType);
    setPreviewMode('studio');
  };

  const buildAmazonApiJsonPreview = (cmp: Campaign) => {
    const cfg = cmp.amazonAds;
    const pathMap: Record<AmazonAdType, string> = {
      'Sponsored Products': 'v3/sp/campaigns',
      'Sponsored Brands — Product Collection': 'v3/sb/campaigns',
      'Sponsored Brands — Store Spotlight': 'v3/sb/campaigns',
      'Sponsored Brands — Video': 'v3/sb/campaigns',
      'Sponsored Display': 'v3/sd/campaigns',
      'Sponsored TV': 'v1/st/campaigns',
      'Amazon DSP Display': 'dsp/v1/orders',
      'Brand Store & Posts': 'v2/stores/pages',
      'Amazon Audio Ads': 'v1/audio/campaigns',
    };
    return JSON.stringify(
      {
        endpoint: `${cfg.endpointHost}/${pathMap[cfg.adType]}`,
        marketplaceId: cfg.marketplaceId,
        domain: cfg.marketplaceDomain,
        spApiWholesaleSource: cfg.spApiSource,
        campaign: {
          name: cmp.name,
          state: cmp.approvalStatus === 'Approved' ? 'ENABLED' : 'PAUSED',
          targetingType: cfg.targetingType,
          startDate: cmp.proposedStartDate,
          endDate: cmp.proposedEndDate,
          budget: {
            budget: cfg.dailyBudgetGBP,
            budgetType: 'DAILY',
            currencyCode: 'GBP',
          },
          dynamicBidding: { strategy: cfg.biddingStrategy },
        },
        adGroup: {
          name: cfg.adGroupName,
          defaultBid: cfg.defaultBidGBP,
          state: 'ENABLED',
        },
        creative: {
          adType: cfg.adType,
          ...(cfg.sbFormat ? { format: cfg.sbFormat } : {}),
          ...(cfg.sdSize ? { displaySlotSize: cfg.sdSize } : {}),
          ...(cfg.dspSize ? { dspBannerSize: cfg.dspSize } : {}),
          ...(cfg.tvFormat ? { streamingTvSpot: cfg.tvFormat } : {}),
          ...(cfg.audioLength ? { audioSpotLength: cfg.audioLength } : {}),
          ...(cfg.storeSlug ? { storeDestination: cfg.storeSlug } : {}),
          brandName: cfg.brandName,
          headline: cfg.headline,
          advertisedAsins: cfg.advertisedAsins,
          keywordsOrAudiences: cfg.keywords,
          customMediaUrl: cfg.customMediaUrl || null,
          customVideoUrl: cfg.customVideoUrl || null,
        },
      },
      null,
      2
    );
  };

  return (
    <div className="space-y-6">
      {/* Header + AI Campaign Generator CTA */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#BC1F2F] mb-1">
            Full 9-Format Amazon UK Ads Suite · Wholesale SP-API ASIN Integration
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            iShowSpeed Amazon UK Campaigns & Live Ad Previews
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            Inspect live visual mockups for every Amazon UK ad format above the fold, or generate complete multi-format campaigns using AI.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-800 bg-white border border-zinc-300 hover:bg-zinc-100 rounded transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manual Campaign</span>
          </button>
          <button
            type="button"
            onClick={() => setAiModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#BC1F2F] hover:bg-[#9E1927] rounded transition-colors whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Campaign with AI</span>
          </button>
        </div>
      </div>

      {/* SECTION 1 (TOP): Live Amazon UK Ad Visual Preview Studio */}
      <section
        ref={studioRef}
        aria-label="Live Amazon UK Ad Placement Preview Studio"
        className="bg-white border border-zinc-200 rounded-md overflow-hidden"
      >
        {/* Top Studio Toolbar */}
        <div className="px-5 py-4 border-b border-zinc-200 bg-zinc-50/70 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium text-[#BC1F2F]">
                Live Amazon UK Placement Preview · Select Format Below
              </p>
              <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <Eye className="w-4 h-4 text-zinc-600" />
                <span>
                  {previewMode === 'gallery'
                    ? 'All 9 Amazon UK Ad Type Visual Previews'
                    : effectiveStudioCampaign?.name || 'Amazon UK Ad Placement Preview'}
                </span>
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded border border-zinc-300 bg-white p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewMode('studio')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded transition-colors whitespace-nowrap ${
                    previewMode === 'studio'
                      ? 'bg-zinc-900 text-white font-medium'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Interactive Studio</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('gallery')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded transition-colors whitespace-nowrap ${
                    previewMode === 'gallery'
                      ? 'bg-zinc-900 text-white font-medium'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>All 9 Ad Previews</span>
                </button>
              </div>

              {previewMode === 'studio' && effectiveStudioCampaign && (
                <>
                  <select
                    value={effectiveStudioCampaign.id}
                    onChange={(e) => {
                      const next = campaigns.find((c) => c.id === e.target.value);
                      if (next) {
                        setStudioCampaignId(next.id);
                        setSelectedAdType(next.amazonAds.adType);
                      }
                    }}
                    aria-label="Select saved campaign to preview"
                    className="text-xs border border-zinc-300 rounded px-2.5 py-1.5 bg-white font-medium max-w-[240px]"
                  >
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        [{c.code}] {c.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowJsonPayload((v) => !v)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-100 rounded whitespace-nowrap shrink-0"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>{showJsonPayload ? 'Hide EU API JSON' : 'EU API Payload'}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Compact Horizontal 9-Format Switcher Strip */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {AD_TEMPLATES.map((tpl) => {
              const Icon = tpl.icon;
              const isSelected = previewMode === 'studio' && selectedAdType === tpl.type;
              return (
                <button
                  key={tpl.type}
                  type="button"
                  onClick={() => handleSelectAdFormatTab(tpl.type)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] rounded border transition-colors whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#BC1F2F] text-white border-[#BC1F2F] font-semibold'
                      : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400 hover:text-zinc-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#BC1F2F]'}`} />
                  <span>{tpl.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Gallery Mode: All 9 Live Amazon UK Ad Previews Visible Together */}
        {previewMode === 'gallery' && (
          <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-5 bg-zinc-50/40">
            {AD_TEMPLATES.map((tpl) => {
              const Icon = tpl.icon;
              const matchingCampaign =
                campaigns.find((c) => c.amazonAds.adType === tpl.type) ?? campaigns[0];
              if (!matchingCampaign) return null;

              const previewCampaign: Campaign =
                matchingCampaign.amazonAds.adType === tpl.type
                  ? matchingCampaign
                  : {
                      ...matchingCampaign,
                      amazonAds: {
                        ...matchingCampaign.amazonAds,
                        adType: tpl.type,
                      },
                    };

              return (
                <div
                  key={tpl.type}
                  className="bg-white border border-zinc-200 rounded-md overflow-hidden flex flex-col justify-between"
                >
                  <div className="px-4 py-3 border-b border-zinc-200 flex items-center justify-between gap-2 bg-zinc-50/60">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                        <Icon className="w-3.5 h-3.5 text-[#BC1F2F] shrink-0" />
                        <span className="truncate">{tpl.title}</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 truncate mt-0.5">{tpl.placement}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectAdFormatTab(tpl.type)}
                      className="px-2.5 py-1 text-[11px] font-medium text-white bg-zinc-900 hover:bg-[#BC1F2F] rounded transition-colors whitespace-nowrap shrink-0"
                    >
                      Edit in Studio
                    </button>
                  </div>

                  <div className="p-3.5">
                    <AmazonAdPreviewCanvas
                      campaign={previewCampaign}
                      products={products}
                      assets={assets}
                      compact
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Interactive Single-Format Studio Mode */}
        {previewMode === 'studio' && effectiveStudioCampaign && (
          <div className="grid grid-cols-1 xl:grid-cols-12">
            {/* Left: Visual Preview Area */}
            <div className="xl:col-span-7 p-5 border-b xl:border-b-0 xl:border-r border-zinc-200 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-zinc-900 inline-flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#BC1F2F]" />
                    <span>Structure:</span>
                  </span>
                  <span className="font-mono-tabular text-zinc-600">
                    Campaign ({effectiveStudioCampaign.code}) → Ad Group (
                    {effectiveStudioCampaign.amazonAds.adGroupName}) →{' '}
                    {effectiveStudioCampaign.amazonAds.advertisedAsins.length} ASIN(s)
                  </span>
                </div>

                {effectiveStudioCampaign.amazonAds.adType === 'Sponsored Display' && (
                  <div className="flex items-center gap-1 p-0.5 bg-zinc-100 border border-zinc-200 rounded text-[11px] font-mono-tabular">
                    {(['300x250', '728x90', '300x600', '320x50'] as const).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() =>
                          updateCampaignAmazonAds(effectiveStudioCampaign.id, { sdSize: sz })
                        }
                        className={`px-2 py-1 rounded transition-colors ${
                          (effectiveStudioCampaign.amazonAds.sdSize || '300x250') === sz
                            ? 'bg-white text-zinc-900 font-semibold shadow-xs'
                            : 'text-zinc-600 hover:text-zinc-900'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                )}

                {effectiveStudioCampaign.amazonAds.adType === 'Amazon DSP Display' && (
                  <div className="flex items-center gap-1 p-0.5 bg-zinc-100 border border-zinc-200 rounded text-[11px] font-mono-tabular">
                    {(['970x250', '300x250', '320x50'] as const).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() =>
                          updateCampaignAmazonAds(effectiveStudioCampaign.id, { dspSize: sz })
                        }
                        className={`px-2 py-1 rounded transition-colors ${
                          (effectiveStudioCampaign.amazonAds.dspSize || '970x250') === sz
                            ? 'bg-white text-zinc-900 font-semibold shadow-xs'
                            : 'text-zinc-600 hover:text-zinc-900'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                )}

                {effectiveStudioCampaign.amazonAds.adType === 'Sponsored TV' && (
                  <div className="flex items-center gap-1 p-0.5 bg-zinc-100 border border-zinc-200 rounded text-[11px]">
                    {(['15s Streaming Spot', '30s Prime Video Spot'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() =>
                          updateCampaignAmazonAds(effectiveStudioCampaign.id, { tvFormat: fmt })
                        }
                        className={`px-2 py-1 rounded transition-colors ${
                          (effectiveStudioCampaign.amazonAds.tvFormat || '15s Streaming Spot') ===
                          fmt
                            ? 'bg-white text-zinc-900 font-semibold shadow-xs'
                            : 'text-zinc-600 hover:text-zinc-900'
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                )}

                {effectiveStudioCampaign.amazonAds.adType === 'Amazon Audio Ads' && (
                  <div className="flex items-center gap-1 p-0.5 bg-zinc-100 border border-zinc-200 rounded text-[11px]">
                    {(['15s Alexa Spot', '30s Amazon Music UK'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() =>
                          updateCampaignAmazonAds(effectiveStudioCampaign.id, { audioLength: fmt })
                        }
                        className={`px-2 py-1 rounded transition-colors ${
                          (effectiveStudioCampaign.amazonAds.audioLength || '15s Alexa Spot') ===
                          fmt
                            ? 'bg-white text-zinc-900 font-semibold shadow-xs'
                            : 'text-zinc-600 hover:text-zinc-900'
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <AmazonAdPreviewCanvas
                campaign={effectiveStudioCampaign}
                products={products}
                assets={assets}
              />

              {showJsonPayload && (
                <div className="bg-zinc-950 text-zinc-200 rounded p-4 overflow-x-auto">
                  <p className="text-[11px] font-mono-tabular text-zinc-400 mb-2">
                    Amazon Ads API EU Request Preview (
                    {effectiveStudioCampaign.amazonAds.endpointHost})
                  </p>
                  <pre className="text-[11px] font-mono-tabular leading-relaxed">
                    {buildAmazonApiJsonPreview(effectiveStudioCampaign)}
                  </pre>
                </div>
              )}
            </div>

            {/* Right: Real-Time Amazon Ads Config Controls */}
            <div className="xl:col-span-5 p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-900">
                  Ad Copy, Creative & Bidding Controls
                </h3>
                <StatusTag status={effectiveStudioCampaign.approvalStatus} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                    Ad Format Template
                  </label>
                  <select
                    value={effectiveStudioCampaign.amazonAds.adType}
                    onChange={(e) => {
                      const nextType = e.target.value as AmazonAdType;
                      setSelectedAdType(nextType);
                      updateCampaignAmazonAds(effectiveStudioCampaign.id, {
                        adType: nextType,
                        sbFormat:
                          nextType === 'Sponsored Brands — Store Spotlight'
                            ? 'STORE_SPOTLIGHT'
                            : nextType === 'Sponsored Brands — Video'
                            ? 'VIDEO'
                            : nextType === 'Sponsored Brands — Product Collection'
                            ? 'PRODUCT_COLLECTION'
                            : undefined,
                        sdSize: nextType === 'Sponsored Display' ? '300x250' : undefined,
                        dspSize: nextType === 'Amazon DSP Display' ? '970x250' : undefined,
                        tvFormat: nextType === 'Sponsored TV' ? '15s Streaming Spot' : undefined,
                        audioLength: nextType === 'Amazon Audio Ads' ? '15s Alexa Spot' : undefined,
                      });
                    }}
                    className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white"
                  >
                    {AD_TEMPLATES.map((t) => (
                      <option key={t.type} value={t.type}>
                        {t.type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                    Targeting Type
                  </label>
                  <select
                    value={effectiveStudioCampaign.amazonAds.targetingType}
                    onChange={(e) =>
                      updateCampaignAmazonAds(effectiveStudioCampaign.id, {
                        targetingType: e.target.value as AmazonTargetingType,
                      })
                    }
                    className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white"
                  >
                    <option value="MANUAL">MANUAL (Keyword / ASIN)</option>
                    <option value="AUTO">AUTO (Amazon Match)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                    Daily Budget (£ GBP)
                  </label>
                  <input
                    type="number"
                    min={10}
                    value={effectiveStudioCampaign.amazonAds.dailyBudgetGBP}
                    onChange={(e) =>
                      updateCampaignAmazonAds(effectiveStudioCampaign.id, {
                        dailyBudgetGBP: Math.max(10, Number(e.target.value) || 100),
                      })
                    }
                    className="w-full px-2.5 py-1.5 border border-zinc-300 rounded font-mono-tabular"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                    Default Bid (£)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min={0.1}
                    value={effectiveStudioCampaign.amazonAds.defaultBidGBP}
                    onChange={(e) =>
                      updateCampaignAmazonAds(effectiveStudioCampaign.id, {
                        defaultBidGBP: Math.max(0.1, Number(e.target.value) || 0.5),
                      })
                    }
                    className="w-full px-2.5 py-1.5 border border-zinc-300 rounded font-mono-tabular"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-zinc-600">
                    Ad Headline (50 chars max)
                  </label>
                  <span className="text-[10px] font-mono-tabular text-zinc-400">
                    {effectiveStudioCampaign.amazonAds.headline.length}/50
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={50}
                  value={effectiveStudioCampaign.amazonAds.headline}
                  onChange={(e) =>
                    updateCampaignAmazonAds(effectiveStudioCampaign.id, {
                      headline: e.target.value,
                    })
                  }
                  className="w-full px-2.5 py-1.5 border border-zinc-300 rounded"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-100">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                    Custom Image Creative
                  </label>
                  <select
                    value={
                      effectiveStudioCampaign.amazonAds.customMediaUrl ||
                      effectiveStudioCampaign.heroImage
                    }
                    onChange={(e) =>
                      updateCampaignAmazonAds(effectiveStudioCampaign.id, {
                        customMediaUrl: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white"
                  >
                    {heroVisualOptions.map((opt) => (
                      <option key={opt.src + opt.label} value={opt.src}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                    16:9 Video Asset (SBV / STV)
                  </label>
                  <select
                    value={effectiveStudioCampaign.amazonAds.customVideoUrl || ''}
                    onChange={(e) =>
                      updateCampaignAmazonAds(effectiveStudioCampaign.id, {
                        customVideoUrl: e.target.value || undefined,
                      })
                    }
                    className="w-full px-2.5 py-1.5 border border-zinc-300 rounded bg-white"
                  >
                    <option value="">No video attached</option>
                    {videoAssets.map((vid) => (
                      <option key={vid.id} value={vid.src}>
                        {vid.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                  Target Keywords / Audiences (Comma-separated)
                </label>
                <input
                  type="text"
                  value={effectiveStudioCampaign.amazonAds.keywords.join(', ')}
                  onChange={(e) =>
                    updateCampaignAmazonAds(effectiveStudioCampaign.id, {
                      keywords: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full px-2.5 py-1.5 border border-zinc-300 rounded font-mono-tabular"
                />
              </div>

              <div className="bg-zinc-50 border border-zinc-200 rounded p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-zinc-900">
                    Want AI to build creatives & copy for all formats?
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Generate bespoke banners in Creative Assets or a multi-format campaign suite with AI.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSection('assets')}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-900 bg-white border border-zinc-300 hover:bg-zinc-100 rounded shrink-0 whitespace-nowrap"
                >
                  Open Assets
                </button>
              </div>

              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono-tabular text-zinc-500 truncate">
                  ASINs: {effectiveStudioCampaign.amazonAds.advertisedAsins.join(' · ')}
                </span>
                {effectiveStudioCampaign.approvalStatus !== 'Approved' &&
                  effectiveStudioCampaign.approvalStatus !== 'Pending Review' && (
                    <button
                      type="button"
                      onClick={() => submitCampaignForApproval(effectiveStudioCampaign.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[#BC1F2F] hover:bg-[#9E1927] rounded whitespace-nowrap shrink-0"
                    >
                      <Send className="w-3 h-3" />
                      <span>Submit Campaign</span>
                    </button>
                  )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* SECTION 2: Campaign Portfolio Grid */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-[#BC1F2F]" />
            <span>
              Active & Proposed Amazon UK Campaigns ({filteredCampaigns.length})
            </span>
          </h2>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTemplateFilter('ALL')}
              className={`px-2.5 py-1 text-[11px] rounded transition-colors ${
                activeTemplateFilter === 'ALL'
                  ? 'bg-zinc-900 text-white font-medium'
                  : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900'
              }`}
            >
              All Formats ({campaigns.length})
            </button>
            {AD_TEMPLATES.map((tpl) => (
              <button
                key={tpl.type}
                type="button"
                onClick={() =>
                  setActiveTemplateFilter((prev) => (prev === tpl.type ? 'ALL' : tpl.type))
                }
                className={`px-2.5 py-1 text-[11px] rounded transition-colors ${
                  activeTemplateFilter === tpl.type
                    ? 'bg-zinc-900 text-white font-medium'
                    : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {tpl.shortLabel}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((cmp) => {
            const linkedProds = products.filter((p) => cmp.associatedProductIds.includes(p.id));
            const isActiveInStudio = effectiveStudioCampaign?.id === cmp.id;

            return (
              <article
                key={cmp.id}
                className={`bg-white border rounded-md overflow-hidden flex flex-col justify-between ${
                  isActiveInStudio ? 'border-zinc-900 ring-1 ring-zinc-900' : 'border-zinc-200'
                }`}
              >
                <div>
                  <button
                    type="button"
                    onClick={() => handleLoadCampaignInStudio(cmp)}
                    className="w-full text-left block group focus:outline-none"
                  >
                    <MediaFrame
                      src={cmp.heroImage}
                      alt={cmp.name}
                      aspectClass="aspect-[4/3]"
                      imgClassName="object-cover object-top group-hover:scale-[1.02] transition-transform duration-200"
                      caption={cmp.heroCredit}
                    />
                  </button>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2 text-xs text-zinc-500">
                      <span className="font-mono-tabular font-medium text-zinc-700 truncate">
                        {cmp.code} · {cmp.amazonAds.adType}
                      </span>
                      <span className="inline-flex items-center gap-1 font-mono-tabular text-[11px] shrink-0">
                        <Calendar className="w-3 h-3" />
                        {cmp.proposedStartDate}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleLoadCampaignInStudio(cmp)}
                      className="text-left text-base font-semibold text-zinc-900 hover:text-[#BC1F2F] transition-colors"
                    >
                      {cmp.name}
                    </button>

                    <p className="text-xs text-zinc-600 leading-relaxed line-clamp-2">
                      {cmp.objective}
                    </p>

                    <div className="pt-2 border-t border-zinc-100 text-xs flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[11px] text-zinc-500">SP-API Linked Products</p>
                        <p className="text-zinc-800 font-medium truncate">
                          {linkedProds.map((p) => p.name).join(' · ') || 'None assigned'}
                        </p>
                      </div>
                      <span className="font-mono-tabular text-[11px] text-zinc-600 shrink-0">
                        £{cmp.amazonAds.dailyBudgetGBP}/day
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-100 text-xs">
                      <div>
                        <p className="text-[11px] text-zinc-500">Est. Reach</p>
                        <p className="font-mono-tabular font-medium text-zinc-900">
                          {(cmp.illustrativeImpressions / 1000000).toFixed(2)}M
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-zinc-500">Demo Orders</p>
                        <p className="font-mono-tabular font-medium text-zinc-900">
                          {cmp.illustrativeEstOrders.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-zinc-500">Est. Rev (£)</p>
                        <p className="font-mono-tabular font-semibold text-zinc-900">
                          £{(cmp.illustrativeEstRevenue / 1000).toFixed(1)}k
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3.5 bg-zinc-50 border-t border-zinc-200 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <StatusTag status={cmp.approvalStatus} />
                    <select
                      value={cmp.status}
                      onChange={(e) =>
                        updateCampaignStatus(cmp.id, e.target.value as CampaignStatus)
                      }
                      aria-label={`Update status for ${cmp.name}`}
                      className="text-xs border border-zinc-300 rounded px-2 py-1 bg-white text-zinc-800"
                    >
                      {CAMPAIGN_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleLoadCampaignInStudio(cmp)}
                        className="px-2.5 py-1.5 text-xs font-medium text-zinc-800 bg-white border border-zinc-300 hover:bg-zinc-100 rounded transition-colors whitespace-nowrap"
                      >
                        Load Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => setDrawerCampaignId(cmp.id)}
                        className="px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 whitespace-nowrap"
                      >
                        Details
                      </button>
                    </div>
                    {cmp.approvalStatus !== 'Approved' && cmp.approvalStatus !== 'Pending Review' && (
                      <button
                        type="button"
                        onClick={() => submitCampaignForApproval(cmp.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-[#BC1F2F] rounded transition-colors whitespace-nowrap"
                      >
                        <Send className="w-3 h-3" />
                        <span>Submit</span>
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Campaign Detail Drawer */}
      <Drawer
        open={Boolean(drawerCampaign)}
        onClose={() => setDrawerCampaignId(null)}
        title={drawerCampaign?.name ?? ''}
        subtitle={
          drawerCampaign
            ? `${drawerCampaign.code} · ${drawerCampaign.amazonAds.adType} · ${drawerCampaign.proposedStartDate} to ${drawerCampaign.proposedEndDate}`
            : undefined
        }
        footer={
          drawerCampaign &&
          drawerCampaign.approvalStatus !== 'Approved' &&
          drawerCampaign.approvalStatus !== 'Pending Review' ? (
            <button
              type="button"
              onClick={() => submitCampaignForApproval(drawerCampaign.id)}
              className="px-4 py-2 text-xs font-medium text-white bg-[#BC1F2F] hover:bg-[#9E1927] rounded"
            >
              Submit Campaign for Approval
            </button>
          ) : undefined
        }
      >
        {drawerCampaign && (
          <div className="space-y-6">
            <AmazonAdPreviewCanvas
              campaign={drawerCampaign}
              products={products}
              assets={assets}
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <StatusTag status={drawerCampaign.approvalStatus} />
              <select
                value={drawerCampaign.status}
                onChange={(e) =>
                  updateCampaignStatus(drawerCampaign.id, e.target.value as CampaignStatus)
                }
                className="text-xs border border-zinc-300 rounded px-2.5 py-1.5 bg-white font-medium"
              >
                {CAMPAIGN_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 bg-zinc-50 border border-zinc-200 rounded text-xs">
              <div>
                <p className="text-[11px] text-zinc-500">Amazon Marketplace</p>
                <p className="font-mono-tabular font-medium text-zinc-900">
                  {drawerCampaign.amazonAds.marketplaceDomain} (
                  {drawerCampaign.amazonAds.marketplaceId})
                </p>
              </div>
              <div>
                <p className="text-[11px] text-zinc-500">Daily Budget / Default Bid</p>
                <p className="font-mono-tabular font-medium text-zinc-900">
                  £{drawerCampaign.amazonAds.dailyBudgetGBP}/day · £
                  {drawerCampaign.amazonAds.defaultBidGBP}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-zinc-500">Ad Group</p>
                <p className="font-mono-tabular font-medium text-zinc-900">
                  {drawerCampaign.amazonAds.adGroupName}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-zinc-500">Wholesale Source</p>
                <p className="font-medium text-zinc-900">{drawerCampaign.amazonAds.spApiSource}</p>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-medium text-zinc-500 mb-1">Proposed Objective</h3>
              <p className="text-sm text-zinc-800 leading-relaxed">{drawerCampaign.objective}</p>
            </div>

            <div>
              <h3 className="text-xs font-medium text-zinc-500 mb-2">
                Associated iShowSpeed Wholesale Products
              </h3>
              <div className="space-y-2">
                {products
                  .filter((p) => drawerCampaign.associatedProductIds.includes(p.id))
                  .map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-3 p-2.5 border border-zinc-200 rounded"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded object-contain bg-white p-0.5 border border-zinc-200"
                        />
                        <div>
                          <p className="text-xs font-semibold text-zinc-900">{p.name}</p>
                          <p className="text-[11px] font-mono-tabular text-zinc-500">
                            {p.sku} · ASIN: {p.amazonAsinDemo || 'TBD'} · Wholesale £
                            {p.proposedWholesale.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <StatusTag status={p.approvalStatus} />
                    </div>
                  ))}
              </div>
            </div>

            <p className="text-xs text-zinc-500 border-t border-zinc-200 pt-3">
              {drawerCampaign.notes}
            </p>
          </div>
        )}
      </Drawer>

      {/* AI Campaign Generator Modal */}
      <AiCampaignGeneratorModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        products={products}
        assets={assets}
        onCreateGeneratedSuite={({ creativeAsset, campaigns: generatedList }) => {
          addGeneratedAsset(creativeAsset);
          let firstCreated: Campaign | null = null;
          generatedList.forEach((cmpInput) => {
            const created = addCampaign(cmpInput);
            if (!firstCreated) firstCreated = created;
          });
          if (firstCreated) {
            const target: Campaign = firstCreated;
            setStudioCampaignId(target.id);
            setSelectedAdType(target.amazonAds.adType);
            setPreviewMode('studio');
          }
        }}
      />

      {/* Manual Add Campaign Modal */}
      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Create Manual Amazon UK Ads Campaign"
        subtitle="Select any of the 9 Amazon UK Advertising formats linked to Vendor Central ASINs"
        maxWidthClass="max-w-3xl"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {AD_TEMPLATES.map((tpl) => {
              const Icon = tpl.icon;
              return (
                <button
                  key={tpl.type}
                  type="button"
                  onClick={() => setNewAdType(tpl.type)}
                  className={`p-2 rounded border text-left transition-colors ${
                    newAdType === tpl.type
                      ? 'border-[#BC1F2F] bg-[#BC1F2F]/5 text-zinc-900 font-semibold'
                      : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-[#BC1F2F] shrink-0" />
                    <span className="truncate">{tpl.title}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Campaign Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`e.g. Amazon UK · ${newAdType}`}
                className="w-full px-3 py-2 border border-zinc-300 rounded"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Ad Group Name</label>
              <input
                type="text"
                value={adGroupName}
                onChange={(e) => setAdGroupName(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded font-mono-tabular"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Daily Budget (£ GBP)</label>
              <input
                type="number"
                min={20}
                value={dailyBudgetGBP}
                onChange={(e) => setDailyBudgetGBP(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded font-mono-tabular"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Default Bid (£ GBP)</label>
              <input
                type="number"
                step="0.05"
                min={0.1}
                value={defaultBidGBP}
                onChange={(e) => setDefaultBidGBP(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded font-mono-tabular"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Targeting</label>
              <select
                value={newTargeting}
                onChange={(e) => setNewTargeting(e.target.value as AmazonTargetingType)}
                className="w-full px-3 py-2 border border-zinc-300 rounded bg-white"
              >
                <option value="MANUAL">MANUAL</option>
                <option value="AUTO">AUTO</option>
              </select>
            </div>
          </div>

          {newAdType === 'Sponsored Display' && (
            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Sponsored Display Ad Slot Size
              </label>
              <select
                value={newSdSize}
                onChange={(e) => setNewSdSize(e.target.value as AmazonDisplaySize)}
                className="w-full px-3 py-2 border border-zinc-300 rounded bg-white font-mono-tabular"
              >
                <option value="300x250">300×250 Medium Rectangle</option>
                <option value="728x90">728×90 Leaderboard</option>
                <option value="300x600">300×600 Half-Page</option>
                <option value="320x50">320×50 Mobile Banner</option>
              </select>
            </div>
          )}

          {newAdType === 'Amazon DSP Display' && (
            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Amazon DSP Banner Unit Size
              </label>
              <select
                value={newDspSize}
                onChange={(e) => setNewDspSize(e.target.value as AmazonDspSize)}
                className="w-full px-3 py-2 border border-zinc-300 rounded bg-white font-mono-tabular"
              >
                <option value="970x250">970×250 Billboard</option>
                <option value="300x250">300×250 Medium Rectangle</option>
                <option value="320x50">320×50 Mobile Banner</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Ad Headline (50 chars max)
              </label>
              <input
                type="text"
                maxLength={50}
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Hero Banner / Creative Visual
              </label>
              <select
                value={heroIdx}
                onChange={(e) => setHeroIdx(Number(e.target.value))}
                className="w-full px-3 py-2 border border-zinc-300 rounded bg-white"
              >
                {heroVisualOptions.map((opt, idx) => (
                  <option key={opt.label + idx} value={idx}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-zinc-700 mb-1">
              Target Keywords / Audiences (Comma-separated)
            </label>
            <input
              type="text"
              value={keywordsText}
              onChange={(e) => setKeywordsText(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 rounded font-mono-tabular"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-700 mb-1">
              Linked SP-API Wholesale Products
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-28 overflow-y-auto border border-zinc-200 rounded p-2">
              {products.length === 0 ? (
                <p className="text-[11px] text-zinc-500 col-span-2 py-1">
                  No product concepts created yet. Create concepts in Product Concepts or configure from the Live Catalog.
                </p>
              ) : (
                products.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-[11px] text-zinc-700">
                    <input
                      type="checkbox"
                      checked={selectedProductIds.includes(p.id)}
                      onChange={() => toggleProd(p.id)}
                    />
                    <span className="truncate">
                      {p.name} (£{p.proposedRetail.toFixed(2)})
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2.5 py-2 border border-zinc-300 rounded font-mono-tabular"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2.5 py-2 border border-zinc-300 rounded font-mono-tabular"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Est. Orders</label>
              <input
                type="number"
                value={estOrders}
                onChange={(e) => setEstOrders(e.target.value)}
                className="w-full px-2.5 py-2 border border-zinc-300 rounded font-mono-tabular"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Est. Rev (£)</label>
              <input
                type="number"
                value={estRevenue}
                onChange={(e) => setEstRevenue(e.target.value)}
                className="w-full px-2.5 py-2 border border-zinc-300 rounded font-mono-tabular"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-3.5 py-2 font-medium text-zinc-700 border border-zinc-300 rounded hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-medium text-white bg-[#BC1F2F] hover:bg-[#9E1927] rounded"
            >
              Create Amazon UK Campaign
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
