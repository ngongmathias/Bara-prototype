import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { 
  ArrowLeft, 
  Send,
  MessageCircle
} from "lucide-react";

interface ChatThread {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
  marketplace_listings: {
    title: string;
    price: number;
    seller_name: string;
  };
}

interface ChatMessage {
  id: string;
  thread_id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

export const UserMessagesPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user) {
      fetchThreads();
    }
  }, [user]);

  useEffect(() => {
    const listingId = searchParams.get('listing');
    if (listingId && threads.length > 0) {
      const thread = threads.find(t => t.listing_id === listingId);
      if (thread) {
        setSelectedThread(thread);
        fetchMessages(thread.id);
      }
    }
  }, [searchParams, threads]);

  useEffect(() => {
    if (selectedThread) {
      const subscription = supabase
        .channel(`thread:${selectedThread.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'marketplace_chat_messages',
            filter: `thread_id=eq.${selectedThread.id}`
          },
          (payload) => {
            setMessages(prev => [...prev, payload.new as ChatMessage]);
            scrollToBottom();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [selectedThread]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchThreads = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('marketplace_chat_threads')
        .select(`
          *,
          marketplace_listings (
            title,
            price,
            seller_name
          )
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setThreads(data || []);
    } catch (error: any) {
      console.error('Error fetching threads:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (threadId: string) => {
    try {
      const { data, error } = await supabase
        .from('marketplace_chat_messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedThread || !user) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('marketplace_chat_messages')
        .insert({
          thread_id: selectedThread.id,
          sender_id: user.id,
          message: newMessage.trim()
        });

      if (error) throw error;

      await supabase
        .from('marketplace_chat_threads')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedThread.id);

      setNewMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view messages</h1>
          <Button onClick={() => navigate('/user/signin')}>Sign In</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <Header />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/user/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-comfortaa font-bold text-black mb-2">Messages</h1>
          <p className="text-gray-600">Chat with buyers and sellers</p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Threads List */}
            <Card className="lg:col-span-1 overflow-hidden">
              <CardContent className="p-0">
                <div className="h-[600px] overflow-y-auto">
                  {threads.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No conversations yet</p>
                    </div>
                  ) : (
                    threads.map((thread) => (
                      <button
                        key={thread.id}
                        onClick={() => {
                          setSelectedThread(thread);
                          fetchMessages(thread.id);
                        }}
                        className={`w-full p-4 border-b hover:bg-gray-50 text-left transition-colors ${
                          selectedThread?.id === thread.id ? 'bg-gray-100' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {thread.marketplace_listings.seller_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">
                              {thread.marketplace_listings.title}
                            </p>
                            <p className="text-xs text-gray-600">
                              {thread.marketplace_listings.seller_name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              ${thread.marketplace_listings.price.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Messages Area */}
            <Card className="lg:col-span-2 overflow-hidden">
              <CardContent className="p-0 h-[600px] flex flex-col">
                {selectedThread ? (
                  <>
                    {/* Header */}
                    <div className="p-4 border-b bg-gray-50">
                      <h3 className="font-semibold">{selectedThread.marketplace_listings.title}</h3>
                      <p className="text-sm text-gray-600">
                        {selectedThread.marketplace_listings.seller_name}
                      </p>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.map((message) => {
                        const isSender = message.sender_id === user.id;
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                isSender
                                  ? 'bg-[#e64600] text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="text-sm">{message.message}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  isSender ? 'text-orange-100' : 'text-gray-500'
                                }`}
                              >
                                {new Date(message.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={sendMessage} className="p-4 border-t">
                      <div className="flex gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                          disabled={sending}
                        />
                        <Button
                          type="submit"
                          disabled={!newMessage.trim() || sending}
                          className="bg-[#e64600] hover:bg-[#cc3d00]"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <MessageCircle className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                      <p>Select a conversation to start messaging</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default UserMessagesPage;
