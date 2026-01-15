# Category-Specific Marketplace Layouts

## Overview

The marketplace now features **optimized layouts for each major category**, ensuring the best user experience for different types of listings. Each category displays information in the most relevant way for that specific product or service type.

---

## 🏗️ Implementation Architecture

### Category Router System
- **File**: `src/pages/marketplace/CategoryDetailRouter.tsx`
- **Purpose**: Automatically routes to the correct detail page based on listing category
- **How it works**: Fetches the category slug and routes to specialized component

### Category Detection Logic
```typescript
Properties: property, real-estate, apartment, house, land, for-sale, for-rent
Motors: motor, car, vehicle, auto, motorcycle, truck, boat
Jobs: job, career, employment, work, hiring
Electronics: mobile, phone, tablet, electronic, computer, laptop, gadget
Default: All other categories use generic layout
```

---

## 📋 Category-Specific Layouts

### 1. **Properties Layout** (`PropertyDetail.tsx`)

**Optimized for**: Real estate, apartments, houses, land, commercial properties

**Key Features**:
- ✅ **Large image gallery** with 16:10 aspect ratio (better for property photos)
- ✅ **Prominent property stats**: Bedrooms, Bathrooms, Square Feet, Property Type
- ✅ **Property features grid** with icons (Bed, Bath, Maximize, Building icons)
- ✅ **Detailed property info**: Furnished, Parking, Year Built
- ✅ **Amenities checklist** with green checkmarks
- ✅ **Map placeholder** for location visualization
- ✅ **Safety tips** specific to property transactions
- ✅ **Price per month/year** display for rentals

**Layout Highlights**:
- 8-image thumbnail grid below main image
- Blue-themed feature boxes
- Emphasis on location and property details
- Related properties show bed/bath/sqft in cards

---

### 2. **Motors/Vehicles Layout** (`MotorsDetail.tsx`)

**Optimized for**: Cars, motorcycles, trucks, boats, vehicles

**Key Features**:
- ✅ **Vehicle specifications grid**: Year, Mileage, Fuel Type, Transmission
- ✅ **Detailed overview**: Make, Model, Body Type, Color, Engine, Doors, Seats
- ✅ **10-image gallery** (more images for vehicle inspection)
- ✅ **Features & options** checklist
- ✅ **Condition badge** prominently displayed
- ✅ **Vehicle-specific icons**: Car, Gauge, Fuel, Settings, Palette
- ✅ **Safety tips** for vehicle purchases

**Layout Highlights**:
- 16:9 aspect ratio for vehicle photos
- 5-column thumbnail grid
- Blue-themed spec boxes
- Related vehicles show year/make/model format
- Emphasis on mechanical specifications

---

### 3. **Jobs Layout** (`JobsDetail.tsx`)

**Optimized for**: Job postings, careers, employment opportunities

**Key Features**:
- ✅ **Minimal image usage** (company logo only, no gallery needed)
- ✅ **Company header** with logo and company name
- ✅ **Key job info**: Salary, Experience, Education, Industry
- ✅ **Structured sections**: Description, Responsibilities, Requirements, Benefits
- ✅ **Application deadline** warning if applicable
- ✅ **"Apply via Email"** as primary CTA button
- ✅ **Application tips** sidebar
- ✅ **Job type badges**: Full-time, Part-time, Contract, etc.

