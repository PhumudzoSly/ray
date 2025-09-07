import { useQuery } from "@tanstack/react-query";
import {
  getIdeaValidation,
  getMarketValidation,
  getBusinessValidation,
  getRiskAnalysis,
  getProductMarketFitAnalysis,
  getCustomerJourney,
  getAudienceSegmentation,
  getMarketTrends,
  getCustomerNeeds,
  getPricingStrategy,
} from "@/actions/idea/validation";

// Query keys for validation data
export const validationKeys = {
  all: ["validation"] as const,
  idea: (ideaId: string) => [...validationKeys.all, ideaId] as const,
  overview: (ideaId: string) =>
    [...validationKeys.idea(ideaId), "overview"] as const,
  market: (ideaId: string) =>
    [...validationKeys.idea(ideaId), "market"] as const,
  business: (ideaId: string) =>
    [...validationKeys.idea(ideaId), "business"] as const,
  risk: (ideaId: string) => [...validationKeys.idea(ideaId), "risk"] as const,
  pmf: (ideaId: string) => [...validationKeys.idea(ideaId), "pmf"] as const,
  journey: (ideaId: string) =>
    [...validationKeys.idea(ideaId), "journey"] as const,
  audience: (ideaId: string) =>
    [...validationKeys.idea(ideaId), "audience"] as const,
  trends: (ideaId: string) =>
    [...validationKeys.idea(ideaId), "trends"] as const,
  needs: (ideaId: string) => [...validationKeys.idea(ideaId), "needs"] as const,
  pricing: (ideaId: string) =>
    [...validationKeys.idea(ideaId), "pricing"] as const,
};

// Custom hooks for each validation module
export const useValidationOverview = (ideaId: string) => {
  return useQuery({
    queryKey: validationKeys.overview(ideaId),
    queryFn: () => getIdeaValidation(ideaId),
    enabled: !!ideaId,
  });
};

export const useMarketValidation = (ideaId: string) => {
  return useQuery({
    queryKey: validationKeys.market(ideaId),
    queryFn: () => getMarketValidation(ideaId),
    enabled: !!ideaId,
  });
};

export const useBusinessValidation = (ideaId: string) => {
  return useQuery({
    queryKey: validationKeys.business(ideaId),
    queryFn: () => getBusinessValidation(ideaId),
    enabled: !!ideaId,
  });
};

export const useRiskAnalysis = (ideaId: string) => {
  return useQuery({
    queryKey: validationKeys.risk(ideaId),
    queryFn: () => getRiskAnalysis(ideaId),
    enabled: !!ideaId,
  });
};

export const useProductMarketFit = (ideaId: string) => {
  return useQuery({
    queryKey: validationKeys.pmf(ideaId),
    queryFn: () => getProductMarketFitAnalysis(ideaId),
    enabled: !!ideaId,
  });
};

export const useCustomerJourney = (ideaId: string) => {
  return useQuery({
    queryKey: validationKeys.journey(ideaId),
    queryFn: () => getCustomerJourney(ideaId),
    enabled: !!ideaId,
  });
};

export const useAudienceSegmentation = (ideaId: string) => {
  return useQuery({
    queryKey: validationKeys.audience(ideaId),
    queryFn: () => getAudienceSegmentation(ideaId),
    enabled: !!ideaId,
  });
};

export const useMarketTrends = (ideaId: string) => {
  return useQuery({
    queryKey: validationKeys.trends(ideaId),
    queryFn: () => getMarketTrends(ideaId),
    enabled: !!ideaId,
  });
};

export const useCustomerNeeds = (ideaId: string) => {
  return useQuery({
    queryKey: validationKeys.needs(ideaId),
    queryFn: () => getCustomerNeeds(ideaId),
    enabled: !!ideaId,
  });
};

export const usePricingStrategy = (ideaId: string) => {
  return useQuery({
    queryKey: validationKeys.pricing(ideaId),
    queryFn: () => getPricingStrategy(ideaId),
    enabled: !!ideaId,
  });
};