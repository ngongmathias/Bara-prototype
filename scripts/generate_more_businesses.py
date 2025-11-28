import json
import random
from datetime import datetime, timedelta

# Load existing businesses to avoid duplicates
with open('scripts/rwanda_businesses.json', 'r') as f:
    existing = json.load(f)

existing_names = {b['name'] for b in existing}
start_id = len(existing) + 1

# Rwanda business name patterns
business_prefixes = [
    "Kigali", "Rwanda", "Akagera", "Virunga", "Nyanza", "Musanze", "Gisenyi", 
    "Butare", "Ruhengeri", "Kivu", "Muhanga", "Rubavu", "Huye", "Rusizi"
]

business_types = {
    "Restaurant": ["Grill", "Bistro", "Kitchen", "Eatery", "Dining", "Cafe", "Brasserie", "Tavern"],
    "Hotel": ["Inn", "Lodge", "Resort", "Suites", "Grand Hotel", "Boutique Hotel", "Guest House"],
    "Retail": ["Shop", "Store", "Market", "Boutique", "Emporium", "Trading", "Mart"],
    "Services": ["Solutions", "Consulting", "Services", "Group", "Associates", "Partners"],
    "Healthcare": ["Clinic", "Medical Center", "Health Center", "Pharmacy", "Dental Care"],
    "Education": ["Academy", "Institute", "School", "College", "Learning Center", "Training Center"],
    "Entertainment": ["Lounge", "Club", "Arena", "Theater", "Gallery", "Studio"],
    "Technology": ["Tech", "Digital", "Innovation Hub", "IT Solutions", "Software House"],
    "Real Estate": ["Properties", "Realty", "Estates", "Housing", "Developers"],
    "Transportation": ["Transport", "Logistics", "Movers", "Express", "Transit"]
}

districts = ["Gasabo", "Kicukiro", "Nyarugenge", "Kimihurura", "Remera", "Kacyiru", 
             "Nyarutarama", "Gikondo", "Kibagabaga", "Nyabugogo"]

descriptions = {
    "Restaurant": "offers exceptional dining with authentic Rwandan flavors and international cuisine. Our chefs create memorable culinary experiences using fresh, local ingredients.",
    "Hotel": "provides luxurious accommodation and world-class hospitality in the heart of Kigali. Experience comfort and elegance during your stay in Rwanda.",
    "Retail": "is your premier shopping destination in Kigali. We offer quality products, competitive prices, and excellent customer service.",
    "Services": "delivers professional solutions tailored to your business needs. Our experienced team ensures reliable, efficient, and customer-focused service.",
    "Healthcare": "provides comprehensive medical care with modern facilities and experienced healthcare professionals. Your health and wellbeing are our top priorities.",
    "Education": "offers quality education with experienced faculty and modern learning facilities. We prepare students for success in a global environment.",
    "Entertainment": "is Kigali's premier entertainment destination. Enjoy unforgettable experiences, live performances, and vibrant atmosphere.",
    "Technology": "drives innovation in Rwanda's tech sector. We provide cutting-edge solutions and support for businesses and entrepreneurs.",
    "Real Estate": "specializes in property sales, rentals, and management across Kigali. Find your dream home or investment property with our expert guidance.",
    "Transportation": "offers reliable transportation services across Rwanda. Safe, comfortable, and affordable travel solutions for all your needs."
}

def generate_phone():
    return f"+250 {random.randint(720000000, 799999999)}"

def generate_business_name(category):
    """Generate unique business name"""
    max_attempts = 100
    for _ in range(max_attempts):
        prefix = random.choice(business_prefixes)
        suffix = random.choice(business_types[category])
        name = f"{prefix} {suffix}"
        
        # Add variation
        if random.random() < 0.3:
            name = f"{name} {random.choice(['Ltd', 'Rwanda', 'Kigali', 'Group', '& Co'])}"
        
        if name not in existing_names:
            existing_names.add(name)
            return name
    
    # Fallback with number
    name = f"{prefix} {suffix} {random.randint(1, 999)}"
    existing_names.add(name)
    return name

def generate_created_at():
    """Generate creation date between Nov 1 and Nov 28"""
    start_date = datetime(2025, 11, 1)
    end_date = datetime(2025, 11, 28)
    days_diff = (end_date - start_date).days
    random_days = random.randint(0, days_diff)
    random_hours = random.randint(0, 23)
    random_minutes = random.randint(0, 59)
    return start_date + timedelta(days=random_days, hours=random_hours, minutes=random_minutes)

# Generate 200 more businesses
businesses = []
categories = list(business_types.keys())

for i in range(200):
    category = random.choice(categories)
    name = generate_business_name(category)
    district = random.choice(districts)
    
    business = {
        "id": f"RW{start_id + i:04d}",
        "name": name,
        "category": category,
        "address": f"{district}, Kigali",
        "city": "Kigali",
        "country": "Rwanda",
        "phone": generate_phone(),
        "description": f"{name} {descriptions[category]}",
        "rating": round(random.uniform(3.5, 5.0), 1),
        "verified": random.choice([True, True, False]),  # 66% verified
        "website": f"www.{name.lower().replace(' ', '').replace('&', 'and')}.rw" if random.random() < 0.6 else None,
        "email": f"info@{name.lower().replace(' ', '').replace('&', 'and')}.rw",
        "created_at": generate_created_at().isoformat()
    }
    businesses.append(business)

# Save to new file
with open('scripts/rwanda_businesses_additional.json', 'w') as f:
    json.dump(businesses, f, indent=2)

print(f"✅ Generated {len(businesses)} additional businesses")
print(f"📊 Category distribution:")
for cat in categories:
    count = sum(1 for b in businesses if b['category'] == cat)
    print(f"  - {cat}: {count}")
print(f"\n📁 Saved to: rwanda_businesses_additional.json")
