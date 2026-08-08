import { useCallback, useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useAuthedSupabase } from '@/hooks/useAuthedSupabase';
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
 * Two things this deliberately gets right, because the naive version is worse
 * than useless:
 *
 * 1. **Everything uses the authenticated client.** `artist_claims` is granted to
 *    `authenticated` only, and `marketplace_transactions` RLS keys on the JWT's
 *    `sub`. Queried with the plain anon client they return "0" rather than an
 *    error — a silent false all-clear.
 * 2. **Admin identity is checked up front.** The `*_admin_list` RPCs return an
 *    empty set (not an error) when the caller isn't a recognised admin, so a
 *    denied caller would otherwise read as "nothing pending". If the signed-in
 *    Clerk id has no `admin_users` row, those queues report as unreadable
 *    instead of empty.
 */

export interface WorkQueueItem {
  key: string;
  label: string;
  /** Null means the count couldn't be read — never render this as zero. */
  count: number | null;
  href: string;
  /** Waiting on an outside party rather than on us. */
  informational?: boolean;
}

const staleCutoffIso = () =>
  new Date(Date.now() - STALE_AFTER_DAYS * 24 * 60 * 60 * 1000).toISOString();

export function useAdminWorkQueue() {
  const { user } = useUser();
  const { getClient } = useAuthedSupabase();
  const [items, setItems] = useState<WorkQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  /**
   * True when the signed-in Clerk id has no active `admin_users` row. The admin
   * UI guard matches on email, but every SQL-side gate matches on user_id — so
   * these can disagree, and when they do the console looks fine while every
   * privileged call silently fails.
   */
  const [adminIdMismatch, setAdminIdMismatch] = useState(false);

  const fetchQueue = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const authed = await getClient();

    // Does the SQL side actually recognise this person as an admin?
    let isRecognisedAdmin = false;
    try {
      const { data } = await authed
        .from('admin_users')
        .select('user_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();
      isRecognisedAdmin = !!data;
    } catch {
      isRecognisedAdmin = false;
    }
    setAdminIdMismatch(!isRecognisedAdmin);

    const countWhere = async (
      table: string,
      column: string,
      value: string,
      olderThan?: string
    ): Promise<number | null> => {
      try {
        let q = authed.from(table).select('id', { count: 'exact', head: true }).eq(column, value);
        if (olderThan) q = q.lt('created_at', olderThan);
        const { count, error } = await q;
        return error ? null : count ?? 0;
      } catch {
        return null;
      }
    };

    // These RPCs gate on admin_users via p_admin_id and RETURN an empty set when
    // denied, so a zero from them is ambiguous. Only trust it if we know the
    // caller is a recognised admin.
    const countViaRpc = async (fn: string): Promise<number | null> => {
      if (!isRecognisedAdmin) return null;
      try {
        const { data, error } = await authed.rpc(fn, { p_admin_id: user.id, p_status: 'pending' });
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
      // Waiting on a seller or organizer, not on the team — shown so nothing
      // rots unnoticed, but not counted as admin to-dos.
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

  return { items, loading, actionable, adminIdMismatch, refresh: fetchQueue };
}
