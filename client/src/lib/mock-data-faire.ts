export type FaireStoreStatus = "connected" | "disconnected" | "error";
export type ProductLifecycleState = "ACTIVE" | "INACTIVE" | "DRAFT";
export type ProductSaleState = "FOR_SALE" | "NOT_FOR_SALE";
export type OrderState = "NEW" | "PRE_TRANSIT" | "IN_TRANSIT" | "DELIVERED" | "CLOSED" | "CANCELLED" | "BACK_ORDERED";
export type OrderItemState = "NEW" | "BACKORDERED" | "CANCELLED" | "SHIPPED";
export type DisputeStatus = "open" | "resolved" | "escalated";
export type CampaignType = "sale" | "featured" | "new_arrival" | "custom";
export type CampaignStatus = "active" | "scheduled" | "ended" | "draft";

export interface FaireStore {
  id: string;
  name: string;
  brandToken: string;
  apiKeyConfigured: boolean;
  status: FaireStoreStatus;
  category: string;
  city: string;
  state: string;
  totalProducts: number;
  totalOrders: number;
  monthlyRevenue: number;
  avgOrderValue: number;
  activeRetailers: number;
  rating: number;
  joinedDate: string;
  lastSync: string;
  todayOrders: number;
}

export interface FaireProductVariant {
  id: string;
  productId: string;
  sku: string;
  name: string;
  wholesale_price: number;
  retail_price: number;
  available_quantity: number;
  backordered_until: string | null;
  options: Record<string, string>;
  lifecycle_state: ProductLifecycleState;
  sale_state: ProductSaleState;
}

