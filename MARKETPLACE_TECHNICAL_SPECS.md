# BARA Marketplace - Technical Specification Document
## Dubizzle-Style Classified Ads Platform

---

## 1. OVERVIEW

### 1.1 Project Scope
Complete redesign of BARA Marketplace to follow Dubizzle.com's classified ads model with:
- Multiple main categories (Property, Motors, Jobs, Classifieds, etc.)
- Country-based filtering (using BARA Global countries)
- Category-specific page layouts and filters
- Comprehensive admin management system

**IMPORTANT:**
- **Fresh Start:** Delete all existing marketplace code and start from scratch
- **Design Consistency:** Maintain BARA's site-wide black & white, chic, seamless design theme
  - No colored hero bars (except category-specific accents where needed)
  - Minimal section dividers
  - Clean, single-page layouts per route
  - Consistent typography and spacing with rest of site
  - Black & white base with minimal accent colors

### 1.2 Main Categories
1. **Property for Sale**
2. **Property for Rent**
3. **Motors** (Vehicles)
4. **Classifieds** (General items)
5. **Jobs**
6. **Furniture & Garden**
7. **Mobile & Tablets**

---

## 2. DATABASE SCHEMA

### 2.1 Core Tables

#### `marketplace_categories`
```sql
CREATE TABLE marketplace_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(50),
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Initial Categories:**
- property-sale
- property-rent
- motors
- classifieds
- jobs
- furniture-garden
- mobile-tablets

#### `marketplace_subcategories`
```sql
CREATE TABLE marketplace_subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES marketplace_categories(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(category_id, slug)
);
```

**Example Subcategories:**
- Property Sale: properties, apartments, villas, off-plan, new-projects
- Property Rent: properties, apartments, villas, rooms, monthly-properties
- Motors: used-cars, new-cars, export-cars, rental-cars, motorcycles
- Classifieds: general, mobile-phones, home-appliances, furniture, electronics
- Jobs: general, sales-business, accounting-finance, secretarial, driver-delivery

#### `marketplace_listings`
```sql
CREATE TABLE marketplace_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES marketplace_categories(id) ON DELETE CASCADE,
  subcategory_id UUID REFERENCES marketplace_subcategories(id) ON DELETE SET NULL,
  country_id UUID REFERENCES countries(id) ON DELETE CASCADE,
  
  -- Basic Info
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(15, 2),
  currency VARCHAR(10) DEFAULT 'USD',
  price_type VARCHAR(20), -- 'fixed', 'negotiable', 'yearly', 'monthly'
  
  -- Contact Info
  seller_name VARCHAR(100) NOT NULL,
  seller_email VARCHAR(255) NOT NULL,
  seller_phone VARCHAR(50),
  seller_whatsapp VARCHAR(50),
  seller_type VARCHAR(20), -- 'individual', 'dealer', 'agent', 'company'
  
  -- Location
  location_details TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Status & Verification
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'active', 'sold', 'expired', 'rejected'
  is_featured BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP,
  
  -- Metadata
  views_count INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_listings_category ON marketplace_listings(category_id);
CREATE INDEX idx_listings_subcategory ON marketplace_listings(subcategory_id);
CREATE INDEX idx_listings_country ON marketplace_listings(country_id);
CREATE INDEX idx_listings_status ON marketplace_listings(status);
CREATE INDEX idx_listings_created ON marketplace_listings(created_at DESC);
```

#### `marketplace_listing_images`
```sql
CREATE TABLE marketplace_listing_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_listing_images_listing ON marketplace_listing_images(listing_id);
```

#### `marketplace_listing_attributes`
```sql
CREATE TABLE marketplace_listing_attributes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  attribute_key VARCHAR(100) NOT NULL,
  attribute_value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(listing_id, attribute_key)
);

