# BARA AFRICA - Admin Panel Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Business Listings Management](#business-listings-management)
3. [Important Fields Explained](#important-fields-explained)
4. [Business Features & Badges](#business-features--badges)
5. [URLs & Routes](#urls--routes)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The BARA AFRICA admin panel allows you to manage all business listings that appear on the platform. Listings are displayed at:
- **Main URL**: `https://www.baraafrika.com/listings/category/{category-name}`
- **Example**: `https://www.baraafrika.com/listings/category/restaurant`

---

## 🏢 Business Listings Management

### Adding a New Business

1. **Navigate to**: Admin Panel → Businesses
2. **Click**: "Add Business" button
3. **Fill Required Fields** (marked with *):
   - Business Name
   - Category
   - Country
   - City (optional but recommended)

4. **Fill Optional Fields** to make listings more complete

### Status Types
- **Active**: Business is live and visible to users ✅
- **Pending**: Awaiting review/approval ⏳
- **Suspended**: Hidden from public view ❌

**💡 Tip**: New businesses default to "Active" status. Change to "Pending" if manual approval is needed.

---

## 📝 Important Fields Explained

### Basic Information

| Field | Purpose | Example | Notes |
|-------|---------|---------|-------|
| **Business Name** | Displayed as main title | "Safari Restaurant" | Required, appears in blue on listings |
| **Description** | Brief business overview | "Authentic African cuisine..." | Shows below business name |
| **Address** | Physical location | "123 Uhuru Ave, Nairobi" | Displayed on right side of listing |
| **Phone** | Contact number | "+254 712 345 678" | **Shows in GREEN, prominently displayed** |
| **Email** | Business email | "info@safari.com" | For contact purposes |
| **Website** | Company website | "safari-restaurant.com" | Don't include "https://" |
| **WhatsApp** | WhatsApp number | "+254712345678" | For WhatsApp contact |

### Location Fields

| Field | Purpose | Range | Why It's Important |
|-------|---------|-------|-------------------|
| **Latitude** | GPS coordinate | -90 to 90 | **Required for MAP VIEW** 🗺️ |
| **Longitude** | GPS coordinate | -180 to 180 | **Required for MAP VIEW** 🗺️ |
| **Country** | Business country | Dropdown | Determines country listing pages |
| **City** | Business city | Dropdown | Filters and organization |

**🚨 IMPORTANT**: Without latitude/longitude, business won't appear in map view!

**💡 How to get coordinates**:
1. Find business on Google Maps
2. Right-click location → "What's here?"
3. Copy the coordinates (e.g., `-1.286389, 36.817223`)
4. First number = Latitude, Second = Longitude

### Special URLs

| Field | Purpose | When to Use | Example |
|-------|---------|-------------|---------|
| **Order Online URL** | Direct ordering link | If business has online ordering | `https://order.safari.com` |
| **Website Visible** | Show/hide website | Toggle if website not ready | ON by default |

---

## 🎖️ Business Features & Badges

These create the colored badges you see on listings:

### Premium Features (Admin-Controlled)

| Feature | What It Does | Visual Impact | When to Enable |
|---------|--------------|---------------|----------------|
| **Premium** 💎 | Highlights business | Blue "Premium" badge | Paid tier or special promotion |
| **Verified** ✓ | Shows authenticity | Green checkmark | After verification process |
| **Sponsored Ad** 📢 | Top placement | Blue background + "Ad" badge | Paid advertising |

### Business Capabilities

| Feature | Badge Color | Meaning | Example |
|---------|-------------|---------|---------|
| **Has Coupons** 🎫 | Orange | Offers discounts | Restaurant with special deals |
| **Order Online** 🌐 | Green | Online ordering available | Food delivery service |
| **Kid Friendly** 👶 | Blue | Family-friendly | Restaurant with kids menu |

**💡 Badge Display Logic**:
- Sponsored ads: Blue background, "Ad" badge, **NO numbering**
- Regular listings: White background, numbered (1., 2., 3...)
- Premium: Extra visibility in "Featured" sidebar

---

## 🔗 URLs & Routes

### Category Listings
- **Pattern**: `/listings/category/{category-slug}`
- **Examples**:
  - Restaurants: `/listings/category/restaurant`
  - Hotels: `/listings/category/hotels`
  - Auto Repair: `/listings/category/auto-repair`

### Country Listings
- **Pattern**: `/countries/{country-slug}/listings`
- **Example**: `/countries/kenya/listings`

### All Categories
- **URL**: `/listings/categories`

**🚨 IMPORTANT**: URLs changed from `/category/...` to `/listings/category/...` for better organization!

---

## ✅ Best Practices

### For Quality Listings

1. **Always Fill**:
   - Business name
   - Description (50-200 words ideal)
   - Phone number (prominently displayed)
   - Address
   - Category

2. **Add When Available**:
   - Logo image (shows on listing cards)
   - Gallery images (up to 5 images)
   - Latitude/longitude (for map)
   - Website
   - Order online URL

3. **Image Guidelines**:
   - Logo: Square format, 500x500px minimum
   - Gallery: Landscape format, 1200x800px recommended
   - File size: Under 2MB per image
   - Format: JPG or PNG

### Status Management

**Set to "Active"** when:
- Business details verified
- Contact information confirmed
- Images uploaded
- All required fields complete

**Set to "Pending"** when:
- Awaiting business owner verification
- Information needs review
- Temporary hold needed

**Set to "Suspended"** when:
- Business closed/inactive
- Reported issues
- Duplicate listing

---

## 🔧 Troubleshooting

### Business Not Showing on Website

**Check**:
1. ✅ Status = "Active"
2. ✅ Category assigned
3. ✅ Country assigned
4. ✅ Business name filled
5. 🔄 Clear browser cache

### Map View Not Working

**Cause**: Missing latitude/longitude
**Solution**: Add GPS coordinates (see "Location Fields" above)

### Images Not Appearing

**Check**:
1. Image uploaded successfully
2. Image URL in database
3. Image not too large (max 2MB)
4. Correct image format (JPG/PNG)

### Phone Number Not Displaying

**Check**:
1. Phone field filled
2. Proper format: `+254 712 345 678`
3. No special characters except + and spaces

---

## 📊 Listing Display Logic

### How Listings Are Ordered

1. **Sponsored Ads** (if enabled) - Top position, blue background
2. **Premium Businesses** - Higher in regular listings
3. **Regular Businesses** - Alphabetical order

### Sidebar Content (List View Only)

**Right sidebar shows**:
- **Popular**: Top 3 businesses by views
- **Manage Listing CTA**: Call-to-action for business owners
- **Featured**: Premium businesses

---

## 🎨 Design Elements (Yellow Pages Style)

### List View Features:
- **Horizontal cards** with image on left (128x128px)
- **Numbered listings** (1., 2., 3...) excluding ads
- **Blue clickable names** with underline on hover
- **Green phone numbers** on right side
- **Action links**: Website | Directions | More Info
- **Star ratings** in orange
- **Amenity icons** based on category

### Grid View Features:
- **Vertical cards** with image at top
- **Compact information**
- **Category badges**
- **Quick action buttons**

---

## 📱 Category-Specific Amenities

Amenities auto-display based on category:

| Category | Amenities |
|----------|-----------|
| Restaurants | 🍴 Food, 🍷 Drinks |
| Cafes | ☕ Coffee, 🍷 Beverages |
| Hotels | 🛏️ Accommodation, 🔧 Services |
| Hospitals | 🏥 Medical, ❤️ Healthcare |
| Auto Repair | 🚗 Automotive, 🔧 Repair |
| Schools | 🎓 Education, 📚 Learning |
| Gyms | 💪 Fitness, ❤️ Health |

**Note**: Amenities are automatic based on category selection!

---

## 🆘 Need Help?

**Contact Admin Support**:
- Check this guide first
- Review similar successful listings
- Test on the live site
- Document any issues found

**Remember**: Quality listings = Better user experience = More business traffic! 🚀

---

*Last Updated: December 2024*
*Version: 2.0 - BARA AFRICA Rebrand*
