import { useState, type ComponentType } from "react";
import { BarChart3, FileSpreadsheet, LogOut, Sparkles, Store } from "lucide-react";
import { supabase } from "../lib/supabase";
import { DecisaoTab } from "../components/painel/DecisaoTab";
import { ResultadosTab } from "../components/painel/ResultadosTab";
import { LojasTab } from "../components/painel/LojasTab";
import { RelatoriosTab } from "../components/painel/RelatoriosTab";

const ABAS = [
  { id: "decisao", rotulo: "Decisão Inteligente", curto: "Decisão", Icone: Sparkles, Conteudo: DecisaoTab },
  { id: "resultados", rotulo: "Painel de Resultados", curto: "Resultados", Icone: BarChart3, Conteudo: ResultadosTab },
  { id: "lojas", rotulo: "Mix de Lojas", curto: "Lojas", Icone: Store, Conteudo: LojasTab },
  { id: "relatorios", rotulo: "Relatórios", curto: "Relatórios", Icone: FileSpreadsheet, Conteudo: RelatoriosTab },
] satisfies {
  id: string;
  rotulo: string;
  curto: string;
  Icone: ComponentType<{ className?: string }>;
  Conteudo: ComponentType;
}[];

type AbaSistema = (typeof ABAS)[number]["id"];

const sair = () => supabase?.auth.signOut();

function Marca() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">M</div>
      <span className="text-xl font-bold tracking-tight">MallPulse</span>
    </div>
  );
}

export function PainelGestor() {
  const [abaAtiva, setAbaAtiva] = useState<AbaSistema>("decisao");
  const { Conteudo } = ABAS.find((aba) => aba.id === abaAtiva) ?? ABAS[0];

  return (
    <div className="min-h-screen bg-muted text-foreground md:flex">
      {/* Desktop: barra lateral fixa */}
      <aside className="hidden md:flex w-64 bg-background border-r border-border p-6 flex-col justify-between shrink-0 sticky top-0 h-screen">
        <div>
          <div className="mb-8">
            <Marca />
          </div>
          <nav aria-label="Seções do painel" className="space-y-1.5">
            {ABAS.map(({ id, rotulo, Icone }) => (
              <button
                key={id}
                onClick={() => setAbaAtiva(id)}
                aria-current={abaAtiva === id ? "page" : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
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
          onClick={sair}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold border border-border text-gray-600 hover:bg-muted transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </aside>

      {/* Mobile: barra superior translúcida */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 material border-b border-border/60">
        <Marca />
        <button
          onClick={sair}
          aria-label="Sair"
          className="h-11 w-11 -mr-2 flex items-center justify-center rounded-full text-gray-600"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* min-w-0: sem ele o item flex não encolhe e o gráfico fica com largura zero */}
      <main className="flex-1 min-w-0 px-4 py-5 pb-28 md:p-8 max-w-6xl mx-auto">
        <Conteudo />
      </main>

      {/* Mobile: barra de abas inferior translúcida */}
      <nav
        aria-label="Seções do painel"
        className="md:hidden fixed bottom-0 inset-x-0 z-30 material border-t border-border/60 grid grid-cols-4 pb-[env(safe-area-inset-bottom)]"
      >
        {ABAS.map(({ id, curto, Icone }) => (
          <button
            key={id}
            onClick={() => setAbaAtiva(id)}
            aria-current={abaAtiva === id ? "page" : undefined}
            className={`h-16 flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
              abaAtiva === id ? "text-primary" : "text-gray-600"
            }`}
          >
            <Icone className="w-5 h-5" />
            {curto}
          </button>
        ))}
      </nav>
    </div>
  );
}
