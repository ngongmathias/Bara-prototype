import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  MapPin, 
  Clock, 
  User, 
  Image as ImageIcon,
  Search,
  Filter,
  Save,
  X,
  Eye,
  ExternalLink,
  Upload,
  Camera
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEvents, useEventCategories, useEventManagement, useCountries, useCitiesByCountry } from '@/hooks/useEvents';
import { uploadEventImage, EventsService } from '@/lib/eventsService';
import { Event as DatabaseEvent } from '@/lib/eventsService';
import { HashtagInput } from '@/components/ui/hashtag-input';
import { MultiHashtagInput } from '@/components/ui/multi-hashtag-input';

interface FormTicket {
  name: string;
  description: string;
  selected: boolean;
}

interface FormData {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  venue_name: string;
  venue_address: string;
  event_image_url: string;
  event_images: string[];
  venue_latitude: string;
  venue_longitude: string;
  category: string;
  organizer_name: string;
  organizer_handle: string;
  organizer_email: string;
  organizer_phone: string;
  capacity: string;
  website_url: string;
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  country_id: string;
  city_id: string;
  hashtags: string[];
  tickets: FormTicket[];
}

export const AdminEventsEnhanced = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<DatabaseEvent | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 50;
  
  const { toast } = useToast();
  const { events, loading, searchEvents } = useEvents();
  const { categories } = useEventCategories();
  const { createEvent, updateEvent, deleteEvent } = useEventManagement();
  const { countries, loading: countriesLoading } = useCountries();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    venue_name: '',
    venue_address: '',
    event_image_url: '',
    event_images: [],
    venue_latitude: '',
    venue_longitude: '',
    category: '',
    organizer_name: '',
    organizer_handle: '',
    organizer_email: '',
    organizer_phone: '',
    capacity: '',
    website_url: '',
    facebook_url: '',
    twitter_url: '',
    instagram_url: '',
    country_id: '',
    city_id: '',
    hashtags: [],
    tickets: [{ name: '', description: '', selected: true }]
  });

  // Cities hook - depends on formData.country_id
  const { cities, loading: citiesLoading, fetchCities } = useCitiesByCountry(formData.country_id);

  // Load events on component mount
  useEffect(() => {
    searchEvents({ 
      limit: 10000,
      include_all_statuses: true // Admin needs to see all events including past ones
    });
  }, [searchEvents]);

  // Handle country change
  const handleCountryChange = (countryId: string) => {
    setFormData(prev => ({ 
      ...prev, 
      country_id: countryId,
      city_id: '' // Reset city when country changes
    }));
  };

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (event.organizer_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const startIndex = (currentPage - 1) * eventsPerPage;
  const endIndex = startIndex + eventsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true);
    try {
      // For new events, we'll use a temporary ID, for existing events use the event ID
      const eventId = editingEvent?.id || 'temp';
      const imageUrl = await uploadEventImage(file, eventId);
      setFormData(prev => ({ 
        ...prev, 
        event_image_url: prev.event_image_url || imageUrl,
        event_images: [...prev.event_images, imageUrl]
      }));
      setImagePreview(URL.createObjectURL(file));
      toast({
        title: "Image uploaded successfully",
        description: "The event image has been uploaded to Supabase storage.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      files.forEach((file) => handleImageUpload(file));
    }
  };

  const setCoverImage = (url: string) => {
    setFormData(prev => ({ ...prev, event_image_url: url }));
  };

  const removeImage = (url: string) => {
    setFormData(prev => {
      const filtered = prev.event_images.filter(img => img !== url);
      const newCover = prev.event_image_url === url ? (filtered[0] || '') : prev.event_image_url;
      return { ...prev, event_images: filtered, event_image_url: newCover };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate capacity
    const capacityValue = parseInt(formData.capacity);
    if (formData.capacity && (isNaN(capacityValue) || capacityValue < 1 || capacityValue > 2147483647)) {
      toast({
        title: "Invalid Capacity",
        description: "Capacity must be between 1 and 2,147,483,647",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        start_date: formData.start_date,
        end_date: formData.end_date,
        venue_name: formData.venue_name,
        venue_address: formData.venue_address,
        event_image_url: formData.event_image_url,
        event_images: formData.event_images,
        venue_latitude: formData.venue_latitude ? Number(formData.venue_latitude) : null,
        venue_longitude: formData.venue_longitude ? Number(formData.venue_longitude) : null,
        latitude: formData.venue_latitude ? Number(formData.venue_latitude) : null,
        longitude: formData.venue_longitude ? Number(formData.venue_longitude) : null,
        category: formData.category,
        organizer_name: formData.organizer_name,
        organizer_handle: formData.organizer_handle,
        organizer_email: formData.organizer_email,
        organizer_phone: formData.organizer_phone,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        website_url: formData.website_url,
        facebook_url: formData.facebook_url,
        twitter_url: formData.twitter_url,
        instagram_url: formData.instagram_url,
        country_id: formData.country_id || null,
        city_id: formData.city_id || null,
        tags: formData.hashtags, // Add hashtags as tags
        is_public: true,
        event_status: 'upcoming' as const
      };

      if (editingEvent) {
        // If any URLs still point to temp/, finalize them into the event's folder
        const finalizedImages = await EventsService.finalizeEventImages(editingEvent.id, formData.event_images);
        const payload = { ...eventData, event_images: finalizedImages };
        await updateEvent(editingEvent.id, payload);
        toast({
          title: "Event updated successfully",
          description: "The event has been updated.",
        });
      } else {
        const created = await createEvent(eventData);
        // Move temp images to eventId folder after creation
        const finalizedImages = await EventsService.finalizeEventImages(created.id, formData.event_images);
        if (finalizedImages.length !== (formData.event_images?.length || 0)) {
          console.warn('Some images could not be finalized');
        }
        await updateEvent(created.id, { event_images: finalizedImages, event_image_url: finalizedImages[0] || created.event_image_url });
        toast({
          title: "Event created successfully",
          description: "The event has been added.",
        });
      }

      setIsDialogOpen(false);
      setEditingEvent(null);
      resetForm();
      searchEvents({ limit: 100 }); // Refresh events
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (event: DatabaseEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      start_date: event.start_date,
      end_date: event.end_date,
      venue_name: event.venue_name || '',
      venue_address: event.venue_address || '',
      event_image_url: event.event_image_url || '',
      event_images: event.event_images || [],
      venue_latitude: (event.venue_latitude ?? '').toString(),
      venue_longitude: (event.venue_longitude ?? '').toString(),
      category: event.category || '',
      organizer_name: event.organizer_name || '',
      organizer_handle: event.organizer_handle || '',
      organizer_email: event.organizer_email || '',
      organizer_phone: event.organizer_phone || '',
      capacity: event.capacity?.toString() || '',
      website_url: event.website_url || '',
      facebook_url: event.facebook_url || '',
      twitter_url: event.twitter_url || '',
      instagram_url: event.instagram_url || '',
      country_id: event.country_id || '',
      city_id: event.city_id || '',
      hashtags: event.tags || [], // Load existing hashtags
      tickets: event.tickets?.map(ticket => ({
        name: ticket.name,
        description: ticket.description || '',
        selected: ticket.is_default || false
      })) || [{ name: '', description: '', selected: true }]
    });
    setImagePreview(event.event_image_url || null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (eventId: string) => {
    try {
      await deleteEvent(eventId);
      toast({
        title: "Event deleted",
        description: "The event has been removed.",
      });
      searchEvents({ limit: 100 }); // Refresh events
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      venue_name: '',
      venue_address: '',
      event_image_url: '',
      event_images: [],
      venue_latitude: '',
      venue_longitude: '',
      category: '',
      organizer_name: '',
      organizer_handle: '',
      organizer_email: '',
      organizer_phone: '',
      capacity: '',
      website_url: '',
      facebook_url: '',
      twitter_url: '',
      instagram_url: '',
      country_id: '',
      city_id: '',
      hashtags: [], // Reset hashtags
      tickets: [{ name: '', description: '', selected: true }]
    });
    setImagePreview(null);
  };

  const addTicket = () => {
    setFormData(prev => ({
      ...prev,
      tickets: [...prev.tickets, { name: '', description: '', selected: false }]
    }));
  };

  const removeTicket = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tickets: prev.tickets.filter((_, i) => i !== index)
    }));
  };

  const updateTicket = (index: number, field: 'name' | 'description', value: string) => {
    setFormData(prev => ({
      ...prev,
      tickets: prev.tickets.map((ticket, i) => 
        i === index ? { ...ticket, [field]: value } : ticket
      )
    }));
  };

  const setSelectedTicket = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tickets: prev.tickets.map((ticket, i) => ({
        ...ticket,
        selected: i === index
      }))
    }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Events Management</h1>
            <p className="text-gray-600">Manage events and event details</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingEvent(null); resetForm(); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEvent ? 'Edit Event' : 'Add New Event'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Event Image Upload */}
                <div className="space-y-2">
                  <Label>Event Image</Label>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                        disabled={isUploadingImage}
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                      >
                        {isUploadingImage ? (
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                            <span className="text-xs mt-1">Uploading...</span>
                          </div>
                        ) : imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="flex flex-col items-center">
                            <Camera className="w-8 h-8 text-gray-400" />
                            <span className="text-xs mt-1">Upload Image</span>
                          </div>
                        )}
                      </label>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">
                        Upload one or more images for your event. Recommended size: 1200x630px
                      </p>
                      {formData.event_image_url && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ Image uploaded successfully
                        </p>
                      )}
                    </div>
                  </div>
                  {formData.event_images.length > 0 && (
                    <div className="mt-4">
                      <Label className="text-sm">Gallery</Label>
                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {formData.event_images.map((url) => (
                          <div key={url} className="relative group">
                            <img src={url} alt="event" className="w-full h-28 object-cover rounded" />
                            {formData.event_image_url === url && (
                              <span className="absolute top-1 left-1 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded">Cover</span>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 rounded">
                              <button
                                type="button"
                                className="text-white text-xs bg-black/60 px-2 py-1 rounded"
                                onClick={() => setCoverImage(url)}
                              >
                                Set cover
                              </button>
                              <button
                                type="button"
                                className="text-white text-xs bg-red-600/80 px-2 py-1 rounded"
                                onClick={() => removeImage(url)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter event title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.slug}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hashtags">Event Hashtags</Label>
                    <MultiHashtagInput
                      hashtags={formData.hashtags}
                      onHashtagsChange={(hashtags) => setFormData(prev => ({ ...prev, hashtags }))}
                      placeholder="Type hashtags separated by commas, spaces, or press Enter..."
                      maxHashtags={10}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter event description"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date & Time *</Label>
                    <Input
                      id="start_date"
                      type="datetime-local"
                      value={formData.start_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date & Time *</Label>
                    <Input
                      id="end_date"
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="venue_name">Venue Name *</Label>
                    <Input
                      id="venue_name"
                      value={formData.venue_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, venue_name: e.target.value }))}
                      placeholder="e.g., Kenyatta International Convention Centre"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="venue_address">Venue Address *</Label>
                    <Input
                      id="venue_address"
                      value={formData.venue_address}
                      onChange={(e) => setFormData(prev => ({ ...prev, venue_address: e.target.value }))}
                      placeholder="e.g., Harambee Ave, Nairobi, Kenya"
                      required
                    />
                  </div>
                </div>

                {/* Coordinates (optional but recommended for precise directions) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="venue_latitude">Venue Latitude</Label>
                    <Input
                      id="venue_latitude"
                      value={formData.venue_latitude}
                      onChange={(e) => setFormData(prev => ({ ...prev, venue_latitude: e.target.value }))}
                      placeholder="e.g., -1.2921"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="venue_longitude">Venue Longitude</Label>
                    <Input
                      id="venue_longitude"
                      value={formData.venue_longitude}
                      onChange={(e) => setFormData(prev => ({ ...prev, venue_longitude: e.target.value }))}
                      placeholder="e.g., 36.8219"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country_id">Country *</Label>
                    <Select
                      value={formData.country_id}
                      onValueChange={handleCountryChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countriesLoading ? (
                          <SelectItem value="loading" disabled>Loading countries...</SelectItem>
                        ) : (
                          countries.map((country) => (
                            <SelectItem key={country.id} value={country.id}>
                              {country.name} ({country.code})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city_id">City *</Label>
                    <Select
                      value={formData.city_id}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, city_id: value }))}
                      disabled={!formData.country_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={formData.country_id ? "Select city" : "Select country first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {citiesLoading ? (
                          <SelectItem value="loading" disabled>Loading cities...</SelectItem>
                        ) : cities.length > 0 ? (
                          cities.map((city) => (
                            <SelectItem key={city.id} value={city.id}>
                              {city.name}
                            </SelectItem>
                          ))
                        ) : formData.country_id ? (
                          <SelectItem value="no-cities" disabled>No cities found</SelectItem>
                        ) : (
                          <SelectItem value="select-country" disabled>Select a country first</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organizer_name">Organizer Name *</Label>
                    <Input
                      id="organizer_name"
                      value={formData.organizer_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, organizer_name: e.target.value }))}
                      placeholder="e.g., Africa Tech Network"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organizer_handle">Organizer Handle *</Label>
                    <Input
                      id="organizer_handle"
                      value={formData.organizer_handle}
                      onChange={(e) => setFormData(prev => ({ ...prev, organizer_handle: e.target.value }))}
                      placeholder="e.g., @africatech"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organizer_email">Organizer Email</Label>
                    <Input
                      id="organizer_email"
                      type="email"
                      value={formData.organizer_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, organizer_email: e.target.value }))}
                      placeholder="organizer@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organizer_phone">Organizer Phone</Label>
                    <Input
                      id="organizer_phone"
                      type="tel"
                      value={formData.organizer_phone}
                      onChange={(e) => {
                        // Only allow numbers, +, -, (, ), and spaces
                        const value = e.target.value.replace(/[^0-9+\-() ]/g, '');
                        setFormData(prev => ({ ...prev, organizer_phone: value }));
                      }}
                      placeholder="+1234567890"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      max="2147483647"
                      value={formData.capacity}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow numbers and limit to reasonable capacity
                        if (value === '' || (Number(value) >= 1 && Number(value) <= 2147483647)) {
                          setFormData(prev => ({ ...prev, capacity: value }));
                        }
                      }}
                      placeholder="1000"
                    />
                    <p className="text-xs text-gray-500">Maximum capacity: 2,147,483,647</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website_url">Website URL</Label>
                    <Input
                      id="website_url"
                      type="url"
                      value={formData.website_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                {/* Social Media Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebook_url">Facebook URL</Label>
                    <Input
                      id="facebook_url"
                      type="url"
                      value={formData.facebook_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, facebook_url: e.target.value }))}
                      placeholder="https://facebook.com/event"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter_url">Twitter URL</Label>
                    <Input
                      id="twitter_url"
                      type="url"
                      value={formData.twitter_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, twitter_url: e.target.value }))}
                      placeholder="https://twitter.com/event"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram_url">Instagram URL</Label>
                    <Input
                      id="instagram_url"
                      type="url"
                      value={formData.instagram_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, instagram_url: e.target.value }))}
                      placeholder="https://instagram.com/event"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="min-w-[160px]">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Events ({filteredEvents.length} {filteredEvents.length !== events.length ? `of ${events.length} total` : ''})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading events...</p>
              </div>
            ) : filteredEvents.length > 0 ? (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredEvents.length)} of {filteredEvents.length} events
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Venue</TableHead>
                      <TableHead>Organizer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <img
                            src={event.event_image_url || '/placeholder-event.jpg'}
                            alt={event.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <div className="font-medium">{event.title}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {event.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{event.category_name || event.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(event.start_date).toLocaleDateString()}</div>
                          <div className="text-gray-500">
                            {new Date(event.start_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                            {new Date(event.end_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{event.country_name || 'N/A'}</div>
                          <div className="text-gray-500">{event.country_code || ''}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{event.city_name || 'N/A'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{event.venue_name}</div>
                          <div className="text-gray-500">{event.venue_address}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{event.organizer_name}</div>
                          <div className="text-gray-500">{event.organizer_handle}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={event.event_status === 'upcoming' ? 'default' : 
                                  event.event_status === 'ongoing' ? 'secondary' : 
                                  event.event_status === 'completed' ? 'outline' : 'destructive'}
                        >
                          {event.event_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{event.capacity || 'Unlimited'}</div>
                          <div className="text-gray-500">
                            {event.registration_count || 0} registered
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => window.open(`/events/${event.id}`, '_blank')}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(event)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(event.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
              </>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-500">Create your first event to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};
