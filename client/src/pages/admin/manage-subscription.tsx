import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SubscriptionTier, User, Subscription } from "@shared/schema";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowLeft, Save, AlertCircle, Calendar, CheckCircle, Trophy } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

// Form schema for subscription
const subscriptionFormSchema = z.object({
  tier: z.enum([SubscriptionTier.FREE, SubscriptionTier.PREMIUM, SubscriptionTier.VIP], {
    required_error: "Please select a subscription tier",
  }),
  listingLimit: z.coerce.number().optional(),
  active: z.boolean().default(true),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type SubscriptionFormValues = z.infer<typeof subscriptionFormSchema>;

const ManageSubscription = () => {
  const params = useParams();
  const userId = params.userId || '';
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const numericUserId = parseInt(userId);

  // Fetch user details
  const { 
    data: user,
    isLoading: isLoadingUser,
    isError: isUserError,
  } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
    enabled: !isNaN(numericUserId)
  });

  // Fetch user's subscription
  const { 
    data: subscription,
    isLoading: isLoadingSubscription,
    isError: isSubscriptionError,
  } = useQuery<Subscription>({
    queryKey: [`/api/admin/subscriptions/${userId}`],
    enabled: !isNaN(numericUserId)
  });

  // Setup form
  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: {
      tier: SubscriptionTier.FREE,
      listingLimit: 3,
      active: true,
      startDate: new Date().toISOString().substring(0, 10),
      endDate: "",
    },
  });

  // Update form when subscription data is loaded
  useEffect(() => {
    if (subscription) {
      form.reset({
        tier: subscription.tier as SubscriptionTier,
        listingLimit: undefined, // This will be set based on tier
        active: subscription.active === null ? true : subscription.active,
        startDate: subscription.startDate ? new Date(subscription.startDate).toISOString().substring(0, 10) : undefined,
        endDate: subscription.endDate ? new Date(subscription.endDate).toISOString().substring(0, 10) : undefined,
      });
    }
  }, [subscription, form]);

  // Mutation to update subscription
  const updateSubscriptionMutation = useMutation({
    mutationFn: async (data: SubscriptionFormValues) => {
      return await apiRequest("PUT", `/api/admin/subscriptions/${userId}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Subscription updated",
        description: "The user's subscription has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/subscriptions/${userId}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update subscription: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SubscriptionFormValues) => {
    // Calculate default listing limit based on tier if not specified
    if (data.listingLimit === undefined) {
      data.listingLimit = data.tier === SubscriptionTier.FREE 
        ? 3 
        : 999999; // Virtually unlimited for PREMIUM and VIP
    }
    
    updateSubscriptionMutation.mutate(data);
  };

  // Handle form value changes
  const watchTier = form.watch("tier");
  
  useEffect(() => {
    // If tier is FREE, set default listing limit to 3
    if (watchTier === SubscriptionTier.FREE) {
      form.setValue("listingLimit", 3);
    } 
    // If tier is PREMIUM or VIP, set to null (unlimited)
    else {
      form.setValue("listingLimit", undefined);
    }
  }, [watchTier, form]);

  if (isLoadingUser || isLoadingSubscription) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow bg-gray-50 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-gray-500">Loading subscription details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isUserError || isSubscriptionError) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 py-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load user or subscription details. Please try again later.
              </AlertDescription>
            </Alert>
            <div className="mt-4">
              <Button variant="outline" onClick={() => navigate("/admin/users")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const tierBadge = (tier: string | SubscriptionTier) => {
    switch(tier) {
      case SubscriptionTier.FREE:
        return <Badge variant="outline">Free</Badge>;
      case SubscriptionTier.PREMIUM:
        return <Badge variant="secondary">Premium</Badge>;
      case SubscriptionTier.VIP:
        return <Badge variant="default" className="bg-amber-500">VIP</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Button variant="ghost" className="mr-4" asChild>
              <Link href="/admin/users">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Users
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Manage Subscription</h1>
          </div>
          
          {user && (
            <div className="mb-6">
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="flex justify-between w-full">
                      <span>{user.username}</span>
                      {subscription && tierBadge(subscription.tier)}
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {user.email} • {user.role} • 
                    {subscription?.active ? (
                      <span className="text-green-600 ml-1">Active</span>
                    ) : (
                      <span className="text-red-600 ml-1">Inactive</span>
                    )}
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Details</CardTitle>
                  <CardDescription>
                    Update the user's subscription settings
                  </CardDescription>
                </CardHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-6">
                      {/* Subscription Tier */}
                      <FormField
                        control={form.control}
                        name="tier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subscription Tier</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a subscription tier" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value={SubscriptionTier.FREE}>
                                  <div className="flex items-center">
                                    <span>Free</span>
                                    <Badge variant="outline" className="ml-2">Free</Badge>
                                  </div>
                                </SelectItem>
                                <SelectItem value={SubscriptionTier.PREMIUM}>
                                  <div className="flex items-center">
                                    <span>Premium</span>
                                    <Badge variant="secondary" className="ml-2">$19.99/mo</Badge>
                                  </div>
                                </SelectItem>
                                <SelectItem value={SubscriptionTier.VIP}>
                                  <div className="flex items-center">
                                    <span>VIP</span>
                                    <Badge className="ml-2 bg-amber-500">$49.99/mo</Badge>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              {watchTier === SubscriptionTier.FREE && "Basic tier with limited listings (3 max)"}
                              {watchTier === SubscriptionTier.PREMIUM && "Professional tier with unlimited listings and more features"}
                              {watchTier === SubscriptionTier.VIP && "Premium tier with VIP features and enhanced visibility"}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Listing Limit */}
                      <FormField
                        control={form.control}
                        name="listingLimit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Listing Limit</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                value={field.value || ""} 
                                onChange={(e) => {
                                  const value = e.target.value === "" ? undefined : parseInt(e.target.value);
                                  field.onChange(value);
                                }}
                                disabled={watchTier !== SubscriptionTier.FREE}
                              />
                            </FormControl>
                            <FormDescription>
                              {watchTier === SubscriptionTier.FREE 
                                ? "Number of car listings allowed (default: 3 for free tier)" 
                                : "Unlimited listings for paid tiers"}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Start Date */}
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <FormControl>
                              <div className="flex">
                                <Calendar className="h-4 w-4 mr-2 mt-3 text-gray-500" />
                                <Input type="date" {...field} value={field.value || ""} />
                              </div>
                            </FormControl>
                            <FormDescription>
                              When the subscription begins
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* End Date (optional) */}
                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date (Optional)</FormLabel>
                            <FormControl>
                              <div className="flex">
                                <Calendar className="h-4 w-4 mr-2 mt-3 text-gray-500" />
                                <Input type="date" {...field} value={field.value || ""} />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Leave blank for ongoing subscriptions
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Active Status */}
                      <FormField
                        control={form.control}
                        name="active"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4 mt-1"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Active Subscription</FormLabel>
                              <FormDescription>
                                Uncheck to suspend the subscription temporarily without deleting it
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                    
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" type="button" asChild>
                        <Link href="/admin/users">Cancel</Link>
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={updateSubscriptionMutation.isPending}
                      >
                        {updateSubscriptionMutation.isPending ? (
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
                    </CardFooter>
                  </form>
                </Form>
              </Card>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ManageSubscription;