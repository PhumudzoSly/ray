# Shadcn Charts Documentation

A comprehensive guide to using shadcn charts in your Next.js application with Recharts integration.

## Table of Contents

1. [Installation & Setup](#installation--setup)
2. [Basic Concepts](#basic-concepts)
3. [Chart Configuration](#chart-configuration)
4. [Chart Types](#chart-types)
5. [Customization](#customization)
6. [Best Practices](#best-practices)
7. [Examples](#examples)

## Installation & Setup

### 1. Install Dependencies

```bash
pnpm add recharts
pnpm add @radix-ui/react-slot
```

### 2. Add Chart Components

Create the chart components in your UI library:

```tsx
// components/ui/chart.tsx
"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { TooltipProps } from "recharts"

import { cn } from "@/lib/utils"

// Chart container component
const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    config?: ChartConfig
  }
>(({ className, config, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("h-[350px] w-full", className)}
    style={
      {
        "--chart-1": config?.[0]?.color,
        "--chart-2": config?.[1]?.color,
        "--chart-3": config?.[2]?.color,
        "--chart-4": config?.[3]?.color,
        "--chart-5": config?.[4]?.color,
      } as React.CSSProperties
    }
    {...props}
  />
))
ChartContainer.displayName = "ChartContainer"

// Chart tooltip component
const ChartTooltip = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-background p-2 shadow-sm",
      className
    )}
    {...props}
  />
))
ChartTooltip.displayName = "ChartTooltip"

// Chart tooltip content
const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    hideLabel?: boolean
  }
>(({ className, hideLabel, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("grid gap-2", className)}
    {...props}
  />
))
ChartTooltipContent.displayName = "ChartTooltipContent"

// Chart legend component
const ChartLegend = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-2", className)}
    {...props}
  />
))
ChartLegend.displayName = "ChartLegend"

// Chart legend content
const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-2", className)}
    {...props}
  />
))
ChartLegendContent.displayName = "ChartLegendContent"

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
}

// Types
export interface ChartConfig {
  [key: string]: {
    label: string
    color: string
  }
}
```

### 3. Add CSS Variables

Add these CSS variables to your global styles:

```css
/* globals.css */
:root {
  --chart-1: hsl(var(--chart-1));
  --chart-2: hsl(var(--chart-2));
  --chart-3: hsl(var(--chart-3));
  --chart-4: hsl(var(--chart-4));
  --chart-5: hsl(var(--chart-5));
}

.dark {
  --chart-1: 12 76% 61%;
  --chart-2: 173 58% 39%;
  --chart-3: 197 37% 24%;
  --chart-4: 43 74% 66%;
  --chart-5: 27 87% 67%;
}
```

## Basic Concepts

### 1. Chart Structure

Every shadcn chart follows this structure:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Chart Title</CardTitle>
    <CardDescription>Chart description</CardDescription>
  </CardHeader>
  <CardContent>
    <ChartContainer config={chartConfig}>
      <ChartComponent data={data}>
        {/* Chart configuration */}
      </ChartComponent>
    </ChartContainer>
  </CardContent>
  <CardFooter>
    {/* Additional insights */}
  </CardFooter>
</Card>
```

### 2. Data Format

Your data should be an array of objects with consistent keys:

```tsx
const data = [
  { month: "Jan", value1: 100, value2: 200 },
  { month: "Feb", value1: 150, value2: 250 },
  // ...
]
```

### 3. Chart Configuration

Define colors and labels for your data series:

```tsx
const chartConfig = {
  value1: {
    label: "Series 1",
    color: "var(--chart-1)",
  },
  value2: {
    label: "Series 2", 
    color: "var(--chart-2)",
  },
} satisfies ChartConfig
```

## Chart Configuration

### ChartConfig Interface

```tsx
interface ChartConfig {
  [key: string]: {
    label: string    // Display name for the series
    color: string    // CSS color value
  }
}
```

### Color System

Use CSS variables for consistent theming:

```tsx
// Light theme colors
--chart-1: #3b82f6  // Blue
--chart-2: #10b981  // Green  
--chart-3: #f59e0b  // Yellow
--chart-4: #ef4444  // Red
--chart-5: #8b5cf6  // Purple

// Dark theme colors
--chart-1: #60a5fa  // Light blue
--chart-2: #34d399  // Light green
--chart-3: #fbbf24  // Light yellow
--chart-4: #f87171  // Light red
--chart-5: #a78bfa  // Light purple
```

## Chart Types

### 1. Bar Chart (Stacked)

```tsx
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

export function StackedBarChart() {
  return (
    <ChartContainer config={chartConfig}>
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis 
          dataKey="month" 
          tickLine={false}
          axisLine={false}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar 
          dataKey="value1" 
          stackId="a"
          fill="var(--color-value1)"
          radius={[0, 0, 4, 4]}
        />
        <Bar 
          dataKey="value2" 
          stackId="a"
          fill="var(--color-value2)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  )
}
```

### 2. Line Chart

```tsx
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"

export function LineChartExample() {
  return (
    <ChartContainer config={chartConfig}>
      <LineChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis 
          dataKey="month" 
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}k`}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line 
          dataKey="value1"
          stroke="var(--color-value1)"
          strokeWidth={2}
          dot={false}
        />
        <Line 
          dataKey="value2"
          stroke="var(--color-value2)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  )
}
```

### 3. Area Chart

```tsx
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

export function AreaChartExample() {
  return (
    <ChartContainer config={chartConfig}>
      <AreaChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis 
          dataKey="month" 
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          tickLine={false}
          axisLine={false}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Area 
          dataKey="value1"
          fill="var(--color-value1)"
          stroke="var(--color-value1)"
          fillOpacity={0.1}
        />
        <Area 
          dataKey="value2"
          fill="var(--color-value2)"
          stroke="var(--color-value2)"
          fillOpacity={0.1}
        />
      </AreaChart>
    </ChartContainer>
  )
}
```

### 4. Pie Chart

```tsx
import { Pie, PieChart, Cell } from "recharts"

export function PieChartExample() {
  return (
    <ChartContainer config={chartConfig}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`}
              fill={chartConfig[entry.name]?.color}
            />
          ))}
        </Pie>
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
      </PieChart>
    </ChartContainer>
  )
}
```

## Customization

### 1. Custom Tooltips

```tsx
const CustomTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
  if (active && payload && payload.length) {
    return (
      <ChartTooltip>
        <div className="grid gap-2">
          <p className="text-sm font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm">
                {entry.name}: {entry.value}
              </span>
            </div>
          ))}
        </div>
      </ChartTooltip>
    )
  }
  return null
}

