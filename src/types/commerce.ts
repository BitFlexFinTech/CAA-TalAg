export type NavSectionId =
  | 'dashboard'
  | 'profile'
  | 'concepts'
  | 'development'
  | 'collections'
  | 'campaigns'
  | 'assets'
  | 'approvals'
  | 'purchase-orders'
  | 'fulfilment'
  | 'inventory'
  | 'royalties'
  | 'financials'
  | 'settings';

export type ProductCategory =
  | 'Graphic T-Shirts'
  | 'Hoodies'
  | 'Caps & Headwear'
  | 'Accessories'
  | 'Collectibles'
  | 'Lifestyle Merchandise';

export type DevelopmentStage =
  | 'Concept Draft'
  | 'Tech Pack'
  | 'Sampling'
  | 'Pre-Production'
  | 'Production Ready';

export type ApprovalStatus =
  | 'Draft'
  | 'Pending Review'
  | 'Approved'
  | 'Changes Requested'
  | 'Rejected';

// ---------------------------------------------------------------------------
// White-Labeled Production Catalog Types (Zero Third-Party POD Branding)
// ---------------------------------------------------------------------------
export type CatalogFilterGroup =
  | 'All'
  | 'T-Shirts'
  | 'Jerseys & Kits'
  | 'Hoodies & Fleece'
  | 'Caps & Headwear'
  | 'Accessories'
  | 'Collectibles & Prints'
  | 'Drinkware & Lifestyle';

export interface CatalogBlankVariant {
  id: string;
  productId: string;
  size: string;
  color: string;
  colorHex: string;
  image: string;
  singleUnitCostGBP: number;
  inStock: boolean;
  ukStatus: 'UK Hub In Stock' | 'UK Express Allocation';
}

export interface CatalogBlankProduct {
  id: string;
  liveProductId?: number;
  skuCode: string;
  title: string;
  brandSpec: string;
  typeName: string;
  filterGroup: Exclude<CatalogFilterGroup, 'All'>;
  category: ProductCategory;
  productionLine:
    | 'UK Apparel & Embroidery Hub'
    | 'UK All-Over-Print Matchday Line'
    | 'UK Archival Art & Collector Foundry'
    | 'UK Local Print & Drinkware Hub';
  image: string;
  description: string;
  fabricSummary: string;
  variantCount?: number;
  variants: CatalogBlankVariant[];
}

// ---------------------------------------------------------------------------
// Product Concepts (Configured for Amazon UK Vendor Central Wholesale)
// ---------------------------------------------------------------------------
export interface ProductConcept {
  id: string;
  sku: string;
  name: string;
  image: string;
  imageNote: string;
  description: string;
  category: ProductCategory;
  collectionId: string;
  developmentStage: DevelopmentStage;
  proposedCost: number;
  proposedRetail: number;
  proposedWholesale: number;
  approvalStatus: ApprovalStatus;
  fabricSpec: string;
  targetRelease: string;
  createdAt: string;
  updatedAt: string;
  catalogBlankId?: string;
  catalogVariantId?: string;
  productionLine?: string;
  selectedColor?: string;
  selectedColorHex?: string;
  selectedSize?: string;
  ukFulfilled?: boolean;
  amazonAsinDemo?: string;
}

export interface Collection {
  id: string;
  code: string;
  name: string;
  seasonWindow: string;
  positioning: string;
  status: 'Proposed Concept' | 'In Development' | 'Ready for Review';
  heroImage: string;
  heroCredit: string;
}

// ---------------------------------------------------------------------------
// Amazon UK Ads Structure & Campaigns (All 9 UK Ad Formats)
// ---------------------------------------------------------------------------
export type AmazonAdType =
  | 'Sponsored Products'
  | 'Sponsored Brands — Product Collection'
  | 'Sponsored Brands — Store Spotlight'
  | 'Sponsored Brands — Video'
  | 'Sponsored Display'
  | 'Sponsored TV'
  | 'Amazon DSP Display'
  | 'Brand Store & Posts'
  | 'Amazon Audio Ads';

export type AmazonTargetingType = 'AUTO' | 'MANUAL';
export type AmazonSponsoredBrandsFormat = 'PRODUCT_COLLECTION' | 'STORE_SPOTLIGHT' | 'VIDEO';
export type AmazonDisplaySize = '300x250' | '728x90' | '300x600' | '320x50';
export type AmazonDspSize = '970x250' | '300x250' | '320x50';

export interface AmazonAdsConfig {
  marketplaceId: string;
  marketplaceDomain: string;
  endpointHost: string;
  spApiSource: string;
  adType: AmazonAdType;
  targetingType: AmazonTargetingType;
  dailyBudgetGBP: number;
  biddingStrategy: 'LEGACY_FOR_SALES' | 'AUTO_FOR_SALES' | 'MANUAL';
  adGroupName: string;
  defaultBidGBP: number;
  headline: string;
  brandName: string;
  sbFormat?: AmazonSponsoredBrandsFormat;
  sdSize?: AmazonDisplaySize;
  dspSize?: AmazonDspSize;
  tvFormat?: '15s Streaming Spot' | '30s Prime Video Spot';
  audioLength?: '15s Alexa Spot' | '30s Amazon Music UK';
  storeSlug?: string;
  keywords: string[];
  advertisedAsins: string[];
  customMediaUrl?: string;
  customVideoUrl?: string;
}

