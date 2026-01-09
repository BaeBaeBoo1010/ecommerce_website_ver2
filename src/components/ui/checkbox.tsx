"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <div className="relative flex h-6 w-6 items-center">
    <input
      type="checkbox"
      ref={ref}
      className="peer absolute z-10 h-6 w-6 cursor-pointer opacity-0"
      {...props}
    />
    <div
      className={cn(
        "ring-offset-background focus-visible:ring-ring flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        "peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-indigo-500 peer-checked:text-white",
        "border-gray-300 peer-checked:border-transparent",
        className,
      )}
    />
    <Check
      className="pointer-events-none absolute inset-0 m-auto hidden h-4 w-4 text-white peer-checked:block"
      strokeWidth={3}
    />
  </div>
));
Checkbox.displayName = "Checkbox";

export { Checkbox };
