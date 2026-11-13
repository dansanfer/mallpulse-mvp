import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  CheckCircle2,
  MapPin,
  Sparkles,
  ArrowLeft,
  Loader2,
  CalendarDays,
  Clock,
} from "lucide-react";
import {
  obterTokenVisitante,
  registrarCheckin,
  type CheckinResponse,
} from "../services/api";

const EXPERIENCIAS = [
  "Shows & Música",
  "Gastronomia & Grill",
  "Moda & Estilo",
  "Tecnologia & Games",
  "Esportes",
  "Eventos em Família",
];

const PROXIMOS_EVENTOS = [
  {
    id: "evt-2",
    titulo: "Oficina de Robótica Kids",
    categoria: "Família & Educação",
    data: "Amanhã • 15h00",
    local: "Praça Central",
    corTag: "bg-secondary/15 text-secondary",
  },
  {
    id: "evt-3",
    titulo: "Feira de Cafés Especiais",
    categoria: "Gastronomia",
    data: "Domingo • 10h às 18h",
    local: "Boulevard Gourmet",
    corTag: "bg-tertiary/60 text-foreground",
  },
  {
    id: "evt-4",
    titulo: "Sunset Acoustic & Vinho",
    categoria: "Música ao Vivo",
    data: "Sexta • 19h30",
    local: "Terraço L3",
    corTag: "bg-primary/15 text-primary",
  },
];

export function CheckinPage() {
  const { eventoId } = useParams();
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
    try {
      const token = obterTokenVisitante();
      const res = await registrarCheckin({
        evento_id: eventoId || "evento-01",
        visitante_token: token,
        interesses,
      });
      setResposta(res);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col items-center justify-center p-4">
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
          <div className="rounded-2xl overflow-hidden border border-border">
            <div className="bg-gradient-to-r from-primary to-secondary p-5 text-white">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-medium mb-2">
                Acontecendo Agora • Música & Grill
              </span>
              <h1 className="text-xl font-bold leading-snug">
                Festival Rock Clássico & Grill
              </h1>
              <p className="text-xs text-white/90 flex items-center gap-1 mt-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Corredor L2 • Entrada Gratuita
              </p>
            </div>
          </div>

          {/* Ação Principal (1 toque, sem cupom) */}
          {!resposta ? (
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
                  <span className="text-sm flex items-center gap-1.5">
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
            <div className="p-4 rounded-2xl bg-secondary/10 border border-secondary text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-secondary font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                {resposta.status === "confirmado"
                  ? "Presença Confirmada!"
                  : "Check-in Já Registrado"}
              </div>
              <p className="text-xs text-gray-600">{resposta.mensagem}</p>
            </div>
          )}

          {/* Preferências Rápidas */}
          <div className="pt-3 border-t border-border">
            <p className="text-xs font-semibold text-foreground mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              O que você mais curte ver por aqui?
            </p>
            <div className="flex flex-wrap gap-1.5">
              {EXPERIENCIAS.map((exp) => {
                const ativo = interesses.includes(exp);
                return (
                  <button
                    type="button"
                    key={exp}
                    onClick={() => toggleInteresse(exp)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
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
              <span className="text-[11px] text-gray-400">Agenda</span>
            </div>

            <div className="space-y-2">
              {PROXIMOS_EVENTOS.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-xl bg-muted/70 border border-border flex items-start justify-between gap-2"
                >
                  <div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold mb-1 ${ev.corTag}`}
                    >
                      {ev.categoria}
                    </span>
                    <h3 className="text-xs font-bold text-foreground">
                      {ev.titulo}
                    </h3>
                    <div className="flex items-center gap-2.5 text-[11px] text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {ev.data}
                      </span>
                      <span>• {ev.local}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-center text-gray-400 pt-1">
            MallPulse • Experiência Inteligente no Shopping
          </p>
        </div>
      </div>

      {/* Link discreto para voltar ao painel do gestor durante a demo */}
      <Link
        to="/"
        className="mt-4 text-xs text-gray-500 hover:text-foreground flex items-center gap-1"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Voltar para o Painel do Gestor
      </Link>
    </div>
  );
}