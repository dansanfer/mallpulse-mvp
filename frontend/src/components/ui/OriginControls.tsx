import React from "react";
import { cn } from "../../lib/utils";
import { ChevronDown } from "lucide-react";

interface OriginInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
}

export function OriginInput({ label, icon, className, ...props }: OriginInputProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          className={cn(
            "flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-gray-400 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/20",
            icon && "ps-9",
            className
          )}
          {...props}
        />
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-gray-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

interface OriginSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
}

export function OriginSelect({ label, children, className, ...props }: OriginSelectProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <select
          className={cn(
            "flex h-10 w-full appearance-none rounded-lg border border-border bg-background px-3 pe-8 py-2 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow focus-visible:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/20",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute end-2.5 top-3 h-4 w-4 text-gray-400" />
      </div>
    </div>
  );
}