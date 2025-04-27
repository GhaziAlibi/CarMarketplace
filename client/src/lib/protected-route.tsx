import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, RouteProps } from "wouter";
import { UserRole } from "@shared/schema";

interface ProtectedRouteProps extends RouteProps {
  component: React.ComponentType;
  roles?: UserRole[];
}

export function ProtectedRoute({
  path,
  component: Component,
  roles,
  ...rest
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  // If not authenticated, redirect to auth page
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // If roles are specified, check if user has required role
  if (roles && roles.length > 0) {
    const hasRequiredRole = roles.includes(user.role as UserRole) || user.role === UserRole.ADMIN;
    
    if (!hasRequiredRole) {
      return (
        <Route path={path}>
          <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-2xl font-bold mb-4">Unauthorized Access</h1>
            <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
            <a href="/" className="text-primary hover:text-primary-dark">Return to Home</a>
          </div>
        </Route>
      );
    }
  }

  return <Route path={path} component={Component} {...rest} />;
}