CREATE INDEX idx_listing_attributes_listing ON marketplace_listing_attributes(listing_id);
```

**Category-Specific Attributes:**

**Motors:**
- make, model, year, kilometers, transmission, body_type, fuel_type, color, specs, condition

**Property (Sale/Rent):**
- property_type, bedrooms, bathrooms, sqft, furnished, ready_status, completion_date

**Jobs:**
- job_type, employment_type, salary_min, salary_max, experience_required, qualification_required, industry

**Classifieds/Furniture/Mobile:**
- condition, brand, warranty, age, usage_status

---

## 3. FRONTEND ARCHITECTURE

### 3.1 Page Structure

```
/marketplace
  ├── /                           → Marketplace Hub (category selection)
  ├── /property-sale              → Property for Sale page
  │   └── /:country/:subcategory  → Filtered property listings
  ├── /property-rent              → Property for Rent page
  │   └── /:country/:subcategory  → Filtered property listings
  ├── /motors                     → Motors/Vehicles page
  │   └── /:country/:subcategory  → Filtered vehicle listings
  ├── /classifieds                → Classifieds page
  │   └── /:country/:subcategory  → Filtered classified listings
  ├── /jobs                       → Jobs page
  │   └── /:country/:subcategory  → Filtered job listings
  ├── /furniture-garden           → Furniture & Garden page
  ├── /mobile-tablets             → Mobile & Tablets page
  ├── /listing/:id                → Individual listing detail page
  └── /post                       → Create new listing (multi-step form)
```

### 3.2 Component Architecture

#### **Shared Components:**
- `MarketplaceLayout.tsx` - Common layout wrapper
- `CategoryTabs.tsx` - Main category navigation tabs
- `CountrySelector.tsx` - Country dropdown/filter
- `ListingCard.tsx` - Base listing card (extended per category)
- `SearchBar.tsx` - Category-specific search
- `FilterBar.tsx` - Dynamic filters based on category
- `FeaturedListings.tsx` - Featured/promoted listings section

#### **Category-Specific Components:**

**Property Components:**
```
/components/marketplace/property/
  ├── PropertyFilterBar.tsx       → Purpose, Location, Type, Price, Beds, Baths
  ├── PropertyCard.tsx            → Property listing card with image, price, specs
  ├── PropertyHero.tsx            → Hero section with search
  ├── AreaFilters.tsx             → Popular area quick filters
  └── PropertyDetailView.tsx      → Full property details page
```

**Motors Components:**
```
/components/marketplace/motors/
  ├── MotorsFilterBar.tsx         → Make/Model, Year, Price, Kilometers
  ├── MotorCard.tsx               → Vehicle card with specs
  ├── BrandFilters.tsx            → Popular brand quick filters
  └── MotorDetailView.tsx         → Full vehicle details page
```

**Jobs Components:**
```
/components/marketplace/jobs/
  ├── JobsHero.tsx                → Red hero banner with search
  ├── JobCard.tsx                 → Job listing card
  ├── PopularJobs.tsx             → Featured jobs section
  ├── JobsByCategory.tsx          → Category cards with images
  ├── JobsByQualification.tsx     → Qualification filter section
  └── JobDetailView.tsx           → Full job details page
```

**Classifieds Components:**
```
/components/marketplace/classifieds/
  ├── ClassifiedsHero.tsx         → Hero with category counts
  ├── ClassifiedCard.tsx          → Item card with image, price
  ├── CategoryCounts.tsx          → Top category statistics
  └── ClassifiedDetailView.tsx    → Full item details page
```

### 3.3 State Management

**Context Providers:**
```typescript
// MarketplaceContext.tsx
interface MarketplaceContextType {
  selectedCategory: string;
  selectedCountry: Country | null;
  searchQuery: string;
  filters: Record<string, any>;
  listings: Listing[];
  loading: boolean;
  setCategory: (category: string) => void;
  setCountry: (country: Country) => void;
  setFilters: (filters: Record<string, any>) => void;
  fetchListings: () => Promise<void>;
}
```

### 3.4 TypeScript Interfaces

```typescript
// types/marketplace.ts

