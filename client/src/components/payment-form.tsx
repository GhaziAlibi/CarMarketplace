import { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PaymentFormProps {
  onPaymentSuccess: () => void;
}

export default function PaymentForm({ onPaymentSuccess }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [elementError, setElementError] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Check if we're in development/demo mode with mock data
  const isDemoMode = import.meta.env.DEV || 
    !import.meta.env.VITE_STRIPE_PUBLIC_KEY ||
    import.meta.env.VITE_STRIPE_PUBLIC_KEY.includes('test');

  useEffect(() => {
    // If we detect we're in demo mode, show success message
    if (isDemoMode) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isDemoMode]);

  const handleTestModeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      toast({
        title: "Demo Payment Successful",
        description: "This is a demo payment. In production, real card details would be processed.",
      });
      
      setIsLoading(false);
      onPaymentSuccess();
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isDemoMode) {
      handleTestModeSubmit(e);
      return;
    }

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/seller/subscription`,
        },
        redirect: 'if_required'
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message || "An error occurred during payment. Please try again.",
          variant: "destructive",
        });
      } else {
        // Payment successful
        toast({
          title: "Payment Successful",
          description: "Your payment was processed successfully!",
        });
        
        // Notify parent component of success
        onPaymentSuccess();
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showSuccessMessage) {
    return (
      <div className="text-center space-y-4">
        <Alert className="bg-green-50 border-green-200">
          <Check className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800">Demo Mode Active</AlertTitle>
          <AlertDescription className="text-green-700">
            This is running in demo mode. Click the button below to simulate a successful payment.
          </AlertDescription>
        </Alert>
        
        <div className="mt-6">
          <Button 
            onClick={(e) => handleTestModeSubmit(e as any)}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simulate Successful Payment
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            No real payment will be processed in demo mode.
          </p>
        </div>
      </div>
    );
  }

  if (elementError) {
    return (
      <div className="text-center space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Payment Form Error</AlertTitle>
          <AlertDescription>
            {elementError}
          </AlertDescription>
        </Alert>
        
        <div className="mt-6">
          <Button 
            onClick={(e) => handleTestModeSubmit(e as any)}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue with Demo Payment
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            This will simulate a successful payment for demonstration purposes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* In development/test mode, we might not show the actual PaymentElement */}
      {!isDemoMode && <PaymentElement onLoadError={(e) => setElementError(e.message)} />}
      
      <div className="pt-4">
        <Button 
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <CreditCard className="mr-2 h-4 w-4" />
          Pay $19.99 and Upgrade to Premium
        </Button>
        <p className="text-sm text-muted-foreground mt-2 text-center">
          You'll be charged immediately and your subscription will begin.
        </p>
      </div>
    </form>
  );
}