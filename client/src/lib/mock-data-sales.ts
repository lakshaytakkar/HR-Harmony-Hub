export interface Product {
  id: string;
  name: string;
  category: string;
  supplier: string;
  price: number;
  comparePrice: number;
  margin: number;
  status: "active" | "draft" | "archived";
  image: string;
  orders: number;
  revenue: number;
  rating: number;
  source: "aliexpress" | "cjdropshipping" | "spocket";
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  status: "active" | "inactive";
  icon: string;
}

export interface Supplier {
  id: string;
  name: string;
  country: string;
  rating: number;
  products: number;
  avgShipping: number;
  status: "verified" | "pending" | "suspended";
}

export interface ExternalUser {
  id: string;
  name: string;
  email: string;
  plan: "free" | "starter" | "pro" | "enterprise";
  status: "active" | "churned" | "trial";
  signupDate: string;
  lastLogin: string;
  storesConnected: number;
  productsImported: number;
  revenue: number;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  source: "website" | "referral" | "ad" | "organic";
  status: "new" | "contacted" | "qualified" | "converted" | "lost";
  assignedTo: string;
  createdDate: string;
  notes: string;
}

export interface Subscription {
  id: string;
  userId: string;
  userName: string;
  plan: "free" | "starter" | "pro" | "enterprise";
  status: "active" | "canceled" | "past_due" | "trialing";
  startDate: string;
  endDate: string;
  mrr: number;
}

export interface ShopifyStore {
  id: string;
  name: string;
  owner: string;
  domain: string;
  status: "active" | "paused" | "disconnected";
  products: number;
  orders: number;
  revenue: number;
  connectedDate: string;
}

export interface CompetitorStore {
  id: string;
  name: string;
  domain: string;
  niche: string;
  estimatedRevenue: number;
  productCount: number;
  trafficRank: number;
}

export interface FulfillmentOrder {
  id: string;
  orderId: string;
  store: string;
  product: string;
  status: "pending" | "processing" | "shipped" | "delivered";
  trackingNumber: string;
  supplier: string;
  createdDate: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  user: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in-progress" | "resolved" | "closed";
  category: "billing" | "technical" | "product" | "account";
  createdDate: string;
  assignedTo: string;
}

export interface Course {
  id: string;
  title: string;
  category: string;
  lessons: number;
  enrolled: number;
  completionRate: number;
  status: "published" | "draft";
  instructor: string;
}

export interface RevenueMetric {
  month: string;
  mrr: number;
  newSubscriptions: number;
  churn: number;
  revenue: number;
}

export interface PlanTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  userCount: number;
  revenue: number;
}

