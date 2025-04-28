import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

// Import all seller pages content components
import DashboardContent from "./dashboard-content";
import ListingsContent from "./listings-content";
import AddListingContent from "./add-listing-content";
import MessagesContent from "./messages-content";
import EditShowroomContent from "./edit-showroom-content";
import SubscriptionContent from "./subscription-content";
import AccountContent from "./account-content";

interface SellerContentProps {
  // Add any props if needed
}

const SellerContent: React.FC<SellerContentProps> = () => {
  const [location] = useLocation();
  const { user } = useAuth();
  const [activePage, setActivePage] = useState<string>("/seller/dashboard");

  // Update active page when location changes
  useEffect(() => {
    if (location.startsWith("/seller/")) {
      setActivePage(location);
    }
  }, [location]);

  // Fetch messages for use in multiple pages
  const {
    data: messages = [],
    isLoading: isLoadingMessages,
  } = useQuery<any[]>({
    queryKey: [`/api/messages`],
    enabled: !!user,
  });

  // Fetch showroom data
  const { 
    data: showroom,
    isLoading: isLoadingShowroom,
  } = useQuery({
    queryKey: [`/api/showrooms/user/${user?.id}`],
    queryFn: async () => {
      try {
        const res = await fetch("/api/showrooms");
        const allShowrooms = await res.json();
        return allShowrooms.find((s: any) => s.userId === user?.id);
      } catch (error) {
        console.error("Error fetching showroom:", error);
        return null;
      }
    },
    enabled: !!user,
  });

  // Fetch cars
  const {
    data: cars = [],
    isLoading: isLoadingCars,
  } = useQuery<any[]>({
    queryKey: [`/api/showrooms/${showroom?.id}/cars`],
    enabled: !!showroom?.id,
  });

  if (isLoadingShowroom) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Helper to determine which content to render based on current path
  const renderContent = () => {
    switch (activePage) {
      case "/seller/dashboard":
        return (
          <DashboardContent 
            showroom={showroom} 
            cars={cars} 
            messages={messages}
            isLoadingCars={isLoadingCars}
            isLoadingMessages={isLoadingMessages}
          />
        );
      case "/seller/listings":
        return (
          <ListingsContent 
            showroom={showroom} 
            cars={cars} 
            isLoadingCars={isLoadingCars}
          />
        );
      case "/seller/add-listing":
        return (
          <AddListingContent 
            showroom={showroom}
          />
        );
      case "/seller/messages":
        return (
          <MessagesContent 
            messages={messages}
            isLoadingMessages={isLoadingMessages}
          />
        );
      case "/seller/edit-showroom":
        return (
          <EditShowroomContent 
            showroom={showroom}
          />
        );
      case "/seller/subscription":
        return (
          <SubscriptionContent />
        );
      case "/seller/account":
        return (
          <AccountContent 
            user={user}
          />
        );
      default:
        return (
          <DashboardContent 
            showroom={showroom} 
            cars={cars} 
            messages={messages}
            isLoadingCars={isLoadingCars}
            isLoadingMessages={isLoadingMessages}
          />
        );
    }
  };

  return <>{renderContent()}</>;
};

export default SellerContent;