"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useState } from "react";
import type { z } from "zod";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import {
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
  Save,
  X,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { Checkbox } from "@workspace/ui/components/checkbox";

// Industries data with modern icons
const INDUSTRIES = [
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

// Form sections for tabbed navigation
const FORM_SECTIONS = [
  {
    id: "basics",
    title: "Basic Info",
    icon: <Rocket className="h-4 w-4" />,
    description: "Core product identity",
  },
  {
    id: "problem-solution",
    title: "Problem & Solution",
    icon: <PieChart className="h-4 w-4" />,
    description: "Problem definition and approach",
  },
  {
    id: "configuration",
    title: "Configuration",
    icon: <Building className="h-4 w-4" />,
    description: "Project settings",
  },
];

const UpdateIdea = ({
  id,
  idea,
  onOpenChange,
  onSuccess,
}: {
  id: string;
  idea: any;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}) => {
  const [activeSection, setActiveSection] = useState("basics");
  const [loading, setLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      ...idea,
    },
  });

  const onSubmit = async (values: any) => {
    try {
      setLoading(true);
      // TODO: Implement actual update logic
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      toast.success("Idea updated successfully");
      if (onSuccess) onSuccess();
      if (onOpenChange) onOpenChange(false);
    } catch (error) {
      toast.error("Error while updating idea");
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
              className="flex items-start space-x-3 rounded-lg border border-border/60 bg-card/30 p-4 transition-all duration-200 hover:border-border hover:bg-card/50 hover:shadow-sm cursor-pointer"
              onClick={handleClick}
            >
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mt-0.5 h-4 w-4 border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
              </FormControl>
              <div className="flex-1 space-y-1">
                <FormLabel className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {label}
                </FormLabel>
                <FormDescription className="text-xs text-muted-foreground leading-relaxed">
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

  const navigateToSection = (direction: "next" | "prev") => {
    const currentIndex = FORM_SECTIONS.findIndex((s) => s.id === activeSection);
    if (direction === "next" && currentIndex < FORM_SECTIONS.length - 1) {
      setActiveSection(FORM_SECTIONS[currentIndex + 1].id);
    } else if (direction === "prev" && currentIndex > 0) {
      setActiveSection(FORM_SECTIONS[currentIndex - 1].id);
    }
  };

  const isLastSection =
    activeSection === FORM_SECTIONS[FORM_SECTIONS.length - 1].id;
  const isFirstSection = activeSection === FORM_SECTIONS[0].id;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/60 bg-card/30 backdrop-blur-sm">
        <div className="container max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                <Lightbulb className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-foreground">
                  Edit Idea
                </h1>
                <p className="text-sm text-muted-foreground">
                  Update your idea details and configuration
                </p>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="flex items-center gap-2">
              {FORM_SECTIONS.map((section, index) => (
                <div
                  key={section.id}
                  className={`h-2 w-8 rounded-full transition-colors ${
                    section.id === activeSection
                      ? "bg-primary"
                      : FORM_SECTIONS.findIndex((s) => s.id === activeSection) >
                          index
                        ? "bg-primary/60"
                        : "bg-border"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-4xl mx-auto px-6 py-8">
        <Tabs
          value={activeSection}
          onValueChange={setActiveSection}
          className="w-full"
        >
          {/* Tab Navigation */}
          <div className="mb-8">
            <TabsList className="grid w-full grid-cols-3 bg-muted/30 p-1 h-auto">
              {FORM_SECTIONS.map((section) => (
                <TabsTrigger
                  key={section.id}
                  value={section.id}
                  className="flex flex-col items-center gap-2 py-3 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    {section.icon}
                    <span className="font-medium">{section.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {section.description}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information Tab */}
              <TabsContent value="basics" className="mt-0">
                <Card className="border-border/60 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg font-medium">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 border border-blue-200">
                        <Rocket className="h-4 w-4 text-blue-600" />
                      </div>
                      Basic Information
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Update your product's core identity and positioning
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium flex items-center gap-2">
                            <Rocket className="h-4 w-4 text-muted-foreground" />
                            Product Name
                          </FormLabel>
                          <FormDescription className="text-xs">
                            Choose a memorable and distinctive name for your
                            product
                          </FormDescription>
                          <FormControl>
                            <Input
                              placeholder="e.g., Acme Analytics, TaskFlow Pro"
                              {...field}
                              className="h-10 border-border/60 bg-background focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary"
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
                          <FormLabel className="text-sm font-medium flex items-center gap-2">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            Product Description
                          </FormLabel>
                          <FormDescription className="text-xs">
                            Provide a clear, concise overview of what your
                            product does
                          </FormDescription>
                          <FormControl>
                            <Textarea
                              placeholder="A comprehensive project management tool that helps teams collaborate more effectively..."
                              className="min-h-[100px] border-border/60 bg-background focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary resize-none"
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
                          <FormLabel className="text-sm font-medium flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            Industry Category
                          </FormLabel>
                          <FormDescription className="text-xs">
                            Select the primary industry or market your product
                            serves
                          </FormDescription>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-10 border-border/60 bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary">
                                <SelectValue placeholder="Choose an industry category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="border-border/60">
                              {INDUSTRIES.map((industry) => (
                                <SelectItem
                                  key={industry.name}
                                  value={industry.name}
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`flex h-6 w-6 items-center justify-center rounded border ${industry.color}`}
                                    >
                                      {industry.icon}
                                    </div>
                                    <span className="font-medium">
                                      {industry.name}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Problem & Solution Tab */}
              <TabsContent value="problem-solution" className="mt-0">
                <Card className="border-border/60 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg font-medium">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 border border-amber-200">
                        <PieChart className="h-4 w-4 text-amber-600" />
                      </div>
                      Problem & Solution
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Define the problem you're solving and how your product
                      addresses it
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="problemSolved"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium flex items-center gap-2">
                            <PieChart className="h-4 w-4 text-muted-foreground" />
                            Problem Statement
                          </FormLabel>
                          <FormDescription className="text-xs">
                            Describe the specific problem or pain point your
                            product addresses
                          </FormDescription>
                          <FormControl>
                            <Textarea
                              placeholder="Teams struggle with scattered communication, missed deadlines, and lack of visibility..."
                              className="min-h-[120px] border-border/60 bg-background focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary resize-none"
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
                          <FormLabel className="text-sm font-medium flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-muted-foreground" />
                            Solution Approach
                          </FormLabel>
                          <FormDescription className="text-xs">
                            Explain how your product solves the identified
                            problem
                          </FormDescription>
                          <FormControl>
                            <Textarea
                              placeholder="Our platform provides a unified workspace that centralizes communication and automates tracking..."
                              className="min-h-[120px] border-border/60 bg-background focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Configuration Tab */}
              <TabsContent value="configuration" className="mt-0">
                <Card className="border-border/60 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg font-medium">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 border border-purple-200">
                        <Building className="h-4 w-4 text-purple-600" />
                      </div>
                      Project Configuration
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Configure project type and development approach
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CustomFormField
                      name="internal"
                      label="Internal Project"
                      description="This is an internal project or being validated for a client"
                      icon={BriefcaseIcon}
                    />
                    <CustomFormField
                      name="openSource"
                      label="Open Source"
                      description="This project will be developed as open source software"
                      icon={CodeIcon}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Navigation and Submit */}
              <div className="flex items-center justify-between pt-6 border-t border-border/60">
                <div className="flex items-center gap-3">
                  {!isFirstSection && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigateToSection("prev")}
                      className="border-border/60 hover:bg-muted/50"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      onOpenChange ? onOpenChange(false) : history.back()
                    }
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  {!isLastSection ? (
                    <Button
                      type="button"
                      onClick={() => navigateToSection("next")}
                      className="min-w-[120px] h-10 font-medium"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      loading={loading}
                      disabled={loading}
                      className="min-w-[140px] h-10 font-medium"
                    >
                      {loading ? (
                        "Saving..."
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Update Idea
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </Tabs>
      </div>
    </div>
  );
};

export default UpdateIdea;
