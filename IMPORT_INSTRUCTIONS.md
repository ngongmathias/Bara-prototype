# 🚀 Data Import Instructions

## ✅ What's Ready

You have **148 records** ready to import:
- **100 Rwanda Businesses** (10 categories)
- **48 Sinc Events** (8 categories)

All data is in: `scripts/import_data.sql`

---

## 📝 Step-by-Step Import Process

### Option 1: SQL Editor (RECOMMENDED - 10 minutes)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com
   - Login to your project
   - Click "SQL Editor" in left sidebar

2. **Open the SQL File**
   - Navigate to: `C:\Users\Hp\Bara-Prototype\scripts\import_data.sql`
   - Open in any text editor
   - Copy ALL the content

3. **Run the SQL**
   - Paste into Supabase SQL Editor
   - Click "Run" or press Ctrl+Enter
   - Wait for completion (should take 10-30 seconds)

4. **Verify Import**
   - Go to "Table Editor" in Supabase
   - Check `businesses` table - should have 100+ Rwanda businesses
   - Check `events` table - should have 48+ events
   - Check `categories` and `event_categories` tables

### Option 2: Python Script (If you fix permissions)

```bash
# Install dependencies
pip install supabase python-dotenv

# Run import script
python scripts/import_to_database.py
```

---

## 🔍 Verification Queries

After import, run these in SQL Editor to verify:

```sql
-- Count businesses
SELECT COUNT(*) as total_businesses 
FROM businesses 
WHERE country_id = (SELECT id FROM countries WHERE name = 'Rwanda');

-- Count events
SELECT COUNT(*) as total_events 
FROM events 
WHERE country_id = (SELECT id FROM countries WHERE name = 'Rwanda');

-- View sample businesses
SELECT name, address, phone 
FROM businesses 
WHERE country_id = (SELECT id FROM countries WHERE name = 'Rwanda') 
LIMIT 10;

-- View upcoming events
SELECT title, start_date, venue_name 
FROM events 
WHERE country_id = (SELECT id FROM countries WHERE name = 'Rwanda') 
AND start_date > NOW() 
ORDER BY start_date 
LIMIT 10;
```

---

## 🌐 Test on Live Site

After importing:

1. **Visit your live site**: https://prototype-five-rosy.vercel.app/

2. **Check Business Listings**:
   - Go to Listings page
   - Filter by Rwanda
   - Should see 100 businesses

3. **Check Events Page**:
   - Go to Events page
   - Filter by Rwanda
   - Should see 48 events
   - Try searching, filtering by category
   - Click on events to see details

4. **Test Features**:
   - Search functionality
   - Category filters
   - Map view
   - Event details
   - Mobile responsive

---

## ⚠️ Troubleshooting

### If businesses don't show up:
- Check if Rwanda exists in `countries` table
- Check if Kigali exists in `cities` table
- Verify `category_id` matches existing categories

### If events don't show up:
- Check if event categories were created
- Verify date formats are correct
- Check `is_active` is set to `true`

### If SQL errors occur:
- Run queries step by step (not all at once)
- Check for single quote escaping issues
- Verify foreign key constraints

---

## 📊 Data Files Reference

| File | Description | Count |
|------|-------------|-------|
| `rwanda_businesses.json` | Raw business data | 100 |
| `sinc_events.json` | Raw event data | 48 |
| `import_data.sql` | SQL insert statements | All |
| `beyond_return_text.txt` | Ghana events (extracted) | 100+ |

---

## 🎯 Next Steps

1. ✅ Import data (10-20 min)
2. ✅ Test on live site (5-10 min)
3. ⏳ Optional: Add Ghana events (if time permits)

---

## 💡 Tips

- **Start with SQL Editor** - It's the fastest and most reliable
- **Run verification queries** after import to confirm success
- **Test on live site** before presentation
- **Ghana events** can be added later if needed

---

## 🆘 Need Help?

If you encounter issues:
1. Check Supabase logs for errors
2. Verify your database schema matches expected structure
3. Run verification queries to identify missing data
4. Check browser console for frontend errors

**You're almost there! Just one import step away from having 148 records live!** 🎉
