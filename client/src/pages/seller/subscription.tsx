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
import { 
  Loader2, 
  Check, 
  X, 
  CreditCard, 
  AlertTriangle, 
  Star, 
  Sparkles, 
  Zap, 
  CarFront,
  Search,
  MessageSquare,
  Medal
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PaymentForm from "@/components/payment-form";
import SellerLayout from "@/components/layout/seller-layout";

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
      <SellerLayout title="Subscription Management" description="Loading subscription details...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </SellerLayout>
    );
  }

  if (subscriptionError) {
    return (
      <SellerLayout title="Subscription Management" description="Error loading subscription details">
        <div className="flex flex-col justify-center items-center h-64">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold">Error Loading Subscription</h2>
          <p className="text-muted-foreground mt-2">
            We couldn't load your subscription details. Please try again later.
          </p>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout 
      title="Subscription Management" 
      description="Choose the right plan to grow your car dealership business on AutoMarket"
    >
      {/* Current Usage Section */}
      <div className="mb-10">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <span>Your Subscription</span>
                  {subscription?.tier === 'premium' && (
                    <Medal className="h-5 w-5 text-yellow-500" />
                  )}
                </h2>
                <p className="text-lg font-medium text-primary">
                  {subscription?.tier === 'premium' ? 'Premium Plan' : 'Free Plan'}
                </p>
                <div className="mt-1 text-muted-foreground text-sm">
                  Subscription started on {subscription?.start_date ? new Date(subscription.start_date).toLocaleDateString() : 'N/A'}
                </div>
              </div>
              
              <Badge 
                variant={subscription?.tier === 'premium' ? "default" : "outline"}
                className={`px-4 py-1.5 text-base ${subscription?.tier === 'premium' ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white' : ''}`}
              >
                {subscription?.tier === 'premium' ? 'PREMIUM' : 'FREE'}
              </Badge>
            </div>
            
            {carStats && (
              <div className="bg-background rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Car Listing Usage</h3>
                  <span className="font-medium">
                    {carStats.current} / {carStats.limit === Infinity || carStats.limit > 999 ? "∞" : carStats.limit}
                  </span>
                </div>
                
                <Progress 
                  value={carStats.limit === Infinity || carStats.limit > 999 
                    ? 10 // Just show a small bit for unlimited
                    : (carStats.current / carStats.limit) * 100} 
                  className="h-2" 
                />
                
                {carStats.tier === 'free' && carStats.current >= carStats.limit && (
                  <div className="mt-2 text-sm text-destructive flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    You've reached the maximum number of listings for the free tier.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Plan Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Free Plan */}
        <Card className={`overflow-hidden ${subscription?.tier === 'free' ? 'border-primary border-2' : 'border'}`}>
          {subscription?.tier === 'free' && (
            <div className="bg-primary text-primary-foreground text-center py-1.5 text-sm font-medium">
              Current Plan
            </div>
          )}
          <CardHeader className={subscription?.tier === 'free' ? '' : 'pt-10'}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Free Plan</CardTitle>
                <CardDescription>Basic features for small sellers</CardDescription>
              </div>
              <CarFront className="h-10 w-10 text-muted-foreground/70" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <span className="text-3xl font-bold">$0</span>
              <span className="text-muted-foreground ml-1">/month</span>
            </div>
            
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="bg-primary/10 p-1 rounded mr-3 mt-0.5">
                  <CarFront className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <span className="font-medium">3 car listings</span>
                  <p className="text-sm text-muted-foreground">Limited inventory display</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-primary/10 p-1 rounded mr-3 mt-0.5">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <span className="font-medium">Basic messaging</span>
                  <p className="text-sm text-muted-foreground">Connect with potential buyers</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-muted p-1 rounded mr-3 mt-0.5">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Standard listing visibility</span>
                  <p className="text-sm text-muted-foreground">Regular placement in search results</p>
                </div>
              </li>
            </ul>
          </CardContent>
          <CardFooter className="flex flex-col">
            {subscription?.tier === 'premium' ? (
              <Button 
                variant="outline" 
                className="w-full"
                disabled={cancelMutation.isPending}
                onClick={() => cancelMutation.mutate()}
              >
                {cancelMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Downgrade to Free
              </Button>
            ) : (
              <p className="text-sm text-center text-muted-foreground mb-4">
                You are currently on the Free plan
              </p>
            )}
          </CardFooter>
        </Card>
        
        {/* Premium Plan */}
        <Card className={`overflow-hidden ${subscription?.tier === 'premium' ? 'border-primary border-2' : 'border'}`}>
          {subscription?.tier === 'premium' && (
            <div className="bg-primary text-primary-foreground text-center py-1.5 text-sm font-medium">
              Current Plan
            </div>
          )}
          <CardHeader className={`${subscription?.tier === 'premium' ? '' : 'pt-10'} bg-gradient-to-r from-primary/10 to-secondary/10`}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Premium Plan</CardTitle>
                <CardDescription>Advanced features for serious sellers</CardDescription>
              </div>
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <span className="text-3xl font-bold">$19.99</span>
              <span className="text-muted-foreground ml-1">/month</span>
            </div>
            
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="bg-primary/20 p-1 rounded mr-3 mt-0.5">
                  <CarFront className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <span className="font-medium">Unlimited car listings</span>
                  <p className="text-sm text-muted-foreground">Showcase your entire inventory</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-primary/20 p-1 rounded mr-3 mt-0.5">
                  <Star className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <span className="font-medium">Featured placement</span>
                  <p className="text-sm text-muted-foreground">Priority in search results</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-primary/20 p-1 rounded mr-3 mt-0.5">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <span className="font-medium">Enhanced showroom profile</span>
                  <p className="text-sm text-muted-foreground">Attract more potential buyers</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-primary/20 p-1 rounded mr-3 mt-0.5">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <span className="font-medium">Priority support</span>
                  <p className="text-sm text-muted-foreground">Faster response time</p>
                </div>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {subscription?.tier === 'premium' ? (
              <p className="text-sm text-center w-full text-primary-foreground bg-primary/80 py-2 rounded-md">
                You are enjoying all Premium features
              </p>
            ) : (
              <Button 
                className="w-full bg-gradient-to-r from-primary to-primary/80"
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
      </div>
      
      {/* Payment Processing Section */}
      {clientSecret && stripePromise && (
        <div className="mt-8 max-w-2xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Complete Your Subscription
              </CardTitle>
              <CardDescription>
                Provide your payment details to upgrade to Premium
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm onPaymentSuccess={handlePaymentSuccess} />
              </Elements>
            </CardContent>
          </Card>
        </div>
      )}
    </SellerLayout>
  );
}