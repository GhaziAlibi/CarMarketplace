import React from "react";
import PlaceholderContent from "./placeholder-content";

interface MessagesContentProps {
  messages: any[];
  isLoadingMessages: boolean;
}

const MessagesContent: React.FC<MessagesContentProps> = () => {
  return (
    <PlaceholderContent 
      title="Messages" 
      description="View and respond to inquiries from potential buyers"
    />
  );
};

export default MessagesContent;