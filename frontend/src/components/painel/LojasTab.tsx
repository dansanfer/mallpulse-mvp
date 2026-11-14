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

  const handleAdicionar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setErro(undefined);
    try {
      await criarLojista({ nome: nome.trim(), segmento, piso, tags_publico: separarTags(tags) });
      setNome("");
      setSegmento("");
      setPiso("");
      setTags("");
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
        <h1 className="text-2xl font-bold text-foreground">Mix de Lojas e Parceiros Internos</h1>
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
          <button
            type="submit"
            disabled={salvando}
            className="w-full bg-primary disabled:opacity-60 text-white font-semibold py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2 hover:opacity-95"
          >
            <Plus className="w-4 h-4" />
            Adicionar ao Mix
          </button>
        </form>

        <div className="lg:col-span-8 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar loja por nome ou segmento..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <EstadoRequisicao carregando={lojistas.carregando} erro={lojistas.erro} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtradas?.map((loja) => (
              <div
                key={loja.id}
                className="bg-background p-5 rounded-xl border border-border shadow-sm flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-primary">{loja.segmento}</span>
                    <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary text-[11px] font-semibold">
                      {loja.ativo ? "Ativa" : "Inativa"}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground mt-1">{loja.nome}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{loja.piso}</p>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {loja.tags_publico.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded bg-muted text-[10px] text-gray-600">
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
  );
}
