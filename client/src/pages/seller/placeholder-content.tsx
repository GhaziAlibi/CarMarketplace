import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface PlaceholderContentProps {
  title: string;
  description?: string;
}

// This component is used as a placeholder for pages that are not yet implemented
const PlaceholderContent: React.FC<PlaceholderContentProps> = ({ title, description }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">This feature is under development</p>
      </CardContent>
    </Card>
  );
};

export default PlaceholderContent;