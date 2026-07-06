import { supabase } from './supabase';

/**
 * Phase 27.8.2 — Account verification for businesses & artists.
 * Verification = a form + uploaded documents, reviewed by an admin. All
 * table access goes through SECURITY DEFINER RPCs
 * (20260708_verification_requests.sql); docs live in the private
 * `verification-docs` bucket and are read via short-lived signed URLs.
 */

export type VerificationAccountType = 'business' | 'artist';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface VerificationRequestSummary {
    id: string;
    account_type: VerificationAccountType;
    status: VerificationStatus;
    reviewer_notes: string | null;
    created_at: string;
    reviewed_at: string | null;
}

// The exact required-docs list is TBD with the team — keep it configurable.
export const REQUIRED_DOCS: Record<VerificationAccountType, string[]> = {
    business: [
        'Government-issued ID of the owner or representative',
        'Business registration certificate or trade licence',
        'Proof of address (utility bill or bank statement, last 3 months)',
    ],
    artist: [
        'Government-issued ID',
        'Proof of artist identity (press kit, distributor profile, or social account with your catalogue)',
    ],
};

export class VerificationService {
    /** Upload one document to the private bucket; returns its storage path. */
    static async uploadDoc(userId: string, file: File): Promise<string> {
        const ext = file.name.split('.').pop() || 'pdf';
        const path = `${userId}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage
            .from('verification-docs')
            .upload(path, file, { contentType: file.type });
        if (error) throw error;
        return path;
    }

    /** Short-lived signed URL for an uploaded doc (admin review). */
    static async getDocUrl(path: string): Promise<string | null> {
        try {
            const { data, error } = await supabase.storage
                .from('verification-docs')
                .createSignedUrl(path, 60 * 10); // 10 minutes
            if (error) throw error;
            return data?.signedUrl ?? null;
        } catch (error) {
            console.error('Error signing verification doc URL:', error);
            return null;
        }
    }

    static async submit(
        userId: string,
        accountType: VerificationAccountType,
        submitted: Record<string, any>,
        docPaths: string[],
    ): Promise<{ success: boolean; error?: string }> {
        try {
            const { data, error } = await supabase.rpc('verification_submit', {
                p_user_id: userId,
                p_account_type: accountType,
                p_submitted: submitted,
                p_doc_paths: docPaths,
            });
            if (error) throw error;
            const r = data as any;
            return { success: !!r?.success, error: r?.error };
        } catch (error) {
            console.error('Error submitting verification request:', error);
            return { success: false, error: 'rpc_failed' };
        }
    }

    static async myRequests(userId: string): Promise<VerificationRequestSummary[]> {
        try {
            const { data, error } = await supabase.rpc('verification_my_requests', { p_user_id: userId });
            if (error) throw error;
            return (data as VerificationRequestSummary[]) || [];
        } catch (error) {
            console.error('Error fetching verification requests:', error);
            return [];
        }
    }

    static async adminList(adminId: string, status?: VerificationStatus): Promise<any[]> {
        try {
            const { data, error } = await supabase.rpc('verification_admin_list', {
                p_admin_id: adminId,
                p_status: status ?? null,
            });
            if (error) throw error;
            return (data as any[]) || [];
        } catch (error) {
            console.error('Error fetching admin verification queue:', error);
            return [];
        }
    }

    static async adminReview(
        adminId: string,
        requestId: string,
        approve: boolean,
        notes: string,
    ): Promise<{ success: boolean; error?: string }> {
        try {
            const { data, error } = await supabase.rpc('verification_admin_review', {
                p_admin_id: adminId,
                p_request_id: requestId,
                p_approve: approve,
                p_notes: notes || null,
            });
            if (error) throw error;
            const r = data as any;
            return { success: !!r?.success, error: r?.error };
        } catch (error) {
            console.error('Error reviewing verification request:', error);
            return { success: false, error: 'rpc_failed' };
        }
    }

    /**
     * Is this user already verified (or pending) for the given account type?
     * Used by the strategic nudges so they never nag verified/pending users.
     */
    static async getStatus(userId: string, accountType: VerificationAccountType): Promise<VerificationStatus | 'none'> {
        try {
            if (accountType === 'artist') {
                const { data } = await supabase
                    .from('artists').select('is_verified').eq('user_id', userId).maybeSingle();
                if ((data as any)?.is_verified) return 'approved';
            } else {
                const { data } = await supabase
                    .from('marketplace_partners').select('verification_level').eq('owner_user_id', userId).maybeSingle();
                const level = (data as any)?.verification_level;
                if (level && level !== 'unverified') return 'approved';
            }
            const requests = await this.myRequests(userId);
            const match = requests.find((r) => r.account_type === accountType);
            return match ? match.status : 'none';
        } catch {
            return 'none';
        }
    }
}
