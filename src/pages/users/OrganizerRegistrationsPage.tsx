import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Loader2,
    ArrowLeft,
    Search,
    Download,
    MoreHorizontal,
    CheckCircle,
    XCircle,
    CreditCard,
    Calendar,
    DollarSign,
    Users
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

interface Registration {
    id: string;
    created_at: string;
    user_name: string;
    user_email: string;
    quantity: number;
    total_amount: number;
    payment_status: 'pending' | 'confirmed' | 'rejected' | 'refunded';
    confirmed_by_user: boolean;
    ticket_id: string;
    payment_method: string | null;
}

interface EventDetails {
    id: string;
    title: string;
    start_date: string;
    end_date: string;
    currency: string;
    entry_fee: number;
    is_free: boolean;
    max_capacity: number | null;
    current_registrations: number;
    created_by?: string;
    created_by_user_id?: string;
}

export const OrganizerRegistrationsPage = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const { user } = useUser();
    const [loading, setLoading] = useState(true);
    const [event, setEvent] = useState<EventDetails | null>(null);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        if (eventId && user) {
            fetchData();
        }
    }, [eventId, user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Event Details
            const { data: eventData, error: eventError } = await supabase
                .from('events')
                .select('*')
                .eq('id', eventId)
                .single();

            if (eventError) throw eventError;

            // Verify ownership (client-side check, RLS should also enforce)
            const ownerId = eventData.created_by_user_id || eventData.created_by;
            if (ownerId && ownerId !== user?.id) {
                console.warn('User is not the event owner');
                // We won't block render here, RLS on registrations will block data
            }

            setEvent(eventData);

            // 2. Fetch Registrations
            const { data: regData, error: regError } = await supabase
                .from('event_registrations')
                .select('*')
                .eq('event_id', eventId)
                .order('created_at', { ascending: false });

            if (regError) throw regError;
            setRegistrations(regData || []);

        } catch (error) {
            console.error('Error fetching data:', error);
            toast({
                title: 'Error',
                description: 'Failed to load registrations. Ensure you are the event organizer.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (registrationId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('event_registrations')
                .update({ payment_status: newStatus })
                .eq('id', registrationId);

            if (error) throw error;

            // Update local state
            setRegistrations(prev =>
                prev.map(r => r.id === registrationId ? { ...r, payment_status: newStatus as any } : r)
            );

            toast({
                title: 'Status Updated',
                description: `Registration marked as ${newStatus}.`,
            });
        } catch (error) {
            console.error('Error updating status:', error);
            toast({
                title: 'Update Failed',
                description: 'Could not update registration status.',
                variant: 'destructive',
            });
        }
    };

    const filteredRegistrations = registrations.filter(reg => {
        const term = searchQuery.toLowerCase();
        const matchesSearch =
            (reg.user_name && reg.user_name.toLowerCase().includes(term)) ||
            (reg.user_email && reg.user_email.toLowerCase().includes(term)) ||
            (reg.ticket_id && reg.ticket_id.toLowerCase().includes(term));

        const matchesStatus = statusFilter === 'all' || reg.payment_status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Calculate Stats
    const totalRevenue = registrations
        .filter(r => r.payment_status === 'confirmed')
        .reduce((acc, r) => acc + (r.total_amount || 0), 0);

    const pendingRevenue = registrations
        .filter(r => r.payment_status === 'pending')
        .reduce((acc, r) => acc + (r.total_amount || 0), 0);

    const confirmedCount = registrations.filter(r => r.payment_status === 'confirmed').length;

    const exportCSV = () => {
        const headers = ['Ticket ID', 'Name', 'Email', 'Quantity', 'Total', 'Status', 'Date'];
        const rows = filteredRegistrations.map(r => [
            r.ticket_id,
            r.user_name,
            r.user_email,
            r.quantity,
            r.total_amount,
            r.payment_status,
            new Date(r.created_at).toLocaleDateString()
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${event?.title || 'event'}_registrations.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <XCircle className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-xl font-bold">Event Not Found</h3>
                <p className="text-gray-500 mt-2">Could not find the event details or you don't have permission.</p>
                <Link to="/users/dashboard/events">
                    <Button className="mt-4" variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Events
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Navigation */}
            <div className="flex items-center gap-2 mb-4">
                <Link to="/users/dashboard/events">
                    <Button variant="ghost" size="sm" className="pl-0 hover:bg-transparent hover:text-blue-600">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to My Events
                    </Button>
                </Link>
            </div>

            {/* Header & Stats */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="md:col-span-2 lg:col-span-4 bg-gradient-to-r from-blue-50 to-white border-blue-100">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        {new Date(event.start_date).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        {event.current_registrations} / {event.max_capacity || '∞'} Registered
                                    </span>
                                </div>
                            </div>
                            <Button variant="outline" onClick={exportCSV}>
                                <Download className="mr-2 h-4 w-4" />
                                Export CSV
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Revenue (Confirmed)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {event.currency || 'USD'} {totalRevenue.toFixed(2)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Pending Payments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {event.currency || 'USD'} {pendingRevenue.toFixed(2)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Confirmed Attendees</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {confirmedCount}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Tickets Sold</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {registrations.reduce((acc, r) => acc + r.quantity, 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by name, email, or ticket ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    {(['all', 'confirmed', 'pending', 'rejected'] as const).map(status => (
                        <Button
                            key={status}
                            variant={statusFilter === status ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setStatusFilter(status)}
                            className="capitalize"
                        >
                            {status}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Attendee</TableHead>
                                <TableHead>Tickets</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Verified?</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRegistrations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                        No registrations found matching your filters.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredRegistrations.map((reg) => (
                                    <TableRow key={reg.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium text-gray-900">{reg.user_name}</div>
                                                <div className="text-sm text-gray-500">{reg.user_email}</div>
                                                <div className="text-xs text-gray-400 font-mono mt-1">{reg.ticket_id}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{reg.quantity}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">
                                                {event.currency || 'USD'} {reg.total_amount.toFixed(2)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                reg.payment_status === 'confirmed' ? 'default' : // Greenish handled by default variant? No, default is black.
                                                    reg.payment_status === 'pending' ? 'outline' :
                                                        reg.payment_status === 'rejected' ? 'destructive' : 'secondary'
                                            } className={
                                                reg.payment_status === 'confirmed' ? 'bg-green-100 text-green-800 hover:bg-green-200 border-none' :
                                                    reg.payment_status === 'pending' ? 'bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200' : ''
                                            }>
                                                {reg.payment_status.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {reg.confirmed_by_user ? (
                                                <span className="flex items-center text-sm text-green-600 font-medium">
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    User Paid
                                                </span>
                                            ) : (
                                                <span className="text-sm text-gray-400">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => updateStatus(reg.id, 'confirmed')}>
                                                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                                        Confirm Payment
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateStatus(reg.id, 'pending')}>
                                                        <DollarSign className="mr-2 h-4 w-4 text-orange-600" />
                                                        Mark as Pending
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => updateStatus(reg.id, 'rejected')} className="text-red-600">
                                                        <XCircle className="mr-2 h-4 w-4" />
                                                        Reject / Cancel
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};
