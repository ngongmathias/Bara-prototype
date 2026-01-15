# Category-Specific Attributes Schema

## Database Structure

All category-specific attributes are stored in the `attributes` JSONB column of `marketplace_listings` table.

---

## 1. **Properties** (Real Estate)

### Required Attributes:
```json
{
  "bedrooms": "3",
  "bathrooms": "2",
  "sqft": "1500",
  "area": "1500",
  "property_type": "apartment|villa|house|land|commercial",
  "furnished": "yes|no|semi",
  "parking": "yes|no",
  "year_built": "2020",
  "floor": "5",
  "total_floors": "10",
  "land_title": "yes|no",
  "amenities": ["pool", "gym", "security", "garden", "balcony"]
}
```

---

## 2. **Motors** (Vehicles)

### Required Attributes:
```json
{
  "make": "Toyota",
  "model": "Camry",
  "year": "2020",
  "mileage": "50000",
  "kilometers": "50000",
  "fuel_type": "petrol|diesel|electric|hybrid",
  "transmission": "automatic|manual",
  "body_type": "sedan|suv|truck|coupe|hatchback",
  "color": "white",
  "engine_size": "2.5L",
  "doors": "4",
  "seats": "5",
  "features": ["sunroof", "leather_seats", "navigation", "backup_camera"]
}
```

---

## 3. **Jobs** (Employment)

### Required Attributes:
```json
{
  "company_name": "ABC Corp",
  "job_type": "full-time|part-time|contract|freelance|internship",
  "experience": "2-5 years",
  "education": "bachelor|master|phd|diploma|high_school",
  "industry": "technology|finance|healthcare|education|retail",
  "salary_min": "50000",
  "salary_max": "80000",
  "deadline": "2026-02-15",
  "requirements": ["Bachelor's degree", "3+ years experience", "Python skills"],
  "responsibilities": ["Develop software", "Lead team", "Code review"],
  "benefits": ["Health insurance", "Paid vacation", "Remote work"]
}
```

---

## 4. **Electronics** (Mobiles & Electronics)

### Required Attributes:
```json
{
  "brand": "Apple",
  "model": "iPhone 14",
  "storage": "256GB",
  "memory": "256GB",
  "ram": "8GB",
  "processor": "A15 Bionic",
  "cpu": "A15 Bionic",
  "screen_size": "6.1 inch",
  "display": "6.1 inch",
  "battery": "3279mAh",
  "camera": "12MP",
  "color": "black",
  "warranty": "yes|no|1year|2year",
  "accessories": ["charger", "case", "earphones"],
  "features": ["5G", "Face ID", "Wireless charging"]
}
```

---

## 5. **Fashion & Beauty**

### Required Attributes:
```json
{
  "brand": "Nike",
  "size": "M|L|XL|38|40|42",
  "gender": "men|women|unisex|kids",
  "category_type": "clothing|shoes|bags|accessories|beauty",
  "material": "cotton|leather|polyester|silk",
  "color": "blue",
  "season": "summer|winter|all-season",
  "style": "casual|formal|sport",
  "features": ["waterproof", "breathable", "stretchable"]
}
```

---

## 6. **Services**

### Required Attributes:
```json
{
  "service_type": "cleaning|repair|tutoring|photography|catering",
  "availability": "weekdays|weekends|24/7|by_appointment",
  "experience_years": "5",
  "qualifications": ["Certified", "Licensed", "Insured"],
  "service_area": "City-wide|Specific areas",
  "price_type": "hourly|daily|per_project|monthly",
  "languages": ["English", "French", "Arabic"],
  "features": ["Emergency service", "Same-day service", "Free consultation"]
}
```

---

## 7. **Home & Furniture**

### Required Attributes:
```json
{
  "furniture_type": "sofa|bed|table|chair|cabinet|desk",
  "material": "wood|metal|plastic|glass|fabric",
  "color": "brown",
  "dimensions": "200x100x80 cm",
  "length": "200",
  "width": "100",
  "height": "80",
  "assembly_required": "yes|no",
  "room": "living_room|bedroom|dining|office|outdoor",
  "style": "modern|classic|rustic|minimalist",
  "features": ["storage", "adjustable", "foldable"]
}
```

