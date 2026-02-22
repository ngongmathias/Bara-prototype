import { supabase } from './supabase';

export type MonetizableItemType = 'listing' | 'banner' | 'song' | 'event';
export type InteractionType = 'impression' | 'click';

export class MonetizationService {
    /**
     * Tracks an interaction (impression or click) for a monetizable item.
     * Uses a secure RPC call to atomically update the underlying data engine.
     */
    static async trackInteraction(
        itemId: string,
        itemType: MonetizableItemType,
        interactionType: InteractionType,
        cost: number = 0
    ): Promise<void> {
        try {
            const { error } = await supabase.rpc('track_interaction', {
                p_item_id: itemId,
                p_item_type: itemType,
                p_interaction_type: interactionType,
                p_cost: cost
            });

            if (error) {
                // We use warn instead of error to prevent blocking UI on analytics failures
                console.warn(`[MonetizationService] Tracking failed for ${itemType} ${itemId}:`, error);
            }
        } catch (err) {
            console.warn('[MonetizationService] Unexpected error during tracking:', err);
        }
    }

    /**
     * Fetch ROI stats for a specific user's items.
     * Useful for building the "Performance Dashboard".
     */
    static async getStatsForItem(itemId: string, itemType: MonetizableItemType) {
        const { data, error } = await supabase
            .from('monetization_stats')
            .select('*')
            .eq('item_id', itemId)
            .eq('item_type', itemType)
            .order('event_date', { ascending: true });

        if (error) {
            console.error('[MonetizationService] Error fetching stats:', error);
            return [];
        }
        return data;
    }

    /**
     * Get aggregate stats for a user's entire portfolio.
     */
    static async getUserPortfolioStats(itemIds: string[], itemType: MonetizableItemType) {
        const { data, error } = await supabase
            .from('monetization_stats')
            .select('*')
            .in('item_id', itemIds)
            .eq('item_type', itemType);

        if (error) {
            console.error('[MonetizationService] Error fetching portfolio stats:', error);
            return [];
        }
        return data;
    }
}
