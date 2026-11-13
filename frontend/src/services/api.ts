// Troque para false quando o backend Ruby estiver rodando!
export const USAR_MOCK = true;
const API_URL = "http://localhost:9292/api/v1";

export interface RecomendacaoRequest {
  objetivo: string;
  publico_alvo: string;
  lojistas: string[];
  periodo: string;
}

export interface RecomendacaoResponse {
  modo: string;
  titulo: string;
  ambiente: string;
  local_sugerido: string;
  publico_estimado: number;
  afinidade_pontos: number;
  justificativa: string;
  lojistas_indicados: string[];
  contexto: {
    clima: string;
    calendario: string;
  };
}

export async function gerarRecomendacao(
  dados: RecomendacaoRequest
): Promise<RecomendacaoResponse> {
  if (USAR_MOCK) {
    // Simula o tempo de consulta nas APIs (BrasilAPI + Open-Meteo + Gemini)
    await new Promise((resolve) => setTimeout(resolve, 900));

    return {
      modo: "simulacao",
      titulo: "Festival Rock Clássico & Grill Artesanal",
      ambiente: "Indoor",
      local_sugerido: "Corredor L2 (Próximo às lojas parceiras)",
      publico_estimado: 680,
      afinidade_pontos: 92,
      justificativa:
        "Cruzamento identificou queda sazonal pós-Dia dos Pais (-24% fluxo masculino) combinada com alta afinidade de homens 30-60 anos por música ao vivo e gastronomia.",
      lojistas_indicados: dados.lojistas,
      contexto: {
        clima: "Open-Meteo: Sábado 26°C • Ideal para área gourmet",
        calendario: "BrasilAPI: Período pós-data comemorativa detectado",
      },
    };
  }

  // Chamada real para o backend Ruby + Grape quando estiver no ar
  const response = await fetch(`${API_URL}/recomendar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  return response.json();
}

export interface CheckinRequest {
  evento_id: string;
  visitante_token: string;
  interesses: string[];
}

export interface CheckinResponse {
  status: "confirmado" | "ja_registrado";
  mensagem: string;
}

// Gera ou recupera um token único anônimo do navegador do visitante
export function obterTokenVisitante(): string {
  const chave = "mallpulse_visitor_token";
  let token = localStorage.getItem(chave);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(chave, token);
  }
  return token;
}

export async function registrarCheckin(
  dados: CheckinRequest
): Promise<CheckinResponse> {
  if (USAR_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Simula a regra de idempotência (1 check-in por token e evento)
    const chaveEvento = `checkin_${dados.evento_id}_${dados.visitante_token}`;
    if (localStorage.getItem(chaveEvento)) {
      return {
        status: "ja_registrado",
        mensagem: "Sua presença já está confirmada neste evento.",
      };
    }

    localStorage.setItem(chaveEvento, "true");
    return {
      status: "confirmado",
      mensagem: "Presença confirmada! Aproveite o evento no shopping.",
    };
  }

  const response = await fetch(`${API_URL}/checkin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  return response.json();
}

// ==========================================
// DADOS MASSIVOS PARA PAINEL, LOJAS E RELATÓRIOS
// ==========================================

export interface EventoHistorico {
  id: string;
  objetivo: string;
  evento: string;
  publico: string;
  lojas: string[];
  checkins: number;
  estimado: number;
  aderencia: number;
  data: string;
}

export interface Lojista {
  id: string;
  nome: string;
  segmento: string;
  piso: string;
  tags_publico: string[];
  eventos_participados: number;
  ativo: boolean;
}

export const MOCK_GRAFICO_OBJETIVOS = [
  { objetivo: "Moda Masculina", estimado: 600, realizado: 680, aderencia: 94 },
  { objetivo: "Praça Alimentação", estimado: 950, realizado: 1120, aderencia: 91 },
  { objetivo: "Famílias (Domingo)", estimado: 800, realizado: 740, aderencia: 85 },
  { objetivo: "Corredor Piso L2", estimado: 450, realizado: 510, aderencia: 89 },
  { objetivo: "Público Jovem", estimado: 700, realizado: 660, aderencia: 82 },
];

export const MOCK_HISTORICO_EVENTOS: EventoHistorico[] = [
  {
    id: "EVT-104",
    objetivo: "Reativar Moda Masculina (Pós-Dia dos Pais)",
    evento: "Festival Rock Clássico & Grill Artesanal",
    publico: "Homens • 30 a 60 anos",
    lojas: ["Artigos Masculinos", "Barbearia VIP", "Cervejaria Artesanal"],
    checkins: 680,
    estimado: 600,
    aderencia: 94,
    data: "12/09/2026",
  },
  {
    id: "EVT-103",
    objetivo: "Aumentar fluxo na Praça de Alimentação",
    evento: "Noite Gastronômica & Jazz Acústico",
    publico: "Casais e Adultos • 25 a 50 anos",
    lojas: ["Praça de Alimentação", "Empório do Vinho"],
    checkins: 1120,
    estimado: 950,
    aderencia: 91,
    data: "29/08/2026",
  },
  {
    id: "EVT-102",
    objetivo: "Atrair famílias no domingo à tarde",
    evento: "Oficina de Robótica & Teatro Infantil",
    publico: "Famílias com Crianças • 25 a 45 anos",
    lojas: ["Moda Infantil", "Livraria & Papelaria", "Sorveteria"],
    checkins: 740,
    estimado: 800,
    aderencia: 85,
    data: "16/08/2026",
  },
  {
    id: "EVT-101",
    objetivo: "Movimentar corredor do Piso L2",
    evento: "Arena eSports & Torneio EA FC",
    publico: "Jovens Universitários • 18 a 25 anos",
    lojas: ["Eletrônicos & Games", "Fast Food", "Moda Street"],
    checkins: 510,
    estimado: 450,
    aderencia: 89,
    data: "02/08/2026",
  },
  {
    id: "EVT-100",
    objetivo: "Fluxo em dia chuvoso (Alerta Open-Meteo)",
    evento: "Festival de Cafés Especiais & Leitura",
    publico: "Público Geral • 25 a 60 anos",
    lojas: ["Cafeteria Gourmet", "Livraria & Papelaria"],
    checkins: 490,
    estimado: 420,
    aderencia: 92,
    data: "19/07/2026",
  },
];

export const MOCK_LOJISTAS: Lojista[] = [
  {
    id: "LOJ-01",
    nome: "VR & Alfaiataria Masculina",
    segmento: "Artigos Masculinos",
    piso: "Piso L2 • Ala Norte",
    tags_publico: ["Homens 30-60", "Executivo", "Moda"],
    eventos_participados: 5,
    ativo: true,
  },
  {
    id: "LOJ-02",
    nome: "Barbearia Cavalheiros VIP",
    segmento: "Barbearia VIP",
    piso: "Piso L2 • Ala Norte",
    tags_publico: ["Homens 30-60", "Jovens 18-25", "Estilo"],
    eventos_participados: 7,
    ativo: true,
  },
  {
    id: "LOJ-03",
    nome: "Mestre Cervejeiro & Grill",
    segmento: "Cervejaria Artesanal",
    piso: "Boulevard Gourmet",
    tags_publico: ["Homens 30-60", "Gastronomia", "Música"],
    eventos_participados: 9,
    ativo: true,
  },
  {
    id: "LOJ-04",
    nome: "Mundo Kids & Brinquedos",
    segmento: "Moda Infantil",
    piso: "Piso L1 • Praça Central",
    tags_publico: ["Famílias", "Crianças", "Fim de Semana"],
    eventos_participados: 6,
    ativo: true,
  },
  {
    id: "LOJ-05",
    nome: "TechZone Games & Hardware",
    segmento: "Eletrônicos & Games",
    piso: "Piso L2 • Ala Sul",
    tags_publico: ["Jovens 18-25", "Tecnologia", "Games"],
    eventos_participados: 4,
    ativo: true,
  },
  {
    id: "LOJ-06",
    nome: "Grão Nobre Cafeteria",
    segmento: "Praça de Alimentação",
    piso: "Piso L1 • Praça Alimentação",
    tags_publico: ["Todos os Públicos", "Dias Chuvosos", "Café"],
    eventos_participados: 11,
    ativo: true,
  },
];