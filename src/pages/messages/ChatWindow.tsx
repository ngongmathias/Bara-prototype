import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useUser } from '@clerk/clerk-react';
import { Header } from '@/components/Header';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, ArrowLeft, User, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';

interface Message {
    id: string;
    sender_id: string;
    content: string;
    created_at: string;
    is_read: boolean;
}

export const ChatWindow = () => {
    const { conversationId } = useParams();
    const { user } = useUser();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [otherUserId, setOtherUserId] = useState<string | null>(null);

    useEffect(() => {
        if (conversationId && user) {
            loadConversation();
            subscribeToMessages();
        }
    }, [conversationId, user]);

    useEffect(() => {
        // Scroll to bottom when messages change
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const loadConversation = async () => {
        try {
            setIsLoading(true);

            // 1. Fetch messages
            const { data: msgs, error: msgError } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });

            if (msgError) throw msgError;
            setMessages(msgs || []);

            // 2. Fetch participants to identify "Other User"
            const { data: participants, error: partError } = await supabase
                .from('conversation_participants')
                .select('user_id')
                .eq('conversation_id', conversationId);

            if (!partError && participants) {
                const other = participants.find(p => p.user_id !== user?.id);
                if (other) setOtherUserId(other.user_id);
            }

        } catch (error) {
            console.error('Error loading chat:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const subscribeToMessages = () => {
        const channel = supabase
            .channel(`chat_${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`
                },
                (payload) => {
                    const newMsg = payload.new as Message;
                    setMessages(prev => [...prev, newMsg]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || !user || !conversationId) return;

        const content = newMessage.trim();
        setNewMessage(''); // Optimistic clear
        setIsSending(true);

        try {
            const { error } = await supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    sender_id: user.id,
                    content: content
                });

            if (error) throw error;
        } catch (error) {
            console.error('Error sending message:', error);
            // Restore message if failed (optional, for simple prototype skipping)
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 h-[calc(100vh-80px)]">
                <Card className="flex flex-col h-full border shadow-sm">
                    {/* Chat Header */}
                    <CardHeader className="py-3 px-4 border-b flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" onClick={() => navigate('/messages')}>
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div className="h-10 w-10 rounded-full bg-brand-blue/10 flex items-center justify-center">
                                <User className="h-5 w-5 text-brand-blue" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm md:text-base">
                                    {otherUserId ? `User ${otherUserId.substring(0, 5)}` : 'Chat'}
                                </h3>
                                <div className="flex items-center gap-1.5">
                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    <span className="text-xs text-muted-foreground">Online</span>
                                </div>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </CardHeader>

                    {/* Messages Area */}
                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50" ref={scrollRef}>
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="text-center py-10 text-gray-500 text-sm">
                                No messages yet. Start the conversation!
                            </div>
                        ) : (
                            messages.map((msg) => {
                                const isMe = msg.sender_id === user?.id;
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${isMe
                                                    ? 'bg-brand-blue text-white rounded-br-none'
                                                    : 'bg-white border text-gray-800 rounded-bl-none shadow-sm'
                                                }`}
                                        >
                                            <p>{msg.content}</p>
                                            <span
                                                className={`text-[10px] mt-1 block text-right ${isMe ? 'text-blue-100' : 'text-gray-400'
                                                    }`}
                                            >
                                                {format(new Date(msg.created_at), 'HH:mm')}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </CardContent>

                    {/* Input Area */}
                    <CardFooter className="py-3 px-4 border-t bg-white">
                        <form
                            className="flex w-full items-center gap-2"
                            onSubmit={handleSendMessage}
                        >
                            <Input
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="flex-1"
                                disabled={isLoading}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={!newMessage.trim() || isSending}
                                className="bg-brand-blue hover:bg-brand-blue/90"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};
