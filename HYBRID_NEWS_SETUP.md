# 🚀 Hybrid News System - Setup Guide

## ✅ What I've Implemented

You now have a **smart hybrid news system** that:
- ✅ Starts with **free Google News RSS**
- ✅ Automatically upgrades to **paid APIs** when you add keys
- ✅ **Zero code changes** needed to upgrade
- ✅ **Smart fallback** - always works even if APIs fail

---

## 📋 What You Need to Do

### **Step 1: Run the Auto-Generated SQL** (5 minutes)

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy the entire contents of `setup_rss_feeds_auto.sql`
3. Click **Run**
4. ✅ You should see: "RSS Feed Sources Created: [number]"

**What this does:**
- Creates `rss_feed_sources` and `rss_feeds` tables
- Auto-generates Google News RSS for ALL your countries
- Sets up trigger to auto-create news for new countries
- Adds global news sources (BBC, Reuters, etc.)

---

### **Step 2: Refresh News Feeds** (30 seconds)

1. Go to your admin panel: `/admin/rss-feeds`
2. Click the **"Refresh Now"** button
3. Wait 10-30 seconds
4. ✅ Articles will be fetched and cached

**What happens:**
- System fetches news from all sources
- Caches articles in database
- News appears on country pages

---

### **Step 3: Verify It Works** (1 minute)

1. Go to any country page (e.g., Benin)
2. Scroll to "Benin News" section
3. ✅ You should see news articles!

---

## 🎯 You're Done! (Using Free RSS)

At this point, you have a **fully functional news system** using:
- ✅ Google News RSS (free, unlimited)
- ✅ Auto-generated for all countries
- ✅ Zero maintenance required

**No API keys needed!** The system works perfectly with free RSS.

---

## 🔑 Optional: Add API Keys (Later)

When you're ready to upgrade news quality, you can add API keys:

### **Option A: GNews API** (Recommended for Small Sites)

**Cost:** $9.99/month (10,000 requests)

**Setup:**
1. Sign up at https://gnews.io/
2. Get your API key
3. Add to `.env`:
   ```
   VITE_GNEWS_KEY=your_key_here
   ```
4. ✅ System automatically uses GNews!

---

### **Option B: Currents API** (Best Free Tier)

**Cost:** Free (600 requests/day) or $12/month

**Setup:**
1. Sign up at https://currentsapi.services/
2. Get your API key
3. Add to `.env`:
   ```
   VITE_CURRENTS_KEY=your_key_here
   ```
4. ✅ System automatically uses Currents!

---

### **Option C: NewsAPI** (Best for Production)

**Cost:** $449/month (unlimited requests)

**Setup:**
1. Sign up at https://newsapi.org/
2. Get your API key
3. Add to `.env`:
   ```
   VITE_NEWSAPI_KEY=your_key_here
   ```
4. ✅ System automatically uses NewsAPI!

---

## 🔄 How the Hybrid System Works

### **Priority Order:**
```
1. Try NewsAPI (if key configured) → Best quality
2. Try GNews (if key configured) → Good quality, affordable
3. Try Currents (if key configured) → Good free tier
4. Fallback to Google RSS → Always works, free
```

### **Example Scenarios:**

**Scenario 1: No API Keys (Default)**
```
User clicks "Refresh Now"
    ↓
System checks: No API keys configured
    ↓
Uses Google News RSS for all countries
    ↓
✅ Free, works perfectly!
```

**Scenario 2: GNews Key Added**
```
User clicks "Refresh Now"
    ↓
System checks: GNews key found!
    ↓
Tries GNews API for each country
    ↓
If GNews works → Uses GNews (better quality)
If GNews fails → Falls back to RSS (reliable)
    ↓
✅ Best of both worlds!
```

**Scenario 3: All Keys Added**
```
User clicks "Refresh Now"
    ↓
System checks: Multiple keys found!
    ↓
For each country:
  1. Try NewsAPI → Best quality
  2. If fails, try GNews → Good quality
  3. If fails, try Currents → Free tier
  4. If fails, use RSS → Always works
    ↓
✅ Maximum reliability + quality!
```

