import { useEffect } from "react";
import { useLocation } from "wouter";
import SellerDashboard from "./dashboard";

const SellerAddListing = () => {
  const [, setLocation] = useLocation();
  
  // Redirect to the dashboard page which will show add listing content
  useEffect(() => {
    setLocation("/seller/add-listing");
  }, [setLocation]);
  
  return <SellerDashboard />;
};

export default SellerAddListing;