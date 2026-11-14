import type { EventoHistorico } from "../../services/api";
import { resumirHistorico } from "../../lib/indicadores";

export function IndicadoresHistorico({ eventos }: { eventos: EventoHistorico[] }) {
  const { aderenciaMedia, totalCheckins, totalEventos } = resumirHistorico(eventos);
  const cartoes = [
    {
      titulo: "Aderência Média ao Público",
      valor: aderenciaMedia === null ? "—" : `${aderenciaMedia}%`,
      destaque: "text-secondary",
    },
    { titulo: "Check-ins Únicos (Total)", valor: totalCheckins.toLocaleString("pt-BR"), destaque: "text-foreground" },
    { titulo: "Eventos no Histórico", valor: String(totalEventos), destaque: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cartoes.map(({ titulo, valor, destaque }) => (
        <div key={titulo} className="bg-background p-5 rounded-xl border border-border shadow-sm">
          <p className="text-xs font-medium text-gray-500">{titulo}</p>
          <p className={`text-2xl font-bold mt-2 tabular-nums ${destaque}`}>{valor}</p>
        </div>
      ))}
    </div>
  );
}
