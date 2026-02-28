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

export const etsClients: EtsClient[] = [
  { id: "ETC-001", name: "Rajesh Kumar", city: "Delhi", phone: "+91 98110 45678", storeSize: 1200, packageTier: "pro", stage: "launched", daysInStage: 15, lastNote: "Store launched successfully, first week sales ₹1.2L", totalPaid: 850000, pendingDues: 0, score: 92, leadSource: "Referral", assignedTo: "Amit S.", nextAction: "Follow-up on reorder", nextActionDate: "2026-03-05", createdDate: "2025-10-15" },
  { id: "ETC-002", name: "Priya Sharma", city: "Jaipur", phone: "+91 99290 12345", storeSize: 800, packageTier: "lite", stage: "in-transit", daysInStage: 8, lastNote: "Container shipped from Yiwu, ETA 22 days", totalPaid: 300000, pendingDues: 150000, score: 78, leadSource: "Website", assignedTo: "Rahul M.", nextAction: "Share tracking details", nextActionDate: "2026-03-01", createdDate: "2025-11-20" },
  { id: "ETC-003", name: "Vikram Patel", city: "Ahmedabad", phone: "+91 97120 67890", storeSize: 1500, packageTier: "elite", stage: "inventory-ordered", daysInStage: 12, lastNote: "Inventory confirmed with factory, production started", totalPaid: 600000, pendingDues: 600000, score: 85, leadSource: "Exhibition", assignedTo: "Amit S.", nextAction: "Factory production update", nextActionDate: "2026-02-28", createdDate: "2025-11-05" },
  { id: "ETC-004", name: "Sneha Reddy", city: "Hyderabad", phone: "+91 90100 34567", storeSize: 1000, packageTier: "pro", stage: "store-design", daysInStage: 5, lastNote: "Interior layout approved, contractor starting next week", totalPaid: 400000, pendingDues: 400000, score: 80, leadSource: "Instagram", assignedTo: "Priya K.", nextAction: "Share 3D store render", nextActionDate: "2026-03-02", createdDate: "2025-12-01" },
  { id: "ETC-005", name: "Arjun Singh", city: "Lucknow", phone: "+91 94150 89012", storeSize: 600, packageTier: "lite", stage: "token-paid", daysInStage: 3, lastNote: "Token ₹50K received, starting onboarding", totalPaid: 50000, pendingDues: 350000, score: 72, leadSource: "WhatsApp", assignedTo: "Rahul M.", nextAction: "Schedule onboarding call", nextActionDate: "2026-02-27", createdDate: "2026-01-10" },
  { id: "ETC-006", name: "Meera Agarwal", city: "Pune", phone: "+91 98900 56789", storeSize: 900, packageTier: "pro", stage: "qualified", daysInStage: 7, lastNote: "Very interested, asking about ROI projections", totalPaid: 0, pendingDues: 0, score: 65, leadSource: "Referral", assignedTo: "Amit S.", nextAction: "Send proposal PDF", nextActionDate: "2026-02-26", createdDate: "2026-01-25" },
  { id: "ETC-007", name: "Karan Mehta", city: "Mumbai", phone: "+91 98210 23456", storeSize: 2000, packageTier: "elite", stage: "new-lead", daysInStage: 2, lastNote: "Inbound from website, wants 2000 sqft flagship store", totalPaid: 0, pendingDues: 0, score: 45, leadSource: "Website", assignedTo: "Priya K.", nextAction: "Discovery call", nextActionDate: "2026-02-28", createdDate: "2026-02-24" },
  { id: "ETC-008", name: "Deepa Nair", city: "Kochi", phone: "+91 94950 78901", storeSize: 700, packageTier: "lite", stage: "launched", daysInStage: 30, lastNote: "Running well, considering category expansion", totalPaid: 400000, pendingDues: 0, score: 88, leadSource: "Exhibition", assignedTo: "Rahul M.", nextAction: "Propose reorder package", nextActionDate: "2026-03-10", createdDate: "2025-09-20" },
  { id: "ETC-009", name: "Rohan Gupta", city: "Chandigarh", phone: "+91 98720 45678", storeSize: 1100, packageTier: "pro", stage: "new-lead", daysInStage: 5, lastNote: "Called twice, interested but comparing with competitors", totalPaid: 0, pendingDues: 0, score: 38, leadSource: "Google Ads", assignedTo: "Amit S.", nextAction: "Send competitor comparison", nextActionDate: "2026-02-27", createdDate: "2026-02-20" },
  { id: "ETC-010", name: "Anita Desai", city: "Indore", phone: "+91 98260 12345", storeSize: 850, packageTier: "pro", stage: "qualified", daysInStage: 4, lastNote: "Visited our Ahmedabad store, very impressed", totalPaid: 0, pendingDues: 0, score: 70, leadSource: "Store Visit", assignedTo: "Priya K.", nextAction: "Finalize package selection", nextActionDate: "2026-02-28", createdDate: "2026-02-10" },
  { id: "ETC-011", name: "Suresh Yadav", city: "Patna", phone: "+91 98350 67890", storeSize: 500, packageTier: "lite", stage: "token-paid", daysInStage: 8, lastNote: "Token paid, waiting for store location finalization", totalPaid: 50000, pendingDues: 300000, score: 60, leadSource: "WhatsApp", assignedTo: "Rahul M.", nextAction: "Confirm store address", nextActionDate: "2026-02-26", createdDate: "2026-01-15" },
  { id: "ETC-012", name: "Nisha Bansal", city: "Nagpur", phone: "+91 97640 34567", storeSize: 1000, packageTier: "pro", stage: "reordering", daysInStage: 10, lastNote: "Second order — focusing on toys and stationery", totalPaid: 900000, pendingDues: 200000, score: 95, leadSource: "Referral", assignedTo: "Amit S.", nextAction: "Confirm reorder product list", nextActionDate: "2026-03-01", createdDate: "2025-08-10" },
  { id: "ETC-013", name: "Manoj Tiwari", city: "Bhopal", phone: "+91 98930 89012", storeSize: 750, packageTier: "lite", stage: "store-design", daysInStage: 15, lastNote: "Delayed — landlord renovation issues, need to follow up", totalPaid: 200000, pendingDues: 200000, score: 55, leadSource: "Instagram", assignedTo: "Priya K.", nextAction: "Check renovation status", nextActionDate: "2026-02-25", createdDate: "2025-12-20" },
  { id: "ETC-014", name: "Kavita Joshi", city: "Surat", phone: "+91 97250 56789", storeSize: 1300, packageTier: "elite", stage: "in-transit", daysInStage: 18, lastNote: "Shipment delayed at port, customs hold", totalPaid: 700000, pendingDues: 500000, score: 82, leadSource: "Exhibition", assignedTo: "Amit S.", nextAction: "Escalate customs clearance", nextActionDate: "2026-02-26", createdDate: "2025-10-25" },
  { id: "ETC-015", name: "Aditya Saxena", city: "Noida", phone: "+91 98180 23456", storeSize: 900, packageTier: "pro", stage: "qualified", daysInStage: 12, lastNote: "Needs financing options, exploring bank loan", totalPaid: 0, pendingDues: 0, score: 50, leadSource: "Google Ads", assignedTo: "Rahul M.", nextAction: "Share financing partners", nextActionDate: "2026-03-03", createdDate: "2026-02-05" },
];

