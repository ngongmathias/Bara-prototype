import { supabase } from '@/lib/supabase';

// Thin wrapper around the log_admin_action RPC (§L12 —
// 20260805_admin_command_center.sql). Fire-and-forget: a failed audit
// write should never block the admin action itself.
export async function logAdminAction(action: string, details?: Record<string, unknown>, target?: { userId?: string; email?: string }): Promise<void> {
    try {
        await supabase.rpc('log_admin_action', {
            p_action: action,
            p_target_user_id: target?.userId ?? null,
            p_target_email: target?.email ?? null,
            p_details: details ?? null,
        });
    } catch (error) {
        console.warn('Failed to write admin audit log:', error);
    }
}
