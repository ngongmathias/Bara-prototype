# 🛍️ BARA Marketplace – Full E‑Commerce Blueprint

This document captures the **complete, modern e‑commerce vision** for the BARA Marketplace:

- Multi‑vendor marketplace tied to existing `businesses`
- Chic, sophisticated black & white design
- Interactive and animated (where it adds value)
- Full commerce workflow (browse → cart → checkout → order) with **payment ready**, but **payment providers wired later**
- A roadmap from core foundations to high‑tech, AI‑assisted features

---

## 1. Core Commerce Foundations (Phase 1)

### 1.1 Data Model (Supabase)

**Products** – `products`
- `id` (uuid, PK)
- `business_id` (uuid → `businesses.id`)
- `name`, `slug`
- `description`
- `images` (`text[]`) – multiple image URLs
- `thumbnail_url` (text)
- `price` (numeric)
- `currency` (text, e.g. `RWF`, `KES`, `USD`)
- `stock_quantity` (integer)
- `status` (`draft | active | archived`)
- `category_id` (uuid → `product_categories.id`)
- `attributes` (jsonb) – key/value pairs like size, color, material
- `is_featured` (boolean)
- `is_promoted` (boolean) – for sponsored placements later
- `created_at`, `updated_at` (timestamptz)

**Product Categories** – `product_categories`
- `id` (uuid)
- `name` (text)
- `slug` (text)
- `parent_id` (uuid, nullable) – for subcategories
- `icon` (text, optional)
- `is_active` (boolean)
- `sort_order` (integer)

**Carts & Orders** – payment‑ready

`carts`
- `id` (uuid)
- `user_id` (text, nullable) – Clerk `userId`
- `session_id` (text, nullable) – for guest carts
- `created_at`, `updated_at`

`cart_items`
- `id` (uuid)
- `cart_id` (uuid → `carts.id`)
- `product_id` (uuid → `products.id`)
- `quantity` (int)
- Snapshot fields for price at time of adding:
  - `unit_price`, `currency`

`orders`
- `id` (uuid)
- `user_id` (text, nullable)
- `status` (`pending | confirmed | shipped | completed | cancelled`)
- `total_amount` (numeric)
- `currency` (text)
- `payment_status` (`unpaid | payment_required | paid | failed | refunded`)
- `payment_provider` (text, nullable, e.g. `stripe`, `paystack`)
- `payment_reference` (text, nullable)
- `shipping_method` (text)
- `shipping_cost` (numeric, default 0)
- `shipping_address` (jsonb)
- `contact_email` (text)
- `contact_phone` (text)
- `notes` (text, nullable)
- `created_at`, `updated_at`

`order_items`
- `id` (uuid)
- `order_id` (uuid → `orders.id`)
- `product_id` (uuid)
- `business_id` (uuid)
- `quantity` (int)
- `unit_price` (numeric)
- `currency` (text)
- `subtotal` (numeric)

> **Important:** Payment fields are **designed now** so Stripe/Paystack/Flutterwave can be dropped in later without schema changes.

---

## 2. Customer Journey & UX

### 2.1 Marketplace Home – `/marketplace`

**Goal:** Discovery hub with a sophisticated, editorial feel.

- **Hero section**
  - Large black typography: “Discover products from African businesses”.
  - Centered search bar with subtle glow on focus.
  - Background: MatrixRain + soft white overlay (consistent with rest of site).

- **Sections**
  - **Featured Categories**: grid of chic category tiles.
  - **Featured Products**: animated carousel (Framer Motion) of promoted items.
  - **Trending / New Arrivals / Local Favorites**:
    - Horizontally scrollable rows with smooth snapping.

**Animations & Interactions**
- Cards lift slightly on hover (shadow + translateY).
- Sections fade/slide in on scroll.
- Skeleton loaders for products while data loads.

---

### 2.2 Product Listing (Category / Search Results)

**Layout:**
- Left (on desktop): filters panel.
- Right: products grid or list, with toggle.
- On mobile: filters slide up from bottom as a sheet.

**Filters:**
- Category (tree of categories/subcategories)
- Price range (min/max)
- Rating (≥ X stars)
- In stock only
- Location: country/city (integrate with existing location context)
- Seller: filter by business

**Sorting:**
- Relevance (default)
- Newest
- Price: low → high
- Price: high → low
- Rating

**Product Cards:**
- Image (slight zoom on hover), product name, price.
- Seller name + location (e.g. “Kigali, Rwanda”).
- Badges: `Trending`, `Best Seller`, `New`, `Limited`.
- `Add to Cart` button + heart (wishlist).

**Interactions:**
- Filter “chips” appear above results; each removable with a click.
- “Clear all filters” pill that animates when clicked.
- Infinite scroll or paginated with chic page controls.

---

### 2.3 Product Detail – `/marketplace/product/:slug`

**Layout:**
- **Left:** Image gallery
  - Main image with smooth fade/slide transitions.
  - Thumbnail strip (horizontal or vertical) with highlight animation on selection.
