-- MallPulse: substitui o modelo v0 (vazio) pelo schema atual. Rodar UMA vez no SQL Editor do Supabase.
BEGIN;
DROP TABLE IF EXISTS public.conversoes_comerciais, public.interacoes_visitantes, public.eventos_lojistas, public.eventos_contextos, public.recomendacoes, public.eventos_sugeridos, public.contexto_diario, public.contextos_consultados, public.campanhas_objetivos, public.lojistas_parceiros, public.schema_info CASCADE;
DROP VIEW IF EXISTS public.publico_realizado_checkins;
CREATE TABLE public.campanhas_objetivos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    descricao_objetivo text NOT NULL,
    publico_alvo text NOT NULL,
    tags_publico_alvo text[] DEFAULT '{}'::text[] NOT NULL,
    periodo_inicio date NOT NULL,
    periodo_fim date NOT NULL,
    status text DEFAULT 'Ativo'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT campanhas_objetivos_check CHECK ((periodo_fim >= periodo_inicio)),
    CONSTRAINT campanhas_objetivos_status_check CHECK ((status = ANY (ARRAY['Ativo'::text, 'Concluido'::text, 'Pausado'::text])))
);
CREATE TABLE public.contextos_consultados (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    data_referencia date NOT NULL,
    localizacao text NOT NULL,
    latitude numeric(9,6) NOT NULL,
    longitude numeric(9,6) NOT NULL,
    fonte text NOT NULL,
    consultado_em timestamp with time zone DEFAULT now() NOT NULL,
    natureza text NOT NULL,
    temperatura_max numeric(5,2),
    probabilidade_chuva numeric(5,2),
    nome_feriado text,
    dados_origem jsonb DEFAULT '{}'::jsonb NOT NULL,
    versao_regra text NOT NULL,
    CONSTRAINT contextos_consultados_latitude_check CHECK (((latitude >= ('-90'::integer)::numeric) AND (latitude <= (90)::numeric))),
    CONSTRAINT contextos_consultados_longitude_check CHECK (((longitude >= ('-180'::integer)::numeric) AND (longitude <= (180)::numeric))),
    CONSTRAINT contextos_consultados_natureza_check CHECK ((natureza = ANY (ARRAY['previsao'::text, 'observado'::text, 'calendario'::text, 'simulado'::text]))),
    CONSTRAINT contextos_consultados_probabilidade_chuva_check CHECK (((probabilidade_chuva >= (0)::numeric) AND (probabilidade_chuva <= (100)::numeric)))
);
CREATE TABLE public.conversoes_comerciais (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    interacao_id uuid NOT NULL,
    evento_id uuid NOT NULL,
    lojista_id uuid NOT NULL,
    cupom_id text NOT NULL,
    tipo text NOT NULL,
    origem text NOT NULL,
    identificador_externo text,
    valor_estimado numeric(10,2),
    valor_confirmado numeric(10,2),
    registrado_em timestamp with time zone DEFAULT now() NOT NULL,
    confirmado_em timestamp with time zone,
    CONSTRAINT conversoes_comerciais_check CHECK (((tipo = 'ativacao'::text) OR ((confirmado_em IS NOT NULL) AND (identificador_externo IS NOT NULL)))),
    CONSTRAINT conversoes_comerciais_check1 CHECK (((tipo <> 'venda_confirmada'::text) OR (valor_confirmado IS NOT NULL))),
    CONSTRAINT conversoes_comerciais_tipo_check CHECK ((tipo = ANY (ARRAY['ativacao'::text, 'resgate_confirmado'::text, 'venda_confirmada'::text]))),
    CONSTRAINT conversoes_comerciais_valor_confirmado_check CHECK ((valor_confirmado >= (0)::numeric)),
    CONSTRAINT conversoes_comerciais_valor_estimado_check CHECK ((valor_estimado >= (0)::numeric))
);
CREATE TABLE public.eventos_contextos (
    evento_id uuid NOT NULL,
    contexto_id uuid NOT NULL
);
CREATE TABLE public.eventos_lojistas (
    evento_id uuid NOT NULL,
    lojista_id uuid NOT NULL,
    tipo_participacao text NOT NULL,
    confirmado boolean DEFAULT false NOT NULL
);
CREATE TABLE public.eventos_sugeridos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    campanha_id uuid NOT NULL,
    titulo_sugerido text NOT NULL,
    categoria text NOT NULL,
    publico_alvo text NOT NULL,
    ambiente text NOT NULL,
    local_sugerido text NOT NULL,
    inicio timestamp with time zone NOT NULL,
    fim timestamp with time zone NOT NULL,
    publico_estimado integer,
    metodo_estimativa text,
    contagem_organizador integer,
    fonte_contagem text,
    status text DEFAULT 'Planejado'::text NOT NULL,
    simulado boolean DEFAULT false NOT NULL,
    qr_code_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT eventos_sugeridos_ambiente_check CHECK ((ambiente = ANY (ARRAY['Indoor'::text, 'Outdoor'::text]))),
    CONSTRAINT eventos_sugeridos_check CHECK ((fim > inicio)),
    CONSTRAINT eventos_sugeridos_contagem_organizador_check CHECK ((contagem_organizador >= 0)),
    CONSTRAINT eventos_sugeridos_publico_estimado_check CHECK ((publico_estimado >= 0)),
    CONSTRAINT eventos_sugeridos_status_check CHECK ((status = ANY (ARRAY['Planejado'::text, 'Aprovado'::text, 'Ao Vivo'::text, 'Concluido'::text, 'Cancelado'::text])))
);
CREATE TABLE public.interacoes_visitantes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    evento_id uuid NOT NULL,
    visitante_token_hash text NOT NULL,
    interesses_selecionados text[] DEFAULT '{}'::text[] NOT NULL,
    confirmado_em timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE public.lojistas_parceiros (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome_loja text NOT NULL,
    segmento text NOT NULL,
    tags_publico_alvo text[] DEFAULT '{}'::text[] NOT NULL,
    ativo boolean DEFAULT true NOT NULL,
    piso text DEFAULT ''::text NOT NULL
);
CREATE VIEW public.publico_realizado_checkins AS
 SELECT e.id AS evento_id,
    count(i.id) AS checkins_unicos_token
   FROM (public.eventos_sugeridos e
     LEFT JOIN public.interacoes_visitantes i ON ((i.evento_id = e.id)))
  GROUP BY e.id;
