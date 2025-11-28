"""
Add real event images from Unsplash to events
Free, high-quality images categorized by event type
"""
import json
import random

# Image mapping by event category
# These are real Unsplash image URLs that match event types
event_image_urls = {
    "Music & Concerts": [
        "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800",  # Concert crowd
        "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800",  # Stage lights
        "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800",  # Live music
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",  # Concert
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",  # Music festival
        "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800",  # Band performance
    ],
    "Nightlife & Parties": [
        "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800",  # Party lights
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",  # Club scene
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",  # DJ
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",  # Night party
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",  # Dance floor
        "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800",  # Nightclub
    ],
    "Arts & Culture": [
        "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800",  # Art gallery
        "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800",  # Museum
        "https://images.unsplash.com/photo-1578926078433-e2c5e0e1e0e7?w=800",  # Art exhibition
        "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800",  # Cultural event
        "https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=800",  # Theatre
        "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800",  # Performance art
    ],
    "Food & Drink": [
        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",  # Fine dining
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",  # Restaurant
        "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800",  # Wine tasting
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",  # Food spread
        "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800",  # Cocktails
        "https://images.unsplash.com/photo-1529543544-b4a3f6728fa0?w=800",  # Brunch
    ],
    "Business & Networking": [
        "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800",  # Conference
        "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800",  # Business meeting
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",  # Networking
        "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800",  # Presentation
        "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800",  # Seminar
        "https://images.unsplash.com/photo-1560439514-4e9645039924?w=800",  # Workshop
    ],
    "Sports & Fitness": [
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800",  # Gym
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",  # Yoga
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800",  # Running
        "https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=800",  # Basketball
        "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=800",  # Cycling
        "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800",  # Sports event
    ],
    "Community & Social": [
        "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800",  # Community
        "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800",  # Social gathering
        "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800",  # Volunteers
        "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800",  # Charity
        "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800",  # Book club
        "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800",  # Social event
    ],
    "Education & Workshops": [
        "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800",  # Classroom
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",  # Workshop
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800",  # Training
        "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=800",  # Seminar
        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800",  # Study group
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800",  # Learning
    ]
}

# Load events
with open(r"C:\Users\Hp\Bara-Prototype\scripts\sinc_events.json", 'r', encoding='utf-8') as f:
    events = json.load(f)

print(f"📦 Loaded {len(events)} events")

# Add real images to events
updated_count = 0
for event in events:
    category = event['category']
    if category in event_image_urls:
        # Assign a random image from the category
        event['image_url'] = random.choice(event_image_urls[category])
        updated_count += 1

print(f"✅ Updated {updated_count} events with real Unsplash images")

# Save updated events
with open(r"C:\Users\Hp\Bara-Prototype\scripts\sinc_events.json", 'w', encoding='utf-8') as f:
    json.dump(events, f, indent=2, ensure_ascii=False)

print(f"✅ Saved updated events to sinc_events.json")

# Show sample
print("\n📸 Sample event images:")
for event in events[:5]:
    print(f"  - {event['title']}: {event['image_url'][:60]}...")