export interface MarketplaceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  display_order: number;
  is_active: boolean;
}

export interface MarketplaceSubcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  icon: string;
  display_order: number;
}

export interface MarketplaceListing {
  id: string;
  category_id: string;
  subcategory_id: string;
  country_id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  price_type: 'fixed' | 'negotiable' | 'yearly' | 'monthly';
  seller_name: string;
  seller_email: string;
  seller_phone?: string;
  seller_whatsapp?: string;
  seller_type: 'individual' | 'dealer' | 'agent' | 'company';
  location_details: string;
  status: 'pending' | 'active' | 'sold' | 'expired' | 'rejected';
  is_featured: boolean;
  is_verified: boolean;
  views_count: number;
  favorites_count: number;
  images: ListingImage[];
  attributes: Record<string, string>;
  created_at: string;
  expires_at: string;
}

export interface ListingImage {
  id: string;
  listing_id: string;
  image_url: string;
  display_order: number;
  is_primary: boolean;
}

// Category-specific interfaces
export interface PropertyListing extends MarketplaceListing {
  attributes: {
    property_type: 'apartment' | 'villa' | 'townhouse' | 'penthouse';
    bedrooms: string;
    bathrooms: string;
    sqft: string;
    furnished: 'yes' | 'no' | 'semi';
    ready_status?: 'ready' | 'off-plan';
    completion_date?: string;
  };
}

export interface MotorListing extends MarketplaceListing {
  attributes: {
    make: string;
    model: string;
    year: string;
    kilometers: string;
    transmission: 'automatic' | 'manual';
    body_type: string;
    fuel_type: string;
    color: string;
    specs: string;
    condition: 'new' | 'used';
  };
}

export interface JobListing extends MarketplaceListing {
  attributes: {
    job_type: string;
    employment_type: 'full-time' | 'part-time' | 'contract' | 'freelance';
    salary_min: string;
    salary_max: string;
    experience_required: string;
    qualification_required: string;
    industry: string;
  };
}
```

---

## 4. ADMIN MANAGEMENT SYSTEM

### 4.1 Admin Pages Structure

```
/admin/marketplace
  ├── /dashboard              → Overview stats, recent listings
  ├── /categories             → Manage categories & subcategories
  ├── /listings               → All listings management
  │   ├── /pending            → Pending approval listings
  │   ├── /active             → Active listings
  │   ├── /expired            → Expired listings
  │   └── /rejected           → Rejected listings
  ├── /featured               → Manage featured/promoted listings
  ├── /reports                → Analytics & reports
  └── /settings               → Marketplace settings
```

### 4.2 Admin Components

#### **Dashboard Component:**
```typescript
// AdminMarketplaceDashboard.tsx
- Total listings by category (pie chart)
- Pending approvals count
- Recent listings table
- Revenue from featured listings
- Popular categories
- Listings by country (bar chart)
```

#### **Categories Management:**
```typescript
// AdminMarketplaceCategories.tsx
- List all categories with subcategories
- Add/Edit/Delete categories
- Reorder categories (drag & drop)
- Toggle active/inactive status
- Manage subcategories per category
```

#### **Listings Management:**
```typescript
// AdminMarketplaceListings.tsx
Features:
- Filter by category, status, country, date range
- Search by title, seller name, ID
- Bulk actions (approve, reject, feature, delete)
- Quick edit modal for basic fields
- View full listing details
- Moderate images
- Manage expiry dates
- Export to CSV
```

#### **Featured Listings Management:**
```typescript
// AdminFeaturedListings.tsx
- Set featured status
- Set featured duration
- Set featured position/priority
- Pricing for featured placement
- Revenue tracking
```

### 4.3 Admin Database Tables

#### `marketplace_admin_actions`
```sql
CREATE TABLE marketplace_admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  admin_user_id UUID REFERENCES auth.users(id),
  action_type VARCHAR(50) NOT NULL, -- 'approved', 'rejected', 'featured', 'expired', 'deleted'
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `marketplace_featured_pricing`
```sql
CREATE TABLE marketplace_featured_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES marketplace_categories(id),
  duration_days INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 5. USER FEATURES

### 5.1 Listing Creation Flow

**Multi-Step Form:**
1. **Category Selection** - Choose main category
2. **Subcategory Selection** - Choose specific subcategory
3. **Location** - Select country
4. **Basic Details** - Title, description, price
5. **Category-Specific Fields** - Dynamic form based on category
6. **Images Upload** - Upload multiple images (drag & drop)
7. **Contact Information** - Seller details
8. **Review & Submit** - Preview and submit

### 5.2 User Dashboard

```
/user/marketplace
  ├── /my-listings            → User's active listings
  ├── /favorites              → Saved/favorited listings
  ├── /messages               → Inquiries received
  └── /post-ad                → Create new listing