CREATE TABLE public.recomendacoes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    evento_id uuid NOT NULL,
    gerada_em timestamp with time zone DEFAULT now() NOT NULL,
    origem text NOT NULL,
    versao_regra text NOT NULL,
    modelo_ia text,
    entradas jsonb NOT NULL,
    justificativa text NOT NULL,
    componentes_score jsonb NOT NULL,
    score numeric(5,2),
    peso_disponivel numeric(4,3) NOT NULL,
    amostra_historica integer NOT NULL,
    CONSTRAINT recomendacoes_amostra_historica_check CHECK ((amostra_historica >= 0)),
    CONSTRAINT recomendacoes_origem_check CHECK ((origem = ANY (ARRAY['regras'::text, 'gemini'::text, 'simulado'::text]))),
    CONSTRAINT recomendacoes_peso_disponivel_check CHECK (((peso_disponivel >= (0)::numeric) AND (peso_disponivel <= (1)::numeric))),
    CONSTRAINT recomendacoes_score_check CHECK (((score >= (0)::numeric) AND (score <= (100)::numeric))),
    CONSTRAINT score_com_evidencia CHECK (((peso_disponivel > (0)::numeric) OR (score IS NULL)))
);
CREATE TABLE public.schema_info (
    version integer DEFAULT 0 NOT NULL
);
INSERT INTO public.lojistas_parceiros VALUES ('9686f27d-bbe0-401a-8131-5e1b85f19967', 'VR & Alfaiataria Masculina', 'Artigos Masculinos', '{"Homens 30-60",Executivo,Moda}', true, 'Piso L2 • Ala Norte');
INSERT INTO public.lojistas_parceiros VALUES ('5ae6e8ec-8920-40a6-9f65-a1c97e2258ce', 'Barbearia Cavalheiros VIP', 'Barbearia VIP', '{"Homens 30-60","Jovens 18-25",Estilo}', true, 'Piso L2 • Ala Norte');
INSERT INTO public.lojistas_parceiros VALUES ('e8ed294d-98f7-429d-b4f6-07ca344d2e66', 'Mestre Cervejeiro & Grill', 'Cervejaria Artesanal', '{"Homens 30-60",Gastronomia,Música}', true, 'Boulevard Gourmet');
INSERT INTO public.lojistas_parceiros VALUES ('37811ce6-1af9-47d4-b50b-7791f269b8a6', 'Mundo Kids & Brinquedos', 'Moda Infantil', '{Famílias,Crianças,"Fim de Semana"}', true, 'Piso L1 • Praça Central');
INSERT INTO public.lojistas_parceiros VALUES ('8ad17ebd-a3b3-4adc-ac67-7c27c8098b24', 'TechZone Games & Hardware', 'Eletrônicos & Games', '{"Jovens 18-25",Tecnologia,Games}', true, 'Piso L2 • Ala Sul');
INSERT INTO public.lojistas_parceiros VALUES ('70ee32ea-879e-4338-9e07-01275f9e629a', 'Grão Nobre Cafeteria', 'Praça de Alimentação', '{"Todos os Públicos","Dias Chuvosos",Café}', true, 'Piso L1 • Praça Alimentação');
INSERT INTO public.campanhas_objetivos VALUES ('e0645801-6721-4b8a-b18f-06f6e42615c5', 'Reativar Moda Masculina (Pós-Dia dos Pais)', 'Homens • 30 a 60 anos', '{}', '2026-09-12', '2026-09-12', 'Concluido', '2026-11-14 09:58:19.534277-03');
INSERT INTO public.campanhas_objetivos VALUES ('9ed7b3bd-84d9-4ca0-b9ba-583315a6b14b', 'Aumentar fluxo na Praça de Alimentação', 'Casais e Adultos • 25 a 50 anos', '{}', '2026-08-29', '2026-08-29', 'Concluido', '2026-11-14 09:58:19.534277-03');
INSERT INTO public.campanhas_objetivos VALUES ('97e6a4fb-f106-4eb9-ad14-06457bb5c9fa', 'Atrair famílias no domingo à tarde', 'Famílias com Crianças • 25 a 45 anos', '{}', '2026-08-16', '2026-08-16', 'Concluido', '2026-11-14 09:58:19.534277-03');
INSERT INTO public.campanhas_objetivos VALUES ('b9317318-b26b-4e9c-9af4-bacd9e67fbf4', 'Movimentar corredor do Piso L2', 'Jovens Universitários • 18 a 25 anos', '{}', '2026-08-02', '2026-08-02', 'Concluido', '2026-11-14 09:58:19.534277-03');
INSERT INTO public.campanhas_objetivos VALUES ('2f1dd5ad-18e2-4b04-a080-62b773060628', 'Fluxo em dia chuvoso (Alerta Open-Meteo)', 'Público Geral • 25 a 60 anos', '{}', '2026-07-19', '2026-07-19', 'Concluido', '2026-11-14 09:58:19.534277-03');
INSERT INTO public.eventos_lojistas VALUES ('dcfefee2-ef1d-43f9-bb14-8166fcada5b8', '9686f27d-bbe0-401a-8131-5e1b85f19967', 'indicado', true);
INSERT INTO public.eventos_lojistas VALUES ('dcfefee2-ef1d-43f9-bb14-8166fcada5b8', '5ae6e8ec-8920-40a6-9f65-a1c97e2258ce', 'indicado', true);
INSERT INTO public.eventos_lojistas VALUES ('dcfefee2-ef1d-43f9-bb14-8166fcada5b8', 'e8ed294d-98f7-429d-b4f6-07ca344d2e66', 'indicado', true);
INSERT INTO public.eventos_lojistas VALUES ('4aa6ccae-ef9c-4b55-b757-2ad8d7205e9e', '70ee32ea-879e-4338-9e07-01275f9e629a', 'indicado', true);
INSERT INTO public.eventos_lojistas VALUES ('e79aa226-e108-4973-a257-668a768aab69', '37811ce6-1af9-47d4-b50b-7791f269b8a6', 'indicado', true);
INSERT INTO public.eventos_lojistas VALUES ('db840672-8016-47b9-947a-9666814b2b1a', '8ad17ebd-a3b3-4adc-ac67-7c27c8098b24', 'indicado', true);
INSERT INTO public.eventos_sugeridos VALUES ('dcfefee2-ef1d-43f9-bb14-8166fcada5b8', 'e0645801-6721-4b8a-b18f-06f6e42615c5', 'Festival Rock Clássico & Grill Artesanal', 'Histórico', 'Homens • 30 a 60 anos', 'Indoor', 'Shopping', '2026-09-12 17:00:00-03', '2026-09-12 21:00:00-03', 600, 'seed', NULL, NULL, 'Concluido', true, NULL, '2026-11-14 09:58:19.534277-03');
INSERT INTO public.eventos_sugeridos VALUES ('4aa6ccae-ef9c-4b55-b757-2ad8d7205e9e', '9ed7b3bd-84d9-4ca0-b9ba-583315a6b14b', 'Noite Gastronômica & Jazz Acústico', 'Histórico', 'Casais e Adultos • 25 a 50 anos', 'Indoor', 'Shopping', '2026-08-29 17:00:00-03', '2026-08-29 21:00:00-03', 950, 'seed', NULL, NULL, 'Concluido', true, NULL, '2026-11-14 09:58:19.534277-03');
INSERT INTO public.eventos_sugeridos VALUES ('e79aa226-e108-4973-a257-668a768aab69', '97e6a4fb-f106-4eb9-ad14-06457bb5c9fa', 'Oficina de Robótica & Teatro Infantil', 'Histórico', 'Famílias com Crianças • 25 a 45 anos', 'Indoor', 'Shopping', '2026-08-16 17:00:00-03', '2026-08-16 21:00:00-03', 800, 'seed', NULL, NULL, 'Concluido', true, NULL, '2026-11-14 09:58:19.534277-03');
INSERT INTO public.eventos_sugeridos VALUES ('db840672-8016-47b9-947a-9666814b2b1a', 'b9317318-b26b-4e9c-9af4-bacd9e67fbf4', 'Arena eSports & Torneio EA FC', 'Histórico', 'Jovens Universitários • 18 a 25 anos', 'Indoor', 'Shopping', '2026-08-02 17:00:00-03', '2026-08-02 21:00:00-03', 450, 'seed', NULL, NULL, 'Concluido', true, NULL, '2026-11-14 09:58:19.534277-03');
INSERT INTO public.eventos_sugeridos VALUES ('4ea93984-eed5-48a8-8321-f79d722447b3', '2f1dd5ad-18e2-4b04-a080-62b773060628', 'Festival de Cafés Especiais & Leitura', 'Histórico', 'Público Geral • 25 a 60 anos', 'Indoor', 'Shopping', '2026-07-19 17:00:00-03', '2026-07-19 21:00:00-03', 420, 'seed', NULL, NULL, 'Concluido', true, NULL, '2026-11-14 09:58:19.534277-03');
INSERT INTO public.schema_info VALUES (1);
INSERT INTO public.interacoes_visitantes (evento_id, visitante_token_hash) SELECT '4ea93984-eed5-48a8-8321-f79d722447b3', 'seed-4ea93984-eed5-48a8-8321-f79d722447b3-'||g FROM generate_series(1,490) g;
INSERT INTO public.interacoes_visitantes (evento_id, visitante_token_hash) SELECT '4aa6ccae-ef9c-4b55-b757-2ad8d7205e9e', 'seed-4aa6ccae-ef9c-4b55-b757-2ad8d7205e9e-'||g FROM generate_series(1,1120) g;
INSERT INTO public.interacoes_visitantes (evento_id, visitante_token_hash) SELECT 'db840672-8016-47b9-947a-9666814b2b1a', 'seed-db840672-8016-47b9-947a-9666814b2b1a-'||g FROM generate_series(1,510) g;
INSERT INTO public.interacoes_visitantes (evento_id, visitante_token_hash) SELECT 'e79aa226-e108-4973-a257-668a768aab69', 'seed-e79aa226-e108-4973-a257-668a768aab69-'||g FROM generate_series(1,740) g;
INSERT INTO public.interacoes_visitantes (evento_id, visitante_token_hash) SELECT 'dcfefee2-ef1d-43f9-bb14-8166fcada5b8', 'seed-dcfefee2-ef1d-43f9-bb14-8166fcada5b8-'||g FROM generate_series(1,680) g;
ALTER TABLE ONLY public.campanhas_objetivos
    ADD CONSTRAINT campanhas_objetivos_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.contextos_consultados
    ADD CONSTRAINT contextos_consultados_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.conversoes_comerciais
    ADD CONSTRAINT conversoes_comerciais_evento_id_lojista_id_cupom_id_tipo_key UNIQUE (evento_id, lojista_id, cupom_id, tipo);
