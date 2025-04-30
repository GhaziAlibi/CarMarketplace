import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Subscription, SubscriptionTier, User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Loader2,
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  tier: z.enum([SubscriptionTier.FREE, SubscriptionTier.PREMIUM, SubscriptionTier.VIP]),
  active: z.boolean().default(true),
  startDate: z.date().optional(),
  endDate: z.date().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const ManageSubscription: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  // Redirect if not admin
  if (user?.role !== "admin") {
    toast({
      title: "Access denied",
      description: "You don't have permission to access this page",
      variant: "destructive",
    });
    navigate("/");
    return null;
  }

  // Fetch user data
  const {
    data: userData,
    isLoading: isLoadingUser,
    isError: isUserError,
  } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
  });

  // Fetch user's subscription
  const {
    data: subscription,
    isLoading: isLoadingSubscription,
    isError: isSubscriptionError,
  } = useQuery<Subscription | null>({
    queryKey: [`/api/admin/users/${userId}/subscription`],
    onError: () => {
      // Don't show error toast, as user might not have a subscription yet
      console.log("No existing subscription found or error fetching");
    },
  });

  // Fetch subscription tiers info (for display purposes)
  const {
    data: tiers = [],
    isLoading: isLoadingTiers,
  } = useQuery({
    queryKey: ["/api/subscription-tiers"],
  });

  // Set up form with existing subscription data or defaults
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tier: subscription?.tier as SubscriptionTier || SubscriptionTier.FREE,
      active: subscription?.active ?? true,
      startDate: subscription?.startDate ? new Date(subscription.startDate) : new Date(),
      endDate: subscription?.endDate ? new Date(subscription.endDate) : null,
    },
    values: {
      tier: subscription?.tier as SubscriptionTier || SubscriptionTier.FREE,
      active: subscription?.active ?? true,
      startDate: subscription?.startDate ? new Date(subscription.startDate) : new Date(),
      endDate: subscription?.endDate ? new Date(subscription.endDate) : null,
    },
  });

  // Mutation to update subscription
  const updateSubscriptionMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      return await apiRequest(
        "PUT",
        `/api/admin/users/${userId}/subscription`,
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${userId}/subscription`] });
      toast({
        title: "Subscription updated",
        description: "The subscription has been updated successfully",
      });
      setSubmitting(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update subscription",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
      setSubmitting(false);
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    updateSubscriptionMutation.mutate(data);
  };

  // Format date for display
  const formatDate = (dateString: Date | string | null) => {
    if (!dateString) return "Not set";
    return format(new Date(dateString), "PPP");
  };

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isUserError || !userData) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load user data.</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" onClick={() => navigate("/admin/users")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users
          </Button>
        </div>
      </div>
    );
  }

  const getTierDetails = (tierId: string) => {
    return tiers.find((t: any) => t.id === tierId.toLowerCase());
  };

  const currentTier = subscription?.tier 
    ? getTierDetails(subscription.tier.toLowerCase())
    : null;

  return (
    <div className="container py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage Subscription</h1>
          <p className="text-muted-foreground">
            Manage subscription for {userData.name} ({userData.username})
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/admin/users")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Info Card */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Username</p>
                <p>{userData.username}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p>{userData.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p>{userData.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Role</p>
                <p className="capitalize">{userData.role}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="flex items-center">
                  {userData.isActive ? (
                    <>
                      <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                      <span>Active</span>
                    </>
                  ) : (
                    <>
                      <span className="h-2 w-2 bg-red-500 rounded-full mr-2"></span>
                      <span>Disabled</span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Subscription Info Card */}
          {subscription && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Current Subscription</CardTitle>
                <CardDescription>Existing subscription details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Plan</p>
                  <p className="font-medium">{currentTier?.name || subscription.tier}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="flex items-center">
                    {subscription.active ? (
                      <>
                        <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                        <span className="font-medium text-green-700">Active</span>
                      </>
                    ) : (
                      <>
                        <span className="h-2 w-2 bg-red-500 rounded-full mr-2"></span>
                        <span className="font-medium text-red-700">Inactive</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                  <p>{formatDate(subscription.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">End Date</p>
                  <p>{subscription.endDate ? formatDate(subscription.endDate) : "No end date"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <p>{formatDate(subscription.createdAt)}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Update Subscription Form */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {subscription ? "Update Subscription" : "Create Subscription"}
              </CardTitle>
              <CardDescription>
                {subscription
                  ? "Modify the subscription details for this user"
                  : "Create a new subscription for this user"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Subscription Tier */}
                  <FormField
                    control={form.control}
                    name="tier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subscription Tier</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={submitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a subscription tier" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={SubscriptionTier.FREE}>Free</SelectItem>
                            <SelectItem value={SubscriptionTier.PREMIUM}>Premium</SelectItem>
                            <SelectItem value={SubscriptionTier.VIP}>VIP</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {field.value === SubscriptionTier.FREE && "Limited to 3 listings"}
                          {field.value === SubscriptionTier.PREMIUM && "Unlimited listings with enhanced features"}
                          {field.value === SubscriptionTier.VIP && "All premium features plus featured placement"}
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
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={submitting}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Subscription Active</FormLabel>
                          <FormDescription>
                            Deactivating will disable subscription benefits
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Start Date */}
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                disabled={submitting}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          When the subscription begins
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* End Date */}
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date (Optional)</FormLabel>
                        <div className="flex items-center gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                  disabled={submitting || !field.value}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>No end date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value || undefined}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date("1900-01-01") ||
                                  (form.getValues("startDate") &&
                                    date <= form.getValues("startDate"))
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => field.onChange(null)}
                            disabled={submitting || !field.value}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const startDate = form.getValues("startDate") || new Date();
                              const endDate = new Date(startDate);
                              endDate.setFullYear(endDate.getFullYear() + 1);
                              field.onChange(endDate);
                            }}
                            disabled={submitting}
                          >
                            + 1 Year
                          </Button>
                        </div>
                        <FormDescription>
                          When the subscription expires (leave empty for indefinite)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/admin/users")}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {subscription ? "Update Subscription" : "Create Subscription"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ManageSubscription;