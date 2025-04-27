import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@shared/schema';
import BuyerMessages from './buyer/messages';
import SellerMessages from './seller/messages';
import { Loader2 } from 'lucide-react';

// This is a wrapper component that redirects to the appropriate messages page
// based on the user's role
const MessagesPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [_, navigate] = useLocation();
  
  useEffect(() => {
    // If not loading and user is not authenticated, redirect to auth page
    if (!isLoading && !user) {
      navigate('/auth');
      return;
    }
    
    // If user is authenticated, redirect based on role
    if (user) {
      switch (user.role) {
        case UserRole.ADMIN:
          // Admin doesn't have a specialized messages page
          // Could redirect to an admin messages page in the future
          navigate('/admin/dashboard');
          break;
        case UserRole.SELLER:
          // The URL stays /messages but we'll render the seller messages component
          break;
        case UserRole.BUYER:
          // The URL stays /messages but we'll render the buyer messages component
          break;
        default:
          navigate('/');
          break;
      }
    }
  }, [user, isLoading, navigate]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect to auth page
  }
  
  // Render the appropriate messages component based on user role
  switch (user.role) {
    case UserRole.SELLER:
      return <SellerMessages />;
    case UserRole.BUYER:
      return <BuyerMessages />;
    default:
      return null; // Will have redirected already
  }
};

export default MessagesPage;
