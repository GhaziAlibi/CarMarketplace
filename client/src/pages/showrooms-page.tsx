import React from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ShowroomCard from "@/components/showroom-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Store } from "lucide-react";

const ShowroomsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  
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
        
        {/* Search Section */}
        <div className="bg-white py-6 shadow-sm">
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
              <Button onClick={() => setSearchQuery("")} variant="outline">Clear</Button>
            </div>
          </div>
        </div>
        
        {/* Showrooms Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredShowrooms.length > 0 ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  {searchQuery ? `Search Results (${filteredShowrooms.length})` : "All Showrooms"}
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredShowrooms.map((showroom: any) => (
                  <ShowroomCard
                    key={showroom.id}
                    showroom={showroom}
                    carCount={getCarCount(showroom.id)}
                  />
                ))}
              </div>
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
        
        {/* Join as Seller CTA */}
        <div className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-primary rounded-lg shadow-xl overflow-hidden">
              <div className="pt-10 pb-12 px-6 sm:pt-16 sm:px-16 lg:py-16 lg:pr-0 xl:py-20 xl:px-20">
                <div className="lg:self-center lg:max-w-2xl">
                  <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                    <span className="block">Join our network of premium dealers</span>
                  </h2>
                  <p className="mt-4 text-lg leading-6 text-indigo-100">
                    Register as a seller to showcase your luxury vehicles to thousands of potential buyers.
                    Manage your inventory, connect with customers, and grow your business.
                  </p>
                  <Button
                    href="/auth"
                    size="lg"
                    className="mt-8 bg-white text-primary hover:bg-gray-50"
                    asChild
                  >
                    <a href="/auth">Join as a Seller</a>
                  </Button>
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
