import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Subscription, SubscriptionTier, User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  AlertCircle,
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

interface SubscriptionDialogProps {
  open: boolean;
  onClose: () => void;
  userId: number | null;
}

const SubscriptionDialog: React.FC<SubscriptionDialogProps> = ({
  open,
  onClose,
  userId,
}) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  // Reset form when dialog opens or closes
  useEffect(() => {
    if (!open) {
      setSubmitting(false);
    }
  }, [open]);

  // Fetch user data
  const {
    data: userData,
    isLoading: isLoadingUser,
    isError: isUserError,
  } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId && open,
  });
  
  // Log user data for debugging
  console.log("User data fetched:", userData, "userId:", userId, "isUserError:", isUserError);

  // Fetch user's subscription
  const {
    data: subscription,
    isLoading: isLoadingSubscription,
    error: subscriptionError,
  } = useQuery<Subscription | null>({
    queryKey: [`/api/admin/users/${userId}/subscription`],
    enabled: !!userId && open,
    retry: false,
  });
  
  // Handle subscription fetch error
  React.useEffect(() => {
    if (subscriptionError) {
      // Log the error but don't show toast, as user might not have a subscription yet
      console.log("Subscription fetch error:", subscriptionError);
    }
  }, [subscriptionError]);

  // Fetch subscription tiers info (for display purposes)
  const {
    data: tiers = [],
    isLoading: isLoadingTiers,
  } = useQuery<any[]>({
    queryKey: ["/api/subscription-tiers"],
    enabled: open,
  });

  // Set up form with existing subscription data or defaults
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tier: SubscriptionTier.FREE,
      active: true,
      startDate: new Date(),
      endDate: null,
    },
  });

  // Update form values when subscription data is loaded
  useEffect(() => {
    if (subscription) {
      form.reset({
        tier: subscription.tier as SubscriptionTier,
        active: subscription.active === null ? true : subscription.active,
        startDate: subscription.startDate ? new Date(subscription.startDate) : new Date(),
        endDate: subscription.endDate ? new Date(subscription.endDate) : null,
      });
    } else if (!isLoadingSubscription) {
      form.reset({
        tier: SubscriptionTier.FREE,
        active: true,
        startDate: new Date(),
        endDate: null,
      });
    }
  }, [subscription, isLoadingSubscription, form]);

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
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Subscription updated",
        description: "The subscription has been updated successfully",
      });
      setSubmitting(false);
      onClose();
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
    if (!userId) return;
    setSubmitting(true);
    updateSubscriptionMutation.mutate(data);
  };

  // Format date for display
  const formatDate = (dateString: Date | string | null) => {
    if (!dateString) return "Not set";
    return format(new Date(dateString), "PPP");
  };

  const getTierDetails = (tierId: string) => {
    return tiers.find((t: any) => t.id === tierId.toLowerCase());
  };

  const currentTier = subscription?.tier 
    ? getTierDetails(subscription.tier.toLowerCase())
    : null;

  const isLoading = isLoadingUser || isLoadingSubscription || isLoadingTiers;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Manage Subscription</span>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6 rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            {userData ? `Manage subscription for ${userData.name} (${userData.username})` : 'Loading user details...'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Info Card */}
            <div className="md:col-span-1">
              <Card>
                <CardContent className="space-y-4 pt-6">
                  {userData && (
                    <>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Username</p>
                        <p>{userData?.username || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Name</p>
                        <p>{userData?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                        <p>{userData?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Role</p>
                        <p className="capitalize">{userData?.role || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                        <div className="flex items-center">
                          {userData?.isActive ? (
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
                    </>
                  )}
                  {!userData && (
                    <div className="py-4 text-center">
                      <AlertCircle className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                      <p>Loading user data...</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Current Subscription Info Card */}
              {subscription && (
                <Card className="mt-4">
                  <CardContent className="space-y-4 pt-6">
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
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {subscription ? "Update Subscription" : "Create Subscription"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    {subscription
                      ? "Modify the subscription details for this user"
                      : "Create a new subscription for this user"}
                  </p>
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
                                      <span>No end date (indefinite)</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <div className="p-2 flex justify-between items-center border-b">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => field.onChange(null)}
                                  >
                                    Clear
                                  </Button>
                                </div>
                                <Calendar
                                  mode="single"
                                  selected={field.value || undefined}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date < new Date() || date < new Date("1900-01-01")
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormDescription>
                              When the subscription expires (leave empty for indefinite)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Submit Button */}
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={onClose}
                          disabled={submitting}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {subscription ? "Update Subscription" : "Create Subscription"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionDialog;