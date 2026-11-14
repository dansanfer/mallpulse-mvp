import { useState } from "react";
import { CheckCircle2, CloudSun, Calendar, Loader2, QrCode, Store, Users } from "lucide-react";
import {
  aprovarEvento,
  mensagemErro,
  type ComponentesScore,
  type EventoAprovado,
  type Recomendacao,
} from "../../services/api";
import { OriginBanner } from "../ui/OriginBanner";

const ROTULOS_COMPONENTES: Record<keyof ComponentesScore, string> = {
  H: "Histórico",
  L: "Lojistas",
  C: "Clima",
  S: "Sazonalidade",
};

interface ResultadoRecomendacaoProps {
  recomendacao: Recomendacao;
  localSugerido: string;
}

function descreverCalendario({ janela_feriado, fonte_calendario }: Recomendacao["contexto"]) {
  if (janela_feriado === null) return "Calendário indisponível para esta consulta.";
  const situacao = janela_feriado ? "Data próxima a feriado nacional" : "Sem feriado nacional próximo";
  return `${situacao} (fonte: ${fonte_calendario ?? "não informada"})`;
}

function descreverClima({ temperatura_max, fonte_clima }: Recomendacao["contexto"]) {
  if (temperatura_max === null) return "Previsão indisponível para esta data.";
  return `Máxima de ${temperatura_max}°C (fonte: ${fonte_clima ?? "não informada"})`;
}

export function ResultadoRecomendacao({ recomendacao, localSugerido }: ResultadoRecomendacaoProps) {
  const [aprovacao, setAprovacao] = useState<EventoAprovado | null>(null);
  const [aprovando, setAprovando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const { contexto, componentes } = recomendacao;

  const handleAprovar = async () => {
    setAprovando(true);
    setErro(null);
    try {
      setAprovacao(await aprovarEvento(recomendacao.evento_id));
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setAprovando(false);
    }
  };

  return (
    <div className="bg-background rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="bg-tertiary/35 px-6 py-4 border-b border-border flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-foreground">
          Plano de Evento Recomendado
        </span>
        <span className="px-3 py-1 rounded-full bg-secondary text-white text-xs font-bold">
          {recomendacao.afinidade_pontos === null
            ? "Sem dados suficientes"
            : `${recomendacao.afinidade_pontos} pontos de afinidade`}
        </span>
      </div>

      <div className="p-6 space-y-5">
        <div>
          <h3 className="text-xl font-bold text-foreground">{recomendacao.titulo}</h3>
          {recomendacao.justificativa && (
            <p className="text-sm text-gray-600 mt-1">{recomendacao.justificativa}</p>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2">
          {(Object.keys(ROTULOS_COMPONENTES) as (keyof ComponentesScore)[]).map((chave) => (
            <div key={chave} className="rounded-lg bg-muted border border-border p-2 text-center">
              <p className="text-[11px] text-gray-500">
                {chave} • {ROTULOS_COMPONENTES[chave]}
              </p>
              <p className="text-sm font-bold">
                {componentes[chave] === null ? "indisponível" : componentes[chave].toFixed(2)}
              </p>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-gray-500">
          Cobertura dos pesos: {Math.round(recomendacao.cobertura_pesos * 100)}% • Escala:{" "}
          {recomendacao.escala} • Regra {recomendacao.versao_regra}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <OriginBanner
            variante="laranja"
            icone={<Calendar className="w-4 h-4" />}
            titulo="Contexto Sazonal (BrasilAPI)"
            descricao={descreverCalendario(contexto)}
          />
          <OriginBanner
            variante="petroleo"
            icone={<CloudSun className="w-4 h-4" />}
            titulo="Previsão Climática (Open-Meteo)"
            descricao={descreverClima(contexto)}
          />
        </div>

        <div className="border-t border-border pt-4 space-y-2.5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 flex items-center gap-2">
              <Store className="w-4 h-4" /> Local Estratégico:
            </span>
            <span className="font-medium">{localSugerido}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 flex items-center gap-2">
              <Users className="w-4 h-4" /> Público Estimado:
            </span>
            <span className="font-medium">
              {recomendacao.publico_estimado === null
                ? "Não estimado"
                : `${recomendacao.publico_estimado} visitantes`}
            </span>
          </div>
        </div>

        {erro && (
          <p role="alert" className="text-xs text-destructive">
            {erro}
          </p>
        )}

        {aprovacao ? (
          <div className="p-4 rounded-xl bg-muted border border-secondary/40 flex items-center gap-4">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(
                aprovacao.checkin_url
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
                QR Code pronto para exibição nos totens do <strong>{localSugerido}</strong>.
              </p>
              <a
                href={aprovacao.checkin_url}
                className="inline-block text-xs font-semibold text-primary underline hover:opacity-80"
              >
                Abrir Portal do Visitante →
              </a>
            </div>
          </div>
        ) : (
          <button
            onClick={handleAprovar}
            disabled={aprovando}
            className="w-full bg-secondary hover:opacity-95 disabled:opacity-60 text-white font-semibold py-3 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition"
          >
            {aprovando ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
            Aprovar Plano e Gerar QR Code de Check-in
          </button>
        )}
      </div>
    </div>
  );
}