export interface FaireProductReview {
  id: string;
  productId: string;
  retailer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface FaireProduct {
  id: string;
  storeId: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  brand: string;
  variants: FaireProductVariant[];
  lifecycle_state: ProductLifecycleState;
  sale_state: ProductSaleState;
  minimum_order_quantity: number;
  units_per_case: number;
  made_in_countries: string[];
  taxable: boolean;
  retailer_count: number;
  review_count: number;
  avg_rating: number;
  created_at: string;
  updated_at: string;
  tags: string[];
  reviews: FaireProductReview[];
}

export interface FaireOrderItem {
  id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  variant_name: string;
  sku: string;
  quantity: number;
  wholesale_price: number;
  total_price: number;
  state: OrderItemState;
  backordered_until: string | null;
}

export interface FaireShipment {
  id: string;
  orderId: string;
  tracking_number: string;
  tracking_url: string;
  carrier: string;
  shipped_at: string;
  estimated_delivery: string;
  status: "shipped" | "in_transit" | "delivered";
  package_count: number;
  weight_oz: number;
}

export interface FaireShippingAddress {
  name: string;
  address1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface FaireOrder {
  id: string;
  storeId: string;
  order_number: string;
  retailer_id: string;
  retailer_name: string;
  retailer_city: string;
  retailer_state: string;
  state: OrderState;
  items: FaireOrderItem[];
  subtotal: number;
  shipping: number;
  taxes: number;
  total: number;
  payout_amount: number;
  discount_amount: number;
  free_shipping_reason: string | null;
  shipped_at: string | null;
  created_at: string;
  updated_at: string;
  shipments: FaireShipment[];
  shipping_address: FaireShippingAddress;
  notes: string | null;
}

export interface FaireRetailer {
  id: string;
  name: string;
  email: string;
  retailer_token: string;
  store_name: string;
  city: string;
  state: string;
  country: string;
  website: string | null;
  instagram: string | null;
  description: string | null;
  created_at: string;
  total_orders: number;
  total_spent: number;
  last_ordered: string | null;
  storeIds: string[];
  status: "active" | "inactive";
}

export interface FaireCampaign {
  id: string;
  storeId: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  description: string;
  discount_percent: number | null;
  discount_min_order: number | null;
  start_date: string;
  end_date: string;
  product_ids: string[];
  impressions: number;
  clicks: number;
  orders_attributed: number;
  revenue_attributed: number;
}

export interface FaireDispute {
  id: string;
  orderId: string;
  order_number: string;
  storeId: string;
  retailer_name: string;
  reason: string;
  description: string;
  amount: number;
  status: DisputeStatus;
  created_at: string;
  resolved_at: string | null;
  resolution: string | null;
  priority: "high" | "normal";
}

export const faireStores: FaireStore[] = [
  {
    id: "store-001",
    name: "Suprans Lifestyle",
    brandToken: "b_sup_8f2a1c",
    apiKeyConfigured: true,
    status: "connected",
    category: "Home & Living",
    city: "Austin",
    state: "TX",
    totalProducts: 14,
    totalOrders: 186,
    monthlyRevenue: 38400,
    avgOrderValue: 312,
    activeRetailers: 48,
    rating: 4.8,
    joinedDate: "2023-03-15",
    lastSync: "2026-02-28T08:44:00Z",
    todayOrders: 3,
  },
  {
    id: "store-002",
    name: "LBM Home & Living",
    brandToken: "b_lbm_4d7e2b",
    apiKeyConfigured: true,
    status: "connected",
    category: "Home Decor",
    city: "Portland",
    state: "OR",
    totalProducts: 22,
    totalOrders: 241,
    monthlyRevenue: 44800,
    avgOrderValue: 278,
    activeRetailers: 62,
    rating: 4.6,
    joinedDate: "2022-11-08",
    lastSync: "2026-02-28T08:44:00Z",
    todayOrders: 5,
  },
  {
    id: "store-003",
    name: "Gullee Craft Co.",
    brandToken: "b_gullee_9c3f5a",
    apiKeyConfigured: true,
    status: "connected",
    category: "Artisan Goods",
    city: "Brooklyn",
    state: "NY",
    totalProducts: 18,
    totalOrders: 124,
    monthlyRevenue: 21600,
    avgOrderValue: 194,
    activeRetailers: 34,
    rating: 4.9,
    joinedDate: "2023-07-20",
    lastSync: "2026-02-28T08:44:00Z",
    todayOrders: 2,
  },
  {
    id: "store-004",
    name: "Heritage Artisan",
    brandToken: "b_heritage_6a1d8c",
    apiKeyConfigured: false,
    status: "disconnected",
    category: "Ceramics & Pottery",
    city: "Santa Fe",
    state: "NM",
    totalProducts: 9,
    totalOrders: 68,
    monthlyRevenue: 13200,
    avgOrderValue: 224,
    activeRetailers: 19,
    rating: 4.7,
    joinedDate: "2024-01-12",
    lastSync: "2026-02-14T10:20:00Z",
    todayOrders: 0,
  },
  {
    id: "store-005",
    name: "Pure Essentials",
    brandToken: "b_pure_2e9b4f",
    apiKeyConfigured: true,
    status: "connected",
    category: "Wellness & Beauty",
    city: "Denver",
    state: "CO",
    totalProducts: 16,
    totalOrders: 312,
    monthlyRevenue: 48200,
    avgOrderValue: 186,
    activeRetailers: 74,
    rating: 4.5,
    joinedDate: "2022-06-30",
    lastSync: "2026-02-28T08:44:00Z",
    todayOrders: 7,
  },
  {
    id: "store-006",
    name: "Nature's Basket",
    brandToken: "b_nature_7f4a2d",
    apiKeyConfigured: true,
    status: "error",
    category: "Food & Pantry",
    city: "Seattle",
    state: "WA",
    totalProducts: 11,
    totalOrders: 89,
    monthlyRevenue: 8600,
    avgOrderValue: 142,
    activeRetailers: 28,
    rating: 4.3,
    joinedDate: "2024-05-22",
    lastSync: "2026-02-27T16:30:00Z",
    todayOrders: 1,
  },
];

export const faireProducts: FaireProduct[] = [
  {
    id: "prod-001",
    storeId: "store-001",
    name: "Handwoven Cotton Throw",
    description: "Luxurious hand-woven cotton throw blanket with natural dyes. Perfect for boutique and home goods retailers.",
    category: "Textiles",
    subcategory: "Throws & Blankets",
    brand: "Suprans Lifestyle",
    lifecycle_state: "ACTIVE",
    sale_state: "FOR_SALE",
    minimum_order_quantity: 4,
    units_per_case: 4,
    made_in_countries: ["India"],
    taxable: true,
    retailer_count: 24,
    review_count: 18,
    avg_rating: 4.8,
    created_at: "2023-04-10",
    updated_at: "2026-01-15",
    tags: ["handwoven", "natural", "cotton", "sustainable"],
    variants: [
      { id: "var-001a", productId: "prod-001", sku: "SUP-THR-IVR", name: "Ivory", wholesale_price: 42, retail_price: 98, available_quantity: 84, backordered_until: null, options: { Color: "Ivory" }, lifecycle_state: "ACTIVE", sale_state: "FOR_SALE" },
      { id: "var-001b", productId: "prod-001", sku: "SUP-THR-TER", name: "Terracotta", wholesale_price: 42, retail_price: 98, available_quantity: 56, backordered_until: null, options: { Color: "Terracotta" }, lifecycle_state: "ACTIVE", sale_state: "FOR_SALE" },
      { id: "var-001c", productId: "prod-001", sku: "SUP-THR-SLA", name: "Slate Blue", wholesale_price: 42, retail_price: 98, available_quantity: 0, backordered_until: "2026-03-15", options: { Color: "Slate Blue" }, lifecycle_state: "ACTIVE", sale_state: "FOR_SALE" },
    ],
    reviews: [
      { id: "rev-001a", productId: "prod-001", retailer_name: "The Cozy Corner Boutique", rating: 5, comment: "Our customers absolutely love these throws. Great quality and fast shipping!", created_at: "2026-01-20" },
      { id: "rev-001b", productId: "prod-001", retailer_name: "Nest & Nook", rating: 5, comment: "Reordered 3 times already. Always consistent quality.", created_at: "2025-12-05" },
    ],
  },
  {
    id: "prod-002",
    storeId: "store-001",
    name: "Soy Wax Pillar Candle Set",
    description: "Set of 3 hand-poured soy wax pillar candles with botanical inclusions. 50-hour burn time per candle.",
    category: "Candles & Home Fragrance",
    subcategory: "Pillar Candles",
    brand: "Suprans Lifestyle",
    lifecycle_state: "ACTIVE",
    sale_state: "FOR_SALE",
    minimum_order_quantity: 6,
    units_per_case: 6,
    made_in_countries: ["USA"],
    taxable: true,
    retailer_count: 31,
    review_count: 22,
    avg_rating: 4.9,
    created_at: "2023-05-22",
    updated_at: "2026-02-01",
    tags: ["soy", "candle", "botanical", "gift"],
    variants: [
      { id: "var-002a", productId: "prod-002", sku: "SUP-CND-LAV", name: "Lavender & Cedar", wholesale_price: 28, retail_price: 68, available_quantity: 120, backordered_until: null, options: { Scent: "Lavender & Cedar" }, lifecycle_state: "ACTIVE", sale_state: "FOR_SALE" },
      { id: "var-002b", productId: "prod-002", sku: "SUP-CND-SAN", name: "Sandalwood & Amber", wholesale_price: 28, retail_price: 68, available_quantity: 96, backordered_until: null, options: { Scent: "Sandalwood & Amber" }, lifecycle_state: "ACTIVE", sale_state: "FOR_SALE" },
      { id: "var-002c", productId: "prod-002", sku: "SUP-CND-CIT", name: "Citrus & Sea Salt", wholesale_price: 28, retail_price: 68, available_quantity: 72, backordered_until: null, options: { Scent: "Citrus & Sea Salt" }, lifecycle_state: "ACTIVE", sale_state: "FOR_SALE" },
    ],
    reviews: [
      { id: "rev-002a", productId: "prod-002", retailer_name: "Bloom & Gather", rating: 5, comment: "Best-selling candles in our store!", created_at: "2026-02-10" },
    ],
  },
  {
    id: "prod-003",
    storeId: "store-002",
    name: "Rattan Fruit Bowl",
    description: "Handcrafted rattan fruit bowl with natural finish. Sustainably sourced materials from certified suppliers.",
    category: "Kitchen & Dining",
    subcategory: "Bowls & Baskets",
    brand: "LBM Home & Living",
    lifecycle_state: "ACTIVE",
    sale_state: "FOR_SALE",
    minimum_order_quantity: 6,
    units_per_case: 6,
    made_in_countries: ["Indonesia"],
    taxable: true,
    retailer_count: 42,
    review_count: 35,
    avg_rating: 4.6,
    created_at: "2022-12-01",
    updated_at: "2025-11-20",
    tags: ["rattan", "natural", "kitchen", "sustainable"],
    variants: [
      { id: "var-003a", productId: "prod-003", sku: "LBM-RFB-SM", name: "Small (10\")", wholesale_price: 18, retail_price: 42, available_quantity: 200, backordered_until: null, options: { Size: "Small" }, lifecycle_state: "ACTIVE", sale_state: "FOR_SALE" },
      { id: "var-003b", productId: "prod-003", sku: "LBM-RFB-LG", name: "Large (14\")", wholesale_price: 26, retail_price: 62, available_quantity: 140, backordered_until: null, options: { Size: "Large" }, lifecycle_state: "ACTIVE", sale_state: "FOR_SALE" },
    ],
    reviews: [
      { id: "rev-003a", productId: "prod-003", retailer_name: "The Green Pantry", rating: 4, comment: "Beautiful product. Packaging could be improved.", created_at: "2025-10-15" },
    ],
  },
  {
    id: "prod-004",
    storeId: "store-002",
    name: "Linen Napkin Set",
    description: "Set of 4 stonewashed linen napkins. Gets softer with every wash. Available in 6 earthy tones.",
    category: "Kitchen & Dining",
    subcategory: "Table Linens",
    brand: "LBM Home & Living",
    lifecycle_state: "ACTIVE",
    sale_state: "FOR_SALE",
    minimum_order_quantity: 4,
    units_per_case: 4,
    made_in_countries: ["Lithuania"],
    taxable: true,
    retailer_count: 58,
    review_count: 41,
    avg_rating: 4.7,
    created_at: "2022-12-15",
    updated_at: "2025-12-10",
    tags: ["linen", "stonewashed", "napkins", "table"],
    variants: [
      { id: "var-004a", productId: "prod-004", sku: "LBM-NAP-NTR", name: "Natural", wholesale_price: 22, retail_price: 52, available_quantity: 180, backordered_until: null, options: { Color: "Natural" }, lifecycle_state: "ACTIVE", sale_state: "FOR_SALE" },
      { id: "var-004b", productId: "prod-004", sku: "LBM-NAP-SAG", name: "Sage", wholesale_price: 22, retail_price: 52, available_quantity: 120, backordered_until: null, options: { Color: "Sage" }, lifecycle_state: "ACTIVE", sale_state: "FOR_SALE" },
      { id: "var-004c", productId: "prod-004", sku: "LBM-NAP-DUS", name: "Dusty Rose", wholesale_price: 22, retail_price: 52, available_quantity: 96, backordered_until: null, options: { Color: "Dusty Rose" }, lifecycle_state: "ACTIVE", sale_state: "FOR_SALE" },
    ],
    reviews: [],
  },
  {
    id: "prod-005",
    storeId: "store-003",
    name: "Hand-Stamped Leather Journal",
    description: "Refillable leather journal with hand-stamped botanical cover. A5 size, 200 pages of cream paper.",
    category: "Stationery & Office",
    subcategory: "Journals & Notebooks",
    brand: "Gullee Craft Co.",
    lifecycle_state: "ACTIVE",
    sale_state: "FOR_SALE",
    minimum_order_quantity: 3,
    units_per_case: 6,
    made_in_countries: ["USA"],
    taxable: true,
    retailer_count: 18,
    review_count: 14,
    avg_rating: 4.9,
    created_at: "2023-08-01",
    updated_at: "2026-01-05",
    tags: ["leather", "journal", "handmade", "botanical"],
    variants: [
      { id: "var-005a", productId: "prod-005", sku: "GLC-JRN-BRN", name: "Brown — Fern", wholesale_price: 34, retail_price: 82, available_quantity: 60, backordered_until: null, options: { Color: "Brown", Design: "Fern" }, lifecycle_state: "ACTIVE", sale_state: "FOR_SALE" },
      { id: "var-005b", productId: "prod-005", sku: "GLC-JRN-TAN", name: "Tan — Wildflower", wholesale_price: 34, retail_price: 82, available_quantity: 45, backordered_until: null, options: { Color: "Tan", Design: "Wildflower" }, lifecycle_state: "ACTIVE", sale_state: "FOR_SALE" },
    ],
    reviews: [
      { id: "rev-005a", productId: "prod-005", retailer_name: "Papercraft Studio", rating: 5, comment: "One of our top-10 best sellers. Customers come back for refills.", created_at: "2026-02-05" },
    ],
  },
  {
    id: "prod-006",
    storeId: "store-003",
    name: "Macramé Wall Hanging",
    description: "Hand-knotted macramé wall art using natural cotton rope. Each piece is unique.",
    category: "Wall Art & Decor",
    subcategory: "Macramé",
    brand: "Gullee Craft Co.",
    lifecycle_state: "ACTIVE",
    sale_state: "FOR_SALE",
    minimum_order_quantity: 2,
    units_per_case: 2,
    made_in_countries: ["USA"],
    taxable: true,
    retailer_count: 22,
    review_count: 19,
    avg_rating: 4.8,
    created_at: "2023-09-10",
    updated_at: "2025-12-20",
    tags: ["macrame", "wall art", "handmade", "cotton"],
    variants: [
      { id: "var-006a", productId: "prod-006", sku: "GLC-MAC-SM", name: "Small (12\"×18\")", wholesale_price: 38, retail_price: 88, available_quantity: 32, backordered_until: null, options: { Size: "Small" }, lifecycle_state: "ACTIVE", sale_state: "FOR_SALE" },
      { id: "var-006b", productId: "prod-006", sku: "GLC-MAC-LG", name: "Large (18\"×36\")", wholesale_price: 68, retail_price: 158, available_quantity: 14, backordered_until: null, options: { Size: "Large" }, lifecycle_state: "ACTIVE", sale_state: "FOR_SALE" },
    ],
    reviews: [],
  },
  {
    id: "prod-007",
    storeId: "store-004",
    name: "Wheel-Thrown Ceramic Mug",
    description: "Artisan wheel-thrown ceramic mug with speckled glaze. Microwave and dishwasher safe. 12oz capacity.",
    category: "Kitchen & Dining",
    subcategory: "Mugs & Cups",
    brand: "Heritage Artisan",
    lifecycle_state: "ACTIVE",
    sale_state: "FOR_SALE",
    minimum_order_quantity: 6,
    units_per_case: 6,
    made_in_countries: ["USA"],
    taxable: true,
    retailer_count: 12,
    review_count: 9,
    avg_rating: 4.7,
    created_at: "2024-02-01",
    updated_at: "2026-02-10",
    tags: ["ceramic", "handmade", "mug", "pottery"],
    variants: [
      { id: "var-007a", productId: "prod-007", sku: "HRT-MUG-WHT", name: "White Speckle", wholesale_price: 24, retail_price: 58, available_quantity: 72, backordered_until: null, options: { Glaze: "White Speckle" }, lifecycle_state: "ACTIVE", sale_state: "FOR_SALE" },
      { id: "var-007b", productId: "prod-007", sku: "HRT-MUG-BLU", name: "Ocean Blue", wholesale_price: 24, retail_price: 58, available_quantity: 48, backordered_until: null, options: { Glaze: "Ocean Blue" }, lifecycle_state: "ACTIVE", sale_state: "FOR_SALE" },
      { id: "var-007c", productId: "prod-007", sku: "HRT-MUG-MOS", name: "Mossy Green", wholesale_price: 24, retail_price: 58, available_quantity: 0, backordered_until: "2026-04-01", options: { Glaze: "Mossy Green" }, lifecycle_state: "ACTIVE", sale_state: "FOR_SALE" },
    ],
    reviews: [
      { id: "rev-007a", productId: "prod-007", retailer_name: "Gather & Grind Coffee", rating: 5, comment: "Our café carries these and customers always ask where to buy more.", created_at: "2025-11-28" },
    ],
  },
  {
    id: "prod-008",
    storeId: "store-005",
    name: "Lavender Body Oil",
    description: "Cold-pressed lavender and jojoba body oil. Organic certified, vegan, and cruelty-free. 4oz amber bottle.",
    category: "Bath & Body",
    subcategory: "Body Oils",
    brand: "Pure Essentials",
    lifecycle_state: "ACTIVE",
    sale_state: "FOR_SALE",
    minimum_order_quantity: 6,
    units_per_case: 12,
    made_in_countries: ["USA"],
    taxable: false,
    retailer_count: 56,
    review_count: 48,
    avg_rating: 4.5,
    created_at: "2022-07-15",
    updated_at: "2026-01-20",
    tags: ["organic", "vegan", "lavender", "body oil"],
    variants: [
      { id: "var-008a", productId: "prod-008", sku: "PRE-OIL-LAV-4", name: "4oz", wholesale_price: 16, retail_price: 38, available_quantity: 240, backordered_until: null, options: { Size: "4oz" }, lifecycle_state: "ACTIVE", sale_state: "FOR_SALE" },
      { id: "var-008b", productId: "prod-008", sku: "PRE-OIL-LAV-8", name: "8oz", wholesale_price: 28, retail_price: 64, available_quantity: 120, backordered_until: null, options: { Size: "8oz" }, lifecycle_state: "ACTIVE", sale_state: "FOR_SALE" },
    ],
    reviews: [
      { id: "rev-008a", productId: "prod-008", retailer_name: "Serenity Spa Boutique", rating: 5, comment: "Our #1 selling body oil. Clients love the scent.", created_at: "2026-02-14" },
      { id: "rev-008b", productId: "prod-008", retailer_name: "Bloom Wellness", rating: 4, comment: "Great product, wish there were more scent options.", created_at: "2025-12-20" },
    ],
  },
  {
    id: "prod-009",
    storeId: "store-005",
    name: "Rose Facial Serum",
    description: "Concentrated rose hip and vitamin C facial serum. Brightening and anti-aging formula. 1oz dropper bottle.",
    category: "Skincare",
    subcategory: "Serums",
    brand: "Pure Essentials",
    lifecycle_state: "ACTIVE",
    sale_state: "FOR_SALE",
    minimum_order_quantity: 6,
    units_per_case: 12,
    made_in_countries: ["USA"],
    taxable: false,
    retailer_count: 38,
    review_count: 32,
    avg_rating: 4.6,
    created_at: "2022-09-01",
    updated_at: "2026-02-01",
    tags: ["serum", "vitamin C", "rosehip", "anti-aging"],
    variants: [
      { id: "var-009a", productId: "prod-009", sku: "PRE-SRM-ROS-1", name: "1oz Dropper", wholesale_price: 22, retail_price: 52, available_quantity: 180, backordered_until: null, options: { Size: "1oz" }, lifecycle_state: "ACTIVE", sale_state: "FOR_SALE" },
    ],
    reviews: [],
  },
  {
    id: "prod-010",
    storeId: "store-006",
    name: "Wildflower Honey",
    description: "Raw, unfiltered Pacific Northwest wildflower honey. Harvested from our partner bee farms. 12oz jar.",
    category: "Food & Beverage",
    subcategory: "Honey & Spreads",
    brand: "Nature's Basket",
    lifecycle_state: "ACTIVE",
    sale_state: "FOR_SALE",
    minimum_order_quantity: 12,
    units_per_case: 12,
    made_in_countries: ["USA"],
    taxable: false,
    retailer_count: 20,
    review_count: 16,
    avg_rating: 4.3,
    created_at: "2024-06-01",
    updated_at: "2026-02-05",
    tags: ["honey", "organic", "raw", "PNW"],
    variants: [
      { id: "var-010a", productId: "prod-010", sku: "NAT-HON-WLD-12", name: "12oz Jar", wholesale_price: 12, retail_price: 28, available_quantity: 360, backordered_until: null, options: { Size: "12oz" }, lifecycle_state: "ACTIVE", sale_state: "FOR_SALE" },
      { id: "var-010b", productId: "prod-010", sku: "NAT-HON-WLD-32", name: "32oz Jar", wholesale_price: 28, retail_price: 64, available_quantity: 80, backordered_until: null, options: { Size: "32oz" }, lifecycle_state: "ACTIVE", sale_state: "FOR_SALE" },
    ],
    reviews: [
      { id: "rev-010a", productId: "prod-010", retailer_name: "The Harvest Table", rating: 4, comment: "Pure quality. Customers love supporting local beekeepers.", created_at: "2025-12-01" },
    ],
  },
];

const shipment1: FaireShipment = {
  id: "ship-001", orderId: "ord-009", tracking_number: "1Z999AA10123456784",
  tracking_url: "https://www.ups.com/track?tracknum=1Z999AA10123456784",
  carrier: "UPS", shipped_at: "2026-02-20", estimated_delivery: "2026-02-24",
  status: "delivered", package_count: 1, weight_oz: 48,
};
const shipment2: FaireShipment = {
  id: "ship-002", orderId: "ord-010", tracking_number: "9400111899223408332000",
  tracking_url: "https://tools.usps.com/go/TrackConfirmAction?tLabels=9400111899223408332000",
  carrier: "USPS", shipped_at: "2026-02-22", estimated_delivery: "2026-02-27",
  status: "delivered", package_count: 1, weight_oz: 32,
};
const shipment3: FaireShipment = {
  id: "ship-003", orderId: "ord-011", tracking_number: "774899172137",
  tracking_url: "https://www.fedex.com/fedextrack/?trknbr=774899172137",
  carrier: "FedEx", shipped_at: "2026-02-24", estimated_delivery: "2026-02-28",
  status: "in_transit", package_count: 2, weight_oz: 120,
};
const shipment4: FaireShipment = {
  id: "ship-004", orderId: "ord-012", tracking_number: "1Z999AA10123456790",
  tracking_url: "https://www.ups.com/track?tracknum=1Z999AA10123456790",
  carrier: "UPS", shipped_at: "2026-02-25", estimated_delivery: "2026-03-01",
  status: "in_transit", package_count: 1, weight_oz: 64,
};
const shipment5: FaireShipment = {
  id: "ship-005", orderId: "ord-013", tracking_number: "9400111899223408332111",
  tracking_url: "https://tools.usps.com/go/TrackConfirmAction?tLabels=9400111899223408332111",
  carrier: "USPS", shipped_at: "2026-02-26", estimated_delivery: "2026-03-02",
  status: "shipped", package_count: 1, weight_oz: 24,
};

export const faireOrders: FaireOrder[] = [
  {
    id: "ord-001", storeId: "store-001", order_number: "FO-28841", retailer_id: "ret-001",
    retailer_name: "The Cozy Corner Boutique", retailer_city: "Nashville", retailer_state: "TN",
    state: "NEW", items: [
      { id: "oi-001a", product_id: "prod-001", variant_id: "var-001a", product_name: "Handwoven Cotton Throw", variant_name: "Ivory", sku: "SUP-THR-IVR", quantity: 4, wholesale_price: 42, total_price: 168, state: "NEW", backordered_until: null },
      { id: "oi-001b", product_id: "prod-002", variant_id: "var-002a", product_name: "Soy Wax Pillar Candle Set", variant_name: "Lavender & Cedar", sku: "SUP-CND-LAV", quantity: 6, wholesale_price: 28, total_price: 168, state: "NEW", backordered_until: null },
    ],
    subtotal: 336, shipping: 18, taxes: 0, total: 354, payout_amount: 318, discount_amount: 0,
    free_shipping_reason: null, shipped_at: null, created_at: "2026-02-28T07:12:00Z", updated_at: "2026-02-28T07:12:00Z",
    shipments: [], notes: null,
    shipping_address: { name: "The Cozy Corner Boutique", address1: "142 Broadway Ave", city: "Nashville", state: "TN", zip: "37201", country: "US" },
  },
  {
    id: "ord-002", storeId: "store-002", order_number: "FO-28842", retailer_id: "ret-002",
    retailer_name: "Bloom & Gather", retailer_city: "Chicago", retailer_state: "IL",
    state: "NEW", items: [
      { id: "oi-002a", product_id: "prod-003", variant_id: "var-003b", product_name: "Rattan Fruit Bowl", variant_name: "Large (14\")", sku: "LBM-RFB-LG", quantity: 6, wholesale_price: 26, total_price: 156, state: "NEW", backordered_until: null },
    ],
    subtotal: 156, shipping: 14, taxes: 0, total: 170, payout_amount: 153, discount_amount: 0,
    free_shipping_reason: null, shipped_at: null, created_at: "2026-02-28T08:04:00Z", updated_at: "2026-02-28T08:04:00Z",
    shipments: [], notes: "Please include brand catalog in package.",
    shipping_address: { name: "Bloom & Gather", address1: "881 N Michigan Ave", city: "Chicago", state: "IL", zip: "60611", country: "US" },
  },
  {
    id: "ord-003", storeId: "store-005", order_number: "FO-28843", retailer_id: "ret-003",
    retailer_name: "Serenity Spa Boutique", retailer_city: "Scottsdale", retailer_state: "AZ",
    state: "NEW", items: [
      { id: "oi-003a", product_id: "prod-008", variant_id: "var-008a", product_name: "Lavender Body Oil", variant_name: "4oz", sku: "PRE-OIL-LAV-4", quantity: 12, wholesale_price: 16, total_price: 192, state: "NEW", backordered_until: null },
      { id: "oi-003b", product_id: "prod-009", variant_id: "var-009a", product_name: "Rose Facial Serum", variant_name: "1oz Dropper", sku: "PRE-SRM-ROS-1", quantity: 6, wholesale_price: 22, total_price: 132, state: "NEW", backordered_until: null },
    ],
    subtotal: 324, shipping: 0, taxes: 0, total: 324, payout_amount: 291, discount_amount: 0,
    free_shipping_reason: "FREE_SHIPPING_THRESHOLD", shipped_at: null, created_at: "2026-02-28T08:45:00Z", updated_at: "2026-02-28T08:45:00Z",
    shipments: [], notes: null,
    shipping_address: { name: "Serenity Spa Boutique", address1: "7299 N Scottsdale Rd", city: "Scottsdale", state: "AZ", zip: "85253", country: "US" },
  },
  {
    id: "ord-004", storeId: "store-001", order_number: "FO-28800", retailer_id: "ret-004",
    retailer_name: "Nest & Nook", retailer_city: "Portland", retailer_state: "OR",
    state: "PRE_TRANSIT", items: [
      { id: "oi-004a", product_id: "prod-001", variant_id: "var-001b", product_name: "Handwoven Cotton Throw", variant_name: "Terracotta", sku: "SUP-THR-TER", quantity: 4, wholesale_price: 42, total_price: 168, state: "SHIPPED", backordered_until: null },
    ],
    subtotal: 168, shipping: 12, taxes: 0, total: 180, payout_amount: 162, discount_amount: 0,
    free_shipping_reason: null, shipped_at: null, created_at: "2026-02-26T14:30:00Z", updated_at: "2026-02-27T09:00:00Z",
    shipments: [], notes: null,
    shipping_address: { name: "Nest & Nook", address1: "2204 NW Thurman St", city: "Portland", state: "OR", zip: "97210", country: "US" },
  },
  {
    id: "ord-005", storeId: "store-002", order_number: "FO-28801", retailer_id: "ret-005",
    retailer_name: "The Green Pantry", retailer_city: "San Francisco", retailer_state: "CA",
    state: "PRE_TRANSIT", items: [
      { id: "oi-005a", product_id: "prod-004", variant_id: "var-004a", product_name: "Linen Napkin Set", variant_name: "Natural", sku: "LBM-NAP-NTR", quantity: 8, wholesale_price: 22, total_price: 176, state: "SHIPPED", backordered_until: null },
      { id: "oi-005b", product_id: "prod-004", variant_id: "var-004b", product_name: "Linen Napkin Set", variant_name: "Sage", sku: "LBM-NAP-SAG", quantity: 4, wholesale_price: 22, total_price: 88, state: "SHIPPED", backordered_until: null },
    ],
    subtotal: 264, shipping: 16, taxes: 0, total: 280, payout_amount: 252, discount_amount: 0,
    free_shipping_reason: null, shipped_at: null, created_at: "2026-02-25T11:15:00Z", updated_at: "2026-02-26T08:00:00Z",
    shipments: [], notes: null,
    shipping_address: { name: "The Green Pantry", address1: "401 Hayes St", city: "San Francisco", state: "CA", zip: "94102", country: "US" },
  },
  {
    id: "ord-006", storeId: "store-003", order_number: "FO-28790", retailer_id: "ret-006",
    retailer_name: "Papercraft Studio", retailer_city: "Denver", retailer_state: "CO",
    state: "PRE_TRANSIT", items: [
      { id: "oi-006a", product_id: "prod-005", variant_id: "var-005a", product_name: "Hand-Stamped Leather Journal", variant_name: "Brown — Fern", sku: "GLC-JRN-BRN", quantity: 6, wholesale_price: 34, total_price: 204, state: "SHIPPED", backordered_until: null },
      { id: "oi-006b", product_id: "prod-005", variant_id: "var-005b", product_name: "Hand-Stamped Leather Journal", variant_name: "Tan — Wildflower", sku: "GLC-JRN-TAN", quantity: 6, wholesale_price: 34, total_price: 204, state: "SHIPPED", backordered_until: null },
    ],
    subtotal: 408, shipping: 0, taxes: 0, total: 408, payout_amount: 367, discount_amount: 0,
    free_shipping_reason: "FREE_SHIPPING_THRESHOLD", shipped_at: null, created_at: "2026-02-24T09:20:00Z", updated_at: "2026-02-25T11:00:00Z",
    shipments: [], notes: "Gift wrap each journal please.",
    shipping_address: { name: "Papercraft Studio", address1: "1550 17th St", city: "Denver", state: "CO", zip: "80202", country: "US" },
  },
  {
    id: "ord-007", storeId: "store-005", order_number: "FO-28780", retailer_id: "ret-007",
    retailer_name: "Bloom Wellness", retailer_city: "Austin", retailer_state: "TX",
    state: "IN_TRANSIT", items: [
      { id: "oi-007a", product_id: "prod-008", variant_id: "var-008b", product_name: "Lavender Body Oil", variant_name: "8oz", sku: "PRE-OIL-LAV-8", quantity: 12, wholesale_price: 28, total_price: 336, state: "SHIPPED", backordered_until: null },
    ],
    subtotal: 336, shipping: 0, taxes: 0, total: 336, payout_amount: 302, discount_amount: 0,
    free_shipping_reason: "FREE_SHIPPING_THRESHOLD", shipped_at: "2026-02-24", created_at: "2026-02-22T10:30:00Z", updated_at: "2026-02-24T14:00:00Z",
    shipments: [shipment3], notes: null,
    shipping_address: { name: "Bloom Wellness", address1: "2222 S Lamar Blvd", city: "Austin", state: "TX", zip: "78704", country: "US" },
  },
  {
    id: "ord-008", storeId: "store-002", order_number: "FO-28770", retailer_id: "ret-008",
    retailer_name: "Gather & Grind Coffee", retailer_city: "Seattle", retailer_state: "WA",
    state: "IN_TRANSIT", items: [
      { id: "oi-008a", product_id: "prod-003", variant_id: "var-003a", product_name: "Rattan Fruit Bowl", variant_name: "Small (10\")", sku: "LBM-RFB-SM", quantity: 12, wholesale_price: 18, total_price: 216, state: "SHIPPED", backordered_until: null },
      { id: "oi-008b", product_id: "prod-004", variant_id: "var-004c", product_name: "Linen Napkin Set", variant_name: "Dusty Rose", sku: "LBM-NAP-DUS", quantity: 4, wholesale_price: 22, total_price: 88, state: "SHIPPED", backordered_until: null },
    ],
    subtotal: 304, shipping: 18, taxes: 0, total: 322, payout_amount: 290, discount_amount: 0,
    free_shipping_reason: null, shipped_at: "2026-02-25", created_at: "2026-02-21T16:00:00Z", updated_at: "2026-02-25T10:00:00Z",
    shipments: [shipment4], notes: null,
    shipping_address: { name: "Gather & Grind Coffee", address1: "1600 Pike Place", city: "Seattle", state: "WA", zip: "98101", country: "US" },
  },
  {
    id: "ord-009", storeId: "store-001", order_number: "FO-28700", retailer_id: "ret-001",
    retailer_name: "The Cozy Corner Boutique", retailer_city: "Nashville", retailer_state: "TN",
    state: "DELIVERED", items: [
      { id: "oi-009a", product_id: "prod-002", variant_id: "var-002b", product_name: "Soy Wax Pillar Candle Set", variant_name: "Sandalwood & Amber", sku: "SUP-CND-SAN", quantity: 12, wholesale_price: 28, total_price: 336, state: "SHIPPED", backordered_until: null },
    ],
    subtotal: 336, shipping: 0, taxes: 0, total: 336, payout_amount: 302, discount_amount: 0,
    free_shipping_reason: "FREE_SHIPPING_THRESHOLD", shipped_at: "2026-02-18", created_at: "2026-02-14T09:00:00Z", updated_at: "2026-02-20T12:00:00Z",
    shipments: [shipment1], notes: null,
    shipping_address: { name: "The Cozy Corner Boutique", address1: "142 Broadway Ave", city: "Nashville", state: "TN", zip: "37201", country: "US" },
  },
  {
    id: "ord-010", storeId: "store-005", order_number: "FO-28680", retailer_id: "ret-009",
    retailer_name: "Sol Wellness", retailer_city: "Miami", retailer_state: "FL",
    state: "DELIVERED", items: [
      { id: "oi-010a", product_id: "prod-009", variant_id: "var-009a", product_name: "Rose Facial Serum", variant_name: "1oz Dropper", sku: "PRE-SRM-ROS-1", quantity: 12, wholesale_price: 22, total_price: 264, state: "SHIPPED", backordered_until: null },
      { id: "oi-010b", product_id: "prod-008", variant_id: "var-008a", product_name: "Lavender Body Oil", variant_name: "4oz", sku: "PRE-OIL-LAV-4", quantity: 12, wholesale_price: 16, total_price: 192, state: "SHIPPED", backordered_until: null },
    ],
    subtotal: 456, shipping: 0, taxes: 0, total: 456, payout_amount: 410, discount_amount: 22,
    free_shipping_reason: "FREE_SHIPPING_THRESHOLD", shipped_at: "2026-02-20", created_at: "2026-02-16T08:00:00Z", updated_at: "2026-02-22T16:00:00Z",
    shipments: [shipment2], notes: null,
    shipping_address: { name: "Sol Wellness", address1: "800 Lincoln Rd", city: "Miami", state: "FL", zip: "33139", country: "US" },
  },
  {
    id: "ord-011", storeId: "store-003", order_number: "FO-28650", retailer_id: "ret-010",
    retailer_name: "The Artful Home", retailer_city: "Atlanta", retailer_state: "GA",
    state: "IN_TRANSIT", items: [
      { id: "oi-011a", product_id: "prod-006", variant_id: "var-006b", product_name: "Macramé Wall Hanging", variant_name: "Large (18\"×36\")", sku: "GLC-MAC-LG", quantity: 4, wholesale_price: 68, total_price: 272, state: "SHIPPED", backordered_until: null },
    ],
    subtotal: 272, shipping: 22, taxes: 0, total: 294, payout_amount: 265, discount_amount: 0,
    free_shipping_reason: null, shipped_at: "2026-02-24", created_at: "2026-02-20T13:00:00Z", updated_at: "2026-02-24T11:00:00Z",
    shipments: [shipment3], notes: null,
    shipping_address: { name: "The Artful Home", address1: "675 Ponce De Leon Ave", city: "Atlanta", state: "GA", zip: "30308", country: "US" },
  },
  {
    id: "ord-012", storeId: "store-006", order_number: "FO-28620", retailer_id: "ret-011",
    retailer_name: "The Harvest Table", retailer_city: "Phoenix", retailer_state: "AZ",
    state: "IN_TRANSIT", items: [
      { id: "oi-012a", product_id: "prod-010", variant_id: "var-010a", product_name: "Wildflower Honey", variant_name: "12oz Jar", sku: "NAT-HON-WLD-12", quantity: 24, wholesale_price: 12, total_price: 288, state: "SHIPPED", backordered_until: null },
    ],
    subtotal: 288, shipping: 16, taxes: 0, total: 304, payout_amount: 274, discount_amount: 0,
    free_shipping_reason: null, shipped_at: "2026-02-25", created_at: "2026-02-19T10:00:00Z", updated_at: "2026-02-25T09:00:00Z",
    shipments: [shipment4], notes: null,
    shipping_address: { name: "The Harvest Table", address1: "3601 E Thomas Rd", city: "Phoenix", state: "AZ", zip: "85018", country: "US" },
  },
  {
    id: "ord-013", storeId: "store-005", order_number: "FO-28590", retailer_id: "ret-012",
    retailer_name: "Petal + Co", retailer_city: "Minneapolis", retailer_state: "MN",
    state: "IN_TRANSIT", items: [
      { id: "oi-013a", product_id: "prod-008", variant_id: "var-008a", product_name: "Lavender Body Oil", variant_name: "4oz", sku: "PRE-OIL-LAV-4", quantity: 6, wholesale_price: 16, total_price: 96, state: "SHIPPED", backordered_until: null },
    ],
    subtotal: 96, shipping: 12, taxes: 0, total: 108, payout_amount: 97, discount_amount: 0,
    free_shipping_reason: null, shipped_at: "2026-02-26", created_at: "2026-02-21T08:00:00Z", updated_at: "2026-02-26T14:00:00Z",
    shipments: [shipment5], notes: null,
    shipping_address: { name: "Petal + Co", address1: "100 N 6th St", city: "Minneapolis", state: "MN", zip: "55403", country: "US" },
  },
  {
    id: "ord-014", storeId: "store-001", order_number: "FO-28400", retailer_id: "ret-004",
    retailer_name: "Nest & Nook", retailer_city: "Portland", retailer_state: "OR",
    state: "CLOSED", items: [
      { id: "oi-014a", product_id: "prod-001", variant_id: "var-001a", product_name: "Handwoven Cotton Throw", variant_name: "Ivory", sku: "SUP-THR-IVR", quantity: 8, wholesale_price: 42, total_price: 336, state: "SHIPPED", backordered_until: null },
    ],
    subtotal: 336, shipping: 0, taxes: 0, total: 336, payout_amount: 302, discount_amount: 0,
    free_shipping_reason: "FREE_SHIPPING_THRESHOLD", shipped_at: "2026-01-20", created_at: "2026-01-14T10:00:00Z", updated_at: "2026-01-25T12:00:00Z",
    shipments: [], notes: null,
    shipping_address: { name: "Nest & Nook", address1: "2204 NW Thurman St", city: "Portland", state: "OR", zip: "97210", country: "US" },
  },
  {
    id: "ord-015", storeId: "store-002", order_number: "FO-28380", retailer_id: "ret-002",
    retailer_name: "Bloom & Gather", retailer_city: "Chicago", retailer_state: "IL",
    state: "CANCELLED", items: [
      { id: "oi-015a", product_id: "prod-004", variant_id: "var-004a", product_name: "Linen Napkin Set", variant_name: "Natural", sku: "LBM-NAP-NTR", quantity: 4, wholesale_price: 22, total_price: 88, state: "CANCELLED", backordered_until: null },
    ],
    subtotal: 88, shipping: 10, taxes: 0, total: 98, payout_amount: 0, discount_amount: 0,
    free_shipping_reason: null, shipped_at: null, created_at: "2026-01-12T09:00:00Z", updated_at: "2026-01-13T11:00:00Z",
    shipments: [], notes: "Retailer cancelled — ordering different variant.",
    shipping_address: { name: "Bloom & Gather", address1: "881 N Michigan Ave", city: "Chicago", state: "IL", zip: "60611", country: "US" },
  },
  {
    id: "ord-016", storeId: "store-005", order_number: "FO-28350", retailer_id: "ret-013",
    retailer_name: "Inner Glow Studio", retailer_city: "Los Angeles", retailer_state: "CA",
    state: "BACK_ORDERED", items: [
      { id: "oi-016a", product_id: "prod-007", variant_id: "var-007c", product_name: "Wheel-Thrown Ceramic Mug", variant_name: "Mossy Green", sku: "HRT-MUG-MOS", quantity: 12, wholesale_price: 24, total_price: 288, state: "BACKORDERED", backordered_until: "2026-04-01" },
    ],
    subtotal: 288, shipping: 18, taxes: 0, total: 306, payout_amount: 275, discount_amount: 0,
    free_shipping_reason: null, shipped_at: null, created_at: "2026-02-10T08:00:00Z", updated_at: "2026-02-10T08:00:00Z",
    shipments: [], notes: null,
    shipping_address: { name: "Inner Glow Studio", address1: "8605 Santa Monica Blvd", city: "Los Angeles", state: "CA", zip: "90069", country: "US" },
  },
];

export const faireShipments: FaireShipment[] = [
  shipment1, shipment2, shipment3, shipment4, shipment5,
  {
    id: "ship-006", orderId: "ord-014", tracking_number: "1Z999AA10123456799",
    tracking_url: "https://www.ups.com/track?tracknum=1Z999AA10123456799",
    carrier: "UPS", shipped_at: "2026-01-20", estimated_delivery: "2026-01-24",
    status: "delivered", package_count: 1, weight_oz: 96,
  },
];

export const faireRetailers: FaireRetailer[] = [
  {
    id: "ret-001", name: "Sarah Mitchell", email: "orders@cozycorner.com", retailer_token: "r_coz_8f2a1c",
    store_name: "The Cozy Corner Boutique", city: "Nashville", state: "TN", country: "US",
    website: "https://cozycornerboutique.com", instagram: "@cozycornerboutique",
    description: "Curated home goods and lifestyle boutique in the heart of Nashville.",
    created_at: "2023-06-01", total_orders: 14, total_spent: 4820, last_ordered: "2026-02-28",
    storeIds: ["store-001", "store-002"], status: "active",
  },
  {
    id: "ret-002", name: "Emma Rodriguez", email: "buying@bloomandgather.co", retailer_token: "r_blm_4d7e2b",
    store_name: "Bloom & Gather", city: "Chicago", state: "IL", country: "US",
    website: "https://bloomandgather.co", instagram: "@bloomandgatherchi",
    description: "Floral design studio and home goods shop in Chicago's West Loop.",
    created_at: "2022-12-15", total_orders: 28, total_spent: 7640, last_ordered: "2026-02-28",
    storeIds: ["store-002", "store-003"], status: "active",
  },
  {
    id: "ret-003", name: "Jennifer Park", email: "orders@serenityspa.com", retailer_token: "r_ser_9c3f5a",
    store_name: "Serenity Spa Boutique", city: "Scottsdale", state: "AZ", country: "US",
    website: "https://serenityspa.com", instagram: "@serenityspaaz",
    description: "Luxury day spa and wellness retail boutique in Scottsdale.",
    created_at: "2023-01-20", total_orders: 22, total_spent: 6920, last_ordered: "2026-02-28",
    storeIds: ["store-005"], status: "active",
  },
  {
    id: "ret-004", name: "Alex Chen", email: "wholesale@nestandnook.com", retailer_token: "r_nst_6a1d8c",
    store_name: "Nest & Nook", city: "Portland", state: "OR", country: "US",
    website: "https://nestandnook.com", instagram: "@nestandnookpdx",
    description: "Scandinavian-inspired home goods and gifts shop in Portland.",
    created_at: "2023-03-10", total_orders: 18, total_spent: 5240, last_ordered: "2026-02-26",
    storeIds: ["store-001", "store-003"], status: "active",
  },
  {
    id: "ret-005", name: "Marcus Johnson", email: "wholesale@thegreenpantry.com", retailer_token: "r_grn_2e9b4f",
    store_name: "The Green Pantry", city: "San Francisco", state: "CA", country: "US",
    website: "https://thegreenpantry.com", instagram: "@thegreenpantrysf",
    description: "Sustainable food and home goods store focused on zero-waste living.",
    created_at: "2022-09-15", total_orders: 32, total_spent: 8180, last_ordered: "2026-02-25",
    storeIds: ["store-002", "store-006"], status: "active",
  },
  {
    id: "ret-006", name: "Diana Patel", email: "orders@papercraftstudio.com", retailer_token: "r_pap_7f4a2d",
    store_name: "Papercraft Studio", city: "Denver", state: "CO", country: "US",
    website: "https://papercraftstudio.com", instagram: "@papercraftstudioco",
    description: "Artisan stationery and craft supply shop with curated maker goods.",
    created_at: "2023-08-22", total_orders: 10, total_spent: 3240, last_ordered: "2026-02-24",
    storeIds: ["store-003"], status: "active",
  },
  {
    id: "ret-007", name: "Priya Kumar", email: "wholesale@bloomwellness.co", retailer_token: "r_blw_1b8c4e",
    store_name: "Bloom Wellness", city: "Austin", state: "TX", country: "US",
    website: "https://bloomwellness.co", instagram: "@bloomwellnessatx",
    description: "Holistic wellness boutique and apothecary in South Austin.",
    created_at: "2022-11-01", total_orders: 24, total_spent: 6480, last_ordered: "2026-02-22",
    storeIds: ["store-005"], status: "active",
  },
  {
    id: "ret-008", name: "Tyler Brooks", email: "orders@gatherandgrind.com", retailer_token: "r_gg_5d2a7f",
    store_name: "Gather & Grind Coffee", city: "Seattle", state: "WA", country: "US",
    website: "https://gatherandgrind.com", instagram: "@gatherandgrindcoffee",
    description: "Specialty coffee shop and curated home goods destination in Pike Place.",
    created_at: "2023-05-14", total_orders: 8, total_spent: 2480, last_ordered: "2026-02-21",
    storeIds: ["store-002", "store-004"], status: "active",
  },
  {
    id: "ret-009", name: "Isabella Santos", email: "buyer@solwellness.com", retailer_token: "r_sol_3c6e9a",
    store_name: "Sol Wellness", city: "Miami", state: "FL", country: "US",
    website: "https://solwellness.com", instagram: "@solwellnessmiami",
    description: "Luxury wellness and beauty boutique on Lincoln Road, Miami Beach.",
    created_at: "2023-02-28", total_orders: 16, total_spent: 4920, last_ordered: "2026-02-16",
    storeIds: ["store-005"], status: "active",
  },
  {
    id: "ret-010", name: "Robert Kim", email: "wholesale@artfulhome.com", retailer_token: "r_art_8e1b3d",
    store_name: "The Artful Home", city: "Atlanta", state: "GA", country: "US",
    website: "https://artfulhome.com", instagram: "@artfulhomeatlanta",
    description: "Contemporary art and home decor gallery in Ponce City Market.",
    created_at: "2023-06-30", total_orders: 6, total_spent: 1840, last_ordered: "2026-02-20",
    storeIds: ["store-003", "store-004"], status: "active",
  },
  {
    id: "ret-011", name: "Olivia Turner", email: "orders@harvesttable.com", retailer_token: "r_hrv_4f9c2b",
    store_name: "The Harvest Table", city: "Phoenix", state: "AZ", country: "US",
    website: "https://harvesttable.com", instagram: "@harvesttablephx",
    description: "Farm-to-table restaurant retail shop specializing in local and artisan foods.",
    created_at: "2024-07-10", total_orders: 4, total_spent: 1120, last_ordered: "2026-02-19",
    storeIds: ["store-006"], status: "active",
  },
  {
    id: "ret-012", name: "Grace Lee", email: "wholesale@petalandco.com", retailer_token: "r_ptl_6d8e1a",
    store_name: "Petal + Co", city: "Minneapolis", state: "MN", country: "US",
    website: "https://petalandco.com", instagram: "@petalandcomn",
    description: "Botanically inspired lifestyle boutique in Minneapolis.",
    created_at: "2024-01-15", total_orders: 7, total_spent: 1640, last_ordered: "2026-02-21",
    storeIds: ["store-005"], status: "active",
  },
  {
    id: "ret-013", name: "Natalie Wong", email: "orders@innerglowstudio.com", retailer_token: "r_ing_2a5f8c",
    store_name: "Inner Glow Studio", city: "Los Angeles", state: "CA", country: "US",
    website: "https://innerglowstudio.com", instagram: "@innerglowla",
    description: "Wellness and beauty studio in West Hollywood with curated retail.",
    created_at: "2024-03-20", total_orders: 3, total_spent: 860, last_ordered: "2026-02-10",
    storeIds: ["store-004", "store-005"], status: "active",
  },
];

export const faireCampaigns: FaireCampaign[] = [
  {
    id: "camp-001", storeId: "store-001", name: "Spring Home Refresh",
    type: "sale", status: "active",
    description: "15% off all throws and textiles for spring buying season.",
    discount_percent: 15, discount_min_order: 200, start_date: "2026-02-15", end_date: "2026-03-31",
    product_ids: ["prod-001"], impressions: 4820, clicks: 341, orders_attributed: 18, revenue_attributed: 5640,
  },
  {
    id: "camp-002", storeId: "store-005", name: "Wellness Week",
    type: "featured", status: "active",
    description: "Featured placement on Faire wellness homepage during March.",
    discount_percent: null, discount_min_order: null, start_date: "2026-03-01", end_date: "2026-03-07",
    product_ids: ["prod-008", "prod-009"], impressions: 8400, clicks: 620, orders_attributed: 34, revenue_attributed: 9280,
  },
  {
    id: "camp-003", storeId: "store-002", name: "New Arrivals — Spring Linens",
    type: "new_arrival", status: "active",
    description: "Showcase new linen napkin colors for spring table settings.",
    discount_percent: null, discount_min_order: null, start_date: "2026-02-20", end_date: "2026-04-20",
    product_ids: ["prod-004"], impressions: 3200, clicks: 218, orders_attributed: 12, revenue_attributed: 3120,
  },
  {
    id: "camp-004", storeId: "store-003", name: "Handmade Maker Month",
    type: "featured", status: "active",
    description: "Featured in Faire's \"Made in America\" editorial collection.",
    discount_percent: null, discount_min_order: null, start_date: "2026-02-01", end_date: "2026-02-28",
    product_ids: ["prod-005", "prod-006"], impressions: 6100, clicks: 480, orders_attributed: 22, revenue_attributed: 7040,
  },
  {
    id: "camp-005", storeId: "store-006", name: "Gift Shop Special",
    type: "sale", status: "scheduled",
    description: "10% off honey bundles for Mother's Day gift shop buyers.",
    discount_percent: 10, discount_min_order: 150, start_date: "2026-04-15", end_date: "2026-05-10",
    product_ids: ["prod-010"], impressions: 0, clicks: 0, orders_attributed: 0, revenue_attributed: 0,
  },
  {
    id: "camp-006", storeId: "store-004", name: "Ceramics Showcase",
    type: "new_arrival", status: "scheduled",
    description: "New mug colors launch campaign for spring.",
    discount_percent: null, discount_min_order: null, start_date: "2026-03-15", end_date: "2026-04-30",
    product_ids: ["prod-007"], impressions: 0, clicks: 0, orders_attributed: 0, revenue_attributed: 0,
  },
  {
    id: "camp-007", storeId: "store-001", name: "Holiday Gifting 2025",
    type: "sale", status: "ended",
    description: "Holiday gift set campaign — 20% off minimum orders of $300.",
    discount_percent: 20, discount_min_order: 300, start_date: "2025-11-15", end_date: "2025-12-31",
    product_ids: ["prod-001", "prod-002"], impressions: 12400, clicks: 980, orders_attributed: 64, revenue_attributed: 22800,
  },
  {
    id: "camp-008", storeId: "store-002", name: "Back-to-Basics Kitchen",
    type: "custom", status: "ended",
    description: "Custom editorial feature in Faire's Editors' Picks.",
    discount_percent: null, discount_min_order: null, start_date: "2025-10-01", end_date: "2025-11-30",
    product_ids: ["prod-003", "prod-004"], impressions: 9800, clicks: 740, orders_attributed: 48, revenue_attributed: 14200,
  },
];

export const faireDisputes: FaireDispute[] = [
  {
    id: "disp-001", orderId: "ord-009", order_number: "FO-28700", storeId: "store-001",
    retailer_name: "The Cozy Corner Boutique",
    reason: "Damaged goods", description: "2 out of 12 candle sets arrived with broken glass lids. Requesting replacement or credit.",
    amount: 56, status: "open", created_at: "2026-02-22", resolved_at: null, resolution: null, priority: "high",
  },
  {
    id: "disp-002", orderId: "ord-010", order_number: "FO-28680", storeId: "store-005",
    retailer_name: "Sol Wellness",
    reason: "Wrong item sent", description: "Received Sandalwood scent instead of Lavender for 3 units. Requested Lavender.",
    amount: 48, status: "open", created_at: "2026-02-24", resolved_at: null, resolution: null, priority: "normal",
  },
  {
    id: "disp-003", orderId: "ord-014", order_number: "FO-28400", storeId: "store-001",
    retailer_name: "Nest & Nook",
    reason: "Late delivery", description: "Order arrived 5 days after estimated delivery. Had to turn away several customers.",
    amount: 0, status: "escalated", created_at: "2026-02-01", resolved_at: null, resolution: null, priority: "high",
  },
  {
    id: "disp-004", orderId: "ord-011", order_number: "FO-28650", storeId: "store-003",
    retailer_name: "The Artful Home",
    reason: "Missing items", description: "Only received 3 macramé pieces but was charged for 4.",
    amount: 68, status: "open", created_at: "2026-02-27", resolved_at: null, resolution: null, priority: "high",
  },
  {
    id: "disp-005", orderId: "ord-008", order_number: "FO-28770", storeId: "store-002",
    retailer_name: "Gather & Grind Coffee",
    reason: "Quality issue", description: "Some rattan bowls have visible defects — split weaving on the base.",
    amount: 54, status: "open", created_at: "2026-02-26", resolved_at: null, resolution: null, priority: "normal",
  },
  {
    id: "disp-006", orderId: "ord-007", order_number: "FO-28780", storeId: "store-005",
    retailer_name: "Bloom Wellness",
    reason: "Damaged goods", description: "2 bottles arrived leaking due to poor cap seal.",
    amount: 56, status: "resolved", created_at: "2026-02-18", resolved_at: "2026-02-20", resolution: "Issued store credit of $56. Retailer satisfied. Will update packaging.", priority: "normal",
  },
  {
    id: "disp-007", orderId: "ord-004", order_number: "FO-28800", storeId: "store-001",
    retailer_name: "Nest & Nook",
    reason: "Wrong quantity", description: "Received 6 units instead of ordered 4 — billed for 4, received 6.",
    amount: 0, status: "resolved", created_at: "2026-02-10", resolved_at: "2026-02-12", resolution: "Retailer kept extra units as goodwill. No charge. Updated picking process.", priority: "normal",
  },
  {
    id: "disp-008", orderId: "ord-005", order_number: "FO-28801", storeId: "store-002",
    retailer_name: "The Green Pantry",
    reason: "Packaging damage", description: "Outer box was completely crushed in transit. Products okay but will affect display.",
    amount: 0, status: "resolved", created_at: "2026-02-15", resolved_at: "2026-02-16", resolution: "Sent complimentary replacement packaging inserts. Upgraded carrier for this retailer.", priority: "normal",
  },
  {
    id: "disp-009", orderId: "ord-006", order_number: "FO-28790", storeId: "store-003",
    retailer_name: "Papercraft Studio",
    reason: "Not as described", description: "Journals have different stitching than shown in product photos.",
    amount: 204, status: "escalated", created_at: "2026-02-20", resolved_at: null, resolution: null, priority: "high",
  },
  {
    id: "disp-010", orderId: "ord-013", order_number: "FO-28590", storeId: "store-005",
    retailer_name: "Petal + Co",
    reason: "Late delivery", description: "Package arrived 4 days late. Missed pre-Valentine's Day window.",
    amount: 0, status: "resolved", created_at: "2026-02-20", resolved_at: "2026-02-21", resolution: "Offered 10% discount on next order as goodwill. Retailer accepted.", priority: "normal",
  },
];
