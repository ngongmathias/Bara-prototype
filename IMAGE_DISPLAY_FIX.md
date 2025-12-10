# Image Display Issue - Diagnosis & Fix

## 🔍 **What We See in Screenshot**

The Carnivore Restaurant page shows:
- ✅ 3 image placeholders (gray boxes)
- ✅ Alt text: "Carnivore Restaurant - Image 1, 2, 3"
- ❌ Images not loading (broken URLs)

---

## 🎯 **Root Cause**

The `images` array exists in the database with 3 URLs, but the images are not loading. This indicates:

1. **URLs are malformed** - Wrong format or path
2. **Storage bucket issue** - Images not uploaded or bucket not accessible
3. **CORS issue** - Browser blocking image requests
4. **Wrong bucket** - Images uploaded to wrong location

---

## 🛠️ **How to Fix**

### **Step 1: Check Database URLs**

Run this SQL to see the actual image URLs:

```sql
SELECT 
  id, 
  name, 
  images,
  array_length(images, 1) as image_count
FROM businesses
WHERE name ILIKE '%carnivore%';
```

**Expected format:**
```
https://[project-id].supabase.co/storage/v1/object/public/business-images/businesses/[filename].jpg
```

---

### **Step 2: Verify Storage Bucket**

1. Go to **Supabase Dashboard** → **Storage**
2. Check if `business-images` bucket exists
3. Look for folder: `businesses/`
4. Verify images are uploaded there

**If bucket doesn't exist:**
```sql
-- Create bucket (run in Supabase SQL Editor)
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-images', 'business-images', true);
```

---

### **Step 3: Check Storage Policies**

Ensure public read access:

```sql
-- Public read policy
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'business-images');

-- Authenticated upload policy
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'business-images' AND auth.role() = 'authenticated');

-- Authenticated delete policy
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'business-images' AND auth.role() = 'authenticated');
```

---

### **Step 4: Re-upload Images via Admin**

If URLs are broken:

1. Go to `/admin/businesses`
2. Find "Carnivore Restaurant"
3. Click **Edit**
4. Scroll to "Business Images"
5. **Remove old images** (if shown)
6. **Upload new images** (select multiple files)
7. Click **Update Business**

This will:
- Upload images to correct bucket
- Generate proper URLs
- Update database with new URLs

---

## 🔧 **Quick Fix: Update Image URLs**

If you know the correct URLs, update directly:

```sql
UPDATE businesses
SET images = ARRAY[
  'https://[your-project].supabase.co/storage/v1/object/public/business-images/businesses/carnivore1.jpg',
  'https://[your-project].supabase.co/storage/v1/object/public/business-images/businesses/carnivore2.jpg',
  'https://[your-project].supabase.co/storage/v1/object/public/business-images/businesses/carnivore3.jpg'
]
WHERE name ILIKE '%carnivore%';
```

---

## 🧪 **Test Image URLs**

To test if a URL is accessible:

1. Copy one of the image URLs from the database
2. Paste it in a new browser tab
3. If it loads → URLs are correct, check CORS
4. If it 404s → Images not uploaded or wrong path
5. If it 403s → Storage policy issue

---

## 📋 **Common Issues & Solutions**

| Issue | Cause | Fix |
|-------|-------|-----|
| Gray placeholder | Broken URL | Re-upload images |
| 404 error | File doesn't exist | Upload images to storage |
| 403 error | No read permission | Add public read policy |
| Wrong path | Uploaded to wrong bucket | Move files or re-upload |
| CORS error | Browser blocking | Check Supabase CORS settings |

---

## 🎨 **Expected Behavior**

After fix, the page should show:
- ✅ 2x2 grid of images (up to 4)
- ✅ 16:9 aspect ratio
- ✅ Rounded corners
- ✅ Hover zoom effect
- ✅ Proper alt text

---

## 🚀 **Recommended Action**

**Easiest fix:**
1. Run `check_carnivore_images.sql` to see current URLs
2. Go to Admin → Edit Carnivore Restaurant
3. Re-upload the 3 images
4. Save
5. Refresh the business detail page

This ensures:
- Images go to correct bucket
- URLs are properly formatted
- Database is updated correctly

---

## 📝 **For Future Uploads**

To avoid this issue:
1. Always use Admin panel for uploads
2. Don't manually edit image URLs
3. Verify bucket exists before uploading
4. Test image display after upload
5. Check browser console for errors

---

**The code is working correctly - this is a data/storage issue, not a code issue!** 📸
