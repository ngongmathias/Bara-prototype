# Marketplace Testing Guide

## Pre-Launch Checklist

Before sharing the marketplace with users, complete this comprehensive testing guide.

---

## 1. USER JOURNEY TESTING

### A. Browse & Search
- [ ] Visit `/marketplace` - Hub page loads with all categories
- [ ] Click on "Property for Sale" - Redirects to `/marketplace/property-sale`
- [ ] Click on "Motors" - Redirects to `/marketplace/motors`
- [ ] Click on "Jobs" - Redirects to `/marketplace/jobs`
- [ ] Click on "Classifieds" - Redirects to `/marketplace/classifieds`
- [ ] Use search bar at `/marketplace/search?q=test` - Results display correctly
- [ ] Search returns relevant listings based on title/description

### B. Filtering (Property Page)
- [ ] Select a country filter - Listings update
- [ ] Select a subcategory - Listings update
- [ ] Select property type - Listings update
- [ ] Select beds filter - Listings update
- [ ] Multiple filters work together correctly
- [ ] "Clear filters" resets all selections

### C. Listing Detail Page
- [ ] Click any listing card - Redirects to `/marketplace/listing/:id`
- [ ] Images display correctly with navigation arrows
- [ ] Thumbnail strip works (if multiple images)
- [ ] Price displays correctly with currency
- [ ] Description shows full text
- [ ] Attributes/specs display (bedrooms, bathrooms, etc.)
- [ ] Seller information visible
- [ ] Location details shown
- [ ] Contact buttons work:
  - [ ] Call button opens phone dialer
  - [ ] WhatsApp button opens WhatsApp with pre-filled message
  - [ ] Email button opens email client
- [ ] Favorite button (heart icon) works
- [ ] Share modal opens with all options
- [ ] Report modal opens and submits

### D. Post New Listing (Requires Sign-In)
- [ ] Navigate to `/marketplace/post`
- [ ] **Step 1: Category & Country**
  - [ ] Select category from dropdown
  - [ ] Select country from dropdown
  - [ ] "Next" button enabled only when both selected
- [ ] **Step 2: Basic Information**
  - [ ] Enter title (required)
  - [ ] Enter description (required)
  - [ ] Select subcategory (if available)
  - [ ] "Next" button validation works
- [ ] **Step 3: Pricing**
  - [ ] Enter price (required)
  - [ ] Select currency (USD, AED, EUR, GBP, RWF)
  - [ ] Select price type (fixed, negotiable, monthly, yearly)
- [ ] **Step 4: Attributes** (category-specific)
  - [ ] For Motors: Make, Model, Year, Kilometers, etc.
  - [ ] For Property: Bedrooms, Bathrooms, Sqft, etc.
  - [ ] Skip if not applicable
- [ ] **Step 5: Contact Information**
  - [ ] Name auto-filled from user profile
  - [ ] Email auto-filled
  - [ ] Phone number required
  - [ ] WhatsApp optional
  - [ ] Seller type (individual/dealer/agent)
- [ ] **Step 6: Location & Images**
  - [ ] Enter location details (required)
  - [ ] Image upload works (test with 1-5 images)
  - [ ] Set primary image
  - [ ] Remove image works
- [ ] **Submit**
  - [ ] Form submits successfully
  - [ ] Listing created with status "pending"
  - [ ] Redirects to "My Listings"
  - [ ] Success message displays

### E. My Listings (User Dashboard)
- [ ] Navigate to `/marketplace/my-listings`
- [ ] All user listings display
- [ ] Filter by status works (All, Active, Pending, Sold)
- [ ] **View button** - Opens listing detail page
- [ ] **Edit button** - Opens edit form at `/marketplace/edit/:id`
- [ ] **Mark as Sold** - Updates status to "sold"
- [ ] **Delete button** - Deletes listing with confirmation

### F. Edit Listing
- [ ] Navigate to `/marketplace/edit/:id`
- [ ] All fields pre-populated with current data
- [ ] Update title, description, price
- [ ] Update contact information
- [ ] Update location
- [ ] Save changes - Updates listing
- [ ] Cancel - Returns to My Listings without saving

