// HeroEffects.tsx
"use client";

import { useEffect, useState } from "react";

export default function HeroEffects() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    requestIdleCallback(() => setShow(true));
  }, []);

  if (!show) return null;

  return (
    <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
      <div className="
        w-62.5 h-50 md:w-145 md:h-75
        rounded-full blur-[80px]
        bg-cyan-200/30 dark:bg-cyan-900/20
      " />
    </div>
  );
}