export const products: Product[] = [
  { id: "PRD-001", name: "Wireless Bluetooth Earbuds Pro", category: "Electronics", supplier: "ShenZhen Audio Co.", price: 29.99, comparePrice: 79.99, margin: 62, status: "active", image: "/3d-icons/headphones.webp", orders: 1842, revenue: 55231, rating: 4.6, source: "aliexpress" },
  { id: "PRD-002", name: "Smart Watch Fitness Tracker", category: "Electronics", supplier: "Dongguan Tech Ltd.", price: 34.99, comparePrice: 89.99, margin: 61, status: "active", image: "/3d-icons/watch.webp", orders: 1356, revenue: 47446, rating: 4.4, source: "cjdropshipping" },
  { id: "PRD-003", name: "LED Ring Light 10-inch", category: "Photography", supplier: "Yiwu Lighting Co.", price: 18.99, comparePrice: 49.99, margin: 62, status: "active", image: "/3d-icons/light.webp", orders: 2103, revenue: 39937, rating: 4.7, source: "aliexpress" },
  { id: "PRD-004", name: "Vitamin C Brightening Serum", category: "Beauty", supplier: "Guangzhou Beauty Lab", price: 12.49, comparePrice: 39.99, margin: 69, status: "active", image: "/3d-icons/bottle.webp", orders: 3210, revenue: 40093, rating: 4.8, source: "spocket" },
  { id: "PRD-005", name: "Portable Mini Projector HD", category: "Electronics", supplier: "ShenZhen Display Tech", price: 89.99, comparePrice: 199.99, margin: 55, status: "active", image: "/3d-icons/projector.webp", orders: 567, revenue: 50997, rating: 4.3, source: "cjdropshipping" },
  { id: "PRD-006", name: "Sunset Lamp Projector", category: "Home & Living", supplier: "Yiwu Lighting Co.", price: 14.99, comparePrice: 34.99, margin: 57, status: "active", image: "/3d-icons/lamp.webp", orders: 4521, revenue: 67783, rating: 4.5, source: "aliexpress" },
  { id: "PRD-007", name: "Silicone Phone Case Matte", category: "Accessories", supplier: "Dongguan Cases Ltd.", price: 4.99, comparePrice: 19.99, margin: 75, status: "active", image: "/3d-icons/phone.webp", orders: 8902, revenue: 44422, rating: 4.2, source: "aliexpress" },
  { id: "PRD-008", name: "Insulated Water Bottle 750ml", category: "Sports", supplier: "Ningbo Hydra Co.", price: 15.99, comparePrice: 39.99, margin: 60, status: "active", image: "/3d-icons/bottle.webp", orders: 2847, revenue: 45511, rating: 4.6, source: "spocket" },
  { id: "PRD-009", name: "Posture Corrector Back Brace", category: "Health", supplier: "Guangzhou Wellness", price: 11.99, comparePrice: 29.99, margin: 60, status: "active", image: "/3d-icons/health.webp", orders: 1923, revenue: 23054, rating: 4.1, source: "cjdropshipping" },
  { id: "PRD-010", name: "Car Phone Mount Magnetic", category: "Accessories", supplier: "ShenZhen Auto Parts", price: 9.99, comparePrice: 24.99, margin: 60, status: "active", image: "/3d-icons/car.webp", orders: 3456, revenue: 34526, rating: 4.4, source: "aliexpress" },
  { id: "PRD-011", name: "Yoga Mat Premium 6mm", category: "Sports", supplier: "Ningbo Hydra Co.", price: 22.99, comparePrice: 54.99, margin: 58, status: "active", image: "/3d-icons/yoga.webp", orders: 1245, revenue: 28623, rating: 4.7, source: "spocket" },
  { id: "PRD-012", name: "Pet Grooming Glove", category: "Pets", supplier: "Yiwu Pet Supplies", price: 7.99, comparePrice: 19.99, margin: 60, status: "draft", image: "/3d-icons/pet.webp", orders: 0, revenue: 0, rating: 0, source: "aliexpress" },
  { id: "PRD-013", name: "Electric Scalp Massager", category: "Beauty", supplier: "Guangzhou Beauty Lab", price: 16.99, comparePrice: 44.99, margin: 62, status: "active", image: "/3d-icons/beauty.webp", orders: 1876, revenue: 31856, rating: 4.5, source: "cjdropshipping" },
  { id: "PRD-014", name: "Resistance Bands Set (5pc)", category: "Sports", supplier: "Ningbo Hydra Co.", price: 11.49, comparePrice: 29.99, margin: 62, status: "active", image: "/3d-icons/fitness.webp", orders: 2341, revenue: 26906, rating: 4.6, source: "aliexpress" },
  { id: "PRD-015", name: "Bamboo Wireless Charger", category: "Electronics", supplier: "ShenZhen Audio Co.", price: 19.99, comparePrice: 44.99, margin: 56, status: "draft", image: "/3d-icons/charger.webp", orders: 0, revenue: 0, rating: 0, source: "spocket" },
  { id: "PRD-016", name: "Cloud Slides Cushion", category: "Fashion", supplier: "Dongguan Cases Ltd.", price: 13.99, comparePrice: 34.99, margin: 60, status: "active", image: "/3d-icons/shoes.webp", orders: 5678, revenue: 79437, rating: 4.3, source: "aliexpress" },
  { id: "PRD-017", name: "Aroma Diffuser USB Mini", category: "Home & Living", supplier: "Yiwu Lighting Co.", price: 17.49, comparePrice: 42.99, margin: 59, status: "archived", image: "/3d-icons/diffuser.webp", orders: 890, revenue: 15566, rating: 3.9, source: "cjdropshipping" },
  { id: "PRD-018", name: "Travel Toiletry Bag Organizer", category: "Travel", supplier: "Yiwu Pet Supplies", price: 9.49, comparePrice: 24.99, margin: 62, status: "active", image: "/3d-icons/bag.webp", orders: 1543, revenue: 14633, rating: 4.4, source: "aliexpress" },
];

export const categories: Category[] = [
  { id: "CAT-001", name: "Electronics", slug: "electronics", productCount: 5, status: "active", icon: "Cpu" },
  { id: "CAT-002", name: "Beauty", slug: "beauty", productCount: 3, status: "active", icon: "Sparkles" },
  { id: "CAT-003", name: "Sports", slug: "sports", productCount: 3, status: "active", icon: "Dumbbell" },
  { id: "CAT-004", name: "Home & Living", slug: "home-living", productCount: 2, status: "active", icon: "Home" },
  { id: "CAT-005", name: "Accessories", slug: "accessories", productCount: 2, status: "active", icon: "Watch" },
  { id: "CAT-006", name: "Photography", slug: "photography", productCount: 1, status: "active", icon: "Camera" },
  { id: "CAT-007", name: "Health", slug: "health", productCount: 1, status: "active", icon: "Heart" },
  { id: "CAT-008", name: "Fashion", slug: "fashion", productCount: 1, status: "active", icon: "Shirt" },
  { id: "CAT-009", name: "Pets", slug: "pets", productCount: 1, status: "active", icon: "PawPrint" },
  { id: "CAT-010", name: "Travel", slug: "travel", productCount: 1, status: "active", icon: "Plane" },
];

