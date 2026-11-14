import { useState, type ComponentType } from "react";
import { BarChart3, FileSpreadsheet, LogOut, Sparkles, Store } from "lucide-react";
import { supabase } from "../lib/supabase";
import { DecisaoTab } from "../components/painel/DecisaoTab";
import { ResultadosTab } from "../components/painel/ResultadosTab";
import { LojasTab } from "../components/painel/LojasTab";
import { RelatoriosTab } from "../components/painel/RelatoriosTab";

const ABAS = [
  { id: "decisao", rotulo: "Decisão Inteligente", Icone: Sparkles, Conteudo: DecisaoTab },
  { id: "resultados", rotulo: "Painel de Resultados", Icone: BarChart3, Conteudo: ResultadosTab },
  { id: "lojas", rotulo: "Mix de Lojas", Icone: Store, Conteudo: LojasTab },
  { id: "relatorios", rotulo: "Relatórios", Icone: FileSpreadsheet, Conteudo: RelatoriosTab },
] satisfies { id: string; rotulo: string; Icone: ComponentType<{ className?: string }>; Conteudo: ComponentType }[];

type AbaSistema = (typeof ABAS)[number]["id"];

export function PainelGestor() {
  const [abaAtiva, setAbaAtiva] = useState<AbaSistema>("decisao");
  const { Conteudo } = ABAS.find((aba) => aba.id === abaAtiva) ?? ABAS[0];

  return (
    <div className="min-h-screen bg-muted text-foreground flex">
      <aside className="w-64 bg-background border-r border-border p-6 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
              M
            </div>
            <span className="text-xl font-bold tracking-tight">MallPulse</span>
          </div>

          <nav className="space-y-1.5">
            {ABAS.map(({ id, rotulo, Icone }) => (
              <button
                key={id}
                onClick={() => setAbaAtiva(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  abaAtiva === id ? "bg-primary text-white shadow-sm" : "text-gray-600 hover:bg-muted"
                }`}
              >
                <Icone className="w-4 h-4" />
                {rotulo}
              </button>
            ))}
          </nav>
        </div>

        <button
          onClick={() => supabase?.auth.signOut()}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold border border-border text-gray-600 hover:bg-muted transition"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </aside>

      <main className="flex-1 p-8 max-w-6xl mx-auto overflow-y-auto">
        <Conteudo />
      </main>
    </div>
  );
}
