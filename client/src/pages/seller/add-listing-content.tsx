import React from "react";
import PlaceholderContent from "./placeholder-content";

interface AddListingContentProps {
  showroom: any;
}

const AddListingContent: React.FC<AddListingContentProps> = () => {
  return (
    <PlaceholderContent 
      title="Add New Listing" 
      description="Create a new car listing to showcase in your showroom"
    />
  );
};

export default AddListingContent;