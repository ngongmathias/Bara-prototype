"""
Import Rwanda businesses and Sinc events to Supabase database
Requires: pip install supabase python-dotenv
"""
import json
import os
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
SUPABASE_KEY = os.getenv('VITE_SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Supabase credentials not found in .env file")
    print("Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

print("✅ Connected to Supabase")

# ============================================================================
# IMPORT RWANDA BUSINESSES
# ============================================================================

def import_businesses():
    """Import Rwanda businesses to database"""
    print("\n" + "="*80)
    print("IMPORTING RWANDA BUSINESSES")
    print("="*80)
    
    # Load businesses JSON
    with open(r"C:\Users\Hp\Bara-Prototype\scripts\rwanda_businesses.json", 'r', encoding='utf-8') as f:
        businesses = json.load(f)
    
    print(f"📦 Loaded {len(businesses)} businesses from JSON")
    
    # Get Rwanda country ID
    rwanda = supabase.table('countries').select('id').eq('name', 'Rwanda').execute()
    if not rwanda.data:
        print("❌ Rwanda not found in countries table. Please add it first.")
        return
    
    rwanda_id = rwanda.data[0]['id']
    print(f"✅ Found Rwanda country ID: {rwanda_id}")
    
    # Get Kigali city ID (or create if doesn't exist)
    kigali = supabase.table('cities').select('id').eq('name', 'Kigali').eq('country_id', rwanda_id).execute()
    if not kigali.data:
        # Create Kigali city
        kigali_data = supabase.table('cities').insert({
            'name': 'Kigali',
            'country_id': rwanda_id,
            'description': 'Capital city of Rwanda'
        }).execute()
        kigali_id = kigali_data.data[0]['id']
        print(f"✅ Created Kigali city: {kigali_id}")
    else:
        kigali_id = kigali.data[0]['id']
        print(f"✅ Found Kigali city ID: {kigali_id}")
    
    # Get or create categories
    category_map = {}
    for business in businesses:
        cat_name = business['category']
        if cat_name not in category_map:
            # Check if category exists
            cat = supabase.table('categories').select('id').eq('name', cat_name).execute()
            if cat.data:
                category_map[cat_name] = cat.data[0]['id']
            else:
                # Create category
                slug = cat_name.lower().replace(' ', '-').replace('&', 'and')
                cat_data = supabase.table('categories').insert({
                    'name': cat_name,
                    'slug': slug,
                    'description': f'{cat_name} businesses in Rwanda'
                }).execute()
                category_map[cat_name] = cat_data.data[0]['id']
    
    print(f"✅ Processed {len(category_map)} categories")
    
    # Import businesses
    imported = 0
    errors = 0
    
    for business in businesses:
        try:
            business_data = {
                'name': business['name'],
                'description': business['description'],
                'address': business['address'],
                'city_id': kigali_id,
                'country_id': rwanda_id,
                'phone': business['phone'],
                'email': business['email'],
                'website': business.get('website'),
                'category_id': category_map[business['category']],
                'rating': business.get('rating', 0),
                'verified': business.get('verified', False),
                'is_active': True,
                'created_at': datetime.now().isoformat()
            }
            
            supabase.table('businesses').insert(business_data).execute()
            imported += 1
            
            if imported % 10 == 0:
                print(f"  Imported {imported}/{len(businesses)} businesses...")
                
        except Exception as e:
            errors += 1
            print(f"  ❌ Error importing {business['name']}: {str(e)}")
    
    print(f"\n✅ Successfully imported {imported} businesses")
    if errors > 0:
        print(f"⚠️  {errors} errors occurred")

# ============================================================================
# IMPORT SINC EVENTS
# ============================================================================

def import_events():
    """Import Sinc events to database"""
    print("\n" + "="*80)
    print("IMPORTING SINC EVENTS")
    print("="*80)
    
    # Load events JSON
    with open(r"C:\Users\Hp\Bara-Prototype\scripts\sinc_events.json", 'r', encoding='utf-8') as f:
        events = json.load(f)
    
    print(f"📦 Loaded {len(events)} events from JSON")
    
    # Get Rwanda country ID
    rwanda = supabase.table('countries').select('id').eq('name', 'Rwanda').execute()
    rwanda_id = rwanda.data[0]['id']
    
    # Get Kigali city ID
    kigali = supabase.table('cities').select('id').eq('name', 'Kigali').eq('country_id', rwanda_id).execute()
    kigali_id = kigali.data[0]['id']
    
    # Get or create event categories
    category_map = {}
    for event in events:
        cat_name = event['category']
        if cat_name not in category_map:
            # Check if category exists
            cat = supabase.table('event_categories').select('id').eq('name', cat_name).execute()
            if cat.data:
                category_map[cat_name] = cat.data[0]['id']
            else:
                # Create category
                slug = cat_name.lower().replace(' ', '-').replace('&', 'and')
                cat_data = supabase.table('event_categories').insert({
                    'name': cat_name,
                    'slug': slug,
                    'description': f'{cat_name} events'
                }).execute()
                category_map[cat_name] = cat_data.data[0]['id']
    
    print(f"✅ Processed {len(category_map)} event categories")
    
    # Import events
    imported = 0
    errors = 0
    
    for event in events:
        try:
            event_data = {
                'title': event['title'],
                'description': event['description'],
                'start_date': event['start_date'],
                'end_date': event['end_date'],
                'venue_name': event['venue_name'],
                'venue_address': event['venue_address'],
                'city_id': kigali_id,
                'country_id': rwanda_id,
                'category_id': category_map[event['category']],
                'organizer_name': event['organizer'],
                'ticket_price': event.get('price', 0),
                'ticket_currency': event.get('currency', 'RWF'),
                'ticket_url': event.get('ticket_url'),
                'event_image_url': event.get('image_url'),
                'tags': event.get('tags', []),
                'capacity': event.get('capacity'),
                'is_active': True,
                'created_at': datetime.now().isoformat()
            }
            
            supabase.table('events').insert(event_data).execute()
            imported += 1
            
            if imported % 10 == 0:
                print(f"  Imported {imported}/{len(events)} events...")
                
        except Exception as e:
            errors += 1
            print(f"  ❌ Error importing {event['title']}: {str(e)}")
    
    print(f"\n✅ Successfully imported {imported} events")
    if errors > 0:
        print(f"⚠️  {errors} errors occurred")

# ============================================================================
# MAIN EXECUTION
# ============================================================================

if __name__ == "__main__":
    print("\n🚀 Starting database import...")
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    try:
        # Import businesses
        import_businesses()
        
        # Import events
        import_events()
        
        print("\n" + "="*80)
        print("✅ IMPORT COMPLETE!")
        print("="*80)
        print("\n🎉 All data has been imported to Supabase!")
        print("🌐 Check your live site to see the new data")
        
    except Exception as e:
        print(f"\n❌ Fatal error: {str(e)}")
        import traceback
        traceback.print_exc()
