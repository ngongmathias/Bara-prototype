import { useCallback, useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';
import { STALE_AFTER_DAYS } from '@/lib/orderStatus';

/**
 * What needs a human today, across the whole admin console.
 *
 * The console is 48 pages. Nothing tells an admin which of them has work
 * waiting, so queues are only found by remembering to look — which is how 10
 * event registrations sat unconfirmed since February, and why a manual-payment
 * model needs this to exist at all: "someone will action it" is only true if
 * someone can see it.
 *
 * Each queue is fetched independently and failures are swallowed per-queue: a
 * locked-down table or a missing migration should grey out one row, never blank
 * the dashboard.
 */

export interface WorkQueueItem {
  key: string;
  label: string;
  /** Null means the count couldn't be read (permissions, missing table). */
  count: number | null;
  href: string;
  /** Waiting on an outside party rather than on us. */
  informational?: boolean;
}

const staleCutoffIso = () =>
  new Date(Date.now() - STALE_AFTER_DAYS * 24 * 60 * 60 * 1000).toISOString();

export function useAdminWorkQueue() {
  const { user } = useUser();
  const [items, setItems] = useState<WorkQueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = useCallback(async () => {
    // No signed-in user means the admin-gated RPCs can't be called. Clear the
    // loading flag rather than returning early — otherwise the card renders a
    // skeleton forever, which is what happens on any transient null user (and
    // in the local VITE_ADMIN_PREVIEW mode, where Clerk never initialises).
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    // Counting a table directly, returning null rather than throwing.
    const countWhere = async (
      table: string,
      column: string,
      value: string,
      olderThan?: string
    ): Promise<number | null> => {
      try {
        let q = supabase.from(table).select('id', { count: 'exact', head: true }).eq(column, value);
        if (olderThan) q = q.lt('created_at', olderThan);
        const { count, error } = await q;
        return error ? null : count ?? 0;
      } catch {
        return null;
      }
    };

    // verification_requests and content_reports have no direct grants by design
    // (RPC-only, like the rest of the moderation surface), so they're counted
    // through their admin RPCs. Both gate on admin_users using the p_admin_id
    // argument rather than the JWT, so the plain client is enough — and both
    // accept p_status, so the filtering happens in the database rather than by
    // pulling every row back to count a subset.
    const countViaRpc = async (fn: string): Promise<number | null> => {
      try {
        const { data, error } = await supabase.rpc(fn, {
          p_admin_id: user.id,
          p_status: 'pending',
        });
        if (error || !Array.isArray(data)) return null;
        return data.length;
      } catch {
        return null;
      }
    };

    const cutoff = staleCutoffIso();

    const [
      verifications,
      contentReports,
      artistClaims,
      contactMessages,
      packageRequests,
      adRequests,
      staleOrders,
      staleRegistrations,
    ] = await Promise.all([
      countViaRpc('verification_admin_list'),
      countViaRpc('content_reports_admin_list'),
      countWhere('artist_claims', 'status', 'pending'),
      countWhere('contact_messages', 'status', 'unread'),
      countWhere('business_package_subscriptions', 'status', 'pending_payment'),
      countWhere('advertising_requests', 'status', 'pending_payment'),
      countWhere('marketplace_transactions', 'payment_status', 'pending', cutoff),
      countWhere('event_registrations', 'payment_status', 'pending', cutoff),
    ]);

    setItems([
      { key: 'verifications', label: 'Verification requests', count: verifications, href: '/admin/verifications' },
      { key: 'content-reports', label: 'Content reports', count: contentReports, href: '/admin/content-reports' },
      { key: 'artist-claims', label: 'Artist claims', count: artistClaims, href: '/admin/artist-claims' },
      { key: 'contact-messages', label: 'Unread messages', count: contactMessages, href: '/admin/contact-messages' },
      { key: 'packages', label: 'Package requests awaiting payment', count: packageRequests, href: '/admin/packages' },
      { key: 'advertising', label: 'Advertising requests awaiting payment', count: adRequests, href: '/admin/packages' },
      // These two are waiting on a seller or organizer, not on the team — shown
      // so nothing rots unnoticed, but not counted as admin to-dos.
      { key: 'stale-orders', label: `Marketplace orders unpaid over ${STALE_AFTER_DAYS} days`, count: staleOrders, href: '/admin/marketplace', informational: true },
      { key: 'stale-registrations', label: `Event registrations unconfirmed over ${STALE_AFTER_DAYS} days`, count: staleRegistrations, href: '/admin/events', informational: true },
    ]);
    setLoading(false);
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const actionable = items
    .filter((i) => !i.informational)
    .reduce((sum, i) => sum + (i.count ?? 0), 0);

  return { items, loading, actionable, refresh: fetchQueue };
}
