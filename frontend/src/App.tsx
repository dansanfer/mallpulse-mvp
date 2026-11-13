import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { CheckinPage } from "./pages/CheckinPage";
import { useState } from "react";
import {
  Sparkles,
  Store,
  Users,
  Calendar,
  CloudSun,
  QrCode,
  CheckCircle2,
  Loader2,
  BarChart3,
  FileSpreadsheet,
  Plus,
  Download,
  TrendingUp,
  Search,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  gerarRecomendacao,
  type RecomendacaoResponse,
  MOCK_GRAFICO_OBJETIVOS,
  MOCK_HISTORICO_EVENTOS,
  MOCK_LOJISTAS,
  type Lojista,
} from "./services/api";

const LOJAS_DISPONIVEIS = [
  "Artigos Masculinos",
  "Barbearia VIP",
  "Cervejaria Artesanal",
  "Praça de Alimentação",
  "Moda Infantil",
  "Eletrônicos & Games",
];

type AbaSistema = "decisao" | "resultados" | "lojas" | "relatorios";

function PainelGestor() {
  const [abaAtiva, setAbaAtiva] = useState<AbaSistema>("decisao");

  // Estados da Aba 1: Decisão Inteligente
  const [objetivo, setObjetivo] = useState(
    "Reativar vendas de Moda Masculina (Pós-Dia dos Pais)"
  );
  const [publicoAlvo, setPublicoAlvo] = useState(
    "Homens Adultos • 30 a 60 anos"
  );
  const [periodo, setPeriodo] = useState("Próximo Fim de Semana • Sábado, 17h");
  const [lojistasSelecionados, setLojistasSelecionados] = useState<string[]>([
    "Artigos Masculinos",
    "Barbearia VIP",
    "Cervejaria Artesanal",
  ]);
  const [carregando, setCarregando] = useState(false);
  const [resultado, setResultado] = useState<RecomendacaoResponse | null>(null);
  const [aprovado, setAprovado] = useState(false);

  // Estados da Aba 3: Mix de Lojas
  const [listaLojas, setListaLojas] = useState<Lojista[]>(MOCK_LOJISTAS);
  const [buscaLoja, setBuscaLoja] = useState("");
  const [novaLojaNome, setNovaLojaNome] = useState("");
  const [novaLojaSegmento, setNovaLojaSegmento] = useState("Artigos Masculinos");
  const [novaLojaPiso, setNovaLojaPiso] = useState("Piso L2 • Ala Norte");

  const toggleLoja = (loja: string) => {
    setLojistasSelecionados((prev) =>
      prev.includes(loja) ? prev.filter((item) => item !== loja) : [...prev, loja]
    );
  };

  const handleGerar = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setAprovado(false);
    try {
      const resp = await gerarRecomendacao({
        objetivo,
        publico_alvo: publicoAlvo,
        lojistas: lojistasSelecionados,
        periodo,
      });
      setResultado(resp);
    } finally {
      setCarregando(false);
    }
  };

  const handleAdicionarLoja = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaLojaNome.trim()) return;
    const nova: Lojista = {
      id: `LOJ-0${listaLojas.length + 1}`,
      nome: novaLojaNome,
      segmento: novaLojaSegmento,
      piso: novaLojaPiso,
      tags_publico: ["Novo Parceiro", "Ativo"],
      eventos_participados: 0,
      ativo: true,
    };
    setListaLojas([nova, ...listaLojas]);
    setNovaLojaNome("");
  };

  const exportarCSV = () => {
    const cabecalho = "ID,Objetivo,Evento,Publico,Checkins,Estimado,Aderencia,Data\n";
    const linhas = MOCK_HISTORICO_EVENTOS.map(
      (ev) =>
        `"${ev.id}","${ev.objetivo}","${ev.evento}","${ev.publico}",${ev.checkins},${ev.estimado},${ev.aderencia}%,"${ev.data}"`
    ).join("\n");
    const blob = new Blob([cabecalho + linhas], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "relatorio_eventos_mallpulse.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const lojasFiltradas = listaLojas.filter(
    (l) =>
      l.nome.toLowerCase().includes(buscaLoja.toLowerCase()) ||
      l.segmento.toLowerCase().includes(buscaLoja.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-muted text-foreground flex">
      {/* Sidebar */}
      <aside className="w-64 bg-background border-r border-border p-6 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
              M
            </div>
            <span className="text-xl font-bold tracking-tight">MallPulse</span>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => setAbaAtiva("decisao")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                abaAtiva === "decisao"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-600 hover:bg-muted"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Decisão Inteligente
            </button>

            <button
              onClick={() => setAbaAtiva("resultados")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                abaAtiva === "resultados"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-600 hover:bg-muted"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Painel de Resultados
            </button>

            <button
              onClick={() => setAbaAtiva("lojas")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                abaAtiva === "lojas"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-600 hover:bg-muted"
              }`}
            >
              <Store className="w-4 h-4" />
              Mix de Lojas
            </button>

            <button
              onClick={() => setAbaAtiva("relatorios")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                abaAtiva === "relatorios"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-600 hover:bg-muted"
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Relatórios
            </button>
          </nav>
        </div>

        <div className="space-y-3">
          <Link
            to="/checkin/evento-01"
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold bg-secondary text-white hover:opacity-95 transition shadow-sm"
          >
            <QrCode className="w-4 h-4" />
            Simular Tela Mobile Visitante
          </Link>

          <div className="p-3 rounded-lg bg-muted border border-border text-xs text-gray-500">
            <p className="font-semibold text-foreground">Status das APIs</p>
            <p className="mt-1">• BrasilAPI: Conectada</p>
            <p>• Open-Meteo: Conectada</p>
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-8 max-w-6xl mx-auto overflow-y-auto">
        {/* ================= ABA 1: DECISÃO INTELIGENTE ================= */}
        {abaAtiva === "decisao" && (
          <>
            <header className="mb-8">
              <h1 className="text-2xl font-bold text-foreground">
                Motor de Decisão Comercial
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Defina a finalidade comercial e o público desejado para gerar a
                recomendação ideal de evento.
              </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <form
                onSubmit={handleGerar}
                className="lg:col-span-5 bg-background p-6 rounded-xl border border-border shadow-sm space-y-5"
              >
                <h2 className="font-semibold text-base border-b border-border pb-3">
                  1. Definir Objetivo Comercial
                </h2>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                    Finalidade da Ação
                  </label>
                  <select
                    value={objetivo}
                    onChange={(e) => setObjetivo(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option>
                      Reativar vendas de Moda Masculina (Pós-Dia dos Pais)
                    </option>
                    <option>Aumentar fluxo na Praça de Alimentação</option>
                    <option>Atrair famílias no domingo à tarde</option>
                    <option>Movimentar corredor do Piso L2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                    Público-Alvo Desejado
                  </label>
                  <select
                    value={publicoAlvo}
                    onChange={(e) => setPublicoAlvo(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option>Homens Adultos • 30 a 60 anos</option>
                    <option>Famílias com Crianças • 25 a 45 anos</option>
                    <option>Jovens Universitários • 18 a 25 anos</option>
                    <option>Público Sênior • 60+ anos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                    Período Desejado
                  </label>
                  <input
                    type="text"
                    value={periodo}
                    onChange={(e) => setPeriodo(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                    Lojas / Segmentos Patrocinadores
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {LOJAS_DISPONIVEIS.map((loja) => {
                      const selecionada = lojistasSelecionados.includes(loja);
                      return (
                        <button
                          type="button"
                          key={loja}
                          onClick={() => toggleLoja(loja)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                            selecionada
                              ? "bg-secondary text-white border-secondary"
                              : "bg-muted text-gray-600 border-border hover:border-gray-400"
                          }`}
                        >
                          {loja}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={carregando}
                  className="w-full bg-primary hover:opacity-95 text-white font-semibold py-3 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition shadow-sm"
                >
                  {carregando ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Cruzando APIs e Histórico...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Gerar Recomendação de Evento
                    </>
                  )}
                </button>
              </form>

              <div className="lg:col-span-7">
                {!resultado ? (
                  <div className="h-full min-h-[420px] bg-background rounded-xl border border-dashed border-border p-8 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-tertiary/40 text-primary flex items-center justify-center mb-3">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-foreground">
                      Aguardando parâmetros comerciais
                    </h3>
                    <p className="text-sm text-gray-500 max-w-md mt-1">
                      Selecione o objetivo e o público ao lado e clique em gerar
                      para receber o plano de evento cruzado com clima,
                      calendário e mix de lojas.
                    </p>
                  </div>
                ) : (
                  <div className="bg-background rounded-xl border border-border shadow-sm overflow-hidden">
                    <div className="bg-tertiary/35 px-6 py-4 border-b border-border flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Plano de Evento Recomendado
                      </span>
                      <span className="px-3 py-1 rounded-full bg-secondary text-white text-xs font-bold">
                        {resultado.afinidade_pontos}% de Afinidade
                      </span>
                    </div>

                    <div className="p-6 space-y-5">
                      <div>
                        <h3 className="text-xl font-bold text-foreground">
                          {resultado.titulo}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {resultado.justificativa}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-muted border border-border flex items-start gap-2.5 text-xs">
                          <Calendar className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{resultado.contexto.calendario}</span>
                        </div>
                        <div className="p-3 rounded-lg bg-muted border border-border flex items-start gap-2.5 text-xs">
                          <CloudSun className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                          <span>{resultado.contexto.clima}</span>
                        </div>
                      </div>

                      <div className="border-t border-border pt-4 space-y-2.5 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 flex items-center gap-2">
                            <Store className="w-4 h-4" /> Local Estratégico:
                          </span>
                          <span className="font-medium">
                            {resultado.local_sugerido}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 flex items-center gap-2">
                            <Users className="w-4 h-4" /> Público Estimado:
                          </span>
                          <span className="font-medium">
                            {resultado.publico_estimado} visitantes qualificados
                          </span>
                        </div>
                      </div>

                      {!aprovado ? (
                        <button
                          onClick={() => setAprovado(true)}
                          className="w-full bg-secondary hover:opacity-95 text-white font-semibold py-3 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition"
                        >
                          <QrCode className="w-4 h-4" />
                          Aprovar Plano e Gerar QR Code de Check-in
                        </button>
                      ) : (
                        <div className="p-4 rounded-xl bg-muted border border-secondary/40 flex items-center gap-4">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(
                              `${window.location.origin}/checkin/evento-01`
                            )}`}
                            alt="QR Code do Evento"
                            className="w-24 h-24 rounded-lg border border-border bg-white p-1"
                          />
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-secondary font-bold text-sm">
                              <CheckCircle2 className="w-4 h-4" />
                              Evento Aprovado e Ativo!
                            </div>
                            <p className="text-xs text-gray-600">
                              QR Code pronto para exibição nos totens do{" "}
                              <strong>{resultado.local_sugerido}</strong>.
                            </p>
                            <Link
                              to="/checkin/evento-01"
                              className="inline-block text-xs font-semibold text-primary underline hover:opacity-80"
                            >
                              Abrir Portal do Visitante →
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ================= ABA 2: PAINEL DE RESULTADOS ================= */}
        {abaAtiva === "resultados" && (
          <div className="space-y-6">
            <header>
              <h1 className="text-2xl font-bold text-foreground">
                Painel de Resultados e Acompanhamento
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Comparativo entre estimativas do motor comercial e check-ins
                reais registrados nos eventos.
              </p>
            </header>

            {/* 4 KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-background p-5 rounded-xl border border-border shadow-sm">
                <p className="text-xs font-medium text-gray-500">
                  Aderência Média ao Público
                </p>
                <div className="flex items-baseline justify-between mt-2">
                  <p className="text-2xl font-bold text-secondary">89,4%</p>
                  <span className="text-xs font-semibold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                    +6,2% vs meta
                  </span>
                </div>
              </div>

              <div className="bg-background p-5 rounded-xl border border-border shadow-sm">
                <p className="text-xs font-medium text-gray-500">
                  Check-ins Únicos (Trimestre)
                </p>
                <div className="flex items-baseline justify-between mt-2">
                  <p className="text-2xl font-bold text-foreground">3.540</p>
                  <span className="text-xs font-semibold text-primary bg-tertiary/40 px-2 py-0.5 rounded-full">
                    5 eventos
                  </span>
                </div>
              </div>

              <div className="bg-background p-5 rounded-xl border border-border shadow-sm">
                <p className="text-xs font-medium text-gray-500">
                  Impacto nas Lojas Parceiras
                </p>
                <div className="flex items-baseline justify-between mt-2">
                  <p className="text-2xl font-bold text-primary">+31,5%</p>
                  <span className="text-xs text-gray-500">Fluxo no corredor</span>
                </div>
              </div>

              <div className="bg-background p-5 rounded-xl border border-border shadow-sm">
                <p className="text-xs font-medium text-gray-500">
                  Taxa de Recompra / Retorno
                </p>
                <div className="flex items-baseline justify-between mt-2">
                  <p className="text-2xl font-bold text-foreground">4,2x</p>
                  <span className="text-xs text-secondary font-medium">
                    Eventos temáticos
                  </span>
                </div>
              </div>
            </div>

            {/* Gráfico + Insights APIs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 bg-background p-6 rounded-xl border border-border shadow-sm">
                <h2 className="font-semibold text-base mb-4">
                  Público Estimado vs. Check-ins Realizados por Objetivo
                </h2>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_GRAFICO_OBJETIVOS}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="objetivo" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Bar
                        dataKey="estimado"
                        name="Público Estimado"
                        fill="#FBCC97"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="realizado"
                        name="Check-ins Reais"
                        fill="#D87943"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-4 bg-background p-6 rounded-xl border border-border shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <h2 className="font-semibold text-base mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Insights de Sazonalidade (APIs)
                  </h2>
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-lg bg-muted border border-border">
                      <span className="text-[11px] font-bold uppercase text-primary">
                        BrasilAPI • Calendário
                      </span>
                      <p className="text-xs text-gray-700 mt-1">
                        Períodos pós-datas comemorativas (Dia dos Pais / Mães)
                        apresentam queda média de 24%, recuperada com eventos
                        segmentados.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-lg bg-muted border border-border">
                      <span className="text-[11px] font-bold uppercase text-secondary">
                        Open-Meteo • Clima
                      </span>
                      <p className="text-xs text-gray-700 mt-1">
                        Sábados com chuva acima de 60% elevam em 40 min a
                        permanência em eventos Indoor na Praça de Alimentação.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-gray-400 border-t border-border pt-3">
                  * Dados simulados para validação do MVP.
                </div>
              </div>
            </div>

            {/* Tabela Histórica */}
            <div className="bg-background rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold text-base">
                  Histórico de Ações Executadas
                </h2>
                <span className="text-xs text-gray-500">
                  Base histórica usada no cálculo do Score (Peso 40%)
                </span>
              </div>
              <div className="overflow-x-auto">
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
                    {MOCK_HISTORICO_EVENTOS.map((ev) => (
                      <tr key={ev.id} className="hover:bg-muted/40">
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-foreground">
                            {ev.evento}
                          </p>
                          <p className="text-xs text-gray-500">{ev.objetivo}</p>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-gray-600">
                          {ev.publico}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1">
                            {ev.lojas.map((l) => (
                              <span
                                key={l}
                                className="px-2 py-0.5 rounded bg-muted border border-border text-[11px]"
                              >
                                {l}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-medium">
                          {ev.checkins}{" "}
                          <span className="text-gray-400">
                            / {ev.estimado}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-full bg-secondary/15 text-secondary font-bold text-xs">
                            {ev.aderencia}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= ABA 3: MIX DE LOJAS ================= */}
        {abaAtiva === "lojas" && (
          <div className="space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Mix de Lojas e Parceiros Internos
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Cadastro de lojistas e tags de público utilizadas para calcular
                  a sinergia comercial dos eventos.
                </p>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Cadastro rápido */}
              <form
                onSubmit={handleAdicionarLoja}
                className="lg:col-span-4 bg-background p-6 rounded-xl border border-border shadow-sm space-y-4 h-fit"
              >
                <h2 className="font-semibold text-base border-b border-border pb-3">
                  Cadastrar Novo Lojista
                </h2>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    Nome da Loja
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Burger Artesanal L2"
                    value={novaLojaNome}
                    onChange={(e) => setNovaLojaNome(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    Segmento
                  </label>
                  <select
                    value={novaLojaSegmento}
                    onChange={(e) => setNovaLojaSegmento(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-background"
                  >
                    {LOJAS_DISPONIVEIS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    Localização / Piso
                  </label>
                  <input
                    type="text"
                    value={novaLojaPiso}
                    onChange={(e) => setNovaLojaPiso(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary text-white font-semibold py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2 hover:opacity-95"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar ao Mix
                </button>
              </form>

              {/* Lista de Lojas */}
              <div className="lg:col-span-8 space-y-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Buscar loja por nome ou segmento..."
                    value={buscaLoja}
                    onChange={(e) => setBuscaLoja(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lojasFiltradas.map((loja) => (
                    <div
                      key={loja.id}
                      className="bg-background p-5 rounded-xl border border-border shadow-sm flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase text-primary">
                            {loja.segmento}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary text-[11px] font-semibold">
                            Ativa
                          </span>
                        </div>
                        <h3 className="font-bold text-foreground mt-1">
                          {loja.nome}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {loja.piso}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-border flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {loja.tags_publico.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded bg-muted text-[10px] text-gray-600"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <span className="text-[11px] text-gray-400 shrink-0">
                          {loja.eventos_participados} ações
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= ABA 4: RELATÓRIOS ================= */}
        {abaAtiva === "relatorios" && (
          <div className="space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Relatórios Executivos & Auditoria
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Exportação de indicadores consolidados e rastreabilidade das
                  recomendações geradas.
                </p>
              </div>
              <button
                onClick={exportarCSV}
                className="bg-secondary hover:opacity-95 text-white font-semibold px-4 py-2.5 rounded-lg text-sm flex items-center gap-2 shadow-sm w-fit"
              >
                <Download className="w-4 h-4" />
                Exportar Base Completa (CSV)
              </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-background p-6 rounded-xl border border-border shadow-sm space-y-3">
                <span className="px-2.5 py-1 rounded bg-tertiary/50 text-xs font-bold text-foreground">
                  Desempenho Comercial
                </span>
                <h3 className="font-bold text-base">
                  Eficiência por Objetivo
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Eventos direcionados a nichos específicos (ex: Moda Masculina
                  pós-datas) superaram a meta de público em{" "}
                  <strong>+13,3%</strong> na média trimestral.
                </p>
              </div>

              <div className="bg-background p-6 rounded-xl border border-border shadow-sm space-y-3">
                <span className="px-2.5 py-1 rounded bg-secondary/15 text-xs font-bold text-secondary">
                  Engajamento Visitante
                </span>
                <h3 className="font-bold text-base">
                  Adesão ao Check-in via QR Code
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  A eliminação de cadastros longos elevou a conversão de leitura
                  de QR Code para <strong>78%</strong> dos visitantes presentes
                  no corredor.
                </p>
              </div>

              <div className="bg-background p-6 rounded-xl border border-border shadow-sm space-y-3">
                <span className="px-2.5 py-1 rounded bg-primary/15 text-xs font-bold text-primary">
                  Governança & APIs
                </span>
                <h3 className="font-bold text-base">
                  Auditoria do Motor de Score
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  100% das recomendações registradas preservam o snapshot de
                  clima (Open-Meteo), feriados (BrasilAPI) e versão da regra
                  aplicada.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PainelGestor />} />
        <Route path="/checkin/:eventoId" element={<CheckinPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;