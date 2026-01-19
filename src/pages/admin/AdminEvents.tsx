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
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEvents, useEventCategories, useEventManagement } from '@/hooks/useEvents';
import { useCitiesByCountry } from '@/hooks/useEvents';
import { uploadImage, deleteImage } from '@/lib/storage';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  placeName: string;
  imageUrl: string;
  category: string;
  organizer: string;
  organizerHandle: string;
  price: string;
  capacity: string;
  website: string;
  tickets: Array<{
    name: string;
    price: string;
    selected?: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

const categories = [
  { id: 'technology', name: 'Technology' },
  { id: 'music', name: 'Music' },
  { id: 'art', name: 'Art' },
  { id: 'business', name: 'Business' },
  { id: 'food', name: 'Food' },
  { id: 'fashion', name: 'Fashion' },
  { id: 'sports', name: 'Sports' },
  { id: 'education', name: 'Education' },
  { id: 'health', name: 'Health' },
  { id: 'entertainment', name: 'Entertainment' }
];

export const AdminEvents = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { events, loading, searchEvents } = useEvents();
  const { categories } = useEventCategories();
  const { createEvent, updateEvent, deleteEvent } = useEventManagement();
  const [totalEventsCount, setTotalEventsCount] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    placeName: '',
    imageUrl: '',
    category: '',
    organizer: '',
    organizerHandle: '',
    price: '',
    capacity: '',
    website: '',
    tickets: [{ name: '', price: '', selected: true }]
  });

  // Load all events from database (including completed/past events for admin)
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const result = await searchEvents({ 
          limit: 10000,
          include_all_statuses: true // Admin needs to see all events including past ones
        });
        if (result) {
          console.log('Admin Events - Total from DB:', result.total_count);
          console.log('Admin Events - Events loaded:', result.events.length);
          console.log('Admin Events - Event statuses:', result.events.reduce((acc: any, e: any) => {
            acc[e.event_status] = (acc[e.event_status] || 0) + 1;
            return acc;
          }, {}));
          setTotalEventsCount(result.total_count);
        }
      } catch (error) {
        console.error('Error loading events:', error);
        toast({
          title: 'Error',
          description: 'Failed to load events',
          variant: 'destructive'
        });
      }
    };
    loadEvents();
  }, [searchEvents]);

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.organizer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const eventData = {
        ...formData,
        id: editingEvent?.id || Date.now().toString(),
        createdAt: editingEvent?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingEvent) {
        setEvents(prev => prev.map(event => event.id === editingEvent.id ? eventData : event));
        toast({
          title: "Event updated successfully",
          description: "The event has been updated.",
        });
      } else {
        setEvents(prev => [...prev, eventData]);
        toast({
          title: "Event created successfully",
          description: "The event has been added.",
        });
      }

      setIsDialogOpen(false);
      setEditingEvent(null);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      placeName: event.placeName,
      imageUrl: event.imageUrl,
      category: event.category.toLowerCase(),
      organizer: event.organizer,
      organizerHandle: event.organizerHandle,
      price: event.price,
      capacity: event.capacity,
      website: event.website,
      tickets: event.tickets
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
    toast({
      title: "Event deleted",
      description: "The event has been removed.",
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      placeName: '',
      imageUrl: '',
      category: '',
      organizer: '',
      organizerHandle: '',
      price: '',
      capacity: '',
      website: '',
      tickets: [{ name: '', price: '', selected: true }]
    });
  };

  const addTicket = () => {
    setFormData(prev => ({
      ...prev,
      tickets: [...prev.tickets, { name: '', price: '', selected: false }]
    }));
  };

  const removeTicket = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tickets: prev.tickets.filter((_, i) => i !== index)
    }));
  };

  const updateTicket = (index: number, field: 'name' | 'price', value: string) => {
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
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time *</Label>
                    <Input
                      id="time"
                      value={formData.time}
                      onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                      placeholder="e.g., 9:00 AM - 5:00 PM"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location (City, Country) *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g., Nairobi, Kenya"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="placeName">Venue Name *</Label>
                    <Input
                      id="placeName"
                      value={formData.placeName}
                      onChange={(e) => setFormData(prev => ({ ...prev, placeName: e.target.value }))}
                      placeholder="e.g., Kenyatta International Convention Centre"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Event Image URL *</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organizer">Organizer Name *</Label>
                    <Input
                      id="organizer"
                      value={formData.organizer}
                      onChange={(e) => setFormData(prev => ({ ...prev, organizer: e.target.value }))}
                      placeholder="e.g., Africa Tech Network"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organizerHandle">Organizer Handle *</Label>
                    <Input
                      id="organizerHandle"
                      value={formData.organizerHandle}
                      onChange={(e) => setFormData(prev => ({ ...prev, organizerHandle: e.target.value }))}
                      placeholder="e.g., @africatech"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price Range</Label>
                    <Input
                      id="price"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="e.g., Free - $250"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      value={formData.capacity}
                      onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                      placeholder="e.g., 1000 attendees"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                {/* Tickets Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-semibold">Tickets</Label>
                    <Button type="button" variant="outline" onClick={addTicket}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Ticket
                    </Button>
                  </div>
                  
                  {formData.tickets.map((ticket, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg">
                      <input
                        type="radio"
                        name="selectedTicket"
                        checked={ticket.selected}
                        onChange={() => setSelectedTicket(index)}
                        className="mr-2"
                      />
                      <Input
                        placeholder="Ticket name"
                        value={ticket.name}
                        onChange={(e) => updateTicket(index, 'name', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Price"
                        value={ticket.price}
                        onChange={(e) => updateTicket(index, 'price', e.target.value)}
                        className="w-32"
                      />
                      {formData.tickets.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeTicket(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
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
                      <SelectItem key={category.id} value={category.id}>
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
            <CardTitle>Events ({filteredEvents.length} of {totalEventsCount} total)</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredEvents.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Organizer</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <img
                            src={event.imageUrl}
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
                        <Badge variant="secondary">{event.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{event.date}</div>
                          <div className="text-gray-500">{event.time}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{event.placeName}</div>
                          <div className="text-gray-500">{event.location}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{event.organizer}</div>
                          <div className="text-gray-500">{event.organizerHandle}</div>
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
