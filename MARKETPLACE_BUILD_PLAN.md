# Marketplace Build Plan - Remaining Features

## Status Check: What's Already Working ✅

### Pages Built
- ✅ MarketplaceHub - Category grid
- ✅ PropertyPage - With clickable cards
- ✅ MotorsPageNew - With clickable cards  
- ✅ ClassifiedsPage
- ✅ JobsPage
- ✅ CategoryPage (generic)
- ✅ ListingDetailPage - Full Dubizzle-style details

### Database
- ✅ Complete schema with all necessary fields
- ✅ Categories and subcategories seeded
- ✅ Test data for Rwanda

---

## Build Order: Critical to Nice-to-Have

### PHASE 1: Core Functionality (Critical - Start Here)

#### 1.1 Make All Cards Clickable ⚡
**Status:** PropertyPage & MotorsPageNew done, need to check/fix:
- [ ] ClassifiedsPage
- [ ] JobsPage  
- [ ] CategoryPage
- [ ] MarketplaceHub category cards

**Priority:** CRITICAL - Users can't view details without this

---

#### 1.2 Fix Filters to Actually Work ⚡
**Current State:** Filters display but don't filter results
**Need to implement:**
- [ ] Country filter - Filter by selected country
- [ ] Subcategory filter - Filter by property type, car make, job type, etc.
- [ ] Price range filter - Min/max price filtering
- [ ] Car-specific: Make, Model, Year, Transmission
- [ ] Property-specific: Beds, Baths, Property Type
- [ ] Jobs-specific: Job Type, Salary Range, Experience Level

**Files to update:**
- `PropertyPage.tsx` - Add filter logic to fetchListings
- `MotorsPageNew.tsx` - Add filter logic to fetchListings
- `CategoryPage.tsx` - Add filter logic to fetchListings
- `JobsPage.tsx` - Add filter logic to fetchListings
- `ClassifiedsPage.tsx` - Add filter logic to fetchListings

**Priority:** CRITICAL - Filters are displayed but useless

---

#### 1.3 Post a Listing Form ⚡
**What to build:**
- [ ] Multi-step form component
- [ ] Step 1: Select category and subcategory
- [ ] Step 2: Basic info (title, description, price)
- [ ] Step 3: Category-specific attributes (car specs, property details, etc.)
- [ ] Step 4: Contact information
- [ ] Step 5: Location details
- [ ] Step 6: Image upload (up to 10 images)
- [ ] Step 7: Review and submit

**New files:**
- `src/pages/marketplace/PostListing.tsx` - Main form component
- `src/components/marketplace/PostListingSteps/` - Step components

**Route:** `/marketplace/post`

**Priority:** CRITICAL - Users need to add listings

---

### PHASE 2: User Management (High Priority)

#### 2.1 User Dashboard for Listings
**What to build:**
- [ ] My Listings page - View all user's listings
- [ ] Edit listing functionality
- [ ] Delete listing functionality  
- [ ] Mark as sold/rented/filled
- [ ] Renew expired listings
- [ ] View statistics (views, favorites)

**New files:**
- `src/pages/marketplace/MyListings.tsx`
- `src/pages/marketplace/EditListing.tsx`

**Routes:** 
- `/marketplace/my-listings`
- `/marketplace/edit/:listingId`

**Priority:** HIGH - Users need to manage their listings

---

#### 2.2 Search Functionality
**What to build:**
- [ ] Global search bar in marketplace header
- [ ] Search across title, description, location
- [ ] Search results page
- [ ] Search filters
- [ ] Recent searches
- [ ] Popular searches

**New files:**
- `src/components/marketplace/MarketplaceSearch.tsx`
- `src/pages/marketplace/SearchResults.tsx`

**Route:** `/marketplace/search?q=...`

**Priority:** HIGH - Essential for usability

---

#### 2.3 Favorites/Saved Listings
**What to build:**
- [ ] Heart icon on listing cards
- [ ] Save/unsave functionality
- [ ] My Favorites page
- [ ] Database table: `marketplace_favorites`

**Database migration needed:**
```sql
CREATE TABLE marketplace_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);
```

**New files:**
- `src/pages/marketplace/MyFavorites.tsx`
- `src/hooks/useMarketplaceFavorites.ts`

**Route:** `/marketplace/favorites`

**Priority:** HIGH - Users want to save interesting listings

---

### PHASE 3: Enhanced Features (Medium Priority)

#### 3.1 Image Upload
**What to build:**
- [ ] Image upload component with drag & drop
- [ ] Image preview and reorder
- [ ] Set primary image
- [ ] Image compression before upload
- [ ] Upload to Supabase Storage
- [ ] Delete images

