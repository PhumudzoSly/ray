import React from "react";

interface SimpleGridProps {
  cols: {
    base: number;
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  children: React.ReactNode;
  className?: string;
}

export function SimpleGrid({
  cols,
  children,
  className = "",
}: SimpleGridProps) {
  const baseClass = `grid grid-cols-${cols.base}`;
  const xsClass = cols.xs ? `sm:grid-cols-${cols.xs}` : "";
  const smClass = cols.sm ? `md:grid-cols-${cols.sm}` : "";
  const mdClass = cols.md ? `lg:grid-cols-${cols.md}` : "";
  const lgClass = cols.lg ? `xl:grid-cols-${cols.lg}` : "";
  const xlClass = cols.xl ? `2xl:grid-cols-${cols.xl}` : "";

  const classes = [
    baseClass,
    xsClass,
    smClass,
    mdClass,
    lgClass,
    xlClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
}
