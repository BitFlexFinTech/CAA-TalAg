import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CATALOG_PRODUCTS, fetchLiveCatalogProducts } from '../data/catalogData';
import {
  INITIAL_ACQUISITIONS,
  INITIAL_BRANDS,
  INITIAL_BRAND_STORES,
  INITIAL_DISCOVERED_PRODUCTS,
  INITIAL_INTL_LISTINGS,
  INITIAL_RELATIONSHIPS,
  INITIAL_TALENTS,
  INITIAL_UK_ASSESSMENTS,
} from '../data/intelligenceSeedData';
import {
  INITIAL_ACTIVITIES,
  INITIAL_APPROVALS,
  INITIAL_ASSETS,
  INITIAL_CAMPAIGNS,
  INITIAL_COLLECTIONS,
  INITIAL_FULFILMENT_ORDERS,
  INITIAL_INVENTORY,
  INITIAL_PRODUCTS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_ROYALTY_STATEMENTS,
  INITIAL_SETTINGS,
} from '../data/seedData';
import {
  AcquisitionRoute,
  AcquisitionStage,
  AcquisitionWorkflow,
  ActivityEvent,
  AmazonAdsConfig,
  ApprovalItem,
  ApprovalStatus,
  BrandRecord,
  BrandStoreProject,
  Campaign,
  CampaignCreativeCategory,
  CampaignStatus,
  CatalogBlankProduct,
  CatalogBlankVariant,
  CaaRepresentationStatus,
  Collection,
  ConfidenceLevel,
  CreativeAsset,
  DemoSettings,
  DevelopmentStage,
  DiscoveredProduct,
  FulfilmentOrder,
  FulfilmentStage,
  InternationalListing,
  InventoryRecord,
  NavSectionId,
  POStage,
  ProductCategory,
  ProductConcept,
  PurchaseOrder,
  RoyaltyStatement,
  ScoreBreakdown,
  TalentBrandRelationship,
  TalentProfileRecord,
  TalentVertical,
  UkMarketAssessment,
  UkOpportunityType,
  VerificationTier,
} from '../types/commerce';
import {
  normalizeBrandKey,
  runDeterministicPortfolioDiscovery,
  scoreBrandOpportunity,
  scoreProductOpportunity,
  scoreTalentPortfolio,
} from '../utils/intelligenceEngine';
import { resolveBrandMedia, resolveProductMediaByKeywords } from '../data/brandProductMedia';
import { fetchWikipediaPortrait } from '../utils/wikipediaPortrait';

interface AddProductInput {
  sku?: string;
  name: string;
  description: string;
  category: ProductCategory;
  collectionId: string;
  developmentStage: DevelopmentStage;
  proposedCost: number;
  proposedRetail: number;
  proposedWholesale: number;
  fabricSpec: string;
  targetRelease: string;
  image?: string;
  imageNote?: string;
}

interface AddCampaignInput {
  name: string;
  objective: string;
  talentId?: string;
  brandId?: string;
  creativeFormatCategory?: CampaignCreativeCategory;
  relationshipVerifiedNote?: string;
  wholesalePermissionConfirmed?: boolean;
  associatedProductIds: string[];
  proposedStartDate: string;
  proposedEndDate: string;
  channels: string[];
  heroImage: string;
  heroCredit: string;
  illustrativeEstRevenue: number;
  illustrativeEstOrders: number;
  amazonAds: AmazonAdsConfig;
}

interface AddPOInput {
  productId: string;
  quantity: number;
  illustrativeSupplier: string;
  supplierRegion: string;
  targetExFactoryDate: string;
  notes: string;
}

interface PromoteCatalogOptions {
  customName?: string;
  wholesalePrice?: number;
  retailPrice?: number;
  collectionId?: string;
  stage?: DevelopmentStage;
  customImage?: string;
  imageNote?: string;
}

interface AddCollectionInput {
  name: string;
  code?: string;
  seasonWindow: string;
  positioning: string;
  status?: Collection['status'];
  heroImage?: string;
  heroCredit?: string;
}

interface AddTalentInput {
  name: string;
  vertical: TalentVertical;
  roleSummary: string;
  primaryMarket: string;
  caaStatus: CaaRepresentationStatus;
  portfolioSummary?: string;
  portraitUrl?: string;
  portraitCredit?: string;
  runDiscoveryImmediately?: boolean;
}

interface AddEvidenceInput {
  targetType: 'brand' | 'product' | 'uk-assessment' | 'talent';
  targetId: string;
  sourceName: string;
  sourceUrl: string;
  evidenceSummary: string;
  verificationTier: VerificationTier;
  confidence: ConfidenceLevel;
  notes?: string;
}

interface AddBrandStoreInput {
  brandId: string;
  talentId: string;
  storeName: string;
  amazonUkSlug: string;
  headline: string;
  subheadline: string;
  heroImage?: string;
  productIds?: string[];
  assetIds?: string[];
}

interface CommerceContextValue {
  activeSection: NavSectionId;
  setActiveSection: (section: NavSectionId) => void;
  selectedTalentId: string;
  setSelectedTalentId: (talentId: string) => void;
  selectedBrandId: string | null;
  setSelectedBrandId: (brandId: string | null) => void;

  // Live Mockup Studio Navigation Prefill
  mockupPrefillAssetSrc: string | null;
  mockupTabRequestCount: number;
  openLiveMockupStudio: (assetSrc?: string) => void;

  // Commercial Intelligence State
  talents: TalentProfileRecord[];
  brands: BrandRecord[];
  relationships: TalentBrandRelationship[];
  discoveredProducts: DiscoveredProduct[];
  intlListings: InternationalListing[];
  ukAssessments: UkMarketAssessment[];
  acquisitions: AcquisitionWorkflow[];
  brandStores: BrandStoreProject[];

  // 3-Tier Deterministic Scores
  talentScoresById: Record<string, ScoreBreakdown>;
  brandScoresById: Record<string, ScoreBreakdown>;
  productScoresById: Record<string, ScoreBreakdown>;

  intelligenceMetrics: {
    totalTalents: number;
    verifiedCaaCount: number;
    verificationFlagCount: number;
    brandsDiscovered: number;
    productsDiscovered: number;
    intlListingsCount: number;
    ukOpportunityCounts: Record<UkOpportunityType, number>;
    highPriorityBrandsCount: number;
    wholesaleVerificationNeededCount: number;
    awaitingIntroCount: number;
    activeAcquisitionsCount: number;
    brandStoresCount: number;
    simulatedLiveStoresCount: number;
  };

  // Intelligence Actions
  addTalentAndDiscover: (input: AddTalentInput) => TalentProfileRecord;
  runPortfolioDiscovery: (talentId: string) => string;
  updateTalentPortrait: (talentId: string, portraitUrl: string, portraitCredit?: string) => void;
  refreshTalentPortraitFromWiki: (talentId: string) => Promise<boolean>;
  addResearchEvidence: (input: AddEvidenceInput) => void;
  updateUkAssessmentType: (assessmentId: string, opportunityType: UkOpportunityType, note?: string) => void;
  createAcquisitionWorkflow: (brandId: string, primaryTalentId: string, route: AcquisitionRoute) => AcquisitionWorkflow;
  advanceAcquisitionStage: (acquisitionId: string, stage: AcquisitionStage, wholesalePermissionConfirmed?: boolean) => void;
  toggleAcquisitionChecklist: (acquisitionId: string, index: number) => void;

  // Brand Store Studio Actions
  createBrandStore: (input: AddBrandStoreInput) => BrandStoreProject;
  updateBrandStore: (id: string, patch: Partial<BrandStoreProject>) => void;
  deleteBrandStore: (id: string) => void;
  submitBrandStoreForApproval: (id: string) => void;
  publishSimulatedBrandStore: (id: string) => void;

  // Existing Operations & Merchandise State
  products: ProductConcept[];
  collections: Collection[];
  campaigns: Campaign[];
  assets: CreativeAsset[];
  approvals: ApprovalItem[];
  purchaseOrders: PurchaseOrder[];
  fulfilmentOrders: FulfilmentOrder[];
  inventory: InventoryRecord[];
  royaltyStatements: RoyaltyStatement[];
  activities: ActivityEvent[];
  settings: DemoSettings;
  updateSettings: (partial: Partial<DemoSettings>) => void;

  catalogProducts: CatalogBlankProduct[];
  promoteCatalogVariantToConcept: (
    blank: CatalogBlankProduct,
    variant: CatalogBlankVariant,
    opts?: PromoteCatalogOptions
  ) => ProductConcept;

  metrics: {
    activeProductConcepts: number;
    productsAwaitingApproval: number;
    campaignsInDevelopment: number;
    pendingCreativeApprovals: number;
    demonstrationOrders: number;
    demonstrationRevenue: number;
    estimatedTalentRoyalties: number;
    outstandingApprovals: number;
    programmeCompletionPct: number;
  };

  addProduct: (input: AddProductInput) => ProductConcept;
  updateProduct: (id: string, patch: Partial<ProductConcept>) => void;
  deleteProduct: (id: string) => void;
  changeProductStage: (id: string, stage: DevelopmentStage) => void;
  submitProductForApproval: (id: string) => void;
  addCollection: (input: AddCollectionInput) => Collection;
  updateCollection: (id: string, patch: Partial<Collection>) => void;
  deleteCollection: (id: string) => void;
  toggleProductInCollection: (productId: string, collectionId: string) => void;

  addCampaign: (input: AddCampaignInput) => Campaign;
  updateCampaignStatus: (id: string, status: CampaignStatus) => void;
  updateCampaignAmazonAds: (id: string, patch: Partial<AmazonAdsConfig>) => void;
  submitCampaignForApproval: (id: string) => void;

