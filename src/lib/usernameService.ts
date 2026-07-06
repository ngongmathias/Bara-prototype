import { supabase } from './supabase';

/**
 * Phase 27.8.1 — Auto-proposed usernames.
 * Sign-up no longer asks the user to invent a username: we derive one from
 * first + last name (lowercase, diacritics stripped, non-alphanumerics
 * removed) and, on collision, append the smallest free numeric suffix
 * (mathiasngong, mathiasngong2, mathiasngong3 …). The proposal is kept unless
 * the user changes it in profile settings. Uniqueness is global and
 * case-insensitive — enforced by a unique index on lower(username) in
 * clerk_users (20260708_username_unique_index.sql); client checks are UX only.
 */
export class UsernameService {
    /** "Mathías Ngong-Ngai" → "mathiasngongngai". Falls back to "user". */
    static deriveBase(firstName: string, lastName: string): string {
        const slug = `${firstName || ''}${lastName || ''}`
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '') // strip diacritics
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '');
        return slug.length >= 3 ? slug : (slug ? `${slug}user`.slice(0, 24) : 'user');
    }

    /** Case-insensitive availability check, optionally ignoring the user's own row. */
    static async isAvailable(username: string, excludeClerkUserId?: string): Promise<boolean> {
        const name = username.trim();
        if (!name) return false;
        let query = supabase.from('clerk_users').select('id').ilike('username', name);
        if (excludeClerkUserId) query = query.neq('clerk_user_id', excludeClerkUserId);
        const { data } = await query.maybeSingle();
        return !data?.id;
    }

    /**
     * Propose a free username for first + last name: the bare slug if free,
     * else the smallest free numeric suffix. One query fetches every taken
     * name starting with the base so the suffix is computed locally.
     */
    static async proposeUsername(firstName: string, lastName: string): Promise<string> {
        const base = this.deriveBase(firstName, lastName);
        try {
            const { data } = await supabase
                .from('clerk_users')
                .select('username')
                .ilike('username', `${base}%`)
                .limit(1000);
            const taken = new Set((data || []).map((r: any) => String(r.username || '').toLowerCase()));
            if (!taken.has(base)) return base;
            for (let i = 2; i < 10000; i++) {
                if (!taken.has(`${base}${i}`)) return `${base}${i}`;
            }
        } catch {
            /* fall through to a low-collision fallback */
        }
        return `${base}${Math.floor(Date.now() / 1000) % 100000}`;
    }

    /** Valid: 3–24 chars, letters/numbers only (matches what we auto-derive). */
    static validate(username: string): string | null {
        const name = username.trim();
        if (name.length < 3) return 'Username must be at least 3 characters.';
        if (name.length > 24) return 'Username must be 24 characters or fewer.';
        if (!/^[a-z0-9]+$/i.test(name)) return 'Only letters and numbers are allowed.';
        return null;
    }

    /**
     * Change the username from profile settings. The DB unique index on
     * lower(username) is the real guard — a race that slips past the
     * availability pre-check surfaces as a unique violation and is reported
     * as "taken" rather than saved.
     */
    static async updateUsername(clerkUserId: string, username: string): Promise<{ ok: boolean; error?: string }> {
        const name = username.trim().toLowerCase();
        const invalid = this.validate(name);
        if (invalid) return { ok: false, error: invalid };
        if (!(await this.isAvailable(name, clerkUserId))) {
            return { ok: false, error: 'That username is already taken.' };
        }
        const { error } = await supabase
            .from('clerk_users')
            .update({ username: name, updated_at: new Date().toISOString() })
            .eq('clerk_user_id', clerkUserId);
        if (error) {
            const taken = String(error.message || '').toLowerCase().includes('unique')
                || (error as any).code === '23505';
            return { ok: false, error: taken ? 'That username is already taken.' : 'Could not save username. Please try again.' };
        }
        return { ok: true };
    }
}
