import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";

interface UserAuthGuardProps {
  children: ReactNode;
}

export const UserAuthGuard = ({ children }: UserAuthGuardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!isSignedIn) {
      // User is not signed in, redirect to sign-in with redirect back to current page
      const currentPath = location.pathname + location.search;
      navigate(`/user/sign-in?redirect_url=${encodeURIComponent(currentPath)}`);
      return;
    }
  }, [isSignedIn, isLoaded, navigate, location]);

  // Show loading while checking authentication
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading if not signed in (while redirecting)
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
};