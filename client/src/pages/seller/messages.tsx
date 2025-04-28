import { useEffect } from "react";
import { useLocation } from "wouter";
import SellerDashboard from "./dashboard";

const SellerMessages = () => {
  const [, setLocation] = useLocation();
  
  // Redirect to the dashboard page which will show messages content
  useEffect(() => {
    setLocation("/seller/messages");
  }, [setLocation]);
  
  return <SellerDashboard />;
};

export default SellerMessages;