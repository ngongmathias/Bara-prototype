# Database Migrations Guide

## Overview
This folder contains SQL migration scripts for the BARA platform database.

## Migration Order

Run these migrations in the following order:

### 1. Country Management Enhancements
**File:** `add_country_visual_assets.sql`

**Purpose:** Adds additional fields to the `country_info` table for better country data management.

**What it adds:**
- `leader_image_url` - URL for president/leader photo
- `monument_image_url` - URL for national monument/landmark photo
- `largest_city_population` - Population of the largest city
- `capital_population` - Population of the capital city

**Run this first!**

```sql
-- Connect to your database and run:
\i database/migrations/add_country_visual_assets.sql
```

---

### 2. Global Africa System
**File:** `create_global_africa_table.sql`

**Purpose:** Creates a separate system for managing African diaspora communities and institutions (NOT countries).

**What it creates:**
- `global_africa` table - Main entries (African Americans, HBCUs, Brazil diaspora, etc.)
- `global_africa_info` table - Detailed information about each entry
- Initial seed data for 6 diaspora communities:
  - 🇺🇸 African Americans
  - 🎓 HBCUs (USA)
  - 🇧🇷 Brazil
  - 🇭🇹 Haïti
  - 🇯🇲 Jamaica
  - 🇹🇹 Trinidad

**Run this second!**

```sql
-- Connect to your database and run:
\i database/migrations/create_global_africa_table.sql
```

---

## How to Run Migrations

### Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of the migration file
4. Paste into the SQL editor
5. Click **Run**

### Using psql Command Line
```bash
# Connect to your database
psql -h your-db-host -U your-username -d your-database

# Run the migration
\i database/migrations/add_country_visual_assets.sql
\i database/migrations/create_global_africa_table.sql
```

### Using Supabase CLI
```bash
# If you have Supabase CLI installed
supabase db push
```

---

## Verification

After running the migrations, verify they worked:

```sql
-- Check country_info columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'country_info' 
AND column_name IN ('leader_image_url', 'monument_image_url', 'largest_city_population', 'capital_population');

-- Check global_africa tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('global_africa', 'global_africa_info');

-- Check initial Global Africa entries
SELECT name, code, flag_emoji FROM global_africa ORDER BY display_order;
```

---

## Important Notes

⚠️ **Global Africa vs Countries:**
- **Countries** = African nations (Kenya, Nigeria, South Africa, etc.)
- **Global Africa** = Diaspora communities outside Africa (African Americans, HBCUs, etc.)
- These are **separate systems** with different tables and management interfaces

✅ **Safe to Run Multiple Times:**
- All migrations use `IF NOT EXISTS` checks
- Running them multiple times won't cause errors
- They will skip already-existing columns/tables

🔄 **Rollback:**
If you need to undo these migrations:

```sql
-- Rollback Global Africa (if needed)
DROP TABLE IF EXISTS global_africa_info CASCADE;
DROP TABLE IF EXISTS global_africa CASCADE;

-- Rollback Country Visual Assets (if needed)
ALTER TABLE country_info DROP COLUMN IF EXISTS leader_image_url;
ALTER TABLE country_info DROP COLUMN IF EXISTS monument_image_url;
ALTER TABLE country_info DROP COLUMN IF EXISTS largest_city_population;
ALTER TABLE country_info DROP COLUMN IF EXISTS capital_population;
```

---

## Admin Interface

After running migrations, you can manage these through the admin panel:

- **Country Information:** `/admin/country-info`
- **Global Africa:** `/admin/global-africa`

Both have full CRUD operations with image upload support.
