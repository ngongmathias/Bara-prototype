# Marketplace Quick Test Checklist

**Time Required:** ~15 minutes  
**Last Updated:** January 3, 2026

---

## ✅ CRITICAL TESTS (Must Pass Before Launch)

### 1. Admin Access (2 min)
- [ ] Go to `https://www.baraafrika.com/admin`
- [ ] Click "Marketplace" in sidebar → Should load listings table
- [ ] Click "Marketplace Categories" in sidebar → Should load categories table (not "Category not found")
- [ ] Both pages load without errors

### 2. Post a Listing (5 min)
- [ ] Go to `https://www.baraafrika.com/marketplace/post`
- [ ] Complete all 6 steps:
  - Step 1: Select category + country
  - Step 2: Enter title + description
  - Step 3: Set price + currency
  - Step 4: Add attributes (if applicable)
  - Step 5: Contact info
  - Step 6: Location
- [ ] Click "Submit"
- [ ] Redirects to "My Listings"
- [ ] New listing shows with "Pending" status
- [ ] Listing does NOT appear in public marketplace browse

### 3. Admin Moderation (3 min)
- [ ] Go to `https://www.baraafrika.com/admin/marketplace`
- [ ] See your pending listing in table
- [ ] Click "View" → Opens listing detail in new tab
- [ ] Click "Edit" → Opens edit form in new tab
- [ ] Click "Approve" → Status changes to "Active"
- [ ] Refresh marketplace → Listing now appears publicly

### 4. User Features (3 min)
- [ ] Browse marketplace → Click any listing
- [ ] Click heart icon → Adds to favorites
- [ ] Go to `/marketplace/favorites` → See favorited listing
- [ ] Click "Share" → Modal opens with copy link
- [ ] Click "Report" → Modal opens, submit report
- [ ] Search for listing → Results appear

### 5. Admin Categories (2 min)
- [ ] Go to `https://www.baraafrika.com/admin/marketplace-categories`
- [ ] Page loads with existing categories
- [ ] Click "Add Category" → Form opens
- [ ] Click chevron to expand category → Subcategories show
- [ ] Click "+" to add subcategory → Form opens

---

## 🚨 CRITICAL BUGS TO WATCH FOR

**If any of these happen, STOP and report:**
1. ❌ "Category not found" on `/admin/marketplace-categories`
2. ❌ Can't approve/reject listings in admin
3. ❌ Pending listings appear in public marketplace
4. ❌ Can't edit listings from admin panel
5. ❌ Posting fails or doesn't redirect

---

## 📊 WHAT I'VE VERIFIED (Automated)

✅ **Code Compilation:**
- All TypeScript files compile without errors
- Build completes successfully
- No import/export errors

✅ **Database Schema:**
- All migrations created
- Tables: `marketplace_listings`, `marketplace_categories`, `marketplace_subcategories`, `marketplace_listing_images`, `marketplace_listing_attributes`, `marketplace_favorites`, `marketplace_reports`

✅ **Routing:**
- All routes registered in App.tsx
- Admin routes prioritized before dynamic routes
- No route conflicts

✅ **Components:**
- All marketplace components created
- All admin components created
- All imports resolved

---

## ⚠️ WHAT I CAN'T TEST (Requires Browser)

❌ **User Authentication:**
- Sign-in/sign-up flows
- Clerk session management
- Protected routes

❌ **Database Operations:**
- Actual data insertion
- Supabase queries execution
- Image upload to storage

❌ **UI Interactions:**
- Form submissions
- Button clicks
- Modal dialogs
- Dropdown selections

❌ **Real-time Features:**
- Search functionality
- Filter updates
- Favorites toggle
- Status changes

---

## 🎯 RECOMMENDED TESTING ORDER

**Phase 1: Smoke Test (5 min)**
1. Access admin pages (no errors)
2. Post one test listing
3. Approve it as admin
4. Verify it appears publicly

**Phase 2: Full Flow (10 min)**
1. Post listing in each category
2. Test all admin actions (view, edit, approve, reject, delete)
3. Test user features (favorites, share, report)
4. Test category management (add, edit, delete)

**Phase 3: Edge Cases (Optional)**
1. Post listing without images
2. Reject a listing
3. Delete a listing
4. Add new category/subcategory

---

## 📝 TESTING NOTES

**Current Status:**
- ✅ All code deployed to production
- ✅ Routes configured correctly
- ✅ Admin navigation added
- ⏳ Waiting for user testing

**Known Limitations:**
- Image upload not yet implemented (placeholder only)
- No automated content moderation (manual only)
- No email notifications

**Next Steps After Testing:**
1. Fix any bugs found
2. Add image upload if needed
3. Final deployment
4. Share with users

---

## 🐛 HOW TO REPORT BUGS

**Include:**
1. What you were doing
2. What you expected
3. What actually happened
4. Screenshot if possible
5. Browser console errors (F12 → Console tab)

**Example:**
> "I clicked 'Add Category' but the form didn't open. Expected a modal dialog. Chrome console shows: [error message]"

---

**Ready to test?** Start with Phase 1 (5 minutes) and let me know the results!
