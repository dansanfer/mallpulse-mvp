import { Download } from "lucide-react";
import { obterHistorico } from "../../services/api";
import { useRequisicao } from "../../hooks/useRequisicao";
import { exportarHistoricoCSV } from "../../lib/exportarCsv";
import { EstadoRequisicao } from "./EstadoRequisicao";
import { IndicadoresHistorico } from "./IndicadoresHistorico";

export function RelatoriosTab() {
  const historico = useRequisicao(obterHistorico);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">Relatórios Executivos & Auditoria</h1>
          <p className="text-sm text-gray-500 mt-1">
            Exportação de indicadores consolidados e rastreabilidade das recomendações geradas.
          </p>
        </div>
        <button
          onClick={() => historico.dados && exportarHistoricoCSV(historico.dados)}
          disabled={!historico.dados}
          className="bg-secondary hover:opacity-95 disabled:opacity-60 text-white font-semibold px-4 min-h-11 rounded-lg text-sm flex items-center gap-2 shadow-sm w-fit shrink-0 whitespace-nowrap"
        >
          <Download className="w-4 h-4 shrink-0" />
          Exportar Base Completa (CSV)
        </button>
      </header>

      <EstadoRequisicao carregando={historico.carregando} erro={historico.erro} />
      {historico.dados && <IndicadoresHistorico eventos={historico.dados} />}

      <div className="bg-background p-6 rounded-xl border border-border shadow-sm space-y-3">
        <span className="px-2.5 py-1 rounded bg-primary/15 text-xs font-bold text-primary">
          Governança & APIs
        </span>
        <h3 className="font-bold text-base">Auditoria do Motor de Score</h3>
        <p className="text-xs text-gray-600 leading-relaxed">
          Cada recomendação registra as entradas, o contexto consultado (clima e feriados), a
          versão da regra aplicada e a cobertura dos pesos. Dados simulados não alimentam o
          componente de histórico.
        </p>
      </div>
    </div>
  );
}
