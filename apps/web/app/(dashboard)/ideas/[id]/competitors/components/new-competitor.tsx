"use client";

import React, { useState, useTransition } from "react";
import { CompetitorOptionalDefaults } from "@workspace/backend";
import { createCompetitor } from "@/actions/idea/competitor";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@workspace/ui/components/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Badge } from "@workspace/ui/components/badge";
import { Building2, Globe, Users, Calendar, AlertTriangle, Plus } from "lucide-react";

const addManualCompetitor = async (
  competitorData: CompetitorOptionalDefaults
) => {
  return createCompetitor({ competitor: competitorData });
};

interface NewCompetitorSheetProps {
  ideaId: string;
  onCompetitorAdded: () => void;
}

export function NewCompetitorSheet({
  ideaId,
  onCompetitorAdded,
}: NewCompetitorSheetProps) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const competitorData: CompetitorOptionalDefaults = {
      ideaId,
      name: data.name as string,
      website: data.website as string,
      description: data.description as string | undefined,
      threatLevel: data.threatLevel as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
      foundedYear: data.foundedYear ? parseInt(data.foundedYear as string, 10) : null,
      employeeCount: data.employeeCount as string | null,
    };

    startTransition(async () => {
      try {
        await addManualCompetitor(competitorData);
        onCompetitorAdded();
        setIsOpen(false); // Close sheet on success
      } catch (error) {
        console.error(error);
        alert("Failed to add competitor.");
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Competitor
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <SheetHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <SheetTitle>Add New Competitor</SheetTitle>
            </div>
            <SheetDescription>
              Add a competitor to track and analyze their market position.
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Building2 className="h-4 w-4" />
                Basic Information
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Company Name *
                  </Label>
                  <Input 
                    id="name" 
                    name="name" 
                    required 
                    placeholder="Enter company name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Website *
                  </Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    required
                    placeholder="https://example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Brief description of the company..."
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            </div>

            {/* Threat Assessment */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <AlertTriangle className="h-4 w-4" />
                Threat Assessment
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="threatLevel">
                  Threat Level
                </Label>
                <Select name="threatLevel" defaultValue="MEDIUM">
                  <SelectTrigger>
                    <SelectValue placeholder="Select threat level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Company Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4" />
                Company Details
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="foundedYear" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Founded Year
                  </Label>
                  <Input
                    id="foundedYear"
                    name="foundedYear"
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                    placeholder="2020"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="employeeCount" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Employees
                  </Label>
                  <Input
                    id="employeeCount"
                    name="employeeCount"
                    type="number"
                    min="1"
                    placeholder="50"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <SheetFooter>
            <SheetClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </SheetClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Adding..." : "Add Competitor"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