### G. Favorites
- [ ] Click heart icon on listing detail page - Adds to favorites
- [ ] Heart fills red when favorited
- [ ] Navigate to `/marketplace/favorites`
- [ ] All favorited listings display
- [ ] Remove favorite - Removes from list
- [ ] Click listing - Opens detail page

### H. Share Functionality
- [ ] Click "Share" on listing detail page
- [ ] Copy link - Copies URL to clipboard
- [ ] WhatsApp - Opens WhatsApp with link
- [ ] Facebook - Opens Facebook share dialog
- [ ] Twitter - Opens Twitter with pre-filled tweet
- [ ] Email - Opens email client with link

### I. Report Listing
- [ ] Click "Report" on listing detail page
- [ ] Select reason from dropdown
- [ ] Add optional description
- [ ] Submit report - Creates report record
- [ ] Success message displays

---

## 2. ADMIN MODERATION TESTING

### A. Access Admin Dashboard
- [ ] Navigate to `/admin/marketplace`
- [ ] Admin authentication required
- [ ] Dashboard loads with stats:
  - Total Listings
  - Pending Approval
  - Active Listings
  - Open Reports

### B. Listings Management Tab
- [ ] View all listings in table format
- [ ] Search listings by title/description
- [ ] Filter by status (All, Pending, Active, Rejected, Sold)
- [ ] **View button** - Opens listing in new tab
- [ ] **Approve button** (for pending) - Changes status to "active"
- [ ] **Reject button** (for pending) - Changes status to "rejected"
- [ ] **Delete button** - Permanently deletes listing
- [ ] Thumbnail images display correctly

### C. Reports Management Tab
- [ ] Switch to "Reports" tab
- [ ] View all reports with:
  - Listing title
  - Reason
  - Description
  - Status
  - Date reported
- [ ] **View Listing** - Opens reported listing
- [ ] **Mark Reviewed** - Updates report status
- [ ] **Dismiss** - Dismisses report

### D. Content Moderation Workflow
**Test inappropriate content scenario:**
1. [ ] User posts listing with test "inappropriate" content
2. [ ] Listing appears in admin with "pending" status
3. [ ] Admin reviews listing images and description
4. [ ] Admin rejects listing if inappropriate
5. [ ] User sees "rejected" status in My Listings
6. [ ] Rejected listing does NOT appear in public marketplace

**Test report workflow:**
1. [ ] User A reports User B's listing
2. [ ] Report appears in admin "Reports" tab
3. [ ] Admin reviews reported listing
4. [ ] Admin can:
   - Reject the listing (if violation confirmed)
   - Dismiss the report (if false report)
   - Mark as reviewed (for tracking)

---

## 3. DATABASE VERIFICATION

### Check Supabase Tables
- [ ] `marketplace_listings` - All fields populated correctly
- [ ] `marketplace_listing_images` - Images stored with URLs
- [ ] `marketplace_listing_attributes` - Category-specific attributes saved
- [ ] `marketplace_favorites` - User favorites tracked
- [ ] `marketplace_reports` - Reports logged with details

### Run Migrations
```sql
-- Check if all migrations applied
SELECT * FROM supabase_migrations.schema_migrations 
WHERE version LIKE '202601%' 
ORDER BY version DESC;
```

Expected migrations:
- `20260102_create_marketplace_schema.sql`
- `20260102_seed_marketplace_categories.sql`
- `20260102_seed_marketplace_dummy_data.sql`
- `20260103_add_marketplace_favorites.sql`
- `20260103_add_marketplace_reports.sql`

---

## 4. SECURITY & PERMISSIONS

### User Permissions
- [ ] Users can only edit their own listings
- [ ] Users can only delete their own listings
- [ ] Attempting to edit another user's listing redirects with error
- [ ] Unauthenticated users redirected to sign-in for:
  - Post Listing
  - My Listings
  - Edit Listing
  - Favorites (can view but not add)

### Admin Permissions
- [ ] Only admin users can access `/admin/marketplace`
- [ ] Non-admin users redirected from admin routes
- [ ] Admin can moderate all listings regardless of owner

---

## 5. EDGE CASES & ERROR HANDLING

