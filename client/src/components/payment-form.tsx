import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentFormProps {
  onPaymentSuccess: () => void;
}

export default function PaymentForm({ onPaymentSuccess }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <div className="pt-4">
        <Button 
          type="submit"
          className="w-full"
          disabled={!stripe || isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Pay $19.99 and Upgrade to Premium
        </Button>
        <p className="text-sm text-muted-foreground mt-2 text-center">
          You'll be charged immediately and your subscription will begin.
        </p>
      </div>
    </form>
  );
}