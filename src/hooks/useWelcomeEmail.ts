import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';

export const useWelcomeEmail = () => {
    const { user, isLoaded } = useUser();

    useEffect(() => {
        const checkWelcomeEmail = async () => {
            if (!isLoaded || !user || !user.id) return;

            try {
                // Check if profile exists and email status
                const { data: profile, error } = await supabase
                    .from('user_profiles')
                    .select('welcome_email_sent')
                    .eq('user_id', user.id)
                    .single();

                // If profile doesn't exist or email not sent, send it
                if (!profile || !profile.welcome_email_sent) {
                    console.log('Sending welcome email to:', user.primaryEmailAddress?.emailAddress);

                    // Send email
                    await supabase.functions.invoke('send-email', {
                        body: {
                            to: user.primaryEmailAddress?.emailAddress,
                            subject: 'Welcome to Bara Afrika!',
                            type: 'welcome',
                            data: {
                                userFirstname: user.firstName || 'User',
                            },
                        },
                    });

                    // Update/Insert profile to prevent resending
                    const { error: upsertError } = await supabase
                        .from('user_profiles')
                        .upsert({
                            user_id: user.id,
                            email: user.primaryEmailAddress?.emailAddress,
                            full_name: user.fullName,
                            welcome_email_sent: true,
                            updated_at: new Date().toISOString()
                        });

                    if (upsertError) console.error('Error updating profile:', upsertError);
                }
            } catch (err) {
                console.error('Error checking welcome email:', err);
            }
        };

        checkWelcomeEmail();
    }, [user, isLoaded]);
};
