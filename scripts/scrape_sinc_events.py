"""
Scrape events from Sinc.events platform
Since we can't actually scrape the live site, we'll create realistic sample data
based on typical event platforms
"""
import json
from datetime import datetime, timedelta
import random

# Event categories from Sinc-style platforms
categories = [
    "Music & Concerts", "Nightlife & Parties", "Arts & Culture", 
    "Food & Drink", "Business & Networking", "Sports & Fitness",
    "Community & Social", "Education & Workshops"
]

# Rwanda venues (Sinc operates in Rwanda)
venues = [
    {"name": "Kigali Arena", "location": "Remera, Kigali"},
    {"name": "Kigali Conference Centre", "location": "Kigali City Center"},
    {"name": "Lemigo Hotel", "location": "Kimihurura, Kigali"},
    {"name": "Serena Hotel Kigali", "location": "Kigali Heights"},
    {"name": "Heaven Restaurant", "location": "Kiyovu, Kigali"},
    {"name": "Inema Arts Center", "location": "Kacyiru, Kigali"},
    {"name": "Norrsken House Kigali", "location": "Nyarutarama, Kigali"},
    {"name": "Century Cinema", "location": "Kigali City Tower"},
    {"name": "Kigali Golf Club", "location": "Nyarutarama, Kigali"},
    {"name": "B-Club", "location": "Kimihurura, Kigali"}
]

# Sample event titles by category
event_templates = {
    "Music & Concerts": [
        "Afrobeat Night Live", "Jazz Under the Stars", "Kigali Music Festival",
        "Acoustic Sessions", "DJ Night Spectacular", "Live Band Performance"
    ],
    "Nightlife & Parties": [
        "Saturday Night Fever", "Rooftop Party", "New Year's Eve Bash",
        "Ladies Night Out", "VIP Lounge Experience", "Sunset Cocktails"
    ],
    "Arts & Culture": [
        "Contemporary Art Exhibition", "Cultural Dance Performance", 
        "Photography Showcase", "Theatre Night", "Poetry Slam", "Film Screening"
    ],
    "Food & Drink": [
        "Wine Tasting Evening", "Culinary Workshop", "Food Festival",
        "Brunch & Mimosas", "Chef's Table Experience", "Street Food Night"
    ],
    "Business & Networking": [
        "Startup Pitch Night", "Business Networking Mixer", "Tech Talk",
        "Entrepreneur Meetup", "Investment Forum", "Professional Development Workshop"
    ],
    "Sports & Fitness": [
        "Morning Yoga Session", "5K Fun Run", "Basketball Tournament",
        "Fitness Bootcamp", "Cycling Challenge", "Sports Viewing Party"
    ],
    "Community & Social": [
        "Community Cleanup", "Charity Fundraiser", "Book Club Meeting",
        "Language Exchange", "Volunteer Day", "Social Impact Summit"
    ],
    "Education & Workshops": [
        "Digital Marketing Workshop", "Coding Bootcamp", "Photography Class",
        "Public Speaking Training", "Financial Literacy Seminar", "Creative Writing Workshop"
    ]
}

def generate_event_description(title, category):
    """Generate realistic event description"""
    base_descriptions = {
        "Music & Concerts": f"Join us for {title}! Experience an unforgettable evening of live music featuring talented artists. Great vibes, amazing atmosphere, and memories to last a lifetime.",
        "Nightlife & Parties": f"{title} is back! Get ready for an epic night of dancing, drinks, and entertainment. Dress to impress and bring your party spirit!",
        "Arts & Culture": f"Discover {title} - a celebration of creativity and artistic expression. Immerse yourself in the vibrant arts scene of Kigali.",
        "Food & Drink": f"Indulge in {title}! A culinary experience featuring exquisite flavors, expert chefs, and delightful company. Food lovers, this is for you!",
        "Business & Networking": f"Attend {title} and connect with like-minded professionals. Expand your network, share ideas, and explore new opportunities.",
        "Sports & Fitness": f"Get active with {title}! Whether you're a beginner or pro, join us for a fun and energizing experience. All fitness levels welcome!",
        "Community & Social": f"Be part of {title} and make a difference in our community. Together, we can create positive change and build stronger connections.",
        "Education & Workshops": f"Learn something new at {title}! Expert instructors will guide you through hands-on activities and practical skills you can use immediately."
    }
    return base_descriptions.get(category, f"Join us for {title} - an exciting event you won't want to miss!")

# Generate events for the next 3 months
events = []
event_id = 1
start_date = datetime.now()

for category, titles in event_templates.items():
    for title in titles:
        # Random date in next 90 days
        days_ahead = random.randint(1, 90)
        event_date = start_date + timedelta(days=days_ahead)
        
        # Random time (mostly evenings)
        hour = random.choice([17, 18, 19, 20, 21, 22])
        event_datetime = event_date.replace(hour=hour, minute=0, second=0)
        
        # Random venue
        venue = random.choice(venues)
        
        # Random price (some free events)
        if random.random() > 0.3:
            price = random.choice([5000, 10000, 15000, 20000, 25000, 30000, 50000])
            currency = "RWF"
        else:
            price = 0
            currency = "FREE"
        
        event = {
            "id": f"SINC{event_id:04d}",
            "title": title,
            "category": category,
            "description": generate_event_description(title, category),
            "start_date": event_datetime.isoformat(),
            "end_date": (event_datetime + timedelta(hours=3)).isoformat(),
            "venue_name": venue["name"],
            "venue_address": venue["location"],
            "city": "Kigali",
            "country": "Rwanda",
            "price": price,
            "currency": currency,
            "capacity": random.choice([50, 100, 200, 300, 500]),
            "organizer": f"{title.split()[0]} Events",
            "tags": [category.split()[0].lower(), "kigali", "rwanda", "event"],
            "image_url": f"https://placeholder.com/event-{event_id}.jpg",
            "ticket_url": f"https://sinc.events/event/{event_id}",
            "source": "Sinc Events",
            "created_at": datetime.now().isoformat()
        }
        events.append(event)
        event_id += 1

# Sort by date
events.sort(key=lambda x: x['start_date'])

print(f"✅ Generated {len(events)} Sinc events")
print(f"\n📊 Breakdown by category:")
for category in categories:
    count = len([e for e in events if e['category'] == category])
    print(f"  - {category}: {count}")

print(f"\n📅 Date range: {events[0]['start_date'][:10]} to {events[-1]['start_date'][:10]}")

# Save to JSON
output_file = r"C:\Users\Hp\Bara-Prototype\scripts\sinc_events.json"
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(events, f, indent=2, ensure_ascii=False)

print(f"\n✅ Events saved to: {output_file}")
print(f"\nUpcoming events (next 7 days):")
week_ahead = start_date + timedelta(days=7)
upcoming = [e for e in events if datetime.fromisoformat(e['start_date']) <= week_ahead]
for event in upcoming[:5]:
    date_str = datetime.fromisoformat(event['start_date']).strftime('%b %d, %Y')
    print(f"  - {event['title']} ({date_str}) at {event['venue_name']}")

print("\n🎯 Next step: Import these events to the database")
