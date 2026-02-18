import { supabase } from '@/lib/supabase';

interface ConversationResult {
    data: any;
    error: any;
}

export const MessagingService = {
    /**
     * Start a conversation with a user or get existing one
     */
    startConversation: async (currentUserId: string, otherUserId: string): Promise<string> => {
        // 1. Check if conversation exists
        // query: conversation_participants where user_id = currentUserId
        // AND conversation_id IN (conversation_participants where user_id = otherUserId)

        // This is complex in Supabase JS without writing a Postgres function.
        // Simpler: Fetch all my conversations, then check if otherUser is in them.

        // Fetch my conversations
        const { data: myConvos } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', currentUserId);

        if (myConvos && myConvos.length > 0) {
            const myConvoIds = myConvos.map(c => c.conversation_id);

            // Check if otherUser is in any of these
            const { data: existing } = await supabase
                .from('conversation_participants')
                .select('conversation_id')
                .in('conversation_id', myConvoIds)
                .eq('user_id', otherUserId)
                .limit(1);

            if (existing && existing.length > 0) {
                return existing[0].conversation_id;
            }
        }

        // 2. Create new conversation
        const { data: newConvo, error: createError } = await supabase
            .from('conversations')
            .insert({})
            .select('id')
            .single();

        if (createError) throw createError;
        const conversationId = newConvo.id;

        // 3. Add participants
        const { error: partError } = await supabase
            .from('conversation_participants')
            .insert([
                { conversation_id: conversationId, user_id: currentUserId },
                { conversation_id: conversationId, user_id: otherUserId }
            ]);

        if (partError) throw partError;

        return conversationId;
    }
};
