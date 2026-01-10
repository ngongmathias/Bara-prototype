import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

export const useUserAutoCreate = () => {
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    const createUserIfNotExists = async () => {
      if (!isLoaded || !isSignedIn || !user) return;

      try {
        // Check if user already exists in your database
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single();

        // If user doesn't exist, create a new record
        if (!existingUser) {
          const { error: createError } = await supabase
            .from('users')
            .upsert({
              id: user.id,
              email: user.primaryEmailAddress?.emailAddress || '',
              first_name: user.firstName || '',
              last_name: user.lastName || '',
              username: user.username || user.primaryEmailAddress?.emailAddress?.split('@')[0] || '',
              avatar_url: user.imageUrl || '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              is_active: true,
              last_login: new Date().toISOString(),
            });

          if (createError) {
            console.error('Error creating user:', createError);
            toast({
              title: 'Error',
              description: 'Failed to create user profile',
              variant: 'destructive',
            });
          } else {
            console.log('User profile created successfully');
          }
        } else {
          // Update last login time for existing users
          await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', user.id);
        }
      } catch (error) {
        console.error('Error in user auto-creation:', error);
      }
    };

    createUserIfNotExists();
  }, [isLoaded, isSignedIn, user]);

  return null;
};
