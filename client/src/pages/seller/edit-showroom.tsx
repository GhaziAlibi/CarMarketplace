import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, Store, Image, Upload } from "lucide-react";

// Form validation schema
const showroomFormSchema = z.object({
  name: z.string().min(3, { message: "Showroom name must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }).max(500, {
    message: "Description must not exceed 500 characters",
  }),
  logo: z.string().url({ message: "Please enter a valid URL for the logo" }).optional().or(z.literal("")),
  headerImage: z.string().url({ message: "Please enter a valid URL for the header image" }).optional().or(z.literal("")),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }).optional().or(z.literal("")),
  city: z.string().min(2, { message: "City must be at least 2 characters" }),
  country: z.string().min(2, { message: "Country must be at least 2 characters" }),
});

type ShowroomFormValues = z.infer<typeof showroomFormSchema>;

const EditShowroomPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [headerPreview, setHeaderPreview] = useState<string | null>(null);

  // Fetch seller's showroom
  const { 
    data: showroom,
    isLoading: isLoadingShowroom,
  } = useQuery({
    queryKey: [`/api/showrooms/user/${user?.id}`],
    queryFn: async () => {
      try {
        // In a real app, there would be an endpoint to get showroom by user ID
        const res = await fetch("/api/showrooms");
        const allShowrooms = await res.json();
        return allShowrooms.find((s: any) => s.userId === user?.id);
      } catch (error) {
        console.error("Error fetching showroom:", error);
        return null;
      }
    },
    enabled: !!user,
  });

  const form = useForm<ShowroomFormValues>({
    resolver: zodResolver(showroomFormSchema),
    defaultValues: {
      name: "",
      description: "",
      logo: "",
      headerImage: "",
      address: "",
      city: "",
      country: "",
    },
  });

  // Update form values when showroom data is loaded
  React.useEffect(() => {
    if (showroom) {
      form.reset({
        name: showroom.name,
        description: showroom.description || "",
        logo: showroom.logo || "",
        headerImage: showroom.headerImage || "",
        address: showroom.address || "",
        city: showroom.city,
        country: showroom.country,
      });

      // Set preview images
      if (showroom.logo) setLogoPreview(showroom.logo);
      if (showroom.headerImage) setHeaderPreview(showroom.headerImage);
    }
  }, [showroom, form]);

  // Update showroom mutation
  const updateShowroomMutation = useMutation({
    mutationFn: async (data: ShowroomFormValues) => {
      if (!showroom) throw new Error("Showroom not found");
      await apiRequest("PUT", `/api/showrooms/${showroom.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Showroom updated",
        description: "Your showroom information has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/showrooms/user/${user?.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/showrooms/${showroom.id}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update showroom",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ShowroomFormValues) => {
    updateShowroomMutation.mutate(data);
  };

  // Preview handlers
  const handleLogoPreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setLogoPreview(url ? url : null);
  };

  const handleHeaderPreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setHeaderPreview(url ? url : null);
  };

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

  if (!showroom) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <div className="max-w-4xl mx-auto px-4 py-12">
            <Card>
              <CardHeader>
                <CardTitle>Create Your Showroom</CardTitle>
                <CardDescription>
                  You need to create a showroom before you can customize it.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">You don't have a showroom yet. Create one to start selling cars.</p>
                <Button asChild>
                  <Link href="/seller/add-showroom">Create Showroom</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold">Customize Your Showroom</h1>
              <p className="text-gray-500 mt-1">Update your showroom details and appearance</p>
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Button asChild variant="outline">
                <Link href={`/showrooms/${showroom.id}`}>
                  <Store className="h-4 w-4 mr-2" />
                  View Your Showroom
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/seller/dashboard">
                  Go to Dashboard
                </Link>
              </Button>
            </div>
          </div>

          {/* Showroom Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left side - Form */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Showroom Information</CardTitle>
                  <CardDescription>Update your showroom details below</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Showroom Name*</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your showroom name" {...field} />
                            </FormControl>
                            <FormDescription>
                              This is how your showroom will appear to customers
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description*</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Write a description of your showroom" 
                                className="min-h-32" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Tell customers about your showroom, services, and what makes you unique
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
                              <FormLabel>City*</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your city" {...field} />
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
                              <FormLabel>Country*</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your country" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your address (optional)" {...field} />
                            </FormControl>
                            <FormDescription>
                              Your full address (will be displayed on your showroom page)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Separator className="my-6" />
                      <h3 className="text-lg font-medium mb-4">Showroom Appearance</h3>

                      <FormField
                        control={form.control}
                        name="logo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Logo URL</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter URL for your logo" 
                                {...field} 
                                onChange={(e) => {
                                  field.onChange(e);
                                  handleLogoPreview(e);
                                }}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter a direct image URL for your showroom logo (square format recommended)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="headerImage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Header Image URL</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter URL for your header image" 
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  handleHeaderPreview(e);
                                }}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter a direct image URL for your showroom header (recommended size: 1200x400px)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full md:w-auto" 
                        disabled={updateShowroomMutation.isPending}
                      >
                        {updateShowroomMutation.isPending ? (
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
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* Right side - Preview */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>See how your showroom will look</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Logo</h4>
                    <div className="h-24 w-24 rounded-full overflow-hidden border bg-gray-50 flex items-center justify-center">
                      {logoPreview ? (
                        <img 
                          src={logoPreview} 
                          alt="Logo preview" 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=Invalid+URL";
                          }}
                        />
                      ) : (
                        <div className="text-gray-300 flex flex-col items-center justify-center">
                          <Image className="h-8 w-8" />
                          <span className="text-xs mt-1">No logo</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Header Image</h4>
                    <div className="h-40 rounded-md overflow-hidden border bg-gray-50 flex items-center justify-center">
                      {headerPreview ? (
                        <img 
                          src={headerPreview} 
                          alt="Header preview" 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placehold.co/800x300?text=Invalid+URL";
                          }}
                        />
                      ) : (
                        <div className="text-gray-300 flex flex-col items-center justify-center">
                          <Image className="h-8 w-8" />
                          <span className="text-xs mt-1">No header image</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-md mt-4">
                    <p className="text-sm text-gray-500">
                      Tips for great showroom images:
                    </p>
                    <ul className="text-xs text-gray-500 list-disc list-inside mt-2 space-y-1">
                      <li>Use high-quality, professional images</li>
                      <li>Logo should be square format (1:1 ratio)</li>
                      <li>Header should be wide format (3:1 ratio)</li>
                      <li>Ensure images represent your brand identity</li>
                      <li>Optimize image size for faster loading</li>
                    </ul>
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

export default EditShowroomPage;