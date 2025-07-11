"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Progress } from "@workspace/ui/components/progress";
import { Separator } from "@workspace/ui/components/separator";
import { Button } from "@workspace/ui/components/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  Briefcase,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  Clock,
  Activity,
  BarChart3,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricsDashboardProps {
  stats: any;
}

const AnimatedCounter: React.FC<{ 
  value: number; 
  duration?: number; 
  className?: string; 
}> = ({ value, duration = 2000, className }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span className={className}>{count}</span>;
};

const MetricCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  color: string;
  gradient: string;
  target?: number;
}> = ({ title, value, icon, trend, trendLabel, color, gradient, target }) => {
  const trendIcon = trend ? (
    trend > 0 ? (
      <ArrowUpRight className="h-3 w-3 text-green-600" />
    ) : trend < 0 ? (
      <ArrowDownRight className="h-3 w-3 text-red-600" />
    ) : (
      <Minus className="h-3 w-3 text-muted-foreground" />
    )
  ) : null;

  const trendColor = trend ? (
    trend > 0 ? "text-green-600" : "text-red-600"
  ) : "text-muted-foreground";

  const progressValue = target ? Math.min((value / target) * 100, 100) : 0;

  return (
    <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className={cn("absolute inset-0 opacity-10", gradient)} />
      <CardContent className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-3 rounded-xl", color)}>
            {icon}
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold tabular-nums text-foreground">
              <AnimatedCounter value={value} />
            </div>
            {target && (
              <div className="text-xs text-muted-foreground">
                of {target} target
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground/90">{title}</h3>
          
          {target && (
            <div className="space-y-1">
              <Progress value={progressValue} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{progressValue.toFixed(0)}% complete</span>
                <span className={cn("font-medium", progressValue >= 80 ? "text-green-600" : "text-muted-foreground")}>
                  {progressValue >= 80 ? "On track" : "Behind target"}
                </span>
              </div>
            </div>
          )}
          
          {trend !== undefined && (
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs px-2 py-0.5 border-0 font-medium",
                  trend > 0 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                  trend < 0 ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                  "bg-muted text-muted-foreground"
                )}
              >
                <div className="flex items-center gap-1">
                  {trendIcon}
                  <span>{Math.abs(trend)}%</span>
                </div>
              </Badge>
              <span className="text-xs text-muted-foreground">{trendLabel}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const CircularProgress: React.FC<{
  value: number;
  max: number;
  size: number;
  strokeWidth: number;
  color: string;
  label: string;
}> = ({ value, max, size, strokeWidth, color, label }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = (value / max) * 100;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted-foreground/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold">
          <AnimatedCounter value={value} />
        </span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  );
};

const generateMiniChartData = () => {
  return Array.from({ length: 7 }, (_, i) => ({
    day: i + 1,
    value: Math.floor(Math.random() * 100) + 20,
  }));
};

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ stats }) => {
  const totalProjects = stats?.projects?.length || 0;
  const completedProjects = stats?.projects?.filter((p: any) => p.status === "completed")?.length || 0;
  const openIssues = stats?.issues?.filter((issue: any) => issue.status !== "DONE")?.length || 0;
  const totalMembers = stats?.members?.length || 0;
  const totalIdeas = stats?.ideas?.length || 0;

  const chartData = generateMiniChartData();

  return (
    <div className="space-y-6">
              Real-time insights and key performance indicators
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-background">
            <Sparkles className="w-3 h-3 mr-1" />
            Live
          </Badge>
          <Button variant="outline" size="sm">
            Export Report
          </Button>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Team Members"
          value={totalMembers}
          icon={<Users className="h-5 w-5 text-white" />}
          trend={totalMembers > 0 ? 12 : 0}
          trendLabel="from last month"
          color="bg-blue-500"
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          target={10}
        />
        
        <MetricCard
          title="Active Projects"
          value={totalProjects}
          icon={<Briefcase className="h-5 w-5 text-white" />}
          trend={totalProjects > 0 ? 8 : 0}
          trendLabel="from last month"
          color="bg-purple-500"
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          target={5}
        />
        
        <MetricCard
          title="Ideas Generated"
          value={totalIdeas}
          icon={<Lightbulb className="h-5 w-5 text-white" />}
          trend={totalIdeas > 0 ? -3 : 0}
          trendLabel="from last month"
          color="bg-yellow-500"
          gradient="bg-gradient-to-br from-yellow-500 to-yellow-600"
          target={20}
        />
        
        <MetricCard
          title="Open Issues"
          value={openIssues}
          icon={<AlertCircle className="h-5 w-5 text-white" />}
          trend={openIssues > 0 ? -25 : 0}
          trendLabel="from last month"
          color="bg-red-500"
          gradient="bg-gradient-to-br from-red-500 to-red-600"
        />
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Project Health Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center space-y-2">
                <CircularProgress
                  value={completedProjects}
                  max={totalProjects || 1}
                  size={120}
                  strokeWidth={8}
                  color="hsl(142, 76%, 36%)"
                  label="Completed"
                />
                <div className="text-center">
                  <div className="text-sm font-medium">Completion Rate</div>
                  <div className="text-xs text-muted-foreground">
                    {totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0}%
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center space-y-2">
                <CircularProgress
                  value={Math.max(0, totalProjects - completedProjects)}
                  max={totalProjects || 1}
                  size={120}
                  strokeWidth={8}
                  color="hsl(47, 96%, 53%)"
                  label="In Progress"
                />
                <div className="text-center">
                  <div className="text-sm font-medium">Active Projects</div>
                  <div className="text-xs text-muted-foreground">
                    {totalProjects - completedProjects} ongoing
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center space-y-2">
                <CircularProgress
                  value={openIssues}
                  max={Math.max(openIssues, 10)}
                  size={120}
                  strokeWidth={8}
                  color="hsl(0, 84%, 60%)"
                  label="Issues"
                />
                <div className="text-center">
                  <div className="text-sm font-medium">Open Issues</div>
                  <div className="text-xs text-muted-foreground">
                    {openIssues > 5 ? "High" : openIssues > 0 ? "Medium" : "Low"} priority
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Weekly Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer 
              config={{
                value: {
                  label: "Activity",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[200px]"
            >
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" hide />
                <YAxis hide />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  fill="url(#colorValue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">This week</span>
                <span className="font-medium">+23%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Average daily</span>
                <span className="font-medium">
                  {Math.round(chartData.reduce((acc, curr) => acc + curr.value, 0) / chartData.length)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Performance Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Key Performance Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Team Productivity</span>
                <span className="text-sm text-muted-foreground">85%</span>
              </div>
              <Progress value={85} className="h-2" />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span>+5% from last week</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Issue Resolution</span>
                <span className="text-sm text-muted-foreground">92%</span>
              </div>
              <Progress value={92} className="h-2" />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span>+12% from last week</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Project Delivery</span>
                <span className="text-sm text-muted-foreground">78%</span>
              </div>
              <Progress value={78} className="h-2" />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingDown className="h-3 w-3 text-red-600" />
                <span>-3% from last week</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};