import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { supabase } from '@/lib/supabase';
import { Loader2, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

export const TestEmailPage = () => {
    const { user } = useUser();
    const { toast } = useToast();
    const [loading, setLoading] = useState<string | null>(null);
    const [testEmail, setTestEmail] = useState('');

    const handleTestWelcomeEmail = async () => {
        if (!testEmail) {
            toast({ title: 'Error', description: 'Please enter an email address', variant: 'destructive' });
            return;
        }

        setLoading('welcome');
        try {
            const { data, error } = await supabase.functions.invoke('send-email', {
                body: {
                    to: testEmail,
                    subject: 'Welcome to Bara Afrika! (Test)',
                    type: 'welcome',
                    data: {
                        name: user?.firstName || 'Tester',
                    },
                },
            });

            if (error) throw error;

            toast({
                title: 'Success',
                description: 'Welcome email sent successfully!',
            });
        } catch (error) {
            console.error('Error sending welcome email:', error);
            toast({
                title: 'Error',
                description: 'Failed to send welcome email.',
                variant: 'destructive',
            });
        } finally {
            setLoading(null);
        }
    };

    const handleTestTicketEmail = async () => {
        if (!testEmail) {
            toast({ title: 'Error', description: 'Please enter an email address', variant: 'destructive' });
            return;
        }

        setLoading('ticket');
        try {
            const { data, error } = await supabase.functions.invoke('send-email', {
                body: {
                    to: testEmail,
                    subject: 'Order Confirmed: Test Event (Test)',
                    type: 'ticket_purchased',
                    data: {
                        userFirstname: user?.firstName || 'Tester',
                        eventName: 'Kigali Jazz Festival 2026',
                        eventDate: 'October 15, 2026',
                        ticketCount: 2,
                        totalAmount: 'RWF 15,000',
                        ticketId: `TEST-${Math.floor(Math.random() * 10000)}`
                    },
                },
            });

            if (error) throw error;

            toast({
                title: 'Success',
                description: 'Ticket email sent successfully!',
            });
        } catch (error) {
            console.error('Error sending ticket email:', error);
            toast({
                title: 'Error',
                description: 'Failed to send ticket email.',
                variant: 'destructive',
            });
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">Email System Tester</h1>

                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Mail className="mr-2 h-5 w-5" />
                                Test Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <Label>Target Email Address</Label>
                                    <Input
                                        value={testEmail}
                                        onChange={(e) => setTestEmail(e.target.value)}
                                        placeholder="Enter your email to receive tests..."
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Enter the email where you want to receive the test emails.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Welcome Email</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 mb-4">
                                    Tests the "Welcome to Bara" email sent to new users.
                                </p>
                                <Button
                                    onClick={handleTestWelcomeEmail}
                                    disabled={loading === 'welcome' || !testEmail}
                                    className="w-full"
                                >
                                    {loading === 'welcome' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                                    Send Welcome Email
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Ticket Purchase</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 mb-4">
                                    Tests the "Order Confirmed" email with dummy ticket data.
                                </p>
                                <Button
                                    onClick={handleTestTicketEmail}
                                    disabled={loading === 'ticket' || !testEmail}
                                    className="w-full"
                                >
                                    {loading === 'ticket' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                                    Send Ticket Email
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestEmailPage;
