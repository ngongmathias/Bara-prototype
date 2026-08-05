import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { ClerkSupabaseBridge } from '@/lib/clerkSupabaseBridge';

// §L11 — admin_users.role has always been stored and read (AdminAuthGuard
// just checks *membership*, any role), but nothing has ever branched on
// *which* role — moderators and super_admins could do exactly the same
// destructive things. This is the first place that actually reads role to
// decide what's allowed, rather than just whether you're in the table at all.
export type AdminRole = 'super_admin' | 'admin' | 'moderator' | string;

export function useAdminRole() {
    const { user, isLoaded } = useUser();
    const [role, setRole] = useState<AdminRole | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoaded) return;
        if (!user) { setRole(null); setLoading(false); return; }
        ClerkSupabaseBridge.checkAdminStatus(user.id, user.primaryEmailAddress?.emailAddress || '')
            .then((status) => setRole(status.isAdmin ? (status.role || 'admin') : null))
            .finally(() => setLoading(false));
    }, [isLoaded, user?.id]);

    // Moderators can review/edit but not permanently destroy things —
    // deletes, bulk actions, and takedowns require admin or super_admin.
    const canDelete = role === 'super_admin' || role === 'admin';
    const isSuperAdmin = role === 'super_admin';

    return { role, loading, canDelete, isSuperAdmin };
}
