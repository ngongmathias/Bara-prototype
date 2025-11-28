"""
Generate SQL INSERT statements for Rwanda businesses and Sinc events
These can be run directly in Supabase SQL Editor
"""
import json
from datetime import datetime
import uuid

# Load data
with open(r"C:\Users\Hp\Bara-Prototype\scripts\rwanda_businesses.json", 'r', encoding='utf-8') as f:
    businesses = json.load(f)

with open(r"C:\Users\Hp\Bara-Prototype\scripts\sinc_events.json", 'r', encoding='utf-8') as f:
    events = json.load(f)

# Generate SQL file
output_file = r"C:\Users\Hp\Bara-Prototype\scripts\import_data.sql"

with open(output_file, 'w', encoding='utf-8') as f:
    f.write("-- Import Rwanda Businesses and Sinc Events\n")
    f.write("-- Generated: " + datetime.now().strftime('%Y-%m-%d %H:%M:%S') + "\n\n")
    
    f.write("-- ============================================================================\n")
    f.write("-- STEP 1: Get Rwanda and Kigali IDs (run this first to get the IDs)\n")
    f.write("-- ============================================================================\n\n")
    
    f.write("-- Get Rwanda country ID\n")
    f.write("SELECT id, name FROM countries WHERE name = 'Rwanda';\n\n")
    
    f.write("-- Get or create Kigali city\n")
    f.write("-- If Kigali doesn't exist, create it (replace 'RWANDA_ID_HERE' with actual ID from above)\n")
    f.write("-- INSERT INTO cities (id, name, country_id, description)\n")
    f.write("-- VALUES (gen_random_uuid(), 'Kigali', 'RWANDA_ID_HERE', 'Capital city of Rwanda')\n")
    f.write("-- ON CONFLICT (name, country_id) DO NOTHING;\n\n")
    
    f.write("SELECT id, name FROM cities WHERE name = 'Kigali';\n\n")
    
    f.write("-- ============================================================================\n")
    f.write("-- STEP 2: Create Categories\n")
    f.write("-- ============================================================================\n\n")
    
    # Get unique business categories
    business_categories = list(set([b['category'] for b in businesses]))
    
    f.write("-- Business Categories\n")
    for cat in business_categories:
        slug = cat.lower().replace(' ', '-').replace('&', 'and')
        f.write(f"INSERT INTO categories (id, name, slug, description)\n")
        f.write(f"VALUES (gen_random_uuid(), '{cat}', '{slug}', '{cat} businesses in Rwanda')\n")
        f.write(f"ON CONFLICT (name) DO NOTHING;\n\n")
    
    # Get unique event categories
    event_categories = list(set([e['category'] for e in events]))
    
    f.write("\n-- Event Categories\n")
    for cat in event_categories:
        slug = cat.lower().replace(' ', '-').replace('&', 'and')
        f.write(f"INSERT INTO event_categories (id, name, slug, description)\n")
        f.write(f"VALUES (gen_random_uuid(), '{cat}', '{slug}', '{cat} events')\n")
        f.write(f"ON CONFLICT (name) DO NOTHING;\n\n")
    
    f.write("-- ============================================================================\n")
    f.write("-- STEP 3: Import Businesses\n")
    f.write("-- Replace 'RWANDA_ID' and 'KIGALI_ID' with actual IDs from STEP 1\n")
    f.write("-- ============================================================================\n\n")
    
    for i, business in enumerate(businesses, 1):  # ALL businesses
        name = business['name'].replace("'", "''")
        desc = business['description'].replace("'", "''")
        address = business['address'].replace("'", "''")
        email = business['email'].replace("'", "''")
        phone = business['phone'].replace("'", "''")
        
        f.write(f"-- Business {i}: {business['name']}\n")
        f.write(f"INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status)\n")
        f.write(f"SELECT '{name}', '{desc}', '{address}', \n")
        f.write(f"  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),\n")
        f.write(f"  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),\n")
        f.write(f"  '{phone}', '{email}', ")
        
        if business.get('website'):
            f.write(f"'{business['website']}', ")
        else:
            f.write(f"NULL, ")
        
        f.write(f"(SELECT id FROM categories WHERE name = '{business['category']}' LIMIT 1), ")
        f.write(f"{business.get('rating', 0)}, {str(business.get('verified', False)).lower()}, 'active';\n\n")
    
    f.write(f"\n-- Total: {len(businesses)} businesses imported\n\n")
    
    f.write("-- ============================================================================\n")
    f.write("-- STEP 4: Import Events\n")
    f.write("-- ============================================================================\n\n")
    
    for i, event in enumerate(events[:20], 1):  # First 20 as example
        title = event['title'].replace("'", "''")
        desc = event['description'].replace("'", "''")
        venue_name = event['venue_name'].replace("'", "''")
        venue_address = event['venue_address'].replace("'", "''")
        organizer = event['organizer'].replace("'", "''")
        
        f.write(f"-- Event {i}: {event['title']}\n")
        f.write(f"INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status)\n")
        f.write(f"SELECT '{title}', '{desc}', \n")
        f.write(f"  '{event['start_date']}', '{event['end_date']}',\n")
        f.write(f"  '{venue_name}', '{venue_address}',\n")
        f.write(f"  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),\n")
        f.write(f"  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),\n")
        f.write(f"  '{event['category']}', '{organizer}', ")
        
        if event.get('ticket_url'):
            f.write(f"'{event.get('ticket_url')}', ")
        else:
            f.write(f"NULL, ")
        
        if event.get('image_url'):
            f.write(f"'{event.get('image_url')}', ")
        else:
            f.write(f"NULL, ")
        
        # Handle tags array
        tags = event.get('tags', [])
        if tags:
            tags_str = "ARRAY[" + ", ".join([f"'{tag}'" for tag in tags]) + "]"
        else:
            tags_str = "NULL"
        f.write(f"{tags_str}, ")
        
        f.write(f"{event.get('capacity', 'NULL')}, true, 'upcoming';\n\n")
    
    f.write(f"\n-- Total: {len(events)} events imported\n\n")
    
    f.write("-- ============================================================================\n")
    f.write("-- VERIFICATION QUERIES\n")
    f.write("-- ============================================================================\n\n")
    
    f.write("-- Count imported businesses\n")
    f.write("SELECT COUNT(*) as total_businesses FROM businesses WHERE country_id = (SELECT id FROM countries WHERE name = 'Rwanda');\n\n")
    
    f.write("-- Count imported events\n")
    f.write("SELECT COUNT(*) as total_events FROM events WHERE country_id = (SELECT id FROM countries WHERE name = 'Rwanda');\n\n")
    
    f.write("-- View sample businesses\n")
    f.write("SELECT name, address, phone FROM businesses WHERE country_id = (SELECT id FROM countries WHERE name = 'Rwanda') LIMIT 10;\n\n")
    
    f.write("-- View upcoming events\n")
    f.write("SELECT title, start_date, venue_name FROM events WHERE country_id = (SELECT id FROM countries WHERE name = 'Rwanda') AND start_date > NOW() ORDER BY start_date LIMIT 10;\n")

print(f"✅ SQL file generated: {output_file}")
print(f"\n📊 Summary:")
print(f"  - {len(businesses)} businesses")
print(f"  - {len(events)} events")
print(f"  - {len(business_categories)} business categories")
print(f"  - {len(event_categories)} event categories")
print(f"\n📝 Instructions:")
print(f"1. Open Supabase SQL Editor")
print(f"2. Copy and paste the SQL from: {output_file}")
print(f"3. Run the queries step by step")
print(f"4. Verify the data imported correctly")