// Usage
<ChartTooltip content={<CustomTooltip />} />
```

### 2. Custom Legends

```tsx
const CustomLegend = ({ payload }: any) => {
  return (
    <ChartLegend>
      {payload?.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm">{entry.value}</span>
        </div>
      ))}
    </ChartLegend>
  )
}

// Usage
<ChartLegend content={<CustomLegend />} />
```

### 3. Responsive Charts

```tsx
import { ResponsiveContainer } from "recharts"

export function ResponsiveChart() {
  return (
    <ChartContainer config={chartConfig}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          {/* Chart configuration */}
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
```

### 4. Custom Styling

```tsx
// Custom chart container
<ChartContainer 
  config={chartConfig}
  className="h-[400px] bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900"
>

// Custom grid styling
<CartesianGrid 
  vertical={false}
  strokeDasharray="3 3"
  stroke="hsl(var(--muted))"
  opacity={0.3}
/>

// Custom axis styling
<XAxis
  dataKey="month"
  tickLine={false}
  axisLine={false}
  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
/>
```

## Best Practices

### 1. Data Preparation

```tsx
// ✅ Good: Consistent data structure
const data = [
  { month: "Jan", revenue: 1000, profit: 300 },
  { month: "Feb", revenue: 1200, profit: 400 },
]

// ❌ Bad: Inconsistent keys
const data = [
  { month: "Jan", revenue: 1000, profit: 300 },
  { month: "Feb", revenue: 1200, earnings: 400 }, // Different key name
]
```

### 2. Configuration Management

```tsx
// ✅ Good: Centralized configuration
const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
  profit: {
    label: "Profit", 
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

// ❌ Bad: Inline colors
<Bar dataKey="revenue" fill="#3b82f6" />
<Bar dataKey="profit" fill="#10b981" />
```

### 3. Accessibility

```tsx
// ✅ Good: Include accessibility layer
<BarChart accessibilityLayer data={data}>

// ✅ Good: Meaningful labels
const chartConfig = {
  revenue: {
    label: "Monthly Revenue ($)",
    color: "var(--chart-1)",
  },
}
```

### 4. Performance

```tsx
// ✅ Good: Memoize data transformations
const processedData = useMemo(() => {
  return rawData.map(item => ({
    ...item,
    percentage: (item.value / total) * 100
  }))
}, [rawData, total])

// ✅ Good: Use ResponsiveContainer for responsive charts
<ResponsiveContainer width="100%" height="100%">
  <BarChart data={data}>
    {/* Chart configuration */}
  </BarChart>
</ResponsiveContainer>
```

### 5. Error Handling

```tsx
export function ChartWithErrorHandling() {
  const [data, setData] = useState([])
  const [error, setError] = useState(null)

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[350px]">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Failed to load chart data</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data.length) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[350px]">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="h-8 w-8 mx-auto mb-2" />
            <p>No data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={data}>
            {/* Chart configuration */}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
```

## Examples

### Complete Example: Analytics Dashboard

```tsx
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { TrendingUp, Users, DollarSign } from "lucide-react"

const data = [
  { month: "Jan", users: 1200, revenue: 45000 },
  { month: "Feb", users: 1400, revenue: 52000 },
  { month: "Mar", users: 1600, revenue: 58000 },
  { month: "Apr", users: 1800, revenue: 65000 },
  { month: "May", users: 2000, revenue: 72000 },
  { month: "Jun", users: 2200, revenue: 78000 },
]

const chartConfig = {
  users: {
    label: "Active Users",
    color: "var(--chart-1)",
  },
  revenue: {
    label: "Revenue ($)",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,200</div>
            <p className="text-xs text-muted-foreground">
              +10% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$78,000</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.5%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Analytics</CardTitle>
          <CardDescription>
            User growth and revenue trends over the last 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart data={data}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}k`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="users"
                fill="var(--color-users)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="revenue"
                fill="var(--color-revenue)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
```

This documentation provides a comprehensive guide to using shadcn charts with best practices, examples, and customization options. The modular approach makes it easy to create consistent, accessible, and performant charts across your application. 