```

### 5.3 Search & Filters

**Global Search:**
- Search across all categories
- Auto-suggest based on category
- Recent searches
- Popular searches

**Category-Specific Filters:**

**Property:**
- Purpose (Buy/Rent)
- Property Type
- Price Range
- Bedrooms
- Bathrooms
- Area (sqft)
- Furnished status
- Completion status

**Motors:**
- Make & Model
- Year Range
- Price Range
- Kilometers
- Transmission
- Body Type
- Fuel Type
- Condition

**Jobs:**
- Job Type
- Employment Type
- Salary Range
- Experience Level
- Qualification
- Industry

**Classifieds:**
- Condition
- Price Range
- Brand
- Age/Usage

---

## 6. API ENDPOINTS

### 6.1 Public Endpoints

```
GET    /api/marketplace/categories
GET    /api/marketplace/categories/:slug/subcategories
GET    /api/marketplace/listings
GET    /api/marketplace/listings/:id
POST   /api/marketplace/listings/:id/view
POST   /api/marketplace/listings/:id/favorite
GET    /api/marketplace/search
GET    /api/marketplace/featured
```

### 6.2 Authenticated User Endpoints

```
POST   /api/marketplace/listings
PUT    /api/marketplace/listings/:id
DELETE /api/marketplace/listings/:id
GET    /api/marketplace/my-listings
POST   /api/marketplace/listings/:id/images
DELETE /api/marketplace/listings/:id/images/:imageId
```

### 6.3 Admin Endpoints

```
GET    /api/admin/marketplace/stats
GET    /api/admin/marketplace/listings
PUT    /api/admin/marketplace/listings/:id/approve
PUT    /api/admin/marketplace/listings/:id/reject
PUT    /api/admin/marketplace/listings/:id/feature
DELETE /api/admin/marketplace/listings/:id
GET    /api/admin/marketplace/categories
POST   /ap0: Cleanup & Preparation (Day 1)
- **Delete existing marketplace files:**
  - Remove `src/pages/MarketplacePage.tsx`
  - Remove any marketplace-related components
  - Remove old marketplace migrations (if any)
  - Clean up marketplace routes from `App.tsx`
- Create new folder structure for marketplace
- Set up base layout matching BARA's design system

