import React, { useId } from "react";
import { cn } from "../../lib/utils";
import { ChevronDown } from "lucide-react";

// 44px de alvo de toque e 16px no mobile (abaixo disso o iOS dá zoom ao focar).
const BASE_CONTROLE =
  "flex min-h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-base md:text-sm text-foreground shadow-sm shadow-black/5 transition-shadow focus-visible:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/20";

interface OriginInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
}

export function OriginInput({ label, icon, className, id, ...props }: OriginInputProps) {
  const idGerado = useId();
  const idCampo = id ?? idGerado;
  return (
    <div className="space-y-1.5">
      <label htmlFor={idCampo} className="block text-xs font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          id={idCampo}
          className={cn(BASE_CONTROLE, "placeholder:text-gray-400", icon && "ps-9", className)}
          {...props}
        />
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-gray-500">
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

export function OriginSelect({ label, children, className, id, ...props }: OriginSelectProps) {
  const idGerado = useId();
  const idCampo = id ?? idGerado;
  return (
    <div className="space-y-1.5">
      <label htmlFor={idCampo} className="block text-xs font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <select
          id={idCampo}
          className={cn(BASE_CONTROLE, "appearance-none pe-9 truncate", className)}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
      </div>
    </div>
  );
}
