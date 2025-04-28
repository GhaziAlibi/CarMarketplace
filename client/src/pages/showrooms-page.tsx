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
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-primary">
          <div className="absolute inset-y-0 right-0 hidden w-1/2 sm:block lg:w-2/3">
            <img
              className="h-full w-full object-cover object-left"
              src="https://images.unsplash.com/photo-1526996292069-fe51e3dc5948?q=80&w=2070&auto=format&fit=crop"
              alt="Luxury car showroom"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-primary/10 via-primary/50 to-primary"></div>
          </div>
          
          <div className="relative px-4 py-16 sm:px-6 sm:py-24 lg:py-32 lg:px-8">
            <div className="mx-auto max-w-xl lg:mx-0 lg:max-w-lg">
              <div className="mb-8 flex items-center">
                <div className="bg-white/20 p-1 rounded-full">
                  <Award className="h-6 w-6 text-amber-300" />
                </div>
                <span className="ml-3 text-sm font-semibold uppercase tracking-wide text-amber-300">
                  Premium Network
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Discover Premium <br /> Showrooms
              </h1>
              <p className="mt-6 text-xl text-white/80 max-w-lg">
                Explore our curated network of verified luxury car dealers offering exceptional vehicles and premium customer service.
              </p>
              <div className="mt-10 flex gap-4">
                <Button asChild className="bg-white text-primary hover:bg-white/90">
                  <a href="#showrooms">Browse Showrooms</a>
                </Button>
                <Button asChild variant="outline" className="text-white border-white hover:bg-white/10">
                  <a href="/auth">Join as Seller</a>
                </Button>
              </div>
              
              <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3">
                <div>
                  <p className="text-3xl font-bold text-white">{showrooms.length}</p>
                  <p className="text-sm text-white/70">Active Showrooms</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{cars.length}</p>
                  <p className="text-sm text-white/70">Available Cars</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">4</p>
                  <p className="text-sm text-white/70">VIP Spots</p>
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
                            <p>Premium sellers with enhanced visibility and unlimited listings (Max 4 slots)</p>
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
                            VIP
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