  addGeneratedAsset: (asset: Omit<CreativeAsset, 'id' | 'dateAdded'>) => CreativeAsset;
  deleteAsset: (assetId: string) => void;

  decideApproval: (
    approvalId: string,
    decision: 'Approved' | 'Rejected' | 'Changes Requested',
    note?: string
  ) => void;
  addApprovalComment: (approvalId: string, text: string) => void;

  createPurchaseOrder: (input: AddPOInput) => void;
  advancePOStage: (poId: string, stage: POStage) => void;
  advanceOrderDelivery: (orderId: string, stage: FulfilmentStage) => void;
  updateInventoryUnits: (inventoryId: string, sampleUnits: number, proposedInitialRun: number) => void;

  updateRoyaltyRates: (statementId: string, wholesalePct: number) => void;
  toggleRoyaltyPaymentStatus: (statementId: string) => void;

  resetDemoState: () => void;
}

const CommerceContext = createContext<CommerceContextValue | null>(null);

const nowStamp = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
};

const todayDate = () => nowStamp().slice(0, 10);

function buildConceptPlaceholderSvg(label: string): string {
  const safe = label.replace(/[<>&"']/g, '').slice(0, 26) || 'CONCEPT SKU';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="#111111"/><rect x="32" y="32" width="736" height="536" fill="none" stroke="#27272A" stroke-width="2"/><path d="M40 520 L760 80" stroke="#BC1F2F" stroke-width="3" opacity="0.45"/><text x="64" y="100" fill="#BC1F2F" font-family="monospace" font-size="20" font-weight="bold">CAA × MERCENTA · CONCEPT</text><text x="64" y="310" fill="#FFFFFF" font-family="sans-serif" font-size="40" font-weight="800">${safe}</text><text x="64" y="355" fill="#A1A1AA" font-family="sans-serif" font-size="18">Attach artwork from Creative Assets or edit concept</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const STORAGE_PREFIX = 'caa_mercenta_v5_';
const LEGACY_V4_PREFIX = 'caa_speed_poc_v4_';

function readPersisted<T>(key: string, fallback: T, checkLegacyV4 = false): T {
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (raw) return JSON.parse(raw) as T;
    if (checkLegacyV4) {
      const v4 = window.localStorage.getItem(`${LEGACY_V4_PREFIX}${key}`);
      if (v4) return JSON.parse(v4) as T;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

function writePersisted<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export const CommerceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSection, setActiveSection] = useState<NavSectionId>('dashboard');
  const [selectedTalentId, setSelectedTalentId] = useState<string>('tal-ishowspeed');
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);

  const [mockupPrefillAssetSrc, setMockupPrefillAssetSrc] = useState<string | null>(null);
  const [mockupTabRequestCount, setMockupTabRequestCount] = useState(0);

  // Intelligence Graph State (hydrating cached local portraits for existing persisted sessions)
  const [talents, setTalents] = useState<TalentProfileRecord[]>(() => {
    const persisted = readPersisted('talents', INITIAL_TALENTS);
    const seedById = new Map(INITIAL_TALENTS.map((t) => [t.id, t]));
    return persisted.map((t) => {
      const seed = seedById.get(t.id);
      if (!seed || !seed.portraitUrl) return t;
      const shouldHydrate =
        !t.portraitUrl ||
        t.portraitUrl.includes('commons.wikimedia.org/wiki/Special:FilePath');
      return shouldHydrate
        ? { ...t, portraitUrl: seed.portraitUrl, portraitCredit: seed.portraitCredit }
        : t;
    });
  });
  const [brands, setBrands] = useState<BrandRecord[]>(() => {
    const persisted = readPersisted('brands', INITIAL_BRANDS);
    const seedById = new Map(INITIAL_BRANDS.map((b) => [b.id, b]));
    return persisted.map((b) => {
      const seed = seedById.get(b.id);
      const fallback = seed ?? resolveBrandMedia(b);
      if (!fallback) return b;
      return {
        ...b,
        logoUrl: b.logoUrl || fallback.logoUrl,
        imageUrl: b.imageUrl || fallback.imageUrl,
        imageCredit: b.imageCredit || fallback.imageCredit,
      };
    });
  });
  const [relationships, setRelationships] = useState<TalentBrandRelationship[]>(() =>
    readPersisted('relationships', INITIAL_RELATIONSHIPS)
  );
  const [discoveredProducts, setDiscoveredProducts] = useState<DiscoveredProduct[]>(() => {
    const persisted = readPersisted('discoveredProducts', INITIAL_DISCOVERED_PRODUCTS);
    const seedById = new Map(INITIAL_DISCOVERED_PRODUCTS.map((p) => [p.id, p]));
    const hydrated = persisted.map((p) => {
      const seed = seedById.get(p.id);
      if (seed) {
        return {
          ...p,
          image: p.image || seed.image,
          imageCredit: p.imageCredit || seed.imageCredit,
        };
      }
      if (!p.image) {
        const kw = resolveProductMediaByKeywords(p.brandId, p.title);
        if (kw) {
          return { ...p, image: kw.image, imageCredit: kw.imageCredit };
        }
      }
      return p;
    });
    const existingIds = new Set(hydrated.map((p) => p.id));
    const missingSeeds = INITIAL_DISCOVERED_PRODUCTS.filter((p) => !existingIds.has(p.id));
    return missingSeeds.length > 0 ? [...hydrated, ...missingSeeds] : hydrated;
  });
  const [intlListings, setIntlListings] = useState<InternationalListing[]>(() =>
    readPersisted('intlListings', INITIAL_INTL_LISTINGS)
  );
  const [ukAssessments, setUkAssessments] = useState<UkMarketAssessment[]>(() =>
    readPersisted('ukAssessments', INITIAL_UK_ASSESSMENTS)
  );
  const [acquisitions, setAcquisitions] = useState<AcquisitionWorkflow[]>(() =>
    readPersisted('acquisitions', INITIAL_ACQUISITIONS)
  );
  const [brandStores, setBrandStores] = useState<BrandStoreProject[]>(() => {
    const persisted = readPersisted('brandStores', INITIAL_BRAND_STORES);
    const seedById = new Map(INITIAL_BRAND_STORES.map((s) => [s.id, s]));
    return persisted.map((s) => {
      const seed = seedById.get(s.id);
      const needsFix =
        !s.heroImage || s.heroImage.includes('commons.wikimedia.org/wiki/Special:FilePath');
      if (!seed || !needsFix) return s;
      return {
        ...s,
        heroImage: seed.heroImage,
        modules: s.modules.map((m, idx) => {
          const seedMod = seed.modules[idx];
          const modNeedsFix =
            !m.bannerImage || m.bannerImage.includes('commons.wikimedia.org/wiki/Special:FilePath');
          return modNeedsFix && seedMod?.bannerImage
            ? { ...m, bannerImage: seedMod.bannerImage }
            : m;
        }),
      };
    });
  });

  // Operations & Merchandise State (preserving v4 items if present)
  const [products, setProducts] = useState<ProductConcept[]>(() =>
    readPersisted('products', INITIAL_PRODUCTS, true)
  );
  const [collections, setCollections] = useState<Collection[]>(() =>
    readPersisted('collections', INITIAL_COLLECTIONS, true)
  );
  const [campaigns, setCampaigns] = useState<Campaign[]>(() =>
    readPersisted('campaigns', INITIAL_CAMPAIGNS, true)
  );
  const [assets, setAssets] = useState<CreativeAsset[]>(() =>
    readPersisted('assets', INITIAL_ASSETS, true)
  );
  const [approvals, setApprovals] = useState<ApprovalItem[]>(() =>
    readPersisted('approvals', INITIAL_APPROVALS, true)
  );
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() =>
    readPersisted('purchaseOrders', INITIAL_PURCHASE_ORDERS, true)
  );
  const [fulfilmentOrders, setFulfilmentOrders] = useState<FulfilmentOrder[]>(() =>
    readPersisted('fulfilmentOrders', INITIAL_FULFILMENT_ORDERS, true)
  );
  const [inventory, setInventory] = useState<InventoryRecord[]>(() =>
    readPersisted('inventory', INITIAL_INVENTORY, true)
  );
  const [royaltyStatements, setRoyaltyStatements] = useState<RoyaltyStatement[]>(() =>
    readPersisted('royaltyStatements', INITIAL_ROYALTY_STATEMENTS, true)
  );
  const [activities, setActivities] = useState<ActivityEvent[]>(() =>
    readPersisted('activities', INITIAL_ACTIVITIES, true)
  );
  const [settings, setSettings] = useState<DemoSettings>(() =>
    readPersisted('settings', INITIAL_SETTINGS, true)
  );

  useEffect(() => { writePersisted('talents', talents); }, [talents]);
  useEffect(() => { writePersisted('brands', brands); }, [brands]);
  useEffect(() => { writePersisted('relationships', relationships); }, [relationships]);
  useEffect(() => { writePersisted('discoveredProducts', discoveredProducts); }, [discoveredProducts]);
  useEffect(() => { writePersisted('intlListings', intlListings); }, [intlListings]);
  useEffect(() => { writePersisted('ukAssessments', ukAssessments); }, [ukAssessments]);
  useEffect(() => { writePersisted('acquisitions', acquisitions); }, [acquisitions]);
  useEffect(() => { writePersisted('brandStores', brandStores); }, [brandStores]);

  useEffect(() => { writePersisted('products', products); }, [products]);
  useEffect(() => { writePersisted('collections', collections); }, [collections]);
  useEffect(() => { writePersisted('campaigns', campaigns); }, [campaigns]);
  useEffect(() => { writePersisted('assets', assets); }, [assets]);
  useEffect(() => { writePersisted('approvals', approvals); }, [approvals]);
  useEffect(() => { writePersisted('purchaseOrders', purchaseOrders); }, [purchaseOrders]);
  useEffect(() => { writePersisted('fulfilmentOrders', fulfilmentOrders); }, [fulfilmentOrders]);
  useEffect(() => { writePersisted('inventory', inventory); }, [inventory]);
  useEffect(() => { writePersisted('royaltyStatements', royaltyStatements); }, [royaltyStatements]);
  useEffect(() => { writePersisted('activities', activities); }, [activities]);
  useEffect(() => { writePersisted('settings', settings); }, [settings]);

  const [catalogProducts, setCatalogProducts] = useState<CatalogBlankProduct[]>(CATALOG_PRODUCTS);

  useEffect(() => {
    let mounted = true;
    fetchLiveCatalogProducts().then((liveItems) => {
      if (mounted && liveItems.length > 0) {
        setCatalogProducts([...liveItems, ...CATALOG_PRODUCTS]);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const pushActivity = useCallback((event: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
    setActivities((prev) => [
      {
        ...event,
        id: `act-${Date.now()}-${prev.length + 1}`,
        timestamp: nowStamp(),
      },
      ...prev,
    ]);
  }, []);

  const openLiveMockupStudio = useCallback((assetSrc?: string) => {
    if (assetSrc) {
      setMockupPrefillAssetSrc(assetSrc);
    }
    setMockupTabRequestCount((n) => n + 1);
    setActiveSection('concepts');
  }, []);

  // -------------------------------------------------------------------------
  // 3-Tier Deterministic Opportunity Scores (Computed Live from Graph)
  // -------------------------------------------------------------------------
  const productScoresById = useMemo(() => {
    const out: Record<string, ScoreBreakdown> = {};
    discoveredProducts.forEach((prod) => {
      const brand = brands.find((b) => b.id === prod.brandId);
      const uk =
        ukAssessments.find((u) => u.productId === prod.id) ??
        ukAssessments.find((u) => u.brandId === prod.brandId);
      const rels = relationships.filter((r) => r.brandId === prod.brandId);
      out[prod.id] = scoreProductOpportunity(prod, brand, intlListings, uk, rels);
    });
    return out;
  }, [discoveredProducts, brands, intlListings, ukAssessments, relationships]);

  const brandScoresById = useMemo(() => {
    const out: Record<string, ScoreBreakdown> = {};
    brands.forEach((brand) => {
      out[brand.id] = scoreBrandOpportunity(
        brand,
        discoveredProducts,
        intlListings,
        ukAssessments,
        relationships,
        acquisitions
      );
    });
    return out;
  }, [brands, discoveredProducts, intlListings, ukAssessments, relationships, acquisitions]);

  const talentScoresById = useMemo(() => {
    const out: Record<string, ScoreBreakdown> = {};
    talents.forEach((talent) => {
      out[talent.id] = scoreTalentPortfolio(talent, relationships, brandScoresById);
    });
    return out;
  }, [talents, relationships, brandScoresById]);

  const intelligenceMetrics = useMemo(() => {
    const ukOpportunityCounts: Record<UkOpportunityType, number> = {
      'Type A — No UK Presence': 0,
      'Type B — 3P / Unauthorised UK Sellers': 0,
      'Type C — Amazon UK Present, Unclear Wholesale': 0,
      'Type D — UK DTC Site Only, No Amazon UK': 0,
      'Type E — Partial / Limited UK Catalogue': 0,
      'Type F — Existing UK Distributor (Caution)': 0,
      'Type G — Unsuitable / UK Market Barriers': 0,
    };
    ukAssessments.forEach((u) => {
      ukOpportunityCounts[u.opportunityType] =
        (ukOpportunityCounts[u.opportunityType] || 0) + 1;
    });

    const verifiedCaaCount = talents.filter((t) => t.caaStatus === 'Verified Publicly').length;
    const verificationFlagCount = talents.filter(
      (t) => t.identityCheckRequired || t.caaStatus === 'Requires Verification'
    ).length;

    const highPriorityBrandsCount = brands.filter(
      (b) => (brandScoresById[b.id]?.total ?? 0) >= 76
    ).length;

    const wholesaleVerificationNeededCount = brands.filter(
      (b) =>
        b.ukWholesaleRouteStatus === 'Route Unclear' ||
        b.ukWholesaleRouteStatus === 'Direct Brand Contact'
    ).length;

    const awaitingIntroCount = acquisitions.filter(
      (a) =>
        a.route === 'Route 1 — Relationship-Led' &&
        (a.stage === 'Discovery' ||
          a.stage === 'Evidence & Verification' ||
          a.stage === 'CAA Liaison / Intro Requested')
    ).length;

    const activeAcquisitionsCount = acquisitions.filter(
      (a) => a.stage !== 'On Hold / Unsuitable'
    ).length;

    return {
      totalTalents: talents.length,
      verifiedCaaCount,
      verificationFlagCount,
      brandsDiscovered: brands.length,
      productsDiscovered: discoveredProducts.length,
      intlListingsCount: intlListings.length,
      ukOpportunityCounts,
      highPriorityBrandsCount,
      wholesaleVerificationNeededCount,
      awaitingIntroCount,
      activeAcquisitionsCount,
      brandStoresCount: brandStores.length,
      simulatedLiveStoresCount: brandStores.filter((s) => s.simulatedPublished).length,
    };
  }, [
    talents,
    brands,
    discoveredProducts,
    intlListings,
    ukAssessments,
    acquisitions,
    brandStores,
    brandScoresById,
  ]);

  // -------------------------------------------------------------------------
  // Commercial Intelligence Actions
  // -------------------------------------------------------------------------
  const runPortfolioDiscovery = useCallback(
    (talentId: string): string => {
      const targetTalent = talents.find((t) => t.id === talentId);
      if (!targetTalent) return 'Talent record not found.';

      const bundle = runDeterministicPortfolioDiscovery(
        targetTalent,
        brands,
        relationships,
        discoveredProducts,
        intlListings,
        ukAssessments
      );

      if (bundle.addedBrands.length > 0) {
        setBrands((prev) => {
          const seen = new Set(prev.map((b) => b.normalizedName));
          const uniqueNew = bundle.addedBrands.filter((b) => !seen.has(normalizeBrandKey(b.name)));
          return [...uniqueNew, ...prev];
        });
      }
      if (bundle.addedRelationships.length > 0) {
        setRelationships((prev) => [...bundle.addedRelationships, ...prev]);
      }
      if (bundle.addedProducts.length > 0) {
        setDiscoveredProducts((prev) => [...bundle.addedProducts, ...prev]);
      }
      if (bundle.addedListings.length > 0) {
        setIntlListings((prev) => [...bundle.addedListings, ...prev]);
      }
      if (bundle.addedUkAssessments.length > 0) {
        setUkAssessments((prev) => [...bundle.addedUkAssessments, ...prev]);
      }

      setTalents((prev) =>
        prev.map((t) =>
          t.id === talentId
            ? {
                ...t,
                discoveryStatus: 'Completed',
                discoveryLastRun: todayDate(),
              }
            : t
        )
      );

      pushActivity({
        category: 'Intelligence',
        title: `Commercial Portfolio Discovery: ${targetTalent.name}`,
        detail: bundle.summaryNote,
        actor: settings.activeReviewerName,
        targetSection: 'profile',
      });

      return bundle.summaryNote;
    },
    [
      talents,
      brands,
      relationships,
      discoveredProducts,
      intlListings,
      ukAssessments,
      pushActivity,
      settings.activeReviewerName,
    ]
  );

  const addTalentAndDiscover = (input: AddTalentInput): TalentProfileRecord => {
    const cleanName = input.name.trim();
    const slug = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const words = cleanName.split(/\s+/);
    const initials =
      words.length === 1
        ? cleanName.slice(0, 2).toUpperCase()
        : `${words[0][0] ?? ''}${words[words.length - 1][0] ?? ''}`.toUpperCase();

    const newTalent: TalentProfileRecord = {
      id: `tal-${slug}-${Date.now().toString().slice(-4)}`,
      name: cleanName,
      slug,
      vertical: input.vertical,
      roleSummary: input.roleSummary.trim() || `${input.vertical} Talent Profile`,
      primaryMarket: input.primaryMarket.trim() || 'United States / United Kingdom',
      portraitUrl: input.portraitUrl?.trim() || undefined,
      portraitCredit:
        input.portraitCredit?.trim() ||
        (input.portraitUrl?.trim() ? 'Uploaded / Verified Reference' : undefined),
      monogramInitials: initials,
      monogramAccent: '#BC1F2F',
      caaStatus: input.caaStatus,
      identityCheckRequired: input.caaStatus === 'Requires Verification',
      identityCheckNote:
        input.caaStatus === 'Requires Verification'
          ? 'Manual identity and CAA agent confirmation required before commercial outreach.'
          : undefined,
      discoveryStatus: input.runDiscoveryImmediately !== false ? 'Completed' : 'Draft',
      discoveryLastRun: todayDate(),
      portfolioSummary:
        input.portfolioSummary?.trim() ||
        `Commercial portfolio discovery profile created for ${cleanName}.`,
      verification: {
        id: `ver-tal-${Date.now()}`,
        sourceName: 'Workspace Talent Creation',
        sourceUrl: 'https://www.caa.com',
        dateChecked: todayDate(),
        evidenceSummary: `Profile entered as ${input.caaStatus}.`,
        verificationTier:
          input.caaStatus === 'Verified Publicly' ? 'Publicly Reported' : 'Unverified',
        confidence: input.caaStatus === 'Verified Publicly' ? 'Medium' : 'Low',
        unknownFields:
          input.caaStatus === 'Verified Publicly' ? [] : ['Primary CAA commercial agent confirmation'],
      },
    };

    const bundle =
      input.runDiscoveryImmediately !== false
        ? runDeterministicPortfolioDiscovery(
            newTalent,
            brands,
            relationships,
            discoveredProducts,
            intlListings,
            ukAssessments
          )
        : null;

    setTalents((prev) => [newTalent, ...prev]);
    if (bundle) {
      if (bundle.addedBrands.length > 0) setBrands((prev) => [...bundle.addedBrands, ...prev]);
      if (bundle.addedRelationships.length > 0)
        setRelationships((prev) => [...bundle.addedRelationships, ...prev]);
      if (bundle.addedProducts.length > 0)
        setDiscoveredProducts((prev) => [...bundle.addedProducts, ...prev]);
      if (bundle.addedListings.length > 0)
        setIntlListings((prev) => [...bundle.addedListings, ...prev]);
      if (bundle.addedUkAssessments.length > 0)
        setUkAssessments((prev) => [...bundle.addedUkAssessments, ...prev]);
    }

    setSelectedTalentId(newTalent.id);
    pushActivity({
      category: 'Intelligence',
      title: `Added talent & ran discovery: ${newTalent.name}`,
      detail: bundle ? bundle.summaryNote : `${newTalent.vertical} (${newTalent.caaStatus})`,
      actor: settings.activeReviewerName,
      targetSection: 'profile',
    });

    if (!newTalent.portraitUrl && input.caaStatus !== 'Requires Verification') {
      void fetchWikipediaPortrait(newTalent.name).then((found) => {
        if (!found) return;
        setTalents((prev) =>
          prev.map((t) =>
            t.id === newTalent.id && !t.portraitUrl
              ? { ...t, portraitUrl: found.url, portraitCredit: found.credit }
              : t
          )
        );
      });
    }

    return newTalent;
  };

  const updateTalentPortrait = useCallback(
    (talentId: string, portraitUrl: string, portraitCredit?: string) => {
      const cleanUrl = portraitUrl.trim();
      const target = talents.find((t) => t.id === talentId);
      setTalents((prev) =>
        prev.map((t) =>
          t.id === talentId
            ? {
                ...t,
                portraitUrl: cleanUrl || undefined,
                portraitCredit: cleanUrl
                  ? portraitCredit?.trim() || 'Uploaded / Verified Talent Portrait'
                  : undefined,
              }
            : t
        )
      );
      if (target) {
        pushActivity({
          category: 'Intelligence',
          title: cleanUrl
            ? `Updated portrait for ${target.name}`
            : `Cleared portrait for ${target.name}`,
          detail: portraitCredit?.trim() || 'Manual portrait upload / URL update',
          actor: settings.activeReviewerName,
          targetSection: 'profile',
        });
      }
    },
    [talents, pushActivity, settings.activeReviewerName]
  );

  const refreshTalentPortraitFromWiki = useCallback(
    async (talentId: string): Promise<boolean> => {
      const target = talents.find((t) => t.id === talentId);
      if (!target || target.identityCheckRequired) return false;
      const found = await fetchWikipediaPortrait(target.name);
      if (!found) return false;
      setTalents((prev) =>
        prev.map((t) =>
          t.id === talentId
            ? {
                ...t,
                portraitUrl: found.url,
                portraitCredit: found.credit,
              }
            : t
        )
      );
      pushActivity({
        category: 'Intelligence',
        title: `Verified Wikipedia portrait linked: ${target.name}`,
        detail: found.credit,
        actor: settings.activeReviewerName,
        targetSection: 'profile',
      });
      return true;
    },
    [talents, pushActivity, settings.activeReviewerName]
  );

  const addResearchEvidence = (input: AddEvidenceInput) => {
    const newStamp = {
      id: `ver-upd-${Date.now()}`,
      sourceName: input.sourceName.trim(),
      sourceUrl: input.sourceUrl.trim() || 'https://www.amazon.co.uk',
      dateChecked: todayDate(),
      evidenceSummary: input.evidenceSummary.trim(),
      verificationTier: input.verificationTier,
      confidence: input.confidence,
      unknownFields: input.verificationTier === 'Verified Fact' ? [] : ['Remaining channel check'],
      notes: input.notes?.trim() || undefined,
    };

    if (input.targetType === 'brand') {
      setBrands((prev) =>
        prev.map((b) => (b.id === input.targetId ? { ...b, verification: newStamp } : b))
      );
    } else if (input.targetType === 'product') {
      setDiscoveredProducts((prev) =>
        prev.map((p) => (p.id === input.targetId ? { ...p, verification: newStamp } : p))
      );
    } else if (input.targetType === 'uk-assessment') {
      setUkAssessments((prev) =>
        prev.map((u) => (u.id === input.targetId ? { ...u, verification: newStamp } : u))
      );
    } else if (input.targetType === 'talent') {
      setTalents((prev) =>
        prev.map((t) =>
          t.id === input.targetId
            ? {
                ...t,
                verification: newStamp,
                identityCheckRequired:
                  input.verificationTier === 'Verified Fact' ? false : t.identityCheckRequired,
              }
            : t
        )
      );
    }

    pushActivity({
      category: 'Intelligence',
      title: `Updated verification evidence (${input.verificationTier})`,
      detail: `${input.sourceName}: ${input.evidenceSummary}`,
      actor: settings.activeReviewerName,
      targetSection: input.targetType === 'talent' ? 'profile' : 'brands',
    });
  };

  const updateUkAssessmentType = (
    assessmentId: string,
    opportunityType: UkOpportunityType,
    note?: string
  ) => {
    setUkAssessments((prev) =>
      prev.map((u) =>
        u.id === assessmentId
          ? {
              ...u,
              opportunityType,
              estimatedGapSummary: note?.trim() ? note.trim() : u.estimatedGapSummary,
              existingDistributorDetected:
                opportunityType === 'Type F — Existing UK Distributor (Caution)'
                  ? true
                  : u.existingDistributorDetected,
            }
          : u
      )
    );
    pushActivity({
      category: 'Intelligence',
      title: `Reclassified UK Opportunity as ${opportunityType}`,
      detail: note?.trim() || 'UK Market Opportunity classification updated (scores recalculated).',
      actor: settings.activeReviewerName,
      targetSection: 'uk-opportunities',
    });
  };

  const createAcquisitionWorkflow = (
    brandId: string,
    primaryTalentId: string,
    route: AcquisitionRoute
  ): AcquisitionWorkflow => {
    const existing = acquisitions.find((a) => a.brandId === brandId);
    if (existing) return existing;

    const brand = brands.find((b) => b.id === brandId);
    const talent = talents.find((t) => t.id === primaryTalentId);

    const newWorkflow: AcquisitionWorkflow = {
      id: `acq-${Date.now().toString().slice(-5)}`,
      brandId,
      primaryTalentId,
      route,
      stage: 'Discovery',
      wholesalePermissionConfirmed: false,
      ownerNote: `Initiated ${route} tracking for ${brand?.name ?? 'Brand'}.`,
      nextStep:
        route === 'Route 2 — Talent-Owned / Authorised'
          ? 'Verify talent ownership share and request written UK wholesale distribution permission.'
          : 'Request CAA partner introduction to brand UK/international commercial lead.',
      updatedAt: todayDate(),
      checklist:
        route === 'Route 2 — Talent-Owned / Authorised'
          ? [
              { label: `Confirm ${talent?.name ?? 'Talent'} brand ownership / authority`, done: true },
              { label: 'Audit UK compliance, safety marks & existing distributor status', done: false },
              { label: 'Obtain explicit written UK wholesale permission', done: false },
              { label: 'Setup Amazon UK Vendor Central & Brand Storefront', done: false },
            ]
          : [
              { label: 'Distinguish endorsement/collab relationship from wholesale control', done: true },
              { label: 'Document UK Amazon gap & international proof pack', done: false },
              { label: 'Request CAA agent warm intro to brand commercial leadership', done: false },
              { label: 'Negotiate UK wholesale distribution permission', done: false },
            ],
      verification: {
        id: `ver-acq-${Date.now()}`,
        sourceName: 'CAA × Mercenta Acquisition Pipeline',
        sourceUrl: brand?.websiteUrl || 'https://www.amazon.co.uk',
        dateChecked: todayDate(),
        evidenceSummary: `${route} opened in workspace.`,
        verificationTier: 'Demonstration Data',
        confidence: 'Medium',
        unknownFields: ['Signed UK wholesale permission'],
      },
    };

    setAcquisitions((prev) => [newWorkflow, ...prev]);
    pushActivity({
      category: 'Acquisition',
      title: `Opened ${route}: ${brand?.name ?? brandId}`,
      detail: `Primary talent: ${talent?.name ?? primaryTalentId}`,
      actor: settings.activeReviewerName,
      targetSection: 'acquisition',
    });
    return newWorkflow;
  };

  const advanceAcquisitionStage = (
    acquisitionId: string,
    stage: AcquisitionStage,
    wholesalePermissionConfirmed?: boolean
  ) => {
    const target = acquisitions.find((a) => a.id === acquisitionId);
    if (!target) return;

    const resolvedPermission =
      typeof wholesalePermissionConfirmed === 'boolean'
        ? wholesalePermissionConfirmed
        : target.wholesalePermissionConfirmed;

    // Safeguard: cannot enter Commercial Terms & Onboarding or Amazon UK Ready without permission flag
    const finalStage: AcquisitionStage =
      (stage === 'Commercial Terms & Onboarding' || stage === 'Amazon UK Ready') &&
      !resolvedPermission
        ? 'UK Wholesale Permission Review'
        : stage;

    setAcquisitions((prev) =>
      prev.map((a) =>
        a.id === acquisitionId
          ? {
              ...a,
              stage: finalStage,
              wholesalePermissionConfirmed: resolvedPermission,
              updatedAt: todayDate(),
            }
          : a
      )
    );

    if (resolvedPermission) {
      setBrands((prev) =>
        prev.map((b) =>
          b.id === target.brandId
            ? { ...b, ukWholesaleRouteStatus: 'Wholesale Authorised' }
            : b
        )
      );
    }

    const brand = brands.find((b) => b.id === target.brandId);
    pushActivity({
      category: 'Acquisition',
      title: `${brand?.name ?? 'Brand'} acquisition moved to ${finalStage}`,
      detail: resolvedPermission
        ? 'UK wholesale distribution permission confirmed'
        : 'Permission verification gate active',
      actor: settings.activeReviewerName,
      targetSection: 'acquisition',
    });
  };

  const toggleAcquisitionChecklist = (acquisitionId: string, index: number) => {
    setAcquisitions((prev) =>
      prev.map((a) => {
        if (a.id !== acquisitionId) return a;
        const nextChecklist = a.checklist.map((item, i) =>
          i === index ? { ...item, done: !item.done } : item
        );
        return { ...a, checklist: nextChecklist, updatedAt: todayDate() };
      })
    );
  };

  // -------------------------------------------------------------------------
  // Amazon Brand Store Studio Actions
  // -------------------------------------------------------------------------
  const createBrandStore = (input: AddBrandStoreInput): BrandStoreProject => {
    const nextNum = brandStores.length + 1;
    const talent = talents.find((t) => t.id === input.talentId);
    const brand = brands.find((b) => b.id === input.brandId);
    const heroImg =
      input.heroImage ||
      brand?.imageUrl ||
      brand?.logoUrl ||
      talent?.portraitUrl ||
      '/images/talent/speed-rr25.jpg';

    const newStore: BrandStoreProject = {
      id: `bst-${Date.now().toString().slice(-5)}`,
      code: `AMZUK-STR-0${nextNum}`,
      brandId: input.brandId,
      talentId: input.talentId,
      storeName: input.storeName.trim(),
      amazonUkSlug:
        input.amazonUkSlug.trim() ||
        `amazon.co.uk/stores/${(brand?.normalizedName || 'brand').slice(0, 20)}`,
      headline: input.headline.trim(),
      subheadline: input.subheadline.trim(),
      heroImage: heroImg,
      navPages: ['Home', 'Best Sellers', 'Featured Kits', 'Brand Story'],
      modules: [
        {
          id: `mod-${Date.now()}-1`,
          type: 'Hero Banner',
          title: input.headline.trim(),
          subtitle: input.subheadline.trim(),
          ctaLabel: 'Shop Official UK Store',
          ctaTargetPage: 'Best Sellers',
          selectedProductIds: input.productIds ?? [],
          bannerImage: heroImg,
        },
        {
          id: `mod-${Date.now()}-2`,
          type: 'Best Sellers Grid',
          title: `${brand?.name || 'Brand'} — Authorised UK Catalogue`,
          subtitle: 'Amazon.co.uk Prime Vendor Central assortment',
          ctaLabel: 'View Catalogue',
          ctaTargetPage: 'Featured Kits',
          selectedProductIds: input.productIds ?? [],
          bannerImage: heroImg,
        },
      ],
      assetIds: input.assetIds ?? [],
      productIds: input.productIds ?? [],
      approvalStatus: 'Draft',
      simulatedPublished: false,
      updatedAt: todayDate(),
      notes: `Brand Storefront drafted for ${talent?.name ?? 'Talent'} × ${brand?.name ?? 'Brand'}.`,
    };

    setBrandStores((prev) => [newStore, ...prev]);
    pushActivity({
      category: 'Brand Store',
      title: `Created Amazon UK Brand Store: ${newStore.storeName}`,
      detail: `${newStore.amazonUkSlug} · Draft storefront saved`,
      actor: settings.activeReviewerName,
      targetSection: 'brand-stores',
    });
    return newStore;
  };

  const updateBrandStore = (id: string, patch: Partial<BrandStoreProject>) => {
    setBrandStores((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch, updatedAt: todayDate() } : s))
    );
  };

  const deleteBrandStore = (id: string) => {
    const target = brandStores.find((s) => s.id === id);
    if (!target) return;
    setBrandStores((prev) => prev.filter((s) => s.id !== id));
    setApprovals((prev) =>
      prev.filter((a) => !(a.linkedType === 'brand-store' && a.linkedId === id))
    );
    pushActivity({
      category: 'Brand Store',
      title: `Deleted Brand Store project: ${target.storeName}`,
      detail: `${target.code} removed`,
      actor: settings.activeReviewerName,
      targetSection: 'brand-stores',
    });
  };

  const submitBrandStoreForApproval = (id: string) => {
    const store = brandStores.find((s) => s.id === id);
    if (!store) return;

    setBrandStores((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, approvalStatus: 'Pending Review', updatedAt: todayDate() } : s
      )
    );

    const existingPending = approvals.find(
      (a) => a.linkedType === 'brand-store' && a.linkedId === id && a.status === 'Pending Review'
    );
    if (!existingPending) {
      const nextRefNum = 101 + approvals.length;
      const newApr: ApprovalItem = {
        id: `apr-${Date.now().toString().slice(-4)}`,
        reference: `APR-2026-${nextRefNum}`,
        type: 'Brand Storefront',
        title: `${store.storeName} — Amazon UK Brand Store Review`,
        description: `Review storefront navigation (${store.navPages.join(' / ')}), hero banner copy ("${store.headline}"), and linked UK products for ${store.amazonUkSlug}.`,
        submissionDate: todayDate(),
        submittedBy: settings.activeReviewerName,
        linkedType: 'brand-store',
        linkedId: store.id,
        linkedName: store.storeName,
        previewImage: store.heroImage || undefined,
        status: 'Pending Review',
        comments: [],
        history: [
          {
            id: `hist-${Date.now()}`,
            action: 'Submitted Amazon UK Brand Store for Review',
            actor: settings.activeReviewerName,
            timestamp: nowStamp(),
          },
        ],
      };
      setApprovals((prev) => [newApr, ...prev]);
    }

    pushActivity({
      category: 'Approval',
      title: `Submitted Brand Storefront: ${store.storeName}`,
      detail: `${store.code} queued in Approval Centre`,
      actor: settings.activeReviewerName,
      targetSection: 'approvals',
    });
  };

  const publishSimulatedBrandStore = (id: string) => {
    const store = brandStores.find((s) => s.id === id);
    if (!store) return;
    setBrandStores((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              simulatedPublished: !s.simulatedPublished,
              updatedAt: todayDate(),
            }
          : s
      )
    );
    pushActivity({
      category: 'Brand Store',
      title: !store.simulatedPublished
        ? `Simulated live publish: ${store.storeName}`
        : `Unpublished simulated store: ${store.storeName}`,
      detail: `${store.amazonUkSlug} (Demonstration storefront state)`,
      actor: settings.activeReviewerName,
      targetSection: 'brand-stores',
    });
  };

  // -------------------------------------------------------------------------
  // Existing Merchandise & Operations Methods (Preserved Intact)
  // -------------------------------------------------------------------------
  const promoteCatalogVariantToConcept = (
    blank: CatalogBlankProduct,
    variant: CatalogBlankVariant,
    opts?: PromoteCatalogOptions
  ): ProductConcept => {
    const bulkEstCost = Number((variant.singleUnitCostGBP * 0.72).toFixed(2));
    const wholesalePrice =
      opts?.wholesalePrice ?? Number((bulkEstCost * 1.95).toFixed(2));
    const retailPrice =
      opts?.retailPrice ?? Number((wholesalePrice * 1.85).toFixed(2));

    const colorCode = variant.color ? variant.color.slice(0, 3).toUpperCase() : 'BLK';
    const sku = `ISS-${blank.skuCode}-${colorCode}-${variant.size || 'OS'}`.replace(/\s+/g, '');

    const newProd: ProductConcept = {
      id: `prod-${blank.id}-${variant.id}-${Date.now().toString().slice(-3)}`,
      sku,
      name:
        opts?.customName?.trim() ||
        `${blank.title} (${variant.color} / ${variant.size})`,
      image: opts?.customImage || variant.image || blank.image,
      imageNote:
        opts?.imageNote ||
        `${blank.productionLine} · ${blank.skuCode} (${variant.color}, ${variant.size})`,
      description: blank.description,
      category: blank.category,
      collectionId: opts?.collectionId ?? collections[0]?.id ?? '',
      developmentStage: opts?.stage || 'Concept Draft',
      proposedCost: bulkEstCost,
      proposedRetail: retailPrice,
      proposedWholesale: wholesalePrice,
      approvalStatus: 'Draft',
      fabricSpec: `${blank.fabricSummary} · ${variant.color} (${variant.size}) · ${variant.ukStatus}`,
      targetRelease: 'Amazon UK Vendor Central',
      createdAt: todayDate(),
      updatedAt: todayDate(),
      catalogBlankId: blank.id,
      catalogVariantId: variant.id,
      productionLine: blank.productionLine,
      selectedColor: variant.color,
      selectedColorHex: variant.colorHex,
      selectedSize: variant.size,
      ukFulfilled: true,
      amazonAsinDemo: `B0${blank.skuCode.replace(/[^A-Z0-9]/g, '').slice(0, 6)}UK`,
    };

    setProducts((prev) => [newProd, ...prev]);
    setInventory((prev) => [
      {
        id: `inv-${Date.now().toString().slice(-4)}`,
        productId: newProd.id,
        sku: newProd.sku,
        productName: newProd.name,
        category: newProd.category,
        sampleUnits: 4,
        proposedInitialRun: 1000,
        allocatedDemoUnits: 0,
        availableBuffer: 1000,
        reorderPoint: 200,
        hubLocation: `${blank.productionLine} → Amazon UK FC`,
        readinessStatus: 'Sample Only',
      },
      ...prev,
    ]);

    pushActivity({
      category: 'Product',
      title: `Configured UK Wholesale SKU: ${newProd.name}`,
      detail: `${newProd.sku} · Color: ${variant.color} · Size: ${variant.size} · Est. Bulk Cost: £${bulkEstCost.toFixed(2)}`,
      actor: settings.activeReviewerName,
      targetSection: 'concepts',
    });

    return newProd;
  };

  const updateSettings = (partial: Partial<DemoSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const addProduct = (input: AddProductInput): ProductConcept => {
    const nextNum = products.length + 1;
    const skuPrefix = input.category.slice(0, 3).toUpperCase();
    const resolvedSku =
      input.sku?.trim() || `ISS-${skuPrefix}-${String(nextNum).padStart(3, '0')}`;
    const newProd: ProductConcept = {
      id: `prod-${Date.now().toString().slice(-6)}-${nextNum}`,
      sku: resolvedSku,
      name: input.name.trim(),
      image: input.image || buildConceptPlaceholderSvg(input.name.trim()),
      imageNote: input.imageNote || 'Manual concept visual',
      description: input.description.trim(),
      category: input.category,
      collectionId: input.collectionId,
      developmentStage: input.developmentStage,
      proposedCost: input.proposedCost,
      proposedRetail: input.proposedRetail,
      proposedWholesale: input.proposedWholesale,
      approvalStatus: 'Draft',
      fabricSpec: input.fabricSpec.trim() || 'Custom Material Specification',
      targetRelease: input.targetRelease.trim() || 'Amazon UK Drop TBD',
      createdAt: todayDate(),
      updatedAt: todayDate(),
      ukFulfilled: true,
      amazonAsinDemo: `B0ISS${String(100 + nextNum)}UK`,
    };

    setProducts((prev) => [newProd, ...prev]);
    setInventory((prev) => [
      {
        id: `inv-${Date.now().toString().slice(-4)}`,
        productId: newProd.id,
        sku: newProd.sku,
        productName: newProd.name,
        category: newProd.category,
        sampleUnits: 2,
        proposedInitialRun: 1000,
        allocatedDemoUnits: 0,
        availableBuffer: 1000,
        reorderPoint: 200,
        hubLocation: 'UK Production Hub (Pending Allocation)',
        readinessStatus: 'Sample Only',
      },
      ...prev,
    ]);

    pushActivity({
      category: 'Product',
      title: `Created manual concept: ${newProd.name}`,
      detail: `${newProd.sku} · ${newProd.category} · Stage: ${newProd.developmentStage}`,
      actor: settings.activeReviewerName,
      targetSection: 'concepts',
    });

    return newProd;
  };

  const updateProduct = (id: string, patch: Partial<ProductConcept>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: todayDate() } : p))
    );
    const target = products.find((p) => p.id === id);
    if (target) {
      pushActivity({
        category: 'Product',
        title: `Updated product specification: ${patch.name ?? target.name}`,
        detail: `${target.sku} record updated in workspace`,
        actor: settings.activeReviewerName,
        targetSection: 'concepts',
      });
    }
  };

  const deleteProduct = (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setInventory((prev) => prev.filter((i) => i.productId !== id));
    setApprovals((prev) =>
      prev.filter((a) => !((a.linkedType === 'product' || a.linkedType === 'proposal') && a.linkedId === id))
    );
    setCampaigns((prev) =>
      prev.map((c) => ({
        ...c,
        associatedProductIds: c.associatedProductIds.filter((pid) => pid !== id),
      }))
    );
    pushActivity({
      category: 'Product',
      title: `Deleted product concept: ${target.name}`,
      detail: `${target.sku} removed from concepts & inventory`,
      actor: settings.activeReviewerName,
      targetSection: 'concepts',
    });
  };

  const changeProductStage = (id: string, stage: DevelopmentStage) => {
    const target = products.find((p) => p.id === id);
    if (!target || target.developmentStage === stage) return;
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, developmentStage: stage, updatedAt: todayDate() } : p))
    );
    pushActivity({
      category: 'Product',
      title: `${target.name} moved to ${stage}`,
      detail: `${target.sku} development stage updated`,
      actor: settings.activeReviewerName,
      targetSection: 'development',
    });
  };

  const submitProductForApproval = (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;

    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, approvalStatus: 'Pending Review', updatedAt: todayDate() } : p
      )
    );

    const existingPending = approvals.find(
      (a) => a.linkedType === 'product' && a.linkedId === id && a.status === 'Pending Review'
    );

    if (!existingPending) {
      const nextRefNum = 101 + approvals.length;
      const newApproval: ApprovalItem = {
        id: `apr-${Date.now().toString().slice(-4)}`,
        reference: `APR-2026-${nextRefNum}`,
        type: target.developmentStage === 'Concept Draft' ? 'Product Concept' : 'Product Design',
        title: `${target.name} — ${target.developmentStage} Approval`,
        description: `Review proposed product specification (${target.fabricSpec}), Amazon UK wholesale pricing (£${target.proposedWholesale.toFixed(2)}), and concept visual.`,
        submissionDate: todayDate(),
        submittedBy: settings.activeReviewerName,
        linkedType: 'product',
        linkedId: target.id,
        linkedName: target.name,
        previewImage: target.image,
        status: 'Pending Review',
        comments: [],
        history: [
          {
            id: `hist-${Date.now()}`,
            action: 'Submitted for CAA & Talent Review',
            actor: settings.activeReviewerName,
            timestamp: nowStamp(),
          },
        ],
      };
      setApprovals((prev) => [newApproval, ...prev]);
    }

    pushActivity({
      category: 'Approval',
      title: `Submitted ${target.name} for approval`,
      detail: `${target.sku} queued in Approval Centre`,
      actor: settings.activeReviewerName,
      targetSection: 'approvals',
    });
  };

  const addCollection = (input: AddCollectionInput): Collection => {
    const nextNum = collections.length + 1;
    const code = input.code?.trim() || `CAPSULE-${String(nextNum).padStart(2, '0')}`;
    const newCol: Collection = {
      id: `col-${Date.now().toString().slice(-6)}-${nextNum}`,
      code,
      name: input.name.trim(),
      seasonWindow: input.seasonWindow.trim() || 'Proposed UK Drop Window',
      positioning:
        input.positioning.trim() || 'Curated capsule collection for Amazon UK.',
      status: input.status ?? 'Proposed Concept',
      heroImage: input.heroImage ?? '',
      heroCredit: input.heroCredit?.trim() || 'Manual Collection Cover',
    };
    setCollections((prev) => [...prev, newCol]);
    pushActivity({
      category: 'Product',
      title: `Created capsule collection: ${newCol.name}`,
      detail: `${newCol.code} · ${newCol.seasonWindow}`,
      actor: settings.activeReviewerName,
      targetSection: 'collections',
    });
    return newCol;
  };

  const updateCollection = (id: string, patch: Partial<Collection>) => {
    const target = collections.find((c) => c.id === id);
    setCollections((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    if (target) {
      pushActivity({
        category: 'Product',
        title: `Updated collection: ${patch.name ?? target.name}`,
        detail: `${patch.code ?? target.code} updated`,
        actor: settings.activeReviewerName,
        targetSection: 'collections',
      });
    }
  };

  const deleteCollection = (id: string) => {
    const target = collections.find((c) => c.id === id);
    if (!target) return;
    setCollections((prev) => prev.filter((c) => c.id !== id));
    setProducts((prev) =>
      prev.map((p) => (p.collectionId === id ? { ...p, collectionId: '', updatedAt: todayDate() } : p))
    );
    pushActivity({
      category: 'Product',
      title: `Deleted collection: ${target.name}`,
      detail: `${target.code} removed from workspace`,
      actor: settings.activeReviewerName,
      targetSection: 'collections',
    });
  };

  const toggleProductInCollection = (productId: string, collectionId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, collectionId, updatedAt: todayDate() } : p))
    );
  };

  const addCampaign = (input: AddCampaignInput): Campaign => {
    const nextNum = campaigns.length + 1;
    const typeTagMap: Record<Campaign['amazonAds']['adType'], string> = {
      'Sponsored Products': 'SP',
      'Sponsored Brands — Product Collection': 'SBC',
      'Sponsored Brands — Store Spotlight': 'SBS',
      'Sponsored Brands — Video': 'SBV',
      'Sponsored Display': 'SD',
      'Sponsored TV': 'STV',
      'Amazon DSP Display': 'DSP',
      'Brand Store & Posts': 'STR',
      'Amazon Audio Ads': 'AUD',
    };
    const typeTag = typeTagMap[input.amazonAds.adType] || 'UK';
    const newCmp: Campaign = {
      id: `cmp-0${nextNum}-${Date.now().toString().slice(-3)}`,
      code: `AMZ-UK-${typeTag}-0${nextNum}`,
      name: input.name.trim(),
      objective: input.objective.trim(),
      talentId: input.talentId || selectedTalentId,
      brandId: input.brandId,
      creativeFormatCategory: input.creativeFormatCategory || 'Amazon Ads',
      relationshipVerifiedNote: input.relationshipVerifiedNote,
      wholesalePermissionConfirmed: input.wholesalePermissionConfirmed,
      associatedProductIds: input.associatedProductIds,
      creativeAssetIds: [],
      heroImage: input.heroImage,
      heroCredit: input.heroCredit,
      status: 'Concept Outline',
      proposedStartDate: input.proposedStartDate,
      proposedEndDate: input.proposedEndDate,
      approvalStatus: 'Draft',
      channels: input.channels,
      illustrativeImpressions: Math.max(250000, input.illustrativeEstOrders * 420),
      illustrativeEstOrders: input.illustrativeEstOrders,
      illustrativeEstRevenue: input.illustrativeEstRevenue,
      notes: `Amazon UK (${input.amazonAds.adType}) template configured for EU Advertising API.`,
      amazonAds: input.amazonAds,
    };
    setCampaigns((prev) => [newCmp, ...prev]);
    pushActivity({
      category: 'Campaign',
      title: `Created Amazon UK ${input.amazonAds.adType} campaign: ${newCmp.name}`,
      detail: `${newCmp.code} · Daily Budget £${input.amazonAds.dailyBudgetGBP}`,
      actor: settings.activeReviewerName,
      targetSection: 'campaigns',
    });
    return newCmp;
  };

  const updateCampaignStatus = (id: string, status: CampaignStatus) => {
    const cmp = campaigns.find((c) => c.id === id);
    if (!cmp) return;
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    pushActivity({
      category: 'Campaign',
      title: `${cmp.name} status set to ${status}`,
      detail: `${cmp.code} demonstration status updated`,
      actor: settings.activeReviewerName,
      targetSection: 'campaigns',
    });
  };

  const updateCampaignAmazonAds = (id: string, patch: Partial<AmazonAdsConfig>) => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, amazonAds: { ...c.amazonAds, ...patch } } : c
      )
    );
  };

  const submitCampaignForApproval = (id: string) => {
    const cmp = campaigns.find((c) => c.id === id);
    if (!cmp) return;

    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: 'Awaiting Approval', approvalStatus: 'Pending Review' } : c
      )
    );

    const existingPending = approvals.find(
      (a) => a.linkedType === 'campaign' && a.linkedId === id && a.status === 'Pending Review'
    );
    if (!existingPending) {
      const nextRefNum = 101 + approvals.length;
      const newApr: ApprovalItem = {
        id: `apr-${Date.now().toString().slice(-4)}`,
        reference: `APR-2026-${nextRefNum}`,
        type: 'Campaign Creative',
        title: `${cmp.name} — Amazon UK Ads Creative Approval`,
        description: cmp.objective,
        submissionDate: todayDate(),
        submittedBy: settings.activeReviewerName,
        linkedType: 'campaign',
        linkedId: cmp.id,
        linkedName: cmp.name,
        previewImage: cmp.heroImage,
        status: 'Pending Review',
        comments: [],
        history: [
          {
            id: `hist-${Date.now()}`,
            action: 'Submitted Amazon UK Campaign for Approval',
            actor: settings.activeReviewerName,
            timestamp: nowStamp(),
          },
        ],
      };
      setApprovals((prev) => [newApr, ...prev]);
    }

    pushActivity({
      category: 'Approval',
      title: `Submitted campaign ${cmp.name} for approval`,
      detail: `${cmp.code} queued in Approval Centre`,
      actor: settings.activeReviewerName,
      targetSection: 'approvals',
    });
  };

  const addGeneratedAsset = (
    asset: Omit<CreativeAsset, 'id' | 'dateAdded'>
  ): CreativeAsset => {
    const newAsset: CreativeAsset = {
      ...asset,
      id: `ast-gen-${Date.now().toString().slice(-5)}`,
      dateAdded: todayDate(),
    };
    setAssets((prev) => [newAsset, ...prev]);
    pushActivity({
      category: 'Campaign',
      title: `Added creative asset: ${newAsset.title}`,
      detail: `${newAsset.assetType} · ${newAsset.dimensions}`,
      actor: settings.activeReviewerName,
      targetSection: 'assets',
    });
    return newAsset;
  };

  const deleteAsset = (assetId: string) => {
    const target = assets.find((a) => a.id === assetId);
    if (!target) return;
    setAssets((prev) => prev.filter((a) => a.id !== assetId));
    setCampaigns((prev) =>
      prev.map((c) => ({
        ...c,
        creativeAssetIds: c.creativeAssetIds.filter((id) => id !== assetId),
      }))
    );
    pushActivity({
      category: 'Campaign',
      title: `Deleted creative asset: ${target.title}`,
      detail: `${target.assetType} removed from Creative Assets library`,
      actor: settings.activeReviewerName,
      targetSection: 'assets',
    });
  };

  const decideApproval = (
    approvalId: string,
    decision: 'Approved' | 'Rejected' | 'Changes Requested',
    note?: string
  ) => {
    const targetApproval = approvals.find((a) => a.id === approvalId);
    if (!targetApproval) return;

    setApprovals((prev) =>
      prev.map((a) => {
        if (a.id !== approvalId) return a;
        const nextHistory = [
          ...a.history,
          {
            id: `hist-${Date.now()}`,
            action: decision,
            actor: settings.activeReviewerName,
            timestamp: nowStamp(),
            note: note?.trim() || undefined,
          },
        ];
        const nextComments =
          note && note.trim()
            ? [
                ...a.comments,
                {
                  id: `cmt-${Date.now()}`,
                  author: settings.activeReviewerName,
                  role: settings.activeReviewerRole,
                  text: note.trim(),
                  timestamp: nowStamp(),
                },
              ]
            : a.comments;
        return {
          ...a,
          status: decision,
          history: nextHistory,
          comments: nextComments,
        };
      })
    );

    if (targetApproval.linkedType === 'product' || targetApproval.linkedType === 'proposal') {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === targetApproval.linkedId
            ? { ...p, approvalStatus: decision as ApprovalStatus, updatedAt: todayDate() }
            : p
        )
      );
    } else if (targetApproval.linkedType === 'campaign') {
      setCampaigns((prev) =>
        prev.map((c) => {
          if (c.id !== targetApproval.linkedId) return c;
          const nextCampaignStatus: CampaignStatus =
            decision === 'Approved'
              ? 'Ready for Launch (Demo)'
              : decision === 'Changes Requested'
              ? 'Creative in Progress'
              : 'Paused';
          return {
            ...c,
            approvalStatus: decision as ApprovalStatus,
            status: nextCampaignStatus,
          };
        })
      );
    } else if (targetApproval.linkedType === 'brand-store') {
      setBrandStores((prev) =>
        prev.map((s) =>
          s.id === targetApproval.linkedId
            ? {
                ...s,
                approvalStatus: decision as ApprovalStatus,
                updatedAt: todayDate(),
              }
            : s
        )
      );
    }

    pushActivity({
      category: 'Approval',
      title: `${targetApproval.reference} marked ${decision}`,
      detail: `${targetApproval.linkedName}${note ? ` — "${note.trim()}"` : ''}`,
      actor: settings.activeReviewerName,
      targetSection: 'approvals',
    });
  };

  const addApprovalComment = (approvalId: string, text: string) => {
    if (!text.trim()) return;
    const targetApproval = approvals.find((a) => a.id === approvalId);
    setApprovals((prev) =>
      prev.map((a) => {
        if (a.id !== approvalId) return a;
        return {
          ...a,
          comments: [
            ...a.comments,
            {
              id: `cmt-${Date.now()}`,
              author: settings.activeReviewerName,
              role: settings.activeReviewerRole,
              text: text.trim(),
              timestamp: nowStamp(),
            },
          ],
          history: [
            ...a.history,
            {
              id: `hist-${Date.now()}`,
              action: 'Comment Added',
              actor: settings.activeReviewerName,
              timestamp: nowStamp(),
              note: text.trim(),
            },
          ],
        };
      })
    );
    if (targetApproval) {
      pushActivity({
        category: 'Approval',
        title: `Comment added on ${targetApproval.reference}`,
        detail: text.trim(),
        actor: settings.activeReviewerName,
        targetSection: 'approvals',
      });
    }
  };

  const createPurchaseOrder = (input: AddPOInput) => {
    const prod = products.find((p) => p.id === input.productId);
    if (!prod) return;
    const nextNum = 1041 + purchaseOrders.length;
    const po: PurchaseOrder = {
      id: `po-${Date.now().toString().slice(-4)}`,
      poNumber: `PO-AMZUK-${nextNum}`,
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      quantity: input.quantity,
      unitCost: prod.proposedCost,
      totalValue: Number((input.quantity * prod.proposedCost).toFixed(2)),
      illustrativeSupplier: input.illustrativeSupplier.trim(),
      supplierRegion: input.supplierRegion.trim(),
      stage: 'Draft PO',
      targetExFactoryDate: input.targetExFactoryDate,
      notes: input.notes.trim() || 'Proposed Amazon UK Vendor Central demonstration PO.',
    };
    setPurchaseOrders((prev) => [po, ...prev]);
    pushActivity({
      category: 'Order',
      title: `Created illustrative PO ${po.poNumber}`,
      detail: `${po.quantity.toLocaleString()} units of ${po.productName} (£${po.totalValue.toLocaleString()})`,
      actor: settings.activeReviewerName,
      targetSection: 'purchase-orders',
    });
  };

  const advancePOStage = (poId: string, stage: POStage) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    if (!po) return;
    setPurchaseOrders((prev) => prev.map((p) => (p.id === poId ? { ...p, stage } : p)));
    pushActivity({
      category: 'Order',
      title: `${po.poNumber} moved to ${stage}`,
      detail: `${po.productName} (${po.illustrativeSupplier})`,
      actor: settings.activeReviewerName,
      targetSection: 'purchase-orders',
    });
  };

  const advanceOrderDelivery = (orderId: string, stage: FulfilmentStage) => {
    const stagesOrder: FulfilmentStage[] = [
      'Allocated (Demo)',
      'In Production',
      'Packed at 3PL',
      'Dispatched',
      'In Transit',
      'Delivered (Demo)',
    ];
    const targetIdx = stagesOrder.indexOf(stage);
    const ord = fulfilmentOrders.find((o) => o.id === orderId);
    if (!ord || targetIdx === -1) return;

    const dispatchMap: Record<FulfilmentStage, FulfilmentOrder['dispatchStatus']> = {
      'Allocated (Demo)': 'Awaiting Stock',
      'In Production': 'Awaiting Stock',
      'Packed at 3PL': 'Ready for Dispatch',
      Dispatched: 'Dispatched',
      'In Transit': 'Dispatched',
      'Delivered (Demo)': 'Completed',
    };

    setFulfilmentOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const nextTimeline = o.timeline.map((step, idx) => {
          if (idx <= targetIdx) {
            return {
              ...step,
              completed: true,
              timestamp: step.completed ? step.timestamp : nowStamp(),
            };
          }
          return { ...step, completed: false, timestamp: 'Pending' };
        });
        return {
          ...o,
          deliveryStatus: stage,
          dispatchStatus: dispatchMap[stage],
          timeline: nextTimeline,
        };
      })
    );

    pushActivity({
      category: 'Order',
      title: `${ord.orderNumber} updated to ${stage}`,
      detail: `${ord.productName} (${ord.region})`,
      actor: settings.activeReviewerName,
      targetSection: 'fulfilment',
    });
  };

  const updateInventoryUnits = (
    inventoryId: string,
    sampleUnits: number,
    proposedInitialRun: number
  ) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id !== inventoryId) return item;
        const availableBuffer = Math.max(0, proposedInitialRun - item.allocatedDemoUnits);
        const readinessStatus =
          sampleUnits < 10
            ? 'Low Sample Buffer'
            : proposedInitialRun > 0 && sampleUnits >= 15
            ? 'Pre-Allocation Ready'
            : 'Sample Only';
        return {
          ...item,
          sampleUnits,
          proposedInitialRun,
          availableBuffer,
          readinessStatus,
        };
      })
    );
  };

  const updateRoyaltyRates = (statementId: string, wholesalePct: number) => {
    setRoyaltyStatements((prev) =>
      prev.map((st) => {
        if (st.id !== statementId) return st;
        const updatedItems = st.lineItems.map((li) => ({
          ...li,
          illustrativeRatePct: wholesalePct,
          calculatedRoyalty: Number(((li.netSalesBase * wholesalePct) / 100).toFixed(2)),
        }));
        const total = updatedItems.reduce((acc, li) => acc + li.calculatedRoyalty, 0);
        return {
          ...st,
          assumedWholesaleRatePct: wholesalePct,
          lineItems: updatedItems,
          illustrativeRoyaltyTotal: Number(total.toFixed(2)),
        };
      })
    );
    pushActivity({
      category: 'Royalty',
      title: `Updated illustrative Amazon UK wholesale royalty assumption`,
      detail: `Set to ${wholesalePct}% Amazon UK Wholesale (non-contractual demo)`,
      actor: settings.activeReviewerName,
      targetSection: 'royalties',
    });
  };

  const toggleRoyaltyPaymentStatus = (statementId: string) => {
    const order: RoyaltyStatement['paymentStatus'][] = [
      'Draft Model',
      'Illustrative Scheduled',
      'Sample Settled',
    ];
    setRoyaltyStatements((prev) =>
      prev.map((st) => {
        if (st.id !== statementId) return st;
        const nextIdx = (order.indexOf(st.paymentStatus) + 1) % order.length;
        return { ...st, paymentStatus: order[nextIdx] };
      })
    );
  };

  const resetDemoState = () => {
    try {
      [
        'talents',
        'brands',
        'relationships',
        'discoveredProducts',
        'intlListings',
        'ukAssessments',
        'acquisitions',
        'brandStores',
        'products',
        'collections',
        'campaigns',
        'assets',
        'approvals',
        'purchaseOrders',
        'fulfilmentOrders',
        'inventory',
        'royaltyStatements',
        'activities',
        'settings',
      ].forEach((k) => window.localStorage.removeItem(`${STORAGE_PREFIX}${k}`));
    } catch {
      // ignore
    }
    setTalents(INITIAL_TALENTS);
    setBrands(INITIAL_BRANDS);
    setRelationships(INITIAL_RELATIONSHIPS);
    setDiscoveredProducts(INITIAL_DISCOVERED_PRODUCTS);
    setIntlListings(INITIAL_INTL_LISTINGS);
    setUkAssessments(INITIAL_UK_ASSESSMENTS);
    setAcquisitions(INITIAL_ACQUISITIONS);
    setBrandStores(INITIAL_BRAND_STORES);

    setProducts(INITIAL_PRODUCTS);
    setCollections(INITIAL_COLLECTIONS);
    setCampaigns(INITIAL_CAMPAIGNS);
    setAssets(INITIAL_ASSETS);
    setApprovals(INITIAL_APPROVALS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setFulfilmentOrders(INITIAL_FULFILMENT_ORDERS);
    setInventory(INITIAL_INVENTORY);
    setRoyaltyStatements(INITIAL_ROYALTY_STATEMENTS);
    setActivities(INITIAL_ACTIVITIES);
    setSettings(INITIAL_SETTINGS);
  };

  const metrics = useMemo(() => {
    const activeProductConcepts = products.length;
    const productsAwaitingApproval = products.filter(
      (p) => p.approvalStatus === 'Pending Review' || p.approvalStatus === 'Changes Requested'
    ).length;
    const campaignsInDevelopment = campaigns.filter((c) => c.status !== 'Paused').length;
    const pendingCreativeApprovals = approvals.filter(
      (a) =>
        (a.type === 'Campaign Creative' ||
          a.type === 'Brand Storefront' ||
          a.type === 'Marketing Material') &&
        (a.status === 'Pending Review' || a.status === 'Changes Requested')
    ).length;
    const demonstrationOrders = fulfilmentOrders.length;
    const demonstrationRevenue = royaltyStatements.reduce(
      (sum, st) => sum + st.launchWholesaleRevenue + st.replenishmentWholesaleRevenue,
      0
    );
    const estimatedTalentRoyalties = royaltyStatements.reduce(
      (sum, st) => sum + st.illustrativeRoyaltyTotal,
      0
    );
    const outstandingApprovals = approvals.filter(
      (a) => a.status === 'Pending Review' || a.status === 'Changes Requested'
    ).length;

    const approvedProducts = products.filter((p) => p.approvalStatus === 'Approved').length;
    const approvedApprovals = approvals.filter((a) => a.status === 'Approved').length;
    const totalCheckpoints = products.length + approvals.length + campaigns.length + brandStores.length;
    const completedCheckpoints =
      approvedProducts +
      approvedApprovals +
      campaigns.filter((c) => c.approvalStatus === 'Approved').length +
      brandStores.filter((s) => s.approvalStatus === 'Approved').length;
    const programmeCompletionPct =
      totalCheckpoints > 0 ? Math.round((completedCheckpoints / totalCheckpoints) * 100) : 0;

    return {
      activeProductConcepts,
      productsAwaitingApproval,
      campaignsInDevelopment,
      pendingCreativeApprovals,
      demonstrationOrders,
      demonstrationRevenue,
      estimatedTalentRoyalties,
      outstandingApprovals,
      programmeCompletionPct,
    };
  }, [products, campaigns, brandStores, approvals, fulfilmentOrders, royaltyStatements]);

  return (
    <CommerceContext.Provider
      value={{
        activeSection,
        setActiveSection,
        selectedTalentId,
        setSelectedTalentId,
        selectedBrandId,
        setSelectedBrandId,
        mockupPrefillAssetSrc,
        mockupTabRequestCount,
        openLiveMockupStudio,
        talents,
        brands,
        relationships,
        discoveredProducts,
        intlListings,
        ukAssessments,
        acquisitions,
        brandStores,
        talentScoresById,
        brandScoresById,
        productScoresById,
        intelligenceMetrics,
        addTalentAndDiscover,
        runPortfolioDiscovery,
        updateTalentPortrait,
        refreshTalentPortraitFromWiki,
        addResearchEvidence,
        updateUkAssessmentType,
        createAcquisitionWorkflow,
        advanceAcquisitionStage,
        toggleAcquisitionChecklist,
        createBrandStore,
        updateBrandStore,
        deleteBrandStore,
        submitBrandStoreForApproval,
        publishSimulatedBrandStore,
        products,
        collections,
        campaigns,
        assets,
        approvals,
        purchaseOrders,
        fulfilmentOrders,
        inventory,
        royaltyStatements,
        activities,
        settings,
        updateSettings,
        catalogProducts,
        promoteCatalogVariantToConcept,
        metrics,
        addProduct,
        updateProduct,
        deleteProduct,
        changeProductStage,
        submitProductForApproval,
        addCollection,
        updateCollection,
        deleteCollection,
        toggleProductInCollection,
        addCampaign,
        updateCampaignStatus,
        updateCampaignAmazonAds,
        submitCampaignForApproval,
        addGeneratedAsset,
        deleteAsset,
        decideApproval,
        addApprovalComment,
        createPurchaseOrder,
        advancePOStage,
        advanceOrderDelivery,
        updateInventoryUnits,
        updateRoyaltyRates,
        toggleRoyaltyPaymentStatus,
        resetDemoState,
      }}
    >
      {children}
    </CommerceContext.Provider>
  );
};

export const useCommerce = () => {
  const ctx = useContext(CommerceContext);
  if (!ctx) throw new Error('useCommerce must be used inside CommerceProvider');
  return ctx;
};
