import type { EventoHistorico } from "../services/api";

// Aspas dobradas e prefixo ' contra injeção de fórmula em planilhas.
function escaparCampo(valor: string | number | null): string {
  const texto = String(valor ?? "");
  const seguro = /^[=+\-@]/.test(texto) ? `'${texto}` : texto;
  return `"${seguro.replace(/"/g, '""')}"`;
}

export function exportarHistoricoCSV(eventos: EventoHistorico[]) {
  const cabecalho = ["ID", "Objetivo", "Evento", "Publico", "Checkins", "Estimado", "Aderencia", "Data", "Simulado"];
  const linhas = eventos.map((ev) =>
    [
      ev.id,
      ev.objetivo,
      ev.evento,
      ev.publico,
      ev.checkins,
      ev.estimado,
      ev.aderencia === null ? "" : `${ev.aderencia}%`,
      ev.data,
      ev.simulado ? "sim" : "nao",
    ]
      .map(escaparCampo)
      .join(",")
  );
  const blob = new Blob([[cabecalho.map(escaparCampo).join(","), ...linhas].join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "relatorio_eventos_mallpulse.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
