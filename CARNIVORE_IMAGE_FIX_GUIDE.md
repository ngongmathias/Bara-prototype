# Carnivore Restaurant Image Fix Guide

## 🔍 **Problem**

The admin panel shows 3 broken image placeholders for Carnivore Restaurant. This means:
- ✅ Database has 3 image URLs in the `images` array
- ❌ The URLs are broken/inaccessible (404 or 403 errors)

---

## 🎯 **Root Causes**

1. **Images never uploaded to Supabase Storage** - URLs point to non-existent files
2. **Wrong storage bucket** - Images uploaded to wrong location
3. **Storage policies missing** - No public read access
4. **Malformed URLs** - Incorrect URL format

---

## 🛠️ **Quick Fix (Recommended)**

### **Option A: Re-upload via Admin Panel**

This is the **easiest and safest** method:

1. Go to `/admin/businesses`
2. Find "Carnivore Restaurant"
3. Click **Edit** (pencil icon)
4. Scroll to **"Business Images"** section
5. You'll see 3 broken images with X buttons
6. **Click X on each** to remove them
7. Click **"Choose Files"** under "Business Images"
8. **Select 3 new images** from your computer
9. Click **"Update Business"**

**This will:**
- ✅ Upload images to correct Supabase bucket
- ✅ Generate proper URLs
- ✅ Update database automatically
- ✅ Display images correctly on frontend

---

## 🔧 **Manual Fix (Advanced)**

### **Step 1: Check Current URLs**

Run this SQL in Supabase SQL Editor:

```sql
SELECT 
  id,
  name,
  images,
  array_length(images, 1) as image_count
FROM businesses
WHERE name ILIKE '%carnivore%';
```

**Copy one of the URLs** and paste it in your browser.

**If you get:**
- **404 Error** → Images don't exist in storage
- **403 Error** → Storage policy issue (no public access)
- **Image loads** → Frontend rendering issue (unlikely)

---

### **Step 2: Verify Storage Bucket**

1. Go to **Supabase Dashboard** → **Storage**
2. Look for bucket: `business-images`
3. Check folder: `businesses/`
4. See if Carnivore images exist

**If bucket doesn't exist:**
```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-images', 'business-images', true);
```

**If bucket exists but no images:**
→ Images were never uploaded, use **Option A** above

---

### **Step 3: Check Storage Policies**

Ensure public read access:

```sql
-- Check existing policies
SELECT * FROM storage.policies WHERE bucket_id = 'business-images';

-- If no policies, create them:

-- Public read
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'business-images');

-- Authenticated upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'business-images' AND auth.role() = 'authenticated');

-- Authenticated delete
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'business-images' AND auth.role() = 'authenticated');
```

---

### **Step 4: Clear Broken URLs**

If images can't be recovered, clear them:

```sql
UPDATE businesses
SET images = NULL
WHERE name ILIKE '%carnivore%';
```

Then re-upload via admin panel.

---

## 📋 **Expected URL Format**

Correct Supabase Storage URL format:

```
https://[project-id].supabase.co/storage/v1/object/public/business-images/businesses/[filename].jpg
```

**Example:**
```
https://abcdefgh.supabase.co/storage/v1/object/public/business-images/businesses/carnivore-1.jpg
```

**If your URLs look different**, they're malformed.

---

## 🚀 **Recommended Action Plan**

### **Fastest Solution:**

1. ✅ Go to Admin → Edit Carnivore Restaurant
2. ✅ Remove all 3 broken images (click X)
3. ✅ Upload 3 new images
4. ✅ Save
5. ✅ Refresh frontend to verify

**Time:** ~2 minutes  
**Risk:** None (just re-uploading)

---

### **If Re-upload Doesn't Work:**

Then it's a **storage bucket/policy issue**:

1. Check if `business-images` bucket exists
2. Verify public read policy
3. Try uploading a test image manually in Supabase Storage
4. If that works, try admin upload again

---

## 🧪 **Test After Fix**

1. **Admin side:** Edit business → Should see image thumbnails
2. **Frontend:** Visit business detail page → Should see images in grid
3. **Browser console:** No 404/403 errors for image URLs

---

## 📝 **Prevention**

To avoid this in the future:

1. ✅ Always upload via admin panel (not manual SQL)
2. ✅ Verify storage bucket exists before first upload
3. ✅ Check policies are set up correctly
4. ✅ Test image display after upload
5. ✅ Don't manually edit image URLs in database

---

## 🆘 **Still Not Working?**

If re-uploading doesn't fix it, the issue is likely:

1. **Storage bucket doesn't exist** → Create it in Supabase Dashboard
2. **No upload permissions** → Check Supabase auth (are you logged in as admin?)
3. **CORS issue** → Check Supabase CORS settings
4. **File size too large** → Reduce image size (max 5MB recommended)

---

**TL;DR: Go to Admin → Edit Carnivore → Remove broken images → Upload new ones → Save** 🎯