export const etsProducts: EtsProduct[] = [
  { id: "ETP-001", name: "Building Blocks Set (120pc)", category: "toys", exwPriceYuan: 15, unitsPerCarton: 24, cartonLength: 60, cartonWidth: 40, cartonHeight: 50, dutyPercent: 20, igstPercent: 18, isVisible: true, isHeroSku: true, marginTier: "premium" },
  { id: "ETP-002", name: "Stacking Rings Rainbow", category: "toys", exwPriceYuan: 5, unitsPerCarton: 48, cartonLength: 50, cartonWidth: 40, cartonHeight: 40, dutyPercent: 20, igstPercent: 18, isVisible: true, isHeroSku: false, marginTier: "value" },
  { id: "ETP-003", name: "Mini RC Car", category: "toys", exwPriceYuan: 25, unitsPerCarton: 12, cartonLength: 55, cartonWidth: 35, cartonHeight: 30, dutyPercent: 20, igstPercent: 18, isVisible: true, isHeroSku: true, marginTier: "standard" },
  { id: "ETP-004", name: "Stainless Steel Lunch Box 3-Tier", category: "kitchenware", exwPriceYuan: 18, unitsPerCarton: 20, cartonLength: 50, cartonWidth: 40, cartonHeight: 45, dutyPercent: 15, igstPercent: 12, isVisible: true, isHeroSku: true, marginTier: "premium" },
  { id: "ETP-005", name: "Silicone Spatula Set (5pc)", category: "kitchenware", exwPriceYuan: 8, unitsPerCarton: 36, cartonLength: 45, cartonWidth: 35, cartonHeight: 30, dutyPercent: 15, igstPercent: 12, isVisible: true, isHeroSku: false, marginTier: "standard" },
  { id: "ETP-006", name: "Non-stick Kadai 24cm", category: "kitchenware", exwPriceYuan: 22, unitsPerCarton: 12, cartonLength: 55, cartonWidth: 55, cartonHeight: 35, dutyPercent: 15, igstPercent: 12, isVisible: true, isHeroSku: false, marginTier: "premium" },
  { id: "ETP-007", name: "Gel Pen Set (12pc)", category: "stationery", exwPriceYuan: 3, unitsPerCarton: 100, cartonLength: 40, cartonWidth: 30, cartonHeight: 25, dutyPercent: 10, igstPercent: 18, isVisible: true, isHeroSku: false, marginTier: "value" },
  { id: "ETP-008", name: "A4 Notebook Premium (5-pack)", category: "stationery", exwPriceYuan: 6, unitsPerCarton: 50, cartonLength: 45, cartonWidth: 35, cartonHeight: 40, dutyPercent: 10, igstPercent: 18, isVisible: true, isHeroSku: true, marginTier: "standard" },
  { id: "ETP-009", name: "Art Supplies Kit (36pc)", category: "stationery", exwPriceYuan: 12, unitsPerCarton: 30, cartonLength: 50, cartonWidth: 35, cartonHeight: 25, dutyPercent: 10, igstPercent: 18, isVisible: true, isHeroSku: false, marginTier: "standard" },
  { id: "ETP-010", name: "LED Fairy Lights 10m", category: "decor", exwPriceYuan: 8, unitsPerCarton: 40, cartonLength: 45, cartonWidth: 35, cartonHeight: 35, dutyPercent: 20, igstPercent: 18, isVisible: true, isHeroSku: true, marginTier: "premium" },
  { id: "ETP-011", name: "Artificial Flower Bunch (6pc)", category: "decor", exwPriceYuan: 4, unitsPerCarton: 60, cartonLength: 50, cartonWidth: 30, cartonHeight: 30, dutyPercent: 20, igstPercent: 18, isVisible: true, isHeroSku: false, marginTier: "value" },
  { id: "ETP-012", name: "Wall Clock Modern 12in", category: "decor", exwPriceYuan: 20, unitsPerCarton: 10, cartonLength: 45, cartonWidth: 45, cartonHeight: 40, dutyPercent: 20, igstPercent: 18, isVisible: false, isHeroSku: false, marginTier: "standard" },
  { id: "ETP-013", name: "Canvas Tote Bag Printed", category: "bags", exwPriceYuan: 6, unitsPerCarton: 50, cartonLength: 55, cartonWidth: 40, cartonHeight: 30, dutyPercent: 20, igstPercent: 18, isVisible: true, isHeroSku: false, marginTier: "standard" },
  { id: "ETP-014", name: "Kids School Backpack", category: "bags", exwPriceYuan: 15, unitsPerCarton: 20, cartonLength: 55, cartonWidth: 45, cartonHeight: 50, dutyPercent: 20, igstPercent: 18, isVisible: true, isHeroSku: true, marginTier: "premium" },
  { id: "ETP-015", name: "Microfiber Cleaning Cloth (10pc)", category: "household", exwPriceYuan: 4, unitsPerCarton: 80, cartonLength: 40, cartonWidth: 30, cartonHeight: 25, dutyPercent: 15, igstPercent: 12, isVisible: true, isHeroSku: false, marginTier: "value" },
  { id: "ETP-016", name: "Plastic Storage Containers (5pc)", category: "household", exwPriceYuan: 10, unitsPerCarton: 24, cartonLength: 50, cartonWidth: 40, cartonHeight: 35, dutyPercent: 15, igstPercent: 12, isVisible: true, isHeroSku: false, marginTier: "standard" },
  { id: "ETP-017", name: "Bathroom Organizer Rack", category: "household", exwPriceYuan: 14, unitsPerCarton: 16, cartonLength: 50, cartonWidth: 40, cartonHeight: 40, dutyPercent: 15, igstPercent: 12, isVisible: true, isHeroSku: false, marginTier: "standard" },
  { id: "ETP-018", name: "Ceramic Mug Gift Set (2pc)", category: "gifts", exwPriceYuan: 10, unitsPerCarton: 24, cartonLength: 50, cartonWidth: 35, cartonHeight: 30, dutyPercent: 20, igstPercent: 18, isVisible: true, isHeroSku: true, marginTier: "premium" },
  { id: "ETP-019", name: "Photo Frame Collage 6-in-1", category: "gifts", exwPriceYuan: 16, unitsPerCarton: 15, cartonLength: 55, cartonWidth: 45, cartonHeight: 25, dutyPercent: 20, igstPercent: 18, isVisible: true, isHeroSku: false, marginTier: "standard" },
  { id: "ETP-020", name: "Desk Organizer Wooden", category: "gifts", exwPriceYuan: 12, unitsPerCarton: 20, cartonLength: 45, cartonWidth: 35, cartonHeight: 30, dutyPercent: 20, igstPercent: 18, isVisible: false, isHeroSku: false, marginTier: "standard" },
];

