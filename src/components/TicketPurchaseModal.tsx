import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@clerk/clerk-react';
import { EventsService, EventRegistration, EventTicket } from '@/lib/eventsService';
import { supabase } from '@/lib/supabase';
import { GamificationService, COIN_REWARDS } from '@/lib/gamificationService';
import {
    X,
    Ticket,
    CheckCircle,
    AlertCircle,
    Phone,
    CreditCard,
    Building2,
    Loader2,
    Minus,
    Plus,
    Copy,
    PartyPopper,
    Info,
} from 'lucide-react';

interface TicketPurchaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: {
        id: string;
        title: string;
        start_date: string;
        end_date: string;
        is_free?: boolean;
        entry_fee?: number;
        currency?: string;
        payment_instructions?: string;
        payment_contact?: string;
        organizer_name?: string;
        organizer_email?: string;
        organizer_phone?: string;
        max_capacity?: number;
        current_registrations?: number;
        tickets?: EventTicket[];
    };
}

export const TicketPurchaseModal = ({ isOpen, onClose, event }: TicketPurchaseModalProps) => {
    const { user, isSignedIn } = useUser();
    const { toast } = useToast();
    const [quantity, setQuantity] = useState(1);
    const [step, setStep] = useState<'select' | 'pay' | 'confirm' | 'done'>('select');
    const [loading, setLoading] = useState(false);
    const [registration, setRegistration] = useState<EventRegistration | null>(null);
    const [selectedTicketType, setSelectedTicketType] = useState<string>('general');

    // Active ticket types from the event
    const activeTickets = (event.tickets || []).filter(t => t.is_active !== false);
    const hasTicketTypes = activeTickets.length > 0;

    if (!isOpen) return null;

    // An event is effectively free if is_free flag is set OR the entry fee is 0/null
    const isEffectivelyFree = event.is_free || !event.entry_fee || event.entry_fee === 0;
    const isUnlimited = !event.max_capacity || event.max_capacity === 0;
    const isSoldOut = !isUnlimited && (event.current_registrations || 0) >= (event.max_capacity || 0);
    const spotsLeft = isUnlimited ? null : (event.max_capacity || 0) - (event.current_registrations || 0);
    const rawFee = event.entry_fee || 0;
    const parsedFee = typeof rawFee === 'string' ? parseFloat((rawFee as string).replace(/[^0-9.]/g, '')) : Number(rawFee);
    const safeFee = isNaN(parsedFee) ? 0 : parsedFee;
    const totalPrice = safeFee * quantity;
    const currencySymbol = event.currency === 'USD' ? '$' : event.currency === 'EUR' ? '€' : event.currency === 'GBP' ? '£' : '';
    const priceDisplay = currencySymbol
        ? `${currencySymbol}${totalPrice.toLocaleString()}`
        : `${totalPrice.toLocaleString()} ${event.currency || ''}`;

    const handleRegisterFree = async () => {
        if (!isSignedIn || !user) {
            toast({ title: 'Sign in required', description: 'Please sign in to register for this event.', variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            const reg = await EventsService.createEventRegistration({
                event_id: event.id,
                user_id: user.id,
                user_email: user.primaryEmailAddress?.emailAddress || '',
                user_name: user.fullName || user.firstName || 'Guest',
                ticket_type: selectedTicketType,
                quantity,
                payment_status: 'confirmed',
                payment_method: 'free',
                confirmed_by_user: true,
            });

            setRegistration(reg);

            // Gamification: Award coins (not XP) for registration + check achievement
            try {
                await GamificationService.addCoins(user.id, COIN_REWARDS.EVENT_RSVP, `Registered for event: ${event.title}`);
                await GamificationService.awardAchievement(user.id, 'event_goer');
            } catch (gamifyErr) {
                console.warn('Gamification update failed:', gamifyErr);
            }

            // Email is now handled by database trigger on event_registrations

            setStep('done');
            toast({ title: 'Registration confirmed!', description: `You're registered for ${event.title}` });
        } catch (error) {
            console.error('Registration failed:', error);
            toast({ title: 'Registration failed', description: 'Something went wrong. Please try again.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleProceedToPay = () => {
        if (!isSignedIn || !user) {
            toast({ title: 'Sign in required', description: 'Please sign in to purchase tickets.', variant: 'destructive' });
            return;
        }
        setStep('pay');
    };

    const handleConfirmPayment = async () => {
        if (!isSignedIn || !user) return;

        setLoading(true);
        try {
            const reg = await EventsService.createEventRegistration({
                event_id: event.id,
                user_id: user.id,
                user_email: user.primaryEmailAddress?.emailAddress || '',
                user_name: user.fullName || user.firstName || 'Guest',
                ticket_type: selectedTicketType,
                quantity,
                payment_status: 'pending',
                payment_method: 'manual',
                confirmed_by_user: true,
            });

            setRegistration(reg);

            // Gamification: Award coins (not XP) for registration + check achievement
            try {
                await GamificationService.addCoins(user.id, COIN_REWARDS.EVENT_RSVP, `Reserved ticket for event: ${event.title}`);
                await GamificationService.awardAchievement(user.id, 'event_goer');
            } catch (gamifyErr) {
                console.warn('Gamification update failed:', gamifyErr);
            }

            // Email is now handled by database trigger on event_registrations

            setStep('done');
            toast({ title: 'Ticket reserved!', description: `Your spot is reserved. The organizer will confirm your payment.` });
        } catch (error) {
            console.error('Registration failed:', error);
            toast({ title: 'Registration failed', description: 'Something went wrong. Please try again.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: 'Copied!', description: 'Payment details copied to clipboard.' });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                            <Ticket className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">
                                {step === 'done' ? 'All Set!' : isEffectivelyFree ? 'Register for Event' : 'Buy Tickets'}
                            </h2>
                            <p className="text-sm text-gray-500 line-clamp-1">{event.title}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Step: Select Quantity */}
                {step === 'select' && (
                    <div className="p-6 space-y-6">
                        {/* Sold Out Warning */}
                        {isSoldOut && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-red-800">Sold Out</p>
                                    <p className="text-sm text-red-600">This event has reached maximum capacity.</p>
                                </div>
                            </div>
                        )}

                        {/* Capacity Info */}
                        {spotsLeft !== null && !isSoldOut && (
                            <div className={`rounded-xl p-4 flex items-center gap-3 ${spotsLeft <= 10 ? 'bg-orange-50 border border-orange-200' : 'bg-blue-50 border border-blue-200'}`}>
                                <Info className="w-5 h-5 flex-shrink-0" style={{ color: spotsLeft <= 10 ? '#ea580c' : '#2563eb' }} />
                                <p className="text-sm font-medium" style={{ color: spotsLeft <= 10 ? '#9a3412' : '#1e40af' }}>
                                    {spotsLeft <= 10 ? `Only ${spotsLeft} spots left!` : `${spotsLeft} spots remaining`}
                                </p>
                            </div>
                        )}

                        {/* Ticket Type Selector */}
                        {hasTicketTypes && !isEffectivelyFree && (
                            <div className="space-y-3">
                                <p className="text-sm font-medium text-gray-700">Select Ticket Type</p>
                                {activeTickets.map((ticket) => (
                                    <button
                                        key={ticket.id}
                                        type="button"
                                        onClick={() => setSelectedTicketType(ticket.name)}
                                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedTicketType === ticket.name
                                                ? 'border-black bg-gray-50 shadow-sm'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedTicketType === ticket.name ? 'border-black' : 'border-gray-300'
                                                    }`}>
                                                    {selectedTicketType === ticket.name && (
                                                        <div className="w-3 h-3 rounded-full bg-black" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{ticket.name}</p>
                                                    {ticket.description && (
                                                        <p className="text-xs text-gray-500 mt-0.5">{ticket.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            {ticket.max_quantity && (
                                                <Badge variant="secondary" className="text-xs">
                                                    {Math.max(0, ticket.max_quantity - ticket.registered_quantity)} left
                                                </Badge>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Price Display */}
                        <div className="text-center py-4">
                            {isEffectivelyFree ? (
                                <div>
                                    <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2 rounded-full">FREE</Badge>
                                    <p className="text-sm text-gray-500 mt-2">No payment required</p>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Price per ticket</p>
                                    <p className="text-4xl font-bold text-gray-900">
                                        {currencySymbol}{safeFee.toLocaleString()}
                                        {!currencySymbol && <span className="text-lg ml-1">{event.currency || ''}</span>}
                                    </p>
                                    {hasTicketTypes && selectedTicketType !== 'general' && (
                                        <p className="text-sm text-gray-600 mt-1 font-medium">
                                            Ticket: {selectedTicketType}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-2">
                                        Pay directly to the organizer. Details provided next.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Quantity Selector */}
                        {!isSoldOut && (
                            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                                <span className="font-medium text-gray-700">Quantity</span>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center hover:border-black transition-colors"
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="text-2xl font-bold w-8 text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(spotsLeft !== null ? Math.min(spotsLeft, quantity + 1) : quantity + 1)}
                                        className="w-10 h-10 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center hover:border-black transition-colors"
                                        disabled={spotsLeft !== null && quantity >= spotsLeft}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Total */}
                        {!event.is_free && !isSoldOut && quantity > 1 && (
                            <div className="flex items-center justify-between bg-gray-900 text-white rounded-xl p-4">
                                <span className="font-medium">Total</span>
                                <span className="text-xl font-bold">{priceDisplay}</span>
                            </div>
                        )}

                        {/* Action Button */}
                        {!isSoldOut && (
                            <Button
                                className="w-full py-4 text-lg font-semibold rounded-xl"
                                style={{ backgroundColor: isEffectivelyFree ? '#16a34a' : '#000' }}
                                onClick={isEffectivelyFree ? handleRegisterFree : handleProceedToPay}
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                ) : null}
                                {isEffectivelyFree ? `Register (${quantity} ticket${quantity > 1 ? 's' : ''})` : `Continue to Payment`}
                            </Button>
                        )}

                        {!isSignedIn && (
                            <p className="text-center text-sm text-gray-500">
                                You need to <a href="/user/sign-in" className="text-blue-600 underline">sign in</a> to register.
                            </p>
                        )}
                    </div>
                )}

                {/* Step: Payment Instructions */}
                {step === 'pay' && (
                    <div className="p-6 space-y-6">
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <p className="font-semibold text-amber-800 mb-1">Manual Payment</p>
                            <p className="text-sm text-amber-700">
                                Complete your payment using the organizer's details below, then click "I've Paid" to reserve your spot.
                            </p>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Event</span>
                                <span className="font-medium text-gray-900 text-right max-w-[200px] truncate">{event.title}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tickets</span>
                                <span className="font-medium text-gray-900">{quantity}</span>
                            </div>
                            <div className="flex justify-between text-sm border-t pt-2 mt-2">
                                <span className="font-semibold text-gray-900">Total</span>
                                <span className="font-bold text-lg text-gray-900">{priceDisplay}</span>
                            </div>
                        </div>

                        {/* Payment Options */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-gray-900">Payment Options</h3>

                            {event.payment_instructions ? (
                                <div className="bg-white border-2 border-gray-200 rounded-xl p-4 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <CreditCard className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{event.payment_instructions}</p>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(event.payment_instructions || '')}
                                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                                            title="Copy details"
                                        >
                                            <Copy className="w-4 h-4 text-gray-400" />
                                        </button>
                                    </div>
                                </div>
                            ) : (event.organizer_phone || event.organizer_email) ? (
                                <div className="bg-white border-2 border-gray-200 rounded-xl p-4 space-y-3">
                                    <p className="text-sm text-gray-600">
                                        Contact the organizer directly to arrange payment:
                                    </p>
                                    {event.organizer_phone && (
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-4 h-4 text-gray-500" />
                                            <a href={`tel:${event.organizer_phone}`} className="text-blue-600 hover:underline text-sm font-medium">
                                                {event.organizer_phone}
                                            </a>
                                            <button onClick={() => copyToClipboard(event.organizer_phone!)} className="ml-auto p-1 hover:bg-gray-100 rounded">
                                                <Copy className="w-3 h-3 text-gray-400" />
                                            </button>
                                        </div>
                                    )}
                                    {event.organizer_email && (
                                        <div className="flex items-center gap-3">
                                            <Building2 className="w-4 h-4 text-gray-500" />
                                            <a href={`mailto:${event.organizer_email}`} className="text-blue-600 hover:underline text-sm font-medium">
                                                {event.organizer_email}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="font-semibold text-blue-900 mb-1">Direct Confirmation</p>
                                            <p className="text-sm text-blue-800">
                                                The organizer has not provided specific payment instructions.
                                                Confirm your registration now to reserve your spot and receive a confirmation email.
                                                This helps us track attendance and keep you updated!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <Button
                                className="w-full py-4 text-lg font-semibold rounded-xl bg-green-600 hover:bg-green-700"
                                onClick={handleConfirmPayment}
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle className="w-5 h-5 mr-2" />}
                                I've Paid — Reserve My Spot
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full py-3 rounded-xl"
                                onClick={() => setStep('select')}
                            >
                                Back
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step: Done */}
                {step === 'done' && (
                    <div className="p-6 space-y-6 text-center">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                                <PartyPopper className="w-10 h-10 text-green-600" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                {isEffectivelyFree ? "You're In!" : 'Ticket Reserved!'}
                            </h3>
                            <p className="text-gray-600">
                                {isEffectivelyFree
                                    ? `Your registration for ${event.title} is confirmed.`
                                    : `Your spot is reserved. The organizer will verify your payment.`
                                }
                            </p>
                        </div>

                        {registration && (
                            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-left">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Ticket ID</span>
                                    <span className="font-mono font-bold text-gray-900">{registration.id.slice(0, 8).toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Quantity</span>
                                    <span className="font-medium text-gray-900">{registration.quantity}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Status</span>
                                    <Badge className={isEffectivelyFree || registration.payment_status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                                        {isEffectivelyFree || registration.payment_status === 'confirmed' ? 'Confirmed' : 'Pending Verification'}
                                    </Badge>
                                </div>
                            </div>
                        )}

                        <p className="text-sm text-gray-500">
                            A confirmation email has been sent to your inbox.
                        </p>

                        <Button className="w-full py-3 rounded-xl bg-black hover:bg-gray-800" onClick={onClose}>
                            Done
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketPurchaseModal;
