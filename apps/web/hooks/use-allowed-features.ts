import { useMemo } from "react";
import { getAllowedFeatures } from "@/actions/account/subscription";
import { useQuery } from "@tanstack/react-query";
import { Feature, GeneralFeature } from "@/types/features";

export type AllowedFeatures = Feature[];

export const useAllowedFeatures = () => {
  const { data, isLoading, isError } = useQuery<Feature[], Error>({
    queryKey: ["allowed-features"] as const,
    queryFn: getAllowedFeatures,
    staleTime: 1 * 60 * 1000,
  });

  const hasFeature = useMemo(() => {
    return (feature: Feature) => {
      if (!data) return false;
      return data.includes(feature);
    };
  }, [data]);

  return {
    allowedFeatures: data || [],
    isLoading,
    isError,
    hasFeature,
  };
};
