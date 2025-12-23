import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ShoppingBag,
  MapPin,
  Eye,
  Upload,
  X,
  Image as ImageIcon,
  DollarSign
} from "lucide-react";
import { getAdminDb, supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface MarketplaceListing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category_id: string;
  category_name?: string;
  country: string;
  city: string | null;
  condition: 'new' | 'used' | 'refurbished';
  seller_name: string;
  seller_phone: string;
  seller_email: string | null;
  seller_whatsapp: string | null;
  images?: Array<{ id: string; image_url: string; display_order: number }>;
  status: 'active' | 'sold' | 'inactive';
  view_count: number;
  created_at: string;
  updated_at: string;
}

interface MarketplaceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

interface Country {
  id: string;
  name: string;
}

const listingFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().min(0, "Price must be positive"),
  category_id: z.string().min(1, "Category is required"),
  country: z.string().min(1, "Country is required"),
  city: z.string().optional(),
  condition: z.enum(['new', 'used', 'refurbished']),
  seller_name: z.string().min(1, "Seller name is required"),
  seller_phone: z.string().min(1, "Phone number is required"),
  seller_email: z.string().email("Invalid email").optional().or(z.literal("")),
  seller_whatsapp: z.string().optional(),
  status: z.enum(['active', 'sold', 'inactive']).default('active')
});

type ListingFormData = z.infer<typeof listingFormSchema>;

