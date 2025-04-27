import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Search,
  CarFront,
  Car,
  Heart,
  Trash2,
  MapPin,
  MoreHorizontal,
  ExternalLink,
  Eye,
  MessageSquare,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const SavedCars: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [favoriteToRemove, setFavoriteToRemove] = useState<any | null>(null);
  
  // Fetch saved cars (favorites)
  const {
    data: favorites = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["/api/favorites"],
    enabled: !!user,
  });
  
  // Fetch all showrooms to display names
  const { data: showrooms = [] } = useQuery({
    queryKey: ["/api/showrooms"],
  });
  
  // Remove from favorites mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: async (favoriteId: number) => {
      await apiRequest("DELETE", `/api/favorites/${favoriteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Removed from favorites",
        description: "The car has been removed from your saved list.",
      });
      setDeleteDialogOpen(false);
      setFavoriteToRemove(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove from favorites",
        variant: "destructive",
      });
    },
  });
  
  // Filter favorites based on search
  const filteredFavorites = favorites.filter((favorite: any) => {
    const car = favorite.car;
    if (!car) return false;
    
    return (
      car.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.model.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });
  
  // Get showroom name by ID
  const getShowroomName = (showroomId: number) => {
    const showroom = showrooms.find((s: any) => s.id === showroomId);
    return showroom ? showroom.name : "Unknown Showroom";
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Handle remove from favorites
  const handleRemoveFavorite = (favorite: any) => {
    setFavoriteToRemove(favorite);
    setDeleteDialogOpen(true);
  };
  
  // Confirm remove from favorites
  const confirmRemoveFavorite = () => {
    if (favoriteToRemove) {
      removeFavoriteMutation.mutate(favoriteToRemove.id);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-6">
            <Button variant="ghost" className="mr-4" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">My Saved Cars</h1>
          </div>
          
          <div className="mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search saved cars..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <Card>
              <CardContent className="py-10 flex flex-col items-center justify-center">
                <AlertTriangle className="h-10 w-10 text-amber-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">Error Loading Saved Cars</h3>
                <p className="text-gray-500 mb-4">There was a problem fetching your saved cars.</p>
                <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/favorites"] })}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : filteredFavorites.length === 0 ? (
            <Card>
              <CardContent className="py-12 flex flex-col items-center justify-center">
                <Heart className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-xl font-medium mb-2">No Saved Cars</h3>
                <p className="text-gray-500 mb-6 text-center max-w-md">
                  {searchQuery
                    ? "No saved cars match your search criteria."
                    : "You haven't saved any cars yet. Browse our listings and click the heart icon to save cars you're interested in."}
                </p>
                <Button asChild>
                  <Link href="/cars">
                    <CarFront className="h-4 w-4 mr-2" />
                    Browse Cars
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFavorites.map((favorite: any) => {
                const car = favorite.car;
                if (!car) return null;
                
                return (
                  <Card key={favorite.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative">
                      <div className="h-48 bg-gray-200">
                        <img
                          src={car.images && car.images[0] ? car.images[0] : "https://placehold.co/600x400?text=No+Image"}
                          alt={car.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white shadow-sm hover:bg-red-50 text-red-500"
                        onClick={() => handleRemoveFavorite(favorite)}
                      >
                        <Heart className="h-5 w-5 fill-current" />
                      </Button>
                    </div>
                    
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg line-clamp-1">{car.title}</h3>
                        <span className="font-bold text-accent">{formatCurrency(car.price)}</span>
                      </div>
                      
                      <p className="text-sm text-gray-500 mb-4">
                        {car.year} • {car.mileage.toLocaleString()} miles • {car.transmission} • {car.fuelType}
                      </p>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <MapPin className="h-4 w-4 text-accent mr-2" />
                        <span>{getShowroomName(car.showroomId)}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {car.features && car.features.slice(0, 3).map((feature: string, i: number) => (
                          <Badge key={i} variant="outline" className="bg-gray-100 text-gray-800">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <Button variant="default" size="sm" asChild>
                          <Link href={`/cars/${car.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/cars/${car.id}`}>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/messages?car=${car.id}&showroom=${car.showroomId}`)}>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Contact Seller
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRemoveFavorite(favorite)} className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove from Saved
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Saved Cars</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this car from your saved list? You can always add it back later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveFavorite} className="bg-red-600 hover:bg-red-700">
              {removeFavoriteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Footer />
    </div>
  );
};

export default SavedCars;
