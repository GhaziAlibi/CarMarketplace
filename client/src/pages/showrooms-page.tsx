import React from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ShowroomCard from "@/components/showroom-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
        {/* Hero Section - Smaller and Nicer */}
        <div className="relative overflow-hidden bg-gradient-to-r from-primary to-primary-dark">
          <div className="absolute inset-0 bg-grid-white/5 pointer-events-none" 
               style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 32 32\' width=\'32\' height=\'32\' fill=\'none\' stroke=\'%23fff\' stroke-opacity=\'0.05\'%3E%3Cpath d=\'M0 0 L32 32 M32 0 L0 32\'/%3E%3C/svg%3E")' }}>
          </div>
          
          <div className="relative px-4 py-10 sm:px-6 sm:py-12 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="md:w-7/12 md:pr-8">
                <div className="flex items-center mb-4">
                  <div className="bg-amber-400 p-1 rounded-full">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <span className="ml-2 text-sm font-semibold uppercase tracking-wide text-amber-300">
                    VIP Showroom Network
                  </span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-3">
                  Discover Premium Auto Showrooms
                </h1>
                <p className="text-white/80 max-w-lg text-base">
                  Explore our curated network of verified luxury car dealers offering exceptional vehicles and premium customer service.
                </p>
                <div className="mt-6 flex gap-3">
                  <Button asChild size="sm" className="bg-white text-primary hover:bg-white/90">
                    <a href="#showrooms">Browse Showrooms</a>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="text-white border-white hover:bg-white/10">
                    <a href="/auth">Join as Seller</a>
                  </Button>
                </div>
              </div>
              
              <div className="mt-6 md:mt-0 md:w-5/12 bg-white/5 rounded-lg backdrop-blur-sm p-5 border border-white/10">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{showrooms.length}</p>
                    <p className="text-xs text-white/70">Showrooms</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{cars.length}</p>
                    <p className="text-xs text-white/70">Vehicles</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">4</p>
                    <p className="text-xs text-white/70">VIP Spots</p>
                  </div>
                </div>
              </div>
            </div>
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
                <div className="mb-12" id="vip-showrooms">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
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
                            <p>VIP sellers with elite status, enhanced visibility and unlimited listings (Limited to 4 exclusive slots)</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      {featuredShowrooms.length}/4 VIP slots filled
                    </Badge>
                  </div>
                  
                  {/* VIP showrooms grid - max 4 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredShowrooms.slice(0, 4).map((showroom: any) => (
                      <div key={showroom.id} className="relative">
                        <div className="absolute -top-1 -right-1 z-10">
                          <Badge className="bg-amber-500 text-white px-2 py-1">
                            <Award className="h-3.5 w-3.5 mr-1" />
                            Premium
                          </Badge>
                        </div>
                        <ShowroomCard
                          showroom={showroom}
                          carCount={getCarCount(showroom.id)}
                          isFeaturedLayout={false}
                        />
                      </div>
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
        
        {/* Become a VIP Seller CTA */}
        <div className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-amber-500 to-amber-700 rounded-lg shadow-xl overflow-hidden">
              <div className="pt-10 pb-12 px-6 sm:pt-16 sm:px-16 lg:py-16 lg:pr-0 xl:py-20 xl:px-20 relative">
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-white">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
                <div className="lg:self-center lg:max-w-2xl relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-white rounded-full p-1">
                      <Award className="h-8 w-8 text-amber-600" />
                    </div>
                    <span className="text-white font-bold uppercase text-lg">VIP Status</span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                    <span className="block">Exclusive VIP Status for Elite Sellers</span>
                  </h2>
                  <p className="mt-4 text-lg leading-6 text-white/90">
                    Join our exclusive VIP program and get featured placement in our premium showroom section. 
                    Includes unlimited listings, priority search ranking, and premium support with only 4 exclusive spots available.
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <Button
                      size="lg"
                      className="bg-white text-amber-600 hover:bg-gray-50"
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