export const etsOrders: EtsOrder[] = [
  { id: "ETO-001", clientId: "ETC-002", clientName: "Priya Sharma", status: "shipped", etaDays: 22, valueInr: 320000, itemCount: 45, createdDate: "2026-01-15", documents: [{ name: "Packing List - Priya.pdf", type: "packing-list" }, { name: "Commercial Invoice CI-2026-001.pdf", type: "invoice" }, { name: "BL-YIWU-NHAVA-0215.pdf", type: "bill-of-lading" }], isFlagged: false },
  { id: "ETO-002", clientId: "ETC-003", clientName: "Vikram Patel", status: "ordered", etaDays: 45, valueInr: 580000, itemCount: 120, createdDate: "2026-02-10", documents: [{ name: "Proforma Invoice PI-2026-008.pdf", type: "invoice" }], isFlagged: false },
  { id: "ETO-003", clientId: "ETC-014", clientName: "Kavita Joshi", status: "customs", etaDays: 5, valueInr: 450000, itemCount: 85, createdDate: "2025-12-20", documents: [{ name: "Packing List - Kavita.pdf", type: "packing-list" }, { name: "Invoice CI-2025-045.pdf", type: "invoice" }, { name: "BL-YIWU-MUNDRA-1220.pdf", type: "bill-of-lading" }, { name: "Customs Declaration CD-2026-003.pdf", type: "customs-declaration" }], isFlagged: true },
  { id: "ETO-004", clientId: "ETC-001", clientName: "Rajesh Kumar", status: "dispatched", etaDays: 0, valueInr: 420000, itemCount: 90, createdDate: "2025-11-10", documents: [{ name: "Packing List - Rajesh.pdf", type: "packing-list" }, { name: "Invoice CI-2025-032.pdf", type: "invoice" }, { name: "BL-YIWU-NHAVA-1110.pdf", type: "bill-of-lading" }], isFlagged: false },
  { id: "ETO-005", clientId: "ETC-012", clientName: "Nisha Bansal", status: "factory-ready", etaDays: 38, valueInr: 280000, itemCount: 60, createdDate: "2026-02-15", documents: [{ name: "Proforma Invoice PI-2026-012.pdf", type: "invoice" }], isFlagged: false },
  { id: "ETO-006", clientId: "ETC-008", clientName: "Deepa Nair", status: "dispatched", etaDays: 0, valueInr: 250000, itemCount: 55, createdDate: "2025-10-05", documents: [{ name: "Packing List - Deepa.pdf", type: "packing-list" }, { name: "Invoice CI-2025-028.pdf", type: "invoice" }], isFlagged: false },
  { id: "ETO-007", clientId: "ETC-004", clientName: "Sneha Reddy", status: "ordered", etaDays: 50, valueInr: 380000, itemCount: 75, createdDate: "2026-02-20", documents: [], isFlagged: false },
  { id: "ETO-008", clientId: "ETC-014", clientName: "Kavita Joshi", status: "warehouse", etaDays: 2, valueInr: 150000, itemCount: 30, createdDate: "2025-11-25", documents: [{ name: "Packing List - Kavita-2.pdf", type: "packing-list" }, { name: "Invoice CI-2025-040.pdf", type: "invoice" }], isFlagged: false },
];

