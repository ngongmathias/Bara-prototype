import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useUser } from '@clerk/clerk-react';
import { Header } from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquare, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
    id: string;
    updated_at: string;
    participants: {
        user_id: string;
    }[];
    last_message?: {
        content: string;
        created_at: string;
        is_read: boolean;
        sender_id: string;
    };
    otherUser?: {
        id: string;
        name: string; // Placeholder, would come from profiles
        email?: string;
    };
}

export const InboxPage = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchConversations();
        }
    }, [user]);

    const fetchConversations = async () => {
        try {
            // 1. Get all conversation IDs the user is part of
            const { data: myConvos, error: myConvosError } = await supabase
                .from('conversation_participants')
                .select('conversation_id')
                .eq('user_id', user!.id);

            if (myConvosError) throw myConvosError;

            if (!myConvos || myConvos.length === 0) {
                setConversations([]);
                setLoading(false);
                return;
            }

            const conversationIds = myConvos.map(c => c.conversation_id);

            // 2. Fetch conversation details + participants + Last Message
            // Supabase join syntax is tricky for "last message", usually easier to just fetch conversations
            // and separate queries, or use a view.
            // For prototype, we'll fetch conversations and then map.

            const { data: convosData, error: convosError } = await supabase
                .from('conversations')
                .select(`
          id,
          updated_at,
          participants:conversation_participants(user_id)
        `)
                .in('id', conversationIds)
                .order('updated_at', { ascending: false });

            if (convosError) throw convosError;

            // 3. Enrich with last message and "other user" logic
            const enrichedConvos = await Promise.all(convosData.map(async (convo: any) => {
                // Find other user ID
                const otherParticipant = convo.participants.find((p: any) => p.user_id !== user!.id);
                const otherUserId = otherParticipant ? otherParticipant.user_id : 'Unknown';

                // Fetch last message
                const { data: msgs } = await supabase
                    .from('messages')
                    .select('content, created_at, is_read, sender_id')
                    .eq('conversation_id', convo.id)
                    .order('created_at', { ascending: false })
                    .limit(1);

                const lastMsg = msgs && msgs.length > 0 ? msgs[0] : null;

                return {
                    ...convo,
                    last_message: lastMsg,
                    otherUser: {
                        id: otherUserId,
                        name: 'User ' + otherUserId.substring(0, 5) // Placeholder until profiles sync
                    }
                };
            }));

            setConversations(enrichedConvos);

        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold font-comfortaa">Messages</h1>
                </div>

                <Card className="min-h-[500px] flex flex-col">
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                            <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                            <p className="text-lg">No messages yet</p>
                            <p className="text-sm">Contact a seller to start a conversation</p>
                            <Button
                                variant="link"
                                onClick={() => navigate('/marketplace')}
                                className="mt-2 text-brand-blue"
                            >
                                Browse Marketplace
                            </Button>
                        </div>
                    ) : (
                        <ScrollArea className="flex-1">
                            <div className="divide-y">
                                {conversations.map((convo) => (
                                    <div
                                        key={convo.id}
                                        onClick={() => navigate(`/messages/${convo.id}`)}
                                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors flex gap-4 ${convo.last_message && !convo.last_message.is_read && convo.last_message.sender_id !== user?.id
                                                ? 'bg-blue-50/40'
                                                : ''
                                            }`}
                                    >
                                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                            <User className="h-6 w-6 text-gray-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-semibold text-gray-900 truncate">
                                                    {convo.otherUser?.name}
                                                </h3>
                                                {convo.last_message && (
                                                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                                        {formatDistanceToNow(new Date(convo.last_message.created_at), { addSuffix: true })}
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-sm truncate ${convo.last_message && !convo.last_message.is_read && convo.last_message.sender_id !== user?.id
                                                    ? 'font-medium text-gray-900'
                                                    : 'text-gray-500'
                                                }`}>
                                                {convo.last_message?.sender_id === user?.id ? 'You: ' : ''}
                                                {convo.last_message?.content || 'No messages'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </Card>
            </div>
        </div>
    );
};
