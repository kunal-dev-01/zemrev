// Spinner.tsx
import React from "react";
import clsx from "clsx";

interface SpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

const sizeMap = { xs: 12, sm: 16, md: 24, lg: 32, xl: 40 };

const Spinner: React.FC<SpinnerProps> = React.memo(
  ({ size = "md", color = "text-blue-600", strokeWidth = 6, className }) => {
    const s = typeof size === "number" ? size : sizeMap[size];

    return (
      <span className={clsx("inline-flex", color, className)} style={{ width: s, height: s }}>
        <svg viewBox="0 0 50 50" className="spinner">
          <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth={strokeWidth} />
        </svg>
        <style>{`
          .spinner{animation:r 1.4s linear infinite}
          .spinner circle{stroke-dasharray:1 200;stroke-dashoffset:0;stroke-linecap:round;animation:d 1.4s ease-in-out infinite}
          @keyframes r{100%{transform:rotate(360deg)}}
          @keyframes d{0%{stroke-dasharray:1 200;stroke-dashoffset:0}50%{stroke-dasharray:100 200;stroke-dashoffset:-30}100%{stroke-dasharray:1 200;stroke-dashoffset:-130}}
        `}</style>
      </span>
    );
  }
);

Spinner.displayName = "Spinner";
export default Spinner;