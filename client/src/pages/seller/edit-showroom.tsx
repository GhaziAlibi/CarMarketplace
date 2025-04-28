import { useEffect } from "react";
import { useLocation } from "wouter";
import SellerDashboard from "./dashboard";

const SellerEditShowroom = () => {
  const [, setLocation] = useLocation();
  
  // Redirect to the dashboard page which will show edit showroom content
  useEffect(() => {
    setLocation("/seller/edit-showroom");
  }, [setLocation]);
  
  return <SellerDashboard />;
};

export default SellerEditShowroom;