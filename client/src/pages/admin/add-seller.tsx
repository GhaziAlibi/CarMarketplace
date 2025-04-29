import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { UserRole, insertUserSchema } from "@shared/schema";
import { z } from "zod";
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, UserPlus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Extend user schema for seller creation
const createSellerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type CreateSellerFormValues = z.infer<typeof createSellerSchema>;

const AdminAddSeller: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [success, setSuccess] = React.useState(false);

  // Create form with validation
  const form = useForm<CreateSellerFormValues>({
    resolver: zodResolver(createSellerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      name: "",
      role: UserRole.SELLER,
    },
  });

  // Add seller mutation
  const addSellerMutation = useMutation({
    mutationFn: async (data: Omit<CreateSellerFormValues, "confirmPassword">) => {
      // Send request to create seller endpoint
      const response = await apiRequest("POST", "/api/admin/create-seller", {
        ...data,
        role: UserRole.SELLER,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "Seller account created successfully",
      });
      setSuccess(true);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create seller",
        description: error.message || "Please try again with different credentials",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: CreateSellerFormValues) => {
    // Remove confirmPassword before sending to API
    const { confirmPassword, ...sellerData } = data;
    addSellerMutation.mutate(sellerData);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-6">
            <Button variant="ghost" className="mr-4" asChild>
              <Link href="/admin/users">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Users
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Add New Seller</h1>
          </div>
          
          {success && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <UserPlus className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Seller created successfully</AlertTitle>
              <AlertDescription className="text-green-700">
                The seller account has been created and can now log in to manage their showroom.
              </AlertDescription>
            </Alert>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Create Seller Account</CardTitle>
              <CardDescription>
                Add a new seller to the system. They will be able to create a showroom and list cars.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
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
                            <Input type="email" placeholder="seller@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="seller_username" {...field} />
                          </FormControl>
                          <FormDescription>
                            Username will be used for login
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="hidden">
                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input type="hidden" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={addSellerMutation.isPending}
                      className="w-full md:w-auto"
                    >
                      {addSellerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Create Seller Account
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="border-t px-6 py-4 bg-gray-50 flex justify-between">
              <Button variant="outline" asChild>
                <Link href="/admin/users">Cancel</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminAddSeller;