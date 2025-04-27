import React from "react";
import { Link } from "wouter";
import { Car } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MapPin, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface CarListingCardProps {
  car: Car;
  showroomName: string;
  isFavorited?: boolean;
}

const CarListingCard: React.FC<CarListingCardProps> = ({ car, showroomName, isFavorited = false }) => {
  const { id, title, make, model, year, price, mileage, transmission, fuelType, features, images, isFeatured } = car;
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
  
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("You must be logged in to save cars");
      
      if (isFavorited) {
        // This is a simplified implementation since we don't have the favorite ID
        // In a real implementation, you'd store the favorite ID or make an API call to find and delete it
        await apiRequest("DELETE", `/api/favorites/${id}`);
      } else {
        await apiRequest("POST", "/api/favorites", { carId: id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: isFavorited ? "Removed from favorites" : "Added to favorites",
        description: isFavorited ? "Car has been removed from your saved list" : "Car has been added to your saved list",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavoriteMutation.mutate();
  };

  return (
    <Card className="overflow-hidden shadow-lg rounded-lg cursor-pointer transition duration-300 hover:shadow-xl">
      <Link href={`/cars/${id}`}>
        <a className="block">
          <div className="relative">
            <img 
              src={images && images.length > 0 ? images[0] : "https://placehold.co/600x400?text=No+Image"} 
              alt={title}
              className="h-60 w-full object-cover"
            />
            {isFeatured && (
              <div className="absolute top-0 right-0 m-4">
                <Badge className="bg-accent hover:bg-accent-light">Featured</Badge>
              </div>
            )}
          </div>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-secondary">{title}</h3>
              <span className="font-bold text-accent">{formattedPrice}</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {year} • {mileage.toLocaleString()} miles • {transmission} • {fuelType}
            </p>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <MapPin className="h-4 w-4 text-accent mr-2" />
              <span>{showroomName}</span>
            </div>
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {features && features.slice(0, 3).map((feature, index) => (
                  <Badge key={index} variant="outline" className="bg-gray-100 text-gray-800">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="mt-6 flex justify-between items-center">
              <Button variant="link" className="text-primary p-0 hover:text-primary-dark">
                <Eye className="mr-1 h-4 w-4" /> View Details
              </Button>
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleFavorite}
                  className={`flex items-center ${isFavorited ? "text-accent" : "text-gray-500 hover:text-accent"}`}
                >
                  <Heart className={`mr-1 h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
                  <span>{isFavorited ? "Saved" : "Save"}</span>
                </Button>
              )}
            </div>
          </CardContent>
        </a>
      </Link>
    </Card>
  );
};

export default CarListingCard;
