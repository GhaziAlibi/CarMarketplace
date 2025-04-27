import React from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import HeroSection from "@/components/hero-section";
import CarListingCard from "@/components/car-listing-card";
import ShowroomCard from "@/components/showroom-card";
import CarCategoryCard from "@/components/car-category-card";
import HowItWorks from "@/components/how-it-works";
import { Button } from "@/components/ui/button";
import { 
  Car, 
  Caravan, 
  Wind, 
  Truck, 
  Zap, 
  CarFront,
  CheckCircle2,
  ChevronRight
} from "lucide-react";

const HomePage: React.FC = () => {
  // Fetch featured cars
  const { data: featuredCars = [], isLoading: isLoadingCars } = useQuery({
    queryKey: ["/api/cars/featured"],
  });

  // Fetch all showrooms
  const { data: showrooms = [], isLoading: isLoadingShowrooms } = useQuery({
    queryKey: ["/api/showrooms"],
  });

  // Mock car counts for categories (in a real app, these would come from the backend)
  const categories = [
    { icon: <Car />, name: "Sedan", count: 143 },
    { icon: <Caravan />, name: "SUV", count: 128 },
    { icon: <Wind />, name: "Sports", count: 87 },
    { icon: <Truck />, name: "Truck", count: 64 },
    { icon: <Zap />, name: "Electric", count: 52 },
    { icon: <CarFront />, name: "Luxury", count: 112 },
  ];

  // How it works steps
  const howItWorksSteps = [
    {
      number: 1,
      title: "Browse Inventory",
      description: "Explore our vast selection of premium vehicles from trusted dealers across the country.",
    },
    {
      number: 2,
      title: "Contact Seller",
      description: "Use our secure messaging system to ask questions and arrange viewings with the showrooms.",
    },
    {
      number: 3,
      title: "Complete Purchase",
      description: "Finalize your purchase with confidence knowing our platform ensures a secure transaction.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <HeroSection 
          title="Find Your Dream Car" 
          subtitle="Explore the finest selection of luxury vehicles from premium showrooms across the country."
        />
        
        {/* Featured Listings Section */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-accent font-semibold tracking-wide uppercase">
                Featured Listings
              </h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-secondary sm:text-4xl">
                Premium Vehicles For You
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Discover handpicked luxury cars from our trusted showroom partners.
              </p>
            </div>

            <div className="mt-10">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {isLoadingCars ? (
                  // Loading skeleton
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="bg-white overflow-hidden shadow-lg rounded-lg h-[400px] animate-pulse">
                      <div className="h-60 w-full bg-gray-200"></div>
                      <div className="p-6">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/3 mt-4"></div>
                      </div>
                    </div>
                  ))
                ) : featuredCars.length > 0 ? (
                  featuredCars.map((car) => {
                    // Find the showroom for this car (in a real app, this would be included in the API response)
                    const showroom = showrooms.find((s) => s.id === car.showroomId);
                    return (
                      <CarListingCard
                        key={car.id}
                        car={car}
                        showroomName={showroom ? showroom.name : "Unknown Showroom"}
                      />
                    );
                  })
                ) : (
                  <div className="col-span-3 text-center py-10">
                    <p className="text-lg text-gray-500">No featured cars available at the moment.</p>
                  </div>
                )}
              </div>
              
              <div className="mt-12 text-center">
                <Button asChild size="lg">
                  <Link href="/cars" className="inline-flex items-center">
                    View All Listings
                    <ChevronRight className="ml-2 -mr-1 w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Showrooms Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-accent font-semibold tracking-wide uppercase">
                Premium Dealers
              </h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-secondary sm:text-4xl">
                Featured Showrooms
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Browse inventory from our verified luxury car dealerships.
              </p>
            </div>

            <div className="mt-10">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {isLoadingShowrooms ? (
                  // Loading skeleton
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="bg-white overflow-hidden shadow rounded-lg h-[300px] animate-pulse">
                      <div className="p-5">
                        <div className="h-32 w-32 rounded-full bg-gray-200 mx-auto"></div>
                        <div className="mt-4 text-center">
                          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto mb-2"></div>
                          <div className="h-8 bg-gray-200 rounded w-full mt-6"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : showrooms.length > 0 ? (
                  showrooms.slice(0, 4).map((showroom) => (
                    <ShowroomCard
                      key={showroom.id}
                      showroom={showroom}
                      // In a real app, this would come from the API
                      carCount={Math.floor(Math.random() * 50) + 10}
                    />
                  ))
                ) : (
                  <div className="col-span-4 text-center py-10">
                    <p className="text-lg text-gray-500">No showrooms available at the moment.</p>
                  </div>
                )}
              </div>
              
              <div className="mt-12 text-center">
                <Button asChild variant="outline" size="lg">
                  <Link href="/showrooms" className="inline-flex items-center">
                    View All Showrooms
                    <ChevronRight className="ml-2 -mr-1 w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Car Categories Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-accent font-semibold tracking-wide uppercase">
                Browse By Category
              </h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-secondary sm:text-4xl">
                Find Your Perfect Match
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Explore vehicles by category to narrow down your search.
              </p>
            </div>

            <div className="mt-10">
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
                {categories.map((category) => (
                  <CarCategoryCard
                    key={category.name}
                    icon={category.icon}
                    name={category.name}
                    count={category.count}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <HowItWorks steps={howItWorksSteps} />
        
        {/* Admin Dashboard Preview Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:flex lg:items-center lg:justify-between">
              <div className="lg:w-1/2">
                <h2 className="text-base text-accent font-semibold tracking-wide uppercase">
                  Admin Dashboard
                </h2>
                <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-secondary sm:text-4xl">
                  Powerful Management Tools
                </p>
                <p className="mt-4 text-lg text-gray-500">
                  Our comprehensive admin dashboard gives you complete control over your marketplace. Monitor sales, manage listings, and oversee user accounts all from one centralized location.
                </p>
                <div className="mt-8">
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="ml-3 text-base text-gray-500">
                        <span className="font-medium text-secondary">Real-time Analytics:</span> Track marketplace performance with detailed metrics and reports.
                      </p>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="ml-3 text-base text-gray-500">
                        <span className="font-medium text-secondary">User Management:</span> Control access and permissions for both buyers and sellers.
                      </p>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="ml-3 text-base text-gray-500">
                        <span className="font-medium text-secondary">Listing Moderation:</span> Review and approve vehicle listings to ensure quality and accuracy.
                      </p>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="ml-3 text-base text-gray-500">
                        <span className="font-medium text-secondary">Transaction Monitoring:</span> Oversee all marketplace transactions with detailed records.
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-10 lg:mt-0 lg:w-1/2 lg:pl-10">
                <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
                  <div className="bg-primary p-4 text-white">
                    <div className="flex items-center">
                      <div className="mr-2">📊</div>
                      <h3 className="font-medium">Dashboard Overview</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-blue-600 font-medium">Active Listings</p>
                            <p className="text-2xl font-bold text-secondary">586</p>
                          </div>
                          <Car className="text-blue-400 h-6 w-6" />
                        </div>
                        <p className="text-xs text-blue-600 mt-2">+12% from last month</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-green-600 font-medium">Total Sales</p>
                            <p className="text-2xl font-bold text-secondary">$8.2M</p>
                          </div>
                          <div className="text-green-400 text-xl">💰</div>
                        </div>
                        <p className="text-xs text-green-600 mt-2">+8% from last month</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-purple-600 font-medium">Total Users</p>
                            <p className="text-2xl font-bold text-secondary">12,845</p>
                          </div>
                          <div className="text-purple-400 text-xl">👥</div>
                        </div>
                        <p className="text-xs text-purple-600 mt-2">+15% from last month</p>
                      </div>
                      <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-amber-600 font-medium">Active Showrooms</p>
                            <p className="text-2xl font-bold text-secondary">124</p>
                          </div>
                          <div className="text-amber-400 text-xl">🏬</div>
                        </div>
                        <p className="text-xs text-amber-600 mt-2">+5% from last month</p>
                      </div>
                    </div>
                    <div className="mt-6 border-t border-gray-200 pt-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-secondary">Recent Activity</h4>
                        <a href="#" className="text-sm text-primary hover:text-primary-dark">View All</a>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                            <div className="text-sm">+</div>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-secondary">New Listing Added</p>
                            <p className="text-xs text-gray-500">BMW X7 added by Premium Auto</p>
                            <p className="text-xs text-gray-400 mt-1">10 minutes ago</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                            <div className="text-sm">$</div>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-secondary">Sale Completed</p>
                            <p className="text-xs text-gray-500">Mercedes G63 sold by Luxury Motors</p>
                            <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;
