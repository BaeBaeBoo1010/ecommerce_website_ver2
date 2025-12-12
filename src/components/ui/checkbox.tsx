"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <div className="relative flex items-center h-6 w-6">
    <input
      type="checkbox"
      ref={ref}
      className="peer h-6 w-6 opacity-0 absolute cursor-pointer z-10"
      {...props}
    />
    <div className={cn(
      "flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      "peer-checked:bg-primary peer-checked:text-primary-foreground",
      "border-gray-300 peer-checked:border-current",
      className
    )} />
    <Check className="h-4 w-4 absolute inset-0 m-auto hidden peer-checked:block text-white pointer-events-none" strokeWidth={3} />
  </div>
));
Checkbox.displayName = "Checkbox";

export { Checkbox };
