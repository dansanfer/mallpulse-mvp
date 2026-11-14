import { supabase } from "../lib/supabase";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:9292/api/v1";
const CHAVE_TOKEN_VISITANTE = "mallpulse_visitor_token";

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export function mensagemErro(erro: unknown): string {
  return erro instanceof Error ? erro.message : "Erro inesperado.";
}

interface OpcoesRequisicao {
  method?: "GET" | "POST";
  body?: unknown;
  auth?: boolean;
}

async function obterTokenSessao(): Promise<string> {
  const { data } = (await supabase?.auth.getSession()) ?? {};
  const token = data?.session?.access_token;
  if (!token) throw new ApiError("unauthorized", "Sessão expirada. Entre novamente.", 401);
  return token;
}

async function request<T>(
  path: string,
  { method = "GET", body, auth = false }: OpcoesRequisicao = {}
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) headers.Authorization = `Bearer ${await obterTokenSessao()}`;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("network_error", "Não foi possível conectar ao servidor.", 0);
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new ApiError(
      payload?.error?.code ?? "erro_desconhecido",
      payload?.error?.message ?? "Erro ao processar a requisição.",
      response.status
    );
  }
  return response.json();
}

// ---------- Lojistas ----------

export interface Lojista {
  id: string;
  nome: string;
  segmento: string;
  piso: string;
  tags_publico: string[];
  eventos_participados: number;
  ativo: boolean;
}

export interface NovoLojista {
  nome: string;
  segmento: string;
  piso: string;
  tags_publico: string[];
}

export const listarLojistas = () => request<Lojista[]>("/lojistas", { auth: true });

export const criarLojista = (dados: NovoLojista) =>
  request<Lojista>("/lojistas", { method: "POST", body: dados, auth: true });

// ---------- Recomendação e eventos ----------

export type Ambiente = "Indoor" | "Outdoor";

export interface RecomendacaoRequest {
  objetivo: string;
  publico_alvo: string;
  tags_publico: string[];
  lojista_ids: string[];
  data: string;
  categoria: string;
  ambiente: Ambiente;
  local_sugerido: string;
}

export interface ComponentesScore {
  H: number | null;
  L: number | null;
  C: number | null;
  S: number | null;
}

export interface Recomendacao {
  evento_id: string;
  titulo: string;
  justificativa?: string;
  status: string;
  ambiente: Ambiente;
  lojistas_indicados: { referencia: string; nome: string; confirmado: boolean }[];
  afinidade_pontos: number | null;
  escala: string;
  componentes: ComponentesScore;
  cobertura_pesos: number;
  amostra_historica: number;
  historico_simulado: boolean;
  versao_regra: string;
  publico_estimado: number | null;
  metodo_estimativa: string | null;
  contexto: {
    fonte_clima: string | null;
    temperatura_max: number | null;
    fonte_calendario: string | null;
    janela_feriado: boolean | null;
  };
}

export interface RecomendacaoResponse {
  modo: string;
  objetivo: string;
  publico_alvo: string;
  recomendacao: Recomendacao;
}

export interface EventoAprovado {
  id: string;
  status: string;
  checkin_url: string;
}

export const gerarRecomendacao = (dados: RecomendacaoRequest) =>
  request<RecomendacaoResponse>("/recomendacoes", { method: "POST", body: dados, auth: true });

export const aprovarEvento = (eventoId: string) =>
  request<EventoAprovado>(`/eventos/${eventoId}/aprovar`, { method: "POST", auth: true });

export interface EventoPublico {
  id: string;
  titulo: string;
  categoria: string;
  inicio: string;
  fim: string;
  local: string;
}

export const listarEventosPublicos = () => request<EventoPublico[]>("/eventos/publicos");

export const obterEventoPublico = (eventoId: string) =>
  request<EventoPublico>(`/eventos/${eventoId}/publico`);

// ---------- Visitante ----------

export interface CheckinResponse {
  status: "confirmado" | "ja_registrado";
  mensagem: string;
}

// Token anônimo emitido pelo backend e guardado no navegador do visitante.
export async function obterTokenVisitante(): Promise<string> {
  const salvo = localStorage.getItem(CHAVE_TOKEN_VISITANTE);
  if (salvo) return salvo;
  const { token } = await request<{ token: string }>("/visitantes/token", { method: "POST" });
  localStorage.setItem(CHAVE_TOKEN_VISITANTE, token);
  return token;
}

export const registrarCheckin = (eventoId: string, token: string, interesses: string[]) =>
  request<CheckinResponse>(`/eventos/${eventoId}/checkins`, {
    method: "POST",
    body: { token, interesses },
  });

// ---------- Painel ----------

export interface EventoHistorico {
  id: string;
  objetivo: string;
  evento: string;
  publico: string;
  lojas: string[];
  checkins: number;
  estimado: number | null;
  aderencia: number | null;
  data: string;
  simulado: boolean;
}

export interface ObjetivoResultado {
  objetivo: string;
  estimado: number;
  realizado: number;
  aderencia: number | null;
  simulado: boolean;
}

export const obterHistorico = () => request<EventoHistorico[]>("/painel/historico", { auth: true });

export const obterGraficoObjetivos = () =>
  request<ObjetivoResultado[]>("/painel/objetivos", { auth: true });
