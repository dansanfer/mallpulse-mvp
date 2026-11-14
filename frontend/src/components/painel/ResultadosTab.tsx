import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { obterGraficoObjetivos, obterHistorico } from "../../services/api";
import { useRequisicao } from "../../hooks/useRequisicao";
import { EstadoRequisicao } from "./EstadoRequisicao";
import { IndicadoresHistorico } from "./IndicadoresHistorico";
import { BadgeSimulado, TextoAderencia } from "./Indicadores";

export function ResultadosTab() {
  const historico = useRequisicao(obterHistorico);
  const grafico = useRequisicao(obterGraficoObjetivos);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">Painel de Resultados e Acompanhamento</h1>
        <p className="text-sm text-gray-500 mt-1">
          Comparativo entre estimativas do motor comercial e check-ins reais registrados nos eventos.
        </p>
      </header>

      <EstadoRequisicao carregando={historico.carregando} erro={historico.erro} />
      {historico.dados && <IndicadoresHistorico eventos={historico.dados} />}

      <div className="bg-background p-6 rounded-xl border border-border shadow-sm">
        <h2 className="font-semibold text-base mb-4">
          Público Estimado vs. Check-ins Realizados por Objetivo
        </h2>
        <EstadoRequisicao carregando={grafico.carregando} erro={grafico.erro} />
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {/* margem esquerda: o primeiro rótulo inclinado (-30°) passa da borda e era cortado */}
            <BarChart data={grafico.dados ?? []} margin={{ top: 8, right: 8, left: 24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              {/* shortcut: labels truncated for the axis only; the tooltip keeps the full name */}
              <XAxis
                dataKey="objetivo"
                tick={{ fontSize: 11 }}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={80}
                tickFormatter={(v: string) => (v.length > 18 ? `${v.slice(0, 17)}…` : v)}
              />
              <YAxis tick={{ fontSize: 11 }} width={44} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="estimado" name="Público Estimado" fill="#FBCC97" radius={[4, 4, 0, 0]} />
              <Bar dataKey="realizado" name="Check-ins Reais" fill="#D87943" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-background rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-4 md:px-6 py-4 border-b border-border flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <h2 className="font-semibold text-base">Histórico de Ações Executadas</h2>
          <span className="text-xs text-gray-500">
            Eventos simulados não entram no cálculo do Score
          </span>
        </div>
        {historico.dados?.length === 0 && (
          <p className="px-4 py-8 text-sm text-gray-500 text-center">Nenhuma ação executada no histórico ainda.</p>
        )}
        <ul className="lg:hidden divide-y divide-border">
          {historico.dados?.map((ev) => (
            <li key={ev.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">
                    {ev.evento} {ev.simulado && <BadgeSimulado />}
                  </p>
                  <p className="text-xs text-gray-500">{ev.objetivo}</p>
                </div>
                <TextoAderencia valor={ev.aderencia} />
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div>
                  <dt className="text-gray-500">Público-alvo</dt>
                  <dd className="text-gray-700">{ev.publico}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Check-ins</dt>
                  <dd className="font-medium tabular-nums">
                    {ev.checkins} <span className="text-gray-500">/ {ev.estimado ?? "—"}</span>
                  </dd>
                </div>
              </dl>
              {ev.lojas.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {ev.lojas.map((l) => (
                    <span key={l} className="px-2 py-0.5 rounded bg-muted border border-border text-[11px]">
                      {l}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-muted text-gray-500 text-xs uppercase border-b border-border">
                <th className="py-3 px-4">Evento / Objetivo</th>
                <th className="py-3 px-4">Público-Alvo</th>
                <th className="py-3 px-4">Lojas Parceiras</th>
                <th className="py-3 px-4">Check-ins</th>
                <th className="py-3 px-4">Aderência</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {historico.dados?.map((ev) => (
                <tr key={ev.id} className="hover:bg-muted/40">
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-foreground">
                      {ev.evento} {ev.simulado && <BadgeSimulado />}
                    </p>
                    <p className="text-xs text-gray-500">{ev.objetivo}</p>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-gray-600">{ev.publico}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {ev.lojas.map((l) => (
                        <span key={l} className="px-2 py-0.5 rounded bg-muted border border-border text-[11px]">
                          {l}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-medium tabular-nums">
                    {ev.checkins} <span className="text-gray-500">/ {ev.estimado ?? "—"}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <TextoAderencia valor={ev.aderencia} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