ALTER TABLE ONLY public.conversoes_comerciais
    ADD CONSTRAINT conversoes_comerciais_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.eventos_contextos
    ADD CONSTRAINT eventos_contextos_pkey PRIMARY KEY (evento_id, contexto_id);
ALTER TABLE ONLY public.eventos_lojistas
    ADD CONSTRAINT eventos_lojistas_pkey PRIMARY KEY (evento_id, lojista_id);
ALTER TABLE ONLY public.eventos_sugeridos
    ADD CONSTRAINT eventos_sugeridos_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.interacoes_visitantes
    ADD CONSTRAINT interacoes_visitantes_evento_id_visitante_token_hash_key UNIQUE (evento_id, visitante_token_hash);
ALTER TABLE ONLY public.interacoes_visitantes
    ADD CONSTRAINT interacoes_visitantes_id_evento_id_key UNIQUE (id, evento_id);
ALTER TABLE ONLY public.interacoes_visitantes
    ADD CONSTRAINT interacoes_visitantes_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.lojistas_parceiros
    ADD CONSTRAINT lojistas_parceiros_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.recomendacoes
    ADD CONSTRAINT recomendacoes_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.conversoes_comerciais
    ADD CONSTRAINT conversoes_comerciais_evento_id_lojista_id_fkey FOREIGN KEY (evento_id, lojista_id) REFERENCES public.eventos_lojistas(evento_id, lojista_id) ON DELETE RESTRICT;
