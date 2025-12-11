// GlassButton.tsx
import React, { ButtonHTMLAttributes } from 'react';
import { Spinner } from './Spinner';

type Props = {
  loading?: boolean;
  primaryColor?: string;
  children: React.ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function GlassButton({
  loading = false,
  primaryColor = '#3b82f6',
  children,
  className = '',
  ...rest
}: Props) {
  return (
    <button
      disabled={loading || rest.disabled}
      {...rest}
      className={`
        w-full mt-6 px-6 py-1.5 text-white
        rounded-xl font-semibold md:text-lg
        flex items-center justify-center gap-3
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none cursor-pointer 
        ${className}
      `}
      style={{backgroundColor: primaryColor}}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}