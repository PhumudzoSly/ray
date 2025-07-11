import React from "react";

interface SparklineProps {
  data: number[];
  height: number;
  strokeWidth: number;
  color: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  height,
  strokeWidth,
  color,
}) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  const width = data.length - 1;

  const points = data
    .map((value, index) => {
      const x = (index / width) * 100;
      const y = ((max - value) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient
          id="sparklineGradient"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        points={points}
      />
      <polyline
        fill="url(#sparklineGradient)"
        stroke="none"
        points={`0,${height} ${points} 100,${height}`}
      />
    </svg>
  );
};
