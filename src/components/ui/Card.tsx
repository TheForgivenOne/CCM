'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  glow?: 'none' | 'green' | 'red' | 'blue';
}

export default function Card({ children, className = '', glow = 'none' }: CardProps) {
  const glowStyles = {
    none: '',
    green: 'glow-green',
    red: 'glow-red',
    blue: 'glow-blue',
  };

  return (
    <div className={`glass rounded-xl p-5 ${glowStyles[glow]} ${className}`}>
      {children}
    </div>
  );
}
