"""
Direct import to Supabase using API credentials
This will import all businesses and events directly
"""
import json
import requests
from datetime import datetime

# Supabase credentials
SUPABASE_URL = "https://mpznrdvodqiwgwnkwgsb.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wem5yZHZvZHFpd2d3bmt3Z3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5Mzg1MjIsImV4cCI6MjA3MDUxNDUyMn0.6-UllXeZCjqBGZUgOnFSA5nXGEzIqPNvcwd1hO4fKyQ"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wem5yZHZvZHFpd2d3bmt3Z3NiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDkzODUyMiwiZXhwIjoyMDcwNTE0NTIyfQ.jaisASb4XSJpbs_lPi2u6I-KQqigWI27DRFV0DUtpUM"

headers = {
    "apikey": SUPABASE_SERVICE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def get_data(table, filters=None):
    """Get data from Supabase table"""
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    if filters:
        url += "?" + "&".join([f"{k}=eq.{v}" for k, v in filters.items()])
    
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"❌ Error getting {table}: {response.text}")
        return []

def insert_data(table, data):
    """Insert data into Supabase table"""
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    
    response = requests.post(url, headers=headers, json=data)
    if response.status_code in [200, 201]:
        return response.json()
    else:
        print(f"❌ Error inserting into {table}: {response.text}")
        return None

print("🚀 Starting direct import to Supabase...")
print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

# ============================================================================
# STEP 1: Get Rwanda and Kigali IDs
# ============================================================================
print("="*80)
print("STEP 1: Getting Rwanda and Kigali IDs")
print("="*80)

rwanda = get_data("countries", {"name": "Rwanda"})
if not rwanda:
    print("❌ Rwanda not found. Please add Rwanda to countries table first.")
    exit(1)

rwanda_id = rwanda[0]['id']
print(f"✅ Rwanda ID: {rwanda_id}")

kigali = get_data("cities", {"name": "Kigali"})
if not kigali:
    print("⚠️  Kigali not found, creating...")
    kigali_data = insert_data("cities", {
        "name": "Kigali",
        "country_id": rwanda_id,
        "description": "Capital city of Rwanda"
    })
    if kigali_data:
        kigali_id = kigali_data[0]['id']
        print(f"✅ Created Kigali: {kigali_id}")
    else:
        print("❌ Failed to create Kigali")
        exit(1)
else:
    kigali_id = kigali[0]['id']
    print(f"✅ Kigali ID: {kigali_id}")

# ============================================================================
# STEP 2: Import Business Categories
# ============================================================================
print("\n" + "="*80)
print("STEP 2: Creating Business Categories")
print("="*80)

with open(r"C:\Users\Hp\Bara-Prototype\scripts\rwanda_businesses.json", 'r', encoding='utf-8') as f:
    businesses = json.load(f)

business_categories = list(set([b['category'] for b in businesses]))
category_map = {}

for cat_name in business_categories:
    existing = get_data("categories", {"name": cat_name})
    if existing:
        category_map[cat_name] = existing[0]['id']
        print(f"  ✓ {cat_name} (exists)")
    else:
        slug = cat_name.lower().replace(' ', '-').replace('&', 'and')
        cat_data = insert_data("categories", {
            "name": cat_name,
            "slug": slug,
            "description": f"{cat_name} businesses in Rwanda"
        })
        if cat_data:
            category_map[cat_name] = cat_data[0]['id']
            print(f"  ✓ {cat_name} (created)")

print(f"✅ Processed {len(category_map)} business categories")

# ============================================================================
# STEP 3: Import Event Categories
# ============================================================================
print("\n" + "="*80)
print("STEP 3: Creating Event Categories")
print("="*80)

with open(r"C:\Users\Hp\Bara-Prototype\scripts\sinc_events.json", 'r', encoding='utf-8') as f:
    events = json.load(f)

event_categories = list(set([e['category'] for e in events]))
event_category_map = {}

