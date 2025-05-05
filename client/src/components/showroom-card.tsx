import React from "react";
import { Link } from "wouter";
import { Showroom } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Star, StarHalf, Award, MapPin, Car, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ShowroomCardProps {
  showroom: Showroom;
  carCount: number;
  isFeaturedLayout?: boolean;
}

const ShowroomCard: React.FC<ShowroomCardProps> = ({ 
  showroom, 
  carCount, 
  isFeaturedLayout = false 
}) => {
  const { 
    id, 
    name, 
    city, 
    country, 
    logo, 
    rating, 
    reviewCount, 
    isFeatured,
    description,
    openingHours,
    website
  } = showroom;

  // Generate star ratings
  const renderStars = () => {
    const stars = [];
    const ratingValue = rating || 0;
    const fullStars = Math.floor(ratingValue);
    const hasHalfStar = ratingValue % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    // Add empty stars
    const emptyStars = 5 - Math.ceil(ratingValue);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-star-${i}`} className="h-4 w-4 text-yellow-400" />);
    }

    return stars;
  };
  
  // Featured layout (horizontal card for premium sellers)
  if (isFeaturedLayout) {
    return (
      <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-primary/20 bg-gradient-to-r from-white to-primary/5">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 p-6 flex items-center justify-center bg-gradient-to-br from-primary/10 to-white">
            <div className="relative">
              <div className="h-40 w-40 rounded-full overflow-hidden border-4 border-primary/20 shadow-md">
                <img
                  src={logo || "https://placehold.co/300x300?text=No+Logo"}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              </div>
              {/* Badge is added at the container level in showrooms-page.tsx */}
            </div>
          </div>
          
          <div className="md:w-2/3 p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center">
                  <h3 className="text-xl font-bold text-primary">{name}</h3>
                </div>
                <div className="mt-1 flex items-center">
                  <span className="flex items-center">
                    {renderStars()}
                    <span className="ml-1 text-sm text-gray-500">({reviewCount})</span>
                  </span>
                </div>
              </div>
              <Badge variant="outline" className="flex items-center gap-1 px-2.5 py-1">
                <Car className="h-3.5 w-3.5 text-primary" />
                <span>{carCount} vehicles</span>
              </Badge>
            </div>
            
            <div className="mt-3 flex items-center text-gray-500">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{city}, {country}</span>
            </div>
            
            {description && (
              <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                {description}
              </p>
            )}
            
            <div className="mt-4 flex flex-wrap gap-2">
              {openingHours && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="text-xs">
                        {openingHours}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Opening Hours</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {website && (
                <Badge variant="secondary" className="text-xs">
                  <a href={website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    Website
                  </a>
                </Badge>
              )}
            </div>
            
            <div className="mt-6">
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href={`/showrooms/${id}`}>
                  View Showroom
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }
  
  // Standard card layout
  return (
    <Card className="bg-white overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 h-full flex flex-col">
      <div className="relative">
        {/* Badge is now added at the container level in the showrooms-page.tsx */}
      </div>
      
      <CardContent className="p-6 flex-grow">
        <div className="flex justify-center mb-4">
          <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-md">
            <img
              src={logo || "https://placehold.co/300x300?text=No+Logo"}
              alt={name}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
          
          <div className="mt-2 flex justify-center">
            <span className="flex items-center">
              {renderStars()}
              <span className="ml-1 text-sm text-gray-500">({reviewCount})</span>
            </span>
          </div>
          
          <div className="mt-3 flex items-center justify-center text-gray-500">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm">{city}, {country}</span>
          </div>
          
          <div className="mt-2 flex items-center justify-center text-gray-500">
            <Car className="h-4 w-4 mr-1" />
            <span className="text-sm">{carCount} vehicles</span>
          </div>
          
          {description && (
            <p className="mt-3 text-xs text-gray-500 line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="px-6 pb-6 pt-0">
        <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
          <Link href={`/showrooms/${id}`}>
            View Inventory
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ShowroomCard;
