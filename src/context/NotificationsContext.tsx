import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@clerk/clerk-react';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    link?: string;
    is_read: boolean;
    created_at: string;
}

interface NotificationsContextType {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    addNotification: (notification: Omit<Notification, 'id' | 'created_at' | 'is_read'>) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useUser();
    const { toast } = useToast();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchNotifications = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50); // Fetch last 50 notifications

            if (error) throw error;
            setNotifications(data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial fetch and Realtime subscription
    useEffect(() => {
        if (!user) return;

        fetchNotifications();

        const channel = supabase
            .channel('notifications_changes')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to all events (INSERT, UPDATE)
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    // Refresh on any change
                    // Optimization: We could manually update state based on payload type
                    fetchNotifications();

                    // Show toast for new notifications
                    if (payload.eventType === 'INSERT') {
                        const newNote = payload.new as Notification;
                        toast({
                            title: newNote.title,
                            description: newNote.message,
                            variant: 'default'
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const markAsRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));

        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            // Revert if needed, but usually fine
        }
    };

    const markAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

        if (!user) return;
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', user.id)
                .eq('is_read', false); // Only update unread ones

            if (error) throw error;
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));

        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const addNotification = async (notification: Omit<Notification, 'id' | 'created_at' | 'is_read'>) => {
        // This helper allows client-side triggering (e.g. for testing or local actions)
        // Usually you trigger via DB insert
        try {
            const { error } = await supabase
                .from('notifications')
                .insert([{ ...notification }])

            if (error) throw error;
        } catch (error) {
            console.error('Error adding notification:', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <NotificationsContext.Provider value={{
            notifications,
            unreadCount,
            isLoading,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            addNotification
        }}>
            {children}
        </NotificationsContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationsContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationsProvider');
    }
    return context;
};
