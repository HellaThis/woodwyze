import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
}

export function Button({ children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`bg-green-700 text-white px-8 py-4 rounded-xl text-lg shadow-lg hover:bg-green-800 transition-all ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
