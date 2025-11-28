# 🎨 Optimal Ad Image Sizes Guide

## 📐 **RECOMMENDED IMAGE DIMENSIONS**

### **Banner Ads (Top & Bottom)**

**Optimal Size: 1200 x 200 pixels**
- **Aspect Ratio:** 6:1 (wide landscape)
- **Format:** JPG or PNG
- **File Size:** < 200KB
- **Why this works:**
  - Fits perfectly in the 200px height container
  - Wide enough for desktop displays
  - Scales down nicely for mobile
  - No cropping needed

**Alternative Sizes:**
- **Minimum:** 800 x 133 pixels (6:1 ratio)
- **Maximum:** 1600 x 267 pixels (6:1 ratio)

**Key Points:**
- ✅ Keep 6:1 aspect ratio (width is 6x the height)
- ✅ Important content in center (safe zone)
- ✅ Avoid text smaller than 20px
- ✅ High contrast for readability

---

### **Popup Ads**

**Optimal Size: 1280 x 720 pixels (16:9 landscape)**
- **Aspect Ratio:** 16:9 (standard HD)
- **Format:** JPG or PNG
- **File Size:** < 300KB
- **Why this works:**
  - Standard screen ratio
  - Fits well in 672px wide container
  - Looks good on all devices
  - Professional appearance

**Alternative Sizes:**
- **Portrait:** 720 x 1280 pixels (9:16) - for mobile-focused ads
- **Square:** 1080 x 1080 pixels (1:1) - for social media style ads

**Key Points:**
- ✅ 16:9 is most versatile
- ✅ Important content in center 80%
- ✅ Avoid text near edges
- ✅ Test on mobile and desktop

---

## 📊 **CURRENT CONTAINER SIZES**

### **Banner Ads:**
- **Height:** 200px (fixed)
- **Width:** 100% of container
- **Display:** `object-contain` (no cropping)
- **Background:** Gradient (blue/purple)

### **Popup Ads:**
- **Max Width:** 672px on desktop (max-w-2xl)
- **Max Width Mobile:** 95vw (95% of screen)
- **Max Height:** 70vh (70% of viewport height)
- **Display:** `object-contain` (no cropping)

---

## 🎯 **DESIGN TIPS**

### **For Banner Ads:**

1. **Layout:**
   ```
   [Logo/Brand]  [Main Message]  [Call-to-Action]
   ```

2. **Text Size:**
   - Headline: 40-60px
   - Subtext: 20-30px
   - CTA: 25-35px

3. **Safe Zones:**
   - Keep important content in center 80%
   - Avoid edges (may be cut on some screens)

4. **Colors:**
   - High contrast with background
   - Readable from distance
   - Brand colors prominent

### **For Popup Ads:**

1. **Layout:**
   ```
   ┌─────────────────┐
   │                 │
   │   [Main Image]  │
   │                 │
   │  [Headline]     │
   │  [CTA Button]   │
   │                 │
   └─────────────────┘
   ```

2. **Text Size:**
   - Headline: 48-72px
   - Body: 24-32px
   - CTA: 32-40px

3. **Safe Zones:**
   - Keep content in center 80%
   - Leave 10% margin on all sides
   - CTA button in bottom third

4. **Colors:**
   - Eye-catching but not overwhelming
   - Clear CTA button (contrasting color)
   - Readable text

---

## 🖼️ **IMAGE EXAMPLES**

### **Banner Ad (1200 x 200px):**
```
┌────────────────────────────────────────────────────────────┐
│ [LOGO]  "Special Offer - 50% Off!"  [SHOP NOW →]          │
└────────────────────────────────────────────────────────────┘
```

### **Popup Ad (1280 x 720px):**
```
┌──────────────────────────┐
│                          │
│    [Product Image]       │
│                          │
│  "Limited Time Offer"    │
│                          │
│    [GET 50% OFF]         │
│                          │
└──────────────────────────┘
```

---

## 🛠️ **TOOLS FOR CREATING ADS**

### **Free Tools:**
1. **Canva** - canva.com
   - Templates for all sizes
   - Easy drag-and-drop
   - Free tier available

2. **Figma** - figma.com
   - Professional design tool
   - Free for individuals
   - Precise control

3. **Photopea** - photopea.com
   - Free Photoshop alternative
   - Works in browser
   - No signup needed

### **Quick Templates:**
- Search "banner ad template 1200x200"
- Search "popup ad template 1280x720"
- Customize with your brand

---

## ✅ **CHECKLIST BEFORE UPLOADING**

### **Banner Ads:**
- [ ] Dimensions: 1200 x 200px (or 6:1 ratio)
- [ ] File size: < 200KB
- [ ] Format: JPG or PNG
- [ ] Text is readable
- [ ] Important content in center
- [ ] High contrast colors
- [ ] Tested on mobile preview

### **Popup Ads:**
- [ ] Dimensions: 1280 x 720px (16:9)
- [ ] File size: < 300KB
- [ ] Format: JPG or PNG
- [ ] Text is large and clear
- [ ] CTA button prominent
- [ ] Safe zones respected
- [ ] Tested on mobile and desktop

---

## 📱 **MOBILE CONSIDERATIONS**

### **Banner Ads on Mobile:**
- Will scale down to fit screen width
- Height stays at 200px
- Text should still be readable when scaled
- Test at 375px width (iPhone size)

### **Popup Ads on Mobile:**
- Will scale to 95% of screen width
- Height adjusts to maintain aspect ratio
- Should look good in portrait orientation
- Test on actual mobile device

---

## 🎨 **CURRENT AD SPECIFICATIONS**

### **Your Platform:**
- **Banner Height:** 200px (fixed)
- **Popup Max Width:** 672px desktop, 95vw mobile
- **Popup Max Height:** 70vh
- **Display Mode:** `object-contain` (no cropping)
- **Background:** Gradient fill for empty space

### **This Means:**
- Images won't be cropped
- Aspect ratio is preserved
- Empty space filled with gradient
- Full image always visible

---

## 💡 **PRO TIPS**

1. **Use 6:1 ratio for banners** - Perfect fit, no wasted space
2. **Use 16:9 for popups** - Standard, looks professional
3. **Keep file sizes small** - Faster loading, better UX
4. **Test on real devices** - Emulators don't show everything
5. **Use web-optimized formats** - JPG for photos, PNG for graphics
6. **Compress images** - Use TinyPNG or similar tools

---

## 🚀 **QUICK START**

### **Need Banner Ads Now?**
1. Go to Canva.com
2. Create custom size: 1200 x 200px
3. Add your content
4. Export as JPG
5. Upload to your platform

### **Need Popup Ads Now?**
1. Go to Canva.com
2. Create custom size: 1280 x 720px
3. Add your content
4. Export as JPG
5. Upload to your platform

---

## 📞 **NEED HELP?**

If your ads still don't look right:
1. Check the dimensions match recommendations
2. Verify file size is reasonable
3. Test the image in the browser first
4. Clear browser cache and reload

**Your ads will look perfect with these sizes!** 🎨✨