- **Right:**
  - Product title, price, discount (if any).
  - Availability (In Stock / Limited / Out of Stock).
  - Attributes (size, color, material, etc).
  - Seller card:
    - Business name, rating, city/country.
    - Link: “Visit Seller Page”.
  - Quantity selector.
  - Primary CTAs:
    - `Add to Cart`
    - `Buy Now` (shortcut: adds to cart then goes to checkout).

**Below the fold:**
- Detailed description (rich text).
- Specifications in a simple table.
- **Related Products** (same category).
- **More from this Seller**.
- **Reviews & Ratings** (see section 3).
- **Q&A** (product questions).

**Interactions & Motion:**
- Gentle entrance animation of content on page load.
- “Added to cart” feedback: toast + cart icon bounce.

---

### 2.4 Cart – `/cart`

**Features:**
- Line items:
  - Image, name, seller, price, quantity, subtotal.
  - Remove item, change quantity.
- Summary:
  - Subtotal, (future) shipping estimate, total.
  - “You may also like” / “Complete your order” suggestions.

**Interactions:**
- Quantity change animates number + subtotal.
- Removing item slides it out and gracefully reflows the list.

---

### 2.5 Checkout – `/checkout`

**Sections:**
1. Contact Info (name, email, phone).
2. Shipping Address.
3. Shipping Method (Pickup vs Delivery, etc.).
4. Payment Method **(placeholder)**:
   - Example: “Pay on Delivery”, “Pay Seller Directly (Mobile Money / Bank Transfer)”.
5. Order Summary.

**Workflow:**
1. Validate inputs client‑side.
2. On submit:
   - Create `order` + `order_items` with `payment_status = 'unpaid'` (or `payment_required`).
   - Optionally, store chosen payment method.
3. Redirect to Order Confirmation page with order ID.

**Ready for real payments later:**
- When integrating Stripe/Paystack/Flutterwave we can:
  - Insert a payment step between 4 and 5.
  - Update `payment_status` + `payment_reference` on success.

---

## 3. Social & Community Features (Phase 2)

### 3.1 Product Reviews & Ratings – `product_reviews`

**Table:**
- `id`, `product_id`, `user_id` (nullable), `customer_name`
- `rating` (1–5)
- `title`, `content`
- `images` (`text[]`)
- `verified_purchase` or `verified_contact` (boolean – tied to orders or inquiries later)
- `status` (`pending | approved | rejected`)
- `created_at`

**UI:**
- On product detail:
  - Average rating (stars) + count.
  - Distribution bar (e.g. 5★: 60%, 4★: 20%, etc.) – optional.
  - Review list with pagination.
- Review form:
  - Rating stars, title, text, photo upload.

**Moderation:**
- Admin view to approve/reject.

---

### 3.2 Q&A – Product Questions

**Table `product_questions` (optional):**
- `id`, `product_id`
- `question_text`, `asked_by_name`, `asked_by_user_id` (nullable)
- `answer_text`, `answered_by_user_id` (nullable)
- `status` (`open | answered | hidden`)
- `created_at`, `answered_at`

**UI:**
- Section on product page: “Questions about this product?”
- Customers can ask a question.
- Sellers or admins can answer from admin/seller dashboard.

---

## 4. Discovery, Personalization & "Cool" Features (Phase 2+)

### 4.1 Smart Search & Autocomplete

- **Autocomplete dropdown** under main search:
  - Product matches.
  - Category matches.
  - Business matches.
- **Basic sophistication:**
  - Typo tolerance and synonyms (design for, possibly via external search later).

### 4.2 Personalized Sections

Start simple, then evolve:

- **Recently Viewed**
  - Track last N products in localStorage + DB for logged‑in users.
  - Show a strip on home and product pages.

- **Simple Recommendations**
  - “Similar products” based on category + price range.
  - “More from this seller.”

Later, can move to more advanced recommendation algorithms.

### 4.3 Collections & Lookbooks

- Curated pages like:
  - “Back to School in Kigali”
  - “Weekend in Nairobi”
- Each collection is a handpicked list of products, shown in a clean grid with editorial‑style intro text.

---

## 5. Localization & Multi‑Vendor Goodies

- Every product is tied to a `business`:
  - True multi‑vendor marketplace.
- **Seller Storefronts:**
  - Each business gets a “Shop” view: `/marketplace/seller/:businessSlug`.
  - Shows logo, description, and their products.
- **Location Awareness:**
  - Default sort prioritizes products from user’s selected country/city.
  - Filter by country/city in search results.

- **Multi‑Currency (Design‑Ready):**
  - Prices stored in base currency; display currency can be switched.
  - Conversion happens in UI or via a rates table.
  - All UI elements able to show `amount + currency` cleanly.

---

## 6. Loyalty, Bundles & Growth

- **Wishlists / Favorites:**
  - Heart icon on product cards & detail page.
  - Persist per user in `wishlists` table (or `marketplace_wishlists`).

