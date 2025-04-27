import React from "react";
import { Link } from "wouter";
import { Showroom } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, StarHalf } from "lucide-react";

interface ShowroomCardProps {
  showroom: Showroom;
  carCount: number;
}

const ShowroomCard: React.FC<ShowroomCardProps> = ({ showroom, carCount }) => {
  const { id, name, city, country, logo, rating, reviewCount } = showroom;

  // Generate star ratings
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    // Add empty stars
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-star-${i}`} className="h-4 w-4 text-yellow-400" />);
    }

    return stars;
  };

  return (
    <Card className="bg-white overflow-hidden shadow rounded-lg">
      <CardContent className="p-5">
        <div className="flex justify-center">
          <div className="h-32 w-32 rounded-full overflow-hidden">
            <img
              src={logo || "https://placehold.co/300x300?text=No+Logo"}
              alt={name}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        <div className="mt-4 text-center">
          <h3 className="text-lg font-medium text-secondary">{name}</h3>
          <div className="mt-2 flex justify-center">
            <span className="flex items-center">
              {renderStars()}
              <span className="ml-1 text-sm text-gray-500">({reviewCount})</span>
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {city}, {country}
          </p>
          <p className="mt-1 text-sm text-gray-500">{carCount} vehicles</p>
        </div>
        <div className="mt-6">
          <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
            <Link href={`/showrooms/${id}`}>
              View Inventory
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShowroomCard;
