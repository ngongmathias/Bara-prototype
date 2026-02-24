import { ReactNode, useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser, useAuth, useClerk } from "@clerk/clerk-react";
import { ClerkSupabaseBridge } from "@/lib/clerkSupabaseBridge";
import { useToast } from "@/components/ui/use-toast";

interface AdminAuthGuardProps {
  children: ReactNode;
}

export const AdminAuthGuard = ({ children }: AdminAuthGuardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSignedIn, user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { openSignIn } = useClerk();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [adminInfo, setAdminInfo] = useState<any>(null);

  // Use refs to prevent dependency-induced infinite loops
  const hasCheckedRef = useRef(false);
  const hasShownWelcomeRef = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isLoaded || hasCheckedRef.current) return;
      hasCheckedRef.current = true;

      if (!isSignedIn) {
        // User is not signed in, prompt sign in and redirect to home
        toast({
          title: "Sign In Required",
          description: "Please sign in to access the admin panel",
        });
        navigate('/');
        openSignIn({ fallbackRedirectUrl: location.pathname });
        return;
      }

      try {
        // Get Clerk JWT token
        const token = await getToken();

        if (!token) {
          toast({
            title: "Authentication Error",
            description: "Unable to verify authentication token",
            variant: "destructive"
          });
          navigate('/');
          openSignIn({ fallbackRedirectUrl: location.pathname });
          return;
        }

        const userEmail = user.primaryEmailAddress?.emailAddress || '';

        // Check admin status from database (NO AUTO-GRANT)
        const adminStatus = await ClerkSupabaseBridge.checkAdminStatus(user.id, userEmail);

        // If user is not an admin, deny access
        if (!adminStatus.isAdmin) {
          console.log('Access denied: User is not in admin_users table');
          setIsAdmin(false);
          setIsChecking(false);

          toast({
            title: "Access Denied",
            description: "You don't have admin privileges. Contact a super admin for access.",
            variant: "destructive"
          });

          // Show error but don't redirect - let the user see the message
          return;
        }

        // User is an admin - update last login and grant access
        await ClerkSupabaseBridge.updateLastLogin(user.id);

        setAdminInfo(adminStatus.adminUser);
        setIsAdmin(true);
        setIsChecking(false);

        // Only show welcome message once after successful login
        if (!hasShownWelcomeRef.current) {
          toast({
            title: "Access Granted",
            description: `Welcome, ${adminStatus.role || 'Admin'}!`,
            variant: "default"
          });
          hasShownWelcomeRef.current = true;
        }

      } catch (error) {
        console.error('Error checking admin status:', error);
        toast({
          title: "Authentication Error",
          description: "Failed to verify admin status",
          variant: "destructive"
        });
        navigate('/');
      }
    };

    checkAdminStatus();
    // We use hasCheckedRef.current to prevent infinite loops, so we only need it to run when user/isLoaded changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, user?.id]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yp-blue mx-auto mb-4"></div>
          <p className="text-gray-600 font-roboto">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-comfortaa font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 font-roboto mb-4">You don't have permission to access the admin panel.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-yp-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-roboto"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}; 