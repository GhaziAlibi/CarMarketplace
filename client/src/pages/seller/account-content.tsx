import React from "react";
import PlaceholderContent from "./placeholder-content";

interface AccountContentProps {
  user: any;
}

const AccountContent: React.FC<AccountContentProps> = () => {
  return (
    <PlaceholderContent 
      title="Account Settings" 
      description="Manage your account details and preferences"
    />
  );
};

export default AccountContent;