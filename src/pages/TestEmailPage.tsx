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

    const handleTestQueueEmail = async () => {
        if (!testEmail) {
            toast({ title: 'Error', description: 'Please enter an email address', variant: 'destructive' });
            return;
        }

        setLoading('queue');
        try {
            const { error } = await supabase
                .from('email_queue')
                .insert({
                    to_email: testEmail,
                    subject: 'Queue System Test - Bara Afrika',
                    html_content: '<p>This is a test of the database-driven email queue system.</p>',
                    metadata: { type: 'test_manual' }
                });

            if (error) throw error;

            toast({
                title: 'Enqueued!',
                description: 'Record added to email_queue table. Check Supabase to verify.',
            });
        } catch (error) {
            console.error('Error enqueuing email:', error);
            toast({
                title: 'Error',
                description: 'Failed to enqueue email.',
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

                    <Card className="mb-8 border-blue-200 bg-blue-50/50">
                        <CardHeader>
                            <CardTitle className="flex items-center text-blue-700">
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
                                        autoComplete="off"
                                        className="bg-white"
                                    />
                                    <p className="text-sm text-blue-600 mt-2">
                                        <strong>Tip:</strong> Use this to verify that your Supabase edge function can reach your target address.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-8">
                        <div>
                            <h2 className="text-xl font-semibold mb-4 text-gray-700">1. Direct Edge Function Test (Old System)</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm font-medium">Welcome Email</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Button
                                            onClick={handleTestWelcomeEmail}
                                            disabled={loading === 'welcome' || !testEmail}
                                            className="w-full"
                                            variant="outline"
                                        >
                                            {loading === 'welcome' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                                            Test Welcome
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm font-medium">Ticket Receipt</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Button
                                            onClick={handleTestTicketEmail}
                                            disabled={loading === 'ticket' || !testEmail}
                                            className="w-full"
                                            variant="outline"
                                        >
                                            {loading === 'ticket' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                                            Test Ticket
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-4 text-gray-700">2. Database Queue Test (New System)</h2>
                            <Card className="border-green-200">
                                <CardHeader className="bg-green-50/50">
                                    <CardTitle className="flex items-center text-green-700">
                                        <Mail className="mr-2 h-5 w-5" />
                                        Test email_queue table
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <p className="text-sm text-gray-600 mb-4">
                                        This test inserts a record directly into the <strong>email_queue</strong> table.
                                        If you have set up a Database Webhook to trigger your edge function on INSERT,
                                        this will verify the entire end-to-end automated flow.
                                    </p>
                                    <Button
                                        onClick={handleTestQueueEmail}
                                        disabled={loading === 'queue' || !testEmail}
                                        className="w-full bg-green-600 hover:bg-green-700"
                                    >
                                        {loading === 'queue' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                                        Insert into Queue
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestEmailPage;
