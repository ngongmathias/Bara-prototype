import json
import os
from supabase import create_client, Client

# Supabase credentials
SUPABASE_URL = "https://ztjjzfvvegcztzfamnqo.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0amp6ZnZ2ZWdjenR6ZmFtbnFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU5ODA0MTQsImV4cCI6MjA0MTU1NjQxNH0.YdkHy_0Jz6vPwqPPZhqbLYJiGqtNNwDQdTDMBgVwvlI"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_rwanda_id():
    """Get Rwanda country ID"""
    response = supabase.table("countries").select("id").eq("name", "Rwanda").execute()
    if response.data:
        return response.data[0]['id']
    return None

def get_kigali_id():
    """Get Kigali city ID"""
    response = supabase.table("cities").select("id").eq("name", "Kigali").execute()
    if response.data:
        return response.data[0]['id']
    return None

def get_or_create_category(category_name):
    """Get or create business category"""
    # Check if exists
    response = supabase.table("categories").select("id").eq("name", category_name).execute()
    if response.data:
        return response.data[0]['id']
    
    # Create if doesn't exist
    slug = category_name.lower().replace(' ', '-').replace('&', 'and')
    new_cat = {
        "name": category_name,
        "slug": slug,
        "description": f"{category_name} businesses in Rwanda"
    }
    response = supabase.table("categories").insert(new_cat).execute()
    if response.data:
        return response.data[0]['id']
    return None

def import_businesses():
    """Import additional businesses"""
    print("\n📦 Importing additional businesses...")
    
    with open('scripts/rwanda_businesses_additional.json', 'r') as f:
        businesses = json.load(f)
    
    rwanda_id = get_rwanda_id()
    kigali_id = get_kigali_id()
    
    if not rwanda_id or not kigali_id:
        print("❌ Error: Could not find Rwanda or Kigali IDs")
        return
    
    # Get category mappings
    category_map = {}
    for business in businesses:
        cat = business['category']
        if cat not in category_map:
            category_map[cat] = get_or_create_category(cat)
    
    print(f"📊 Found {len(category_map)} categories")
    
    # Import businesses
    imported = 0
    failed = 0
    
    for business in businesses:
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
                "status": "active",
                "created_at": business['created_at']
            }
            
            response = supabase.table("businesses").insert(business_data).execute()
            if response.data:
                imported += 1
                if imported % 20 == 0:
                    print(f"  ✅ Imported {imported}/{len(businesses)} businesses...")
            else:
                failed += 1
        except Exception as e:
            print(f"  ❌ Error importing {business['name']}: {str(e)}")
            failed += 1
    
    print(f"\n✅ Businesses import complete!")
    print(f"  - Imported: {imported}")
    print(f"  - Failed: {failed}")
    return imported

def import_events():
    """Import additional events"""
    print("\n🎉 Importing additional events...")
    
    with open('scripts/sinc_events_additional.json', 'r') as f:
        events = json.load(f)
    
    rwanda_id = get_rwanda_id()
    kigali_id = get_kigali_id()
    
    if not rwanda_id or not kigali_id:
        print("❌ Error: Could not find Rwanda or Kigali IDs")
        return
    
    imported = 0
    failed = 0
    
    for event in events:
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
                "category": event['category'],
                "organizer_name": event['organizer'],
                "registration_url": event.get('registration_url'),
                "event_image_url": event.get('image_url'),
                "tags": event.get('tags', []),
                "capacity": event.get('capacity'),
                "is_public": True,
                "event_status": "upcoming",
                "created_at": event['created_at']
            }
            
            response = supabase.table("events").insert(event_data).execute()
            if response.data:
                imported += 1
                if imported % 20 == 0:
                    print(f"  ✅ Imported {imported}/{len(events)} events...")
            else:
                failed += 1
        except Exception as e:
            print(f"  ❌ Error importing {event['title']}: {str(e)}")
            failed += 1
    
    print(f"\n✅ Events import complete!")
    print(f"  - Imported: {imported}")
    print(f"  - Failed: {failed}")
    return imported

if __name__ == "__main__":
    print("🚀 Starting import of additional data...")
    print("=" * 50)
    
    businesses_imported = import_businesses()
    events_imported = import_events()
    
    print("\n" + "=" * 50)
    print("🎉 IMPORT COMPLETE!")
    print(f"📊 Total imported:")
    print(f"  - Businesses: {businesses_imported}")
    print(f"  - Events: {events_imported}")
    print("\n✅ Your database now has:")
    print(f"  - ~{101 + businesses_imported} businesses")
    print(f"  - ~{49 + events_imported} events")
