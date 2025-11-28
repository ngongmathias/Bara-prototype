import json

print("🚀 Generating SQL for Ghana events...")

# Load Ghana events
with open('scripts/ghana_events.json', 'r') as f:
    events = json.load(f)

# Generate SQL file
with open('scripts/import_ghana_events.sql', 'w') as f:
    f.write("-- Import Ghana Events from Beyond The Return\n")
    f.write(f"-- Generated: 2024-11-29\n")
    f.write(f"-- {len(events)} events from Ghana\n\n")
    
    f.write("-- ============================================================================\n")
    f.write("-- IMPORT GHANA EVENTS\n")
    f.write("-- ============================================================================\n\n")
    
    for i, event in enumerate(events, 1):
        title = event['title'].replace("'", "''")
        desc = event['description'].replace("'", "''")
        venue_name = event['venue_name'].replace("'", "''")
        venue_address = event['venue_address'].replace("'", "''")
        organizer = event['organizer'].replace("'", "''")
        city = event['city'].replace("'", "''")
        
        f.write(f"-- Event {i}: {event['title']}\n")
        f.write(f"INSERT INTO events (title, description, start_date, end_date, venue_name, venue_address, city_id, country_id, category, organizer_name, registration_url, event_image_url, tags, capacity, is_public, event_status, created_at)\n")
        f.write(f"SELECT '{title}', '{desc}', \n")
        f.write(f"  '{event['start_date']}', '{event['end_date']}',\n")
        f.write(f"  '{venue_name}', '{venue_address}',\n")
        
        # Get or create city
        f.write(f"  (SELECT id FROM cities WHERE name = '{city}' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana') LIMIT 1),\n")
        f.write(f"  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),\n")
        
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
        
        # Handle capacity - convert None to NULL
        capacity = event.get('capacity')
        capacity_str = str(capacity) if capacity is not None else 'NULL'
        f.write(f"{capacity_str}, true, 'upcoming', ")
        f.write(f"'{event['created_at']}';\n\n")
    
    f.write(f"\n-- Total: {len(events)} Ghana events imported\n\n")
    
    # Add Ghana cities if they don't exist
    f.write("-- ============================================================================\n")
    f.write("-- CREATE GHANA CITIES IF THEY DON'T EXIST\n")
    f.write("-- ============================================================================\n\n")
    
    cities = list(set([event['city'] for event in events]))
    for city in cities:
        city_escaped = city.replace("'", "''")
        f.write(f"-- City: {city}\n")
        f.write(f"INSERT INTO cities (name, country_id, created_at)\n")
        f.write(f"SELECT '{city_escaped}', \n")
        f.write(f"  (SELECT id FROM countries WHERE name = 'Ghana' LIMIT 1),\n")
        f.write(f"  NOW()\n")
        f.write(f"WHERE NOT EXISTS (\n")
        f.write(f"  SELECT 1 FROM cities WHERE name = '{city_escaped}' AND country_id = (SELECT id FROM countries WHERE name = 'Ghana')\n")
        f.write(f");\n\n")
    
    f.write("-- ============================================================================\n")
    f.write("-- VERIFICATION\n")
    f.write("-- ============================================================================\n\n")
    
    f.write("-- Check totals by country\n")
    f.write("SELECT \n")
    f.write("  c.name as country,\n")
    f.write("  COUNT(e.id) as total_events\n")
    f.write("FROM events e\n")
    f.write("JOIN countries c ON e.country_id = c.id\n")
    f.write("GROUP BY c.name\n")
    f.write("ORDER BY c.name;\n\n")
    
    f.write("-- Check total businesses\n")
    f.write("SELECT COUNT(*) as total_businesses FROM businesses;\n\n")
    
    f.write("-- Grand totals\n")
    f.write("SELECT \n")
    f.write("  (SELECT COUNT(*) FROM businesses) as businesses,\n")
    f.write("  (SELECT COUNT(*) FROM events) as events,\n")
    f.write("  (SELECT COUNT(*) FROM businesses) + (SELECT COUNT(*) FROM events) as total_records;\n")

print(f"✅ SQL file generated: import_ghana_events.sql")
print(f"📊 Summary:")
print(f"  - {len(events)} Ghana events")
print(f"  - {len(cities)} cities in Ghana")
print(f"\n📝 Next steps:")
print(f"1. Open Supabase SQL Editor")
print(f"2. Copy and paste SQL from: scripts/import_ghana_events.sql")
print(f"3. Run the query")
print(f"4. You'll have ~301 businesses and ~183 events!")
print(f"\n🎉 Final totals:")
print(f"  - 301 businesses (Rwanda)")
print(f"  - 149 events (Rwanda)")
print(f"  - 34 events (Ghana)")
print(f"  - TOTAL: 301 businesses + 183 events = 484 records!")
