'use client';

interface WaterLineProps {
  data?: number[];
  width?: number;
  height?: number;
}

export default function WaterLine({ data = [30, 45, 35, 50, 42, 60, 55], width = 300, height = 80 }: WaterLineProps) {
  const maxValue = Math.max(...data, 0);
  const minValue = Math.min(...data, 0);
  const range = maxValue - minValue || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - minValue) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Gradient definition */}
      <defs>
        <linearGradient id="waterLineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill="url(#waterLineGradient)"
        className="opacity-50"
      />

      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke="#0EA5E9"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Data points */}
      {data.map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - minValue) / range) * height;
        return (
          <circle
            key={index}
            cx={x}
            cy={y}
            r="4"
            fill="#0EA5E9"
            className="opacity-80"
          />
        );
      })}
    </svg>
  );
}
