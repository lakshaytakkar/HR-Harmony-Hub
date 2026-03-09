export const ETS_PIPELINE_STAGES = [
  "new-lead",
  "qualified",
  "token-paid",
  "store-design",
  "inventory-ordered",
  "in-transit",
  "launched",
  "reordering",
] as const;

export type EtsPipelineStage = (typeof ETS_PIPELINE_STAGES)[number];

export const ETS_STAGE_LABELS: Record<EtsPipelineStage, string> = {
  "new-lead": "New Lead",
  "qualified": "Qualified",
  "token-paid": "Token Paid",
  "store-design": "Store Design",
  "inventory-ordered": "Inventory Ordered",
  "in-transit": "In Transit",
  "launched": "Launched",
  "reordering": "Reordering",
};

export const ETS_ORDER_STATUSES = [
  "ordered",
  "factory-ready",
  "shipped",
  "customs",
  "warehouse",
  "dispatched",
] as const;

export type EtsOrderStatus = (typeof ETS_ORDER_STATUSES)[number];

export const ETS_ORDER_STATUS_LABELS: Record<EtsOrderStatus, string> = {
  ordered: "Ordered",
  "factory-ready": "Factory Ready",
  shipped: "Shipped",
  customs: "In Customs",
  warehouse: "Delhi Warehouse",
  dispatched: "Dispatched",
};

export const ETS_PRODUCT_CATEGORIES = [
  "toys",
  "kitchenware",
  "stationery",
  "decor",
  "bags",
  "household",
  "gifts",
] as const;

export type EtsProductCategory = (typeof ETS_PRODUCT_CATEGORIES)[number];

export const ETS_CATEGORY_DUTY_RATES: Record<EtsProductCategory, { duty: number; igst: number }> = {
  toys: { duty: 20, igst: 18 },
  kitchenware: { duty: 15, igst: 12 },
  stationery: { duty: 10, igst: 18 },
  decor: { duty: 20, igst: 18 },
  bags: { duty: 20, igst: 18 },
  household: { duty: 15, igst: 12 },
  gifts: { duty: 20, igst: 18 },
};

export type EtsPackageTier = "lite" | "pro" | "elite";

export const ETS_MRP_BANDS = [29, 49, 79, 99, 129, 149, 199, 249, 299, 399, 499, 599, 799, 999];

export interface EtsClient {
  id: string;
  name: string;
  city: string;
  phone: string;
  storeSize: number;
  packageTier: EtsPackageTier;
  stage: EtsPipelineStage;
  daysInStage: number;
  lastNote: string;
  totalPaid: number;
  pendingDues: number;
  score: number;
  leadSource: string;
  assignedTo: string;
  nextAction: string;
  nextActionDate: string;
  createdDate: string;
}

export interface EtsProduct {
  id: string;
  name: string;
  category: EtsProductCategory;
  exwPriceYuan: number;
  unitsPerCarton: number;
  cartonLength: number;
  cartonWidth: number;
  cartonHeight: number;
  dutyPercent: number;
  igstPercent: number;
  isVisible: boolean;
  isHeroSku: boolean;
  marginTier: "standard" | "premium" | "value";
}

export interface EtsOrderDocument {
  name: string;
  type: "packing-list" | "invoice" | "bill-of-lading" | "customs-declaration";
}

export interface EtsOrder {
  id: string;
  clientId: string;
  clientName: string;
  status: EtsOrderStatus;
  etaDays: number;
  valueInr: number;
  itemCount: number;
  createdDate: string;
  documents: EtsOrderDocument[];
  isFlagged: boolean;
}

export interface EtsPayment {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  type: "token" | "milestone" | "final";
  status: "received" | "pending" | "overdue";
  date: string;
  notes: string;
}

export interface EtsProposalBreakdownItem {
  item: string;
  amount: number;
  category: "interior" | "inventory" | "services" | "technology";
}

export interface EtsProposalTimeline {
  week: string;
  activity: string;
}

export interface EtsProposalTemplate {
  id: string;
  packageTier: EtsPackageTier;
  storeSize: number;
  totalInvestment: number;
  skuCount: number;
  categoryMix: Record<string, number>;
  investmentBreakdown: EtsProposalBreakdownItem[];
  timeline: EtsProposalTimeline[];
  inclusions: string[];
  exclusions: string[];
  paymentSchedule: { milestone: string; percent: number }[];
}

export interface EtsWhatsAppTemplate {
  id: string;
  title: string;
  content: string;
  category: "follow-up" | "proposal" | "update" | "welcome";
  variables: string[];
}

export interface EtsPriceSetting {
  key: string;
  value: number;
  label: string;
  unit: string;
}

export interface EtsPriceInputs {
  exwPriceYuan: number;
  unitsPerCarton: number;
  cartonLengthCm: number;
  cartonWidthCm: number;
  cartonHeightCm: number;
  categoryDutyPercent: number;
  categoryIgstPercent: number;
  exchangeRate: number;
  sourcingCommission: number;
  freightPerCbm: number;
  insurancePercent: number;
  swSurchargePercent: number;
  ourMarkupPercent: number;
  targetStoreMargin: number;
}

