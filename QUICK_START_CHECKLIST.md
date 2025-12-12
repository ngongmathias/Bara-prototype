# ✅ Quick Start Checklist - Hybrid News System

## 🎯 What You Need to Do (10 Minutes Total)

### ☐ **Step 1: Run SQL Setup** (5 minutes)

1. Open **Supabase Dashboard**
2. Go to **SQL Editor**
3. Open file: `setup_rss_feeds_auto.sql`
4. Copy ALL contents
5. Paste in SQL Editor
6. Click **Run**
7. ✅ Should see: "RSS Feed Sources Created: [number]"

**What this does:**
- Creates database tables
- Auto-generates news sources for ALL countries
- Sets up auto-trigger for new countries

---

### ☐ **Step 2: Refresh Feeds** (1 minute)

1. Go to: `https://www.baraafrika.com/admin/rss-feeds`
2. Click **"Refresh Now"** button
3. Wait 30 seconds
4. ✅ Should see: "Added [number] new articles"

**What this does:**
- Fetches news from Google News RSS
- Caches articles in database
- Makes news available on country pages

---

### ☐ **Step 3: Verify** (1 minute)

1. Go to any country page (e.g., `/` and select Benin)
2. Scroll to "Benin News" section
3. ✅ Should see news articles!

**If you see "No news available":**
- Wait another 30 seconds (still fetching)
- Or click "Refresh Now" again

---

## 🎉 You're Done!

Your news system is now:
- ✅ Working with free Google News RSS
- ✅ Auto-generating for all countries
- ✅ Zero maintenance required
- ✅ Ready to upgrade to APIs anytime

---

## 🔮 Future (Optional)

### When You Want Better Quality News:

**Option 1: Add GNews ($10/month)**
1. Sign up: https://gnews.io/
2. Get API key
3. Add to `.env`: `VITE_GNEWS_KEY=your_key`
4. ✅ System automatically uses it!

**Option 2: Add Currents (Free 600/day)**
1. Sign up: https://currentsapi.services/
2. Get API key
3. Add to `.env`: `VITE_CURRENTS_KEY=your_key`
4. ✅ System automatically uses it!

**No code changes needed!** Just add the key and the system upgrades automatically.

---

## 📝 Summary

**Right Now:**
- Using free Google News RSS
- Works for unlimited countries
- Zero cost, zero maintenance

**Later (Optional):**
- Add API key for better quality
- System automatically upgrades
- Still falls back to RSS if API fails

---

## 🆘 Need Help?

Check these files:
- `HYBRID_NEWS_SETUP.md` - Full setup guide
- `NEWS_FEEDS_GUIDE.md` - Complete documentation
- `.env.example` - Environment variables

---

**Total Time:** 10 minutes  
**Cost:** $0  
**Maintenance:** Zero  
**Scalability:** Unlimited  

🚀 **Let's go!**
