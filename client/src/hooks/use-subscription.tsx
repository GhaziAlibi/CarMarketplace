import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { SubscriptionTier } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export interface UserSubscription {
  id: number;
  tier: SubscriptionTier;
  status: string;
  listingLimit: number;
  startDate: string | Date;
  endDate: string | Date | null;
  userId: number;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

export interface SubscriptionFeatures {
  canUploadGalleryImages: boolean;
  maxGalleryImages: number;
  canAddWebsite: boolean;
  canSetOpeningHours: boolean;
  canSetSocialMedia: boolean;
  canSetFeaturedStatus: boolean;
  hasPriorityListings: boolean;
  listingLimit: number;
}

export function useSubscription() {
  const { user } = useAuth();
  
  // Use the existing subscription endpoint that's already used in the subscription page
  const { data: subscription, isLoading, error } = useQuery<UserSubscription | null>({
    queryKey: ['/api/subscriptions/my'],
    enabled: !!user,
    retry: 1,
  });

  // Default to FREE tier features if no subscription is found
  const defaultFeatures: SubscriptionFeatures = {
    canUploadGalleryImages: false,
    maxGalleryImages: 0,
    canAddWebsite: false,
    canSetOpeningHours: false,
    canSetSocialMedia: false, 
    canSetFeaturedStatus: false,
    hasPriorityListings: false,
    listingLimit: 3, // Free tier default
  };

  // If no subscription found or subscription is inactive, default to FREE tier features
  if (!subscription || (subscription.status !== 'active' && subscription.status !== 'Active')) {
    return { 
      subscription, 
      isLoading, 
      error, 
      features: defaultFeatures,
      tier: SubscriptionTier.FREE
    };
  }

  // Define features based on subscription tier
  let features: SubscriptionFeatures;

  switch (subscription.tier) {
    case SubscriptionTier.PREMIUM:
      features = {
        canUploadGalleryImages: true,
        maxGalleryImages: 10,
        canAddWebsite: true,
        canSetOpeningHours: true,
        canSetSocialMedia: true,
        canSetFeaturedStatus: false,
        hasPriorityListings: false,
        listingLimit: subscription.listingLimit || 10,
      };
      break;
    case SubscriptionTier.VIP:
      features = {
        canUploadGalleryImages: true,
        maxGalleryImages: 30,
        canAddWebsite: true,
        canSetOpeningHours: true,
        canSetSocialMedia: true,
        canSetFeaturedStatus: true,
        hasPriorityListings: true,
        listingLimit: subscription.listingLimit || 50,
      };
      break;
    case SubscriptionTier.FREE:
    default:
      features = {
        ...defaultFeatures,
        listingLimit: subscription.listingLimit || 3,
      };
      break;
  }

  return { 
    subscription, 
    isLoading, 
    error, 
    features,
    tier: subscription.tier
  };
}