import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertShowroomSchema } from "@shared/schema";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Store,
  MapPin,
  Phone,
  Globe,
  Mail,
  Clock,
  Image as ImageIcon,
  Loader2,
  Save,
  Upload,
  Trash2,
} from "lucide-react";
import { Label } from "@/components/ui/label";

interface EditShowroomContentProps {
  showroom: any;
}

// Extended schema for the form
const showroomFormSchema = insertShowroomSchema.extend({
  website: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  openingHours: z.string().optional(),
  logo: z.any().optional(), 
  images: z.any().optional(),
});

type ShowroomFormValues = z.infer<typeof showroomFormSchema>;

// List of countries for select options
const COUNTRIES = [
  "United States", "Canada", "United Kingdom", "Germany", "France", 
  "Italy", "Spain", "Australia", "Japan", "China", "Brazil", "Mexico",
  "India", "South Africa", "Russia", "United Arab Emirates", "Saudi Arabia"
];

const EditShowroomContent: React.FC<EditShowroomContentProps> = ({ showroom }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("basic");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(showroom?.logo || null);
  const [coverFiles, setCoverFiles] = useState<File[]>([]);
  const [coverPreviews, setCoverPreviews] = useState<string[]>(showroom?.images || []);
  
  // Default values for the form based on existing showroom data
  const form = useForm<ShowroomFormValues>({
    resolver: zodResolver(showroomFormSchema),
    defaultValues: {
      name: showroom?.name || "",
      description: showroom?.description || "",
      address: showroom?.address || "",
      city: showroom?.city || "",
      state: showroom?.state || "",
      country: showroom?.country || "",
      postalCode: showroom?.postalCode || "",
      phone: showroom?.phone || "",
      email: showroom?.email || user?.email || "",
      website: showroom?.website || "",
      openingHours: showroom?.openingHours || "",
    }
  });

  // Update showroom mutation
  const updateShowroomMutation = useMutation({
    mutationFn: async (values: ShowroomFormValues) => {
      // In a real implementation, you would handle image uploads here
      // For now, we'll just simulate it
      
      // Create updated showroom data
      const showroomData = {
        ...values,
        logo: logoPreview,
        images: coverPreviews,
      };
      
      if (showroom?.id) {
        // Update existing showroom
        const res = await apiRequest('PATCH', `/api/showrooms/${showroom.id}`, showroomData);
        return res.json();
      } else {
        // Create new showroom
        const res = await apiRequest('POST', `/api/showrooms`, showroomData);
        return res.json();
      }
    },
    onSuccess: () => {
      // Refetch showroom data
      queryClient.invalidateQueries({ queryKey: [`/api/showrooms/user/${user?.id}`] });
      
      toast({
        title: showroom?.id ? "Showroom updated successfully" : "Showroom created successfully",
        description: showroom?.id ? "Your showroom information has been updated" : "Your new showroom has been created",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: showroom?.id ? "Error updating showroom" : "Error creating showroom",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };

  // Handle cover image selection
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setCoverFiles(prev => [...prev, ...newFiles]);
      
      // Create preview URLs
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setCoverPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  // Remove a cover image
  const removeCoverImage = (index: number) => {
    setCoverPreviews(prev => prev.filter((_, i) => i !== index));
    setCoverFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Form submission handler
  const onSubmit = (values: ShowroomFormValues) => {
    updateShowroomMutation.mutate(values);
  };

  // Determine if we're in create mode (no showroom) or edit mode (existing showroom)
  const [createMode, setCreateMode] = useState<boolean>(!showroom);
  
  if (!showroom && !createMode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create New Showroom</CardTitle>
          <CardDescription>You need to create a showroom first</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-10">
          <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="mb-4">You don't have a showroom yet. Create one to start listing vehicles.</p>
          <Button onClick={() => setCreateMode(true)}>Create Showroom</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          {showroom ? "Edit Showroom" : "Create New Showroom"}
        </CardTitle>
        <CardDescription>
          {showroom 
            ? "Update your showroom profile and business information" 
            : "Fill in your showroom details to start listing vehicles"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="contact">Contact & Location</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <TabsContent value="basic" className="space-y-6">
                {/* Basic Information */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Showroom Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Premium Motors" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is the name that will be displayed to customers
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your showroom, specialties, and what makes it unique"
                          className="min-h-[120px]"
                          value={field.value || ''}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormDescription>
                        A detailed description helps customers understand your business
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="openingHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opening Hours</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Mon-Fri: 9am-6pm, Sat: 10am-4pm, Sun: Closed"
                          className="min-h-[80px]"
                          value={field.value || ''}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormDescription>
                        List your business hours for potential customers
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="contact" className="space-y-6">
                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="+1 (555) 123-4567" 
                            value={field.value || ''}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
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
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="contact@yourshowroom.com" 
                            value={field.value || ''}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://yourshowroom.com" 
                          value={field.value || ''}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Location Information */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">Location</h3>
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="123 Main Street" 
                            value={field.value || ''}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="New York" 
                              value={field.value || ''}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State/Province</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="NY" 
                              value={field.value || ''}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="10001" 
                              value={field.value || ''}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[200px]">
                            {COUNTRIES.map(country => (
                              <SelectItem key={country} value={country}>{country}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="images" className="space-y-6">
                {/* Logo Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Showroom Logo</h3>
                  
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="relative h-32 w-32 rounded-full overflow-hidden border bg-background flex-shrink-0">
                      {logoPreview ? (
                        <img 
                          src={logoPreview} 
                          alt="Showroom Logo" 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full bg-muted">
                          <Store className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Label className="text-sm text-muted-foreground">Upload a square logo for your showroom</Label>
                      <div className="flex gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="logo-upload"
                          onChange={handleLogoChange}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('logo-upload')?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choose Logo
                        </Button>
                        
                        {logoPreview && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setLogoFile(null);
                              setLogoPreview(null);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Cover Images Upload */}
                <div className="space-y-4 pt-6 border-t">
                  <h3 className="text-lg font-medium">Showroom Photos</h3>
                  
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload images of your showroom and facilities
                    </p>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleCoverChange}
                      className="hidden"
                      id="cover-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('cover-upload')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Images
                    </Button>
                  </div>
                  
                  {coverPreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      {coverPreviews.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Showroom image ${index + 1}`}
                            className="h-24 w-full object-cover rounded-md"
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeCoverImage(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <CardFooter className="border-t pt-6 px-0 pb-0 flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (!showroom && createMode) {
                      setCreateMode(false);
                    } else {
                      window.history.pushState(null, '', '/seller/dashboard');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }
                  }}
                >
                  Cancel
                </Button>
                
                <Button 
                  type="submit"
                  disabled={updateShowroomMutation.isPending}
                >
                  {updateShowroomMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {showroom ? (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Store className="mr-2 h-4 w-4" />
                      Create Showroom
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EditShowroomContent;