export type CampaignStatus =
  | 'Concept Outline'
  | 'Creative in Progress'
  | 'Awaiting Approval'
  | 'Ready for Launch (Demo)'
  | 'Paused';

export interface Campaign {
  id: string;
  code: string;
  name: string;
  objective: string;
  associatedProductIds: string[];
  creativeAssetIds: string[];
  heroImage: string;
  heroCredit: string;
  status: CampaignStatus;
  proposedStartDate: string;
  proposedEndDate: string;
  approvalStatus: ApprovalStatus;
  channels: string[];
  illustrativeImpressions: number;
  illustrativeEstOrders: number;
  illustrativeEstRevenue: number;
  notes: string;
  amazonAds: AmazonAdsConfig;
}

export interface CreativeAsset {
  id: string;
  title: string;
  assetType:
    | 'Official Logos & Marks'
    | 'Apparel & Product Designs'
    | 'Social & Ad Banners'
    | 'Talent Photography'
    | 'Campaign Video Asset';
  mediaType?: 'image' | 'video' | 'audio';
  src: string;
  dimensions: string;
  licenseLabel: string;
  attribution: string;
  usageScope: string;
  linkedEntity: string;
  dateAdded: string;
}

export type ApprovalType =
  | 'Product Concept'
  | 'Product Design'
  | 'Campaign Creative'
  | 'Marketing Material'
  | 'Commercial Proposal';

export interface ApprovalComment {
  id: string;
  author: string;
  role: string;
  text: string;
  timestamp: string;
}

export interface ApprovalHistoryEntry {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  note?: string;
}

export interface ApprovalItem {
  id: string;
  reference: string;
  type: ApprovalType;
  title: string;
  description: string;
  submissionDate: string;
  submittedBy: string;
  linkedType: 'product' | 'campaign' | 'proposal';
  linkedId: string;
  linkedName: string;
  previewImage?: string;
  status: Exclude<ApprovalStatus, 'Draft'>;
  comments: ApprovalComment[];
  history: ApprovalHistoryEntry[];
}

export type POStage =
  | 'Draft PO'
  | 'Sample Approved'
  | 'Bulk Cutting'
  | 'Sewing & Finishing'
  | 'QC Inspection'
  | 'Ex-Factory Ready';

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  totalValue: number;
  illustrativeSupplier: string;
  supplierRegion: string;
  stage: POStage;
  targetExFactoryDate: string;
  notes: string;
}

export type FulfilmentStage =
  | 'Allocated (Demo)'
  | 'In Production'
  | 'Packed at 3PL'
  | 'Dispatched'
  | 'In Transit'
  | 'Delivered (Demo)';

export interface OrderTimelineStep {
  label: string;
  completed: boolean;
  timestamp: string;
  detail: string;
}

export interface FulfilmentOrder {
  id: string;
  orderNumber: string;
  channel: 'Amazon UK Vendor PO (SP-API)' | 'Wholesale Sample';
  customerLabel: string;
  region: string;
  productId: string;
  productName: string;
  quantity: number;
  orderValue: number;
  productionStage: POStage;
  dispatchStatus: 'Awaiting Stock' | 'Ready for Dispatch' | 'Dispatched' | 'Completed';
  deliveryStatus: FulfilmentStage;
  createdAt: string;
  timeline: OrderTimelineStep[];
}

export interface InventoryRecord {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  category: ProductCategory;
  sampleUnits: number;
  proposedInitialRun: number;
  allocatedDemoUnits: number;
  availableBuffer: number;
  reorderPoint: number;
  hubLocation: string;
  readinessStatus: 'Sample Only' | 'Pre-Allocation Ready' | 'Low Sample Buffer';
}

export interface RoyaltyLineItem {
  productId: string;
  sku: string;
  productName: string;
  channel: 'Amazon UK Launch PO (SP-API)' | 'Amazon UK Replenishment PO (SP-API)';
  units: number;
  grossRevenue: number;
  netSalesBase: number;
  illustrativeRatePct: number;
  calculatedRoyalty: number;
}

export interface RoyaltyStatement {
  id: string;
  statementRef: string;
  period: string;
  periodStart: string;
  periodEnd: string;
  launchWholesaleRevenue: number;
  replenishmentWholesaleRevenue: number;
  assumedWholesaleRatePct: number;
  illustrativeRoyaltyTotal: number;
  paymentStatus: 'Draft Model' | 'Illustrative Scheduled' | 'Sample Settled';
  notes: string;
  lineItems: RoyaltyLineItem[];
}

export interface ActivityEvent {
  id: string;
  category: 'Product' | 'Campaign' | 'Approval' | 'Order' | 'Royalty';
  title: string;
  detail: string;
  actor: string;
  timestamp: string;
  targetSection?: NavSectionId;
}

export interface DemoSettings {
  activeReviewerName: string;
  activeReviewerRole: 'CAA Talent Agent' | 'Mercenta Operations Lead' | 'Talent Brand Representative';
  defaultWholesaleRoyaltyPct: number;
  illustrativeDeductionPct: number;
  showWatermarkNotice: boolean;
}
