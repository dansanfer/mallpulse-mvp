import { useState } from "react";
import { Calendar, Loader2, Sparkles } from "lucide-react";
import {
  gerarRecomendacao,
  listarLojistas,
  mensagemErro,
  type Ambiente,
  type Recomendacao,
} from "../../services/api";
import { useRequisicao } from "../../hooks/useRequisicao";
import { separarTags } from "../../lib/utils";
import { OriginInput, OriginSelect } from "../ui/OriginControls";
import { EstadoRequisicao } from "./EstadoRequisicao";
import { ResultadoRecomendacao } from "./ResultadoRecomendacao";

interface PlanoGerado {
  recomendacao: Recomendacao;
  localSugerido: string;
}

export function DecisaoTab() {
  const lojistas = useRequisicao(listarLojistas);
  const [objetivo, setObjetivo] = useState("Reativar vendas de Moda Masculina (Pós-Dia dos Pais)");
  const [publicoAlvo, setPublicoAlvo] = useState("Homens Adultos • 30 a 60 anos");
  const [data, setData] = useState("");
  const [categoria, setCategoria] = useState("Música ao Vivo");
  const [ambiente, setAmbiente] = useState<Ambiente>("Indoor");
  const [localSugerido, setLocalSugerido] = useState("Corredor L2");
  const [tags, setTags] = useState("Homens 30-60, Gastronomia");
  const [lojistaIds, setLojistaIds] = useState<string[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string>();
  const [plano, setPlano] = useState<PlanoGerado | null>(null);

  const toggleLojista = (id: string) =>
    setLojistaIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));

  const handleGerar = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro(undefined);
    setPlano(null);
    try {
      const resposta = await gerarRecomendacao({
        objetivo,
        publico_alvo: publicoAlvo,
        tags_publico: separarTags(tags),
        lojista_ids: lojistaIds,
        data,
        categoria,
        ambiente,
        local_sugerido: localSugerido,
      });
      setPlano({ recomendacao: resposta.recomendacao, localSugerido });
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setCarregando(false);
    }
  };

  const lojistasAtivos = lojistas.dados?.filter((l) => l.ativo) ?? [];

  return (
    <>
      <header className="mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Motor de Decisão Comercial</h1>
        <p className="text-sm text-gray-500 mt-1">
          Defina a finalidade comercial e o público desejado para gerar a recomendação ideal de
          evento.
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

          <OriginSelect
            label="Finalidade da Ação"
            value={objetivo}
            onChange={(e) => setObjetivo(e.target.value)}
          >
            <option>Reativar vendas de Moda Masculina (Pós-Dia dos Pais)</option>
            <option>Aumentar fluxo na Praça de Alimentação</option>
            <option>Atrair famílias no domingo à tarde</option>
            <option>Movimentar corredor do Piso L2</option>
          </OriginSelect>

          <OriginSelect
            label="Público-Alvo Desejado"
            value={publicoAlvo}
            onChange={(e) => setPublicoAlvo(e.target.value)}
          >
            <option>Homens Adultos • 30 a 60 anos</option>
            <option>Famílias com Crianças • 25 a 45 anos</option>
            <option>Jovens Universitários • 18 a 25 anos</option>
            <option>Público Sênior • 60+ anos</option>
          </OriginSelect>

          <OriginInput
            label="Tags do Público (separadas por vírgula)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          <OriginInput
            label="Data do Evento"
            type="date"
            required
            icon={<Calendar className="w-4 h-4" />}
            value={data}
            onChange={(e) => setData(e.target.value)}
          />

          <OriginInput
            label="Categoria do Evento"
            required
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <OriginSelect
              label="Ambiente"
              value={ambiente}
              onChange={(e) => setAmbiente(e.target.value as Ambiente)}
            >
              <option>Indoor</option>
              <option>Outdoor</option>
            </OriginSelect>
            <OriginInput
              label="Local Sugerido"
              required
              value={localSugerido}
              onChange={(e) => setLocalSugerido(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-2">
              Lojas Patrocinadoras
            </label>
            <EstadoRequisicao carregando={lojistas.carregando} erro={lojistas.erro} />
            <div className="flex flex-wrap gap-2">
              {lojistasAtivos.map((loja) => (
                <button
                  type="button"
                  key={loja.id}
                  onClick={() => toggleLojista(loja.id)}
                  aria-pressed={lojistaIds.includes(loja.id)}
                  className={`inline-flex items-center min-h-[44px] md:min-h-0 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                    lojistaIds.includes(loja.id)
                      ? "bg-secondary text-white border-secondary"
                      : "bg-muted text-gray-600 border-border hover:border-gray-400"
                  }`}
                >
                  {loja.nome}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-primary hover:opacity-95 disabled:opacity-60 text-white font-semibold py-3 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition shadow-sm"
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

        <div className="lg:col-span-7 space-y-4">
          {erro && <EstadoRequisicao carregando={false} erro={erro} />}
          {plano ? (
            <ResultadoRecomendacao
              key={plano.recomendacao.evento_id}
              recomendacao={plano.recomendacao}
              localSugerido={plano.localSugerido}
            />
          ) : (
            <div className="h-full min-h-[420px] bg-background rounded-xl border border-dashed border-border p-8 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-tertiary/40 text-primary flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-foreground">Aguardando parâmetros comerciais</h3>
              <p className="text-sm text-gray-500 max-w-md mt-1">
                Selecione o objetivo e o público ao lado e clique em gerar para receber o plano de
                evento cruzado com clima, calendário e mix de lojas.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
