import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Save,
  X,
  Eye,
  Upload,
  Images,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEvents, useEventCategories, useEventManagement, useCountries, useCitiesByCountry } from '@/hooks/useEvents';
import { uploadEventImage, EventsService, createEvent, updateEvent } from '@/lib/eventsService';
import { Event as DatabaseEvent } from '@/lib/eventsService';
import { MultiHashtagInput } from '@/components/ui/multi-hashtag-input';
import { EventGalleryUpload } from '@/components/EventGalleryUpload';
import { useUser } from '@clerk/clerk-react';

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
  is_free: boolean;
  entry_fee: string;
  currency: string;
  payment_instructions: string;
  payment_contact: string;
}

export const UserEventsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<DatabaseEvent | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [galleryUploadOpen, setGalleryUploadOpen] = useState(false);
  const [selectedEventForGallery, setSelectedEventForGallery] = useState<DatabaseEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  const { toast } = useToast();
  const { events, loading, searchEvents } = useEvents();
  const { categories } = useEventCategories();
  const { createEvent, updateEvent, deleteEvent } = useEventManagement();
  const { countries, loading: countriesLoading } = useCountries();
  const { user } = useUser();

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
    organizer_name: user?.fullName || '',
    organizer_handle: '',
    organizer_email: user?.primaryEmailAddress?.emailAddress || '',
    organizer_phone: '',
    capacity: '',
    website_url: '',
    facebook_url: '',
    twitter_url: '',
    instagram_url: '',
    country_id: '',
    city_id: '',
    hashtags: [],
    tickets: [],
    is_free: false,
    entry_fee: '',
    currency: 'USD',
    payment_instructions: '',
    payment_contact: ''
  });

  // Cities hook - only fetch when country is selected
  const { cities, loading: citiesLoading } = useCitiesByCountry(formData.country_id || '');

  // Filter events to only show user's events
  // Match by created_by_user_id, created_by_email, or organizer_email
  // This ensures events created by the user AND events assigned by admin (via organizer_email) show up
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase();

  // DEBUG: Log to trace filtering issue
  console.log('🔍 [UserEventsPage] User ID:', user?.id, '| User Email:', userEmail);
  console.log('🔍 [UserEventsPage] Total events from search:', events.length);
  if (events.length > 0) {
    console.log('🔍 [UserEventsPage] Sample event fields:', events.slice(0, 3).map(e => ({
      title: e.title,
      created_by_user_id: e.created_by_user_id,
      created_by_email: e.created_by_email,
      organizer_email: e.organizer_email,
    })));
  }

  const userEvents = events.filter(event =>
    event.created_by_user_id === user?.id ||
    (userEmail && event.created_by_email?.toLowerCase() === userEmail) ||
    (userEmail && event.organizer_email?.toLowerCase() === userEmail)
  );

  console.log('🔍 [UserEventsPage] Matched user events:', userEvents.length);

  // Apply search and category filters to user's events
  const filteredEvents = userEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    searchEvents({ limit: 100, include_all_statuses: true, include_private: true });
  }, [searchEvents]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        organizer_name: user.fullName || '',
        organizer_email: user.primaryEmailAddress?.emailAddress || ''
      }));
    }
  }, [user]);

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
      organizer_name: user?.fullName || '',
      organizer_handle: '',
      organizer_email: user?.primaryEmailAddress?.emailAddress || '',
      organizer_phone: '',
      capacity: '',
      website_url: '',
      facebook_url: '',
      twitter_url: '',
      instagram_url: '',
      country_id: '',
      city_id: '',
      hashtags: [],
      tickets: [],
      is_free: false,
      entry_fee: '',
      currency: 'USD',
      payment_instructions: '',
      payment_contact: ''
    });
    setEditingEvent(null);
    setImagePreview(null);
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleHashtagsChange = (hashtags: string[]) => {
    setFormData(prev => ({ ...prev, hashtags }));
  };

  const handleEdit = (event: DatabaseEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || '',
      description: event.description || '',
      start_date: event.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : '',
      end_date: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '',
      venue_name: event.venue_name || '',
      venue_address: event.venue_address || '',
      event_image_url: event.event_image_url || '',
      event_images: event.event_images || [],
      venue_latitude: event.venue_latitude?.toString() || '',
      venue_longitude: event.venue_longitude?.toString() || '',
      category: event.category || '',
      organizer_name: event.organizer_name || user?.fullName || '',
      organizer_handle: event.organizer_handle || '',
      organizer_email: event.organizer_email || user?.primaryEmailAddress?.emailAddress || '',
      organizer_phone: event.organizer_phone || '',
      capacity: event.capacity?.toString() || '',
      website_url: event.website_url || '',
      facebook_url: event.facebook_url || '',
      twitter_url: event.twitter_url || '',
      instagram_url: event.instagram_url || '',
      country_id: event.country_id || '',
      city_id: event.city_id || '',
      hashtags: event.tags || [],
      tickets: [],
      is_free: event.is_free || false,
      entry_fee: event.entry_fee?.toString() || '',
      currency: event.currency || 'USD',
      payment_instructions: (event as any).payment_instructions || '',
      payment_contact: (event as any).payment_contact || ''
    });
    setImagePreview(event.event_image_url || null);
    setIsDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    try {
      await deleteEvent(eventToDelete);
      toast({
        title: 'Event deleted',
        description: 'The event has been successfully deleted.',
      });
      // Refresh events list
      searchEvents({ limit: 100 });
    } catch (error) {
      console.error(error);
    } finally {
      setEventToDelete(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to create events.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Exclude tickets from eventData as it has incompatible types
      const eventData = {
        title: formData.title,
        description: formData.description,
        start_date: formData.start_date,
        end_date: formData.end_date,
        venue_name: formData.venue_name,
        venue_address: formData.venue_address,
        venue_latitude: formData.venue_latitude ? parseFloat(formData.venue_latitude) : null,
        venue_longitude: formData.venue_longitude ? parseFloat(formData.venue_longitude) : null,
        category: formData.category,
        organizer_name: formData.organizer_name,
        organizer_handle: formData.organizer_handle,
        organizer_email: formData.organizer_email,
        organizer_phone: formData.organizer_phone,
        event_image_url: formData.event_image_url,
        event_images: formData.event_images, // Assuming this maps to gallery_images or similar
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        website_url: formData.website_url,
        facebook_url: formData.facebook_url,
        twitter_url: formData.twitter_url,
        instagram_url: formData.instagram_url,
        country_id: formData.country_id,
        city_id: formData.city_id,
        tags: formData.hashtags, // Mapping hashtags to tags
        is_free: formData.is_free,
        entry_fee: formData.entry_fee ? parseFloat(formData.entry_fee) : null,
        currency: formData.currency,
        payment_instructions: formData.payment_instructions,
        payment_contact: formData.payment_contact,
        created_by_user_id: user.id,
        created_by_email: user.primaryEmailAddress?.emailAddress || '',
        created_by_name: user.fullName || '',
        event_status: 'upcoming',
        is_public: true,
        // Tickets are handled separately or need a specific structure
        // For now, assuming tickets are not directly part of the main event object for create/update
        // If tickets need to be created/updated with the event, the API and types need to reflect that.
      } as DatabaseEvent; // Type cast to DatabaseEvent

      if (editingEvent) {
        await updateEvent(editingEvent.id, eventData);
        // Save ticket types
        if (formData.tickets.length > 0) {
          try {
            const ticketRecords = formData.tickets
              .filter(t => t.name.trim())
              .map(t => ({
                name: t.name,
                description: t.description || '',
                is_default: false,
                is_active: true,
                registered_quantity: 0,
              }));
            if (ticketRecords.length > 0) {
              // Delete old tickets first, then create new ones
              const { supabase } = await import('@/lib/supabase');
              await supabase.from('event_tickets').delete().eq('event_id', editingEvent.id);
              await EventsService.createEventTickets(editingEvent.id, ticketRecords);
            }
          } catch (ticketError) {
            console.warn('Failed to update tickets:', ticketError);
          }
        }
        toast({
          title: 'Event updated',
          description: 'Your event has been successfully updated.',
        });
      } else {
        const created = await createEvent(eventData);
        // Save ticket types for the new event
        if (formData.tickets.length > 0 && created?.id) {
          try {
            const ticketRecords = formData.tickets
              .filter(t => t.name.trim())
              .map(t => ({
                name: t.name,
                description: t.description || '',
                is_default: false,
                is_active: true,
                registered_quantity: 0,
              }));
            if (ticketRecords.length > 0) {
              await EventsService.createEventTickets(created.id, ticketRecords);
            }
          } catch (ticketError) {
            console.warn('Failed to create tickets:', ticketError);
          }
        }
        toast({
          title: 'Event created',
          description: 'Your event has been successfully created.',
        });
      }

      setIsDialogOpen(false);
      resetForm();
      // Refresh events list
      searchEvents({ limit: 100, include_all_statuses: true, include_private: true });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save event. Please try again.',
        variant: 'destructive',
      });
      console.error('Error saving event:', error);
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true);
    try {
      // Generate a temporary event ID for image upload
      const tempEventId = editingEvent?.id || 'temp-' + Date.now();
      const imageUrl = await uploadEventImage(file, tempEventId);
      setFormData(prev => ({ ...prev, event_image_url: imageUrl }));
      setImagePreview(imageUrl);
      toast({
        title: 'Image uploaded',
        description: 'Event image has been uploaded successfully.',
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
          <p className="text-gray-600">Create and manage your events</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleInputChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
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

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      required
                    />
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_date">Start Date & Time *</Label>
                      <Input
                        id="start_date"
                        type="datetime-local"
                        value={formData.start_date}
                        onChange={(e) => handleInputChange('start_date', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_date">End Date & Time *</Label>
                      <Input
                        id="end_date"
                        type="datetime-local"
                        value={formData.end_date}
                        onChange={(e) => handleInputChange('end_date', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="venue_name">Venue Name *</Label>
                    <Input
                      id="venue_name"
                      value={formData.venue_name}
                      onChange={(e) => handleInputChange('venue_name', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="venue_address">Venue Address *</Label>
                    <Textarea
                      id="venue_address"
                      value={formData.venue_address}
                      onChange={(e) => handleInputChange('venue_address', e.target.value)}
                      rows={2}
                      required
                    />
                  </div>

                  {/* Country and City */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country_id">Country *</Label>
                      <Select
                        value={formData.country_id}
                        onValueChange={(value) => handleInputChange('country_id', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.id} value={country.id}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="city_id">City *</Label>
                      <Select
                        value={formData.city_id}
                        onValueChange={(value) => handleInputChange('city_id', value)}
                        disabled={!formData.country_id || citiesLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city.id} value={city.id}>
                              {city.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Coordinates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="venue_latitude">Latitude</Label>
                      <Input
                        id="venue_latitude"
                        type="number"
                        step="any"
                        value={formData.venue_latitude}
                        onChange={(e) => handleInputChange('venue_latitude', e.target.value)}
                        placeholder="e.g., 40.7128"
                      />
                    </div>
                    <div>
                      <Label htmlFor="venue_longitude">Longitude</Label>
                      <Input
                        id="venue_longitude"
                        type="number"
                        step="any"
                        value={formData.venue_longitude}
                        onChange={(e) => handleInputChange('venue_longitude', e.target.value)}
                        placeholder="e.g., -74.0060"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Organizer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Organizer Information</h3>
                  <div>
                    <Label htmlFor="organizer_name">Organizer Name *</Label>
                    <Input
                      id="organizer_name"
                      value={formData.organizer_name}
                      readOnly
                      className="bg-gray-50 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Auto-filled from your profile</p>
                  </div>
                  <div>
                    <Label htmlFor="organizer_email">Email *</Label>
                    <Input
                      id="organizer_email"
                      type="email"
                      value={formData.organizer_email}
                      readOnly
                      className="bg-gray-50 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Auto-filled from your account email</p>
                  </div>
                  <div>
                    <Label htmlFor="organizer_handle">Social Handle</Label>
                    <Input
                      id="organizer_handle"
                      value={formData.organizer_handle}
                      onChange={(e) => handleInputChange('organizer_handle', e.target.value)}
                      placeholder="@yourhandle"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Additional Details</h3>
                  <div>
                    <Label htmlFor="organizer_phone">Phone</Label>
                    <Input
                      id="organizer_phone"
                      value={formData.organizer_phone}
                      onChange={(e) => handleInputChange('organizer_phone', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => handleInputChange('capacity', e.target.value)}
                      placeholder="Maximum attendees"
                    />
                  </div>
                </div>
              </div>

              {/* Hashtags */}
              <div>
                <Label>Event Hashtags</Label>
                <MultiHashtagInput
                  hashtags={formData.hashtags}
                  onHashtagsChange={handleHashtagsChange}
                  placeholder="Add hashtags to help people discover your event..."
                />
              </div>

              {/* Image Upload */}
              <div>
                <Label>Event Image</Label>
                <div className="mt-2 flex items-center space-x-4">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Event preview"
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('image-upload')?.click()}
                      disabled={isUploadingImage}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Event Gallery (Multi-Image Upload) */}
              <div>
                <Label>Event Gallery</Label>
                <p className="text-xs text-gray-500 mb-2">Upload additional images for your event gallery</p>
                {formData.event_images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.event_images.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16">
                        <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover rounded-md border" />
                        <button
                          type="button"
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            event_images: prev.event_images.filter((_, i) => i !== idx)
                          }))}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setGalleryUploadOpen(true)}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {formData.event_images.length > 0 ? `Manage Gallery (${formData.event_images.length} images)` : 'Add Gallery Images'}
                </Button>
                <EventGalleryUpload
                  isOpen={galleryUploadOpen}
                  onClose={() => setGalleryUploadOpen(false)}
                  eventId={editingEvent?.id || 'temp-' + Date.now()}
                  eventTitle={formData.title || 'New Event'}
                  existingImages={formData.event_images}
                  onUploadComplete={() => {
                    setGalleryUploadOpen(false);
                    // Refresh gallery images from the event if editing
                    if (editingEvent?.event_images) {
                      setFormData(prev => ({ ...prev, event_images: editingEvent.event_images || [] }));
                    }
                  }}
                />
              </div>

              {/* Pricing & Payment Instructions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Pricing & Payment</h3>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="is_free"
                    checked={formData.is_free}
                    onChange={(e) => handleInputChange('is_free', e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300"
                  />
                  <Label htmlFor="is_free" className="cursor-pointer">This is a free event</Label>
                </div>

                {!formData.is_free && (
                  <div className="space-y-4 pl-8 border-l-2 border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="entry_fee">Entry Fee *</Label>
                        <Input
                          id="entry_fee"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.entry_fee}
                          onChange={(e) => handleInputChange('entry_fee', e.target.value)}
                          placeholder="e.g., 5000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="currency">Currency</Label>
                        <Select
                          value={formData.currency}
                          onValueChange={(value) => handleInputChange('currency', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                            <SelectItem value="XAF">XAF (CFA)</SelectItem>
                            <SelectItem value="XOF">XOF (CFA)</SelectItem>
                            <SelectItem value="NGN">NGN (₦)</SelectItem>
                            <SelectItem value="KES">KES (KSh)</SelectItem>
                            <SelectItem value="GHS">GHS (GH₵)</SelectItem>
                            <SelectItem value="ZAR">ZAR (R)</SelectItem>
                            <SelectItem value="TZS">TZS (TSh)</SelectItem>
                            <SelectItem value="UGX">UGX (USh)</SelectItem>
                            <SelectItem value="RWF">RWF (RF)</SelectItem>
                            <SelectItem value="ETB">ETB (Br)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="payment_instructions">Payment Instructions</Label>
                      <Textarea
                        id="payment_instructions"
                        value={formData.payment_instructions}
                        onChange={(e) => handleInputChange('payment_instructions', e.target.value)}
                        rows={3}
                        placeholder="How should attendees pay? E.g.:
Momo: 6XX XXX XXX (Name)
Bank: Account #1234 at XYZ Bank
Orange Money: *144*1*XXXX#"
                      />
                      <p className="text-xs text-gray-500 mt-1">These instructions will be shown to ticket buyers.</p>
                    </div>
                    <div>
                      <Label htmlFor="payment_contact">Payment Contact (Phone/WhatsApp)</Label>
                      <Input
                        id="payment_contact"
                        value={formData.payment_contact}
                        onChange={(e) => handleInputChange('payment_contact', e.target.value)}
                        placeholder="e.g., +237 6XX XXX XXX"
                      />
                    </div>
                  </div>
                )}

                {/* Ticket Types */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-base">Ticket Types</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          tickets: [...prev.tickets, { name: '', description: '', selected: true }]
                        }));
                      }}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Add Ticket Type
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Add different ticket tiers (e.g., Regular, VIP, Early Bird)</p>
                  {formData.tickets.length === 0 && (
                    <p className="text-sm text-gray-400 italic">No ticket types added yet. Click "Add Ticket Type" to create tiers.</p>
                  )}
                  {formData.tickets.map((ticket, index) => (
                    <div key={index} className="flex gap-3 items-start mb-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Ticket name (e.g., VIP, Regular, Early Bird)"
                          value={ticket.name}
                          onChange={(e) => {
                            const updated = [...formData.tickets];
                            updated[index] = { ...updated[index], name: e.target.value };
                            setFormData(prev => ({ ...prev, tickets: updated }));
                          }}
                        />
                        <Input
                          placeholder="Description (optional)"
                          value={ticket.description}
                          onChange={(e) => {
                            const updated = [...formData.tickets];
                            updated[index] = { ...updated[index], description: e.target.value };
                            setFormData(prev => ({ ...prev, tickets: updated }));
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 mt-1"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            tickets: prev.tickets.filter((_, i) => i !== index)
                          }));
                        }}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Media Links */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Social Media & Website</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="website_url">Website URL</Label>
                    <Input
                      id="website_url"
                      type="url"
                      value={formData.website_url}
                      onChange={(e) => handleInputChange('website_url', e.target.value)}
                      placeholder="https://your-website.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="facebook_url">Facebook URL</Label>
                    <Input
                      id="facebook_url"
                      type="url"
                      value={formData.facebook_url}
                      onChange={(e) => handleInputChange('facebook_url', e.target.value)}
                      placeholder="https://facebook.com/your-page"
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitter_url">Twitter URL</Label>
                    <Input
                      id="twitter_url"
                      type="url"
                      value={formData.twitter_url}
                      onChange={(e) => handleInputChange('twitter_url', e.target.value)}
                      placeholder="https://twitter.com/your-handle"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instagram_url">Instagram URL</Label>
                    <Input
                      id="instagram_url"
                      type="url"
                      value={formData.instagram_url}
                      onChange={(e) => handleInputChange('instagram_url', e.target.value)}
                      placeholder="https://instagram.com/your-handle"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search your events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
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
        </CardContent>
      </Card>

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Your Events ({filteredEvents.length})</span>
            <Badge variant="secondary">{userEvents.length} Total</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredEvents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {event.event_image_url && (
                          <img
                            src={event.event_image_url}
                            alt={event.title}
                            className="w-10 h-10 object-cover rounded"
                          />
                        )}
                        <div>
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-[200px]">
                            {event.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {event.category_name || event.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(event.start_date).toLocaleDateString()}</div>
                        <div className="text-gray-500">
                          {new Date(event.start_date).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{event.venue_name}</div>
                        <div className="text-gray-500">{event.city_name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={new Date(event.start_date) > new Date() ? 'default' : 'secondary'}
                      >
                        {new Date(event.start_date) > new Date() ? 'Upcoming' : 'Past'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/events/${event.id}`, '_blank')}
                          title="View Event"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {/* Gallery Button for Past Events */}
                        {new Date(event.end_date) < new Date() && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedEventForGallery(event);
                              setGalleryUploadOpen(true);
                            }}
                            className="text-purple-600 hover:text-purple-700"
                            title="Manage Gallery"
                          >
                            <Images className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(event)}
                          title="Edit Event"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEventToDelete(event.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete Event"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Link to={`/users/dashboard/events/${event.id}/registrations`}>
                          <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50 relative">
                            <Users className="h-4 w-4 mr-1" />
                            Registrations
                            {event.current_registrations > 0 && (
                              <span className="ml-2 bg-blue-100 text-blue-700 text-xs rounded-full px-1.5 py-0.5 font-medium">
                                {event.current_registrations}
                              </span>
                            )}
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || selectedCategory !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : "You haven't created any events yet. Create your first event to get started."
                }
              </p>
              {!(searchQuery || selectedCategory !== 'all') && (
                <Button onClick={() => {
                  resetForm();
                  setIsDialogOpen(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Event
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gallery Upload Modal */}
      {selectedEventForGallery && (
        <EventGalleryUpload
          isOpen={galleryUploadOpen}
          onClose={() => {
            setGalleryUploadOpen(false);
            setSelectedEventForGallery(null);
          }}
          eventId={selectedEventForGallery.id}
          eventTitle={selectedEventForGallery.title}
          existingImages={selectedEventForGallery.event_images || []}
          onUploadComplete={() => {
            // Refresh events list
            searchEvents({ limit: 100 });
          }}
        />
      )}

      <AlertDialog open={!!eventToDelete} onOpenChange={(open) => !open && setEventToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};