export const etsPayments: EtsPayment[] = [
  { id: "EPY-001", clientId: "ETC-001", clientName: "Rajesh Kumar", amount: 100000, type: "token", status: "received", date: "2025-10-20", notes: "Initial token payment" },
  { id: "EPY-002", clientId: "ETC-001", clientName: "Rajesh Kumar", amount: 350000, type: "milestone", status: "received", date: "2025-11-15", notes: "Inventory order confirmation" },
  { id: "EPY-003", clientId: "ETC-001", clientName: "Rajesh Kumar", amount: 400000, type: "final", status: "received", date: "2025-12-28", notes: "Final payment before launch" },
  { id: "EPY-004", clientId: "ETC-002", clientName: "Priya Sharma", amount: 50000, type: "token", status: "received", date: "2025-12-01", notes: "Token for Lite package" },
  { id: "EPY-005", clientId: "ETC-002", clientName: "Priya Sharma", amount: 250000, type: "milestone", status: "received", date: "2026-01-10", notes: "Inventory payment" },
  { id: "EPY-006", clientId: "ETC-002", clientName: "Priya Sharma", amount: 150000, type: "final", status: "pending", date: "2026-03-15", notes: "Due on delivery" },
  { id: "EPY-007", clientId: "ETC-003", clientName: "Vikram Patel", amount: 200000, type: "token", status: "received", date: "2025-11-10", notes: "Elite package token" },
  { id: "EPY-008", clientId: "ETC-003", clientName: "Vikram Patel", amount: 400000, type: "milestone", status: "received", date: "2026-01-20", notes: "First milestone — design approval" },
  { id: "EPY-009", clientId: "ETC-003", clientName: "Vikram Patel", amount: 600000, type: "final", status: "pending", date: "2026-04-01", notes: "Final due on launch" },
  { id: "EPY-010", clientId: "ETC-005", clientName: "Arjun Singh", amount: 50000, type: "token", status: "received", date: "2026-02-22", notes: "Lite package token" },
  { id: "EPY-011", clientId: "ETC-011", clientName: "Suresh Yadav", amount: 50000, type: "token", status: "received", date: "2026-02-15", notes: "Token received" },
  { id: "EPY-012", clientId: "ETC-014", clientName: "Kavita Joshi", amount: 500000, type: "milestone", status: "overdue", date: "2026-02-10", notes: "Overdue — customs delay affecting payment schedule" },
];

