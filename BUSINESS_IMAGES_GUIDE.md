# Business Images Guide

## ✅ **YES - Listings Can Have Multiple Pictures!**

---

## 📸 **Image System Overview**

### **Database Structure**
```sql
businesses table:
- images: text[] (array of image URLs) ✅ SUPPORTS MULTIPLE
- logo_url: text (single logo)
```

### **What This Means:**
- ✅ **Multiple business images** - Stored as an array
- ✅ **One logo** - Separate field for branding
- ✅ **Reviews can have images** - Also supports multiple images

---

## 🖼️ **Where Images Display**

### **1. Business Detail Page** ✅
**URL:** `/butare/restaurants/880e8400-e29b-41d4-a716-446655440022`

**Display:**
```typescript
{business.images && business.images.length > 0 && (
  <div className="grid grid-cols-2 gap-4">
    {business.images.slice(0, 4).map((image, index) => (
      <img src={image} className="aspect-video" />
    ))}
  </div>
)}
```

**Shows:**
- Up to 4 images in a 2x2 grid
- Aspect ratio: 16:9 (video format)
- Rounded corners, hover effects

---

### **2. Listings Pages** 
**URLs:** 
- `/listings/category/restaurants`
- `/butare/restaurants`

**Display:**
- Shows `logo_url` OR first image from `images[]` array
- Falls back to placeholder if no images

---

## 📤 **How to Upload Images (Admin)**

### **Via Admin Panel:**

1. **Go to:** `/admin/businesses`
2. **Click:** "Add Business" or "Edit" existing
3. **Find:** "Business Images" section
4. **Upload:** 
   - Click file input
   - Select **multiple files** (Ctrl+Click or Cmd+Click)
   - Accepts: JPG, PNG, WebP
   - Max size: 5MB per image
5. **Save:** Images upload to `business-images` bucket

---

## 🔍 **Why You Might Not See Images**

### **Possible Reasons:**

#### **1. No Images Uploaded** ⚠️
- Business was created without images
- Check in Admin > Businesses > View Details
- Look for "Business Images" section

#### **2. Images Not in Database** ⚠️
- Old businesses might have `images: null`
- Need to edit and upload images

#### **3. Broken Image URLs** ⚠️
- Storage bucket issue
- Check Supabase Storage > `business-images`

#### **4. Images Array Empty** ⚠️
```sql
-- Check if business has images
SELECT id, name, images, logo_url 
FROM businesses 
WHERE id = '880e8400-e29b-41d4-a716-446655440022';

-- If images is null or [], no images will display
```

---

## 🛠️ **How to Add Images to Existing Business**

### **Option 1: Via Admin UI** (Recommended)
1. Go to `/admin/businesses`
2. Find the business (e.g., search "Butare")
3. Click "Edit" (pencil icon)
4. Scroll to "Business Images"
5. Click file input, select images
6. Click "Update Business"

### **Option 2: Via SQL** (If needed)
```sql
-- Add images to a business
UPDATE businesses 
SET images = ARRAY[
  'https://your-supabase-url/storage/v1/object/public/business-images/image1.jpg',
  'https://your-supabase-url/storage/v1/object/public/business-images/image2.jpg',
  'https://your-supabase-url/storage/v1/object/public/business-images/image3.jpg'
]
WHERE id = '880e8400-e29b-41d4-a716-446655440022';
```

---

## 📊 **Current Implementation**

### **Admin Upload (AdminBusinesses.tsx):**
```typescript
// Multiple file upload
<Input
  type="file"
  multiple  // ✅ Allows multiple selection
  accept="image/*"
  onChange={(e) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);
  }}
/>

// Upload to Supabase
const uploadPromises = imageFiles.map(file => 
  uploadImage(file, 'business-images', 'businesses')
);
const uploadedImageUrls = await Promise.all(uploadPromises);

// Save to database
businessData.images = uploadedImageUrls; // Array of URLs
```

### **Frontend Display (BusinessDetailPage.tsx):**
```typescript
// Display up to 4 images
{business.images && business.images.length > 0 && (
  <div className="grid grid-cols-2 gap-4">
    {business.images.slice(0, 4).map((image, index) => (
      <div key={index} className="aspect-video">
        <img src={image} alt={`${business.name} - ${index + 1}`} />
      </div>
    ))}
  </div>
)}
```

---

## 🎨 **Image Display Specs**

### **Business Detail Page:**
- **Layout:** 2x2 grid (up to 4 images)
- **Aspect Ratio:** 16:9 (video format)
- **Size:** Responsive, full width of container
- **Styling:** Rounded corners, object-cover
- **Hover:** Slight zoom effect

### **Listings Pages:**
- **Shows:** Logo OR first image
- **Size:** Thumbnail (varies by layout)
- **Fallback:** Building icon if no images

---

## 🔧 **Storage Bucket**

### **Bucket Name:** `business-images`
**Location:** Supabase Storage
**Path Structure:** `/businesses/[filename]`
**Public Access:** Yes (images need to be viewable)

### **Policies:**
```sql
-- Public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'business-images');

-- Authenticated upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'business-images' AND auth.role() = 'authenticated');
```

---

## ✅ **To Confirm Your Business Has Images**

### **Run This SQL:**
```sql
SELECT 
  id,
  name,
  logo_url,
  images,
  CASE 
    WHEN images IS NULL THEN 'No images array'
    WHEN array_length(images, 1) IS NULL THEN 'Empty array'
    ELSE array_length(images, 1)::text || ' images'
  END as image_status
FROM businesses
WHERE id = '880e8400-e29b-41d4-a716-446655440022';
```

**Expected Result:**
- `images`: `["url1", "url2", "url3"]` ✅ Has images
- `images`: `[]` ❌ Empty array
- `images`: `null` ❌ No images

---

## 🎯 **Next Steps**

### **If Business Has No Images:**
1. Go to Admin > Businesses
2. Edit the business
3. Upload images (multiple selection allowed)
4. Save
5. Refresh business detail page

### **If Images Still Don't Show:**
1. Check browser console for errors
2. Verify image URLs are accessible
3. Check Supabase Storage bucket permissions
4. Confirm images array is not empty in database

---

## 📝 **Summary**

| Feature | Status | Notes |
|---------|--------|-------|
| Multiple images support | ✅ Yes | Array field in database |
| Admin upload | ✅ Yes | Multiple file selection |
| Frontend display | ✅ Yes | Up to 4 images in grid |
| Logo support | ✅ Yes | Separate field |
| Review images | ✅ Yes | Also supports multiple |
| Storage bucket | ✅ Yes | `business-images` |

---

**The system fully supports multiple images - you just need to upload them via the admin panel!** 📸
