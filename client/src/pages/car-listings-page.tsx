import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CarListingCard from "@/components/car-listing-card";
import SearchForm from "@/components/search-form";
import { Loader2, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { CarSearchParams } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const CarListingsPage: React.FC = () => {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  
  // Extract search parameters from URL
  const initialFilters: CarSearchParams = {
    make: searchParams.get("make") || "",
    model: searchParams.get("model") || "",
    priceRange: searchParams.get("priceRange") || "",
    category: searchParams.get("category") || "",
    year: searchParams.get("year") ? parseInt(searchParams.get("year") as string) : undefined,
    transmission: searchParams.get("transmission") || "",
    fuelType: searchParams.get("fuelType") || "",
  };
  
  const [filters, setFilters] = useState<CarSearchParams>(initialFilters);
  const [sortBy, setSortBy] = useState<string>("newest");
  
  // Fetch cars based on filters
  const { data: cars = [], isLoading, isError } = useQuery({
    queryKey: ["/api/cars/search", filters],
    queryFn: async ({ queryKey }) => {
      const searchFilters = queryKey[1] as CarSearchParams;
      
      // Create a clean filter object with only non-empty values
      const cleanFilters: CarSearchParams = {};
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value) cleanFilters[key as keyof CarSearchParams] = value;
      });
      
      // Make a POST request with the filters in the body
      const res = await fetch('/api/cars/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanFilters),
        credentials: 'include'
      });
      
      if (!res.ok) throw new Error("Failed to fetch cars");
      return res.json();
    }
  });
  
  // Fetch all showrooms to display names
  const { data: showrooms = [] } = useQuery({
    queryKey: ["/api/showrooms"],
  });
  
  // Fetch user favorites to indicate saved cars
  const { data: favorites = [] } = useQuery({
    queryKey: ["/api/favorites"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/favorites");
        return await res.json();
      } catch (error) {
        // If unauthorized or other error, return empty array
        return [];
      }
    }
  });
  
  // Sort cars based on user selection
  const sortedCars = [...cars].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "mileage-asc":
        return a.mileage - b.mileage;
      case "mileage-desc":
        return b.mileage - a.mileage;
      default:
        return 0;
    }
  });
  
  // Check if a car is in user favorites
  const isCarFavorited = (carId: number) => {
    return favorites.some((fav: any) => fav.carId === carId);
  };
  
  // Get showroom name by ID
  const getShowroomName = (showroomId: number) => {
    const showroom = showrooms.find((s: any) => s.id === showroomId);
    return showroom ? showroom.name : "Unknown Showroom";
  };
  
  // Handle filter changes
  const handleFilterChange = (key: keyof CarSearchParams, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        <div className="bg-secondary-dark relative">
          <div className="absolute inset-0">
            <img
              className="w-full h-64 object-cover"
              src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
              alt="Luxury cars"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-secondary-dark to-transparent opacity-80"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Browse Our Luxury Vehicle Collection
            </h1>
            <p className="mt-4 max-w-xl text-lg text-gray-300">
              Find the perfect car that matches your style, needs, and budget from our curated collection.
            </p>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters - Desktop */}
            <div className="hidden lg:block">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Filters</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-2">Make</h3>
                      <Select
                        value={filters.make}
                        onValueChange={(value) => handleFilterChange("make", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Makes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Makes</SelectItem>
                          <SelectItem value="Mercedes-Benz">Mercedes-Benz</SelectItem>
                          <SelectItem value="BMW">BMW</SelectItem>
                          <SelectItem value="Audi">Audi</SelectItem>
                          <SelectItem value="Porsche">Porsche</SelectItem>
                          <SelectItem value="Lexus">Lexus</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Model</h3>
                      <Select
                        value={filters.model}
                        onValueChange={(value) => handleFilterChange("model", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Models" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Models</SelectItem>
                          <SelectItem value="S-Class">S-Class</SelectItem>
                          <SelectItem value="7 Series">7 Series</SelectItem>
                          <SelectItem value="A8">A8</SelectItem>
                          <SelectItem value="911">911</SelectItem>
                          <SelectItem value="LS">LS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Category</h3>
                      <Select
                        value={filters.category}
                        onValueChange={(value) => handleFilterChange("category", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="Sedan">Sedan</SelectItem>
                          <SelectItem value="SUV">SUV</SelectItem>
                          <SelectItem value="Sports">Sports</SelectItem>
                          <SelectItem value="Truck">Truck</SelectItem>
                          <SelectItem value="Electric">Electric</SelectItem>
                          <SelectItem value="Luxury">Luxury</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-medium mb-2">Price Range</h3>
                      <Select
                        value={filters.priceRange}
                        onValueChange={(value) => handleFilterChange("priceRange", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any Price" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any Price</SelectItem>
                          <SelectItem value="0-50000">Under $50,000</SelectItem>
                          <SelectItem value="50000-100000">$50,000 - $100,000</SelectItem>
                          <SelectItem value="100000-200000">$100,000 - $200,000</SelectItem>
                          <SelectItem value="200000-">$200,000+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Year</h3>
                      <Select
                        value={filters.year?.toString() || ""}
                        onValueChange={(value) => handleFilterChange("year", value ? parseInt(value) : undefined)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any Year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any Year</SelectItem>
                          <SelectItem value="2023">2023</SelectItem>
                          <SelectItem value="2022">2022</SelectItem>
                          <SelectItem value="2021">2021</SelectItem>
                          <SelectItem value="2020">2020</SelectItem>
                          <SelectItem value="2019">2019</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Transmission</h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Checkbox 
                            id="transmission-automatic" 
                            checked={filters.transmission === "automatic"}
                            onCheckedChange={(checked) => 
                              handleFilterChange("transmission", checked ? "automatic" : "")
                            }
                          />
                          <Label htmlFor="transmission-automatic" className="ml-2">Automatic</Label>
                        </div>
                        <div className="flex items-center">
                          <Checkbox 
                            id="transmission-manual" 
                            checked={filters.transmission === "manual"}
                            onCheckedChange={(checked) => 
                              handleFilterChange("transmission", checked ? "manual" : "")
                            }
                          />
                          <Label htmlFor="transmission-manual" className="ml-2">Manual</Label>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Fuel Type</h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Checkbox 
                            id="fuel-gasoline" 
                            checked={filters.fuelType === "gasoline"}
                            onCheckedChange={(checked) => 
                              handleFilterChange("fuelType", checked ? "gasoline" : "")
                            }
                          />
                          <Label htmlFor="fuel-gasoline" className="ml-2">Gasoline</Label>
                        </div>
                        <div className="flex items-center">
                          <Checkbox 
                            id="fuel-diesel" 
                            checked={filters.fuelType === "diesel"}
                            onCheckedChange={(checked) => 
                              handleFilterChange("fuelType", checked ? "diesel" : "")
                            }
                          />
                          <Label htmlFor="fuel-diesel" className="ml-2">Diesel</Label>
                        </div>
                        <div className="flex items-center">
                          <Checkbox 
                            id="fuel-electric" 
                            checked={filters.fuelType === "electric"}
                            onCheckedChange={(checked) => 
                              handleFilterChange("fuelType", checked ? "electric" : "")
                            }
                          />
                          <Label htmlFor="fuel-electric" className="ml-2">Electric</Label>
                        </div>
                        <div className="flex items-center">
                          <Checkbox 
                            id="fuel-hybrid" 
                            checked={filters.fuelType === "hybrid"}
                            onCheckedChange={(checked) => 
                              handleFilterChange("fuelType", checked ? "hybrid" : "")
                            }
                          />
                          <Label htmlFor="fuel-hybrid" className="ml-2">Hybrid</Label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setFilters({})}
                      >
                        Clear All Filters
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Filters - Mobile */}
            <div className="lg:hidden">
              <Accordion type="single" collapsible className="mb-4">
                <AccordionItem value="filters">
                  <AccordionTrigger className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center">
                      <Filter className="mr-2" size={18} />
                      <span>Filters</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="border rounded-lg mt-2 p-4 bg-white">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Make</Label>
                          <Select
                            value={filters.make}
                            onValueChange={(value) => handleFilterChange("make", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All Makes" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Makes</SelectItem>
                              <SelectItem value="Mercedes-Benz">Mercedes-Benz</SelectItem>
                              <SelectItem value="BMW">BMW</SelectItem>
                              <SelectItem value="Audi">Audi</SelectItem>
                              <SelectItem value="Porsche">Porsche</SelectItem>
                              <SelectItem value="Lexus">Lexus</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Model</Label>
                          <Select
                            value={filters.model}
                            onValueChange={(value) => handleFilterChange("model", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All Models" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Models</SelectItem>
                              <SelectItem value="S-Class">S-Class</SelectItem>
                              <SelectItem value="7 Series">7 Series</SelectItem>
                              <SelectItem value="A8">A8</SelectItem>
                              <SelectItem value="911">911</SelectItem>
                              <SelectItem value="LS">LS</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Category</Label>
                        <Select
                          value={filters.category}
                          onValueChange={(value) => handleFilterChange("category", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All Categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="Sedan">Sedan</SelectItem>
                            <SelectItem value="SUV">SUV</SelectItem>
                            <SelectItem value="Sports">Sports</SelectItem>
                            <SelectItem value="Truck">Truck</SelectItem>
                            <SelectItem value="Electric">Electric</SelectItem>
                            <SelectItem value="Luxury">Luxury</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Price Range</Label>
                        <Select
                          value={filters.priceRange}
                          onValueChange={(value) => handleFilterChange("priceRange", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Any Price" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any Price</SelectItem>
                            <SelectItem value="0-50000">Under $50,000</SelectItem>
                            <SelectItem value="50000-100000">$50,000 - $100,000</SelectItem>
                            <SelectItem value="100000-200000">$100,000 - $200,000</SelectItem>
                            <SelectItem value="200000-">$200,000+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setFilters({})}
                      >
                        Clear All Filters
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            
            {/* Listings */}
            <div className="lg:col-span-3">
              <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <p className="text-sm text-gray-500">Showing {sortedCars.length} results</p>
                </div>
                <div className="mt-3 sm:mt-0 w-full sm:w-auto">
                  <Select
                    value={sortBy}
                    onValueChange={setSortBy}
                  >
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                      <SelectItem value="mileage-asc">Mileage: Low to High</SelectItem>
                      <SelectItem value="mileage-desc">Mileage: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : isError ? (
                <div className="bg-white p-8 rounded-lg shadow text-center">
                  <p className="text-lg text-gray-600">Error loading car listings. Please try again.</p>
                  <Button className="mt-4" onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                </div>
              ) : sortedCars.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {sortedCars.map((car) => (
                    <CarListingCard
                      key={car.id}
                      car={car}
                      showroomName={getShowroomName(car.showroomId)}
                      isFavorited={isCarFavorited(car.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white p-8 rounded-lg shadow text-center">
                  <p className="text-lg text-gray-600">No cars match your current filters.</p>
                  <Button className="mt-4" onClick={() => setFilters({})}>
                    Clear Filters
                  </Button>
                </div>
              )}
              
              {/* Pagination - would be implemented with actual pagination in a real app */}
              {sortedCars.length > 0 && (
                <div className="flex justify-center mt-8">
                  <nav className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" disabled>
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Previous Page</span>
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">1</Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled>2</Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled>3</Button>
                    <Button variant="outline" size="sm" disabled>
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Next Page</span>
                    </Button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CarListingsPage;
