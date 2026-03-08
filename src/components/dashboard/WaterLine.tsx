'use client';

interface WaterLineProps {
  percentage?: number;
}

export default function WaterLine({ percentage = 50 }: WaterLineProps) {
  return (
    <div className="relative w-full h-1 overflow-hidden">
      <div 
        className="absolute h-full bg-gradient-to-r from-transparent via-[#0EA5E9] to-transparent opacity-80"
        style={{ 
          width: '100%',
          animation: 'waterFlow 3s ease-in-out infinite',
        }}
      />
      <div 
        className="absolute h-full w-2 bg-[#0EA5E9] rounded-full blur-sm"
        style={{ 
          left: `${Math.min(100, Math.max(0, percentage))}%`,
          transform: 'translateX(-50%)',
          animation: 'waterDrop 2s ease-in-out infinite',
        }}
      />
    </div>
  );
}
