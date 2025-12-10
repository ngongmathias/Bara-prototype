# Storage Bucket Setup Guide

## ⚠️ Current Issue

You're getting this error when uploading country page ad images:
```
StorageApiError: Bucket not found
Bucket: country-page-ads
```

## 🔧 Temporary Fix (Already Applied)

I've temporarily redirected country ad images to use the `country-leaders` bucket. This will work but isn't ideal for organization.

**Current code:**
```typescript
country_ad: 'country-leaders'  // Temporary - reusing existing bucket
```

---

## ✅ Permanent Solution: Create Storage Bucket

### **Option 1: Via Supabase Dashboard (Recommended)**

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Storage**
   - Click "Storage" in left sidebar
   - Click "New bucket" button

3. **Create Bucket**
   - **Name:** `country-page-ads`
   - **Public bucket:** ✅ Check this (images need to be publicly accessible)
   - **File size limit:** 5MB (or your preference)
   - **Allowed MIME types:** Leave empty or add: `image/jpeg`, `image/png`, `image/webp`
   - Click "Create bucket"

4. **Set Permissions (Important!)**
   - Click on the new `country-page-ads` bucket
   - Go to "Policies" tab
   - Click "New policy"
   - Template: "Allow public read access"
   - Name: "Public read for country ads"
   - Policy: 
     ```sql
     CREATE POLICY "Public read access"
     ON storage.objects FOR SELECT
     USING ( bucket_id = 'country-page-ads' );
     ```
   - Click "Review" and "Save"

5. **Allow Authenticated Uploads**
   - Create another policy
   - Name: "Authenticated users can upload"
   - Policy:
     ```sql
     CREATE POLICY "Authenticated users can upload"
     ON storage.objects FOR INSERT
     WITH CHECK (
       bucket_id = 'country-page-ads' AND
       auth.role() = 'authenticated'
     );
     ```

6. **Allow Authenticated Updates**
   - Create another policy
   - Name: "Authenticated users can update"
   - Policy:
     ```sql
     CREATE POLICY "Authenticated users can update"
     ON storage.objects FOR UPDATE
     USING (
       bucket_id = 'country-page-ads' AND
       auth.role() = 'authenticated'
     );
     ```

7. **Allow Authenticated Deletes**
   - Create another policy
   - Name: "Authenticated users can delete"
   - Policy:
     ```sql
     CREATE POLICY "Authenticated users can delete"
     ON storage.objects FOR DELETE
     USING (
       bucket_id = 'country-page-ads' AND
       auth.role() = 'authenticated'
     );
     ```

---

### **Option 2: Via SQL (Faster)**

Run this SQL in your Supabase SQL Editor:

```sql
-- Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('country-page-ads', 'country-page-ads', true);

-- Allow public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'country-page-ads' );

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'country-page-ads' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'country-page-ads' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'country-page-ads' AND
  auth.role() = 'authenticated'
);
```

---

## 🔄 After Creating Bucket

Update the code to use the proper bucket:

**File:** `src/pages/admin/AdminCountryInfo.tsx`

**Change line 183 from:**
```typescript
country_ad: 'country-leaders'  // Temporary - reusing existing bucket
```

**To:**
```typescript
country_ad: 'country-page-ads'  // Dedicated bucket for country ads
```

Then rebuild and redeploy:
```bash
npm run build
git add .
git commit -m "Use dedicated country-page-ads storage bucket"
git push
```

---

## 📋 Verify Bucket Creation

After creating the bucket, verify it works:

1. **Go to Admin > Country Info**
2. **Edit a country** (e.g., Rwanda)
3. **Scroll to "Country Page Advertisement" section**
4. **Upload a 600x600px test image**
5. **Check console** - should see:
   ```
   Uploading to bucket: country-page-ads, folder: images
   ✅ Success!
   ```
6. **Check Supabase Storage** - should see image in `country-page-ads/images/` folder

---

## 🎯 Why This Matters

### **Current (Temporary) Setup:**
- ❌ Country ad images mixed with leader photos
- ❌ Hard to organize and manage
- ❌ Confusing folder structure

### **Proper Setup:**
- ✅ Country ads have dedicated bucket
- ✅ Easy to find and manage ad images
- ✅ Clear organization
- ✅ Can set different permissions/limits per bucket
- ✅ Professional structure

---

## 📁 Complete Bucket Structure (After Fix)

Your storage should have:

```
Storage Buckets:
├── country-coat-of-arms/     (Existing)
│   └── images/
├── country-flags/             (Existing)
│   └── images/
├── country-leaders/           (Existing)
│   └── images/
├── country-monuments/         (Existing)
│   └── images/
└── country-page-ads/          (NEW - Create this!)
    └── images/
        └── [ad images here - 600x600px]
```

---

## ⚡ Quick Test

After creating the bucket, test immediately:

1. Go to `/admin/country-info`
2. Edit Rwanda
3. Upload this to country ad section: Any 600x600px image
4. Should upload successfully
5. Check image appears in Supabase Storage > `country-page-ads` bucket

---

## 🆘 If Still Having Issues

### Check:
1. **Bucket exists:** Supabase > Storage > Look for `country-page-ads`
2. **Bucket is public:** Click bucket > Settings > "Public bucket" should be ON
3. **Policies exist:** Click bucket > Policies > Should see 4 policies
4. **Code updated:** Line 183 in AdminCountryInfo.tsx should say `country-page-ads`
5. **Rebuild done:** Run `npm run build` after code change

### Common Errors:
- **"Bucket not found"** → Bucket doesn't exist or name is wrong
- **"Permission denied"** → Missing storage policies
- **"File too large"** → Bucket file size limit too small (increase to 5MB+)
- **"Invalid MIME type"** → Bucket restricts file types (allow image/*)

---

## ✅ Final Checklist

- [ ] Create `country-page-ads` bucket in Supabase
- [ ] Set bucket to Public
- [ ] Add all 4 storage policies (SELECT, INSERT, UPDATE, DELETE)
- [ ] Update code line 183 in AdminCountryInfo.tsx
- [ ] Rebuild: `npm run build`
- [ ] Commit and push changes
- [ ] Test upload on admin page
- [ ] Verify image appears in Supabase Storage

---

**Once done, country page ad uploads will work perfectly!** 🎉
