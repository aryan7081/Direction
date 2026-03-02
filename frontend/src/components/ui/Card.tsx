import { HTMLAttributes } from 'react';

export function Card({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-lg bg-white border border-gray-200 p-6 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
