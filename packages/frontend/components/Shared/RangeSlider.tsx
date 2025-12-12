import React, { useMemo, useState, useRef, useEffect } from "react";

interface RangeSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  color: string;
  onChange: (value: number) => void;
  presets?: { label: string; value: number }[];
  className?: string;
  icon?: string;
  disabled?: boolean;
}

export const RangeSlider = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  color,
  onChange,
  presets,
  className = "",
  icon,
  disabled = false,
}: RangeSliderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync local value with prop value when not dragging
  useEffect(() => {
    if (!isDragging) {
      setLocalValue(value);
    }
  }, [value, isDragging]);

  const percentage = useMemo(() => {
    return Math.min(100, Math.max(0, ((localValue - min) / (max - min)) * 100));
  }, [localValue, min, max]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handlePresetClick = (presetValue: number) => {
    setLocalValue(presetValue);
    onChange(presetValue);
  };

  return (
    <div
      className={`group relative select-none ${className} ${
        disabled ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex items-center justify-center w-8 h-8 rounded-lg text-lg bg-zinc-800/50 border border-zinc-700/50 shadow-sm">
              {icon}
            </div>
          )}
          <label className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors">
            {label}
          </label>
        </div>

        {/* Value Display */}
        <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 shadow-inner min-w-14 justify-center">
          <span
            className="text-sm font-bold tabular-nums tracking-wide"
            style={{ color }}
          >
            {localValue}
          </span>
          <span className="text-xs text-zinc-500 font-medium">{unit}</span>
        </div>
      </div>

      {/* Slider Container */}
      <div className="relative w-full h-10 flex items-center">
        {/* Background Track */}
        <div className="absolute w-full h-3 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/50 shadow-inner">
          {/* Tick marks (optional subtle detail) */}
          <div className="absolute inset-0 w-full h-full flex justify-between px-2 opacity-20">
            {Array.from({ length: 11 }).map((_, i) => (
              <div key={i} className="w-px h-full bg-zinc-500"></div>
            ))}
          </div>
        </div>

        {/* Active Fill Track with Glow */}
        <div
          className="absolute h-3 rounded-full pointer-events-none transition-all duration-75 ease-out shadow-[0_0_15px_rgba(0,0,0,0.3)]"
          style={{
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${color}33 0%, ${color} 100%)`, // Fade from transparent to full color
            boxShadow: `0 0 10px ${color}40`,
          }}
        />

        {/* Input Element (Invisible but Functional) */}
        <input
          ref={inputRef}
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          disabled={disabled}
          onChange={handleInput}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="
            absolute w-full h-full opacity-0 cursor-pointer z-10 
            focus:outline-none
          "
        />

        {/* Custom Thumb (Visual Only) */}
        <div
          className={`
            absolute h-6 w-6 rounded-full bg-white shadow-lg border-2 pointer-events-none
            transition-all duration-150 ease-out transform -translate-x-1/2
            flex items-center justify-center
            ${
              isDragging
                ? "scale-125 border-zinc-900 ring-4 ring-white/10"
                : "scale-100"
            }
          `}
          style={{
            left: `${percentage}%`,
            borderColor: color,
            boxShadow: `0 2px 10px ${color}66`,
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
        </div>
      </div>

      {/* Presets */}
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {presets.map((preset) => {
            const isActive = Math.abs(localValue - preset.value) < step;
            return (
              <button
                key={preset.value}
                onClick={() => handlePresetClick(preset.value)}
                disabled={disabled}
                className={`
                  px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 border cursor-pointer
                  ${
                    isActive
                      ? `bg-zinc-800 text-white border-none border-zinc-600`
                      : "text-zinc-500 bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-300 hover:border-zinc-700"
                  }
                `}
                style={
                  isActive
                    ? { color: color, backgroundColor: `${color}1A` }
                    : {}
                }
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
