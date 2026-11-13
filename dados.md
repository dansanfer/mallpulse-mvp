# Especificação de dados e regras do MVP

Versão 1.0 | 13 de novembro de 2026

## Especificação de dados e regras do MVP

Especificação Técnica - Versão 1.0

Esta revisão substitui a modelagem anterior e preserva a recomendação por objetivo comercial, o cadastro de lojistas e o acompanhamento de eventos. As regras abaixo são propostas de implementação para o planejamento técnico; não representam um sistema já implementado ou um modelo preditivo validado.

## 1. Escopo e responsabilidades dos dados

O gestor informa objetivo, público-alvo e período. O backend Ruby com Grape consulta o histórico disponível, o mix de lojistas e o contexto externo para gerar uma sugestão revisável. PostgreSQL via Supabase mantém os registros e a justificativa de cada recomendação.

O portal do visitante é uma aplicação web acessada por QR Code. Não depende de instalação de aplicativo. Check-in registra uma confirmação associada a um token; não verifica identidade, idade, gênero nem presença física por si só.

## 2. Coleta e contagem de participação

O backend emite um token aleatório, mantido no navegador do visitante. O banco armazena apenas seu hash. O mesmo token só pode confirmar presença uma vez em cada evento. O backend valida o evento e seu período antes de gravar o check-in, de forma idempotente: tentativas repetidas retornam o registro já existente.

Limitação: troca de aparelho ou limpeza do navegador pode gerar outro token. A métrica será denominada check-ins únicos por token, sem equivalência garantida a pessoas únicas. Preferências são opcionais e não são usadas para inferir perfil demográfico.

O público realizado por check-in será calculado em uma view, evitando um contador manual divergente. Contagem presencial do organizador, caso utilizada, permanece em campo separado com identificação da fonte.

## 3. Evidência comercial e preservação do histórico

Ativação de cupom é engajamento. Resgate confirmado pelo lojista é conversão por cupom. Venda confirmada exige identificador de transação, origem, valor e data de confirmação. Gasto estimado permanece separado do valor confirmado. Esses registros não demonstram aumento incremental de vendas nem ROI sem linha de base e custos.

Registros relacionados usam exclusão restrita. Correções de confirmação devem manter histórico de auditoria no backend. Políticas de acesso e retenção devem ser definidas antes de coletar dados reais; chaves administrativas do Supabase ficam somente no backend.

## 4. Modelo relacional proposto

DDL de referência para PostgreSQL. O script cobre estrutura e integridade; autenticação, permissões, políticas de acesso e a lógica transacional de confirmação pertencem à implementação.


```sql
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
```

## 5. Relacionamentos e rastreabilidade


```sql
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
```

## 6. Pontuação explicável de afinidade

A pontuação varia de 0 a 100 e representa aderência às regras do MVP. Não é probabilidade de sucesso. Os pesos herdados da proposta são 40% histórico, 30% sinergia comercial, 20% clima e 10% calendário. Eles são hipóteses de projeto, ainda sem calibração empírica.

## Regras iniciais propostas

**Histórico H:** selecionar eventos concluídos, não simulados, da mesma categoria e público-alvo padronizado. Com pelo menos três eventos comparáveis, H é a média de min(check-ins por token / público estimado original, 1). Excluir registros com estimativa ausente ou zero. A métrica mede alcance em relação à meta, não comprova o perfil dos participantes. Com menos de três registros válidos, H fica indisponível.

**Sinergia L:** número de lojistas indicados com ao menos uma tag em comum com as tags do público da campanha, dividido pelo total de lojistas indicados. Se não houver lojistas, L = 0. Somente lojas ativas cadastradas são elegíveis; indicação não equivale a participação confirmada.

**Clima C:** previsão de temperatura máxima acima de 35 graus Celsius ou probabilidade de chuva de pelo menos 60% caracteriza condição desfavorável ao formato externo. C = 1 para Indoor; para Outdoor, C = 0 em condição desfavorável e C = 1 nos demais casos. Sem temperatura ou probabilidade de chuva, C fica indisponível. Estes limiares são regras iniciais, não relações causais comprovadas.

**Calendário S:** S = 1 quando a data é feriado nacional ou está a até três dias de um feriado nacional; S = 0 fora dessa janela. Sem calendário válido, S fica indisponível. Datas comerciais, como Dia dos Pais, exigem calendário complementar cadastrado; a proximidade de uma data não comprova baixa comercial.

## Fórmula e ausência de dados

Score = 100 x soma(peso x componente disponível) / soma(pesos disponíveis). Exibir componentes utilizados, pesos efetivos, tamanho da amostra e cobertura dos pesos. Se nenhum componente estiver disponível, retornar score nulo. Sem histórico, sinalizar recomendação inicial sem validação histórica; a redistribuição dos pesos não deve ficar oculta.

Exemplo exclusivamente simulado: H = 0,875; L = 0,90; C = 1; S = 1. Score = 35 + 27 + 20 + 10 = 92/100, com cobertura de 100%.

## Atualização pelo histórico