export const etsProposalTemplates: EtsProposalTemplate[] = [
  {
    id: "EPT-001",
    packageTier: "lite",
    storeSize: 600,
    totalInvestment: 450000,
    skuCount: 200,
    categoryMix: { toys: 30, kitchenware: 25, stationery: 20, household: 15, gifts: 10 },
    investmentBreakdown: [
      { item: "Interior Kit (Basic)", amount: 80000, category: "interior" },
      { item: "Signage & Branding", amount: 25000, category: "interior" },
      { item: "Product Inventory (200 SKUs)", amount: 250000, category: "inventory" },
      { item: "POS System Setup", amount: 15000, category: "technology" },
      { item: "Store Launch Marketing", amount: 30000, category: "services" },
      { item: "Training & Onboarding", amount: 20000, category: "services" },
      { item: "30-Day Support Package", amount: 30000, category: "services" },
    ],
    timeline: [
      { week: "Week 1-2", activity: "Store Design & Layout Planning" },
      { week: "Week 2-3", activity: "Interior Work & Branding Installation" },
      { week: "Week 2-4", activity: "Inventory Sourcing & Ordering" },
      { week: "Week 4-5", activity: "Shipping & Logistics" },
      { week: "Week 5-6", activity: "Store Setup & Merchandising" },
      { week: "Week 6", activity: "Grand Opening & Launch" },
    ],
    inclusions: ["Basic interior design & layout", "200+ curated SKUs", "Branded signage", "POS billing system", "Launch day marketing", "Staff training (2 days)", "30-day post-launch support", "WhatsApp support group"],
    exclusions: ["Rent & deposit", "Staff salaries", "Electricity & utilities", "Business registration / GST", "Ongoing marketing after launch", "Additional inventory beyond initial order"],
    paymentSchedule: [{ milestone: "Token (Booking)", percent: 20 }, { milestone: "Design Approval", percent: 30 }, { milestone: "Inventory Confirmation", percent: 30 }, { milestone: "Store Launch", percent: 20 }],
  },
  {
    id: "EPT-002",
    packageTier: "pro",
    storeSize: 1000,
    totalInvestment: 850000,
    skuCount: 400,
    categoryMix: { toys: 25, kitchenware: 20, stationery: 15, decor: 15, bags: 10, household: 10, gifts: 5 },
    investmentBreakdown: [
      { item: "Interior Kit (Premium)", amount: 150000, category: "interior" },
      { item: "Signage, Branding & Display Units", amount: 50000, category: "interior" },
      { item: "Product Inventory (400 SKUs)", amount: 450000, category: "inventory" },
      { item: "POS System + Inventory Software", amount: 30000, category: "technology" },
      { item: "Digital Marketing Launch (Social + Local)", amount: 50000, category: "services" },
      { item: "Training & Onboarding (4 days)", amount: 40000, category: "services" },
      { item: "60-Day Support Package", amount: 50000, category: "services" },
      { item: "Category Planogram Design", amount: 30000, category: "services" },
    ],
    timeline: [
      { week: "Week 1-2", activity: "Store Design, 3D Renders & Approval" },
      { week: "Week 2-3", activity: "Interior Construction & Branding" },
      { week: "Week 2-4", activity: "Inventory Curation & Factory Orders" },
      { week: "Week 4-6", activity: "Shipping, Customs & Delivery" },
      { week: "Week 6-7", activity: "Store Setup, Merchandising & POS" },
      { week: "Week 7", activity: "Staff Training & Soft Launch" },
      { week: "Week 7-8", activity: "Grand Opening Event" },
    ],
    inclusions: ["Premium interior design with 3D renders", "400+ curated SKUs across 7 categories", "Premium branding & display units", "POS + inventory management software", "Social media + local marketing campaign", "Staff training (4 days)", "60-day post-launch support", "Category planogram & visual merchandising", "Dedicated account manager"],
    exclusions: ["Rent & deposit", "Staff salaries", "Electricity & utilities", "Business registration / GST", "Ongoing marketing after 60 days", "Additional inventory reorders", "Store insurance"],
    paymentSchedule: [{ milestone: "Token (Booking)", percent: 20 }, { milestone: "Design Approval", percent: 30 }, { milestone: "Inventory Confirmation", percent: 30 }, { milestone: "Store Launch", percent: 20 }],
  },
  {
    id: "EPT-003",
    packageTier: "elite",
    storeSize: 1500,
    totalInvestment: 1500000,
    skuCount: 600,
    categoryMix: { toys: 20, kitchenware: 18, stationery: 12, decor: 15, bags: 12, household: 13, gifts: 10 },
    investmentBreakdown: [
      { item: "Interior Kit (Flagship Grade)", amount: 300000, category: "interior" },
      { item: "Premium Signage, LED Displays & Fixtures", amount: 100000, category: "interior" },
      { item: "Product Inventory (600+ SKUs)", amount: 700000, category: "inventory" },
      { item: "POS + Inventory + CRM Software Suite", amount: 50000, category: "technology" },
      { item: "Full Digital + Offline Launch Campaign", amount: 100000, category: "services" },
      { item: "Comprehensive Training (7 days)", amount: 60000, category: "services" },
      { item: "90-Day Premium Support", amount: 80000, category: "services" },
      { item: "Store Photography & Social Setup", amount: 40000, category: "services" },
      { item: "Quarterly Business Review (1st Year)", amount: 70000, category: "services" },
    ],
    timeline: [
      { week: "Week 1-2", activity: "Store Design, 3D Renders & Walk-through" },
      { week: "Week 2-4", activity: "Flagship Interior Build-out" },
      { week: "Week 2-5", activity: "Inventory Curation, Sampling & Bulk Orders" },
      { week: "Week 5-7", activity: "Shipping, Customs & Warehousing" },
      { week: "Week 7-8", activity: "Full Store Setup & Visual Merchandising" },
      { week: "Week 8", activity: "Staff Training & Tech Setup" },
      { week: "Week 8-9", activity: "Soft Launch & VIP Preview" },
      { week: "Week 9", activity: "Grand Opening Celebration" },
    ],
    inclusions: ["Flagship-grade interior design with full walk-through", "600+ curated SKUs across all categories", "Premium LED displays & custom fixtures", "Full software suite (POS + Inventory + CRM)", "Comprehensive digital + offline launch campaign", "Professional store photography", "Social media account setup & first month content", "Staff training (7 days intensive)", "90-day premium support with weekly calls", "Quarterly business reviews for first year", "Priority access to new products & restocking", "Dedicated senior account manager"],
    exclusions: ["Rent & deposit", "Staff salaries & HR", "Electricity & utilities", "Business registration / GST / Legal", "Ongoing marketing after launch campaign", "Store insurance", "Maintenance & repairs"],
    paymentSchedule: [{ milestone: "Token (Booking)", percent: 15 }, { milestone: "Design Approval", percent: 25 }, { milestone: "Inventory Confirmation", percent: 30 }, { milestone: "Pre-Launch Setup", percent: 20 }, { milestone: "Grand Opening", percent: 10 }],
  },
];

