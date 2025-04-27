import React from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface CarCategoryCardProps {
  icon: React.ReactNode;
  name: string;
  count: number;
  className?: string;
}

const CarCategoryCard: React.FC<CarCategoryCardProps> = ({ icon, name, count, className }) => {
  return (
    <Link href={`/cars?category=${name.toLowerCase()}`} className={cn("flex flex-col items-center group", className)}>
      <div className="bg-gray-100 h-24 w-24 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
        <div className="text-4xl text-primary">{icon}</div>
      </div>
      <h3 className="mt-4 text-lg font-medium text-secondary group-hover:text-primary transition-colors">{name}</h3>
      <p className="mt-1 text-sm text-gray-500">{count} vehicles</p>
    </Link>
  );
};

export default CarCategoryCard;
