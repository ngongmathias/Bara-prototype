# Ad Images Replacement Guide

## 📐 Image Dimensions & Specifications

### 1. **Popup Ads** (DbPopupAd / PopupAd)
- **Recommended Size**: 1280px × 720px (Landscape) ✅ VERIFIED
- **Aspect Ratio**: 16:9 (Widescreen)
- **Format**: JPG or PNG
- **Max File Size**: 500KB
- **Display**: Full-width in dialog, responsive
- **Location**: Homepage, Listings pages
- **Reference**: Based on sample.jpg dimensions

### 2. **Banner Ads** (BannerAd)
- **Desktop Size**: 1200px × 200px (Landscape)
- **Mobile Size**: 600px × 250px
- **Aspect Ratio**: 6:1 (Desktop), 12:5 (Mobile)
- **Format**: JPG or PNG
- **Max File Size**: 800KB
- **Display**: Full-width banner at top of pages
- **Location**: Homepage, Category pages

### 3. **Top Banner Ads** (TopBannerAd)
- **Size**: 1200px × 150px
- **Aspect Ratio**: 8:1
- **Format**: JPG or PNG
- **Max File Size**: 500KB

### 4. **Bottom Banner Ads** (BottomBannerAd)
- **Size**: 1200px × 150px
- **Aspect Ratio**: 8:1
- **Format**: JPG or PNG
- **Max File Size**: 500KB

---

## 🎨 Design Guidelines

### Visual Style
- **Theme**: Professional, modern, business-oriented
- **Colors**: Match website theme (blues, whites, clean palette)
- **Typography**: Clear, readable fonts
- **Content**: Relevant to local businesses, services, events

### Context-Appropriate Themes
1. **Business Services**: Office, handshake, professional settings
2. **Local Events**: Community gatherings, festivals, cultural events
3. **Restaurants**: Food, dining, culinary experiences
4. **Shopping**: Retail, products, marketplaces
5. **Tourism**: Landmarks, attractions, travel

---

## 📊 Database Structure

### Popup Ads Table: `popup_ads`
```sql
- id (uuid)
- name (text) - Internal reference name
- image_url (text) - URL to the image
- link_url (text, nullable) - Where ad clicks go
- is_active (boolean) - Show/hide ad
- sort_order (integer) - Display priority
- starts_at (timestamp, nullable) - Schedule start
- ends_at (timestamp, nullable) - Schedule end
- created_at (timestamp)
- updated_at (timestamp)
```

### Banner Ads Table: `sponsored_banners`
```sql
- id (uuid)
- banner_image_url (text)
- banner_alt_text (text, nullable)
- company_website (text, nullable)
- company_name (text, nullable)
- is_active (boolean)
- status (text) - 'approved', 'pending', 'rejected'
- payment_status (text) - 'paid', 'unpaid'
- created_at (timestamp)
```

---

## 🔧 How to Replace Ad Images

### Option 1: Admin Dashboard (EASIEST) ✅

1. **Navigate to Admin Panel**
   - Go to: https://prototype-five-rosy.vercel.app/admin
   - Login with your admin credentials

2. **For Popup Ads**:
   - Click "Popup Ads" in the sidebar
   - Click "Add New Popup" or "Edit" on existing
   - Upload new image file
   - Set link URL (where users go when they click)
   - Toggle "Active" status
   - Set display order
   - Save

3. **For Banner Ads**:
   - Click "Sponsored Ads" in the sidebar
   - Click "Add New Banner" or "Edit" on existing
   - Upload new banner image
   - Enter company website
   - Set status to "Approved"
   - Mark as "Active"
   - Save

### Option 2: Direct Database Access (ADVANCED)

1. **Access Supabase Dashboard**
   - Go to: https://supabase.com
   - Login to your project
   - Navigate to Table Editor

2. **Upload Images First**:
   - Go to Storage → Create bucket (if not exists): `ad-images`
   - Upload your images
   - Copy the public URL

3. **Update Database**:
   - Go to `popup_ads` or `sponsored_banners` table
   - Edit the `image_url` or `banner_image_url` field
   - Paste the new image URL
   - Set `is_active` to `true`
   - Save

### Option 3: Bulk Upload via SQL (FASTEST FOR MANY)

```sql
-- Example: Update popup ad image
UPDATE popup_ads 
SET image_url = 'https://your-storage-url.com/new-image.jpg',
    updated_at = NOW()
WHERE id = 'your-popup-id';

-- Example: Add new popup ad
INSERT INTO popup_ads (name, image_url, link_url, is_active, sort_order)
VALUES ('Summer Sale 2025', 'https://url-to-image.jpg', 'https://company.com', true, 1);
```

---

## 🖼️ Image Generation Prompts

### For AI Image Generation (DALL-E, Midjourney, etc.)

#### Popup Ad Prompts (16:9 Landscape):
1. **Business Services**:
   "Professional business advertisement, modern office setting, diverse professionals shaking hands, clean corporate aesthetic, blue and white color scheme, 16:9 widescreen format, high quality, 1280x720"

2. **Local Restaurant**:
   "Appetizing food photography, elegant restaurant setting, diverse cuisine, warm inviting atmosphere, professional food styling, 16:9 landscape format, 1280x720"

3. **Events & Entertainment**:
   "Vibrant community event poster, diverse people enjoying festival, colorful and energetic, modern design, 16:9 widescreen aspect ratio, 1280x720"

4. **Tourism & Travel** (Like sample.jpg):
   "Beautiful African landscape, adventure tourism, scenic natural environment, vibrant colors, cinematic lighting, 16:9 widescreen format, professional photography, 1280x720"

#### Banner Ad Prompts:
1. **Business Banner**:
   "Wide professional business banner, modern corporate design, clean layout with copy space, blue gradient background, 6:1 aspect ratio, high resolution"

2. **Shopping Banner**:
   "E-commerce banner design, product showcase, modern retail aesthetic, wide format 6:1, professional photography"

3. **Tourism Banner**:
   "Travel destination banner, beautiful landscape, inviting atmosphere, wide panoramic view, 6:1 aspect ratio"

---

## ✅ Recommended Workflow

1. **Generate/Prepare Images**:
   - Use AI tools or hire designer
   - Follow dimension specifications above
   - Optimize for web (compress to <500KB)

2. **Upload via Admin Dashboard**:
   - Login to admin panel
   - Navigate to appropriate section
   - Upload images one by one
   - Set active status and links

3. **Test on Live Site**:
   - Visit homepage
   - Check popup appears after 5 seconds
   - Verify banners display correctly
   - Test on mobile devices

4. **Monitor Performance**:
   - Check click-through rates
   - Rotate ads regularly
   - Update seasonal content

---

## 🚀 Quick Start Checklist

- [ ] Access admin dashboard
- [ ] Prepare images (correct dimensions)
- [ ] Upload to Popup Ads section
- [ ] Upload to Sponsored Banners section
- [ ] Set all as "Active"
- [ ] Test on live site
- [ ] Verify mobile responsiveness

---

## 📞 Need Help?

- Admin Panel: `/admin/popups` and `/admin/sponsored-ads`
- Database: Supabase Dashboard → Table Editor
- Storage: Supabase Dashboard → Storage → ad-images bucket

**Note**: The admin dashboard is the EASIEST and SAFEST way to manage ad images!