Ao concluir um evento, seus check-ins entram nas próximas consultas históricas. O backend recalcula a recomendação com regras versionadas e registra o novo snapshot. Isso constitui atualização por dados e regras; não se declara treinamento automático de modelo.

## 7. Integrações e indicadores

## Papéis das APIs

**BrasilAPI:** consulta feriados nacionais pelo ano. Não fornece vendas, queda de público ou diagnóstico de vazio comercial. Datas comerciais complementares são cadastradas com origem identificada. Referência: https://brasilapi.com.br/docs

**Open-Meteo:** consulta previsão por coordenadas e período suportado. Armazenar a resposta utilizada, a data de referência e o instante da consulta. Não substituir silenciosamente previsão futura por dado observado. Referência: https://open-meteo.com/en/docs

**Gemini:** pode elaborar tema e justificativa com os dados fornecidos pelo backend. Os lojistas retornados devem ser validados pelo ID contra o cadastro; a IA não confirma parceria, não inventa números e não calcula o score oficial. O backend aplica as regras e valida o contrato estruturado.

**QR Code:** codifica a URL do evento no portal. A geração do código não registra presença: a confirmação ocorre no endpoint do backend, após validação. Um provedor externo pode gerar a imagem do código, sem receber tokens de visitantes ou dados de conversão.

## Falhas e dados ausentes

Definir timeout, tentativas limitadas e cache por provedor. Em indisponibilidade, registrar erro e instante. Usar cache apenas com sua idade visível; na falta de dado válido, marcar componente indisponível e aplicar a fórmula de cobertura. Se Gemini falhar, gerar sugestão por regras ou apresentar indisponibilidade sem bloquear os registros já existentes.

## Indicadores sustentados pelo modelo

Participação: quantidade de check-ins únicos por token. Alcance da meta: check-ins / público estimado original, somente com estimativa maior que zero. Resgate: cupons distintos com resgate confirmado / cupons distintos ativados, no mesmo evento, lojista e janela. Vendas confirmadas: transações distintas confirmadas e soma dos valores confirmados, sem somar gasto estimado.

A criação de resgate exige ativação prévia; venda pode referenciar o cupom resgatado. O backend valida a sequência, autentica a origem e impede reprocessamento de identificadores externos. A métrica de venda considera apenas transações verificadas. Aderência demográfica, fluxo no corredor, tempo de permanência e aumento incremental de vendas permanecem fora da medição até haver fonte específica.

## Estimativas e decisão do gestor

O MVP pode retornar público estimado nulo quando não houver método defensável. Para demonstração, valores como 1.150 visitantes e 15% de ativação são simulados e ficam separados da base real. O gestor aprova explicitamente o evento; recomendações começam em Planejado.

## 8. Contrato demonstrativo e critérios de aceite

Exemplo de resposta simulada. IDs devem ser UUIDs válidos na implementação; abaixo, os rótulos representam referências a registros cadastrados. Nenhuma participação de lojista é confirmada automaticamente.


```json
{
  "modo": "simulacao",
  "objetivo": "Atrair publico para lojas parceiras",
  "publico_alvo": "Publico definido pelo gestor",
  "recomendacao": {
    "titulo": "Festival Rock & Grill",
    "status": "Planejado",
    "ambiente": "Indoor",
    "lojistas_indicados": [
      {"referencia": "lojista_cadastrado_1", "confirmado": false}
    ],
    "afinidade_pontos": 92,
    "escala": "0-100; nao e probabilidade",
    "componentes": {"H": 0.875, "L": 0.90, "C": 1, "S": 1},
    "cobertura_pesos": 1,
    "amostra_historica": 8,
    "historico_simulado": true,
    "versao_regra": "mvp-regras-1",
    "publico_estimado": null,
    "metodo_estimativa": null,
    "contexto": {
      "fonte_clima": "simulado",
      "temperatura_max": 38,
      "fonte_calendario": "simulado",
      "janela_feriado": true
    }
  }
}
```

## Critérios de aceite da implementação

- Repetir a confirmação com o mesmo token e evento não cria outro check-in; tokens diferentes continuam sendo uma aproximação de participantes.

- Campanhas não podem ter período invertido; eventos aceitam término no dia seguinte por usarem timestamps completos. Públicos e valores não podem ser negativos.

- Uma conversão só referencia interação e lojista do mesmo evento. Resgates e vendas precisam de confirmação verificável e processamento idempotente.

- O painel calcula check-ins pela view, sem manter contador concorrente. A contagem do organizador é exibida como fonte separada.

- Cada recomendação registra entradas, contexto utilizado, versão das regras, componentes e cobertura. Consultas distintas da mesma data e de localidades diferentes são preservadas.

- Score é reproduzível para as mesmas entradas; ausência de histórico ou falha de API fica visível. Dados simulados não alimentam análises reais.

- Exclusões com vínculos são bloqueadas. A aprovação é uma ação do gestor. Fontes externas não são apresentadas como prova de resultado comercial.

Validação pendente: executar o DDL e os testes transacionais no ambiente da equipe, confirmar vocabulário de públicos e segmentos, fontes comerciais, janela de conversão, políticas de acesso e retenção. Este documento descreve requisitos e regras propostas, não certifica execução ou resultados.
