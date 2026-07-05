import { supabase } from './supabase';
import { emitCoinEvent } from './gamificationService';

const REF_STORAGE_KEY = 'bara_ref';

/**
 * Phase 27.2.2 — Referral program.
 * Codes are captured at sign-up (?ref=), stashed in sessionStorage so they
 * survive the Clerk email-verification / OAuth redirect, and turned into a
 * pending `referrals` row once the Supabase profile exists. Activation (paying
 * both parties + milestone bonuses) happens on the referred user's first
 * claimed mission, entirely inside the referral_activate RPC.
 */
export class ReferralService {
    /** Read a ?ref= code from the current URL. */
    static getRefFromUrl(): string | null {
        try {
            const code = new URLSearchParams(window.location.search).get('ref');
            return code ? code.trim() : null;
        } catch {
            return null;
        }
    }

    /** Persist a captured code so it survives the verification/OAuth redirect. */
    static stashRef(code: string | null | undefined): void {
        if (code && code.trim()) {
            try { sessionStorage.setItem(REF_STORAGE_KEY, code.trim()); } catch { /* ignore */ }
        }
    }

    static peekStashedRef(): string | null {
        try { return sessionStorage.getItem(REF_STORAGE_KEY); } catch { return null; }
    }

    static clearStashedRef(): void {
        try { sessionStorage.removeItem(REF_STORAGE_KEY); } catch { /* ignore */ }
    }

    /**
     * Create the pending referral row (call right after the new user's
     * clerk_users profile row is created). Uses the captured code, falling back
     * to whatever is stashed in sessionStorage. Server enforces self-referral +
     * one-per-user guards. Always clears the stash afterwards.
     */
    static async createReferralOnSignup(referredUserId: string, code?: string | null): Promise<void> {
        const refCode = (code && code.trim()) || this.peekStashedRef();
        if (!refCode || !referredUserId) {
            this.clearStashedRef();
            return;
        }
        try {
            await supabase.rpc('referral_create', {
                p_referred_user_id: referredUserId,
                p_code: refCode,
            });
        } catch (error) {
            console.error('Error creating referral:', error);
        } finally {
            this.clearStashedRef();
        }
    }

    /**
     * Activate a pending referral on the referred user's first claimed mission.
     * Idempotent server-side (no-op if there's no pending referral). Emits a
     * coin event for the friend's bonus so the header updates immediately.
     */
    static async activateOnFirstClaim(userId: string): Promise<void> {
        if (!userId) return;
        try {
            const { data, error } = await supabase.rpc('referral_activate', {
                p_referred_user_id: userId,
            });
            if (error) throw error;
            const r = data as any;
            if (r?.activated && Number(r.friend_coins) > 0) {
                emitCoinEvent(Number(r.friend_coins), 'Referral bonus');
            }
        } catch (error) {
            console.error('Error activating referral:', error);
        }
    }

    /** Live referral stats for the current user's Invite page. */
    static async getReferralStats(userId: string): Promise<{ code: string | null; total: number; activated: number }> {
        const empty = { code: null as string | null, total: 0, activated: 0 };
        if (!userId) return empty;
        try {
            const [{ data: profile }, { data: rows }] = await Promise.all([
                supabase.from('clerk_users').select('referral_code').eq('clerk_user_id', userId).maybeSingle(),
                supabase.from('referrals').select('status').eq('referrer_user_id', userId),
            ]);
            const list = rows || [];
            return {
                code: (profile as any)?.referral_code ?? null,
                total: list.length,
                activated: list.filter((r: any) => r.status === 'activated').length,
            };
        } catch (error) {
            console.error('Error fetching referral stats:', error);
            return empty;
        }
    }
}