---

## 8. **Pets & Birds**

### Required Attributes:
```json
{
  "pet_type": "dog|cat|bird|fish|rabbit|other",
  "breed": "Golden Retriever",
  "age": "2 years",
  "age_months": "24",
  "gender": "male|female",
  "color": "golden",
  "vaccinated": "yes|no",
  "pedigree": "yes|no",
  "trained": "yes|no",
  "health_status": "healthy|special_needs",
  "features": ["friendly", "house_trained", "good_with_kids"]
}
```

---

## 9. **Kids & Babies**

### Required Attributes:
```json
{
  "item_type": "clothing|toys|furniture|stroller|car_seat|feeding",
  "age_range": "0-6months|6-12months|1-2years|3-5years",
  "gender": "boy|girl|unisex",
  "brand": "Fisher Price",
  "size": "newborn|0-3m|3-6m|6-12m",
  "color": "pink",
  "material": "cotton|plastic|wood",
  "safety_certified": "yes|no",
  "features": ["washable", "adjustable", "portable"]
}
```

---

## 10. **Hobbies**

### Required Attributes:
```json
{
  "hobby_type": "collectibles|sports|music|art|books|games",
  "item_category": "antiques|bicycles|instruments|paintings|novels",
  "brand": "Fender",
  "year": "2015",
  "material": "wood|metal|paper|canvas",
  "rarity": "common|rare|limited_edition|vintage",
  "features": ["signed", "first_edition", "mint_condition"]
}
```

---

## 11. **Businesses & Industrial**

### Required Attributes:
```json
{
  "business_type": "restaurant|retail|manufacturing|agriculture|construction",
  "industry": "food|fashion|tech|agriculture|real_estate",
  "established_year": "2015",
  "employees": "10-50",
  "revenue": "annual_revenue_range",
  "equipment_included": "yes|no",
  "lease_terms": "negotiable|fixed",
  "reason_for_sale": "retirement|relocation|expansion",
  "features": ["profitable", "established_clientele", "prime_location"]
}
```

---

## 12. **Generic/Other Categories**

### Optional Attributes:
```json
{
  "brand": "Generic Brand",
  "model": "Model X",
  "color": "blue",
  "size": "medium",
  "material": "mixed",
  "features": ["durable", "portable", "eco-friendly"]
}
```

---

## SQL Migration for Attributes

The `attributes` column is already JSONB type, so no schema changes needed. However, we can add indexes for common searches:

```sql
-- Add GIN index for JSONB attributes (already in migration)
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_attributes 
ON marketplace_listings USING GIN (attributes);

-- Add indexes for commonly searched attributes
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_bedrooms 
ON marketplace_listings ((attributes->>'bedrooms'));

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_make 
ON marketplace_listings ((attributes->>'make'));

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_brand 
ON marketplace_listings ((attributes->>'brand'));
```

---

## Form Validation Rules

### Properties:
- bedrooms: number, 0-20
- bathrooms: number, 0-10
- sqft: number, min 100
- property_type: required enum

### Motors:
- make: required string
- model: required string
- year: number, 1900-2026
- mileage: number, min 0

### Jobs:
- company_name: required string
- job_type: required enum
- salary_min: number, optional
- salary_max: number, optional

### Electronics:
- brand: required string
- storage: optional string
- ram: optional string

### Fashion:
- size: required string
- gender: required enum
- brand: optional string

### Services:
- service_type: required enum
- availability: required string

### Furniture:
- furniture_type: required enum
- material: optional string
- dimensions: optional string

### Pets:
- pet_type: required enum
- breed: optional string
- age: optional string
- vaccinated: required enum

### Kids:
- item_type: required enum
- age_range: required enum
- safety_certified: optional enum

### Hobbies:
- hobby_type: required enum
- item_category: optional string

### Business:
- business_type: required enum
- industry: optional string
- established_year: optional number

---

## Usage in Forms

Each category POST form will:
1. Show category-specific fields
2. Validate based on category rules
3. Store in `attributes` JSONB column
4. Display in category-specific detail page

---

**Version**: 1.0.0  
**Date**: January 15, 2026
