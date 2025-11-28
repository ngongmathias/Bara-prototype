import json
import random
from datetime import datetime, timedelta

# Load existing events
with open('scripts/sinc_events.json', 'r') as f:
    existing = json.load(f)

existing_titles = {e['title'] for e in existing}
start_id = len(existing) + 1

# Event categories and types
event_categories = {
    "Education & Workshops": [
        "Workshop", "Masterclass", "Training", "Seminar", "Bootcamp", "Course", "Tutorial"
    ],
    "Business & Networking": [
        "Networking", "Conference", "Summit", "Forum", "Meetup", "Pitch Night", "Panel Discussion"
    ],
    "Food & Drink": [
        "Tasting", "Food Festival", "Brunch", "Dinner", "Cooking Class", "Wine Night", "BBQ"
    ],
    "Nightlife & Parties": [
        "Party", "Night Out", "DJ Night", "Dance Party", "Celebration", "Rave", "Club Night"
    ],
    "Arts & Culture": [
        "Exhibition", "Art Show", "Performance", "Theater", "Concert", "Festival", "Showcase"
    ],
    "Sports & Fitness": [
        "Tournament", "Race", "Fitness Challenge", "Yoga Session", "Marathon", "Competition", "Training"
    ],
    "Music & Concerts": [
        "Concert", "Live Music", "Band Performance", "DJ Set", "Music Festival", "Acoustic Night", "Jam Session"
    ],
    "Community & Social": [
        "Meetup", "Social Gathering", "Community Event", "Charity Event", "Volunteer Day", "Fundraiser", "Celebration"
    ]
}

event_topics = [
    "Tech", "Innovation", "Startup", "Digital", "AI", "Blockchain", "Sustainability",
    "Art", "Culture", "Music", "Dance", "Food", "Wine", "Coffee", "Fashion",
    "Health", "Wellness", "Fitness", "Yoga", "Meditation", "Sports",
    "Business", "Leadership", "Entrepreneurship", "Marketing", "Finance",
    "Community", "Social Impact", "Charity", "Education", "Youth"
]

venues = [
    "Kigali Conference Centre", "Norrsken House Kigali", "Kigali Arena", "Radisson Blu Hotel",
    "Kigali Marriott Hotel", "Heaven Restaurant", "Inema Arts Center", "Impact Hub Kigali",
    "kLab Rwanda", "Serena Hotel Kigali", "Lemigo Hotel", "Century Cinema",
    "Kigali Golf Club", "Ivuka Arts Center", "The Retreat", "Papyrus Restaurant"
]

organizers = [
    "Rwanda Tech Community", "Kigali Events", "Impact Rwanda", "Creative Hub",
    "Rwanda Business Forum", "Arts Collective Rwanda", "Kigali Social Club",
    "Innovation Rwanda", "Community Connect", "Rwanda Youth Network"
]

# Unsplash images by category
images_by_category = {
    "Education & Workshops": [
        "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800",
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800",
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800"
    ],
    "Business & Networking": [
        "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800",
        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800",
        "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800",
        "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800"
    ],
    "Food & Drink": [
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
        "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800"
    ],
    "Nightlife & Parties": [
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800"
    ],
    "Arts & Culture": [
        "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800",
        "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800",
        "https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=800",
        "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800"
    ],
    "Sports & Fitness": [
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800",
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800",
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800",
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800"
    ],
    "Music & Concerts": [
        "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800",
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
        "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800",
        "https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=800"
    ],
    "Community & Social": [
        "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800",
        "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800",
        "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800",
        "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800"
    ]
}

def generate_event_title(category):
    """Generate unique event title"""
    max_attempts = 100
    for _ in range(max_attempts):
        topic = random.choice(event_topics)
        event_type = random.choice(event_categories[category])
        
        patterns = [
            f"{topic} {event_type}",
            f"{event_type}: {topic}",
            f"{topic} {event_type} {random.randint(2025, 2026)}",
            f"Kigali {topic} {event_type}",
            f"Rwanda {topic} {event_type}"
        ]
        
        title = random.choice(patterns)
        
        if title not in existing_titles:
            existing_titles.add(title)
            return title
    
    # Fallback
    title = f"{topic} {event_type} #{random.randint(1, 999)}"
    existing_titles.add(title)
    return title

def generate_event_date():
    """Generate event date between Dec 1, 2025 and Feb 28, 2026"""
    start = datetime(2025, 12, 1)
    end = datetime(2026, 2, 28)
    days_diff = (end - start).days
    random_days = random.randint(0, days_diff)
    random_hour = random.choice([10, 14, 17, 18, 19, 20, 21])
    return start + timedelta(days=random_days, hours=random_hour)

def generate_created_at():
    """Generate creation date between Nov 1 and Nov 28"""
    start = datetime(2025, 11, 1)
    end = datetime(2025, 11, 28)
    days_diff = (end - start).days
    random_days = random.randint(0, days_diff)
    return start + timedelta(days=random_days, hours=random.randint(0, 23), minutes=random.randint(0, 59))

# Generate 100 more events
events = []
all_categories = list(event_categories.keys())

for i in range(100):
    category = random.choice(all_categories)
    title = generate_event_title(category)
    start_date = generate_event_date()
    duration_hours = random.choice([2, 3, 4, 5, 6])
    end_date = start_date + timedelta(hours=duration_hours)
    venue = random.choice(venues)
    organizer = random.choice(organizers)
    
    event = {
        "id": f"EV{start_id + i:04d}",
        "title": title,
        "category": category,
        "description": f"Join us for {title} at {venue}. This {category.lower()} event brings together enthusiasts and professionals for an unforgettable experience. Don't miss this opportunity to connect, learn, and enjoy!",
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "venue_name": venue,
        "venue_address": f"{venue}, Kigali, Rwanda",
        "city": "Kigali",
        "country": "Rwanda",
        "organizer": organizer,
        "image_url": random.choice(images_by_category[category]),
        "registration_url": f"https://sinc.events/event/{start_id + i}",
        "capacity": random.choice([50, 75, 100, 150, 200, 250, 300]),
        "tags": [category.lower().split()[0], "kigali", "rwanda", "event"],
        "created_at": generate_created_at().isoformat()
    }
    events.append(event)

# Save to file
with open('scripts/sinc_events_additional.json', 'w') as f:
    json.dump(events, f, indent=2)

print(f"✅ Generated {len(events)} additional events")
print(f"📊 Category distribution:")
for cat in all_categories:
    count = sum(1 for e in events if e['category'] == cat)
    print(f"  - {cat}: {count}")
print(f"\n📁 Saved to: sinc_events_additional.json")
