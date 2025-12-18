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

  // Sync external value when not dragging
  useEffect(() => {
    if (!isDragging) {
      setLocalValue(value);
    }
  }, [value, isDragging]);

  // Calculate filled percentage
  const percentage = useMemo(() => {
    return Math.min(
      100,
      Math.max(0, ((localValue - min) / (max - min)) * 100)
    );
  }, [localValue, min, max]);

  // ---------------- Handlers ----------------
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handlePresetClick = (presetValue: number) => {
    setLocalValue(presetValue);
    onChange(presetValue);
  };

  // ---------------- Render ----------------
  return (
    <div
      className={`group relative select-none ${className} ${
        disabled ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-center gap-3">
          {icon && (
            <div className="flex items-center justify-center w-5 h-5 rounded-lg text-lg bg-zinc-800/50 border border-zinc-700/50">
              {icon}
            </div>
          )}
          <label className="text-xs uppercase font-bold text-zinc-500">
            {label}
          </label>
        </div>

        {/* Value */}
        <div className="flex items-center gap-1 px-3 py-1 rounded-xl dark:bg-zinc-900 bg-zinc-100 border border-zinc-200 dark:border-zinc-800 shadow-inner min-w-14 justify-center">
          <span
            className="text-sm font-bold tabular-nums tracking-wide"
            style={{ color }}
          >
            {localValue}
          </span>
          <span className="text-xs text-zinc-500 font-medium">{unit}</span>
        </div>
      </div>

      {/* Slider */}
      <div className="relative w-full h-10 flex items-center">
        {/* Track */}
        <div className="absolute w-full h-3 dark:bg-zinc-800 bg-zinc-200 rounded-full overflow-hidden border dark:border-zinc-700/50 border-zinc-50 shadow-inner">
          <div className="absolute inset-0 flex justify-between px-2 opacity-20">
            {Array.from({ length: 11 }).map((_, i) => (
              <div key={i} className="w-px h-full bg-zinc-500" />
            ))}
          </div>
        </div>

        {/* Active Fill */}
        <div
          className="absolute h-3 rounded-full pointer-events-none transition-all duration-75 shadow-[0_0_15px_rgba(0,0,0,0.3)]"
          style={{
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${color}33 0%, ${color} 100%)`,
            boxShadow: `0 0 10px ${color}40`,
          }}
        />

        {/* Native Range Input */}
        <input
          ref={inputRef}
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          disabled={disabled}
          onChange={handleInputChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="absolute w-full h-full opacity-0 cursor-pointer z-10 focus:outline-none"
        />

        {/* Thumb */}
        <div
          className={`
            absolute w-6 h-6 rounded-full bg-white shadow-lg border-2
            pointer-events-none transform -translate-x-1/2
            transition-all duration-150 ease-out
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
                  px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border
                  ${
                    isActive
                      ? "border-none"
                      : "text-zinc-500 bg-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-800 border-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 hover:text-zinc-700 hover:bg-zinc-200 hover:border-zinc-300 cursor-pointer dark:hover:border-zinc-700"
                  }
                `}
                style={
                  isActive
                    ? { color, backgroundColor: `${color}1A` }
                    : undefined
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
