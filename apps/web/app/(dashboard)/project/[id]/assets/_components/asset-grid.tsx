"use client";
import React from "react";
import { AssetCard } from "./asset-card";

interface AssetGridProps {
  assets: any[];
  onDelete: (assetId: string) => void;
  onUpdate?: (assetId: string) => void;
}

export function AssetGrid({ assets, onDelete, onUpdate }: AssetGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {assets.map((asset) => (
        <AssetCard
          key={asset._id}
          asset={asset}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}