export const suppliers: Supplier[] = [
  { id: "SUP-001", name: "ShenZhen Audio Co.", country: "China", rating: 4.7, products: 342, avgShipping: 8, status: "verified" },
  { id: "SUP-002", name: "Dongguan Tech Ltd.", country: "China", rating: 4.5, products: 218, avgShipping: 10, status: "verified" },
  { id: "SUP-003", name: "Yiwu Lighting Co.", country: "China", rating: 4.6, products: 567, avgShipping: 7, status: "verified" },
  { id: "SUP-004", name: "Guangzhou Beauty Lab", country: "China", rating: 4.8, products: 189, avgShipping: 9, status: "verified" },
  { id: "SUP-005", name: "ShenZhen Display Tech", country: "China", rating: 4.3, products: 124, avgShipping: 12, status: "verified" },
  { id: "SUP-006", name: "Dongguan Cases Ltd.", country: "China", rating: 4.2, products: 890, avgShipping: 6, status: "verified" },
  { id: "SUP-007", name: "Ningbo Hydra Co.", country: "China", rating: 4.6, products: 156, avgShipping: 8, status: "verified" },
  { id: "SUP-008", name: "ShenZhen Auto Parts", country: "China", rating: 4.1, products: 432, avgShipping: 11, status: "pending" },
  { id: "SUP-009", name: "Yiwu Pet Supplies", country: "China", rating: 4.0, products: 298, avgShipping: 9, status: "verified" },
  { id: "SUP-010", name: "Guangzhou Wellness", country: "China", rating: 4.4, products: 167, avgShipping: 10, status: "verified" },
  { id: "SUP-011", name: "Istanbul Textiles", country: "Turkey", rating: 4.3, products: 89, avgShipping: 14, status: "pending" },
  { id: "SUP-012", name: "Mumbai Crafts Hub", country: "India", rating: 4.5, products: 234, avgShipping: 12, status: "verified" },
];

export const externalUsers: ExternalUser[] = [
  { id: "USR-001", name: "Sarah Chen", email: "sarah@ecomstore.com", plan: "pro", status: "active", signupDate: "2024-08-15", lastLogin: "2025-02-26", storesConnected: 3, productsImported: 145, revenue: 89400 },
  { id: "USR-002", name: "Marcus Rodriguez", email: "marcus@dropworld.io", plan: "enterprise", status: "active", signupDate: "2024-06-20", lastLogin: "2025-02-27", storesConnected: 5, productsImported: 312, revenue: 234500 },
  { id: "USR-003", name: "Priya Sharma", email: "priya@quickshop.in", plan: "starter", status: "active", signupDate: "2024-11-10", lastLogin: "2025-02-25", storesConnected: 1, productsImported: 28, revenue: 12300 },
  { id: "USR-004", name: "Jake Miller", email: "jake@trendyfinds.com", plan: "pro", status: "active", signupDate: "2024-09-05", lastLogin: "2025-02-27", storesConnected: 2, productsImported: 89, revenue: 67800 },
  { id: "USR-005", name: "Aisha Khan", email: "aisha@luxedrops.co", plan: "pro", status: "active", signupDate: "2024-10-18", lastLogin: "2025-02-24", storesConnected: 2, productsImported: 67, revenue: 45200 },
  { id: "USR-006", name: "Tom Bradley", email: "tom@gadgetguru.store", plan: "free", status: "trial", signupDate: "2025-02-10", lastLogin: "2025-02-26", storesConnected: 0, productsImported: 5, revenue: 0 },
  { id: "USR-007", name: "Lin Wei", email: "lin@megastore.cn", plan: "enterprise", status: "active", signupDate: "2024-04-12", lastLogin: "2025-02-27", storesConnected: 8, productsImported: 520, revenue: 456000 },
  { id: "USR-008", name: "Emma Wilson", email: "emma@beautybox.co.uk", plan: "starter", status: "active", signupDate: "2024-12-01", lastLogin: "2025-02-23", storesConnected: 1, productsImported: 34, revenue: 18900 },
  { id: "USR-009", name: "Diego Costa", email: "diego@shopbrasil.com.br", plan: "pro", status: "churned", signupDate: "2024-07-22", lastLogin: "2025-01-15", storesConnected: 1, productsImported: 42, revenue: 23100 },
  { id: "USR-010", name: "Yuki Tanaka", email: "yuki@tokyotrends.jp", plan: "starter", status: "active", signupDate: "2025-01-05", lastLogin: "2025-02-26", storesConnected: 1, productsImported: 19, revenue: 8700 },
  { id: "USR-011", name: "Olivia Brown", email: "olivia@homevibes.com", plan: "free", status: "trial", signupDate: "2025-02-18", lastLogin: "2025-02-25", storesConnected: 0, productsImported: 2, revenue: 0 },
  { id: "USR-012", name: "Raj Patel", email: "raj@fastship.in", plan: "pro", status: "active", signupDate: "2024-09-30", lastLogin: "2025-02-27", storesConnected: 3, productsImported: 156, revenue: 98700 },
  { id: "USR-013", name: "Sophie Dubois", email: "sophie@chicmarket.fr", plan: "starter", status: "churned", signupDate: "2024-10-05", lastLogin: "2025-01-28", storesConnected: 1, productsImported: 15, revenue: 5400 },
  { id: "USR-014", name: "Alex Turner", email: "alex@dropzone.com.au", plan: "enterprise", status: "active", signupDate: "2024-05-15", lastLogin: "2025-02-27", storesConnected: 6, productsImported: 410, revenue: 312000 },
  { id: "USR-015", name: "Fatima Al-Rashid", email: "fatima@gulfgoods.ae", plan: "pro", status: "active", signupDate: "2024-11-20", lastLogin: "2025-02-26", storesConnected: 2, productsImported: 78, revenue: 56300 },
];

