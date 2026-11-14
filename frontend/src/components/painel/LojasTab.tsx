import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { criarLojista, listarLojistas, mensagemErro } from "../../services/api";
import { useRequisicao } from "../../hooks/useRequisicao";
import { separarTags } from "../../lib/utils";
import { OriginInput } from "../ui/OriginControls";
import { EstadoRequisicao } from "./EstadoRequisicao";

export function LojasTab() {
  const lojistas = useRequisicao(listarLojistas);
  const [busca, setBusca] = useState("");
  const [nome, setNome] = useState("");
  const [segmento, setSegmento] = useState("");
  const [piso, setPiso] = useState("");
  const [tags, setTags] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string>();
  const [sucesso, setSucesso] = useState<string>();

  const handleAdicionar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setErro(undefined);
    setSucesso(undefined);
    const nomeLoja = nome.trim();
    try {
      await criarLojista({ nome: nomeLoja, segmento, piso, tags_publico: separarTags(tags) });
      setNome("");
      setSegmento("");
      setPiso("");
      setTags("");
      setSucesso(`"${nomeLoja}" adicionada ao mix.`);
      lojistas.recarregar();
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setSalvando(false);
    }
  };

  const termo = busca.toLowerCase();
  const filtradas = lojistas.dados?.filter(
    (l) => l.nome.toLowerCase().includes(termo) || l.segmento.toLowerCase().includes(termo)
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
          Mix de Lojas e Parceiros Internos
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Cadastro de lojistas e tags de público utilizadas para calcular a sinergia comercial dos
          eventos.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form
          onSubmit={handleAdicionar}
          className="lg:col-span-4 bg-background p-6 rounded-xl border border-border shadow-sm space-y-4 h-fit"
        >
          <h2 className="font-semibold text-base border-b border-border pb-3">
            Cadastrar Novo Lojista
          </h2>
          <OriginInput
            label="Nome da Loja"
            required
            maxLength={120}
            placeholder="Ex: Burger Artesanal L2"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <OriginInput
            label="Segmento"
            required
            placeholder="Ex: Cervejaria Artesanal"
            value={segmento}
            onChange={(e) => setSegmento(e.target.value)}
          />
          <OriginInput
            label="Localização / Piso"
            required
            placeholder="Ex: Piso L2 • Ala Norte"
            value={piso}
            onChange={(e) => setPiso(e.target.value)}
          />
          <OriginInput
            label="Tags de Público (separadas por vírgula)"
            placeholder="Ex: Homens 30-60, Gastronomia"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          {erro && (
            <p role="alert" className="text-xs text-destructive">
              {erro}
            </p>
          )}
          {sucesso && (
            <p role="status" className="text-xs font-medium text-secondary">
              {sucesso}
            </p>
          )}
          <button
            type="submit"
            disabled={salvando}
            className="w-full min-h-11 bg-primary disabled:opacity-60 text-white font-semibold py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2 hover:opacity-95"
          >
            <Plus className="w-4 h-4" />
            Adicionar ao Mix
          </button>
        </form>

        <div className="lg:col-span-8 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              aria-label="Buscar loja por nome ou segmento"
              placeholder="Buscar loja por nome ou segmento..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full min-h-11 bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-base md:text-sm shadow-sm shadow-black/5 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/20"
            />
          </div>

          <EstadoRequisicao carregando={lojistas.carregando} erro={lojistas.erro} />

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtradas?.map((loja) => (
              <div
                key={loja.id}
                className="bg-background p-5 rounded-xl border border-border shadow-sm flex flex-col justify-between space-y-3 min-w-0"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="min-w-0 break-words text-[11px] font-bold uppercase text-primary">
                      {loja.segmento}
                    </span>
                    <span className="shrink-0 px-2 py-0.5 rounded-full bg-secondary/15 text-secondary text-[11px] font-semibold">
                      {loja.ativo ? "Ativa" : "Inativa"}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground mt-1 break-words">{loja.nome}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 break-words">{loja.piso}</p>
                </div>

                <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1 min-w-0">
                    {loja.tags_publico.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded bg-muted text-[11px] text-gray-600 break-words">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-[11px] text-gray-500 shrink-0">
                    {loja.eventos_participados} ações
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
