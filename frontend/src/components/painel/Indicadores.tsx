export function BadgeSimulado() {
  return (
    <span className="ml-1 px-1.5 py-0.5 rounded bg-tertiary/50 text-[10px] font-semibold text-foreground align-middle">
      simulado
    </span>
  );
}

export function TextoAderencia({ valor }: { valor: number | null }) {
  if (valor === null) return <span className="text-xs text-gray-400">sem estimativa</span>;
  return (
    <span className="px-2.5 py-1 rounded-full bg-secondary/15 text-secondary font-bold text-xs">
      {valor}%
    </span>
  );
}
