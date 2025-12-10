# BARA AFRICA - Advertising System Guide
**Complete Reference for Ad Management & Display**

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Ad Types & Tables](#ad-types--tables)
3. [How Ads Are Displayed](#how-ads-are-displayed)
4. [Country Targeting Explained](#country-targeting-explained)
5. [Display Position Controls](#display-position-controls)
6. [Multiple Ads Management](#multiple-ads-management)
7. [Ad Status & Lifecycle](#ad-status--lifecycle)
8. [Black & White Ad Design Specs](#black--white-ad-design-specs)
9. [Creating Test Ads](#creating-test-ads)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

BARA AFRICA has a sophisticated ad system that allows **country-specific advertising** across the platform. Advertisers can pay to promote tourism, businesses, or services on specific country pages or site-wide.

**Revenue Model**: You get paid for ads on:
- ✅ Country detail pages (`/countries/rwanda`)
- ✅ Category listings pages (`/listings/category/restaurant`)
- ✅ Main listings page (`/listings`)
- ✅ Events page (`/events`)
- ✅ Marketplace page (`/marketplace`)

---

## 📊 Ad Types & Tables

### **1. `banner_ads` Table** (Legacy System)
**Status**: Less actively used  
**Fields**:
- `id` - Unique identifier
- `title` - Ad title
- `image_url` - Banner image URL
- `redirect_url` - Where click goes
- `alt_text` - Accessibility text
- `is_active` - Active/inactive
- `start_date` / `end_date` - Campaign dates

**Use Case**: General banner ads without country targeting

---

### **2. `sponsored_banners` Table** (Main System) ⭐

**Status**: Primary ad system with advanced features

| Field | Type | Purpose | Example |
|-------|------|---------|---------|
| **`id`** | UUID | Unique identifier | `abc-123-def` |
| **`country_id`** | UUID | Links ad to specific country | Rwanda's ID |
| **`company_name`** | String | Advertiser name | "Visit Rwanda" |
| **`company_website`** | String | Click destination | `https://visitrwanda.com` |
| **`banner_image_url`** | String | Image URL | Storage bucket URL |
| **`banner_alt_text`** | String | Image description | "Visit Rwanda Tourism" |
| **`display_on_top`** | Boolean | Show in TopBannerAd component | `true` |
| **`display_on_bottom`** | Boolean | Show in BottomBannerAd component | `false` |
| **`show_on_country_detail`** | Boolean | Show on country pages | `true` |
| **`is_active`** | Boolean | Ad is live | `true` |
| **`payment_status`** | String | Payment state | `paid`, `pending`, `failed` |
| **`status`** | String | Approval state | `active`, `approved`, `pending` |
| **`view_count`** | Integer | Total views | `1,234` |
| **`click_count`** | Integer | Total clicks | `56` |

---

## 🖥️ How Ads Are Displayed

### **TopBannerAd Component** 🔝
**File**: `src/components/TopBannerAd.tsx`  
**Shows**: Ads with `display_on_top = true`  
**Format**: 728x90px leaderboard banner (horizontal)  
**Appears On**:
- `/listings` - Main listings page
- `/listings/category/:slug` - Category pages
- `/events` - Events page
- `/marketplace` - Marketplace page

**Behavior**:
- Fetches ads where `is_active = true` AND `display_on_top = true`
- If multiple ads qualify → **5-second slideshow rotation**
- Hover to pause slideshow
- Progress bar shows time remaining
- Click tracking enabled

---

### **BottomBannerAd Component** 🔽
**File**: `src/components/BottomBannerAd.tsx`  
**Shows**: Ads with `display_on_bottom = true`  
**Format**: 728x90px leaderboard banner (horizontal)  
**Appears On**: Same pages as TopBannerAd (at bottom)

**Behavior**: Identical to TopBannerAd but filters for `display_on_bottom = true`

---

### **Country Detail Page Ads** 🌍
**File**: `src/pages/CountryDetailPage.tsx`  
**Shows**: Ads with `show_on_country_detail = true`  
**Format**: Full-width banner (responsive)  
**Appears On**: `/countries/:countrySlug` (e.g., `/countries/rwanda`)

**Behavior**:
- Fetches ads where `show_on_country_detail = true`
- **Country-Specific**: Can filter by `country_id` to show only Rwanda ads on Rwanda page
- 132px height banner
- Hover effect: image scales
- Click tracking enabled

---

## 🌍 Country Targeting Explained

### **What Does `country_id` Mean?**

The `country_id` field **links an ad to a specific country**. This allows:
1. **Targeted Campaigns**: "Visit Rwanda" ad shows only on Rwanda-related pages
2. **Revenue Tracking**: Know which country's ads generate most revenue
3. **Performance Analytics**: Track CTR per country
4. **Client Management**: Separate ad accounts per country tourism board

### **Example Scenario:**

```sql
-- Rwanda Tourism Board Ad
INSERT INTO sponsored_banners (
  country_id = 'rwanda-uuid',
  company_name = 'Visit Rwanda',
  company_website = 'https://visitrwanda.com',
  banner_image_url = 'https://storage.../visit-rwanda.jpg',
  show_on_country_detail = true,
  is_active = true,
  payment_status = 'paid'
);
```

**Result**: This ad shows on `/countries/rwanda` page because:
- ✅ `show_on_country_detail = true`
- ✅ `country_id` matches Rwanda
- ✅ `is_active = true`
- ✅ `payment_status = 'paid'`

---

## 📍 Display Position Controls

### **Three Toggle Switches:**

| Field | Where It Shows | Use Case |
|-------|----------------|----------|
| **`display_on_top`** | Top of listings/category pages | Site-wide visibility |
| **`display_on_bottom`** | Bottom of same pages | Secondary placement |
| **`show_on_country_detail`** | Country-specific pages | Targeted campaigns |

### **Can You Enable Multiple?**
**YES!** An ad can show in all three locations:
```json
{
  "display_on_top": true,
  "display_on_bottom": true,
  "show_on_country_detail": true
}
```
**Result**: Maximum exposure - ad appears everywhere

---

## 🔄 Multiple Ads Management

### **What If Multiple Ads Have the Same Country?**

**Short Answer**: They all show in a **rotating slideshow**.

**Detailed Behavior**:

#### **Scenario 1: Multiple Ads, Same Position**
```
Ad A: country_id = Rwanda, display_on_top = true
Ad B: country_id = Rwanda, display_on_top = true
Ad C: country_id = Rwanda, display_on_top = true
```

**What Happens**:
- All 3 ads show in TopBannerAd component
- **5-second rotation** between ads
- Smooth fade transition
- Progress bar shows time remaining
- User can manually click slide indicators

#### **Scenario 2: Multiple Ads, Different Positions**
```
Ad A: display_on_top = true, display_on_bottom = false
Ad B: display_on_top = false, display_on_bottom = true
Ad C: display_on_top = true, display_on_bottom = false
```

**What Happens**:
- TopBannerAd shows: Ad A + Ad C (rotating)
- BottomBannerAd shows: Ad B (solo)

#### **Scenario 3: All Ads for Same Country on Country Page**
```
Rwanda Page (/countries/rwanda):
- Ad A: show_on_country_detail = true
- Ad B: show_on_country_detail = true
- Ad C: show_on_country_detail = false
```

**What Happens**:
- Ad A + Ad B show on Rwanda page
- Ad C does NOT show (toggle off)

---

## 📈 Ad Order & Priority

### **Current Ordering Logic**
Ads are fetched and displayed in this order:

1. **Primary Sort**: `created_at DESC` (newest first)
2. **Filters Apply**:
   - ✅ Must have `is_active = true`
   - ✅ Must have correct position toggle (`display_on_top`, etc.)
   - ✅ Prefer `payment_status = 'paid'`
   - ✅ Prefer `status = 'active'` or `'approved'`

### **Fallback Logic**
If no ads match strict criteria, system tries:
1. First: `is_active = true` + correct position
2. Then: `status = 'approved'` + correct position
3. Finally: `payment_status = 'paid'` + correct position

---

## 🎨 Black & White Ad Design Specs

### **Design Philosophy**
Ads should match BARA AFRICA's **minimalist black & white theme**. NO colorful graphics or busy designs.

---

### **Recommended Ad Styles:**

#### **Style 1: Typography-Focused**
```
┌────────────────────────────────────────┐
│                                        │
│         VISIT RWANDA                   │
│     Land of a Thousand Hills           │
│                                        │
│    www.visitrwanda.com  →              │
│                                        │
└────────────────────────────────────────┘
```
**Colors**: Black text on white background, thin border  
**Fonts**: Bold sans-serif headlines, clean body text  
**Accent**: Single arrow (→) for CTA

---

#### **Style 2: Minimalist with Icon**
```
┌────────────────────────────────────────┐
│                                        │
│  🗻  DISCOVER ETHIOPIA                 │
│      13 Months of Sunshine             │
│                                        │
│      ethiopianairlines.com             │
│                                        │
└────────────────────────────────────────┘
```
**Colors**: Black text, white background, thin line divider  
**Icon**: Single monochrome emoji or symbol  
**Layout**: Centered, plenty of white space

---

#### **Style 3: Split Layout**
```
┌─────────────────┬──────────────────────┐
│                 │                      │
│                 │  EXPLORE KENYA       │
│   [Simple Icon] │  Safari Adventures   │
│   or Silhouette │  Wildlife & Culture  │
│                 │                      │
│                 │  magicalkenya.com    │
│                 │                      │
└─────────────────┴──────────────────────┘
```
**Colors**: Left side gray (#F5F5F5), right side white  
**Divider**: 1px vertical line  
**CTA**: Bottom right, underlined link

---

### **Technical Specifications**

| Format | Dimensions | File Size | Background |
|--------|------------|-----------|------------|
| **Leaderboard** | 728x90px | < 200KB | White or light gray |
| **Country Page** | 1200x132px | < 300KB | White preferred |
| **File Type** | JPG or PNG | - | Transparent PNG if needed |

---

### **Design Requirements**

✅ **DO:**
- Use black (#000000) or dark gray (#333333) for text
- Use white (#FFFFFF) or light gray (#F5F5F5) for backgrounds
- Keep layouts clean with lots of whitespace
- Use simple, bold typography
- Include clear CTA (call-to-action)
- Ensure text is readable at small sizes

❌ **DON'T:**
- Use bright colors (red, blue, green, yellow)
- Use complex gradients or shadows
- Use busy background images
- Use too many fonts (max 2)
- Make text too small (minimum 12px)
- Clutter the space

---

## 🧪 Creating Test Ads

### **Recommended Test Ad Set**

To properly test the system, create these 5 ads:

#### **Test Ad 1: Rwanda Top Banner**
```json
{
  "country_id": "<rwanda-uuid>",
  "company_name": "Visit Rwanda",
  "company_website": "https://visitrwanda.com",
  "banner_alt_text": "Explore Rwanda - Land of a Thousand Hills",
  "display_on_top": true,
  "display_on_bottom": false,
  "show_on_country_detail": true,
  "is_active": true,
  "payment_status": "paid",
  "status": "active"
}
```
**Test**: Should show on `/countries/rwanda` AND top of listings pages

---

#### **Test Ad 2: Kenya Bottom Banner**
```json
{
  "country_id": "<kenya-uuid>",
  "company_name": "Magical Kenya",
  "company_website": "https://magicalkenya.com",
  "banner_alt_text": "Magical Kenya Safari Adventures",
  "display_on_top": false,
  "display_on_bottom": true,
  "show_on_country_detail": false,
  "is_active": true,
  "payment_status": "paid",
  "status": "active"
}
```
**Test**: Should show ONLY at bottom of listings pages (not on country page)

---

#### **Test Ad 3: Ethiopia Site-Wide**
```json
{
  "country_id": "<ethiopia-uuid>",
  "company_name": "Ethiopian Airlines",
  "company_website": "https://ethiopianairlines.com",
  "banner_alt_text": "Fly Ethiopian Airlines - 13 Months of Sunshine",
  "display_on_top": true,
  "display_on_bottom": true,
  "show_on_country_detail": true,
  "is_active": true,
  "payment_status": "paid",
  "status": "active"
}
```
**Test**: Should show EVERYWHERE (maximum exposure)

---

#### **Test Ad 4: Rwanda Second Ad (Rotation Test)**
```json
{
  "country_id": "<rwanda-uuid>",
  "company_name": "Rwanda Development Board",
  "company_website": "https://rdb.rw",
  "banner_alt_text": "Invest in Rwanda",
  "display_on_top": true,
  "display_on_bottom": false,
  "show_on_country_detail": true,
  "is_active": true,
  "payment_status": "paid",
  "status": "active"
}
```
**Test**: Should ROTATE with Test Ad 1 on Rwanda page and top banners

---

#### **Test Ad 5: Inactive Ad (Control)**
```json
{
  "country_id": "<ghana-uuid>",
  "company_name": "Ghana Tourism",
  "company_website": "https://visitghana.com",
  "banner_alt_text": "Visit Ghana",
  "display_on_top": true,
  "display_on_bottom": true,
  "show_on_country_detail": true,
  "is_active": false,  // ← INACTIVE
  "payment_status": "pending",
  "status": "pending"
}
```
**Test**: Should NOT show anywhere (inactive)

---

## 🎓 Admin Status Fields Explained

### **`payment_status`**
Tracks whether advertiser has paid:
- **`pending`** - Awaiting payment
- **`paid`** - Payment received ✅
- **`failed`** - Payment failed
- **`refunded`** - Refund issued

**Admin Action**: Mark as `paid` after receiving payment

---

### **`status`**
Ad approval workflow:
- **`pending`** - Submitted, awaiting review
- **`approved`** - Admin approved
- **`active`** - Live on site ✅
- **`inactive`** - Paused
- **`rejected`** - Denied

**Admin Action**: Review ad → Approve → Activate

---

### **`is_active`**
Simple on/off switch:
- **`true`** - Ad is live ✅
- **`false`** - Ad is paused

**Best Practice**: Use this for quick pausing without deleting

---

## 🔧 Troubleshooting

### **Ad Not Showing on Country Page**

**Checklist**:
1. ✅ `is_active = true`
2. ✅ `show_on_country_detail = true`
3. ✅ `country_id` matches the country
4. ✅ `payment_status = 'paid'`
5. ✅ Image URL is valid and accessible
6. ✅ Browser cache cleared

---

### **Ad Not Showing on Listings Page**

**Checklist**:
1. ✅ `is_active = true`
2. ✅ Either `display_on_top = true` OR `display_on_bottom = true`
3. ✅ `payment_status = 'paid'` (preferred)
4. ✅ Image URL is valid
5. ✅ Check TopBannerAd / BottomBannerAd components are rendered on that page

---

### **Multiple Ads Not Rotating**

**Possible Causes**:
1. Only one ad meets the criteria (check filters)
2. JavaScript console errors (check browser dev tools)
3. Ads have different position toggles (check `display_on_top` values match)

**Solution**: Verify all ads have identical position settings

---

### **Ad Image Not Loading**

**Common Issues**:
1. URL is relative instead of absolute
2. Storage bucket permissions issue
3. Image deleted from storage
4. CORS policy blocking

**Solution**: 
- Use full URLs: `https://...supabase.co/storage/v1/object/public/sponsored-banners/filename.jpg`
- Check Supabase storage bucket is public
- Re-upload image if needed

---

## 📊 Analytics & Tracking

### **Current Metrics Tracked**
- `view_count` - Increments when ad is viewed
- `click_count` - Increments when ad is clicked

### **Analytics Table**
`sponsored_banner_analytics` table logs:
- `banner_id` - Which ad
- `event_type` - `'view'` or `'click'`
- `user_agent` - Browser info
- `created_at` - Timestamp

**Future Enhancement**: Add geographic tracking, conversion tracking, A/B testing

---

## 💰 Revenue Model

### **Pricing Tiers** (Suggested)

| Position | Price/Month | Impressions | Best For |
|----------|-------------|-------------|----------|
| **Country Page Only** | $500 | ~10K | National tourism boards |
| **Top Banner Site-Wide** | $1,500 | ~50K | Airlines, hotels |
| **Bottom Banner** | $800 | ~30K | Secondary advertisers |
| **All Positions** | $2,500 | ~90K | Premium campaigns |

---

## 🎯 Best Practices

### **For Admins**
1. ✅ Always verify payment before activating ads
2. ✅ Review ad content for appropriateness
3. ✅ Test ads on all pages before going live
4. ✅ Monitor analytics weekly
5. ✅ Rotate old ads out after campaign ends

### **For Advertisers**
1. ✅ Use high-quality images (min 728x90px)
2. ✅ Include clear call-to-action
3. ✅ Match website's black & white aesthetic
4. ✅ Test click-through URLs before submission
5. ✅ Provide alt text for accessibility

---

## 🆘 Need Help?

**Admin Dashboard**: Navigate to **Sponsored Banners** section  
**Documentation**: Review this guide thoroughly  
**Test First**: Create test ads before going live with clients  
**Track Performance**: Monitor view/click rates to optimize

---

*Last Updated: December 10, 2024*  
*Version: 2.0 - BARA AFRICA Platform*  
*Created by: Cascade AI*