export const etsWhatsAppTemplates: EtsWhatsAppTemplate[] = [
  { id: "EWT-001", title: "Welcome New Lead", content: "🙏 Namaste {name} ji!\n\nThank you for your interest in *Eazy to Sell*! 🏪\n\nWe help entrepreneurs like you launch profitable retail stores with *zero experience needed*.\n\n✅ Curated products from China\n✅ Complete store setup\n✅ Training & support\n\nWould you like to schedule a quick 15-min call to discuss your store plan?\n\n— Team EazyToSell", category: "welcome", variables: ["name"] },
  { id: "EWT-002", title: "Proposal Follow-up", content: "Hi {name} ji! 👋\n\nJust following up on the *{package}* package proposal we shared.\n\n💰 Total Investment: ₹{amount}\n📦 {skuCount}+ products across {categories} categories\n🏪 Store size: {storeSize} sq ft\n\nWould you like to visit one of our existing stores? Happy to arrange!\n\nReply with any questions 🙏", category: "follow-up", variables: ["name", "package", "amount", "skuCount", "categories", "storeSize"] },
  { id: "EWT-003", title: "Token Payment Received", content: "🎉 Great news, {name} ji!\n\nWe've received your token payment of ₹{amount}. Your journey to becoming a store owner begins NOW!\n\n📋 *Next Steps:*\n1️⃣ Store location finalization\n2️⃣ Interior design consultation\n3️⃣ Product category selection\n\nYour account manager *{manager}* will call you within 24 hours.\n\nWelcome to the EazyToSell family! 🏪✨", category: "update", variables: ["name", "amount", "manager"] },
  { id: "EWT-004", title: "Shipment Update", content: "📦 Shipping Update for {name} ji!\n\n*Order #{orderId}*\n🚢 Status: {status}\n📍 Current Location: {location}\n📅 Expected Arrival: {eta}\n\nItems: {itemCount} products\nValue: ₹{value}\n\nWe'll keep you updated at every step! 🙏", category: "update", variables: ["name", "orderId", "status", "location", "eta", "itemCount", "value"] },
  { id: "EWT-005", title: "Store Launch Congrats", content: "🎊🎊🎊 CONGRATULATIONS {name} ji! 🎊🎊🎊\n\nYour *{storeName}* store is officially LIVE! 🏪🚀\n\n📍 Location: {city}\n📦 Products: {skuCount}+ SKUs ready to sell\n\n*First Week Tips:*\n✅ Focus on walk-in experience\n✅ Keep hero products at eye level\n✅ Take photos for social media!\n\nYour support team is here 24/7 for the next 30 days.\n\nHere's to your success! 🥂💪", category: "update", variables: ["name", "storeName", "city", "skuCount"] },
  { id: "EWT-006", title: "Payment Reminder (Gentle)", content: "Hi {name} ji 🙏\n\nGentle reminder about the pending payment:\n\n💳 *Milestone:* {milestone}\n💰 *Amount:* ₹{amount}\n📅 *Due Date:* {dueDate}\n\nYou can pay via UPI/NEFT/cheque.\n\nPlease let us know once done, or reach out if you need any help with the payment plan.\n\nThank you! 🙏", category: "follow-up", variables: ["name", "milestone", "amount", "dueDate"] },
  { id: "EWT-007", title: "Reorder Suggestion", content: "Hi {name} ji! 👋\n\nHope your store is running great! 📈\n\nBased on your bestsellers, here's what we recommend for *reorder:*\n\n🔥 Top sellers running low:\n{topProducts}\n\n📦 Suggested reorder value: ₹{amount}\n🚢 Delivery estimate: 30-35 days\n\nShall we start preparing the order? 🏪", category: "proposal", variables: ["name", "topProducts", "amount"] },
  { id: "EWT-008", title: "Investment Breakdown (Quick)", content: "Hi {name} ji! Here's a quick breakdown:\n\n🏪 *{package} Package — {storeSize} sq ft*\n\n💰 *Investment Summary:*\n🔨 Interior & Branding: ₹{interior}\n📦 Product Inventory: ₹{inventory}\n🛠 Services & Support: ₹{services}\n💻 Technology: ₹{tech}\n\n*Total: ₹{total}*\n\n📋 *Payment Plan:*\n• Token (20%): ₹{token}\n• On design approval (30%): ₹{design}\n• On inventory confirm (30%): ₹{invConfirm}\n• At launch (20%): ₹{launch}\n\nShall we proceed? 🙏", category: "proposal", variables: ["name", "package", "storeSize", "interior", "inventory", "services", "tech", "total", "token", "design", "invConfirm", "launch"] },
];

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

