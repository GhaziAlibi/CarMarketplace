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
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const SellerDashboard: React.FC = () => {
  const [location] = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();

  // Fetch showroom data if user is authenticated
  const {
    data: showroom,
    isLoading: isLoadingShowroom,
  } = useQuery({
    queryKey: [`/api/showrooms/user/${user?.id}`],
    enabled: !!user,
  });

  // Fetch cars if showroom exists
  const { 
    data: cars, 
    isLoading: isLoadingCars 
  } = useQuery({
    queryKey: ['/api/cars'],
    enabled: !!showroom,
  });

  // Fetch messages for seller
  const { 
    data: messages, 
    isLoading: isLoadingMessages 
  } = useQuery({
    queryKey: ['/api/messages'],
    enabled: !!user,
  });

  // Get the component and title based on the current route
  const getContent = () => {
    switch (location) {
      case "/seller/dashboard":
        return {
          component: <DashboardContent 
            showroom={showroom} 
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
          component: <ListingsContent />,
          title: t("seller.listings"),
          description: t("seller.listingsDesc"),
        };
      case "/seller/add-listing":
        return {
          component: <AddListingContent />,
          title: t("seller.addListing"),
          description: t("seller.addListingDesc"),
        };
      case "/seller/messages":
        return {
          component: <MessagesContent />,
          title: t("navigation.messages"),
          description: t("seller.messagesDesc"),
        };
      case "/seller/edit-showroom":
        return {
          component: <EditShowroomContent showroom={showroom} />,
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
          component: <DashboardContent />,
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