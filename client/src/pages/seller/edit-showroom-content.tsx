import React from "react";
import PlaceholderContent from "./placeholder-content";

interface EditShowroomContentProps {
  showroom: any;
}

const EditShowroomContent: React.FC<EditShowroomContentProps> = () => {
  return (
    <PlaceholderContent 
      title="Edit Showroom" 
      description="Update your showroom details and information"
    />
  );
};

export default EditShowroomContent;