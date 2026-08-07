import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CategoryAttributeFieldsProps {
  /** Slug of the selected marketplace category, e.g. "motors". */
  categorySlug: string;
  /** Free-form per-category values, stored on marketplace_listings.attributes. */
  attributes: Record<string, any>;
  setAttributes: (next: Record<string, any>) => void;
}

/**
 * The category-specific half of a listing form — vehicle specs for motors,
 * bedrooms for property, size for fashion, and so on.
 *
 * Extracted from PostListing so EditListing can render the identical fields.
 * Previously only the posting form had these, which made every edit a lossy
 * round-trip: a seller who fixed a typo in their title could not touch the
 * mileage or the bedroom count, because the edit form had no input for them.
 *
 * Each panel used to carry its own pastel background (motors blue, property
 * green, pets pink...). The design system is black/white/grey only, so they
 * are now a single neutral panel.
 */
export const CategoryAttributeFields: React.FC<CategoryAttributeFieldsProps> = ({
  categorySlug,
  attributes,
  setAttributes,
}) => {
  const selectedCategorySlug = categorySlug || '';
  return (
    <>
        {/* Category-Specific Fields */}

        {selectedCategorySlug === 'motors' && (

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">

            <h3 className="font-semibold text-gray-900 mb-4">Vehicle Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>

                <Label>Brand/Make</Label>

                <Select

                  value={attributes.make || ''}

                  onValueChange={(value) => setAttributes({ ...attributes, make: value })}

                >

                  <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>

                  <SelectContent>

                    <SelectItem value="Toyota">Toyota</SelectItem>

                    <SelectItem value="Honda">Honda</SelectItem>

                    <SelectItem value="Nissan">Nissan</SelectItem>

                    <SelectItem value="Mercedes-Benz">Mercedes-Benz</SelectItem>

                    <SelectItem value="BMW">BMW</SelectItem>

                    <SelectItem value="Audi">Audi</SelectItem>

                    <SelectItem value="Volkswagen">Volkswagen</SelectItem>

                    <SelectItem value="Ford">Ford</SelectItem>

                    <SelectItem value="Chevrolet">Chevrolet</SelectItem>

                    <SelectItem value="Hyundai">Hyundai</SelectItem>

                    <SelectItem value="Kia">Kia</SelectItem>

                    <SelectItem value="Mazda">Mazda</SelectItem>

                    <SelectItem value="Subaru">Subaru</SelectItem>

                    <SelectItem value="Mitsubishi">Mitsubishi</SelectItem>

                    <SelectItem value="Suzuki">Suzuki</SelectItem>

                    <SelectItem value="Isuzu">Isuzu</SelectItem>

                    <SelectItem value="Land Rover">Land Rover</SelectItem>

                    <SelectItem value="Jeep">Jeep</SelectItem>

                    <SelectItem value="Peugeot">Peugeot</SelectItem>

                    <SelectItem value="Renault">Renault</SelectItem>

                    <SelectItem value="Other">Other</SelectItem>

                  </SelectContent>

                </Select>

              </div>

              <div>

                <Label>Model</Label>

                <Input

                  value={attributes.model || ''}

                  onChange={(e) => setAttributes({ ...attributes, model: e.target.value })}

                  placeholder="e.g., Camry"

                />

              </div>

              <div>

                <Label>Year</Label>

                <Select value={attributes.year || ''} onValueChange={(value) => setAttributes({ ...attributes, year: value })}>

                  <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>

                  <SelectContent>

                    {Array.from({ length: 10 }, (_, i) => 2024 - i).map(year => (

                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>

                    ))}

                  </SelectContent>

                </Select>

              </div>

              <div>

                <Label>Body Type</Label>

                <Select value={attributes.body_type || ''} onValueChange={(value) => setAttributes({ ...attributes, body_type: value })}>

                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>

                  <SelectContent>

                    <SelectItem value="Sedan">Sedan</SelectItem>

                    <SelectItem value="SUV">SUV</SelectItem>

                    <SelectItem value="Hatchback">Hatchback</SelectItem>

                    <SelectItem value="Coupe">Coupe</SelectItem>

                    <SelectItem value="Pickup">Pickup Truck</SelectItem>

                    <SelectItem value="Van">Van</SelectItem>

                  </SelectContent>

                </Select>

              </div>

              <div>

                <Label>Fuel Type</Label>

                <Select value={attributes.fuel_type || ''} onValueChange={(value) => setAttributes({ ...attributes, fuel_type: value })}>

                  <SelectTrigger><SelectValue placeholder="Select fuel type" /></SelectTrigger>

                  <SelectContent>

                    <SelectItem value="Petrol">Petrol</SelectItem>

                    <SelectItem value="Diesel">Diesel</SelectItem>

                    <SelectItem value="Electric">Electric</SelectItem>

                    <SelectItem value="Hybrid">Hybrid</SelectItem>

                  </SelectContent>

                </Select>

              </div>

              <div>

                <Label>Transmission</Label>

                <Select value={attributes.transmission || ''} onValueChange={(value) => setAttributes({ ...attributes, transmission: value })}>

                  <SelectTrigger><SelectValue placeholder="Select transmission" /></SelectTrigger>

                  <SelectContent>

                    <SelectItem value="Automatic">Automatic</SelectItem>

                    <SelectItem value="Manual">Manual</SelectItem>

                  </SelectContent>

                </Select>

              </div>

              <div>

                <Label>Mileage (km)</Label>

                <Input

                  type="number"

                  value={attributes.mileage || ''}

                  onChange={(e) => setAttributes({ ...attributes, mileage: e.target.value })}

                  placeholder="e.g., 35000"

                />

              </div>

            </div>

          </div>

        )}

        {selectedCategorySlug.includes('property') && (

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">

            <h3 className="font-semibold text-gray-900 mb-4">Property Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>

                <Label>Property Type</Label>

                <Select value={attributes.property_type || ''} onValueChange={(value) => setAttributes({ ...attributes, property_type: value })}>

                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>

                  <SelectContent>

                    <SelectItem value="Apartment">Apartment</SelectItem>

                    <SelectItem value="Villa">Villa</SelectItem>

                    <SelectItem value="House">House</SelectItem>

                    <SelectItem value="Land">Land</SelectItem>

                    <SelectItem value="Commercial">Commercial</SelectItem>

                  </SelectContent>

                </Select>

              </div>

              <div>

                <Label>Bedrooms</Label>

                <Select value={attributes.bedrooms?.toString() || ''} onValueChange={(value) => setAttributes({ ...attributes, bedrooms: parseInt(value) })}>

                  <SelectTrigger><SelectValue placeholder="Select bedrooms" /></SelectTrigger>

                  <SelectContent>

                    {[1, 2, 3, 4, 5, 6].map(num => (

                      <SelectItem key={num} value={num.toString()}>{num}</SelectItem>

                    ))}

                  </SelectContent>

                </Select>

              </div>

              <div>

                <Label>Bathrooms</Label>

                <Select value={attributes.bathrooms?.toString() || ''} onValueChange={(value) => setAttributes({ ...attributes, bathrooms: parseInt(value) })}>

                  <SelectTrigger><SelectValue placeholder="Select bathrooms" /></SelectTrigger>

                  <SelectContent>

                    {[1, 2, 3, 4, 5].map(num => (

                      <SelectItem key={num} value={num.toString()}>{num}</SelectItem>

                    ))}

                  </SelectContent>

                </Select>

              </div>

              <div>

                <Label>Area (sqm)</Label>

                <Input

                  type="number"

                  value={attributes.area || ''}

                  onChange={(e) => setAttributes({ ...attributes, area: e.target.value })}

                  placeholder="e.g., 120"

                />

              </div>

              <div>

                <Label>Furnished</Label>

                <Select value={attributes.furnished || ''} onValueChange={(value) => setAttributes({ ...attributes, furnished: value })}>

                  <SelectTrigger><SelectValue placeholder="Select option" /></SelectTrigger>

                  <SelectContent>

                    <SelectItem value="Furnished">Furnished</SelectItem>

                    <SelectItem value="Unfurnished">Unfurnished</SelectItem>

                    <SelectItem value="Semi-Furnished">Semi-Furnished</SelectItem>

                  </SelectContent>

                </Select>

              </div>

            </div>

          </div>

        )}

        {(selectedCategorySlug === 'electronics' || selectedCategorySlug === 'mobile-tablets') && (

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">

            <h3 className="font-semibold text-gray-900 mb-4">Product Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>

                <Label>Brand</Label>

                <Input

                  value={attributes.brand || ''}

                  onChange={(e) => setAttributes({ ...attributes, brand: e.target.value })}

                  placeholder="e.g., Apple, Samsung"

                />

              </div>

              <div>

                <Label>Warranty</Label>

                <Select value={attributes.warranty || ''} onValueChange={(value) => setAttributes({ ...attributes, warranty: value })}>

                  <SelectTrigger><SelectValue placeholder="Select warranty" /></SelectTrigger>

                  <SelectContent>

                    <SelectItem value="Yes">With Warranty</SelectItem>

                    <SelectItem value="No">No Warranty</SelectItem>

                  </SelectContent>

                </Select>

              </div>

            </div>

          </div>

        )}

        {selectedCategorySlug === 'fashion' && (

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">

            <h3 className="font-semibold text-gray-900 mb-4">Fashion Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>

                <Label>Gender</Label>

                <Select value={attributes.gender || ''} onValueChange={(value) => setAttributes({ ...attributes, gender: value })}>

                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>

                  <SelectContent>

                    <SelectItem value="Men">Men</SelectItem>

                    <SelectItem value="Women">Women</SelectItem>

                    <SelectItem value="Unisex">Unisex</SelectItem>

                  </SelectContent>

                </Select>

              </div>

              <div>

                <Label>Size</Label>

                <Select value={attributes.size || ''} onValueChange={(value) => setAttributes({ ...attributes, size: value })}>

                  <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>

                  <SelectContent>

                    <SelectItem value="XS">XS</SelectItem>

                    <SelectItem value="S">S</SelectItem>

                    <SelectItem value="M">M</SelectItem>

                    <SelectItem value="L">L</SelectItem>

                    <SelectItem value="XL">XL</SelectItem>

                    <SelectItem value="XXL">XXL</SelectItem>

                  </SelectContent>

                </Select>

              </div>

            </div>

          </div>

        )}

        {selectedCategorySlug === 'jobs' && (

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">

            <h3 className="font-semibold text-gray-900 mb-4">Job Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="md:col-span-2">

                <Label>Company Name *</Label>

                <Input
                  value={attributes.company_name || ''}
                  onChange={(e) => setAttributes({ ...attributes, company_name: e.target.value })}
                  placeholder="e.g., ABC Corporation"
                />

              </div>

              <div>

                <Label>Job Type *</Label>

                <Select value={attributes.job_type || ''} onValueChange={(value) => setAttributes({ ...attributes, job_type: value })}>

                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>

                  <SelectContent>

                    <SelectItem value="Full-time">Full-time</SelectItem>

                    <SelectItem value="Part-time">Part-time</SelectItem>

                    <SelectItem value="Contract">Contract</SelectItem>

                    <SelectItem value="Freelance">Freelance</SelectItem>

                    <SelectItem value="Internship">Internship</SelectItem>

                  </SelectContent>

                </Select>

              </div>

              <div>

                <Label>Experience Level</Label>

                <Select value={attributes.experience_level || ''} onValueChange={(value) => setAttributes({ ...attributes, experience_level: value })}>

                  <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>

                  <SelectContent>

                    <SelectItem value="Entry Level">Entry Level</SelectItem>

                    <SelectItem value="Mid Level">Mid Level</SelectItem>

                    <SelectItem value="Senior Level">Senior Level</SelectItem>

                    <SelectItem value="Executive">Executive</SelectItem>

                  </SelectContent>

                </Select>

              </div>

              <div>

                <Label>Work Type</Label>

                <Select value={attributes.work_type || ''} onValueChange={(value) => setAttributes({ ...attributes, work_type: value })}>

                  <SelectTrigger><SelectValue placeholder="Select work type" /></SelectTrigger>

                  <SelectContent>

                    <SelectItem value="Remote">Remote</SelectItem>

                    <SelectItem value="On-site">On-site</SelectItem>

                    <SelectItem value="Hybrid">Hybrid</SelectItem>

                  </SelectContent>

                </Select>

              </div>

              <div>

                <Label>Application Deadline</Label>

                <Input
                  type="date"
                  value={attributes.deadline || ''}
                  onChange={(e) => setAttributes({ ...attributes, deadline: e.target.value })}
                />

              </div>

            </div>

          </div>

        )}

        {selectedCategorySlug === 'pets' && (

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">

            <h3 className="font-semibold text-gray-900 mb-4">Pet Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>

                <Label>Pet Type *</Label>

                <Select value={attributes.pet_type || ''} onValueChange={(value) => setAttributes({ ...attributes, pet_type: value })}>

                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>

                  <SelectContent>

                    <SelectItem value="Dog">Dog</SelectItem>

                    <SelectItem value="Cat">Cat</SelectItem>

                    <SelectItem value="Bird">Bird</SelectItem>

                    <SelectItem value="Fish">Fish</SelectItem>

                    <SelectItem value="Rabbit">Rabbit</SelectItem>

                    <SelectItem value="Other">Other</SelectItem>

                  </SelectContent>

                </Select>

              </div>

              <div>

                <Label>Breed</Label>

                <Input
                  value={attributes.breed || ''}
                  onChange={(e) => setAttributes({ ...attributes, breed: e.target.value })}
                  placeholder="e.g., Labrador Retriever"
                />

              </div>

              <div>

                <Label>Age</Label>

                <Select value={attributes.pet_age || ''} onValueChange={(value) => setAttributes({ ...attributes, pet_age: value })}>

                  <SelectTrigger><SelectValue placeholder="Select age" /></SelectTrigger>

                  <SelectContent>

                    <SelectItem value="Puppy/Kitten">Puppy/Kitten</SelectItem>

                    <SelectItem value="Young">Young</SelectItem>

                    <SelectItem value="Adult">Adult</SelectItem>

                    <SelectItem value="Senior">Senior</SelectItem>

                  </SelectContent>

                </Select>

              </div>

              <div>

                <Label>Gender</Label>

                <Select value={attributes.pet_gender || ''} onValueChange={(value) => setAttributes({ ...attributes, pet_gender: value })}>

                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>

                  <SelectContent>

                    <SelectItem value="Male">Male</SelectItem>

                    <SelectItem value="Female">Female</SelectItem>

                  </SelectContent>

                </Select>

              </div>

              <div>

                <Label>Vaccinated</Label>

                <Select value={attributes.vaccinated || ''} onValueChange={(value) => setAttributes({ ...attributes, vaccinated: value })}>

                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>

                  <SelectContent>

                    <SelectItem value="Yes">Yes</SelectItem>

                    <SelectItem value="No">No</SelectItem>

                    <SelectItem value="Partial">Partially</SelectItem>

                  </SelectContent>

                </Select>

              </div>

            </div>

          </div>

        )}

        {selectedCategorySlug === 'services' && (

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">

            <h3 className="font-semibold text-gray-900 mb-4">Service Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>

                <Label>Service Type *</Label>

                <Select value={attributes.service_type || ''} onValueChange={(value) => setAttributes({ ...attributes, service_type: value })}>

                  <SelectTrigger><SelectValue placeholder="Select service type" /></SelectTrigger>

                  <SelectContent>

                    <SelectItem value="Cleaning">Cleaning</SelectItem>

                    <SelectItem value="Repair">Repair & Maintenance</SelectItem>

                    <SelectItem value="Tutoring">Tutoring & Education</SelectItem>

                    <SelectItem value="Photography">Photography</SelectItem>

                    <SelectItem value="Catering">Catering</SelectItem>

                    <SelectItem value="Consulting">Consulting</SelectItem>

                    <SelectItem value="IT">IT & Technology</SelectItem>

                    <SelectItem value="Legal">Legal</SelectItem>

                    <SelectItem value="Health">Health & Wellness</SelectItem>

                    <SelectItem value="Other">Other</SelectItem>

                  </SelectContent>

                </Select>

              </div>

              <div>

                <Label>Availability *</Label>

                <Select value={attributes.availability || ''} onValueChange={(value) => setAttributes({ ...attributes, availability: value })}>

                  <SelectTrigger><SelectValue placeholder="Select availability" /></SelectTrigger>

                  <SelectContent>

                    <SelectItem value="Weekdays">Weekdays</SelectItem>

                    <SelectItem value="Weekends">Weekends</SelectItem>

                    <SelectItem value="24/7">24/7</SelectItem>

                    <SelectItem value="By Appointment">By Appointment</SelectItem>

                  </SelectContent>

                </Select>

              </div>

              <div>

                <Label>Years of Experience</Label>

                <Input
                  type="number"
                  value={attributes.experience_years || ''}
                  onChange={(e) => setAttributes({ ...attributes, experience_years: e.target.value })}
                  placeholder="e.g., 5"
                  min="0"
                />

              </div>

              <div>

                <Label>Service Area</Label>

                <Input
                  value={attributes.service_area || ''}
                  onChange={(e) => setAttributes({ ...attributes, service_area: e.target.value })}
                  placeholder="e.g., City-wide, Specific neighborhoods"
                />

              </div>

            </div>

          </div>

        )}

        {selectedCategorySlug === 'home-furniture' && (

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">

            <h3 className="font-semibold text-gray-900 mb-4">Furniture Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>

                <Label>Furniture Type</Label>

                <Select value={attributes.furniture_type || ''} onValueChange={(value) => setAttributes({ ...attributes, furniture_type: value })}>

                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>

                  <SelectContent>

                    <SelectItem value="Sofa">Sofa</SelectItem>

                    <SelectItem value="Bed">Bed</SelectItem>

                    <SelectItem value="Table">Table</SelectItem>

                    <SelectItem value="Chair">Chair</SelectItem>

                    <SelectItem value="Cabinet">Cabinet</SelectItem>

                    <SelectItem value="Desk">Desk</SelectItem>

                    <SelectItem value="Appliance">Home Appliance</SelectItem>

                    <SelectItem value="Other">Other</SelectItem>

                  </SelectContent>

                </Select>

              </div>

              <div>

                <Label>Material</Label>

                <Input
                  value={attributes.material || ''}
                  onChange={(e) => setAttributes({ ...attributes, material: e.target.value })}
                  placeholder="e.g., Wood, Metal, Fabric"
                />

              </div>

              <div>

                <Label>Dimensions</Label>

                <Input
                  value={attributes.dimensions || ''}
                  onChange={(e) => setAttributes({ ...attributes, dimensions: e.target.value })}
                  placeholder="e.g., 200x100x80 cm"
                />

              </div>

              <div>

                <Label>Color</Label>

                <Input
                  value={attributes.color || ''}
                  onChange={(e) => setAttributes({ ...attributes, color: e.target.value })}
                  placeholder="e.g., Brown"
                />

              </div>

            </div>

          </div>

        )}

        {selectedCategorySlug === 'kids-babies' && (

          <div className="mt-6 p-4 bg-rose-50 rounded-lg border border-rose-200">

            <h3 className="font-semibold text-gray-900 mb-4">Kids & Babies Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>

                <Label>Item Type</Label>

                <Select value={attributes.item_type || ''} onValueChange={(value) => setAttributes({ ...attributes, item_type: value })}>

                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>

                  <SelectContent>

                    <SelectItem value="Clothing">Clothing</SelectItem>

                    <SelectItem value="Toys">Toys & Games</SelectItem>

                    <SelectItem value="Stroller">Stroller / Pram</SelectItem>

                    <SelectItem value="Car Seat">Car Seat</SelectItem>

                    <SelectItem value="Feeding">Feeding Supplies</SelectItem>

                    <SelectItem value="Furniture">Nursery Furniture</SelectItem>

                    <SelectItem value="Other">Other</SelectItem>

                  </SelectContent>

                </Select>

              </div>

              <div>

                <Label>Age Group</Label>

                <Select value={attributes.age_group || ''} onValueChange={(value) => setAttributes({ ...attributes, age_group: value })}>

                  <SelectTrigger><SelectValue placeholder="Select age group" /></SelectTrigger>

                  <SelectContent>

                    <SelectItem value="Newborn">Newborn (0-3 months)</SelectItem>

                    <SelectItem value="Baby">Baby (3-12 months)</SelectItem>

                    <SelectItem value="Toddler">Toddler (1-3 years)</SelectItem>

                    <SelectItem value="Preschool">Preschool (3-5 years)</SelectItem>

                    <SelectItem value="Kids">Kids (5-12 years)</SelectItem>

                    <SelectItem value="Teens">Teens (12+)</SelectItem>

                  </SelectContent>

                </Select>

              </div>

              <div>

                <Label>Gender</Label>

                <Select value={attributes.gender || ''} onValueChange={(value) => setAttributes({ ...attributes, gender: value })}>

                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>

                  <SelectContent>

                    <SelectItem value="Boy">Boy</SelectItem>

                    <SelectItem value="Girl">Girl</SelectItem>

                    <SelectItem value="Unisex">Unisex</SelectItem>

                  </SelectContent>

                </Select>

              </div>

              <div>

                <Label>Brand</Label>

                <Input
                  value={attributes.brand || ''}
                  onChange={(e) => setAttributes({ ...attributes, brand: e.target.value })}
                  placeholder="e.g., Graco, Fisher-Price"
                />

              </div>

            </div>

          </div>

        )}

        {selectedCategorySlug === 'hobbies' && (

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">

            <h3 className="font-semibold text-gray-900 mb-4">Hobby Item Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>

                <Label>Category</Label>

                <Select value={attributes.hobby_type || ''} onValueChange={(value) => setAttributes({ ...attributes, hobby_type: value })}>

                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>

                  <SelectContent>

                    <SelectItem value="Sports">Sports Equipment</SelectItem>

                    <SelectItem value="Musical">Musical Instruments</SelectItem>

                    <SelectItem value="Books">Books & Media</SelectItem>

                    <SelectItem value="Games">Games & Puzzles</SelectItem>

                    <SelectItem value="Art">Art & Crafts</SelectItem>

                    <SelectItem value="Outdoor">Outdoor & Camping</SelectItem>

                    <SelectItem value="Collectibles">Collectibles</SelectItem>

                    <SelectItem value="Other">Other</SelectItem>

                  </SelectContent>

                </Select>

              </div>

              <div>

                <Label>Brand</Label>

                <Input
                  value={attributes.brand || ''}
                  onChange={(e) => setAttributes({ ...attributes, brand: e.target.value })}
                  placeholder="e.g., Wilson, Yamaha"
                />

              </div>

            </div>

          </div>

        )}

        {selectedCategorySlug === 'businesses' && (

          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">

            <h3 className="font-semibold text-gray-900 mb-4">Business Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>

                <Label>Business Type *</Label>

                <Select value={attributes.business_type || ''} onValueChange={(value) => setAttributes({ ...attributes, business_type: value })}>

                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>

                  <SelectContent>

                    <SelectItem value="Restaurant">Restaurant / Food</SelectItem>

                    <SelectItem value="Retail">Retail Shop</SelectItem>

                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>

                    <SelectItem value="Service">Service Business</SelectItem>

                    <SelectItem value="Franchise">Franchise</SelectItem>

                    <SelectItem value="Online">Online Business</SelectItem>

                    <SelectItem value="Industrial">Industrial Equipment</SelectItem>

                    <SelectItem value="Other">Other</SelectItem>

                  </SelectContent>

                </Select>

              </div>

              <div>

                <Label>Years in Operation</Label>

                <Input
                  type="number"
                  value={attributes.years_operating || ''}
                  onChange={(e) => setAttributes({ ...attributes, years_operating: e.target.value })}
                  placeholder="e.g., 5"
                  min="0"
                />

              </div>

              <div>

                <Label>Number of Employees</Label>

                <Input
                  type="number"
                  value={attributes.employees || ''}
                  onChange={(e) => setAttributes({ ...attributes, employees: e.target.value })}
                  placeholder="e.g., 10"
                  min="0"
                />

              </div>

              <div>

                <Label>Revenue (Annual)</Label>

                <Input
                  value={attributes.annual_revenue || ''}
                  onChange={(e) => setAttributes({ ...attributes, annual_revenue: e.target.value })}
                  placeholder="e.g., $50,000"
                />

              </div>

            </div>

          </div>

        )}
    </>
  );
};

export default CategoryAttributeFields;
