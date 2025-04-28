import { useEffect } from "react";
import { useLocation } from "wouter";
import SellerDashboard from "./dashboard";

const SellerSubscription = () => {
  const [, setLocation] = useLocation();
  
  // Redirect to the dashboard page which will show subscription content
  useEffect(() => {
    setLocation("/seller/subscription");
  }, [setLocation]);
  
  return <SellerDashboard />;
};

export default SellerSubscription;