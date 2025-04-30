import React from "react";
import { useQuery } from "@tanstack/react-query";
import { SubscriptionTier, User, Subscription } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, Calendar, Check, Package } from "lucide-react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SubscriptionContent: React.FC = () => {
  const { user } = useAuth();
  
  // Fetch current user's subscription
  const { 
    data: subscription,
    isLoading: isLoadingSubscription,
    isError: isSubscriptionError
  } = useQuery<Subscription>({
    queryKey: ["/api/subscriptions/my"],
  });
  
  // Fetch subscription tiers info
  const {
    data: tiers = [],
    isLoading: isLoadingTiers,
    isError: isErrorTiers
  } = useQuery({
    queryKey: ["/api/subscription-tiers"],
  });

  // Format date
  const formatDate = (dateString: Date | string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  if (isLoadingSubscription || isLoadingTiers) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-gray-500">Loading subscription data...</p>
        </div>
      </div>
    );
  }

  if (isSubscriptionError || isErrorTiers) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load subscription data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  // Find tier details for current subscription
  const currentTier = tiers.find((tier: any) => 
    tier.id === subscription?.tier.toLowerCase()
  );

  // Get next tier
  const getNextTier = () => {
    if (subscription?.tier === SubscriptionTier.FREE) {
      return tiers.find((tier: any) => tier.id === "premium");
    } else if (subscription?.tier === SubscriptionTier.PREMIUM) {
      return tiers.find((tier: any) => tier.id === "vip");
    }
    return null;
  };

  const nextTier = getNextTier();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Subscription</h1>
      
      {/* Current Subscription */}
      {subscription && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Current Subscription Plan</CardTitle>
                <CardDescription>Your active subscription details</CardDescription>
              </div>
              <div>
                {subscription.tier === SubscriptionTier.FREE && (
                  <Badge variant="outline">Free</Badge>
                )}
                {subscription.tier === SubscriptionTier.PREMIUM && (
                  <Badge variant="secondary">Premium</Badge>
                )}
                {subscription.tier === SubscriptionTier.VIP && (
                  <Badge variant="default" className="bg-amber-500">VIP</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="flex items-center">
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
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Start Date</p>
                <p className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  {formatDate(subscription.startDate)}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">End Date</p>
                <p className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  {subscription.endDate ? formatDate(subscription.endDate) : "Ongoing"}
                </p>
              </div>
              {currentTier && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Listing Limit</p>
                  <p className="font-medium">
                    {currentTier.listingLimit ? `${currentTier.listingLimit} listings` : "Unlimited listings"}
                  </p>
                </div>
              )}
            </div>

            {/* Current Plan Features */}
            {currentTier && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Included Features</h3>
                <ul className="space-y-2">
                  {currentTier.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Admin-only notice */}
            <Alert className="mt-6">
              <Package className="h-4 w-4" />
              <AlertTitle>Need to change your subscription?</AlertTitle>
              <AlertDescription>
                Please contact an administrator to update or change your subscription plan.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
      
      {/* Available Plans Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>Compare subscription plans</CardDescription>
        </CardHeader>
        <CardContent>
          <Table className="border-collapse">
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Listings</TableHead>
                <TableHead>Features</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tiers.map((tier: any) => (
                <TableRow key={tier.id} className={subscription?.tier.toLowerCase() === tier.id ? "bg-primary/5" : ""}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      {tier.name}
                      {subscription?.tier.toLowerCase() === tier.id && (
                        <Badge variant="outline" className="ml-2">Current</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{tier.priceDisplay}/month</TableCell>
                  <TableCell>{tier.listingLimit ? `${tier.listingLimit} max` : "Unlimited"}</TableCell>
                  <TableCell>
                    <ul className="list-disc pl-4 space-y-1">
                      {tier.features.map((feature: string, index: number) => (
                        <li key={index} className="text-sm">{feature}</li>
                      ))}
                    </ul>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionContent;