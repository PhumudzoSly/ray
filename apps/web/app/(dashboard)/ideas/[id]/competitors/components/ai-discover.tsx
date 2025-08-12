"use client";
import { Button } from "@workspace/ui/components/button";
import React from "react";
import { FaMagic } from "react-icons/fa";

const AIDiscovery = ({ ideaId }: { ideaId: string }) => {
  return (
    <div>
      <Button variant="fancy">
        <FaMagic />
        AI Search
      </Button>
    </div>
  );
};

export default AIDiscovery;