ALTER TABLE ONLY public.conversoes_comerciais
    ADD CONSTRAINT conversoes_comerciais_interacao_id_evento_id_fkey FOREIGN KEY (interacao_id, evento_id) REFERENCES public.interacoes_visitantes(id, evento_id) ON DELETE RESTRICT;
ALTER TABLE ONLY public.eventos_contextos
    ADD CONSTRAINT eventos_contextos_contexto_id_fkey FOREIGN KEY (contexto_id) REFERENCES public.contextos_consultados(id) ON DELETE RESTRICT;
ALTER TABLE ONLY public.eventos_contextos
    ADD CONSTRAINT eventos_contextos_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos_sugeridos(id) ON DELETE RESTRICT;
ALTER TABLE ONLY public.eventos_lojistas
    ADD CONSTRAINT eventos_lojistas_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos_sugeridos(id) ON DELETE RESTRICT;
ALTER TABLE ONLY public.eventos_lojistas
    ADD CONSTRAINT eventos_lojistas_lojista_id_fkey FOREIGN KEY (lojista_id) REFERENCES public.lojistas_parceiros(id) ON DELETE RESTRICT;
ALTER TABLE ONLY public.eventos_sugeridos
    ADD CONSTRAINT eventos_sugeridos_campanha_id_fkey FOREIGN KEY (campanha_id) REFERENCES public.campanhas_objetivos(id) ON DELETE RESTRICT;
ALTER TABLE ONLY public.interacoes_visitantes
    ADD CONSTRAINT interacoes_visitantes_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos_sugeridos(id) ON DELETE RESTRICT;
ALTER TABLE ONLY public.recomendacoes
    ADD CONSTRAINT recomendacoes_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.eventos_sugeridos(id) ON DELETE RESTRICT;
-- Supabase expõe o schema public via REST com a chave anon do frontend: RLS sem políticas bloqueia esse acesso.
-- O backend conecta como postgres (ignora RLS).
ALTER TABLE public.campanhas_objetivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contextos_consultados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversoes_comerciais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos_contextos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos_lojistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos_sugeridos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interacoes_visitantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lojistas_parceiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recomendacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schema_info ENABLE ROW LEVEL SECURITY;
ALTER VIEW public.publico_realizado_checkins SET (security_invoker = true);
COMMIT;
