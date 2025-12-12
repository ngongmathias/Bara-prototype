# ✅ Auto-Refresh Setup Checklist

## 🎯 Quick Setup (15 Minutes)

Follow these steps to enable automatic news refresh every 6 hours.

---

### ☐ **Step 1: Deploy Edge Function** (5 min)

Open terminal in your project folder:

```bash
# Login to Supabase (if not already)
npx supabase login

# Link your project (you'll need your project ref)
npx supabase link --project-ref YOUR_PROJECT_REF

# Deploy the function
npx supabase functions deploy refresh-news-feeds
```

**Where to find project ref:**
- Supabase Dashboard → Project Settings → General → Reference ID

**Expected output:**
```
Deploying function refresh-news-feeds...
Function deployed successfully!
```

---

### ☐ **Step 2: Set CRON_SECRET** (2 min)

In Supabase Dashboard:

1. Go to **Project Settings** → **Edge Functions**
2. Click **"Add Secret"**
3. Name: `CRON_SECRET`
4. Value: `your-random-secret-key-123` (any random string)
5. Click **Save**

**Why:** Secures the function from unauthorized access

---

### ☐ **Step 3: Enable pg_cron** (1 min)

In Supabase Dashboard:

1. Go to **Database** → **Extensions**
2. Search: `pg_cron`
3. Click **Enable**

**Why:** Required for scheduling automatic tasks

---

### ☐ **Step 4: Set Environment Variables** (2 min)

In Supabase **SQL Editor**, run this (replace with your values):

```sql
-- Your Supabase URL (from Project Settings → API)
ALTER DATABASE postgres SET app.supabase_url = 'https://xxxxx.supabase.co';

-- Your service role key (from Project Settings → API → service_role)
ALTER DATABASE postgres SET app.supabase_service_key = 'eyJhbGc...your-key-here';
```

**Where to find:**
- **URL:** Project Settings → API → Project URL
- **Service Key:** Project Settings → API → service_role (click "Reveal" to see it)

---

### ☐ **Step 5: Run Cron Setup SQL** (1 min)

In Supabase **SQL Editor**:

1. Open file: `supabase/migrations/20241212_setup_news_refresh_cron.sql`
2. Copy ALL contents
3. Paste in SQL Editor
4. Click **Run**

**Expected output:**
```
Cron job created successfully
```

---

### ☐ **Step 6: Test It Works** (2 min)

In Supabase **SQL Editor**, run:

```sql
-- Manually trigger to test
SELECT trigger_news_refresh();
```

Wait 30 seconds, then check:

```sql
-- Should see articles
SELECT COUNT(*) FROM rss_feeds;
```

✅ If you see a number > 0, it's working!

---

## 🎉 You're Done!

News will now refresh automatically every 6 hours:
- **00:00 UTC** (Midnight)
- **06:00 UTC** (6 AM)
- **12:00 UTC** (Noon)
- **18:00 UTC** (6 PM)

**No manual work needed!** ✅

---

## 🔍 Verify It's Running

### **Check Cron Job:**
```sql
SELECT * FROM cron.job WHERE jobname = 'refresh-news-feeds-every-6-hours';
```

Should show: `active = true`

### **Check Last Run:**
```sql
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 5;
```

Should show recent runs

### **Check Articles:**
```sql
SELECT COUNT(*), MAX(created_at) FROM rss_feeds;
```

Should show articles and recent timestamp

---

## 🆘 Troubleshooting

### **Issue: Function deployment fails**

**Error:** "Project not linked"
**Fix:** Run `npx supabase link --project-ref YOUR_PROJECT_REF`

**Error:** "Not logged in"
**Fix:** Run `npx supabase login`

---

### **Issue: Cron job not running**

**Check:**
```sql
SELECT * FROM cron.job;
```

**If empty:**
- Re-run Step 5 (cron setup SQL)
- Make sure pg_cron is enabled

---

### **Issue: No articles added**

**Check function logs:**
1. Supabase Dashboard → **Edge Functions**
2. Click **refresh-news-feeds**
3. View **Logs**

**Common fixes:**
- Check CRON_SECRET is set
- Check service_role key is correct
- Manually trigger: `SELECT trigger_news_refresh();`

---

## 📊 What You Get

**Automatic:**
- ✅ Runs 4 times per day
- ✅ Fetches from 22 sources
- ✅ Adds 100-200+ articles per run
- ✅ Zero manual work

**Reliable:**
- ✅ Runs even when you're offline
- ✅ Logs all activity
- ✅ Retries on failure
- ✅ Safe and secure

**Scalable:**
- ✅ Add new country → Auto-included
- ✅ Works for unlimited countries
- ✅ No performance issues

---

## 📝 Summary

**Time:** 15 minutes (one-time setup)

**Steps:**
1. ✅ Deploy function
2. ✅ Set secret
3. ✅ Enable pg_cron
4. ✅ Set env variables
5. ✅ Run cron SQL
6. ✅ Test

**Result:**
🎉 **Automatic news refresh every 6 hours!**

---

**Need help? Check `AUTO_REFRESH_SETUP.md` for detailed guide!** 🚀
