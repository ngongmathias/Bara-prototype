export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'multiselect' | 'date' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  helperText?: string;
}

export interface CategoryConfig {
  categorySlug: string;
  categoryName: string;
  fields: FieldConfig[];
  imageGuidance?: string;
}

export const categoryFieldConfigs: CategoryConfig[] = [
  // PROPERTIES
  {
    categorySlug: 'property',
    categoryName: 'Properties',
    imageGuidance: 'Upload clear photos of exterior, interior, kitchen, bathrooms, and any special features',
    fields: [
      {
        name: 'bedrooms',
        label: 'Bedrooms',
        type: 'number',
        required: true,
        min: 0,
        max: 20,
        placeholder: 'e.g., 3'
      },
      {
        name: 'bathrooms',
        label: 'Bathrooms',
        type: 'number',
        required: true,
        min: 0,
        max: 10,
        step: 0.5,
        placeholder: 'e.g., 2'
      },
      {
        name: 'sqft',
        label: 'Square Feet',
        type: 'number',
        required: true,
        min: 100,
        placeholder: 'e.g., 1500'
      },
      {
        name: 'property_type',
        label: 'Property Type',
        type: 'select',
        required: true,
        options: [
          { value: 'apartment', label: 'Apartment' },
          { value: 'villa', label: 'Villa' },
          { value: 'house', label: 'House' },
          { value: 'land', label: 'Land' },
          { value: 'commercial', label: 'Commercial' }
        ]
      },
      {
        name: 'furnished',
        label: 'Furnished',
        type: 'select',
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'semi', label: 'Semi-Furnished' }
        ]
      },
      {
        name: 'parking',
        label: 'Parking Available',
        type: 'select',
        required: false,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ]
      },
      {
        name: 'year_built',
        label: 'Year Built',
        type: 'number',
        required: false,
        min: 1900,
        max: 2026,
        placeholder: 'e.g., 2020'
      },
      {
        name: 'floor',
        label: 'Floor Number',
        type: 'number',
        required: false,
        placeholder: 'e.g., 5'
      },
      {
        name: 'total_floors',
        label: 'Total Floors in Building',
        type: 'number',
        required: false,
        placeholder: 'e.g., 10'
      },
      {
        name: 'land_title',
        label: 'Land Title Available',
        type: 'select',
        required: false,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ]
      },
      {
        name: 'amenities',
        label: 'Amenities',
        type: 'multiselect',
        required: false,
        options: [
          { value: 'pool', label: 'Swimming Pool' },
          { value: 'gym', label: 'Gym' },
          { value: 'security', label: '24/7 Security' },
          { value: 'garden', label: 'Garden' },
          { value: 'balcony', label: 'Balcony' },
          { value: 'elevator', label: 'Elevator' },
          { value: 'ac', label: 'Air Conditioning' },
          { value: 'heating', label: 'Heating' }
        ]
      }
    ]
  },

  // MOTORS
  {
    categorySlug: 'motors',
    categoryName: 'Motors',
    imageGuidance: 'Upload photos from all angles: front, back, sides, interior, engine, and any damage',
    fields: [
      {
        name: 'make',
        label: 'Make',
        type: 'text',
        required: true,
        placeholder: 'e.g., Toyota'
      },
      {
        name: 'model',
        label: 'Model',
        type: 'text',
        required: true,
        placeholder: 'e.g., Camry'
      },
      {
        name: 'year',
        label: 'Year',
        type: 'number',
        required: true,
        min: 1900,
        max: 2026,
        placeholder: 'e.g., 2020'
      },
      {
        name: 'mileage',
        label: 'Mileage (km)',
        type: 'number',
        required: true,
        min: 0,
        placeholder: 'e.g., 50000'
      },
      {
        name: 'fuel_type',
        label: 'Fuel Type',
        type: 'select',
        required: true,
        options: [
          { value: 'petrol', label: 'Petrol' },
          { value: 'diesel', label: 'Diesel' },
          { value: 'electric', label: 'Electric' },
          { value: 'hybrid', label: 'Hybrid' }
        ]
      },
      {
        name: 'transmission',
        label: 'Transmission',
        type: 'select',
        required: true,
        options: [
          { value: 'automatic', label: 'Automatic' },
          { value: 'manual', label: 'Manual' }
        ]
      },
      {
        name: 'body_type',
        label: 'Body Type',
        type: 'select',
        required: false,
        options: [
          { value: 'sedan', label: 'Sedan' },
          { value: 'suv', label: 'SUV' },
          { value: 'truck', label: 'Truck' },
          { value: 'coupe', label: 'Coupe' },
          { value: 'hatchback', label: 'Hatchback' },
          { value: 'van', label: 'Van' }
        ]
      },
      {
        name: 'color',
        label: 'Color',
        type: 'text',
        required: false,
        placeholder: 'e.g., White'
      },
      {
        name: 'engine_size',
        label: 'Engine Size',
        type: 'text',
        required: false,
        placeholder: 'e.g., 2.5L'
      },
      {
        name: 'doors',
        label: 'Number of Doors',
        type: 'number',
        required: false,
        min: 2,
        max: 5,
        placeholder: 'e.g., 4'
      },
      {
        name: 'seats',
        label: 'Number of Seats',
        type: 'number',
        required: false,
        min: 2,
        max: 9,
        placeholder: 'e.g., 5'
      },
      {
        name: 'features',
        label: 'Features',
        type: 'multiselect',
        required: false,
        options: [
          { value: 'sunroof', label: 'Sunroof' },
          { value: 'leather_seats', label: 'Leather Seats' },
          { value: 'navigation', label: 'Navigation System' },
          { value: 'backup_camera', label: 'Backup Camera' },
          { value: 'bluetooth', label: 'Bluetooth' },
          { value: 'cruise_control', label: 'Cruise Control' },
          { value: 'parking_sensors', label: 'Parking Sensors' },
          { value: 'alloy_wheels', label: 'Alloy Wheels' }
        ]
      }
    ]
  },

  // JOBS
  {
    categorySlug: 'jobs',
    categoryName: 'Jobs',
    imageGuidance: 'Upload company logo or workplace photos (optional)',
    fields: [
      {
        name: 'company_name',
        label: 'Company Name',
        type: 'text',
        required: true,
        placeholder: 'e.g., ABC Corporation'
      },
      {
        name: 'job_type',
        label: 'Job Type',
        type: 'select',
        required: true,
        options: [
          { value: 'full-time', label: 'Full-time' },
          { value: 'part-time', label: 'Part-time' },
          { value: 'contract', label: 'Contract' },
          { value: 'freelance', label: 'Freelance' },
          { value: 'internship', label: 'Internship' }
        ]
      },
      {
        name: 'experience',
        label: 'Experience Required',
        type: 'text',
        required: true,
        placeholder: 'e.g., 2-5 years'
      },
      {
        name: 'education',
        label: 'Education Required',
        type: 'select',
        required: false,
        options: [
          { value: 'high_school', label: 'High School' },
          { value: 'diploma', label: 'Diploma' },
          { value: 'bachelor', label: "Bachelor's Degree" },
          { value: 'master', label: "Master's Degree" },
          { value: 'phd', label: 'PhD' }
        ]
      },
      {
        name: 'industry',
        label: 'Industry',
        type: 'select',
        required: false,
        options: [
          { value: 'technology', label: 'Technology' },
          { value: 'finance', label: 'Finance' },
          { value: 'healthcare', label: 'Healthcare' },
          { value: 'education', label: 'Education' },
          { value: 'retail', label: 'Retail' },
          { value: 'manufacturing', label: 'Manufacturing' },
          { value: 'hospitality', label: 'Hospitality' }
        ]
      },
      {
        name: 'salary_min',
        label: 'Minimum Salary',
        type: 'number',
        required: false,
        min: 0,
        placeholder: 'e.g., 50000'
      },
      {
        name: 'salary_max',
        label: 'Maximum Salary',
        type: 'number',
        required: false,
        min: 0,
        placeholder: 'e.g., 80000'
      },
      {
        name: 'deadline',
        label: 'Application Deadline',
        type: 'date',
        required: false
      },
      {
        name: 'requirements',
        label: 'Requirements (one per line)',
        type: 'textarea',
        required: false,
        placeholder: "Bachelor's degree in Computer Science\n3+ years of Python experience\nStrong communication skills",
        helperText: 'Enter each requirement on a new line'
      },
      {
        name: 'responsibilities',
        label: 'Responsibilities (one per line)',
        type: 'textarea',
        required: false,
        placeholder: 'Develop and maintain software applications\nLead team meetings\nCode review',
        helperText: 'Enter each responsibility on a new line'
      },
      {
        name: 'benefits',
        label: 'Benefits (one per line)',
        type: 'textarea',
        required: false,
        placeholder: 'Health insurance\nPaid vacation\nRemote work options',
        helperText: 'Enter each benefit on a new line'
      }
    ]
  },

  // ELECTRONICS
  {
    categorySlug: 'electronics',
    categoryName: 'Electronics',
    imageGuidance: 'Upload clear photos showing the device from multiple angles, screen, and any accessories',
    fields: [
      {
        name: 'brand',
        label: 'Brand',
        type: 'text',
        required: true,
        placeholder: 'e.g., Apple'
      },
      {
        name: 'model',
        label: 'Model',
        type: 'text',
        required: true,
        placeholder: 'e.g., iPhone 14'
      },
      {
        name: 'storage',
        label: 'Storage',
        type: 'text',
        required: false,
        placeholder: 'e.g., 256GB'
      },
      {
        name: 'ram',
        label: 'RAM',
        type: 'text',
        required: false,
        placeholder: 'e.g., 8GB'
      },
      {
        name: 'processor',
        label: 'Processor',
        type: 'text',
        required: false,
        placeholder: 'e.g., A15 Bionic'
      },
      {
        name: 'screen_size',
        label: 'Screen Size',
        type: 'text',
        required: false,
        placeholder: 'e.g., 6.1 inch'
      },
      {
        name: 'battery',
        label: 'Battery',
        type: 'text',
        required: false,
        placeholder: 'e.g., 3279mAh'
      },
      {
        name: 'camera',
        label: 'Camera',
        type: 'text',
        required: false,
        placeholder: 'e.g., 12MP'
      },
      {
        name: 'color',
        label: 'Color',
        type: 'text',
        required: false,
        placeholder: 'e.g., Black'
      },
      {
        name: 'warranty',
        label: 'Warranty',
        type: 'select',
        required: false,
        options: [
          { value: 'no', label: 'No Warranty' },
          { value: 'yes', label: 'Under Warranty' },
          { value: '1year', label: '1 Year' },
          { value: '2year', label: '2 Years' }
        ]
      },
      {
        name: 'accessories',
        label: 'Accessories Included',
        type: 'multiselect',
        required: false,
        options: [
          { value: 'charger', label: 'Charger' },
          { value: 'case', label: 'Case' },
          { value: 'earphones', label: 'Earphones' },
          { value: 'box', label: 'Original Box' },
          { value: 'cable', label: 'Cable' },
          { value: 'adapter', label: 'Adapter' }
        ]
      },
      {
        name: 'features',
        label: 'Features',
        type: 'multiselect',
        required: false,
        options: [
          { value: '5g', label: '5G' },
          { value: 'face_id', label: 'Face ID' },
          { value: 'fingerprint', label: 'Fingerprint Scanner' },
          { value: 'wireless_charging', label: 'Wireless Charging' },
          { value: 'water_resistant', label: 'Water Resistant' },
          { value: 'dual_sim', label: 'Dual SIM' }
        ]
      }
    ]
  },

  // FASHION & BEAUTY
  {
    categorySlug: 'fashion',
    categoryName: 'Fashion & Beauty',
    imageGuidance: 'Upload clear photos showing the item from different angles, tags, and any defects',
    fields: [
      {
        name: 'brand',
        label: 'Brand',
        type: 'text',
        required: false,
        placeholder: 'e.g., Nike'
      },
      {
        name: 'size',
        label: 'Size',
        type: 'text',
        required: true,
        placeholder: 'e.g., M, L, 38, 40'
      },
      {
        name: 'gender',
        label: 'Gender',
        type: 'select',
        required: true,
        options: [
          { value: 'men', label: 'Men' },
          { value: 'women', label: 'Women' },
          { value: 'unisex', label: 'Unisex' },
          { value: 'kids', label: 'Kids' }
        ]
      },
      {
        name: 'category_type',
        label: 'Category',
        type: 'select',
        required: false,
        options: [
          { value: 'clothing', label: 'Clothing' },
          { value: 'shoes', label: 'Shoes' },
          { value: 'bags', label: 'Bags' },
          { value: 'accessories', label: 'Accessories' },
          { value: 'beauty', label: 'Beauty Products' }
        ]
      },
      {
        name: 'material',
        label: 'Material',
        type: 'text',
        required: false,
        placeholder: 'e.g., Cotton, Leather, Polyester'
      },
      {
        name: 'color',
        label: 'Color',
        type: 'text',
        required: false,
        placeholder: 'e.g., Blue'
      },
      {
        name: 'season',
        label: 'Season',
        type: 'select',
        required: false,
        options: [
          { value: 'summer', label: 'Summer' },
          { value: 'winter', label: 'Winter' },
          { value: 'all-season', label: 'All Season' }
        ]
      },
      {
        name: 'style',
        label: 'Style',
        type: 'select',
        required: false,
        options: [
          { value: 'casual', label: 'Casual' },
          { value: 'formal', label: 'Formal' },
          { value: 'sport', label: 'Sport' },
          { value: 'vintage', label: 'Vintage' }
        ]
      },
      {
        name: 'features',
        label: 'Features',
        type: 'multiselect',
        required: false,
        options: [
          { value: 'waterproof', label: 'Waterproof' },
          { value: 'breathable', label: 'Breathable' },
          { value: 'stretchable', label: 'Stretchable' },
          { value: 'designer', label: 'Designer' },
          { value: 'limited_edition', label: 'Limited Edition' }
        ]
      }
    ]
  },

  // SERVICES
  {
    categorySlug: 'services',
    categoryName: 'Services',
    imageGuidance: 'Upload photos of your work, certifications, or team (optional)',
    fields: [
      {
        name: 'service_type',
        label: 'Service Type',
        type: 'select',
        required: true,
        options: [
          { value: 'cleaning', label: 'Cleaning' },
          { value: 'repair', label: 'Repair' },
          { value: 'tutoring', label: 'Tutoring' },
          { value: 'photography', label: 'Photography' },
          { value: 'catering', label: 'Catering' },
          { value: 'consulting', label: 'Consulting' },
          { value: 'other', label: 'Other' }
        ]
      },
      {
        name: 'availability',
        label: 'Availability',
        type: 'select',
        required: true,
        options: [
          { value: 'weekdays', label: 'Weekdays' },
          { value: 'weekends', label: 'Weekends' },
          { value: '24/7', label: '24/7' },
          { value: 'by_appointment', label: 'By Appointment' }
        ]
      },
      {
        name: 'experience_years',
        label: 'Years of Experience',
        type: 'number',
        required: false,
        min: 0,
        placeholder: 'e.g., 5'
      },
      {
        name: 'qualifications',
        label: 'Qualifications (one per line)',
        type: 'textarea',
        required: false,
        placeholder: 'Certified Professional\nLicensed\nInsured',
        helperText: 'Enter each qualification on a new line'
      },
      {
        name: 'service_area',
        label: 'Service Area',
        type: 'text',
        required: false,
        placeholder: 'e.g., City-wide, Specific neighborhoods'
      },
      {
        name: 'languages',
        label: 'Languages Spoken',
        type: 'multiselect',
        required: false,
        options: [
          { value: 'english', label: 'English' },
          { value: 'french', label: 'French' },
          { value: 'arabic', label: 'Arabic' },
          { value: 'spanish', label: 'Spanish' },
          { value: 'swahili', label: 'Swahili' }
        ]
      },
      {
        name: 'features',
        label: 'Features',
        type: 'multiselect',
        required: false,
        options: [
          { value: 'emergency_service', label: 'Emergency Service' },
          { value: 'same_day', label: 'Same-day Service' },
          { value: 'free_consultation', label: 'Free Consultation' },
          { value: 'guarantee', label: 'Satisfaction Guarantee' }
        ]
      }
    ]
  },

  // HOME & FURNITURE
  {
    categorySlug: 'home-furniture',
    categoryName: 'Home & Furniture',
    imageGuidance: 'Upload photos from multiple angles showing condition and dimensions',
    fields: [
      {
        name: 'furniture_type',
        label: 'Furniture Type',
        type: 'select',
        required: true,
        options: [
          { value: 'sofa', label: 'Sofa' },
          { value: 'bed', label: 'Bed' },
          { value: 'table', label: 'Table' },
          { value: 'chair', label: 'Chair' },
          { value: 'cabinet', label: 'Cabinet' },
          { value: 'desk', label: 'Desk' },
          { value: 'other', label: 'Other' }
        ]
      },
      {
        name: 'material',
        label: 'Material',
        type: 'text',
        required: false,
        placeholder: 'e.g., Wood, Metal, Fabric'
      },
      {
        name: 'color',
        label: 'Color',
        type: 'text',
        required: false,
        placeholder: 'e.g., Brown'
      },
      {
        name: 'dimensions',
        label: 'Dimensions',
        type: 'text',
        required: false,
        placeholder: 'e.g., 200x100x80 cm'
      },
      {
        name: 'assembly_required',
        label: 'Assembly Required',
        type: 'select',
        required: false,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ]
      },
      {
        name: 'room',
        label: 'Room',
        type: 'select',
        required: false,
        options: [
          { value: 'living_room', label: 'Living Room' },
          { value: 'bedroom', label: 'Bedroom' },
          { value: 'dining', label: 'Dining Room' },
          { value: 'office', label: 'Office' },
          { value: 'outdoor', label: 'Outdoor' }
        ]
      },
      {
        name: 'style',
        label: 'Style',
        type: 'select',
        required: false,
        options: [
          { value: 'modern', label: 'Modern' },
          { value: 'classic', label: 'Classic' },
          { value: 'rustic', label: 'Rustic' },
          { value: 'minimalist', label: 'Minimalist' }
        ]
      },
      {
        name: 'features',
        label: 'Features',
        type: 'multiselect',
        required: false,
        options: [
          { value: 'storage', label: 'Storage' },
          { value: 'adjustable', label: 'Adjustable' },
          { value: 'foldable', label: 'Foldable' },
          { value: 'extendable', label: 'Extendable' }
        ]
      }
    ]
  },

  // PETS & BIRDS
  {
    categorySlug: 'pets',
    categoryName: 'Pets & Birds',
    imageGuidance: 'Upload clear photos of the pet, vaccination records if available',
    fields: [
      {
        name: 'pet_type',
        label: 'Pet Type',
        type: 'select',
        required: true,
        options: [
          { value: 'dog', label: 'Dog' },
          { value: 'cat', label: 'Cat' },
          { value: 'bird', label: 'Bird' },
          { value: 'fish', label: 'Fish' },
          { value: 'rabbit', label: 'Rabbit' },
          { value: 'other', label: 'Other' }
        ]
      },
      {
        name: 'breed',
        label: 'Breed',
        type: 'text',
        required: false,
        placeholder: 'e.g., Golden Retriever'
      },
      {
        name: 'age',
        label: 'Age',
        type: 'text',
        required: false,
        placeholder: 'e.g., 2 years, 6 months'
      },
      {
        name: 'gender',
        label: 'Gender',
        type: 'select',
        required: false,
        options: [
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' }
        ]
      },
      {
        name: 'color',
        label: 'Color',
        type: 'text',
        required: false,
        placeholder: 'e.g., Golden'
      },
      {
        name: 'vaccinated',
        label: 'Vaccinated',
        type: 'select',
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ]
      },
      {
        name: 'pedigree',
        label: 'Pedigree',
        type: 'select',
        required: false,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ]
      },
      {
        name: 'trained',
        label: 'Trained',
        type: 'select',
        required: false,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ]
      },
      {
        name: 'health_status',
        label: 'Health Status',
        type: 'select',
        required: false,
        options: [
          { value: 'healthy', label: 'Healthy' },
          { value: 'special_needs', label: 'Special Needs' }
        ]
      },
      {
        name: 'features',
        label: 'Characteristics',
        type: 'multiselect',
        required: false,
        options: [
          { value: 'friendly', label: 'Friendly' },
          { value: 'house_trained', label: 'House Trained' },
          { value: 'good_with_kids', label: 'Good with Kids' },
          { value: 'good_with_pets', label: 'Good with Other Pets' },
          { value: 'playful', label: 'Playful' },
          { value: 'calm', label: 'Calm' }
        ]
      }
    ]
  },

  // KIDS & BABIES
  {
    categorySlug: 'kids-babies',
    categoryName: 'Kids & Babies',
    imageGuidance: 'Upload clear photos showing condition, tags, and any safety certifications',
    fields: [
      {
        name: 'item_type',
        label: 'Item Type',
        type: 'select',
        required: true,
        options: [
          { value: 'clothing', label: 'Clothing' },
          { value: 'toys', label: 'Toys' },
          { value: 'furniture', label: 'Furniture' },
          { value: 'stroller', label: 'Stroller' },
          { value: 'car_seat', label: 'Car Seat' },
          { value: 'feeding', label: 'Feeding' },
          { value: 'other', label: 'Other' }
        ]
      },
      {
        name: 'age_range',
        label: 'Age Range',
        type: 'select',
        required: true,
        options: [
          { value: '0-6months', label: '0-6 months' },
          { value: '6-12months', label: '6-12 months' },
          { value: '1-2years', label: '1-2 years' },
          { value: '3-5years', label: '3-5 years' },
          { value: '6+years', label: '6+ years' }
        ]
      },
      {
        name: 'gender',
        label: 'Gender',
        type: 'select',
        required: false,
        options: [
          { value: 'boy', label: 'Boy' },
          { value: 'girl', label: 'Girl' },
          { value: 'unisex', label: 'Unisex' }
        ]
      },
      {
        name: 'brand',
        label: 'Brand',
        type: 'text',
        required: false,
        placeholder: 'e.g., Fisher Price'
      },
      {
        name: 'size',
        label: 'Size',
        type: 'text',
        required: false,
        placeholder: 'e.g., 0-3m, 6-12m'
      },
      {
        name: 'color',
        label: 'Color',
        type: 'text',
        required: false,
        placeholder: 'e.g., Pink'
      },
      {
        name: 'material',
        label: 'Material',
        type: 'text',
        required: false,
        placeholder: 'e.g., Cotton, Plastic'
      },
      {
        name: 'safety_certified',
        label: 'Safety Certified',
        type: 'select',
        required: false,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ]
      },
      {
        name: 'features',
        label: 'Features',
        type: 'multiselect',
        required: false,
        options: [
          { value: 'washable', label: 'Washable' },
          { value: 'adjustable', label: 'Adjustable' },
          { value: 'portable', label: 'Portable' },
          { value: 'educational', label: 'Educational' },
          { value: 'organic', label: 'Organic' }
        ]
      }
    ]
  },

  // HOBBIES
  {
    categorySlug: 'hobbies',
    categoryName: 'Hobbies',
    imageGuidance: 'Upload clear photos showing condition, any signatures, certificates, or special features',
    fields: [
      {
        name: 'hobby_type',
        label: 'Hobby Type',
        type: 'select',
        required: true,
        options: [
          { value: 'collectibles', label: 'Collectibles' },
          { value: 'sports', label: 'Sports Equipment' },
          { value: 'music', label: 'Musical Instruments' },
          { value: 'art', label: 'Art' },
          { value: 'books', label: 'Books' },
          { value: 'games', label: 'Games' },
          { value: 'other', label: 'Other' }
        ]
      },
      {
        name: 'item_category',
        label: 'Item Category',
        type: 'text',
        required: false,
        placeholder: 'e.g., Antiques, Bicycles, Guitars'
      },
      {
        name: 'brand',
        label: 'Brand',
        type: 'text',
        required: false,
        placeholder: 'e.g., Fender'
      },
      {
        name: 'year',
        label: 'Year',
        type: 'number',
        required: false,
        min: 1800,
        max: 2026,
        placeholder: 'e.g., 2015'
      },
      {
        name: 'material',
        label: 'Material',
        type: 'text',
        required: false,
        placeholder: 'e.g., Wood, Metal, Paper'
      },
      {
        name: 'rarity',
        label: 'Rarity',
        type: 'select',
        required: false,
        options: [
          { value: 'common', label: 'Common' },
          { value: 'rare', label: 'Rare' },
          { value: 'limited_edition', label: 'Limited Edition' },
          { value: 'vintage', label: 'Vintage' }
        ]
      },
      {
        name: 'features',
        label: 'Features',
        type: 'multiselect',
        required: false,
        options: [
          { value: 'signed', label: 'Signed' },
          { value: 'first_edition', label: 'First Edition' },
          { value: 'mint_condition', label: 'Mint Condition' },
          { value: 'authenticated', label: 'Authenticated' },
          { value: 'complete_set', label: 'Complete Set' }
        ]
      }
    ]
  },

  // BUSINESSES & INDUSTRIAL
  {
    categorySlug: 'businesses',
    categoryName: 'Businesses & Industrial',
    imageGuidance: 'Upload photos of the business premises, equipment, or relevant documents',
    fields: [
      {
        name: 'business_type',
        label: 'Business Type',
        type: 'select',
        required: true,
        options: [
          { value: 'restaurant', label: 'Restaurant' },
          { value: 'retail', label: 'Retail' },
          { value: 'manufacturing', label: 'Manufacturing' },
          { value: 'agriculture', label: 'Agriculture' },
          { value: 'construction', label: 'Construction' },
          { value: 'other', label: 'Other' }
        ]
      },
      {
        name: 'industry',
        label: 'Industry',
        type: 'text',
        required: false,
        placeholder: 'e.g., Food & Beverage, Fashion'
      },
      {
        name: 'established_year',
        label: 'Year Established',
        type: 'number',
        required: false,
        min: 1900,
        max: 2026,
        placeholder: 'e.g., 2015'
      },
      {
        name: 'employees',
        label: 'Number of Employees',
        type: 'text',
        required: false,
        placeholder: 'e.g., 10-50'
      },
      {
        name: 'revenue',
        label: 'Annual Revenue',
        type: 'text',
        required: false,
        placeholder: 'e.g., $100,000 - $500,000'
      },
      {
        name: 'equipment_included',
        label: 'Equipment Included',
        type: 'select',
        required: false,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ]
      },
      {
        name: 'lease_terms',
        label: 'Lease Terms',
        type: 'text',
        required: false,
        placeholder: 'e.g., Negotiable, 5 years remaining'
      },
      {
        name: 'reason_for_sale',
        label: 'Reason for Sale',
        type: 'select',
        required: false,
        options: [
          { value: 'retirement', label: 'Retirement' },
          { value: 'relocation', label: 'Relocation' },
          { value: 'expansion', label: 'Expansion' },
          { value: 'other', label: 'Other' }
        ]
      },
      {
        name: 'features',
        label: 'Features',
        type: 'multiselect',
        required: false,
        options: [
          { value: 'profitable', label: 'Profitable' },
          { value: 'established_clientele', label: 'Established Clientele' },
          { value: 'prime_location', label: 'Prime Location' },
          { value: 'growth_potential', label: 'Growth Potential' },
          { value: 'online_presence', label: 'Strong Online Presence' }
        ]
      }
    ]
  }
];

// Helper function to get config by category slug
export const getCategoryConfig = (categorySlug: string): CategoryConfig | undefined => {
  return categoryFieldConfigs.find(config => 
    config.categorySlug === categorySlug || 
    categorySlug.includes(config.categorySlug)
  );
};

// Helper function to get all category slugs
export const getAllCategorySlugs = (): string[] => {
  return categoryFieldConfigs.map(config => config.categorySlug);
};
