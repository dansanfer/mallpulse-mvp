import React from "react";
import { cn } from "../../lib/utils";

interface OriginBannerProps {
  titulo: string;
  descricao: string;
  icone: React.ReactNode;
  variante?: "laranja" | "petroleo" | "areia";
}

export function OriginBanner({
  titulo,
  descricao,
  icone,
  variante = "petroleo",
}: OriginBannerProps) {
  const estilos = {
    laranja: "border-primary/30 bg-primary/5 text-foreground",
    petroleo: "border-secondary/30 bg-secondary/5 text-foreground",
    areia: "border-tertiary bg-tertiary/25 text-foreground",
  };

  const corIcone = {
    laranja: "text-primary",
    petroleo: "text-secondary",
    areia: "text-primary",
  };

  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 shadow-sm shadow-black/5 transition-all",
        estilos[variante]
      )}
    >
      <div className="flex gap-3">
        <div className={cn("mt-0.5 shrink-0", corIcone[variante])}>{icone}</div>
        <div className="space-y-0.5">
          <p className="text-xs font-semibold">{titulo}</p>
          <p className="text-xs text-gray-600 leading-relaxed">{descricao}</p>
        </div>
      </div>
    </div>
  );
}