export const leads: Lead[] = [
  { id: "LD-001", name: "Chris Johnson", email: "chris@bigretail.com", source: "website", status: "new", assignedTo: "Karan Gupta", createdDate: "2025-02-25", notes: "Interested in enterprise plan" },
  { id: "LD-002", name: "Anna Smith", email: "anna@fashionhub.co", source: "ad", status: "contacted", assignedTo: "Vikram Singh", createdDate: "2025-02-23", notes: "Saw Facebook ad, wants demo" },
  { id: "LD-003", name: "Mike Chen", email: "mike@techstartup.io", source: "organic", status: "qualified", assignedTo: "Karan Gupta", createdDate: "2025-02-20", notes: "Running 3 stores, needs automation" },
  { id: "LD-004", name: "Lisa Park", email: "lisa@seoulstyle.kr", source: "referral", status: "converted", assignedTo: "Vikram Singh", createdDate: "2025-02-15", notes: "Referred by Marcus Rodriguez" },
  { id: "LD-005", name: "David Brown", email: "david@gadgetworld.com", source: "website", status: "new", assignedTo: "Karan Gupta", createdDate: "2025-02-26", notes: "Submitted contact form" },
  { id: "LD-006", name: "Natasha Ivanova", email: "natasha@dropru.ru", source: "ad", status: "contacted", assignedTo: "Sneha Patel", createdDate: "2025-02-22", notes: "Google Ads click, booked call" },
  { id: "LD-007", name: "Carlos Mendez", email: "carlos@tiendamx.com", source: "organic", status: "lost", assignedTo: "Vikram Singh", createdDate: "2025-02-10", notes: "Budget constraints" },
  { id: "LD-008", name: "Samantha Lee", email: "sam@beautydrops.com", source: "referral", status: "qualified", assignedTo: "Sneha Patel", createdDate: "2025-02-18", notes: "Referred by Emma Wilson" },
  { id: "LD-009", name: "Omar Hassan", email: "omar@middleast.shop", source: "website", status: "new", assignedTo: "Karan Gupta", createdDate: "2025-02-27", notes: "Wants to expand to GCC market" },
  { id: "LD-010", name: "Jenny Nguyen", email: "jenny@vietshop.vn", source: "ad", status: "contacted", assignedTo: "Vikram Singh", createdDate: "2025-02-21", notes: "TikTok ad conversion" },
  { id: "LD-011", name: "Robert Taylor", email: "robert@homegoodsplus.com", source: "organic", status: "qualified", assignedTo: "Sneha Patel", createdDate: "2025-02-16", notes: "Looking for home niche products" },
  { id: "LD-012", name: "Ayumi Sato", email: "ayumi@kawaiishop.jp", source: "referral", status: "converted", assignedTo: "Karan Gupta", createdDate: "2025-02-12", notes: "Referred by Yuki Tanaka" },
  { id: "LD-013", name: "Peter Schmidt", email: "peter@eurodrop.de", source: "website", status: "new", assignedTo: "Vikram Singh", createdDate: "2025-02-26", notes: "German market expansion" },
  { id: "LD-014", name: "Maria Garcia", email: "maria@tiendaonline.es", source: "ad", status: "contacted", assignedTo: "Sneha Patel", createdDate: "2025-02-19", notes: "Instagram ad, interested in beauty" },
  { id: "LD-015", name: "Kevin O'Brien", email: "kevin@irishdrops.ie", source: "organic", status: "new", assignedTo: "Karan Gupta", createdDate: "2025-02-27", notes: "Found via blog post" },
];