export const AdminMarketplaceListings = () => {
  const adminDb = getAdminDb();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<MarketplaceListing | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<Array<{ id: string; image_url: string; display_order: number }>>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      status: 'active',
      condition: 'used'
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [listingsRes, categoriesRes, countriesRes] = await Promise.all([
        adminDb.from('marketplace_listings')
          .select(`
            *,
            marketplace_categories!inner(name),
            marketplace_listing_images(id, image_url, display_order)
          `)
          .order('created_at', { ascending: false }),
        adminDb.from('marketplace_categories').select('*').order('name'),
        adminDb.from('countries').select('id, name').order('name')
      ]);

      if (listingsRes.error) throw listingsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;
      if (countriesRes.error) throw countriesRes.error;

      const formattedListings = (listingsRes.data || []).map((listing: any) => ({
        ...listing,
        category_name: listing.marketplace_categories?.name,
        images: listing.marketplace_listing_images || []
      }));

      setListings(formattedListings);
      setCategories(categoriesRes.data || []);
      setCountries(countriesRes.data || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load marketplace data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length + existingImages.length > 10) {
      toast({
        title: "Too many images",
        description: "Maximum 10 images per listing",
        variant: "destructive"
      });
      return;
    }

    setImageFiles(prev => [...prev, ...files]);
    
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeNewImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageId: string) => {
    setDeletedImageIds(prev => [...prev, imageId]);
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
  };

  const uploadListingImages = async (listingId: string) => {
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${listingId}_${Date.now()}_${i}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('marketplace-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('marketplace-images')
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl);

      await adminDb.from('marketplace_listing_images').insert({
        listing_id: listingId,
        image_url: publicUrl,
        display_order: existingImages.length + i
      });
    }

    return uploadedUrls;
  };

  const deleteListingImages = async () => {
    for (const imageId of deletedImageIds) {
      const image = listings
        .find(l => l.id === editingListing?.id)
        ?.images?.find(img => img.id === imageId);
      
      if (image) {
        const fileName = image.image_url.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('marketplace-images')
            .remove([fileName]);
        }
        
        await adminDb.from('marketplace_listing_images').delete().eq('id', imageId);
      }
    }
  };

  const onSubmit = async (data: ListingFormData) => {
    try {
      if (editingListing) {
        const { error } = await adminDb
          .from('marketplace_listings')
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingListing.id);

        if (error) throw error;

        await deleteListingImages();
        await uploadListingImages(editingListing.id);

        toast({
          title: "Success",
          description: "Listing updated successfully"
        });
      } else {
        const { data: newListing, error } = await adminDb
          .from('marketplace_listings')
          .insert([data])
          .select()
          .single();

        if (error) throw error;

        if (newListing) {
          await uploadListingImages(newListing.id);
        }

        toast({
          title: "Success",
          description: "Listing created successfully"
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Error saving listing:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save listing",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (listing: MarketplaceListing) => {
    setEditingListing(listing);
    setExistingImages(listing.images || []);
    setDeletedImageIds([]);
    setImageFiles([]);
    setImagePreviewUrls([]);
    
    Object.keys(listing).forEach((key) => {
      if (key in listingFormSchema.shape) {
        setValue(key as keyof ListingFormData, (listing as any)[key]);
      }
    });
    
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    try {
      const listing = listings.find(l => l.id === id);
      if (listing?.images) {
        for (const image of listing.images) {
          const fileName = image.image_url.split('/').pop();
          if (fileName) {
            await supabase.storage
              .from('marketplace-images')
              .remove([fileName]);
          }
        }
      }

      await adminDb.from('marketplace_listing_images').delete().eq('listing_id', id);
      
      const { error } = await adminDb
        .from('marketplace_listings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Listing deleted successfully"
      });
      fetchData();
    } catch (error: any) {
      console.error('Error deleting listing:', error);
      toast({
        title: "Error",
        description: "Failed to delete listing",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    reset();
    setEditingListing(null);
    setImageFiles([]);
    setImagePreviewUrls([]);
    setExistingImages([]);
    setDeletedImageIds([]);
    imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || listing.category_id === selectedCategory;
    const matchesCountry = selectedCountry === "all" || listing.country === selectedCountry;
    return matchesSearch && matchesCategory && matchesCountry;
  });

  const getConditionBadge = (condition: string) => {
    const colors = {
      new: 'bg-green-100 text-green-800',
      used: 'bg-blue-100 text-blue-800',
      refurbished: 'bg-purple-100 text-purple-800'
    };
    return colors[condition as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      sold: 'bg-gray-100 text-gray-800',
      inactive: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-comfortaa font-bold text-gray-900">Marketplace Listings</h1>
            <p className="text-gray-600 mt-1">Manage marketplace listings and products</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-[#e64600] hover:bg-[#cc3d00]">
                <Plus className="w-4 h-4 mr-2" />
                Add Listing
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingListing ? 'Edit Listing' : 'Add New Listing'}</DialogTitle>
                <DialogDescription>
                  {editingListing ? 'Update listing details' : 'Create a new marketplace listing'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input id="title" {...register("title")} />
                    {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea id="description" {...register("description")} rows={4} />
                    {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="price">Price *</Label>
                    <Input 
                      id="price" 
                      type="number" 
                      step="0.01"
                      {...register("price", { valueAsNumber: true })} 
                    />
                    {errors.price && <p className="text-sm text-red-600">{errors.price.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="condition">Condition *</Label>
                    <Select onValueChange={(value) => setValue("condition", value as any)} defaultValue={watch("condition")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="used">Used</SelectItem>
                        <SelectItem value="refurbished">Refurbished</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.condition && <p className="text-sm text-red-600">{errors.condition.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="category_id">Category *</Label>
                    <Select onValueChange={(value) => setValue("category_id", value)} defaultValue={watch("category_id")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category_id && <p className="text-sm text-red-600">{errors.category_id.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Select onValueChange={(value) => setValue("country", value)} defaultValue={watch("country")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map(country => (
                          <SelectItem key={country.id} value={country.name}>{country.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.country && <p className="text-sm text-red-600">{errors.country.message}</p>}
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" {...register("city")} />
                  </div>

                  <div>
                    <Label htmlFor="seller_name">Seller Name *</Label>
                    <Input id="seller_name" {...register("seller_name")} />
                    {errors.seller_name && <p className="text-sm text-red-600">{errors.seller_name.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="seller_phone">Seller Phone *</Label>
                    <Input id="seller_phone" {...register("seller_phone")} />
                    {errors.seller_phone && <p className="text-sm text-red-600">{errors.seller_phone.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="seller_email">Seller Email</Label>
                    <Input id="seller_email" type="email" {...register("seller_email")} />
                    {errors.seller_email && <p className="text-sm text-red-600">{errors.seller_email.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="seller_whatsapp">Seller WhatsApp</Label>
                    <Input id="seller_whatsapp" {...register("seller_whatsapp")} />
                  </div>

                  <div>
                    <Label htmlFor="status">Status *</Label>
                    <Select onValueChange={(value) => setValue("status", value as any)} defaultValue={watch("status")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Label>Images (Max 10)</Label>
                    <div className="mt-2 space-y-4">
                      {existingImages.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Existing Images:</p>
                          <div className="grid grid-cols-4 gap-2">
                            {existingImages.map((img) => (
                              <div key={img.id} className="relative group">
                                <img src={img.image_url} alt="" className="w-full h-24 object-cover rounded" />
                                <button
                                  type="button"
                                  onClick={() => removeExistingImage(img.id)}
                                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {imagePreviewUrls.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">New Images:</p>
                          <div className="grid grid-cols-4 gap-2">
                            {imagePreviewUrls.map((url, idx) => (
                              <div key={idx} className="relative group">
                                <img src={url} alt="" className="w-full h-24 object-cover rounded" />
                                <button
                                  type="button"
                                  onClick={() => removeNewImage(idx)}
                                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {(existingImages.length + imageFiles.length) < 10 && (
                        <div>
                          <Input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageSelect}
                            className="cursor-pointer"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#e64600] hover:bg-[#cc3d00]">
                    {editingListing ? 'Update' : 'Create'} Listing
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filter Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search listings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map(country => (
                    <SelectItem key={country.id} value={country.name}>{country.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Listings ({filteredListings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredListings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No listings found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredListings.map((listing) => (
                      <tr key={listing.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {listing.images && listing.images.length > 0 ? (
                            <img 
                              src={listing.images[0].image_url} 
                              alt={listing.title}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{listing.title}</div>
                          <div className="text-sm text-gray-500">{listing.seller_name}</div>
                        </td>
                        <td className="px-4 py-3 font-medium">${listing.price.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm">{listing.category_name}</td>
                        <td className="px-4 py-3 text-sm">
                          <div>{listing.country}</div>
                          {listing.city && <div className="text-gray-500">{listing.city}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={getConditionBadge(listing.condition)}>
                            {listing.condition}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={getStatusBadge(listing.status)}>
                            {listing.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4 text-gray-400" />
                            {listing.view_count}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(listing)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(listing.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};
