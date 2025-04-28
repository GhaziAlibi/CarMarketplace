import React from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ShowroomCard from "@/components/showroom-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Store, Award, Info, Filter } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ShowroomsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState("rating");
  
  // Fetch all showrooms
  const { data: showrooms = [], isLoading } = useQuery({
    queryKey: ["/api/showrooms"],
  });
  
  // Fetch cars to count per showroom
  const { data: cars = [] } = useQuery({
    queryKey: ["/api/cars"],
  });
  
  // Filter showrooms based on search query
  const filteredShowrooms = searchQuery
    ? showrooms.filter((showroom: any) => 
        showroom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        showroom.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        showroom.country.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : showrooms;
  
  // Separate featured and regular showrooms
  const featuredShowrooms = filteredShowrooms.filter((showroom: any) => showroom.isFeatured);
  // Only show non-featured showrooms in the regular grid
  const regularShowrooms = filteredShowrooms.filter((showroom: any) => !showroom.isFeatured);
  
  // Sort showrooms
  const sortedRegularShowrooms = [...regularShowrooms].sort((a: any, b: any) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "name":
        return a.name.localeCompare(b.name);
      case "cars":
        return getCarCount(b.id) - getCarCount(a.id);
      default:
        return 0;
    }
  });
  
  // Get car count for each showroom
  const getCarCount = (showroomId: number) => {
    return cars.filter((car: any) => car.showroomId === showroomId).length;
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-secondary-dark relative">
          <div className="absolute inset-0">
            <img
              className="w-full h-64 object-cover"
              src="https://images.unsplash.com/photo-1567361808960-dec9cb578182?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
              alt="Car showroom"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-secondary-dark to-transparent opacity-80"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Our Premium Showroom Partners
            </h1>
            <p className="mt-4 max-w-xl text-lg text-gray-300">
              Explore our network of verified luxury car dealers offering exceptional vehicles and services.
            </p>
          </div>
        </div>
        
        {/* Search and Filter Section */}
        <div className="bg-white py-6 shadow-sm sticky top-0 z-10 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by showroom name or location"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Select
                  value={sortBy}
                  onValueChange={setSortBy}
                >
                  <SelectTrigger className="w-[160px]">
                    <div className="flex items-center">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Sort by" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="cars">Most Cars</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  onClick={() => {
                    setSearchQuery("");
                    setSortBy("rating");
                  }} 
                  variant="outline"
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredShowrooms.length > 0 ? (
            <>
              {/* VIP Featured Showrooms Section */}
              {featuredShowrooms.length > 0 && !searchQuery && (
                <div className="mb-12">
                  <div className="flex items-center mb-6">
                    <Award className="h-6 w-6 text-amber-500 mr-2" />
                    <h2 className="text-2xl font-bold text-gray-900">VIP Showrooms</h2>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="ml-2 cursor-help">
                            <Info className="h-4 w-4 text-gray-400" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                          <p>Premium sellers with enhanced visibility and unlimited listings</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  <div className="space-y-6">
                    {featuredShowrooms.map((showroom: any) => (
                      <ShowroomCard
                        key={showroom.id}
                        showroom={showroom}
                        carCount={getCarCount(showroom.id)}
                        isFeaturedLayout={true}
                      />
                    ))}
                  </div>
                  
                  <Separator className="my-12" />
                </div>
              )}
              
              {/* Regular Showrooms Grid */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  {searchQuery 
                    ? `Search Results (${filteredShowrooms.length})` 
                    : `All Showrooms (${regularShowrooms.length})`
                  }
                </h2>
                <p className="text-gray-500 mt-1">
                  Showing {Math.min(sortedRegularShowrooms.length, 12)} of {regularShowrooms.length} authorized dealers
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {sortedRegularShowrooms.slice(0, 12).map((showroom: any) => (
                  <ShowroomCard
                    key={showroom.id}
                    showroom={showroom}
                    carCount={getCarCount(showroom.id)}
                  />
                ))}
              </div>
              
              {sortedRegularShowrooms.length > 12 && (
                <div className="mt-12 text-center">
                  <Button variant="outline" size="lg">
                    Load More Showrooms
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <Store className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No showrooms found</h3>
              <p className="mt-2 text-gray-500">
                {searchQuery 
                  ? "We couldn't find any showrooms matching your search." 
                  : "There are currently no showrooms available."}
              </p>
              {searchQuery && (
                <Button
                  onClick={() => setSearchQuery("")}
                  variant="outline"
                  className="mt-4"
                >
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </div>
        
        {/* Become a Premium Seller CTA */}
        <div className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-primary to-primary-dark rounded-lg shadow-xl overflow-hidden">
              <div className="pt-10 pb-12 px-6 sm:pt-16 sm:px-16 lg:py-16 lg:pr-0 xl:py-20 xl:px-20">
                <div className="lg:self-center lg:max-w-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="h-8 w-8 text-amber-300" />
                    <span className="text-amber-300 font-bold uppercase">Premium</span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                    <span className="block">Boost your visibility with premium listing</span>
                  </h2>
                  <p className="mt-4 text-lg leading-6 text-indigo-100">
                    Register as a premium seller to showcase unlimited vehicles to thousands of potential buyers.
                    Get enhanced visibility, priority placement, and more customers for your business.
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <Button
                      size="lg"
                      className="bg-white text-primary hover:bg-gray-50"
                      asChild
                    >
                      <a href="/auth">Register Now</a>
                    </Button>
                    <Button
                      variant="outline" 
                      size="lg"
                      className="border-white text-white hover:bg-white/10"
                      asChild
                    >
                      <a href="/seller/subscription">Learn More</a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ShowroomsPage;