export const subscriptions: Subscription[] = [
  { id: "SUB-001", userId: "USR-001", userName: "Sarah Chen", plan: "pro", status: "active", startDate: "2024-08-15", endDate: "2025-08-15", mrr: 79 },
  { id: "SUB-002", userId: "USR-002", userName: "Marcus Rodriguez", plan: "enterprise", status: "active", startDate: "2024-06-20", endDate: "2025-06-20", mrr: 199 },
  { id: "SUB-003", userId: "USR-003", userName: "Priya Sharma", plan: "starter", status: "active", startDate: "2024-11-10", endDate: "2025-11-10", mrr: 29 },
  { id: "SUB-004", userId: "USR-004", userName: "Jake Miller", plan: "pro", status: "active", startDate: "2024-09-05", endDate: "2025-09-05", mrr: 79 },
  { id: "SUB-005", userId: "USR-005", userName: "Aisha Khan", plan: "pro", status: "active", startDate: "2024-10-18", endDate: "2025-10-18", mrr: 79 },
  { id: "SUB-006", userId: "USR-006", userName: "Tom Bradley", plan: "free", status: "trialing", startDate: "2025-02-10", endDate: "2025-03-10", mrr: 0 },
  { id: "SUB-007", userId: "USR-007", userName: "Lin Wei", plan: "enterprise", status: "active", startDate: "2024-04-12", endDate: "2025-04-12", mrr: 199 },
  { id: "SUB-008", userId: "USR-008", userName: "Emma Wilson", plan: "starter", status: "active", startDate: "2024-12-01", endDate: "2025-12-01", mrr: 29 },
  { id: "SUB-009", userId: "USR-009", userName: "Diego Costa", plan: "pro", status: "canceled", startDate: "2024-07-22", endDate: "2025-01-22", mrr: 0 },
  { id: "SUB-010", userId: "USR-010", userName: "Yuki Tanaka", plan: "starter", status: "active", startDate: "2025-01-05", endDate: "2026-01-05", mrr: 29 },
  { id: "SUB-011", userId: "USR-011", userName: "Olivia Brown", plan: "free", status: "trialing", startDate: "2025-02-18", endDate: "2025-03-18", mrr: 0 },
  { id: "SUB-012", userId: "USR-012", userName: "Raj Patel", plan: "pro", status: "active", startDate: "2024-09-30", endDate: "2025-09-30", mrr: 79 },
  { id: "SUB-013", userId: "USR-013", userName: "Sophie Dubois", plan: "starter", status: "canceled", startDate: "2024-10-05", endDate: "2025-01-05", mrr: 0 },
  { id: "SUB-014", userId: "USR-014", userName: "Alex Turner", plan: "enterprise", status: "active", startDate: "2024-05-15", endDate: "2025-05-15", mrr: 199 },
  { id: "SUB-015", userId: "USR-015", userName: "Fatima Al-Rashid", plan: "pro", status: "active", startDate: "2024-11-20", endDate: "2025-11-20", mrr: 79 },
];

export const shopifyStores: ShopifyStore[] = [
  { id: "STO-001", name: "TrendyFinds Store", owner: "Jake Miller", domain: "trendyfinds.myshopify.com", status: "active", products: 89, orders: 1245, revenue: 67800, connectedDate: "2024-09-10" },
  { id: "STO-002", name: "LuxeDrops Official", owner: "Aisha Khan", domain: "luxedrops.myshopify.com", status: "active", products: 67, orders: 890, revenue: 45200, connectedDate: "2024-10-22" },
  { id: "STO-003", name: "Sarah's Beauty Box", owner: "Sarah Chen", domain: "sarahbeauty.myshopify.com", status: "active", products: 56, orders: 1567, revenue: 34200, connectedDate: "2024-08-20" },
  { id: "STO-004", name: "GadgetGuru Store", owner: "Tom Bradley", domain: "gadgetguru.myshopify.com", status: "paused", products: 5, orders: 0, revenue: 0, connectedDate: "2025-02-12" },
  { id: "STO-005", name: "MegaStore Global", owner: "Lin Wei", domain: "megastore-global.myshopify.com", status: "active", products: 234, orders: 5678, revenue: 189000, connectedDate: "2024-04-15" },
  { id: "STO-006", name: "DropZone AU", owner: "Alex Turner", domain: "dropzone-au.myshopify.com", status: "active", products: 178, orders: 3456, revenue: 134000, connectedDate: "2024-05-20" },
  { id: "STO-007", name: "FastShip India", owner: "Raj Patel", domain: "fastship-india.myshopify.com", status: "active", products: 120, orders: 2341, revenue: 78900, connectedDate: "2024-10-01" },
  { id: "STO-008", name: "Tokyo Trends", owner: "Yuki Tanaka", domain: "tokyotrends.myshopify.com", status: "active", products: 19, orders: 234, revenue: 8700, connectedDate: "2025-01-08" },
  { id: "STO-009", name: "Gulf Goods Premium", owner: "Fatima Al-Rashid", domain: "gulfgoods.myshopify.com", status: "active", products: 78, orders: 1123, revenue: 56300, connectedDate: "2024-11-25" },
  { id: "STO-010", name: "Chen's Second Store", owner: "Sarah Chen", domain: "chensdeals.myshopify.com", status: "active", products: 45, orders: 890, revenue: 28400, connectedDate: "2024-12-15" },
  { id: "STO-011", name: "Marcus Drop Empire", owner: "Marcus Rodriguez", domain: "marcusdrops.myshopify.com", status: "active", products: 156, orders: 4567, revenue: 156000, connectedDate: "2024-06-25" },
  { id: "STO-012", name: "HomeVibes Test", owner: "Olivia Brown", domain: "homevibes-test.myshopify.com", status: "disconnected", products: 2, orders: 0, revenue: 0, connectedDate: "2025-02-20" },
];

