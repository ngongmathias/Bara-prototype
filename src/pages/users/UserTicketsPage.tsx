import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ticket, Calendar, MapPin, Clock, AlertCircle, CheckCircle, Loader2, ExternalLink, CreditCard, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';

interface Registration {
    id: string;
    event_id: string;
    user_id: string;
    user_email: string;
    user_name: string;
    quantity: number;
    total_amount: number;
    payment_method: string | null;
    payment_status: 'pending' | 'confirmed' | 'rejected' | 'refunded';
    confirmed_by_user: boolean;
    ticket_id: string;
    created_at: string;
    event?: {
        id: string;
        title: string;
        start_date: string;
        end_date: string;
        venue_name: string;
        venue_address: string;
        event_image_url: string | null;
        entry_fee: number | null;
        currency: string | null;
        is_free: boolean;
        payment_instructions: string | null;
        payment_contact: string | null;
    };
}

export const UserTicketsPage = () => {
    const { user } = useUser();
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');

    useEffect(() => {
        if (user) fetchRegistrations();
    }, [user]);

    const fetchRegistrations = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('event_registrations')
                .select(`
          *,
          event:events (
            id, title, start_date, end_date, venue_name, venue_address,
            event_image_url, entry_fee, currency, is_free,
            payment_instructions, payment_contact
          )
        `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRegistrations((data as any[]) || []);
        } catch (err) {
            console.error('Failed to fetch registrations:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmPayment = async (registrationId: string) => {
        try {
            const { error } = await supabase
                .from('event_registrations')
                .update({ confirmed_by_user: true })
                .eq('id', registrationId);

            if (error) throw error;
            setRegistrations(prev =>
                prev.map(r => r.id === registrationId ? { ...r, confirmed_by_user: true } : r)
            );
        } catch (err) {
            console.error('Failed to confirm payment:', err);
        }
    };

    const now = new Date();
    const filtered = registrations.filter(r => {
        if (!r.event) return false;
        const eventDate = new Date(r.event.start_date);
        if (activeTab === 'upcoming') return eventDate >= now;
        if (activeTab === 'past') return eventDate < now;
        return true;
    });

    const statusBadge = (status: string, confirmedByUser: boolean, isFree?: boolean) => {
        // Free events are always confirmed immediately
        if (isFree || status === 'confirmed') return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>;
        if (status === 'rejected') return <Badge className="bg-red-100 text-red-800 border-red-200"><AlertCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
        if (status === 'refunded') return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Refunded</Badge>;
        if (confirmedByUser) return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Awaiting Verification</Badge>;
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200"><CreditCard className="h-3 w-3 mr-1" />Payment Pending</Badge>;
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Ticket className="h-6 w-6 text-blue-600" />
                        My Tickets
                    </h2>
                    <p className="text-gray-500 mt-1">Manage your event registrations and tickets</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchRegistrations} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b pb-1">
                {(['upcoming', 'past', 'all'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tab
                                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        {tab === 'upcoming' && registrations.filter(r => r.event && new Date(r.event.start_date) >= now).length > 0 && (
                            <span className="ml-2 bg-blue-100 text-blue-700 text-xs rounded-full px-2 py-0.5">
                                {registrations.filter(r => r.event && new Date(r.event.start_date) >= now).length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="ml-3 text-gray-500">Loading your tickets...</span>
                </div>
            ) : filtered.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <Ticket className="h-16 w-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700">No tickets yet</h3>
                        <p className="text-gray-500 mt-1 max-w-sm">
                            {activeTab === 'upcoming'
                                ? "You don't have any upcoming event tickets. Browse events to find something exciting!"
                                : activeTab === 'past'
                                    ? "No past event tickets found."
                                    : "You haven't registered for any events yet."
                            }
                        </p>
                        <Link to="/events">
                            <Button className="mt-4">
                                <Calendar className="h-4 w-4 mr-2" />
                                Browse Events
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filtered.map(reg => (
                        <Card key={reg.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <div className="flex flex-col sm:flex-row">
                                {/* Event Image */}
                                <div className="sm:w-48 h-32 sm:h-auto flex-shrink-0">
                                    {reg.event?.event_image_url ? (
                                        <img
                                            src={reg.event.event_image_url}
                                            alt={reg.event.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                            <Calendar className="h-10 w-10 text-white/70" />
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 p-4 sm:p-5">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{reg.event?.title || 'Event'}</h3>
                                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {reg.event ? formatDate(reg.event.start_date) : 'TBD'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {reg.event ? formatTime(reg.event.start_date) : ''}
                                                </span>
                                                {reg.event?.venue_name && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3.5 w-3.5" />
                                                        {reg.event.venue_name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {statusBadge(reg.payment_status, reg.confirmed_by_user, reg.event?.is_free)}
                                        </div>
                                    </div>

                                    {/* Ticket info row */}
                                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                                        <span className="bg-gray-100 rounded-md px-3 py-1">
                                            <strong>Ticket ID:</strong> {reg.ticket_id}
                                        </span>
                                        <span className="bg-gray-100 rounded-md px-3 py-1">
                                            <strong>Qty:</strong> {reg.quantity}
                                        </span>
                                        {reg.total_amount > 0 && (
                                            <span className="bg-gray-100 rounded-md px-3 py-1">
                                                <strong>Total:</strong> {reg.event?.currency || 'USD'} {reg.total_amount.toFixed(2)}
                                            </span>
                                        )}
                                        {reg.event?.is_free && (
                                            <Badge className="bg-green-50 text-green-700 border-green-200">FREE</Badge>
                                        )}
                                    </div>

                                    {/* Action: If payment pending and not yet confirmed */}
                                    {reg.payment_status === 'pending' && !reg.confirmed_by_user && !reg.event?.is_free && (
                                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                            <p className="text-sm text-amber-800 font-medium mb-2">
                                                💳 Complete your payment to secure your spot
                                            </p>
                                            {reg.event?.payment_instructions && (
                                                <p className="text-xs text-amber-700 whitespace-pre-wrap mb-2">
                                                    {reg.event.payment_instructions}
                                                </p>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleConfirmPayment(reg.id)}
                                                className="border-amber-300 text-amber-800 hover:bg-amber-100"
                                            >
                                                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                                I've Paid — Confirm
                                            </Button>
                                        </div>
                                    )}

                                    {/* Link to event */}
                                    <div className="mt-3">
                                        <Link to={`/events/${reg.event_id}`}>
                                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 p-0">
                                                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                                View Event
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
