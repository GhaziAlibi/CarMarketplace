import React, { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  CarFront, 
  Calendar, 
  Gauge, 
  Fuel, 
  Shuffle, 
  Tag, 
  Heart, 
  MessageSquare, 
  Phone, 
  Mail, 
  ArrowLeft,
  MapPin,
  Share2,
  Loader2
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserRole } from "@shared/schema";

// Message form schema
const messageSchema = z.object({
  content: z.string().min(10, "Message must be at least 10 characters"),
});

type MessageFormValues = z.infer<typeof messageSchema>;

const CarDetailsPage: React.FC = () => {
  const [_, params] = useRoute("/cars/:id");
  const carId = params?.id ? parseInt(params.id) : 0;
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  
  // Form for contact message
  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });
  
  // Fetch car details
  const { 
    data: car, 
    isLoading: isLoadingCar, 
    isError: isErrorCar 
  } = useQuery({
    queryKey: [`/api/cars/${carId}`],
    enabled: !!carId,
  });
  
  // Fetch showroom details for this car
  const { 
    data: showroom, 
    isLoading: isLoadingShowroom 
  } = useQuery({
    queryKey: [`/api/showrooms/${car?.showroomId}`],
    enabled: !!car?.showroomId,
  });
  
  // Fetch showroom owner (seller) details
  const { 
    data: seller
  } = useQuery({
    queryKey: [`/api/users/${showroom?.userId}`],
    enabled: !!showroom?.userId,
  });
  
  // Check if car is favorited
  const { 
    data: favorites = [],
    isLoading: isLoadingFavorites 
  } = useQuery({
    queryKey: ["/api/favorites"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/favorites");
        return await res.json();
      } catch (error) {
        // If unauthorized or other error, return empty array
        return [];
      }
    },
    enabled: !!user,
  });
  
  const isFavorited = favorites.some((favorite: any) => favorite.carId === carId);
  
  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("You must be logged in to save cars");
      
      if (isFavorited) {
        // Find the favorite id and delete it
        const favorite = favorites.find((f: any) => f.carId === carId);
        if (favorite) {
          await apiRequest("DELETE", `/api/favorites/${favorite.id}`);
        }
      } else {
        await apiRequest("POST", "/api/favorites", { carId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: isFavorited ? "Removed from favorites" : "Added to favorites",
        description: isFavorited ? "Car has been removed from your saved list" : "Car has been added to your saved list",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: MessageFormValues) => {
      if (!user) throw new Error("You must be logged in to send messages");
      if (!showroom?.userId) throw new Error("Could not find seller information");
      
      await apiRequest("POST", "/api/messages", {
        senderId: user.id,
        receiverId: showroom.userId,
        carId,
        content: data.content
      });
    },
    onSuccess: () => {
      setMessageDialogOpen(false);
      form.reset();
      toast({
        title: "Message sent",
        description: "Your message has been sent to the seller.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const onSubmitMessage = (data: MessageFormValues) => {
    sendMessageMutation.mutate(data);
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  if (isLoadingCar || isLoadingShowroom) {
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
  
  if (isErrorCar || !car) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">Car Not Found</h1>
              <p className="mt-4 text-gray-500">The car you're looking for doesn't exist or has been removed.</p>
              <Button className="mt-8" asChild>
                <Link href="/cars">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Listings
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link href="/cars">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Listings
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Car Details */}
            <div className="lg:col-span-2">
              {/* Car Images */}
              <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
                <Carousel className="w-full">
                  <CarouselContent>
                    {car.images && car.images.length > 0 ? (
                      car.images.map((image: string, index: number) => (
                        <CarouselItem key={index}>
                          <div className="p-1">
                            <div className="h-[400px] w-full rounded-md overflow-hidden">
                              <img
                                src={image}
                                alt={`${car.make} ${car.model} - Image ${index + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </div>
                        </CarouselItem>
                      ))
                    ) : (
                      <CarouselItem>
                        <div className="p-1">
                          <div className="h-[400px] w-full rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                            <CarFront className="h-16 w-16 text-gray-400" />
                          </div>
                        </div>
                      </CarouselItem>
                    )}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
              
              {/* Car Information */}
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">{car.title}</CardTitle>
                      <CardDescription>{car.make} {car.model} {car.year}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-accent">{formatCurrency(car.price)}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
                      <Calendar className="h-6 w-6 text-primary mb-2" />
                      <span className="text-sm text-gray-500">Year</span>
                      <span className="font-medium">{car.year}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
                      <Gauge className="h-6 w-6 text-primary mb-2" />
                      <span className="text-sm text-gray-500">Mileage</span>
                      <span className="font-medium">{car.mileage.toLocaleString()} miles</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
                      <Fuel className="h-6 w-6 text-primary mb-2" />
                      <span className="text-sm text-gray-500">Fuel Type</span>
                      <span className="font-medium">{car.fuelType}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
                      <Shuffle className="h-6 w-6 text-primary mb-2" />
                      <span className="text-sm text-gray-500">Transmission</span>
                      <span className="font-medium">{car.transmission}</span>
                    </div>
                  </div>
                  
                  <Tabs defaultValue="overview">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="features">Features</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="mt-4">
                      <h3 className="font-semibold text-lg mb-2">Description</h3>
                      <p className="text-gray-600">{car.description || "No description provided."}</p>
                      
                      <div className="mt-6">
                        <h3 className="font-semibold text-lg mb-2">Specifications</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-500">Make</span>
                            <span className="font-medium">{car.make}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-500">Model</span>
                            <span className="font-medium">{car.model}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-500">Year</span>
                            <span className="font-medium">{car.year}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-500">Mileage</span>
                            <span className="font-medium">{car.mileage.toLocaleString()} miles</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-500">Fuel Type</span>
                            <span className="font-medium">{car.fuelType}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-500">Transmission</span>
                            <span className="font-medium">{car.transmission}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-gray-500">Category</span>
                            <span className="font-medium">{car.category}</span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="features" className="mt-4">
                      <h3 className="font-semibold text-lg mb-2">Features</h3>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {car.features ? (
                          // Handle both string and array formats for features
                          Array.isArray(car.features) ? (
                            // If it's an array, map through it
                            car.features.map((feature: string, index: number) => (
                              <Badge variant="outline" key={index} className="bg-gray-100 text-gray-800">
                                {feature}
                              </Badge>
                            ))
                          ) : (
                            // If it's a string, split by commas and map
                            typeof car.features === 'string' ? 
                              car.features.split(',').map((feature: string, index: number) => (
                                <Badge variant="outline" key={index} className="bg-gray-100 text-gray-800">
                                  {feature.trim()}
                                </Badge>
                              ))
                            : null
                          )
                        ) : (
                          <p className="text-gray-500">No features listed for this vehicle.</p>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => toggleFavoriteMutation.mutate()}
                    disabled={!user || toggleFavoriteMutation.isPending}
                  >
                    {toggleFavoriteMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Heart className={`mr-2 h-4 w-4 ${isFavorited ? 'fill-current text-accent' : ''}`} />
                    )}
                    {isFavorited ? "Saved" : "Save to Favorites"}
                  </Button>
                  <Button variant="outline" onClick={() => window.navigator.share({ url: window.location.href })}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            {/* Right Column - Seller/Showroom Info */}
            <div>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Seller Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {showroom ? (
                    <div>
                      <div className="flex items-center mb-4">
                        <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 mr-4">
                          <img 
                            src={showroom.logo || "https://placehold.co/100x100?text=No+Logo"} 
                            alt={showroom.name} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{showroom.name}</h3>
                          <div className="flex items-center mt-1">
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <svg 
                                  key={i}
                                  className={`h-4 w-4 ${i < showroom.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                  xmlns="http://www.w3.org/2000/svg" 
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                              ))}
                            </div>
                            <span className="ml-1 text-gray-500 text-sm">({showroom.reviewCount} reviews)</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-gray-600 mb-4">
                        <div className="flex items-start mb-2">
                          <MapPin className="h-5 w-5 text-accent mr-2 mt-0.5" />
                          <span>{showroom.address || `${showroom.city}, ${showroom.country}`}</span>
                        </div>
                        {showroom.description && (
                          <p className="mt-2">{showroom.description}</p>
                        )}
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="space-y-3">
                        <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
                          <DialogTrigger asChild>
                            <Button className="w-full">
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Contact Seller
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Contact Seller</DialogTitle>
                              <DialogDescription>
                                Send a message to {showroom.name} about {car.make} {car.model}
                              </DialogDescription>
                            </DialogHeader>
                            
                            {user ? (
                              <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmitMessage)} className="space-y-4">
                                  <FormField
                                    control={form.control}
                                    name="content"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Message</FormLabel>
                                        <FormControl>
                                          <Textarea 
                                            placeholder="I'm interested in this car. Is it still available?"
                                            {...field}
                                            rows={5}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <DialogFooter>
                                    <Button type="submit" disabled={sendMessageMutation.isPending}>
                                      {sendMessageMutation.isPending ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Sending...
                                        </>
                                      ) : (
                                        "Send Message"
                                      )}
                                    </Button>
                                  </DialogFooter>
                                </form>
                              </Form>
                            ) : (
                              <div className="text-center py-4">
                                <p className="mb-4">You need to be logged in to send messages.</p>
                                <Button asChild>
                                  <Link href="/auth">
                                    Login or Register
                                  </Link>
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <Button variant="outline" className="w-full" asChild>
                          <Link href={`/showrooms/${showroom.id}`}>
                            <Tag className="mr-2 h-4 w-4" />
                            View All Seller Listings
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">Seller information not available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Similar Cars - would be populated with actual data in a real app */}
              <Card>
                <CardHeader>
                  <CardTitle>Similar Vehicles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4">
                    <p className="text-gray-500">No similar vehicles available at the moment.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CarDetailsPage;
