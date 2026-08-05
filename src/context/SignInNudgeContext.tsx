import { createContext, useCallback, useContext, useState, ReactNode } from 'react';
import { useUser } from '@clerk/clerk-react';

// §5 cross-vertical: "consistent sign-in nudge sheet for gated actions
// (one component, warm copy, not a dead button) — fixes §A silent no-ops."
//
// This provider is mounted above AudioPlayerProvider (outside BrowserRouter)
// so toggleLike — and anything else gated deep in a context, not just a page
// component — can call requireSignIn(). It only holds state; the actual
// <SignInNudgeSheet> is rendered separately, inside BrowserRouter, because
// it needs useNavigate/useLocation.

interface SignInNudgeContextValue {
    open: boolean;
    reason?: string;
    close: () => void;
    // Returns true if the caller may proceed (already signed in). If not
    // signed in, opens the nudge sheet and returns false — callers should
    // bail out on a false return, same shape as the `if (!user) return`
    // checks this replaces.
    requireSignIn: (reason?: string) => boolean;
}

const SignInNudgeContext = createContext<SignInNudgeContextValue | null>(null);

export const SignInNudgeProvider = ({ children }: { children: ReactNode }) => {
    const { isSignedIn } = useUser();
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState<string | undefined>();

    const requireSignIn = useCallback((r?: string) => {
        if (isSignedIn) return true;
        setReason(r);
        setOpen(true);
        return false;
    }, [isSignedIn]);

    const close = useCallback(() => setOpen(false), []);

    return (
        <SignInNudgeContext.Provider value={{ open, reason, close, requireSignIn }}>
            {children}
        </SignInNudgeContext.Provider>
    );
};

export const useSignInNudge = () => {
    const ctx = useContext(SignInNudgeContext);
    // Fallback (no sheet, but doesn't block signed-in users) if a caller
    // ever renders outside the provider — same defensive pattern as useShare.
    const { isSignedIn } = useUser();
    return ctx ?? { open: false, reason: undefined, close: () => {}, requireSignIn: () => !!isSignedIn };
};
