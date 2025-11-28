import json

print("🚀 Generating SQL for additional data...")

# Load additional businesses
with open('scripts/rwanda_businesses_additional.json', 'r') as f:
    businesses = json.load(f)

# Load additional events
with open('scripts/sinc_events_additional.json', 'r') as f:
    events = json.load(f)

# Generate SQL file
with open('scripts/import_additional_data.sql', 'w') as f:
    f.write("-- Import Additional Rwanda Businesses and Events\n")
    f.write(f"-- Generated: {businesses[0]['created_at'][:10]}\n")
    f.write(f"-- {len(businesses)} businesses + {len(events)} events\n\n")
    
    f.write("-- ============================================================================\n")
    f.write("-- IMPORT ADDITIONAL BUSINESSES\n")
    f.write("-- ============================================================================\n\n")
    
    for i, business in enumerate(businesses, 1):
        name = business['name'].replace("'", "''")
        desc = business['description'].replace("'", "''")
        address = business['address'].replace("'", "''")
        email = business['email'].replace("'", "''")
        phone = business['phone'].replace("'", "''")
        
        f.write(f"-- Business {i}: {business['name']}\n")
        f.write(f"INSERT INTO businesses (name, description, address, city_id, country_id, phone, email, website, category_id, average_rating, is_verified, status, created_at)\n")
        f.write(f"SELECT '{name}', '{desc}', '{address}', \n")
        f.write(f"  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),\n")
        f.write(f"  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),\n")
        f.write(f"  '{phone}', '{email}', ")
        
        if business.get('website'):
            website = business['website'].replace("'", "''")
            f.write(f"'{website}', ")
        else:
            f.write(f"NULL, ")
        
        f.write(f"(SELECT id FROM categories WHERE name = '{business['category']}' LIMIT 1), ")
        f.write(f"{business.get('rating', 0)}, {str(business.get('verified', False)).lower()}, 'active', ")
        f.write(f"'{business['created_at']}';\n\n")
    
    f.write(f"\n-- Total: {len(businesses)} additional businesses imported\n\n")
    
    f.write("-- ============================================================================\n")
    f.write("-- IMPORT ADDITIONAL EVENTS\n")
    f.write("-- ============================================================================\n\n")
    
    for i, event in enumerate(events, 1):
        title = event['title'].replace("'", "''")
        desc = event['description'].replace("'", "''")
        venue_name = event['venue_name'].replace("'", "''")
        venue_address = event['venue_address'].replace("'", "''")
        organizer = event['organizer'].replace("'", "''")
        
        f.write(f"-- Event {i}: {event['title']}\n")
        f.write(f"INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)\n")
        f.write(f"SELECT '{title}', '{desc}', \n")
        f.write(f"  '{event['start_date']}', '{event['end_date']}',\n")
        f.write(f"  '{venue_name}', '{venue_address}',\n")
        f.write(f"  (SELECT id FROM cities WHERE name = 'Kigali' LIMIT 1),\n")
        f.write(f"  (SELECT id FROM countries WHERE name = 'Rwanda' LIMIT 1),\n")
        f.write(f"  '{event['category']}', '{organizer}', ")
        
        if event.get('registration_url'):
            reg_url = event['registration_url'].replace("'", "''")
            f.write(f"'{reg_url}', ")
        else:
            f.write(f"NULL, ")
        
        if event.get('image_url'):
            img_url = event['image_url'].replace("'", "''")
            f.write(f"'{img_url}', ")
        else:
            f.write(f"NULL, ")
        
        # Handle tags array
        tags = event.get('tags', [])
        if tags:
            tags_str = "ARRAY[" + ", ".join([f"'{tag}'" for tag in tags]) + "]"
        else:
            tags_str = "NULL"
        f.write(f"{tags_str}, ")
        
        f.write(f"{event.get('capacity', 'NULL')}, true, 'upcoming', ")
        f.write(f"'{event['created_at']}';\n\n")
    
    f.write(f"\n-- Total: {len(events)} additional events imported\n\n")
    
    f.write("-- ============================================================================\n")
    f.write("-- VERIFICATION\n")
    f.write("-- ============================================================================\n\n")
    
    f.write("-- Check totals\n")
    f.write("SELECT \n")
    f.write("  'Businesses' as type,\n")
    f.write("  COUNT(*) as total\n")
    f.write("FROM businesses \n")
    f.write("WHERE country_id = (SELECT id FROM countries WHERE name = 'Rwanda')\n\n")
    f.write("UNION ALL\n\n")
    f.write("SELECT \n")
    f.write("  'Events' as type,\n")
    f.write("  COUNT(*) as total\n")
    f.write("FROM events \n")
    f.write("WHERE country_id = (SELECT id FROM countries WHERE name = 'Rwanda');\n")

print(f"✅ SQL file generated: import_additional_data.sql")
print(f"📊 Summary:")
print(f"  - {len(businesses)} additional businesses")
print(f"  - {len(events)} additional events")
print(f"\n📝 Next steps:")
print(f"1. Open Supabase SQL Editor")
print(f"2. Copy and paste SQL from: scripts/import_additional_data.sql")
print(f"3. Run the query")
print(f"4. You'll have ~301 businesses and ~149 events!")