export interface EtsPriceResult {
  fobPriceYuan: number;
  fobPriceInr: number;
  cbmPerUnit: number;
  freightPerUnit: number;
  cifPriceInr: number;
  customsDuty: number;
  swSurcharge: number;
  igst: number;
  totalLandedCost: number;
  storeLandingPrice: number;
  suggestedMrp: number;
  storeMarginPercent: number;
  storeMarginRs: number;
  marginWarning: boolean;
}

function round2(n: number) { return Math.round(n * 100) / 100; }
function round4(n: number) { return Math.round(n * 10000) / 10000; }
function round1(n: number) { return Math.round(n * 10) / 10; }

export function calculateEtsPrices(inputs: EtsPriceInputs): EtsPriceResult {
  const fobYuan = inputs.exwPriceYuan * (1 + inputs.sourcingCommission / 100);
  const fobInr = fobYuan * inputs.exchangeRate;

  const cbmPerCarton = (inputs.cartonLengthCm * inputs.cartonWidthCm * inputs.cartonHeightCm) / 1000000;
  const cbmPerUnit = inputs.unitsPerCarton > 0 ? cbmPerCarton / inputs.unitsPerCarton : 0;
  const freightPerUnit = cbmPerUnit * inputs.freightPerCbm;

  const insuranceInr = fobInr * (inputs.insurancePercent / 100);
  const cifInr = fobInr + freightPerUnit + insuranceInr;

  const customsDuty = cifInr * (inputs.categoryDutyPercent / 100);
  const swSurcharge = customsDuty * (inputs.swSurchargePercent / 100);
  const assessableValue = cifInr + customsDuty + swSurcharge;
  const igst = assessableValue * (inputs.categoryIgstPercent / 100);

  const totalLandedCost = assessableValue + igst;
  const storeLandingPrice = totalLandedCost * (1 + inputs.ourMarkupPercent / 100);

  const targetMarginFraction = (inputs.targetStoreMargin || 35) / 100;
  let suggestedMrp = ETS_MRP_BANDS[ETS_MRP_BANDS.length - 1];
  for (const band of ETS_MRP_BANDS) {
    const margin = (band - storeLandingPrice) / band;
    if (band >= storeLandingPrice && margin >= targetMarginFraction) {
      suggestedMrp = band;
      break;
    }
  }

  const storeMarginRs = suggestedMrp - storeLandingPrice;
  const storeMarginPercent = suggestedMrp > 0 ? (storeMarginRs / suggestedMrp) * 100 : 0;

  return {
    fobPriceYuan: round2(fobYuan),
    fobPriceInr: round2(fobInr),
    cbmPerUnit: round4(cbmPerUnit),
    freightPerUnit: round2(freightPerUnit),
    cifPriceInr: round2(cifInr),
    customsDuty: round2(customsDuty),
    swSurcharge: round2(swSurcharge),
    igst: round2(igst),
    totalLandedCost: round2(totalLandedCost),
    storeLandingPrice: round2(storeLandingPrice),
    suggestedMrp,
    storeMarginPercent: round1(storeMarginPercent),
    storeMarginRs: round2(storeMarginRs),
    marginWarning: storeMarginPercent < (inputs.targetStoreMargin || 35),
  };
}

export const defaultPriceSettings: EtsPriceSetting[] = [
  { key: "exchange_rate", value: 12.0, label: "Exchange Rate", unit: "₹/¥" },
  { key: "sourcing_commission", value: 5, label: "Sourcing Commission", unit: "%" },
  { key: "freight_per_cbm", value: 8000, label: "Freight per CBM", unit: "₹" },
  { key: "insurance_percent", value: 0.5, label: "Insurance", unit: "%" },
  { key: "sw_surcharge_percent", value: 10, label: "SW Surcharge", unit: "%" },
  { key: "our_markup_percent", value: 25, label: "Our Markup", unit: "%" },
  { key: "target_store_margin", value: 50, label: "Target Store Margin", unit: "%" },
];

export function getDefaultPriceInputs(product: EtsProduct): EtsPriceInputs {
  return {
    exwPriceYuan: product.exwPriceYuan,
    unitsPerCarton: product.unitsPerCarton,
    cartonLengthCm: product.cartonLength,
    cartonWidthCm: product.cartonWidth,
    cartonHeightCm: product.cartonHeight,
    categoryDutyPercent: product.dutyPercent,
    categoryIgstPercent: product.igstPercent,
    exchangeRate: 12.0,
    sourcingCommission: 5,
    freightPerCbm: 8000,
    insurancePercent: 0.5,
    swSurchargePercent: 10,
    ourMarkupPercent: 25,
    targetStoreMargin: 50,
  };
}


export interface EtsCalcTemplate {
  id: string;
  name: string;
  category: EtsProductCategory;
  exwPriceYuan: number;
  unitsPerCarton: number;
  cartonLength: number;
  cartonWidth: number;
  cartonHeight: number;
}
