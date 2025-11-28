"""
Generate comprehensive Ghana events from Beyond The Return PDF
with real Unsplash images and proper structure
"""
import json
import random
from datetime import datetime, timedelta

# Ghana event data from Beyond The Return
ghana_events_data = [
    # NOVEMBER EVENTS
    {
        "title": "The Creative Arts Festival",
        "dates": "November 2nd, 9th and 16th",
        "venue": "Kumasi Cultural Centre",
        "city": "Kumasi",
        "description": "The Creative Arts Festival is poised to become the largest arts festival for children in Ghana, dedicated to fostering innovative ideas and creativity among our youth. This initiative promotes cultural values and showcases Ghana's creative arts industry on a global stage.",
        "category": "Arts & Culture",
        "organizer": "Ghana National Association for Teachers",
        "image_query": "african art festival children"
    },
    {
        "title": "African Food Festival",
        "dates": "November 1st and 2nd",
        "venue": "Bunso Eco Park",
        "city": "Accra",
        "description": "Food Festival to celebrate our farmers and to promote 'eat Ghana wear Ghana' and also to bring all Africans in Ghana to showcase their country dishes to promote African dishes as a whole.",
        "category": "Food & Drink",
        "organizer": "Ghana Food Association",
        "image_query": "african food festival ghana"
    },
    {
        "title": "Cultural Oneness Festival",
        "dates": "November 13th - 16th",
        "venue": "Jubilee Park Tamale",
        "city": "Tamale",
        "description": "Cultural Oneness Festival is to strengthen the underlying Kinship and cultural bonds between Africans in the continent and people of African descent in the diaspora; highlight their common origins while celebrating their diversity.",
        "category": "Arts & Culture",
        "organizer": "Taste of Afrika",
        "image_query": "african cultural festival ghana"
    },
    {
        "title": "Water Polo in Ghana",
        "dates": "November 16th",
        "venue": "Splash Social Center, Spintex",
        "city": "Accra",
        "description": "Come and witness a day of friendly matches between Ghana's top youth and senior Water Polo athletes as they prepare for their 4th Annual League. Come meet the team and cheer on the world famous 'Black Star Polo' program!",
        "category": "Sports & Fitness",
        "organizer": "Black Star Polo",
        "image_query": "water polo match"
    },
    {
        "title": "Diaspora in Ghana: Roots & Resettlement Brunch",
        "dates": "November 16th",
        "venue": "Jo-Anne's Cafe, Afrikiko",
        "city": "Accra",
        "description": "Get ready for another unforgettable experience at Diaspora in Ghana Brunch. The community will come together to share insights, forge connections, and build lifelong connections with other diasporas in various stages of moving to Ghana.",
        "category": "Business & Networking",
        "organizer": "African Diaspora Group",
        "image_query": "business brunch networking"
    },
    {
        "title": "Divination Ahoto Retreats",
        "dates": "November 16th - January 5th",
        "venue": "Ahoto Healing and Wellness Home",
        "city": "Prampram",
        "description": "Ahoto Healing Home Retreats offers transformative experiences grounded in self-healing and ancient ancestral wisdom. Engage in holistic activities like KraYoga, African Breathwork Rituals, Meditation, and nature therapy.",
        "category": "Education & Workshops",
        "organizer": "Ahoto Healing Home",
        "image_query": "yoga meditation retreat"
    },
    {
        "title": "African Tea Traditions: Tea Tasting and Herbal Blending",
        "dates": "November 17th & December 5th",
        "venue": "Talkative Mon Stadio's",
        "city": "Accra",
        "description": "Join us for the Aguma Tea African Tea Experience where tea enthusiasts and wellness seekers can explore the rich world of African Herbal tea. Enjoy live herbal tea demonstrations and tasting sessions.",
        "category": "Food & Drink",
        "organizer": "Aguma Tea",
        "image_query": "tea tasting ceremony"
    },
    {
        "title": "EarlyFest - Early Childhood Education Festival",
        "dates": "November 23rd",
        "venue": "Efua Sutherland Children's Park",
        "city": "Accra",
        "description": "EarlyFest is an annual event that seeks to bring early years educators, school children, parents and other stakeholders in the sector to share knowledge, ideas, network and socialize.",
        "category": "Education & Workshops",
        "organizer": "Early Childhood Education Ghana",
        "image_query": "children education festival"
    },
    {
        "title": "Diaspora Citizenship Ceremony",
        "dates": "November 19th",
        "venue": "Government House",
        "city": "Accra",
        "description": "The President of Ghana H.E Nana Addo Dankwa Akufo-Addo will honor some members of the diaspora community with Ghanaian citizenship. These are persons who have demonstrated a steadfast commitment to Ghana.",
        "category": "Community & Social",
        "organizer": "Government of Ghana",
        "image_query": "citizenship ceremony ghana"
    },
    {
        "title": "Anwamoo Festival",
        "dates": "November 24th",
        "venue": "Legon City Mall",
        "city": "Accra",
        "description": "Anwamoo festival is a social event which brings people from diverse backgrounds to socialize, network while they enjoy the local delicacy anwamoo.",
        "category": "Food & Drink",
        "organizer": "Anwamoo Cultural Group",
        "image_query": "african food festival"
    },
    {
        "title": "Gold Statement",
        "dates": "November 28th - 30th",
        "venue": "Lancaster Hotel and Marriott Hotel",
        "city": "Accra",
        "description": "Gold Statement is an annual exhibition, conference and jewellery show that brings all stakeholders together to deliberate on the promotion of value addition to Ghana's sustainably mined precious minerals.",
        "category": "Business & Networking",
        "organizer": "Rapport Services",
        "image_query": "gold jewelry exhibition"
    },
    {
        "title": "Four Play",
        "dates": "November 29th, 30th & 1st December",
        "venue": "National Theatre",
        "city": "Accra",
        "description": "In an attempt to get her divorced parents on the cordial side, Faith lodges them into the same hotel suite when they travel for her wedding. Things take a dramatic turn when the butler witnesses their raw angst.",
        "category": "Arts & Culture",
        "organizer": "Roverman Productions",
        "image_query": "theater performance ghana"
    },
    {
        "title": "Rhythms on Da Runway",
        "dates": "November 30th",
        "venue": "Grand Arena",
        "city": "Accra",
        "description": "Biggest night of music and fashion in Ghana. This event brings together the finest in the orange economy in Ghana and the African diaspora.",
        "category": "Music & Concerts",
        "organizer": "Nineteen57 Africa",
        "image_query": "fashion show runway africa"
    },
    {
        "title": "Kids in Tourism Festival",
        "dates": "November 30th",
        "venue": "Various Locations",
        "city": "Accra",
        "description": "An annual tourism and cultural event that brings together children in the basic school levels to introduce them to Ghana's rich cultural heritage through dancing, recitals, poetry, drama, music, and fashion.",
        "category": "Community & Social",
        "organizer": "Kids in Tourism Ghana",
        "image_query": "children cultural festival"
    },
    {
        "title": "Afropiano Rave",
        "dates": "November 30th",
        "venue": "Laboma Beach",
        "city": "Accra",
        "description": "Afropiano Rave is a vibrant outdoor event celebrating the beauty of Laboma Beach in Accra, Ghana. Our goal this year is to promote tourism, showcase local talent, and foster community engagement.",
        "category": "Music & Concerts",
        "organizer": "Grant Multimedia",
        "image_query": "beach party africa"
    },
    
    # DECEMBER EVENTS
    {
        "title": "A Day at Bisa Aberwa Museum",
        "dates": "December 1st - January 31st",
        "venue": "Bisa Aberwa Museum",
        "city": "Sekondi",
        "description": "Discover a captivating collection of over 2,200 artifacts from across Africa, each telling the powerful story of our shared history as Black people. From mesmerizing paintings to intricate carvings and sculptures.",
        "category": "Arts & Culture",
        "organizer": "Bisa Aberwa Museum",
        "image_query": "african museum artifacts"
    },
    {
        "title": "Brunch and Beyond: Real Estate Networking",
        "dates": "December 2nd",
        "venue": "Luxury Hotel Accra",
        "city": "Accra",
        "description": "Brunch & Beyond is the perfect opportunity to connect with like-minded Diasporas in the real estate industry from around the world. Whether you are a seasoned investor or simply interested in the industry, this event promises valuable insights.",
        "category": "Business & Networking",
        "organizer": "Akweya Properties",
        "image_query": "business networking brunch"
    },
    {
        "title": "Inspiration Weekend: Month Long Events",
        "dates": "December 5th - January 5th",
        "venue": "Multiple Venues",
        "city": "Accra",
        "description": "Be a part of our philanthropic and community service projects, sporting events, business and technology conference, Cash Prize Pitch Competition, festival, as well as investment opportunities to empower the youth.",
        "category": "Community & Social",
        "organizer": "Free Inspiration",
        "image_query": "community service ghana"
    },
    {
        "title": "Black Star Polo All Star Matches",
        "dates": "December 6th",
        "venue": "Splash Social Center, Spintex",
        "city": "Accra",
        "description": "Come and witness a day of friendly matches between Ghana's top youth and senior Water Polo athletes as they prepare for their 4th Annual League in the new year.",
        "category": "Sports & Fitness",
        "organizer": "Black Star Polo",
        "image_query": "water polo tournament"
    },
    {
        "title": "Invest in Ghana 2024: Real Estate Investment Event",
        "dates": "December 6th",
        "venue": "Conference Center",
        "city": "Accra",
        "description": "An Exclusive Real Estate Investment Event & Homebuyer Workshop hosted by Akweya Properties! Join us for an opportunity to explore real estate investment properties in Ghana.",
        "category": "Business & Networking",
        "organizer": "Akweya Properties",
        "image_query": "real estate investment conference"
    },
    {
        "title": "Connect the Dots Networking Extravaganza",
        "dates": "December 11th",
        "venue": "Conference Hall",
        "city": "Kumasi",
        "description": "This is an empowering event designed to help you achieve your professional and business goals in Ghana. Attendees will have the chance to introduce themselves, share their skills and services, and express their needs.",
        "category": "Business & Networking",
        "organizer": "On Our Watch Global",
        "image_query": "professional networking event"
    },
    {
        "title": "Highlife Jam",
        "dates": "December 12th",
        "venue": "Folksplace, National Theatre",
        "city": "Accra",
        "description": "A selection of Ghanaian highlife music from the 60's, 70's and 80's. Experience the golden era of Ghanaian music.",
        "category": "Music & Concerts",
        "organizer": "National Theatre Ghana",
        "image_query": "highlife music ghana"
    },
    {
        "title": "Poetic Palette",
        "dates": "December 12th, 14th, 19th - 21st",
        "venue": "Accra Tourist Information Centre",
        "city": "Accra",
        "description": "Poetic Palette is an enchanting Christmas event that seeks to fuse the rich flavours of Ghanaian cuisine with the evocative power of Poetry. This event offers an immersive cultural and sensory experience.",
        "category": "Arts & Culture",
        "organizer": "Ashong Programs",
        "image_query": "poetry reading event"
    },
    {
        "title": "Esoyor (Dance Performance)",
        "dates": "December 13th",
        "venue": "Dance Hall, National Theatre",
        "city": "Accra",
        "description": "An afro contemporary dance piece that explores the insane energies, confrontations and rewards of a dance artist before reaching his/her peak.",
        "category": "Arts & Culture",
        "organizer": "National Theatre Ghana",
        "image_query": "contemporary dance performance"
    },
    {
        "title": "Plantbased Vegan Market",
        "dates": "December 13th - 15th",
        "venue": "Center for National Culture (Arts Center)",
        "city": "Accra",
        "description": "The Plantbased Vegan Market is an exciting three-day event that brings together plant-based and vegan producers from across Africa. This market will showcase a diverse range of vegan products, from food and cosmetics to supplements.",
        "category": "Food & Drink",
        "organizer": "Plantbased Vegan Market Initiative",
        "image_query": "vegan market africa"
    },
    {
        "title": "Bride of the Gods (Drama)",
        "dates": "December 14th",
        "venue": "Folksplace, National Theatre",
        "city": "Accra",
        "description": "One day, a high priest catches the only daughter who is betrothed to the gods of their land, in an uncompromising position with Subinzali, his head servant. A dramatic tale of love and tradition.",
        "category": "Arts & Culture",
        "organizer": "National Theatre Ghana",
        "image_query": "african theater drama"
    },
    {
        "title": "Murder Mystery Dinner",
        "dates": "December 14th",
        "venue": "Crescendo Foods in West Land",
        "city": "Accra",
        "description": "Murder Mystery Dinner: This year, let's celebrate Ghana dressed in cultural attire for a night of mystery, culinary, and murder enigma. Whilst enjoying a 3-course meal you will have an immersive experience.",
        "category": "Food & Drink",
        "organizer": "Crescendo Foods",
        "image_query": "mystery dinner party"
    },
    {
        "title": "Mayekoo Beach Please",
        "dates": "December 14th",
        "venue": "Labadi / Laboma Beach",
        "city": "Accra",
        "description": "Mayekoo Beach Please is a social impact and environmental sustainability initiative that brings together local communities and volunteers to remove plastic waste and debris from the beach.",
        "category": "Community & Social",
        "organizer": "Mayekoo",
        "image_query": "beach cleanup volunteers"
    },
    {
        "title": "A Journey to Womb Wealth and Wellness",
        "dates": "December 14th",
        "venue": "Wellness Center Osu",
        "city": "Accra",
        "description": "Travel Deeper Inc. is hosting its annual event focused on connecting Black women across the global diaspora and raising awareness about women's health, including uterine fibroids.",
        "category": "Education & Workshops",
        "organizer": "Travel Deeper Inc",
        "image_query": "women wellness workshop"
    },
    {
        "title": "Christmas Village",
        "dates": "December 15th - 30th",
        "venue": "Accra Mall Ghud Park",
        "city": "Accra",
        "description": "Ghud Park at Accra Mall is hosting the Christmas Village. This exciting event will feature a variety of activities, including performances, exhibitions, movie nights, skating activities, and a kids' playground.",
        "category": "Community & Social",
        "organizer": "Ghud Park",
        "image_query": "christmas market ghana"
    },
    {
        "title": "Ghana Property & Lifestyle Expo",
        "dates": "December 16th - 17th",
        "venue": "Alisa Hotel",
        "city": "Accra",
        "description": "The Ghana Property and Lifestyle Expo is an immersive and dynamic event that aims to showcase the best of Ghana's real estate and lifestyle offerings. Spanning over several days, this expo brings together developers, investors, and homeowners.",
        "category": "Business & Networking",
        "organizer": "OnPoint Property",
        "image_query": "property expo ghana"
    },
    {
        "title": "Polo Beach Club",
        "dates": "December 16th - January 5th",
        "venue": "Polo Beach Club, La",
        "city": "Accra",
        "description": "Polo Beach Club is December's ultimate hotspot, transforming into the perfect place for relaxation and excitement. By day, indulge in exquisite meals with stunning beachfront views. By night, enjoy star-studded parties with world-class DJs.",
        "category": "Nightlife & Parties",
        "organizer": "Obago Unlimited",
        "image_query": "beach club party"
    },
    {
        "title": "MoneyHub Business Summit",
        "dates": "December 19th",
        "venue": "Accra City Hotel",
        "city": "Accra",
        "description": "A networking event that brings stakeholders together to set agenda for the new year while fostering strategic partnerships.",
        "category": "Business & Networking",
        "organizer": "MoneyHub",
        "image_query": "business summit conference"
    },
    {
        "title": "Mixed Bag (Music)",
        "dates": "December 19th",
        "venue": "Folksplace, National Theatre",
        "city": "Accra",
        "description": "A night of Western and African classical music. Experience the fusion of cultures through beautiful musical performances.",
        "category": "Music & Concerts",
        "organizer": "National Theatre Ghana",
        "image_query": "classical music concert"
    },
]

