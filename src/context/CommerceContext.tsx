import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CATALOG_PRODUCTS, fetchLiveCatalogProducts } from '../data/catalogData';
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
  ActivityEvent,
  AmazonAdsConfig,
  ApprovalItem,
  ApprovalStatus,
  Campaign,
  CampaignStatus,
  CatalogBlankProduct,
  CatalogBlankVariant,
  Collection,
  CreativeAsset,
  DemoSettings,
  DevelopmentStage,
  FulfilmentOrder,
  FulfilmentStage,
  InventoryRecord,
  NavSectionId,
  POStage,
  ProductCategory,
  ProductConcept,
  PurchaseOrder,
  RoyaltyStatement,
} from '../types/commerce';

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

interface CommerceContextValue {
  activeSection: NavSectionId;
  setActiveSection: (section: NavSectionId) => void;
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

  // Deterministic White-Labeled Production Catalog
  catalogProducts: CatalogBlankProduct[];
  promoteCatalogVariantToConcept: (
    blank: CatalogBlankProduct,
    variant: CatalogBlankVariant,
    opts?: PromoteCatalogOptions
  ) => ProductConcept;

  // Derived synchronized metrics
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

  // Actions
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
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="#111111"/><rect x="32" y="32" width="736" height="536" fill="none" stroke="#27272A" stroke-width="2"/><path d="M40 520 L760 80" stroke="#BC1F2F" stroke-width="3" opacity="0.45"/><text x="64" y="100" fill="#BC1F2F" font-family="monospace" font-size="20" font-weight="bold">ISHOWSPEED · MANUAL CONCEPT</text><text x="64" y="310" fill="#FFFFFF" font-family="sans-serif" font-size="40" font-weight="800">${safe}</text><text x="64" y="355" fill="#A1A1AA" font-family="sans-serif" font-size="18">Attach artwork from Creative Assets or edit concept</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const STORAGE_PREFIX = 'caa_speed_poc_v4_';

function clearLegacyStorage(): void {
  try {
    [
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
    ].forEach((k) => window.localStorage.removeItem(`caa_speed_poc_v3_${k}`));
  } catch {
    // ignore
  }
}

function readPersisted<T>(key: string, fallback: T): T {
  clearLegacyStorage();
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writePersisted<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors cleanly so UI updates still succeed in memory.
  }
}

export const CommerceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSection, setActiveSection] = useState<NavSectionId>('dashboard');
  const [products, setProducts] = useState<ProductConcept[]>(() =>
    readPersisted('products', INITIAL_PRODUCTS)
  );
  const [collections, setCollections] = useState<Collection[]>(() =>
    readPersisted('collections', INITIAL_COLLECTIONS)
  );
  const [campaigns, setCampaigns] = useState<Campaign[]>(() =>
    readPersisted('campaigns', INITIAL_CAMPAIGNS)
  );
  const [assets, setAssets] = useState<CreativeAsset[]>(() =>
    readPersisted('assets', INITIAL_ASSETS)
  );
  const [approvals, setApprovals] = useState<ApprovalItem[]>(() =>
    readPersisted('approvals', INITIAL_APPROVALS)
  );
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() =>
    readPersisted('purchaseOrders', INITIAL_PURCHASE_ORDERS)
  );
  const [fulfilmentOrders, setFulfilmentOrders] = useState<FulfilmentOrder[]>(() =>
    readPersisted('fulfilmentOrders', INITIAL_FULFILMENT_ORDERS)
  );
  const [inventory, setInventory] = useState<InventoryRecord[]>(() =>
    readPersisted('inventory', INITIAL_INVENTORY)
  );
  const [royaltyStatements, setRoyaltyStatements] = useState<RoyaltyStatement[]>(() =>
    readPersisted('royaltyStatements', INITIAL_ROYALTY_STATEMENTS)
  );
  const [activities, setActivities] = useState<ActivityEvent[]>(() =>
    readPersisted('activities', INITIAL_ACTIVITIES)
  );
  const [settings, setSettings] = useState<DemoSettings>(() =>
    readPersisted('settings', INITIAL_SETTINGS)
  );

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
        // Show all live catalog blanks first alongside curated UK prototypes
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
        `iShowSpeed × ${blank.title} (${variant.color} / ${variant.size})`,
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
        description: `Review proposed product specification (${target.fabricSpec}), Amazon UK wholesale pricing (£${target.proposedWholesale.toFixed(2)}), and concept visual for iShowSpeed programme.`,
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
        input.positioning.trim() || 'Curated iShowSpeed capsule collection for Amazon UK.',
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
        (a.type === 'Campaign Creative' || a.type === 'Marketing Material') &&
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
    const totalCheckpoints = products.length + approvals.length + campaigns.length;
    const completedCheckpoints =
      approvedProducts +
      approvedApprovals +
      campaigns.filter((c) => c.approvalStatus === 'Approved').length;
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
  }, [products, campaigns, approvals, fulfilmentOrders, royaltyStatements]);

  return (
    <CommerceContext.Provider
      value={{
        activeSection,
        setActiveSection,
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
