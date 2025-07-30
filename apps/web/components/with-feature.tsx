"use client";
import { FC, PropsWithChildren } from "react";
import { useAllowedFeatures } from "@/hooks/use-allowed-features";
import { FeatureAccessDenied } from "@/components/feature-access-denied";
import { GeneralFeature } from "@/types/features";

interface WithFeatureProps {
  feature: GeneralFeature;
  requireFullPage?: boolean;
  message?: string;
}

export const WithFeature: FC<PropsWithChildren<WithFeatureProps>> = ({
  feature,
  requireFullPage = false,
  message,
  children,
}) => {
  const { hasFeature, isLoading } = useAllowedFeatures();

  if (isLoading) {
    return null; // or a loading state
  }

  if (!hasFeature(feature)) {
    return (
      <FeatureAccessDenied
        feature={feature}
        message={message}
        requireFullPage={requireFullPage}
      />
    );
  }

  return <>{children}</>;
};
