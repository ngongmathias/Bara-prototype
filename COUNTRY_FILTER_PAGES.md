# Pages Affected by Country Selection in Navbar

This document lists all pages that should respect the country selected in the navbar and filter their content accordingly.

## ✅ Pages Currently Using Country Filter

### 1. **Landing Pages** (All Variants)
- **Files:**
  - `src/pages/LandingPage.tsx`
  - `src/pages/LandingPageV2.tsx`
  - `src/pages/LandingPageV3.tsx`
  - `src/pages/LandingPageFinal.tsx`
- **Status:** ✅ Working
- **What it filters:** Country selection dropdown, featured businesses, RSS feeds
- **Implementation:** Uses `useCountrySelection()` hook

### 2. **Category Listings Page**
- **File:** `src/pages/CategoryListingsPage.tsx`
- **URL:** `/listings/category/{categorySlug}` (e.g., `/listings/category/restaurants`)
- **Status:** ✅ **JUST FIXED**
- **What it filters:** Businesses in the selected category
- **Implementation:** Now uses `useCountrySelection()` and filters by `country_id`

### 3. **Events Page**
- **File:** `src/pages/EventsPage.tsx`
- **URL:** `/events`
- **Status:** ✅ Working
- **What it filters:** Events by country
- **Implementation:** Uses `useCountrySelection()` hook

---

## ⚠️ Pages That SHOULD Use Country Filter (Need Review)

### 4. **Business Listings Page (Main)**
- **File:** `src/pages/ListingsPage.tsx`
- **URL:** `/listings`
- **Status:** ⚠️ **NEEDS CHECKING**
- **What it should filter:** Categories should show count per country
- **Current Implementation:** Shows all categories globally
- **Recommendation:** Add country filter to category counts

### 5. **Marketplace Page**
- **File:** `src/pages/MarketplacePage.tsx`
- **URL:** `/marketplace`
- **Status:** ⚠️ **NEEDS CHECKING**
- **What it should filter:** Products by country/region
- **Current Implementation:** Uses mock data (not connected to database)
- **Recommendation:** When connected to real products, add country filter

### 6. **City Detail Page**
- **File:** `src/pages/CityDetailPage.tsx`
- **URL:** `/{citySlug}`
- **Status:** ⚠️ **NEEDS CHECKING**
- **What it should filter:** Businesses in the city
- **Current Implementation:** Unknown - needs review
- **Recommendation:** Should filter by city AND respect country selection

### 7. **Country Listings Page**
- **File:** `src/pages/CountryListingsPage.tsx`
- **URL:** `/country/{countryCode}/listings`
- **Status:** ⚠️ **NEEDS CHECKING**
- **What it should filter:** All businesses in the country
- **Current Implementation:** Unknown - needs review
- **Recommendation:** Should automatically set country selection

### 8. **Global Africa Page**
- **File:** `src/pages/GlobalAfricaPage.tsx`
- **URL:** `/global-africa`
- **Status:** ⚠️ **NEEDS CHECKING**
- **What it should filter:** Diaspora communities
- **Current Implementation:** Unknown - needs review
- **Recommendation:** May not need country filter (shows all diaspora)

---

## 🔍 How Country Filter Works

### Context Provider
- **File:** `src/context/CountrySelectionContext.tsx`
- **Storage:** Uses `localStorage` with key `bara_selected_country`
- **Persistence:** Country selection persists across page reloads

### Usage Pattern
```typescript
import { useCountrySelection } from '@/context/CountrySelectionContext';

const MyPage = () => {
  const { selectedCountry } = useCountrySelection();
  
  useEffect(() => {
    // Fetch data filtered by selectedCountry.id
    if (selectedCountry) {
      query = query.eq('country_id', selectedCountry.id);
    }
  }, [selectedCountry]);
};
```

### Country Object Structure
```typescript
interface SelectedCountry {
  id: string;           // UUID from database
  name: string;         // e.g., "Rwanda"
  code: string;         // e.g., "RW"
  flag_url?: string;    // Optional flag image URL
  flag_emoji?: string;  // Optional flag emoji
}
```

---

## 🛠️ Implementation Checklist

To add country filtering to a page:

1. ✅ Import the hook:
   ```typescript
   import { useCountrySelection } from '@/context/CountrySelectionContext';
   ```

2. ✅ Use the hook in your component:
   ```typescript
   const { selectedCountry } = useCountrySelection();
   ```

3. ✅ Add `selectedCountry` to your `useEffect` dependencies:
   ```typescript
   useEffect(() => {
     fetchData();
   }, [selectedCountry]); // Re-fetch when country changes
   ```

4. ✅ Filter your Supabase query:
   ```typescript
   let query = supabase.from('table').select('*');
   
   if (selectedCountry) {
     query = query.eq('country_id', selectedCountry.id);
   }
   ```

---

## 📊 Database Schema Requirements

For a table to support country filtering, it must have:

- **Column:** `country_id` (UUID, foreign key to `countries` table)
- **Relation:** Join to `countries` table for country details
- **Index:** For performance on large tables

Example:
```sql
-- In your table
country_id UUID REFERENCES countries(id)

-- Create index
CREATE INDEX idx_table_country_id ON table_name(country_id);
```

---

## 🎯 Testing Country Filter

1. **Select a country** from the navbar dropdown (e.g., Rwanda)
2. **Navigate to the page** you want to test
3. **Verify** that only content from that country is shown
4. **Change country** in navbar
5. **Verify** that content updates automatically

---

## 📝 Notes

- **Default Behavior:** If no country is selected, pages may show:
  - All countries (global view)
  - Or prompt user to select a country
  - This should be decided per page

- **URL Parameters:** Some pages use country in URL (e.g., `/country/RW/listings`)
  - These should sync with navbar selection
  - Or override navbar selection

- **Performance:** Always add database indexes on `country_id` columns for fast filtering

---

## 🚀 Next Steps

1. ✅ **CategoryListingsPage** - Fixed!
2. ⏳ **Review ListingsPage** - Check if category counts should be per-country
3. ⏳ **Review MarketplacePage** - Add country filter when products are real
4. ⏳ **Review CityDetailPage** - Ensure it respects country selection
5. ⏳ **Review CountryListingsPage** - Ensure it syncs with navbar

---

**Last Updated:** December 12, 2024
**Status:** CategoryListingsPage fixed, other pages need review
