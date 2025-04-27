import React, { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CarListingCard from "@/components/car-listing-card";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  ArrowLeft,
  Search,
  Filter,
  ChevronDown,
  PanelLeft
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ShowroomDetailsPage: React.FC = () => {
  const [_, params] = useRoute("/showrooms/:id");
  const showroomId = params?.id ? parseInt(params.id) : 0;
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [activeTab, setActiveTab] = useState("cars");
  const { user } = useAuth();
  
  // Fetch showroom details
  const { 
    data: showroom, 
    isLoading: isLoadingShowroom, 
    isError: isErrorShowroom 
  } = useQuery({
    queryKey: [`/api/showrooms/${showroomId}`],
    enabled: !!showroomId,
  });
  
  // Fetch showroom cars
  const { 
    data: cars = [], 
    isLoading: isLoadingCars 
  } = useQuery({
    queryKey: [`/api/showrooms/${showroomId}/cars`],
    enabled: !!showroomId,
  });
  
  // Filter cars based on search query
  const filteredCars = searchQuery
    ? cars.filter((car: any) => 
        car.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.model.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : cars;
  
  // Sort cars based on selected sort option
  const sortedCars = [...filteredCars].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      default:
        return 0;
    }
  });
  
  // Render star ratings
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`star-${i}`} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <svg 
          key="half-star"
          className="h-5 w-5 text-yellow-400"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
            fill="url(#half-star)"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="half-star" x1="2" y1="12" x2="22" y2="12" gradientUnits="userSpaceOnUse">
              <stop offset="0.5" stopColor="currentColor" />
              <stop offset="0.5" stopColor="transparent" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      );
    }

    // Add empty stars
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-star-${i}`} className="h-5 w-5 text-gray-300" />
      );
    }

    return stars;
  };
  
  if (isLoadingShowroom || isLoadingCars) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }
  
  if (isErrorShowroom || !showroom) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">Showroom Not Found</h1>
              <p className="mt-4 text-gray-500">The showroom you're looking for doesn't exist or has been removed.</p>
              <Button className="mt-8" asChild>
                <Link href="/showrooms">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Showrooms
                </Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        {/* Showroom Header */}
        <div className="bg-secondary-dark relative">
          <div className="absolute inset-0">
            <img
              className="w-full h-64 object-cover"
              src={showroom.headerImage || "https://images.unsplash.com/photo-1577495508326-19a1b3cf65b9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"}
              alt={`${showroom.name} header`}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-secondary-dark to-transparent opacity-80"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <Button variant="outline" className="bg-white/90 mb-6" asChild>
              <Link href="/showrooms">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Showrooms
              </Link>
            </Button>
            
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="h-24 w-24 rounded-full bg-white shadow-lg overflow-hidden flex-shrink-0">
                <img
                  src={showroom.logo || "https://placehold.co/300x300?text=No+Logo"}
                  alt={showroom.name}
                  className="h-full w-full object-cover"
                />
              </div>
              
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white">
                  {showroom.name}
                </h1>
                <p className="mt-2 text-lg text-gray-300 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  {showroom.city}, {showroom.country}
                </p>
                <div className="mt-2 flex items-center">
                  <div className="flex">
                    {renderStars(showroom.rating)}
                  </div>
                  <span className="ml-2 text-gray-300">
                    ({showroom.reviewCount} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs 
            defaultValue="cars" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="mb-8"
          >
            <TabsList>
              <TabsTrigger value="cars">Vehicles ({cars.length})</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>
            
            <TabsContent value="cars">
              {/* Cars Tab */}
              <div className="flex flex-col-reverse md:flex-row gap-8">
                {/* Filters - Mobile */}
                <div className="md:hidden mb-4">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Filter className="mr-2 h-4 w-4" />
                        Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                        <SheetDescription>
                          Narrow down your search
                        </SheetDescription>
                      </SheetHeader>
                      <div className="py-4 space-y-4">
                        {/* Mobile filters would go here */}
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
                
                {/* Filters - Desktop */}
                <div className="hidden md:block md:w-64 flex-shrink-0">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-lg font-bold mb-4">Filters</h2>
                      
                      <div className="space-y-6">
                        {/* Static filters for the showroom */}
                        <p className="text-sm text-gray-500">
                          Filters are specific to {showroom.name}
                        </p>
                        
                        {/* More filter options would go here */}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Car Listings */}
                <div className="flex-1">
                  <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="relative w-full sm:w-auto mb-4 sm:mb-0">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search vehicles"
                        className="pl-10 pr-4 w-full sm:w-72"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="w-full sm:w-auto">
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
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {sortedCars.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {sortedCars.map((car: any) => (
                        <CarListingCard
                          key={car.id}
                          car={car}
                          showroomName={showroom.name}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white p-8 rounded-lg shadow text-center">
                      <p className="text-lg text-gray-600">
                        {searchQuery 
                          ? "No vehicles match your search criteria" 
                          : "No vehicles available from this showroom"}
                      </p>
                      {searchQuery && (
                        <Button
                          className="mt-4"
                          onClick={() => setSearchQuery("")}
                        >
                          Clear Search
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="about">
              {/* About Tab */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-bold mb-4">About {showroom.name}</h2>
                      
                      <div className="prose max-w-none">
                        {showroom.description ? (
                          <p>{showroom.description}</p>
                        ) : (
                          <p className="text-gray-500">No description available for this showroom.</p>
                        )}
                        
                        {/* Placeholder content if needed */}
                        <Separator className="my-6" />
                        
                        <div className="mt-6">
                          <h3 className="text-xl font-bold mb-4">Why Choose Us</h3>
                          <ul className="space-y-2">
                            <li className="flex items-start">
                              <Badge className="mt-1 mr-2">1</Badge>
                              <span>Premium selection of luxury vehicles</span>
                            </li>
                            <li className="flex items-start">
                              <Badge className="mt-1 mr-2">2</Badge>
                              <span>Transparent pricing and vehicle history</span>
                            </li>
                            <li className="flex items-start">
                              <Badge className="mt-1 mr-2">3</Badge>
                              <span>Expert staff with deep automotive knowledge</span>
                            </li>
                            <li className="flex items-start">
                              <Badge className="mt-1 mr-2">4</Badge>
                              <span>Comprehensive after-sales service</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card className="mb-6">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-4">Contact Information</h3>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <MapPin className="h-5 w-5 text-accent mt-1 mr-3" />
                          <div>
                            <p className="font-medium">Address</p>
                            <p className="text-gray-600">
                              {showroom.address || `${showroom.city}, ${showroom.country}`}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <Phone className="h-5 w-5 text-accent mt-1 mr-3" />
                          <div>
                            <p className="font-medium">Phone</p>
                            <p className="text-gray-600">+1 (123) 456-7890</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <Mail className="h-5 w-5 text-accent mt-1 mr-3" />
                          <div>
                            <p className="font-medium">Email</p>
                            <p className="text-gray-600">info@{showroom.name.toLowerCase().replace(/\s/g, '')}.com</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-4">Business Hours</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Monday - Friday</span>
                          <span>9:00 AM - 6:00 PM</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Saturday</span>
                          <span>10:00 AM - 4:00 PM</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sunday</span>
                          <span>Closed</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ShowroomDetailsPage;
