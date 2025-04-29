import React from "react";
import SellerLayout from "@/components/layout/seller-layout";
import { useLocation } from "wouter";
import DashboardContent from "./dashboard-content";
import ListingsContent from "./listings-content";
import AddListingContent from "./add-listing-content";
import MessagesContent from "./messages-content";
import EditShowroomContent from "./edit-showroom-content";
import SubscriptionContent from "./subscription-content";
import AccountContent from "./account-content";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Store } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Showroom, Car, Message } from "@shared/schema";

const SellerDashboard: React.FC = () => {
  const [location] = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();

  // Fetch showroom data if user is authenticated
  const {
    data: showroom,
    isLoading: isLoadingShowroom,
    isError: isShowroomError,
  } = useQuery<Showroom | null>({
    queryKey: [`/api/showrooms/user/${user?.id}`],
    enabled: !!user,
    retry: 1, // Only retry once to avoid infinite loading on real errors
  });
  
  // Log debug information
  console.log("Dashboard seller component:", { 
    user, 
    showroom, 
    isLoadingShowroom, 
    isShowroomError 
  });

  // Fetch cars if showroom exists
  const { 
    data: cars = [], 
    isLoading: isLoadingCars 
  } = useQuery<Car[]>({
    queryKey: ['/api/cars'],
    enabled: !!showroom,
  });

  // Fetch messages for seller
  const { 
    data: messages = [], 
    isLoading: isLoadingMessages 
  } = useQuery<Message[]>({
    queryKey: ['/api/messages'],
    enabled: !!user,
  });

  // If there's an error loading the showroom, show an error message
  if (isShowroomError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Something Went Wrong</CardTitle>
            <CardDescription>We encountered an error while loading your showroom data</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-6">
            <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="mb-4">There was a problem retrieving your showroom information. Please try again.</p>
            <Button 
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get the component and title based on the current route
  const getContent = () => {
    switch (location) {
      case "/seller/dashboard":
        return {
          component: <DashboardContent 
            showroom={showroom as Showroom} 
            cars={cars} 
            messages={messages} 
            isLoadingCars={isLoadingCars} 
            isLoadingMessages={isLoadingMessages} 
          />,
          title: t("seller.dashboard"),
          description: t("seller.dashboardDesc"),
        };
      case "/seller/listings":
        return {
          component: <ListingsContent 
            showroom={showroom as Showroom} 
            cars={cars} 
            isLoadingCars={isLoadingCars} 
          />,
          title: t("seller.listings"),
          description: t("seller.listingsDesc"),
        };
      case "/seller/add-listing":
        return {
          component: <AddListingContent 
            showroom={showroom as Showroom} 
          />,
          title: t("seller.addListing"),
          description: t("seller.addListingDesc"),
        };
      case "/seller/messages":
        return {
          component: <MessagesContent 
            messages={messages} 
            isLoadingMessages={isLoadingMessages} 
          />,
          title: t("navigation.messages"),
          description: t("seller.messagesDesc"),
        };
      case "/seller/edit-showroom":
        return {
          component: <EditShowroomContent 
            showroom={showroom} 
            isLoading={isLoadingShowroom} 
            isError={isShowroomError}
          />,
          title: t("seller.showroom"),
          description: t("seller.showroomDesc"),
        };
      case "/seller/subscription":
        return {
          component: <SubscriptionContent />,
          title: t("seller.subscription"),
          description: t("seller.subscriptionDesc"),
        };
      case "/seller/account":
        return {
          component: <AccountContent userData={user} />,
          title: t("seller.account"),
          description: t("seller.accountDesc"),
        };
      default:
        return {
          component: <DashboardContent 
            showroom={showroom as Showroom} 
            cars={cars} 
            messages={messages} 
            isLoadingCars={isLoadingCars} 
            isLoadingMessages={isLoadingMessages} 
          />,
          title: t("seller.dashboard"),
          description: t("seller.dashboardDesc"),
        };
    }
  };

  const { component, title, description } = getContent();

  if (isLoadingShowroom) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SellerLayout title={title} description={description}>
      {component}
    </SellerLayout>
  );
};

export default SellerDashboard;