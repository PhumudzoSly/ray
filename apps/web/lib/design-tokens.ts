// Design tokens for consistent UI
export const typography = {
  display: "text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight",
  heading: "text-3xl md:text-4xl font-bold tracking-tight",
  title: "text-xl md:text-2xl font-semibold",
  body: "text-base leading-relaxed",
  caption: "text-sm text-muted-foreground",
} as const;

export const spacing = {
  section: "py-16 md:py-24",
  container: "container mx-auto px-4 md:px-6",
  grid: "grid gap-6 md:gap-8",
} as const;

export const colors = {
  primary: "hsl(var(--primary))",
  secondary: "hsl(var(--secondary))",
  accent: "hsl(var(--accent))",
  muted: "hsl(var(--muted))",
} as const;

export const animations = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  },
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }
} as const;