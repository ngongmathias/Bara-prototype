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
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Search,
  Filter,
  Eye,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEvents, useEventCategories, useEventManagement } from '@/hooks/useEvents';
import { AdminPageGuide } from '@/components/admin/AdminPageGuide';
import { Event } from '@/lib/eventsService';

export const AdminEvents = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const { toast } = useToast();
  const { events, loading, searchEvents } = useEvents();
  const { categories } = useEventCategories();
  const { createEvent, updateEvent, deleteEvent } = useEventManagement();
  const [totalEventsCount, setTotalEventsCount] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    venue_name: '',
    venue_address: '',
    event_image_url: '',
    category: '',
    organizer_name: '',
    organizer_handle: '',
    entry_fee: '',
    capacity: '',
    website_url: '',
    tickets: [] as any[]
  });

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const result = await searchEvents({
          limit: 1000,
          include_all_statuses: true,
          include_private: true
        });
        if (result) {
          setTotalEventsCount(result.total_count);
        }
      } catch (error) {
        console.error('Error loading events:', error);
      }
    };
    loadEvents();
  }, [searchEvents]);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.organizer_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const eventData = {
        ...formData,
        entry_fee: formData.entry_fee ? parseFloat(formData.entry_fee) : 0,
        capacity: formData.capacity ? parseInt(formData.capacity) : 0,
      };

      if (editingEvent) {
        await updateEvent(editingEvent.id, eventData as any);
        toast({ title: "Event updated successfully" });
      } else {
        await createEvent(eventData as any);
        toast({ title: "Event created successfully" });
      }

      setIsDialogOpen(false);
      resetForm();
      searchEvents({ limit: 1000, include_all_statuses: true, include_private: true });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save event", variant: "destructive" });
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      start_date: event.start_date ? event.start_date.split('T')[0] : '',
      end_date: event.end_date ? event.end_date.split('T')[0] : '',
      venue_name: event.venue_name || '',
      venue_address: event.venue_address || '',
      event_image_url: event.event_image_url || '',
      category: event.category || '',
      organizer_name: event.organizer_name || '',
      organizer_handle: event.organizer_handle || '',
      entry_fee: event.entry_fee?.toString() || '',
      capacity: event.capacity?.toString() || '',
      website_url: event.website_url || '',
      tickets: event.tickets || []
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (eventId: string) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await deleteEvent(eventId);
      toast({ title: "Event deleted" });
      searchEvents({ limit: 1000, include_all_statuses: true, include_private: true });
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
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
      category: '',
      organizer_name: '',
      organizer_handle: '',
      entry_fee: '',
      capacity: '',
      website_url: '',
      tickets: []
    });
    setEditingEvent(null);
  };

  return (
    <AdminLayout>
      <div className="mb-4 w-full flex justify-end">
        <AdminPageGuide
          title="Events Management"
          description="Manage platform events and organizer details."
          features={["Create/Edit events", "Manage categories", "View registration status"]}
          workflow={["Use the filter to find specific events", "Ensure high quality images are used"]}
        />
      </div>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Events Management</h1>
          <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>

        <Card>
          <CardContent className="p-4 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Organizer</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-gray-500">{event.venue_name}</div>
                    </TableCell>
                    <TableCell><Badge variant="secondary">{event.category}</Badge></TableCell>
                    <TableCell>{event.start_date?.split('T')[0]}</TableCell>
                    <TableCell>{event.organizer_name}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="icon" onClick={() => handleEdit(event)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="outline" size="icon" onClick={() => handleDelete(event.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingEvent ? 'Edit Event' : 'Add Event'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Organizer Name</Label>
                  <Input value={formData.organizer_name} onChange={e => setFormData({ ...formData, organizer_name: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input value={formData.event_image_url} onChange={e => setFormData({ ...formData, event_image_url: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>Save Event</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};