export const competitorStores: CompetitorStore[] = [
  { id: "CMP-001", name: "HyperSKU", domain: "hypersku.com", niche: "General Dropshipping", estimatedRevenue: 2400000, productCount: 12000, trafficRank: 45230 },
  { id: "CMP-002", name: "Sell The Trend", domain: "sellthetrend.com", niche: "Product Research", estimatedRevenue: 1800000, productCount: 8500, trafficRank: 32100 },
  { id: "CMP-003", name: "Dropship.io", domain: "dropship.io", niche: "Full Suite", estimatedRevenue: 3200000, productCount: 15000, trafficRank: 28900 },
  { id: "CMP-004", name: "AutoDS", domain: "autods.com", niche: "Automation", estimatedRevenue: 5600000, productCount: 25000, trafficRank: 18500 },
  { id: "CMP-005", name: "Spocket", domain: "spocket.co", niche: "US/EU Suppliers", estimatedRevenue: 4100000, productCount: 20000, trafficRank: 22300 },
  { id: "CMP-006", name: "Zendrop", domain: "zendrop.com", niche: "Fulfillment", estimatedRevenue: 2900000, productCount: 11000, trafficRank: 35600 },
  { id: "CMP-007", name: "DSers", domain: "dsers.com", niche: "AliExpress Integration", estimatedRevenue: 3800000, productCount: 30000, trafficRank: 15200 },
  { id: "CMP-008", name: "Oberlo Legacy", domain: "oberlo.com", niche: "Shopify Native", estimatedRevenue: 1200000, productCount: 5000, trafficRank: 52000 },
  { id: "CMP-009", name: "CJ Dropshipping", domain: "cjdropshipping.com", niche: "Sourcing + Fulfillment", estimatedRevenue: 8900000, productCount: 400000, trafficRank: 8900 },
  { id: "CMP-010", name: "Ecomhunt", domain: "ecomhunt.com", niche: "Winning Products", estimatedRevenue: 980000, productCount: 3200, trafficRank: 67000 },
];

export const fulfillmentOrders: FulfillmentOrder[] = [
  { id: "FUL-001", orderId: "ORD-4521", store: "TrendyFinds Store", product: "Wireless Bluetooth Earbuds Pro", status: "shipped", trackingNumber: "SF1234567890", supplier: "ShenZhen Audio Co.", createdDate: "2025-02-22" },
  { id: "FUL-002", orderId: "ORD-4522", store: "LuxeDrops Official", product: "Vitamin C Brightening Serum", status: "delivered", trackingNumber: "YT9876543210", supplier: "Guangzhou Beauty Lab", createdDate: "2025-02-20" },
  { id: "FUL-003", orderId: "ORD-4523", store: "MegaStore Global", product: "LED Ring Light 10-inch", status: "processing", trackingNumber: "", supplier: "Yiwu Lighting Co.", createdDate: "2025-02-25" },
  { id: "FUL-004", orderId: "ORD-4524", store: "DropZone AU", product: "Smart Watch Fitness Tracker", status: "pending", trackingNumber: "", supplier: "Dongguan Tech Ltd.", createdDate: "2025-02-26" },
  { id: "FUL-005", orderId: "ORD-4525", store: "FastShip India", product: "Sunset Lamp Projector", status: "shipped", trackingNumber: "EMS2345678901", supplier: "Yiwu Lighting Co.", createdDate: "2025-02-23" },
  { id: "FUL-006", orderId: "ORD-4526", store: "Sarah's Beauty Box", product: "Electric Scalp Massager", status: "delivered", trackingNumber: "DHL3456789012", supplier: "Guangzhou Beauty Lab", createdDate: "2025-02-18" },
  { id: "FUL-007", orderId: "ORD-4527", store: "Marcus Drop Empire", product: "Silicone Phone Case Matte", status: "shipped", trackingNumber: "UPS4567890123", supplier: "Dongguan Cases Ltd.", createdDate: "2025-02-24" },
  { id: "FUL-008", orderId: "ORD-4528", store: "Gulf Goods Premium", product: "Insulated Water Bottle 750ml", status: "processing", trackingNumber: "", supplier: "Ningbo Hydra Co.", createdDate: "2025-02-26" },
  { id: "FUL-009", orderId: "ORD-4529", store: "Tokyo Trends", product: "Cloud Slides Cushion", status: "pending", trackingNumber: "", supplier: "Dongguan Cases Ltd.", createdDate: "2025-02-27" },
  { id: "FUL-010", orderId: "ORD-4530", store: "TrendyFinds Store", product: "Car Phone Mount Magnetic", status: "delivered", trackingNumber: "SF5678901234", supplier: "ShenZhen Auto Parts", createdDate: "2025-02-19" },
  { id: "FUL-011", orderId: "ORD-4531", store: "MegaStore Global", product: "Yoga Mat Premium 6mm", status: "shipped", trackingNumber: "YT6789012345", supplier: "Ningbo Hydra Co.", createdDate: "2025-02-24" },
  { id: "FUL-012", orderId: "ORD-4532", store: "DropZone AU", product: "Resistance Bands Set (5pc)", status: "processing", trackingNumber: "", supplier: "Ningbo Hydra Co.", createdDate: "2025-02-26" },
  { id: "FUL-013", orderId: "ORD-4533", store: "Chen's Second Store", product: "Posture Corrector Back Brace", status: "pending", trackingNumber: "", supplier: "Guangzhou Wellness", createdDate: "2025-02-27" },
  { id: "FUL-014", orderId: "ORD-4534", store: "FastShip India", product: "Travel Toiletry Bag Organizer", status: "shipped", trackingNumber: "EMS7890123456", supplier: "Yiwu Pet Supplies", createdDate: "2025-02-23" },
  { id: "FUL-015", orderId: "ORD-4535", store: "Marcus Drop Empire", product: "Portable Mini Projector HD", status: "delivered", trackingNumber: "DHL8901234567", supplier: "ShenZhen Display Tech", createdDate: "2025-02-17" },
];

