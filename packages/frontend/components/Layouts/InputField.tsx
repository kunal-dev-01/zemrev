// ============================================================================
// FILE: src/components/Shared/InputField.tsx
// PURPOSE: Reusable Input with Label (number/text support, no arrows)
// ============================================================================

interface InputFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
}

export const InputField = ({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  type = "number",
  min,
  max,
  step = 1,
  disabled = false,
  className = "",
}: InputFieldProps) => {
  const isNumber = type === "number";

  return (
    <div className={className}>
      <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block">
        {label}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        min={isNumber ? min : undefined}
        max={isNumber ? max : undefined}
        step={isNumber ? step : undefined}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={`
          w-full px-3 py-2 rounded-lg border
          border-zinc-200 dark:border-zinc-700
          bg-transparent
          text-zinc-800 dark:text-zinc-200
          text-sm outline-none
          disabled:opacity-60 disabled:cursor-not-allowed
          ${isNumber
            ? "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            : ""}
        `}
      />
    </div>
  );
};