for cat_name in event_categories:
    existing = get_data("event_categories", {"name": cat_name})
    if existing:
        event_category_map[cat_name] = existing[0]['id']
        print(f"  ✓ {cat_name} (exists)")
    else:
        slug = cat_name.lower().replace(' ', '-').replace('&', 'and')
        cat_data = insert_data("event_categories", {
            "name": cat_name,
            "slug": slug,
            "description": f"{cat_name} events"
        })
        if cat_data:
            event_category_map[cat_name] = cat_data[0]['id']
            print(f"  ✓ {cat_name} (created)")

print(f"✅ Processed {len(event_category_map)} event categories")

# ============================================================================
# STEP 4: Import Businesses
# ============================================================================
print("\n" + "="*80)
print("STEP 4: Importing Businesses")
print("="*80)

imported_businesses = 0
failed_businesses = 0

for i, business in enumerate(businesses, 1):
    try:
        business_data = {
            "name": business['name'],
            "description": business['description'],
            "address": business['address'],
            "city_id": kigali_id,
            "country_id": rwanda_id,
            "phone": business['phone'],
            "email": business['email'],
            "website": business.get('website'),
            "category_id": category_map[business['category']],
            "average_rating": business.get('rating', 0),
            "is_verified": business.get('verified', False),
            "status": "active"  # Valid values: pending, active, suspended, premium
        }
        
        result = insert_data("businesses", business_data)
        if result:
            imported_businesses += 1
            if imported_businesses % 10 == 0:
                print(f"  Imported {imported_businesses}/{len(businesses)} businesses...")
        else:
            failed_businesses += 1
            
    except Exception as e:
        failed_businesses += 1
        print(f"  ❌ Error with {business['name']}: {str(e)}")

print(f"✅ Successfully imported {imported_businesses} businesses")
if failed_businesses > 0:
    print(f"⚠️  {failed_businesses} businesses failed")

# ============================================================================
# STEP 5: Import Events
# ============================================================================
print("\n" + "="*80)
print("STEP 5: Importing Events")
print("="*80)

imported_events = 0
failed_events = 0

for i, event in enumerate(events, 1):
    try:
        event_data = {
            "title": event['title'],
            "description": event['description'],
            "start_date": event['start_date'],
            "end_date": event['end_date'],
            "venue_name": event['venue_name'],
            "venue_address": event['venue_address'],
            "city_id": kigali_id,
            "country_id": rwanda_id,
            "category": event['category'],  # TEXT field, not category_id
            "organizer_name": event['organizer'],
            "registration_url": event.get('ticket_url'),
            "event_image_url": event.get('image_url'),  # Now has real Unsplash images!
            "tags": event.get('tags', []),
            "capacity": event.get('capacity'),
            "is_public": True,
            "event_status": "upcoming"
        }
        
        result = insert_data("events", event_data)
        if result:
            imported_events += 1
            if imported_events % 10 == 0:
                print(f"  Imported {imported_events}/{len(events)} events...")
        else:
            failed_events += 1
            
    except Exception as e:
        failed_events += 1
        print(f"  ❌ Error with {event['title']}: {str(e)}")

print(f"✅ Successfully imported {imported_events} events")
if failed_events > 0:
    print(f"⚠️  {failed_events} events failed")

# ============================================================================
# VERIFICATION
# ============================================================================
print("\n" + "="*80)
print("VERIFICATION")
print("="*80)

rwanda_businesses = get_data("businesses", {"country_id": rwanda_id})
rwanda_events = get_data("events", {"country_id": rwanda_id})

print(f"✅ Total Rwanda businesses in database: {len(rwanda_businesses)}")
print(f"✅ Total Rwanda events in database: {len(rwanda_events)}")

print("\n" + "="*80)
print("🎉 IMPORT COMPLETE!")
print("="*80)
print(f"\n📊 Summary:")
print(f"  - Businesses imported: {imported_businesses}/{len(businesses)}")
print(f"  - Events imported: {imported_events}/{len(events)}")
print(f"  - Total records: {imported_businesses + imported_events}")
print(f"\n🌐 Check your live site: https://prototype-five-rosy.vercel.app/")
print(f"  - Business listings should show {len(rwanda_businesses)} Rwanda businesses")
print(f"  - Events page should show {len(rwanda_events)} Rwanda events")
print(f"  - All events now have real Unsplash images! 📸")