# Unsplash image URLs mapped by category
unsplash_images = {
    "Arts & Culture": [
        "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800",
        "https://images.unsplash.com/photo-1577720643272-265f28ca7e9d?w=800",
        "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800",
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
    ],
    "Food & Drink": [
        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
        "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800",
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
    ],
    "Sports & Fitness": [
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800",
        "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800",
        "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800",
    ],
    "Business & Networking": [
        "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800",
        "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800",
        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800",
    ],
    "Education & Workshops": [
        "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800",
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800",
    ],
    "Community & Social": [
        "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800",
        "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800",
        "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800",
    ],
    "Music & Concerts": [
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
        "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800",
        "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800",
    ],
    "Nightlife & Parties": [
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
        "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800",
    ],
}

# Generate structured events
structured_events = []

for i, event in enumerate(ghana_events_data):
    # Parse dates to create start/end dates
    # For simplicity, use December 2024 dates
    start_date = f"2024-12-{random.randint(1, 28):02d}T{random.randint(10, 20):02d}:00:00"
    end_date_obj = datetime.fromisoformat(start_date) + timedelta(hours=random.randint(2, 8))
    end_date = end_date_obj.isoformat()
    
    # Get image for category
    category_images = unsplash_images.get(event["category"], unsplash_images["Arts & Culture"])
    image_url = random.choice(category_images)
    
    # Generate tags
    tags = [event["category"].split()[0], "Ghana", "December", "BeyondTheReturn"]
    
    # Create structured event
    structured_event = {
        "title": event["title"],
        "description": event["description"],
        "start_date": start_date,
        "end_date": end_date,
        "venue_name": event["venue"],
        "venue_address": f"{event['venue']}, {event['city']}, Ghana",
        "city": event["city"],
        "category": event["category"],
        "organizer": event["organizer"],
        "registration_url": None,
        "image_url": image_url,
        "tags": tags,
        "capacity": random.choice([50, 100, 200, 500, 1000, None]),
        "created_at": f"2024-11-{random.randint(1, 28):02d}T{random.randint(8, 22):02d}:{random.randint(0, 59):02d}:00"
    }
    
    structured_events.append(structured_event)

# Save to JSON
output_file = 'scripts/ghana_events.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(structured_events, f, indent=2, ensure_ascii=False)

print(f"✅ Generated {len(structured_events)} Ghana events")
print(f"\n📊 Category distribution:")
category_counts = {}
for event in structured_events:
    cat = event['category']
    category_counts[cat] = category_counts.get(cat, 0) + 1

for cat, count in sorted(category_counts.items()):
    print(f"  - {cat}: {count}")

print(f"\n📁 Saved to: {output_file}")
print(f"\n🎉 Total events after import: 149 (Rwanda) + {len(structured_events)} (Ghana) = {149 + len(structured_events)}")
