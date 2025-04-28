import React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SubscriptionTier } from "@shared/schema";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Car,
  AlertTriangle,
  Infinity,
  Loader2,
  BadgeCheck,
  CheckCircle2
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import PaymentForm from "@/components/payment-form";

const SubscriptionContent: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showPaymentForm, setShowPaymentForm] = React.useState(false);
  const [currentSubscription, setCurrentSubscription] = React.useState<any>(null);
  
  // Get current subscription
  const {
    data: subscription,
    isLoading: isLoadingSubscription,
    refetch: refetchSubscription
  } = useQuery({
    queryKey: ["/api/subscriptions/current"],
    enabled: !!user,
    onSuccess: (data) => {
      setCurrentSubscription(data);
    }
  });
  
  // Car count check to determine if within limits
  const {
    data: carLimitData,
    isLoading: isCheckingLimit,
    refetch: refetchCarLimit
  } = useQuery({
    queryKey: ["/api/check-car-limit"],
    queryFn: async () => {
      const res = await apiRequest("POST", "/api/check-car-limit", {});
      return res.json();
    },
    enabled: !!user
  });
  
  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/subscriptions/cancel", {});
      return res.json();
    },
    onSuccess: () => {
      refetchSubscription();
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled. You will be downgraded to free tier at the end of your billing cycle.",
        variant: "default", 
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "There was an error cancelling your subscription.",
        variant: "destructive",
      });
    }
  });
  
  // Handle plan upgrade
  const handleUpgradeToPremium = () => {
    setShowPaymentForm(true);
  };
  
  // Handle successful payment
  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    refetchSubscription();
    refetchCarLimit();
    
    toast({
      title: "Subscription Activated",
      description: "Your premium subscription has been activated successfully!",
      variant: "default",
    });
  };
  
  // Calculate the subscription stats
  const getSubscriptionStats = () => {
    const isFreeTier = !subscription || subscription.tier === SubscriptionTier.FREE;
    const isPremiumTier = subscription && subscription.tier === SubscriptionTier.PREMIUM;
    const isActive = subscription && subscription.active;
    
    return {
      isFreeTier,
      isPremiumTier,
      isActive,
      carLimit: isFreeTier ? 3 : null,
      currentCars: carLimitData?.currentCount || 0,
      canAddMore: carLimitData?.canAddMore || false
    };
  };
  
  if (isLoadingSubscription || isCheckingLimit) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Loading your subscription details...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  const stats = getSubscriptionStats();
  
  // If payment form is shown
  if (showPaymentForm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upgrade to Premium</CardTitle>
          <CardDescription>Complete payment to activate your premium subscription</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Payment Simulation</AlertTitle>
            <AlertDescription>
              This is a demo payment form. No actual charges will be made.
            </AlertDescription>
          </Alert>
          
          <PaymentForm onPaymentSuccess={handlePaymentSuccess} />
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            className="mr-2" 
            onClick={() => setShowPaymentForm(false)}
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Subscription Management
        </CardTitle>
        <CardDescription>
          Manage your subscription and listing allowances
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Current Plan Info */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Current Plan</h3>
              <p className="text-sm text-muted-foreground">
                {stats.isFreeTier ? "Free tier" : "Premium tier"}
              </p>
            </div>
            <div className="flex items-center">
              {stats.isActive ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-5 w-5 mr-1" />
                  <span>Active</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <XCircle className="h-5 w-5 mr-1" />
                  <span>Inactive</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border p-4">
              <h4 className="text-sm font-medium mb-2">Listing Limit</h4>
              <div className="flex items-center">
                {stats.isFreeTier ? (
                  <span className="text-2xl font-bold">3</span>
                ) : (
                  <Infinity className="h-7 w-7 text-primary" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.isFreeTier ? "Limited to 3 car listings" : "Unlimited car listings"}
              </p>
            </div>
            
            <div className="rounded-lg border p-4">
              <h4 className="text-sm font-medium mb-2">Current Listings</h4>
              <span className="text-2xl font-bold">{stats.currentCars}</span>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.canAddMore ? "You can add more listings" : "Reached limit on free tier"}
              </p>
            </div>
            
            <div className="rounded-lg border p-4">
              <h4 className="text-sm font-medium mb-2">Remaining</h4>
              <span className="text-2xl font-bold">
                {stats.isFreeTier 
                  ? Math.max(0, stats.carLimit! - stats.currentCars) 
                  : "∞"}
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.isFreeTier ? "Available listing slots" : "Unlimited slots"}
              </p>
            </div>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        {/* Subscription Plans */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Available Plans</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free Tier */}
            <div className="relative rounded-lg border p-6">
              {stats.isFreeTier && stats.isActive && (
                <div className="absolute top-3 right-3 bg-primary text-xs text-primary-foreground px-2 py-1 rounded">
                  Current Plan
                </div>
              )}
              
              <h4 className="text-lg font-bold mb-1">Free Tier</h4>
              <p className="text-2xl font-bold mb-4">$0 <span className="text-sm font-normal text-muted-foreground">/month</span></p>
              
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Up to 3 car listings</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Basic showroom profile</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Message system access</span>
                </li>
                <li className="flex items-start">
                  <XCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Featured listings</span>
                </li>
                <li className="flex items-start">
                  <XCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Priority search ranking</span>
                </li>
              </ul>
              
              {stats.isFreeTier ? (
                <Button disabled className="w-full">
                  <BadgeCheck className="mr-2 h-4 w-4" />
                  Current Plan
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => cancelSubscriptionMutation.mutate()}
                  disabled={cancelSubscriptionMutation.isPending}
                >
                  {cancelSubscriptionMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Downgrade to Free
                </Button>
              )}
            </div>
            
            {/* Premium Tier */}
            <div className="relative rounded-lg border border-primary p-6 bg-primary/5">
              {stats.isPremiumTier && stats.isActive && (
                <div className="absolute top-3 right-3 bg-primary text-xs text-primary-foreground px-2 py-1 rounded">
                  Current Plan
                </div>
              )}
              
              <h4 className="text-lg font-bold mb-1">Premium Tier</h4>
              <p className="text-2xl font-bold mb-4">$19.99 <span className="text-sm font-normal text-muted-foreground">/month</span></p>
              
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span><strong>Unlimited</strong> car listings</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Enhanced showroom profile</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Message system access</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Featured listings</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Priority search ranking</span>
                </li>
              </ul>
              
              {stats.isPremiumTier ? (
                <Button disabled className="w-full bg-primary hover:bg-primary">
                  <BadgeCheck className="mr-2 h-4 w-4" />
                  Current Plan
                </Button>
              ) : (
                <Button 
                  className="w-full"
                  onClick={handleUpgradeToPremium}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Upgrade to Premium
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionContent;