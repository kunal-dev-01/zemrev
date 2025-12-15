// ============================================================================
// FILE: src/components/Shared/PasswordField.tsx
// PURPOSE: Reusable Password Input with Show/Hide toggle
// ============================================================================

import { EyeCloseSvg, EyeSvg } from "@/components/Svg/ToolsSvg";
import { useState } from "react";

interface PasswordFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  helperText?: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export const PasswordField = ({
  label,
  value,
  placeholder,
  helperText,
  onChange,
  required = false,
}: PasswordFieldProps) => {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2 block">
        {label} {required && "(Required)"}
      </label>

      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 pr-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-sm outline-none"
        />

        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition cursor-pointer"
        >
          {show ? <EyeSvg /> : <EyeCloseSvg />}
        </button>
      </div>

      {helperText && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          {helperText}
        </p>
      )}
    </div>
  );
};