export const supportTickets: SupportTicket[] = [
  { id: "TKT-001", subject: "Cannot connect Shopify store", user: "Tom Bradley", priority: "high", status: "open", category: "technical", createdDate: "2025-02-26", assignedTo: "Support Team A" },
  { id: "TKT-002", subject: "Billing charge incorrect", user: "Diego Costa", priority: "urgent", status: "in-progress", category: "billing", createdDate: "2025-02-25", assignedTo: "Support Team B" },
  { id: "TKT-003", subject: "Product import stuck at 50%", user: "Priya Sharma", priority: "medium", status: "open", category: "technical", createdDate: "2025-02-26", assignedTo: "Support Team A" },
  { id: "TKT-004", subject: "How to cancel subscription?", user: "Sophie Dubois", priority: "low", status: "resolved", category: "account", createdDate: "2025-02-22", assignedTo: "Support Team B" },
  { id: "TKT-005", subject: "AI Ad Studio not generating images", user: "Sarah Chen", priority: "high", status: "in-progress", category: "product", createdDate: "2025-02-25", assignedTo: "Support Team A" },
  { id: "TKT-006", subject: "Tracking numbers not syncing", user: "Jake Miller", priority: "medium", status: "open", category: "technical", createdDate: "2025-02-27", assignedTo: "Support Team A" },
  { id: "TKT-007", subject: "Enterprise plan feature access", user: "Lin Wei", priority: "low", status: "resolved", category: "account", createdDate: "2025-02-20", assignedTo: "Support Team B" },
  { id: "TKT-008", subject: "Refund request for last month", user: "Diego Costa", priority: "urgent", status: "open", category: "billing", createdDate: "2025-02-27", assignedTo: "Support Team B" },
  { id: "TKT-009", subject: "Competitor spy tool inaccurate data", user: "Marcus Rodriguez", priority: "medium", status: "in-progress", category: "product", createdDate: "2025-02-24", assignedTo: "Support Team A" },
  { id: "TKT-010", subject: "Cannot access learning hub videos", user: "Emma Wilson", priority: "low", status: "open", category: "technical", createdDate: "2025-02-26", assignedTo: "Support Team A" },
  { id: "TKT-011", subject: "Bulk import CSV format error", user: "Alex Turner", priority: "high", status: "open", category: "technical", createdDate: "2025-02-27", assignedTo: "Support Team A" },
  { id: "TKT-012", subject: "Payment method update failed", user: "Fatima Al-Rashid", priority: "medium", status: "resolved", category: "billing", createdDate: "2025-02-21", assignedTo: "Support Team B" },
];