**Layout Highlights**:
- No image gallery (jobs don't need photos)
- List-based layout for responsibilities and requirements
- Green checkmarks for requirements and benefits
- Salary prominently displayed at top
- Related jobs in card format (3 columns)
- Focus on text content over visuals

---

### 4. **Electronics/Mobiles Layout** (`ElectronicsDetail.tsx`)

**Optimized for**: Phones, tablets, laptops, computers, gadgets

**Key Features**:
- ✅ **Square aspect ratio** (1:1) for product photos
- ✅ **Technical specifications**: Storage, RAM, Processor, Screen Size, Battery, Camera
- ✅ **Product details grid**: Brand, Model, Color, Condition, Warranty
- ✅ **Features checklist** with green checkmarks
- ✅ **Accessories included** section with badges
- ✅ **Condition badge** on images
- ✅ **Tech-specific icons**: Smartphone, CPU, HardDrive, Battery, Camera, Monitor

**Layout Highlights**:
- Product-focused square images with white padding
- Gray-themed spec boxes
- Emphasis on technical specifications
- Related products in 4-column grid
- Compact thumbnail strip
- Clean, modern tech aesthetic

---

### 5. **Generic Layout** (`ListingDetailPageNew.tsx`)

**Used for**: All other categories (Classifieds, Services, Furniture, Fashion, etc.)

**Key Features**:
- ✅ **Flexible image gallery** (works for any product)
- ✅ **Generic attributes display**
- ✅ **Standard contact options**
- ✅ **Universal layout** that works for everything

---

## 🎨 Design Consistency

All layouts maintain:
- **Same color scheme**: Blue primary (#2563eb), green WhatsApp (#16a34a)
- **Same typography**: Comfortaa for headings, Roboto for body
- **Same contact section**: WhatsApp primary, Phone, Email, Website
- **Same seller info card**: Profile, verification badge, meta info
- **Same action buttons**: Share and Report
- **Same safety tips**: Category-specific advice

---

## 🔄 How the Router Works

1. **User clicks listing** → Navigates to `/marketplace/listing/{id}`
2. **CategoryDetailRouter loads** → Fetches listing's category slug
3. **Router checks category** → Matches slug against patterns
4. **Correct component renders** → Specialized layout displays

**Example Flow**:
```
Listing ID: abc123
Category: "motors" 
→ Router detects "motors" in slug
→ Renders MotorsDetail component
→ Shows vehicle-specific layout
```

---

## 📊 Category Comparison

| Feature | Properties | Motors | Jobs | Electronics | Generic |
|---------|-----------|--------|------|-------------|---------|
| **Images** | 8+ gallery | 10 gallery | Logo only | Square gallery | Standard |
| **Aspect Ratio** | 16:10 | 16:9 | N/A | 1:1 | 16:9 |
| **Key Stats** | Bed/Bath/Sqft | Year/Mileage/Fuel | Salary/Experience | Storage/RAM/CPU | Price |
| **Emphasis** | Location/Space | Specs/Condition | Requirements | Tech Specs | General |
| **Related Items** | 4 columns | 4 columns | 3 columns | 4 columns | 4 columns |
| **Primary CTA** | WhatsApp | WhatsApp | Apply Email | WhatsApp | WhatsApp |

---

## 🛠️ Files Created

### Detail Pages:
1. `src/pages/marketplace/details/PropertyDetail.tsx` (1,100+ lines)
2. `src/pages/marketplace/details/MotorsDetail.tsx` (1,050+ lines)
3. `src/pages/marketplace/details/JobsDetail.tsx` (900+ lines)
4. `src/pages/marketplace/details/ElectronicsDetail.tsx` (1,000+ lines)

### Router:
5. `src/pages/marketplace/CategoryDetailRouter.tsx` (120 lines)

### Updated:
6. `src/App.tsx` - Routes to CategoryDetailRouter

---

## 🎯 User Experience Benefits

### **Properties**:
- Users see bedroom/bathroom count immediately
- Map view helps with location decisions
- Amenities checklist is scannable
- Property type clearly indicated

### **Motors**:
- Vehicle specs front and center
- Year/mileage/fuel type visible at glance
- More images for thorough inspection
- Features list helps comparison

### **Jobs**:
- No unnecessary images cluttering the view
- Structured requirements easy to scan
- Salary and benefits clearly shown
- Application process straightforward

### **Electronics**:
- Technical specs prominently displayed
- Square images show product clearly
- Storage/RAM/processor easy to compare
- Warranty info visible

---

## 🚀 Testing Each Category

### Test Properties:
1. Create listing in "Properties" category
2. Add bedrooms, bathrooms, sqft attributes
3. Upload 8+ images
4. View listing → Should see PropertyDetail layout

### Test Motors:
1. Create listing in "Motors" category
2. Add make, model, year, mileage attributes
3. Upload 10 images
4. View listing → Should see MotorsDetail layout

### Test Jobs:
1. Create listing in "Jobs" category
2. Add company_name, salary, experience attributes
3. Upload 1 company logo (optional)
4. View listing → Should see JobsDetail layout

### Test Electronics:
1. Create listing in "Mobiles & Tablets" category
2. Add brand, model, storage, ram attributes
3. Upload 5+ product images
4. View listing → Should see ElectronicsDetail layout

---

## 🔧 Customization Guide

### Adding a New Category-Specific Layout:

1. **Create new detail component**:
```typescript
// src/pages/marketplace/details/YourCategoryDetail.tsx
export const YourCategoryDetail = () => {
  // Copy structure from existing detail page
  // Customize layout for your category
}
```

2. **Update CategoryDetailRouter**:
```typescript
// Add your category detection
if (
  categorySlug.includes('your-category') ||
  categorySlug.includes('related-term')
) {
  return <YourCategoryDetail />;
}
```

3. **Import in App.tsx** (if needed for direct routing)

---

## 📝 Attribute Naming Conventions

For optimal display, use these attribute keys:

### Properties:
- `bedrooms`, `bathrooms`, `sqft`, `area`
- `property_type`, `furnished`, `parking`
- `year_built`, `amenities[]`

### Motors:
- `make`, `model`, `year`, `mileage`, `kilometers`
- `fuel_type`, `transmission`, `body_type`
- `color`, `engine_size`, `doors`, `seats`
- `features[]`

### Jobs:
- `company_name`, `job_type`, `experience`
- `education`, `industry`, `deadline`
- `requirements[]`, `responsibilities[]`, `benefits[]`

### Electronics:
- `brand`, `model`, `storage`, `memory`
- `ram`, `processor`, `cpu`, `screen_size`
- `display`, `battery`, `camera`, `color`
- `warranty`, `accessories[]`, `features[]`

---

## ✅ Implementation Complete

All category-specific layouts are now:
- ✅ Created and optimized
- ✅ Routed automatically via CategoryDetailRouter
- ✅ Styled consistently with marketplace theme
- ✅ Mobile responsive
- ✅ Feature-complete with contact options
- ✅ Tested and ready for production

**The marketplace now provides the optimal viewing experience for each category type!** 🎉

---

**Version**: 3.0.0  
**Date**: January 15, 2026  
**Status**: ✅ Production Ready
