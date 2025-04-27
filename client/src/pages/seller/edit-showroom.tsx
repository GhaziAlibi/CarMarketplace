import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Showroom } from "@shared/schema";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, ArrowLeft, Upload, Image, Info } from "lucide-react";

// Form schema for showroom updates
const showroomFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  description: z.string().max(1000, "Description cannot exceed 1000 characters").optional(),
  city: z.string().min(2, "City must be at least 2 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  headerImage: z.string().url("Please enter a valid URL").optional(),
  logo: z.string().url("Please enter a valid URL").optional(),
  address: z.string().max(200).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email("Please enter a valid email").optional(),
});

type ShowroomFormValues = z.infer<typeof showroomFormSchema>;

const SellerEditShowroom: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");

  // Fetch seller's showroom
  const { 
    data: showroom, 
    isLoading: isLoadingShowroom, 
    isError: isErrorShowroom 
  } = useQuery<Showroom>({
    queryKey: ["/api/seller/showroom"],
    enabled: !!user && user.role === "seller",
  });

  // Form setup
  const form = useForm<ShowroomFormValues>({
    resolver: zodResolver(showroomFormSchema),
    defaultValues: {
      name: "",
      description: "",
      city: "",
      country: "",
      headerImage: "",
      logo: "",
      address: "",
      phone: "",
      email: "",
    },
  });
  
  // Update form values when showroom data is loaded
  React.useEffect(() => {
    if (showroom) {
      form.reset({
        name: showroom.name || "",
        description: showroom.description || "",
        city: showroom.city || "",
        country: showroom.country || "",
        headerImage: showroom.headerImage || "",
        logo: showroom.logo || "",
        address: showroom.address || "",
        phone: showroom.phone || "",
        email: showroom.email || "",
      });
    }
  }, [showroom, form]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: ShowroomFormValues) => {
      if (!showroom) return null;
      console.log("Submitting form data:", data);
      const res = await apiRequest("PATCH", `/api/showrooms/${showroom.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your showroom has been updated",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/seller/showroom"] });
      queryClient.invalidateQueries({ queryKey: [`/api/showrooms/${showroom?.id}`] });
    },
    onError: (error: Error) => {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update showroom",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ShowroomFormValues) => {
    console.log("Form submitted with data:", data);
    
    // Filter out undefined values
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined && value !== "")
    );
    
    console.log("Cleaned data for submission:", cleanedData);
    updateMutation.mutate(cleanedData as ShowroomFormValues);
  };

  // If user is not a seller, redirect to home
  if (user && user.role !== "seller") {
    return <Redirect to="/" />;
  }

  // Loading state
  if (isLoadingShowroom) {
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

  // Error state
  if (isErrorShowroom || !showroom) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">Showroom Not Found</h1>
              <p className="mt-4 text-gray-500">We couldn't find your showroom. Please contact support.</p>
              <Button className="mt-8" asChild>
                <a href="/seller/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </a>
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Edit Showroom</h1>
              <p className="text-gray-500 mt-1">Customize your showroom's appearance and information</p>
            </div>
            <Button variant="outline" asChild>
              <a href="/seller/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </a>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <Card>
                <CardContent className="p-4">
                  <Tabs 
                    defaultValue="general" 
                    value={activeTab} 
                    onValueChange={setActiveTab} 
                    orientation="vertical" 
                    className="w-full"
                  >
                    <TabsList className="flex flex-col items-stretch h-auto bg-transparent space-y-1">
                      <TabsTrigger 
                        value="general" 
                        className="justify-start px-3 py-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                      >
                        General Information
                      </TabsTrigger>
                      <TabsTrigger 
                        value="appearance" 
                        className="justify-start px-3 py-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                      >
                        Appearance & Media
                      </TabsTrigger>
                      <TabsTrigger 
                        value="contact" 
                        className="justify-start px-3 py-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                      >
                        Contact Details
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="md:col-span-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {activeTab === "general" && "General Information"}
                    {activeTab === "appearance" && "Appearance & Media"}
                    {activeTab === "contact" && "Contact Details"}
                  </CardTitle>
                  <CardDescription>
                    {activeTab === "general" && "Update your showroom's basic information"}
                    {activeTab === "appearance" && "Upload images and customize your showroom's appearance"}
                    {activeTab === "contact" && "Update your contact information"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={(e) => { e.preventDefault(); }} className="space-y-6">
                      <Tabs value={activeTab}>
                        <TabsContent value="general" className="mt-0 space-y-6">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Showroom Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    {...field} 
                                    placeholder="Describe your showroom, specialties, and unique selling points..."
                                    className="min-h-32 resize-none"
                                  />
                                </FormControl>
                                <FormDescription>
                                  This will appear on your showroom's About page.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="country"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Country</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="appearance" className="mt-0 space-y-6">
                          <FormField
                            control={form.control}
                            name="headerImage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Header Image URL</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="https://example.com/your-header-image.jpg"
                                  />
                                </FormControl>
                                <FormDescription>
                                  Enter a URL for your header image (1920x400px recommended)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {form.watch("headerImage") && (
                            <div className="relative rounded-md overflow-hidden mt-2 h-40">
                              <img
                                src={form.watch("headerImage")}
                                alt="Header preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://placehold.co/1200x400?text=Invalid+Image+URL";
                                }}
                              />
                            </div>
                          )}
                          
                          <Separator className="my-6" />
                          
                          <FormField
                            control={form.control}
                            name="logo"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Logo URL</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="https://example.com/your-logo.png"
                                  />
                                </FormControl>
                                <FormDescription>
                                  Enter a URL for your logo (square image recommended)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {form.watch("logo") && (
                            <div className="mt-2 h-24 w-24 rounded-full bg-white shadow-lg overflow-hidden flex-shrink-0">
                              <img
                                src={form.watch("logo")}
                                alt="Logo preview"
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://placehold.co/300x300?text=Invalid+Image+URL";
                                }}
                              />
                            </div>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="contact" className="mt-0 space-y-6">
                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Address</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    {...field} 
                                    placeholder="Enter your complete street address..."
                                    className="resize-none"
                                  />
                                </FormControl>
                                <FormDescription>
                                  This will be displayed on your showroom's contact section
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone Number</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      placeholder="+1 (123) 456-7890"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      placeholder="contact@yourshowroom.com"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </TabsContent>
                      </Tabs>
                      
                      <div className="flex justify-end space-x-4 pt-4">
                        <Button 
                          type="button" 
                          onClick={form.handleSubmit(onSubmit)}
                          disabled={updateMutation.isPending}
                          className="min-w-32"
                        >
                          {updateMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
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

export default SellerEditShowroom;