### Phase i/admin/marketplace/categories
PUT    /api/admin/marketplace/categories/:id
DELETE /api/admin/marketplace/categories/:id
```bs (lack & white deign)
on
- Base components follwing BARA's desig theme
---

## 7. IMPLEMENTATION PHASES

### Phase 1: Foundation (Week 1)
- Database schema & migrations
- Basic category/subcategory setup
- Marketplace hub page with category tabs
- Country selector integration

### Phase 2: Motors Category (Week 2)
- Motors page layout
- Vehicle listing cards
- Filters (make, model, year, price)
- Vehicle detail page
- Admin management for motors

### Phase 3: Property Categories (Week 3)
- Property for Sale page
- Property for Rent page
- Property-specific filters
- Property detail page
- Admin management for property

### Phase 4: Jobs Category (Week 4)
- Jobs page with hero
- Job cards and categories
- Jobs by qualification
- Job detail page
- Admin management for jobs

### Phase 5: Classifieds & Others (Week 5)
- Classifieds page
- Furniture & Garden page
- Mobile & Tablets page
- Category counts
- Admin management

### Phase 6: User Features (Week 6)
- Listing creation flow
- User dashboard
- My listings management
- Favorites system
- Image upload system

### Phase 7: Admin & Polish (Week 7)
- Complete admin dashboard
- Analytics & reports
- Featured listings system
- Moderation tools
- Testing & bug fixes

---

## 8. TECHNICAL CONSIDERATIONS

### 8.1 Image Storage
- Use Supabase Storage for listing images
- Image optimization (compress, resize)
- Multiple image sizes (thumbnail, medium, large)
- CDN for fast delivery

### 8.2 Search Implementation
- PostgreSQL full-text search for basic search
- Consider Algolia/Meilisearch for advanced search
- Search indexing on title, description, attributes

### 8.3 Performance
- Pagination (20-50 items per page)
- Lazy loading for images
- Caching for popular searches
- Database indexes on frequently queried fields

### 8.4 Security
- Rate limiting on listing creation
- Image upload validation
- XSS protection in descriptions
- Admin role verification
- Listing ownership verification

### 8.5 SEO
- Dynamic meta tags  (FollowrngeBAdA's Sit -WideaThemem
**BaseaCglo)s(Prm):**
- BatkgreumaenWhiteionFFF
- Clea Primaryn URLs with slugs
- Text Secondary:, # (Minimalist Design)
**All cards follow BARA's clean aesthetic:**
- White background with subtle border
- No shadows or heavy styling
- Clean typography hierarchy
- Minimal use of icons
- Hover states: subtle border color change

**Specific Layouts:**999999 text
 B**orders:Li**ght Gray (#E5E5E5,  (bold)#F5F5F5)in clean minimal 
**** (bold)in clean subtle indictor
**** Colo** Minimalri (Minimal  (bold)Use)** range
- **CategoryActi**ve Tab: Subte accnte (bold).g., thin undtion, erme posted

**Clnsisteicy:**
- Match existing Listings page card design
- Same spacingn borders, and typography
-eSeamless integraghon with site thet backgroud)
- Lin: Black with underline (hover: gray)
--Verifid BadgeMinimal gindicat
-Fatued Badge: Mnmal gold/yllow inicator
-CTA Buttons: Black ckgroun, white text

**Desin Philosophy:**
- Maintain BARA's chic, minimalist athetic
 Avoidlrge colored heo sections (use clea whte backgrouds with subtle imagery)
- Use typoraphyhierchy istado color emphasis
- Consistent with Hompge, Lisings, Evntsp
## 9. DESIGN SYSTEM

### 9.1 Color Scheme
- Primary: Red (#E52535) - for active category tabs
- Secondary: Gray (#F5F5F5) - for inactive tabs
- Text: Black (#000000) for headings, Gray (#666666) for body
- Accent: Blue (#0066FF) for links
- Success: Green for verified badges
- Warning: Orange for featured badges

### 9.2 Typography
- Headings: Bold, 24-32px
- Body: Regular, 14-16px
- Price: Bold, 18-24px
- Labels: Medium, 12-14px

### 9.3 Card Layouts
- Property: Large image, price, specs row, location, contact buttons
- Motors: Image carousel, price, specs grid, dealer badge
- Jobs: Icon, title, employment type, salary, location
- Classifieds: Square image, price, title, location, time

---

## 10. NEXT STEPS

1. **Review & Approve** this specification
2. **Create database migrations** for all tables
3. **Set up base components** and routing
4. **Implement Phase 1** (Foundation)
5. **Build one complete category** as prototype (Motors recommended)
6. **Iterate and expand** to other categories
7. **Admin system** development
8. **Testing & refinement**
9. **Launch**

---

**Document Version:** 1.0  
**Last Updated:** January 2, 2026  
**Status:** Awaiting Approval
