import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import SellerLayout from "@/components/layout/seller-layout";
import SellerContent from "./seller-content";

const SellerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { isLoading: isLoadingUser } = useQuery({
    queryKey: ['/api/user'],
    enabled: !!user,
  });
  
  if (isLoadingUser) {
    return (
      <SellerLayout title="Seller Dashboard" description="Loading...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </SellerLayout>
    );
  }
  
  return (
    <SellerLayout 
      title="Seller Dashboard" 
      description="Manage your car listings and track performance"
    >
      <SellerContent />
    </SellerLayout>
  );
};

export default SellerDashboard;