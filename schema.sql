-- MallPulse | DDL de planejamento | PostgreSQL
-- Validar em ambiente isolado antes de aplicar.

CREATE TABLE lojistas_parceiros (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 nome_loja TEXT NOT NULL,
 segmento TEXT NOT NULL,
 tags_publico_alvo TEXT[] NOT NULL DEFAULT '{}',
 ativo BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE campanhas_objetivos (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 descricao_objetivo TEXT NOT NULL,
 publico_alvo TEXT NOT NULL,
 tags_publico_alvo TEXT[] NOT NULL DEFAULT '{}',
 periodo_inicio DATE NOT NULL,
 periodo_fim DATE NOT NULL CHECK (periodo_fim >= periodo_inicio),
 status TEXT NOT NULL DEFAULT 'Ativo'
  CHECK (status IN ('Ativo','Concluido','Pausado')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE contextos_consultados (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 data_referencia DATE NOT NULL,
 localizacao TEXT NOT NULL,
 latitude NUMERIC(9,6) NOT NULL CHECK (latitude BETWEEN -90 AND 90),
 longitude NUMERIC(9,6) NOT NULL CHECK (longitude BETWEEN -180 AND 180),
 fonte TEXT NOT NULL,
 consultado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 natureza TEXT NOT NULL CHECK
  (natureza IN ('previsao','observado','calendario','simulado')),
 temperatura_max NUMERIC(5,2),
 probabilidade_chuva NUMERIC(5,2)
  CHECK (probabilidade_chuva BETWEEN 0 AND 100),
 nome_feriado TEXT,
 dados_origem JSONB NOT NULL DEFAULT '{}',
 versao_regra TEXT NOT NULL
);
CREATE TABLE eventos_sugeridos (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 campanha_id UUID NOT NULL REFERENCES campanhas_objetivos
  ON DELETE RESTRICT,
 titulo_sugerido TEXT NOT NULL,
 categoria TEXT NOT NULL,
 publico_alvo TEXT NOT NULL,
 ambiente TEXT NOT NULL CHECK (ambiente IN ('Indoor','Outdoor')),
 local_sugerido TEXT NOT NULL,
 inicio TIMESTAMPTZ NOT NULL,
 fim TIMESTAMPTZ NOT NULL CHECK (fim > inicio),
 publico_estimado INTEGER CHECK (publico_estimado >= 0),
 metodo_estimativa TEXT,
 contagem_organizador INTEGER CHECK (contagem_organizador >= 0),
 fonte_contagem TEXT,
 status TEXT NOT NULL DEFAULT 'Planejado' CHECK
  (status IN ('Planejado','Aprovado','Ao Vivo','Concluido','Cancelado')),
 simulado BOOLEAN NOT NULL DEFAULT FALSE,
 qr_code_url TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE eventos_lojistas (
 evento_id UUID NOT NULL REFERENCES eventos_sugeridos ON DELETE RESTRICT,
 lojista_id UUID NOT NULL REFERENCES lojistas_parceiros ON DELETE RESTRICT,
 tipo_participacao TEXT NOT NULL,
 confirmado BOOLEAN NOT NULL DEFAULT FALSE,
 PRIMARY KEY (evento_id, lojista_id)
);
CREATE TABLE eventos_contextos (
 evento_id UUID NOT NULL REFERENCES eventos_sugeridos ON DELETE RESTRICT,
 contexto_id UUID NOT NULL REFERENCES contextos_consultados ON DELETE RESTRICT,
 PRIMARY KEY (evento_id, contexto_id)
);
CREATE TABLE recomendacoes (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 evento_id UUID NOT NULL REFERENCES eventos_sugeridos ON DELETE RESTRICT,
 gerada_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 origem TEXT NOT NULL CHECK (origem IN ('regras','gemini','simulado')),
 versao_regra TEXT NOT NULL,
 modelo_ia TEXT,
 entradas JSONB NOT NULL,
 justificativa TEXT NOT NULL,
 componentes_score JSONB NOT NULL,
 score NUMERIC(5,2) CHECK (score BETWEEN 0 AND 100),
 peso_disponivel NUMERIC(4,3) NOT NULL
  CHECK (peso_disponivel BETWEEN 0 AND 1),
 amostra_historica INTEGER NOT NULL CHECK (amostra_historica >= 0),
 CONSTRAINT score_com_evidencia CHECK
  (peso_disponivel > 0 OR score IS NULL)
);
CREATE TABLE interacoes_visitantes (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 evento_id UUID NOT NULL REFERENCES eventos_sugeridos ON DELETE RESTRICT,
 visitante_token_hash TEXT NOT NULL,
 interesses_selecionados TEXT[] NOT NULL DEFAULT '{}',
 confirmado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 UNIQUE (evento_id, visitante_token_hash),
 UNIQUE (id, evento_id)
);
CREATE VIEW publico_realizado_checkins AS
 SELECT e.id AS evento_id, COUNT(i.id) AS checkins_unicos_token
 FROM eventos_sugeridos e
 LEFT JOIN interacoes_visitantes i ON i.evento_id = e.id
 GROUP BY e.id;
CREATE TABLE conversoes_comerciais (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 interacao_id UUID NOT NULL,
 evento_id UUID NOT NULL,
 lojista_id UUID NOT NULL,
 cupom_id TEXT NOT NULL,
 tipo TEXT NOT NULL CHECK
  (tipo IN ('ativacao','resgate_confirmado','venda_confirmada')),
 origem TEXT NOT NULL,
 identificador_externo TEXT,
 valor_estimado NUMERIC(10,2) CHECK (valor_estimado >= 0),
 valor_confirmado NUMERIC(10,2) CHECK (valor_confirmado >= 0),
 registrado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 confirmado_em TIMESTAMPTZ,
 FOREIGN KEY (interacao_id, evento_id)
  REFERENCES interacoes_visitantes (id, evento_id) ON DELETE RESTRICT,
 FOREIGN KEY (evento_id, lojista_id)
  REFERENCES eventos_lojistas (evento_id, lojista_id) ON DELETE RESTRICT,
 UNIQUE (evento_id, lojista_id, cupom_id, tipo),
 CHECK (tipo = 'ativacao' OR
  (confirmado_em IS NOT NULL AND identificador_externo IS NOT NULL)),
 CHECK (tipo <> 'venda_confirmada' OR valor_confirmado IS NOT NULL)
);
