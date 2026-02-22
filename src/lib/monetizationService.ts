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

    /**
     * Record a platform commission on a marketplace transaction.
     * Commission rate: 5% of sale price (configurable).
     */
    static async recordMarketplaceCommission(
        listingId: string,
        sellerId: string,
        buyerId: string,
        salePrice: number,
        currency: string = 'USD',
        commissionRate: number = 0.05
    ): Promise<{ success: boolean; commissionAmount: number }> {
        const commissionAmount = salePrice * commissionRate;
        try {
            const { error } = await supabase
                .from('platform_commissions')
                .insert({
                    item_id: listingId,
                    item_type: 'listing',
                    seller_id: sellerId,
                    buyer_id: buyerId,
                    sale_price: salePrice,
                    commission_rate: commissionRate,
                    commission_amount: commissionAmount,
                    currency,
                    status: 'pending',
                });

            if (error) {
                console.warn('[MonetizationService] Commission recording failed:', error);
                return { success: false, commissionAmount: 0 };
            }
            return { success: true, commissionAmount };
        } catch (err) {
            console.warn('[MonetizationService] Unexpected commission error:', err);
            return { success: false, commissionAmount: 0 };
        }
    }

    /**
     * Record a platform commission on an event ticket sale.
     * Commission rate: 3% of ticket price (configurable).
     */
    static async recordTicketCommission(
        eventId: string,
        organizerId: string,
        buyerId: string,
        ticketPrice: number,
        currency: string = 'USD',
        commissionRate: number = 0.03
    ): Promise<{ success: boolean; commissionAmount: number }> {
        const commissionAmount = ticketPrice * commissionRate;
        try {
            const { error } = await supabase
                .from('platform_commissions')
                .insert({
                    item_id: eventId,
                    item_type: 'event',
                    seller_id: organizerId,
                    buyer_id: buyerId,
                    sale_price: ticketPrice,
                    commission_rate: commissionRate,
                    commission_amount: commissionAmount,
                    currency,
                    status: 'pending',
                });

            if (error) {
                console.warn('[MonetizationService] Ticket commission recording failed:', error);
                return { success: false, commissionAmount: 0 };
            }
            return { success: true, commissionAmount };
        } catch (err) {
            console.warn('[MonetizationService] Unexpected ticket commission error:', err);
            return { success: false, commissionAmount: 0 };
        }
    }

    /**
     * Get total commissions earned by the platform, optionally filtered by type.
     */
    static async getPlatformCommissions(itemType?: MonetizableItemType) {
        let query = supabase
            .from('platform_commissions')
            .select('*')
            .order('created_at', { ascending: false });

        if (itemType) {
            query = query.eq('item_type', itemType);
        }

        const { data, error } = await query;

        if (error) {
            console.error('[MonetizationService] Error fetching commissions:', error);
            return [];
        }
        return data;
    }
}
