import React, { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { insertCarSchema } from "@shared/schema";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Car,
  DollarSign,
  Upload,
  X,
  Plus,
  Loader2,
  ImageIcon,
  Info,
  Check,
} from "lucide-react";

// Extended schema for form validation
const addListingSchema = insertCarSchema.extend({
  images: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  newFeature: z.string().optional(),
});

type AddListingFormValues = z.infer<typeof addListingSchema>;

const AddListing: React.FC = () => {
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Fetch seller's showroom
  const { data: showroom } = useQuery({
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
  
  // Form setup
  const form = useForm<AddListingFormValues>({
    resolver: zodResolver(addListingSchema),
    defaultValues: {
      title: "",
      make: "",
      model: "",
      year: new Date().getFullYear(),
      price: 0,
      mileage: 0,
      transmission: "automatic",
      fuelType: "gasoline",
      category: "Sedan",
      description: "",
      features: [],
      images: [],
      newFeature: "",
    },
  });
  
  // Create listing mutation
  const createListingMutation = useMutation({
    mutationFn: async (data: AddListingFormValues) => {
      // Remove newFeature field before submitting
      const { newFeature, ...submitData } = data;
      
      // Set showroomId
      if (!showroom) {
        throw new Error("Showroom information not found");
      }
      
      const carData = {
        ...submitData,
        showroomId: showroom.id,
      };
      
      const res = await apiRequest("POST", "/api/cars", carData);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Listing created",
        description: "Your car listing has been successfully created.",
      });
      navigate(`/cars/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create listing. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: AddListingFormValues) => {
    createListingMutation.mutate(data);
  };
  
  // Handle image upload (simulated)
  const handleImageUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          
          // Add placeholder images
          const newImages = [
            "https://images.unsplash.com/photo-1617654112368-307924916489?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1635864702590-b18548659e54?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
          ];
          
          form.setValue("images", [
            ...(form.getValues("images") || []),
            ...newImages
          ]);
          
          toast({
            title: "Images uploaded",
            description: "Your images have been uploaded successfully.",
          });
          
          return 0;
        }
        return prev + 5;
      });
    }, 100);
  };
  
  // Remove image
  const removeImage = (index: number) => {
    const currentImages = form.getValues("images") || [];
    const newImages = [...currentImages];
    newImages.splice(index, 1);
    form.setValue("images", newImages);
  };
  
  // Add new feature
  const addFeature = () => {
    const newFeature = form.getValues("newFeature");
    if (!newFeature) return;
    
    const currentFeatures = form.getValues("features") || [];
    form.setValue("features", [...currentFeatures, newFeature]);
    form.setValue("newFeature", "");
  };
  
  // Remove feature
  const removeFeature = (index: number) => {
    const currentFeatures = form.getValues("features") || [];
    const newFeatures = [...currentFeatures];
    newFeatures.splice(index, 1);
    form.setValue("features", newFeatures);
  };
  
  // Available years for selection
  const availableYears = Array.from(
    { length: 30 },
    (_, i) => new Date().getFullYear() - i
  );
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-6">
            <Button variant="ghost" className="mr-4" asChild>
              <a href="/seller/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </a>
            </Button>
            <h1 className="text-2xl font-bold">Add New Listing</h1>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Enter the essential details about your vehicle
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Listing Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 2023 BMW 7 Series - Like New" {...field} />
                        </FormControl>
                        <FormDescription>
                          Create a compelling title for your listing (year, make, model, condition)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="make"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Make</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select make" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Mercedes-Benz">Mercedes-Benz</SelectItem>
                              <SelectItem value="BMW">BMW</SelectItem>
                              <SelectItem value="Audi">Audi</SelectItem>
                              <SelectItem value="Porsche">Porsche</SelectItem>
                              <SelectItem value="Lexus">Lexus</SelectItem>
                              <SelectItem value="Tesla">Tesla</SelectItem>
                              <SelectItem value="Ferrari">Ferrari</SelectItem>
                              <SelectItem value="Lamborghini">Lamborghini</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. S-Class, 7 Series" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))} 
                            defaultValue={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select year" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableYears.map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price ($)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input 
                                type="number" 
                                placeholder="e.g. 45000" 
                                className="pl-10"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="mileage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mileage</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="e.g. 15000" 
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Sedan">Sedan</SelectItem>
                              <SelectItem value="SUV">SUV</SelectItem>
                              <SelectItem value="Sports">Sports</SelectItem>
                              <SelectItem value="Truck">Truck</SelectItem>
                              <SelectItem value="Electric">Electric</SelectItem>
                              <SelectItem value="Luxury">Luxury</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="transmission"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transmission</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select transmission" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="automatic">Automatic</SelectItem>
                              <SelectItem value="manual">Manual</SelectItem>
                              <SelectItem value="semi-automatic">Semi-Automatic</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="fuelType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fuel Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select fuel type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="gasoline">Gasoline</SelectItem>
                              <SelectItem value="diesel">Diesel</SelectItem>
                              <SelectItem value="electric">Electric</SelectItem>
                              <SelectItem value="hybrid">Hybrid</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Provide a detailed description of the vehicle, including condition, history, and any special features." 
                            className="min-h-32"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              
              {/* Features */}
              <Card>
                <CardHeader>
                  <CardTitle>Features</CardTitle>
                  <CardDescription>
                    Add key features and specifications of your vehicle
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {form.watch("features")?.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="py-2 px-3">
                        {feature}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-2 hover:bg-transparent"
                          onClick={() => removeFeature(index)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </Badge>
                    ))}
                    {(!form.watch("features") || form.watch("features").length === 0) && (
                      <div className="text-gray-500 text-sm">No features added yet</div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a feature (e.g. Leather Seats, Navigation)"
                      {...form.register("newFeature")}
                      className="flex-1"
                    />
                    <Button type="button" onClick={addFeature}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Images */}
              <Card>
                <CardHeader>
                  <CardTitle>Images</CardTitle>
                  <CardDescription>
                    Upload high-quality images of your vehicle
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {form.watch("images")?.map((image, index) => (
                      <div key={index} className="relative aspect-video bg-gray-100 rounded-md overflow-hidden">
                        <img
                          src={image}
                          alt={`Vehicle image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 rounded-full"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    ))}
                    
                    {(!form.watch("images") || form.watch("images").length === 0) && (
                      <div className="col-span-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-12">
                        <div className="text-center">
                          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-4 flex text-sm leading-6 text-gray-600">
                            <label className="relative cursor-pointer rounded-md bg-white font-semibold text-primary hover:text-primary-dark">
                              <span>Upload images</span>
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, WebP up to 10MB each</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {isUploading && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="h-2" />
                      </div>
                    )}
                    
                    <Button 
                      type="button" 
                      onClick={handleImageUpload} 
                      disabled={isUploading}
                      variant="outline"
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Upload Images
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Submit Section */}
              <Card>
                <CardContent className="pt-6">
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
                    <div className="flex">
                      <Info className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-800">Before you submit</h4>
                        <p className="text-sm text-amber-700">
                          Make sure all details are accurate. Your listing will be reviewed before becoming visible to buyers.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-end">
                    <Button type="button" variant="outline" asChild>
                      <a href="/seller/dashboard">Cancel</a>
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createListingMutation.isPending}
                    >
                      {createListingMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Submit Listing
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AddListing;
