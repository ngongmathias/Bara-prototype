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

                // Welcome email is handled via database trigger on clerk_users INSERT.
                // We ensure the profile exists here.
                if (!profile) {
                    await supabase
                        .from('user_profiles')
                        .upsert({
                            user_id: user.id,
                            email: user.primaryEmailAddress?.emailAddress,
                            full_name: user.fullName,
                            welcome_email_sent: true,
                            updated_at: new Date().toISOString()
                        });
                }
            } catch (err) {
                console.error('Error checking welcome email:', err);
            }
        };

        checkWelcomeEmail();
    }, [user, isLoaded]);
};