export const etsCalcTemplates: EtsCalcTemplate[] = [
  { id: "TMPL-001", name: "Toy Standard (Medium)", category: "toys", exwPriceYuan: 15, unitsPerCarton: 24, cartonLength: 60, cartonWidth: 40, cartonHeight: 50 },
  { id: "TMPL-002", name: "Toy Small (Budget)", category: "toys", exwPriceYuan: 5, unitsPerCarton: 48, cartonLength: 50, cartonWidth: 40, cartonHeight: 40 },
  { id: "TMPL-003", name: "Kitchen Item (Premium)", category: "kitchenware", exwPriceYuan: 20, unitsPerCarton: 16, cartonLength: 55, cartonWidth: 45, cartonHeight: 35 },
  { id: "TMPL-004", name: "Kitchen Item (Value)", category: "kitchenware", exwPriceYuan: 8, unitsPerCarton: 36, cartonLength: 45, cartonWidth: 35, cartonHeight: 30 },
  { id: "TMPL-005", name: "Stationery Pack", category: "stationery", exwPriceYuan: 6, unitsPerCarton: 50, cartonLength: 45, cartonWidth: 35, cartonHeight: 40 },
  { id: "TMPL-006", name: "Gift Item (Standard)", category: "gifts", exwPriceYuan: 12, unitsPerCarton: 20, cartonLength: 50, cartonWidth: 35, cartonHeight: 30 },
];