**New files:**
- `src/components/marketplace/ImageUploader.tsx`

**Storage bucket:** `marketplace-images`

**Priority:** MEDIUM - Required for post listing

---

#### 3.2 Report Listing
**What to build:**
- [ ] Report button on listing detail page
- [ ] Report modal with reason selection
- [ ] Database table: `marketplace_reports`
- [ ] Admin view of reports

**Database migration needed:**
```sql
CREATE TABLE marketplace_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Priority:** MEDIUM - Important for moderation

---

#### 3.3 Share Functionality
**What to build:**
- [ ] Share button on listing detail page
- [ ] Share modal with options:
  - Copy link
  - WhatsApp
  - Facebook
  - Twitter
  - Email

**New files:**
- `src/components/marketplace/ShareModal.tsx`

**Priority:** MEDIUM - Helps with viral growth

---

#### 3.4 View Counter
**What to build:**
- [ ] Increment view count on listing detail page load
- [ ] Display view count
- [ ] Track unique views (by IP or user)

**Database:** Already has `views_count` field

**Priority:** MEDIUM - Good for analytics

---

#### 3.5 Listing Expiration
**What to build:**
- [ ] Auto-expire listings after 30/60/90 days
- [ ] Cron job or scheduled function
- [ ] Email notification before expiration
- [ ] Renew listing functionality

**Database:** Already has `expires_at` field

**Priority:** MEDIUM - Keeps marketplace fresh

---

#### 3.6 Featured Listings
**What to build:**
- [ ] Mark listings as featured (premium)
- [ ] Display featured badge
- [ ] Featured listings appear first in results
- [ ] Payment integration for featuring

**Database:** Already has `is_featured` field

**Priority:** MEDIUM - Revenue opportunity

---

### PHASE 4: Admin Features (Medium Priority)

#### 4.1 Admin Marketplace Dashboard
**What to build:**
- [ ] Overview stats (total listings, active, pending, sold)
- [ ] Recent listings table
- [ ] Pending approval queue
- [ ] Revenue from featured listings

**New files:**
- `src/pages/admin/AdminMarketplace.tsx`

**Route:** `/admin/marketplace`

**Priority:** MEDIUM - Needed for management

---

#### 4.2 Approve/Reject Listings
**What to build:**
- [ ] Moderation queue
- [ ] Approve button
- [ ] Reject button with reason
- [ ] Email notifications to users

**Database:** Already has `status` field (pending/active/rejected)

**Priority:** MEDIUM - Quality control

---

#### 4.3 Category Management
**What to build:**
- [ ] Add/edit/delete categories
- [ ] Add/edit/delete subcategories
- [ ] Reorder categories
- [ ] Set category icons

**New files:**
- `src/pages/admin/AdminMarketplaceCategories.tsx`

**Route:** `/admin/marketplace/categories`

**Priority:** MEDIUM - Flexibility

---

#### 4.4 Analytics Dashboard
**What to build:**
- [ ] Listings by category chart
- [ ] Listings by country chart
- [ ] Views over time
- [ ] Popular searches
- [ ] Conversion rates

**New files:**
- `src/pages/admin/AdminMarketplaceAnalytics.tsx`

**Route:** `/admin/marketplace/analytics`

**Priority:** MEDIUM - Business insights

---

### PHASE 5: Advanced Features (Lower Priority)

#### 5.1 Map View
**What to build:**
- [ ] Map toggle on listing pages
- [ ] Show listings as pins on map
- [ ] Click pin to see listing preview
- [ ] Filter by map bounds

**Libraries:** Already have Leaflet/React-Leaflet

**Priority:** LOW - Nice to have

---

#### 5.2 Reviews/Ratings for Sellers
**What to build:**
- [ ] Rate seller after transaction
- [ ] Review text
- [ ] Display average rating
- [ ] Database tables for reviews

**Database migration needed:**
```sql
CREATE TABLE marketplace_seller_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  listing_id UUID REFERENCES marketplace_listings(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Priority:** LOW - Trust building

---

#### 5.3 Payment Integration
**What to build:**
- [ ] Stripe/PayPal integration
- [ ] Pay for featured listings
- [ ] Pay for premium placement
- [ ] Transaction history

**Priority:** LOW - Revenue feature

---

## Excluded Features (Per User Request)
- ❌ Chat/Messaging System
- ❌ Price Alerts
- ❌ Comparison Tool

---

## Next Steps

**Immediate actions:**
1. Make all listing cards clickable across all pages
2. Fix filters to actually filter results
3. Build Post a Listing form

**This week:**
4. User Dashboard for managing listings
5. Search functionality
6. Favorites feature

**This month:**
7. Image upload
8. Report listing
9. Share functionality
10. Admin dashboard