---

## 📊 Console Logs (What You'll See)

### **Without API Keys:**
```
ℹ️ No API keys configured, using RSS feeds only
📰 Fetching news from Google News Benin...
ℹ️ Using RSS feed for Google News Benin
✅ RSS refresh complete. Added 45 new items.
```

### **With GNews Key:**
```
🔑 Configured APIs: GNews
📰 Fetching news from Google News Benin...
✅ Fetched 10 articles from GNews for Benin
📰 Fetching news from Google News Nigeria...
✅ Fetched 10 articles from GNews for Nigeria
✅ RSS refresh complete. Added 120 new items.
```

### **With All Keys:**
```
🔑 Configured APIs: NewsAPI, GNews, Currents
📰 Fetching news from Google News Benin...
✅ Fetched 10 articles from NewsAPI for Benin
📰 Fetching news from Google News Nigeria...
✅ Fetched 10 articles from NewsAPI for Nigeria
✅ RSS refresh complete. Added 150 new items.
```

---

## 🌍 Adding New Countries

### **Automatic News Source Creation:**

```sql
-- You add a new country:
INSERT INTO countries (name, code) VALUES ('Togo', 'TG');

-- Trigger automatically creates:
INSERT INTO rss_feed_sources (name, url, country_code, country_name)
VALUES (
  'Google News Togo',
  'https://news.google.com/rss/search?q=when:24h+allinurl:togo&gl=TG',
  'TG',
  'Togo'
);

-- Next refresh:
-- ✅ Fetches Togo news (via API or RSS)
-- ✅ Caches in database
-- ✅ Shows on Togo page
```

**No manual work needed!** ✅

---

## 💰 Cost Comparison

### **Current Setup (Free):**
- **Cost:** $0/month
- **Quality:** Good (Google News)
- **Maintenance:** Zero
- **Scalability:** Unlimited countries
- ✅ **Perfect for starting out!**

### **With GNews ($10/mo):**
- **Cost:** $10/month
- **Quality:** Excellent (curated sources)
- **Requests:** 10,000/month
- **Maintenance:** Zero
- ✅ **Great for growing sites**

### **With NewsAPI ($449/mo):**
- **Cost:** $449/month
- **Quality:** Best (80,000+ sources)
- **Requests:** Unlimited
- **Maintenance:** Zero
- ✅ **Best for production/scale**

---

## 🔧 Troubleshooting

### **"No news available at the moment"**

**Possible causes:**
1. Haven't run the SQL setup yet
2. Haven't clicked "Refresh Now"
3. RSS feeds are being fetched (wait 30 seconds)

**Solution:**
1. Run `setup_rss_feeds_auto.sql`
2. Go to `/admin/rss-feeds`
3. Click "Refresh Now"
4. Wait 30 seconds
5. Check country page again

---

### **API Not Working**

**Check:**
1. API key is correct in `.env`
2. API key is active (not expired)
3. You have API credits remaining
4. Check console for error messages

**Fallback:**
- System automatically falls back to RSS
- News still works, just uses free source

---

## 📝 Summary

### **What You Have Now:**
✅ Hybrid news system implemented  
✅ Free Google News RSS (default)  
✅ Smart API fallback (when keys added)  
✅ Auto-generation for new countries  
✅ Zero maintenance required  

### **What You Need to Do:**
1. ✅ Run `setup_rss_feeds_auto.sql` in Supabase
2. ✅ Click "Refresh Now" in admin panel
3. ✅ Verify news appears on country pages
4. ⏳ (Optional) Add API keys later for better quality

### **Next Steps:**
- Start with free RSS (works great!)
- Monitor user engagement with news
- If high engagement → Consider adding GNews ($10/mo)
- If very high traffic → Upgrade to NewsAPI ($449/mo)

---

**Questions? Issues? Let me know!** 🚀
