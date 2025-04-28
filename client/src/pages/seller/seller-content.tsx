import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

// Import content components
import DashboardContent from "./dashboard-content";
import ListingsContent from "./listings-content";
import AddListingContent from "./add-listing-content";
import MessagesContent from "./messages-content";
import EditShowroomContent from "./edit-showroom-content";
import SubscriptionContent from "./subscription-content";
import AccountContent from "./account-content";
import PlaceholderContent from "./placeholder-content";

const SellerContent: React.FC = () => {
  const { user } = useAuth();
  const [location] = useLocation();
  const [activePage, setActivePage] = useState<string>("dashboard");
  const [editListingId, setEditListingId] = useState<number | null>(null);
  
  // Update active page based on URL
  useEffect(() => {
    // Extract the last part of the path
    const path = location.split('/').pop();
    
    // Handle edit-listing/<id> special case
    if (location.includes('/edit-listing/')) {
      const id = parseInt(location.split('/').pop() || "0", 10);
      setEditListingId(id);
      setActivePage("edit-listing");
      return;
    }
    
    // Set active page based on path
    switch (path) {
      case 'dashboard':
        setActivePage('dashboard');
        break;
      case 'listings':
        setActivePage('listings');
        break;
      case 'add-listing':
        setActivePage('add-listing');
        break;
      case 'messages':
        setActivePage('messages');
        break;
      case 'edit-showroom':
        setActivePage('edit-showroom');
        break;
      case 'subscription':
        setActivePage('subscription');
        break;
      case 'account':
        setActivePage('account');
        break;
      default:
        setActivePage('dashboard');
    }
  }, [location]);
  
  // Add listener for history state changes
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.split('/').pop();
      
      // Handle edit-listing/<id> special case
      if (window.location.pathname.includes('/edit-listing/')) {
        const id = parseInt(window.location.pathname.split('/').pop() || "0", 10);
        setEditListingId(id);
        setActivePage("edit-listing");
        return;
      }
      
      // Set active page based on path
      switch (path) {
        case 'dashboard':
          setActivePage('dashboard');
          break;
        case 'listings':
          setActivePage('listings');
          break;
        case 'add-listing':
          setActivePage('add-listing');
          break;
        case 'messages':
          setActivePage('messages');
          break;
        case 'edit-showroom':
          setActivePage('edit-showroom');
          break;
        case 'subscription':
          setActivePage('subscription');
          break;
        case 'account':
          setActivePage('account');
          break;
        default:
          setActivePage('dashboard');
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch seller's showroom
  const { 
    data: showroom,
    isLoading: isLoadingShowroom,
  } = useQuery({
    queryKey: [`/api/showrooms/user/${user?.id}`],
    queryFn: async () => {
      try {
        // In a real app, there would be an endpoint to get showroom by user ID
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
  
  // Fetch seller's car listings
  const {
    data: cars = [],
    isLoading: isLoadingCars,
  } = useQuery<any[]>({
    queryKey: [`/api/showrooms/${showroom?.id}/cars`],
    enabled: !!showroom?.id,
  });
  
  // Fetch seller's messages
  const {
    data: messages = [],
    isLoading: isLoadingMessages,
  } = useQuery<any[]>({
    queryKey: [`/api/messages`],
    enabled: !!user,
  });
  
  if (isLoadingShowroom) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // Render the appropriate content based on active page
  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <DashboardContent 
            showroom={showroom} 
            cars={cars} 
            messages={messages}
            isLoadingCars={isLoadingCars}
            isLoadingMessages={isLoadingMessages}
          />
        );
      case 'listings':
        return (
          <ListingsContent 
            showroom={showroom} 
            cars={cars} 
            isLoadingCars={isLoadingCars} 
          />
        );
      case 'add-listing':
        return <AddListingContent showroom={showroom} />;
      case 'messages':
        return (
          <MessagesContent 
            messages={messages} 
            isLoadingMessages={isLoadingMessages} 
          />
        );
      case 'edit-showroom':
        return <EditShowroomContent showroom={showroom} />;
      case 'subscription':
        return <SubscriptionContent />;
      case 'account':
        return <AccountContent user={user} />;
      case 'edit-listing':
        return (
          <PlaceholderContent 
            title="Edit Listing" 
            description={`Edit car listing with ID: ${editListingId}`}
          />
        );
      default:
        return <DashboardContent 
          showroom={showroom} 
          cars={cars} 
          messages={messages}
          isLoadingCars={isLoadingCars}
          isLoadingMessages={isLoadingMessages}
        />;
    }
  };

  return renderContent();
};

export default SellerContent;