- **Bundles & Kits:**
  - “Frequently bought together” idea.
  - Start rule‑based (manual associations or category‑based), improve later.

- **Progress Bars:**
  - On cart/checkout: “Add $X more for free shipping” (configurable threshold).

- **Promotions:**
  - Time‑limited deals with countdown timers.
  - “Today’s Deals” section on marketplace homepage.

---

## 7. AI & Future‑Facing Ideas (Architecture‑Ready)

We design now so we can add these later without rewriting everything:

- **AI Product Description Helper (Admin)**
  - On product edit page, a button: “Generate description from title & attributes”.

- **AI Shopping Assistant**
  - Chat‑style helper: “Show me gifts under $50 from Kigali, fashion category.”
  - Uses existing products + filters.

- **Visual Similarity Search**
  - Click “See similar” on an image to find similar products.
  - Requires good image metadata and consistent attributes.

Nothing in the current schema blocks these future features.

---

## 8. Admin & Seller Experience

### 8.1 Admin – Products & Categories

New admin routes under `AdminLayout`:
- `/admin/marketplace/products`
- `/admin/marketplace/categories`
- `/admin/marketplace/orders`

**Admin – Products**
- List view with filters (business, category, status).
- Add/Edit product form with tabs:
  - **Details:** name, business, category, description.
  - **Images:** upload multiple via Supabase storage, reorder.
  - **Pricing:** price, currency, stock, status, flags.
  - **SEO:** meta title, meta description (optional).
- Actions:
  - Activate/Deactivate, feature/unfeature, duplicate product.

**Admin – Categories**
- CRUD for `product_categories`.
- Parent/child support.
- Sort order and active/inactive status.

### 8.2 Admin – Orders

- Orders list with filters:
  - Date range, status, payment status, business, customer.
- Order detail:
  - Customer info, shipping address.
  - Items grouped by business.
  - Status history.
- Actions:
  - Update `status` (e.g. pending → confirmed → shipped → completed).
  - Update `payment_status` (when offline payment confirmed).
  - Add internal notes.

### 8.3 (Later) Seller Dashboard

Separate from global admin:
- Business owners manage their own products & orders.
- Light analytics: views, sales, top products.

---

## 9. Design System & Animations

**Visual Style**
- Fully aligned with BARA’s black & white chic redesign:
  - White backgrounds, black typography.
  - Minimal accent colors used sparingly (e.g. for success/error or sponsored labels).
  - Soft borders and subtle shadows.

**Typography**
- Continue using existing fonts:
  - `Comfortaa` for headings (playful yet sophisticated).
  - `Roboto` for body text (clean and readable).

**Micro‑Interactions**
- Use Framer Motion and Tailwind transitions:
  - Fade/slide in sections on scroll.
  - Card hover scale + shadow.
   
- Buttons:
  - Hover: subtle background shift + shadow.
  - Active: slight scale‑in.

**Performance**
- Lazy‑load product images.
- Use skeletons for loading states.
- Paginate or infinite scroll for large lists.

---

## 10. Implementation Phasing (High Level)

### Phase 1 – Foundations (Core Commerce)
1. Supabase migrations for `products`, `product_categories`, `carts`, `cart_items`, `orders`, `order_items`.
2. Update TypeScript `Database` types and `supabase.ts` helpers.
3. Implement `CartContext` and local storage sync.
4. Replace mock `MarketplacePage` with real products from DB.
5. Implement product detail page.
6. Implement `/cart` and `/checkout` with offline/placeholder payment methods.
7. Admin CRUD for products and categories.
8. Admin orders list + detail + manual status updates.

### Phase 2 – Social & Discovery
9. Product reviews & ratings.
10. Product Q&A.
11. Recently viewed, simple recommendations.
12. Wishlist/favorites.
13. Collections / lookbooks.

### Phase 3 – Localization, Loyalty & Advanced Features
14. Seller storefronts.
15. Location‑aware sorting & filtering.
16. Bundles/kits & cross‑sell.
17. Free‑shipping progress bars & promotions.
18. Better search, autocomplete, and possibly external search integration.

### Phase 4 – AI & Payment Integrations
19. Integrate real payments (Stripe/Paystack/Flutterwave/etc.) using existing `payment_*` fields.
20. AI tools (description generator, shopping assistant, visual search).
21. Seller analytics dashboards.

---

## 11. Payment Strategy (Design Only for Now)

- Current workflow **creates orders and marks them unpaid**, but does not process payments.
- When ready to add a gateway:
  - Insert payment step into checkout.
  - Use `payment_provider` + `payment_reference` on success.
  - Update `payment_status` to `paid` and `status` to `confirmed`.
- This keeps **today’s work future‑proof** and avoids refactors later.

---

This file is the **single source of truth** for the BARA Marketplace implementation plan. We can pause work here, focus on other tasks, and return to this document later to implement features phase by phase.
