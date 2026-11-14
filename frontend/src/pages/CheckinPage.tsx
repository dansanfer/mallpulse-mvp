import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import {
  CheckCircle2,
  MapPin,
  Sparkles,
  Loader2,
  CalendarDays,
  Clock,
} from "lucide-react";
import {
  ApiError,
  listarEventosPublicos,
  mensagemErro,
  obterEventoPublico,
  obterTokenVisitante,
  registrarCheckin,
  type CheckinResponse,
} from "../services/api";
import { useRequisicao } from "../hooks/useRequisicao";

const EXPERIENCIAS = [
  "Shows & Música",
  "Gastronomia & Grill",
  "Moda & Estilo",
  "Tecnologia & Games",
  "Esportes",
  "Eventos em Família",
];

const formatarInicio = (inicio: string) =>
  new Date(inicio).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

export function CheckinPage() {
  const { eventoId = "" } = useParams();
  const buscarEvento = useCallback(
    () =>
      obterEventoPublico(eventoId).catch((e) => {
        throw e instanceof ApiError && e.status === 404 ? new Error("Evento indisponível") : e;
      }),
    [eventoId]
  );
  const evento = useRequisicao(buscarEvento);
  const agenda = useRequisicao(listarEventosPublicos);
  const proximosEventos = agenda.dados?.filter((ev) => ev.id !== eventoId) ?? [];
  const [erroCheckin, setErroCheckin] = useState<string>();
  const [interesses, setInteresses] = useState<string[]>([
    "Shows & Música",
    "Gastronomia & Grill",
  ]);
  const [carregando, setCarregando] = useState(false);
  const [resposta, setResposta] = useState<CheckinResponse | null>(null);

  const toggleInteresse = (item: string) => {
    setInteresses((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleConfirmar = async () => {
    setCarregando(true);
    setErroCheckin(undefined);
    try {
      const token = await obterTokenVisitante();
      setResposta(await registrarCheckin(eventoId, token, interesses));
    } catch (e) {
      setErroCheckin(mensagemErro(e));
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col items-center justify-center px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      {/* Moldura Mobile (390px) */}
      <div className="w-full max-w-[390px] bg-background rounded-3xl border border-border shadow-lg overflow-hidden">
        {/* Topo Minimalista */}
        <header className="px-5 py-4 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary text-white font-bold flex items-center justify-center text-sm">
              M
            </div>
            <span className="font-bold text-foreground text-sm">
              Shopping Plaza
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-tertiary/50 text-foreground text-[11px] font-semibold">
            Portal do Visitante
          </span>
        </header>

        <div className="p-5 space-y-5">
          {/* Card do Evento Atual */}
          {evento.dados ? (
            <div className="rounded-2xl overflow-hidden border border-border">
              <div className="bg-gradient-to-r from-primary to-secondary p-5 text-white">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-medium mb-2">
                  {evento.dados.categoria} • {formatarInicio(evento.dados.inicio)}
                </span>
                <h1 className="text-xl font-bold leading-snug tracking-tight">{evento.dados.titulo}</h1>
                <p className="text-xs text-white/90 flex items-center gap-1 mt-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {evento.dados.local} • Entrada Gratuita
                </p>
              </div>
            </div>
          ) : (
            <p role="status" className="p-4 rounded-2xl bg-muted text-center text-sm text-gray-600">
              {evento.carregando ? "Carregando evento..." : evento.erro}
            </p>
          )}

          {/* Ação Principal (1 toque, sem cupom) */}
          {!evento.dados ? null : !resposta ? (
            <button
              onClick={handleConfirmar}
              disabled={carregando}
              className="w-full bg-primary hover:opacity-95 text-white font-bold py-4 px-5 rounded-2xl shadow-sm transition flex flex-col items-center justify-center"
            >
              {carregando ? (
                <span className="flex items-center gap-2 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Registrando Presença...
                </span>
              ) : (
                <>
                  <span className="text-base flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Confirmar Minha Presença
                  </span>
                  <span className="text-[11px] font-normal text-white/85 mt-0.5">
                    Check-in rápido em 1 toque • Sem cadastro
                  </span>
                </>
              )}
            </button>
          ) : (
            <div role="status" className="p-4 rounded-2xl bg-secondary/10 border border-secondary text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-secondary font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                {resposta.status === "confirmado"
                  ? "Presença Confirmada!"
                  : "Check-in Já Registrado"}
              </div>
              <p className="text-xs text-gray-600">{resposta.mensagem}</p>
            </div>
          )}

          {erroCheckin && (
            <p role="alert" className="text-xs text-center text-destructive">
              {erroCheckin}
            </p>
          )}

          {/* Preferências Rápidas */}
          <div className="pt-3 border-t border-border">
            <p className="text-xs font-semibold text-foreground mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              O que você mais curte ver por aqui?
            </p>
            <div className="flex flex-wrap gap-2">
              {EXPERIENCIAS.map((exp) => {
                const ativo = interesses.includes(exp);
                return (
                  <button
                    type="button"
                    key={exp}
                    aria-pressed={ativo}
                    onClick={() => toggleInteresse(exp)}
                    className={`h-11 px-3.5 rounded-full text-sm font-medium transition ${
                      ativo
                        ? "bg-secondary text-white"
                        : "bg-muted text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {exp}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Próximos Eventos Variados */}
          <div className="pt-3 border-t border-border space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-secondary" />
                Próximos Eventos no Shopping
              </p>
              <span className="text-[11px] text-gray-500">Agenda</span>
            </div>

            <div className="space-y-2">
              {proximosEventos.length === 0 && !agenda.carregando && (
                <p className="text-[11px] text-gray-500">Nenhum outro evento agendado.</p>
              )}
              {proximosEventos.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-xl bg-muted/70 border border-border flex items-start justify-between gap-2"
                >
                  <div>
                    <span
                      className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold mb-1 bg-primary/15 text-primary"
                    >
                      {ev.categoria}
                    </span>
                    <h3 className="text-xs font-bold text-foreground">
                      {ev.titulo}
                    </h3>
                    <div className="flex items-center gap-2.5 text-[11px] text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatarInicio(ev.inicio)}
                      </span>
                      <span>• {ev.local}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-center text-gray-500 pt-1">
            MallPulse • Experiência Inteligente no Shopping
          </p>
        </div>
      </div>
    </div>
  );
}