- [ ] Submit listing without required fields - Validation errors display
- [ ] Upload image larger than size limit - Error message
- [ ] Upload non-image file - Rejected with error
- [ ] Delete listing with existing favorites - Cascades correctly
- [ ] Delete listing with existing reports - Cascades correctly
- [ ] Search with no results - "No results" message displays
- [ ] Filter with no matches - "No listings found" message
- [ ] Navigate to non-existent listing ID - 404 or "Not Found" page

---

## 6. PERFORMANCE & UX

- [ ] Images load quickly (optimized sizes)
- [ ] Filtering updates without full page reload
- [ ] Search results appear within 1-2 seconds
- [ ] Pagination works for large listing sets (if implemented)
- [ ] Mobile responsive on all pages
- [ ] Forms are keyboard accessible
- [ ] Loading states display during async operations

---

## 7. CONTENT MODERATION SAFEGUARDS

### Current Safeguards in Place:
✅ **Approval Workflow**
- All new listings start with `status: 'pending'`
- Only admin-approved listings show in public marketplace
- Users see "Pending Approval" in My Listings

✅ **Report System**
- Users can report inappropriate listings
- Reports tracked in database with reason
- Admin can review and take action

✅ **Admin Controls**
- Approve/Reject listings before going live
- View all images before approval
- Delete listings permanently
- Review reports with context

### Recommended Additional Safeguards (Future):
⚠️ **Image Moderation** (Not yet implemented)
- Consider integrating image moderation API (e.g., AWS Rekognition, Google Cloud Vision)
- Flag images with adult content, violence, etc.
- Auto-reject or flag for manual review

⚠️ **Text Content Filtering** (Not yet implemented)
- Scan titles/descriptions for banned words
- Flag suspicious patterns (e.g., external URLs, phone numbers in description)

⚠️ **User Reputation System** (Not yet implemented)
- Track user violations
- Auto-flag listings from repeat offenders
- Implement user bans for severe violations

---

## 8. GO-LIVE CHECKLIST

Before sharing with users:
- [ ] All user journey tests passed
- [ ] All admin moderation tests passed
- [ ] Database migrations applied to production
- [ ] Admin users configured in Clerk
- [ ] Test with real images (appropriate content)
- [ ] Test with real user accounts (not just admin)
- [ ] Verify email notifications work (if implemented)
- [ ] Check mobile responsiveness on actual devices
- [ ] Review Terms of Service for marketplace usage
- [ ] Prepare moderation guidelines for admin team
- [ ] Set up monitoring for reported listings
- [ ] Backup database before launch

---

## CURRENT MODERATION MECHANISM

**How it works:**
1. **User Posts Listing** → Status: `pending`
2. **Admin Reviews** → Checks images, description, price
3. **Admin Decision:**
   - ✅ **Approve** → Status: `active` (shows in marketplace)
   - ❌ **Reject** → Status: `rejected` (hidden from marketplace)
   - 🗑️ **Delete** → Permanently removed

**For inappropriate images:**
- Admin must manually review each listing before approval
- Admin can view all images in the listing detail page
- If inappropriate, admin clicks "Reject" or "Delete"
- User sees rejection in their dashboard but cannot republish without editing

**Recommendation:** 
- Start with manual moderation for first 100-200 listings
- Monitor common violations
- Implement automated filters based on patterns observed
- Consider requiring phone verification for posting privileges

---

## TESTING COMMANDS

```bash
# Local testing
npm run dev

# Build test
npm run build

# Deploy to Vercel
git push origin main
```

---

## NOTES FOR ADMIN TEAM

**Daily Moderation Routine:**
1. Check `/admin/marketplace` for pending listings
2. Review each pending listing:
   - View all images
   - Read description for inappropriate content
   - Verify price is reasonable (not spam)
   - Check contact information is valid
3. Approve or reject within 24 hours
4. Review reports tab for user-flagged content
5. Take action on reported listings

**Red Flags to Watch For:**
- Multiple listings from same user in short time (spam)
- Prices significantly below market value (scam)
- External URLs in description (phishing)
- Stock photos instead of real images
- Vague or copy-pasted descriptions
- Contact information mismatches

---

**Last Updated:** January 2, 2026
**Version:** 1.0
