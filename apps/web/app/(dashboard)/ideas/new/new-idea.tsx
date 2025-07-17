"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import {
  ArrowLeft,
  Rocket,
  Target,
  Lightbulb,
  Briefcase,
  PieChart,
  CheckCircle2,
  DollarSign,
  Users,
  Building,
  Sparkles,
  Zap,
  BarChart3,
  ShoppingCart,
  CodeIcon,
  BriefcaseIcon,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { useMutation } from "@tanstack/react-query";
import * as ideaActions from "@/actions/idea";
import { useSession } from "@/context/session-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Industries data with modern icons
export const INDUSTRIES = [
  {
    name: "SaaS",
    icon: <Rocket className="h-4 w-4" />,
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    name: "E-commerce",
    icon: <ShoppingCart className="h-4 w-4" />,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    name: "FinTech",
    icon: <DollarSign className="h-4 w-4" />,
    color: "bg-green-50 text-green-700 border-green-200",
  },
  {
    name: "HealthTech",
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: "bg-red-50 text-red-700 border-red-200",
  },
  {
    name: "EdTech",
    icon: <Lightbulb className="h-4 w-4" />,
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  {
    name: "AI/ML",
    icon: <Sparkles className="h-4 w-4" />,
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    name: "DevTools",
    icon: <Zap className="h-4 w-4" />,
    color: "bg-orange-50 text-orange-700 border-orange-200",
  },
  {
    name: "Marketing",
    icon: <BarChart3 className="h-4 w-4" />,
    color: "bg-pink-50 text-pink-700 border-pink-200",
  },
  {
    name: "Security",
    icon: <Building className="h-4 w-4" />,
    color: "bg-gray-50 text-gray-700 border-gray-200",
  },
  {
    name: "Other",
    icon: <Briefcase className="h-4 w-4" />,
    color: "bg-slate-50 text-slate-700 border-slate-200",
  },
];

const NewIdeaForm = () => {
  const router = useRouter();
  const createIdeaMutation = useMutation({
    mutationFn: async (data: any) => {
      return await ideaActions.createIdea(data);
    },
  });
  const [loading, setLoading] = useState(false);
  const { userId, org, token } = useSession();

  const form = useForm<any>({
    defaultValues: {
      ownerId: userId,
      organizationId: org,
      status: "INVALIDATED",
      internal: false,
      openSource: false,
    },
  });

  const onSubmit = async (values: any) => {
    try {
      setLoading(true);
      const idea = await createIdeaMutation.mutateAsync({
        ...values,
        status: "INVALIDATED",
      });
      router.push(`/ideas/${idea.id}`);
    } catch (error) {
      toast.error("Failed to create idea");
    } finally {
      setLoading(false);
    }
  };

  const CustomFormField = ({
    name,
    label,
    description,
    icon: Icon,
  }: {
    name: any;
    label: string;
    description: string;
    icon: any;
  }) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const handleClick = () => {
          field.onChange(!field.value);
        };

        return (
          <FormItem className="space-y-0">
            <div
              className="flex items-center space-x-3 rounded-lg border p-3 transition-colors hover:bg-muted/50 cursor-pointer"
              onClick={handleClick}
            >
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="flex-1">
                <FormLabel className="text-sm font-medium cursor-pointer flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {label}
                </FormLabel>
                <FormDescription className="text-xs text-muted-foreground">
                  {description}
                </FormDescription>
              </div>
            </div>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="container max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Lightbulb className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold">Create New Idea</h1>
            <p className="text-sm text-muted-foreground">
              Transform your vision into a structured plan
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Basic Information</h2>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Acme Analytics, TaskFlow Pro"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What does your product do?"
                        className="min-h-[80px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INDUSTRIES.map((industry) => (
                          <SelectItem key={industry.name} value={industry.name}>
                            <div className="flex items-center gap-2">
                              {industry.icon}
                              <span>{industry.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Problem & Solution */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Problem & Solution</h2>

              <FormField
                control={form.control}
                name="problemSolved"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Problem Statement</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What problem does this solve?"
                        className="min-h-[80px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="solutionOffered"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Solution</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="How does your product solve it?"
                        className="min-h-[80px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Configuration */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Configuration</h2>
              <div className="space-y-3">
                <CustomFormField
                  name="internal"
                  label="Internal Project"
                  description="Internal project or client validation"
                  icon={BriefcaseIcon}
                />
                <CustomFormField
                  name="openSource"
                  label="Open Source"
                  description="Will be developed as open source"
                  icon={CodeIcon}
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <Button
                type="submit"
                loading={loading}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  "Creating..."
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Idea
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default NewIdeaForm;
