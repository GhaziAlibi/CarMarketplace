import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { 
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, CreditCard, AlertTriangle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PaymentForm from "@/components/payment-form";

// Initialize Stripe
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY) 
  : null;

export default function SellerSubscription() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isCheckingCarLimit, setIsCheckingCarLimit] = useState(false);
  const [carStats, setCarStats] = useState<{
    canAddMore: boolean;
    limit: number;
    current: number;
    tier: string;
  } | null>(null);

  // Query for current subscription
  const { 
    data: subscription, 
    isLoading: isLoadingSubscription,
    error: subscriptionError,
    refetch: refetchSubscription
  } = useQuery({
    queryKey: ['/api/subscriptions/current'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/subscriptions/current');
      return res.json();
    },
    enabled: !!user,
  });

  // Query for car listing limits
  useEffect(() => {
    const checkCarLimit = async () => {
      setIsCheckingCarLimit(true);
      try {
        const res = await apiRequest('POST', '/api/check-car-limit');
        const data = await res.json();
        setCarStats(data);
      } catch (error) {
        console.error("Failed to check car limit:", error);
      } finally {
        setIsCheckingCarLimit(false);
      }
    };

    if (user && user.role === 'seller') {
      checkCarLimit();
    }
  }, [user, subscription]);

  // Mutation to upgrade subscription
  const upgradeMutation = useMutation({
    mutationFn: async () => {
      // Step 1: Get payment intent client secret
      const res = await apiRequest('POST', '/api/create-payment-intent');
      const data = await res.json();
      setClientSecret(data.clientSecret);
      return data;
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to initiate upgrade: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Mutation to confirm subscription after payment
  const confirmSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/subscriptions/upgrade');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions/current'] });
      refetchSubscription();
      
      toast({
        title: "Success!",
        description: "Your subscription has been upgraded to Premium",
        variant: "default"
      });
      
      // Reset client secret
      setClientSecret(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to confirm subscription: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Mutation to cancel subscription
  const cancelMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/subscriptions/cancel');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions/current'] });
      refetchSubscription();
      
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been downgraded to Free tier",
        variant: "default"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to cancel subscription: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Handle payment success
  const handlePaymentSuccess = () => {
    confirmSubscriptionMutation.mutate();
  };

  if (isLoadingSubscription) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading subscription details...</span>
      </div>
    );
  }

  if (subscriptionError) {
    return (
      <div className="flex flex-col justify-center items-center h-96">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold">Error Loading Subscription</h2>
        <p className="text-muted-foreground mt-2">
          We couldn't load your subscription details. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Subscription Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Current Subscription Card */}
        <Card>
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
            <CardDescription>Your active subscription plan details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-lg font-semibold">
                  {subscription?.tier === 'premium' ? 'Premium Plan' : 'Free Plan'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {subscription?.tier === 'premium' 
                    ? 'Unlimited car listings, priority placement' 
                    : 'Up to 3 car listings'}
                </p>
              </div>
              <Badge variant={subscription?.tier === 'premium' ? "default" : "outline"}>
                {subscription?.tier === 'premium' ? 'PREMIUM' : 'FREE'}
              </Badge>
            </div>
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Features:</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  Basic showroom profile
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  Message potential buyers
                </li>
                <li className="flex items-center">
                  {subscription?.tier === 'premium' 
                    ? <Check className="h-5 w-5 text-green-500 mr-2" /> 
                    : <X className="h-5 w-5 text-destructive mr-2" />}
                  Unlimited car listings
                </li>
                <li className="flex items-center">
                  {subscription?.tier === 'premium' 
                    ? <Check className="h-5 w-5 text-green-500 mr-2" /> 
                    : <X className="h-5 w-5 text-destructive mr-2" />}
                  Featured placement in search results
                </li>
                <li className="flex items-center">
                  {subscription?.tier === 'premium' 
                    ? <Check className="h-5 w-5 text-green-500 mr-2" /> 
                    : <X className="h-5 w-5 text-destructive mr-2" />}
                  Enhanced showroom profile
                </li>
              </ul>
            </div>
            {carStats && (
              <div className="mt-4 p-4 bg-secondary/30 rounded-md">
                <h3 className="font-medium mb-2">Car Listing Usage:</h3>
                <div className="flex justify-between items-center">
                  <span>Current Listings</span>
                  <span className="font-medium">{carStats.current} / {carStats.limit === Infinity ? "∞" : carStats.limit}</span>
                </div>
                {carStats.tier === 'free' && carStats.current >= carStats.limit && (
                  <div className="mt-2 text-sm text-destructive">
                    You've reached the maximum number of listings for the free tier.
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-2">
            {subscription?.tier === 'premium' ? (
              <Button 
                variant="destructive" 
                disabled={cancelMutation.isPending}
                onClick={() => cancelMutation.mutate()}
              >
                {cancelMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Downgrade to Free
              </Button>
            ) : (
              <Button 
                disabled={upgradeMutation.isPending}
                onClick={() => upgradeMutation.mutate()}
              >
                {upgradeMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <CreditCard className="mr-2 h-4 w-4" />
                Upgrade to Premium
              </Button>
            )}
          </CardFooter>
        </Card>
        
        {/* Pricing Card */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plans</CardTitle>
            <CardDescription>Choose the plan that fits your needs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className={`border rounded-md p-4 ${subscription?.tier === 'free' ? 'border-primary' : ''}`}>
                <h3 className="font-semibold text-lg">Free</h3>
                <p className="text-2xl font-bold my-2">$0<span className="text-sm font-normal">/month</span></p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Up to 3 car listings</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Basic showroom profile</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Standard support</span>
                  </li>
                </ul>
              </div>
              
              <div className={`border rounded-md p-4 ${subscription?.tier === 'premium' ? 'border-primary' : ''}`}>
                <h3 className="font-semibold text-lg">Premium</h3>
                <p className="text-2xl font-bold my-2">$19.99<span className="text-sm font-normal">/month</span></p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Unlimited car listings</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Featured placement in search</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Enhanced showroom profile</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Priority support</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Payment Processing Section */}
      {clientSecret && stripePromise && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Subscription</CardTitle>
              <CardDescription>Provide your payment details to upgrade to Premium</CardDescription>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm onPaymentSuccess={handlePaymentSuccess} />
              </Elements>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}