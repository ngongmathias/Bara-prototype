import React, { useState, useEffect } from 'react';
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
  Save,
  X,
  Eye,
  Upload,
  Images
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEvents, useEventCategories, useEventManagement, useCountries, useCitiesByCountry } from '@/hooks/useEvents';
import { uploadEventImage, EventsService } from '@/lib/eventsService';
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
    currency: 'USD'
  });

  // Cities hook - only fetch when country is selected
  const { cities, loading: citiesLoading } = useCitiesByCountry(formData.country_id || '');

  // Filter events to only show user's events
  const userEvents = events.filter(event => 
    event.created_by_user_id === user?.id
  );

  // Apply search and category filters to user's events
  const filteredEvents = userEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (event.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    searchEvents({ limit: 100 });
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
      currency: 'USD'
    });
    setEditingEvent(null);
    setImagePreview(null);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
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
      currency: event.currency || 'USD'
    });
    setImagePreview(event.event_image_url || null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      await deleteEvent(eventId);
      toast({
        title: 'Event deleted',
        description: 'The event has been successfully deleted.',
      });
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
      const { tickets, ...formDataWithoutTickets } = formData;
      
      const eventData = {
        ...formDataWithoutTickets,
        venue_latitude: formData.venue_latitude ? parseFloat(formData.venue_latitude) : null,
        venue_longitude: formData.venue_longitude ? parseFloat(formData.venue_longitude) : null,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        tags: formData.hashtags,
        created_by_user_id: user.id,
        created_by_email: user.primaryEmailAddress?.emailAddress || '',
        created_by_name: user.fullName || ''
      };

      if (editingEvent) {
        await updateEvent(editingEvent.id, eventData);
        toast({
          title: 'Event updated',
          description: 'Your event has been successfully updated.',
        });
      } else {
        await createEvent(eventData);
        toast({
          title: 'Event created',
          description: 'Your event has been successfully created.',
        });
      }
      
      setIsDialogOpen(false);
      resetForm();
      // Refresh events list
      searchEvents({ limit: 100 });
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
                      onChange={(e) => handleInputChange('organizer_name', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="organizer_email">Email *</Label>
                    <Input
                      id="organizer_email"
                      type="email"
                      value={formData.organizer_email}
                      onChange={(e) => handleInputChange('organizer_email', e.target.value)}
                      required
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
                          onClick={() => handleDelete(event.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete Event"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
    </div>
  );
};