export const courses: Course[] = [
  { id: "CRS-001", title: "Dropshipping Fundamentals", category: "Getting Started", lessons: 12, enrolled: 2456, completionRate: 78, status: "published", instructor: "Lakshay Takkar" },
  { id: "CRS-002", title: "Finding Winning Products", category: "Product Research", lessons: 8, enrolled: 1890, completionRate: 65, status: "published", instructor: "Lakshay Takkar" },
  { id: "CRS-003", title: "Facebook Ads Mastery", category: "Marketing", lessons: 15, enrolled: 1234, completionRate: 52, status: "published", instructor: "Vikram Singh" },
  { id: "CRS-004", title: "Shopify Store Setup A-Z", category: "Store Building", lessons: 10, enrolled: 3120, completionRate: 84, status: "published", instructor: "Karan Gupta" },
  { id: "CRS-005", title: "TikTok Ads for Ecommerce", category: "Marketing", lessons: 9, enrolled: 987, completionRate: 45, status: "published", instructor: "Sneha Patel" },
  { id: "CRS-006", title: "Supplier Negotiation Tactics", category: "Operations", lessons: 6, enrolled: 654, completionRate: 71, status: "published", instructor: "Lakshay Takkar" },
  { id: "CRS-007", title: "AI-Powered Product Photography", category: "AI Tools", lessons: 7, enrolled: 876, completionRate: 59, status: "published", instructor: "Vikram Singh" },
  { id: "CRS-008", title: "Scaling to $10K/Month", category: "Growth", lessons: 11, enrolled: 1567, completionRate: 38, status: "published", instructor: "Lakshay Takkar" },
  { id: "CRS-009", title: "Google Ads for Dropshipping", category: "Marketing", lessons: 13, enrolled: 432, completionRate: 28, status: "draft", instructor: "Karan Gupta" },
  { id: "CRS-010", title: "Advanced Fulfillment Strategies", category: "Operations", lessons: 8, enrolled: 0, completionRate: 0, status: "draft", instructor: "Sneha Patel" },
];

export const revenueMetrics: RevenueMetric[] = [
  { month: "Sep", mrr: 8900, newSubscriptions: 45, churn: 8, revenue: 8900 },
  { month: "Oct", mrr: 10200, newSubscriptions: 52, churn: 11, revenue: 10200 },
  { month: "Nov", mrr: 11800, newSubscriptions: 61, churn: 9, revenue: 11800 },
  { month: "Dec", mrr: 12500, newSubscriptions: 48, churn: 14, revenue: 12500 },
  { month: "Jan", mrr: 13900, newSubscriptions: 67, churn: 12, revenue: 13900 },
  { month: "Feb", mrr: 15200, newSubscriptions: 73, churn: 10, revenue: 15200 },
];

export const planTiers: PlanTier[] = [
  { id: "PLN-001", name: "Free", price: 0, features: ["5 product imports", "Basic research", "Community access"], userCount: 4520, revenue: 0 },
  { id: "PLN-002", name: "Starter", price: 29, features: ["50 product imports", "Advanced research", "1 store connection", "Email support", "Basic analytics"], userCount: 1890, revenue: 54810 },
  { id: "PLN-003", name: "Pro", price: 79, features: ["Unlimited imports", "AI Ad Studio", "3 store connections", "Priority support", "Competitor spy", "Advanced analytics"], userCount: 2340, revenue: 184860 },
  { id: "PLN-004", name: "Enterprise", price: 199, features: ["Everything in Pro", "Unlimited stores", "Dedicated account manager", "Custom integrations", "API access", "White-label options"], userCount: 156, revenue: 31044 },
];

export const helpCenterArticles = [
  {
    category: "Getting Started",
    articles: [
      { title: "How to create your account", content: "Sign up at usdrop.ai with your email or Google account. Complete the onboarding questionnaire to personalize your experience." },
      { title: "Connecting your Shopify store", content: "Go to Settings > Integrations > Shopify. Click 'Connect Store' and authorize USDrop AI in your Shopify admin panel." },
      { title: "Importing your first product", content: "Browse the product catalog, click on a product you like, then click 'Import to Store'. Choose your store and customize the listing." },
    ],
  },
  {
    category: "Products & Research",
    articles: [
      { title: "Using the product research tool", content: "Navigate to Product Hunt to browse trending products. Filter by category, price range, and supplier. Use the AI score to identify winners." },
      { title: "Understanding product metrics", content: "Each product shows profit margin, order volume, supplier rating, and trend direction. Green arrows indicate rising demand." },
      { title: "Saving products to your library", content: "Click the bookmark icon on any product to save it to My Products. You can organize saved products into collections." },
    ],
  },
  {
    category: "Billing & Plans",
    articles: [
      { title: "Upgrading your plan", content: "Go to Settings > Subscription. Choose your new plan and confirm. The upgrade takes effect immediately with prorated billing." },
      { title: "Canceling your subscription", content: "Visit Settings > Subscription > Cancel Plan. Your access continues until the end of the current billing period." },
      { title: "Payment methods accepted", content: "We accept Visa, Mastercard, American Express, and PayPal. All payments are processed securely through Stripe." },
    ],
  },
  {
    category: "Technical Support",
    articles: [
      { title: "Troubleshooting store connection", content: "If your store won't connect, ensure you have admin access in Shopify. Try disconnecting and reconnecting. Clear your browser cache." },
      { title: "Product import errors", content: "Common import errors include image size limits (max 20MB) and description length (max 5000 chars). Check the error message for specifics." },
      { title: "Browser compatibility", content: "USDrop AI works best on Chrome, Firefox, Safari, and Edge. Ensure your browser is updated to the latest version." },
    ],
  },
];
