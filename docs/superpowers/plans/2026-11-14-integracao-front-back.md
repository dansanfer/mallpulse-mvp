# Integração Frontend ↔ Backend MallPulse Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir todos os mocks do frontend por uma API Grape real persistida em Supabase/Postgres, seguindo as regras de `dados.md`.

**Architecture:** Grape (`/api/v1`) com endpoints finos que delegam a serviços em `app/mall_pulse/services/`; persistência via Sequel sobre o DDL de `schema.sql` (migrations); rotas do gestor exigem JWT do Supabase Auth validado por JWKS; rotas do visitante são públicas. Frontend troca `services/api.ts` por cliente `fetch` real + login Supabase.

**Tech Stack:** Ruby 3.3, Grape, grape-entity, Sequel, pg, jwt, dotenv, Net::HTTP (stdlib), RSpec + rack-test, PostgreSQL 16 (Postgres.app local p/ testes), Supabase (sa-east-1, Free); React 19 + Vite + `@supabase/supabase-js`.

**Spec:** `dados.md` (regras e contrato §8), `schema.sql`, decisões do grilling desta sessão (tabela abaixo).

## Global Constraints

- Contrato de erro existente: `{ error: { code, message } }` via `MallPulse::Errors::ErrorPayload`; 500 nunca vaza mensagem.
- Score = `100 × Σ(peso×comp disponível) / Σ(pesos disponíveis)`; pesos H 0.40, L 0.30, C 0.20, S 0.10; score `null` se nada disponível; `versao_regra = "mvp-regras-1"`.
- H indisponível com < 3 eventos comparáveis (concluídos, `simulado=false`, mesma categoria e público); H = média de `min(checkins/publico_estimado, 1)` excluindo estimativa nula/zero.
- L = lojistas indicados com ≥1 tag em comum com a campanha / total; 0 se nenhum; só `ativo=true`.
- C: Indoor → 1; Outdoor → 0 se `temp_max > 35` ou `chuva >= 60`, senão 1; indisponível sem dados.
- S: 1 se data for feriado nacional ou a ≤ 3 dias de um; 0 fora; indisponível se BrasilAPI falhar.
- Recomendações nascem com status `Planejado`; aprovação é ação explícita do gestor.
- Token de visitante emitido pelo backend; banco grava só `HMAC-SHA256(VISITOR_TOKEN_SECRET, token)` hex.
- Check-in idempotente: repetir mesmo token+evento retorna `ja_registrado`, 200, sem nova linha.
- Seed = dados dos mocks atuais com `simulado=true`; dados simulados nunca entram no cálculo de H.
- Segredos só em `backend/.env` (já no `.gitignore`); service role do Supabase nunca no frontend.
- HTTP externo: timeout 3 s, sem retry; falha ⇒ componente indisponível, nunca 500.
- CORS: `CORS_ORIGINS` obrigatório fora de `test` (sem fallback `*`).

## Decisões fixadas (grilling)

| Tema | Decisão |
|---|---|
| Banco | Supabase novo (sa-east-1, Free) criado via MCP; testes em Postgres local (Postgres.app 16) |
| Acesso | Sequel + migrations |
| Integrações | BrasilAPI + Open-Meteo; sem Gemini; justificativa por template |
| Auth | Supabase Auth email+senha; backend valida JWT via JWKS |
| Mock | Removido do front; vira seed `simulado=true` |
| Contrato | Formato §8 de `dados.md` |
| QR | UUID do evento; `/checkin/<uuid>` |

## Review Focus

1. Check-in em evento não aprovado/fora do período → 422 `evento_indisponivel`, sem gravar (Task 6).
2. Duas requisições simultâneas de check-in do mesmo token → uma linha só; a segunda vira `ja_registrado` via `UNIQUE` + rescue de `Sequel::UniqueConstraintViolation` (Task 6).
3. BrasilAPI/Open-Meteo fora do ar ou lento → recomendação ainda 201 com componente `null` e `cobertura_pesos < 1` (Task 4).
4. JWT expirado, de outro projeto ou ausente → 401 `unauthorized` em toda rota de gestor (Task 2).
5. CSV com campo iniciando em `= + - @` → prefixado com `'` no export (Task 8).

---

## Estrutura de arquivos

```
backend/
  Gemfile                         + sequel, pg, jwt, dotenv
  .env.example                    DATABASE_URL, TEST_DATABASE_URL, SUPABASE_URL, VISITOR_TOKEN_SECRET, CORS_ORIGINS, FRONTEND_URL, MALL_LAT, MALL_LON
  config/database.rb              MallPulse::DB (Sequel.connect)
  db/migrations/001_schema.rb     DDL de schema.sql + lojistas_parceiros.piso
  db/seeds.rb                     mocks → linhas simulado=true
  Rakefile                        + db:migrate, db:seed
  app/mall_pulse/
    auth/supabase_jwt.rb          verify(token) -> claims | raise
    helpers/auth_helpers.rb       authenticate! (Grape helper)
    clients/brasil_api.rb         feriados(ano) -> [Date] | nil
    clients/open_meteo.rb         previsao(data, lat:, lon:) -> Hash | nil
    services/score.rb             Score.calcular(h:, l:, c:, s:)
    services/recomendador.rb      Recomendador.call(params) -> Hash §8
    services/checkin.rb           Checkin.call(evento_id:, token:, interesses:)
    services/painel.rb            Painel.historico / Painel.por_objetivo
    endpoints/v1/{lojistas,recomendacoes,eventos,visitantes,painel}.rb
  spec/support/db_helpers.rb      transação + rollback por exemplo
frontend/
  .env.example                    VITE_API_URL, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
  src/lib/supabase.ts             createClient
  src/services/api.ts             fetch real (mocks removidos)
  src/pages/LoginPage.tsx
  src/App.tsx                     usa API; rota protegida
  src/pages/CheckinPage.tsx       token do backend; próximos eventos da API
```

---

### Task 1: Infra de dados (Ruby, Postgres, Sequel, migration, seed, Supabase)

**Files:**
- Modify: `backend/Gemfile`, `backend/Rakefile`, `backend/config/application.rb`, `backend/app/mall_pulse/application.rb`, `backend/spec/spec_helper.rb`, `backend/spec/mall_pulse/application_spec.rb`
- Create: `backend/config/database.rb`, `backend/db/migrations/001_schema.rb`, `backend/db/seeds.rb`, `backend/.env.example`, `backend/spec/support/db_helpers.rb`, `backend/spec/db/schema_spec.rb`
- Move: `backend/.github/` → `.github/` (com `working-directory: backend` e serviço postgres no job test)

**Interfaces:**
- Produces: `MallPulse::DB` (`Sequel::Database`); tabelas do `schema.sql` + coluna `lojistas_parceiros.piso TEXT NOT NULL DEFAULT ''`.

- [ ] **Step 1:** Instalar Ruby 3.3 (`brew install rbenv ruby-build && rbenv install 3.3.6 && rbenv local 3.3.6` em `backend/`), `bundle install`, gerar `Gemfile.lock`. Criar DBs locais: `createdb mallpulse_dev && createdb mallpulse_test`.
- [ ] **Step 2: Teste falho** `spec/db/schema_spec.rb`:
```ruby
it 'cria as tabelas do schema' do
  expect(MallPulse::DB.tables).to include(:lojistas_parceiros, :eventos_sugeridos, :interacoes_visitantes, :recomendacoes)
end
it 'bloqueia check-in duplicado' do
  # insere campanha+evento mínimos, depois 2x mesma (evento_id, hash)
  expect { 2.times { DB[:interacoes_visitantes].insert(evento_id: ev, visitante_token_hash: 'h') } }
    .to raise_error(Sequel::UniqueConstraintViolation)
end
```
- [ ] **Step 3:** `bundle exec rspec spec/db` → FAIL (DB não definido).
- [ ] **Step 4:** Implementar `config/database.rb` (URL por `RACK_ENV`, extensões `pg_array`, `pg_json`), migration com o DDL literal de `schema.sql` via `run` + `piso`, tasks `db:migrate`/`db:seed`, `dotenv` fora de produção, `db_helpers` com `DB.transaction(rollback: :always, auto_savepoint: true)`. `application.rb`: falhar no boot se `CORS_ORIGINS` ausente e `RACK_ENV != 'test'`.
- [ ] **Step 5:** `bundle exec rake db:migrate && bundle exec rspec` → PASS (ajustar `application_spec` CORS).
- [ ] **Step 6:** Seed idempotente (pula se `lojistas_parceiros` não vazio): lojistas de `MOCK_LOJISTAS`; para cada `MOCK_HISTORICO_EVENTOS`: campanha, evento `simulado=true, status='Concluido'`, `publico_estimado`=estimado, `eventos_lojistas` por nome de segmento, e N interações sintéticas (`hash = "seed-#{id}-#{i}"`) = checkins.
- [ ] **Step 7: Supabase** — via MCP: verificar organização/custo, **confirmar com o usuário**, `create_project` (sa-east-1), `apply_migration` com o mesmo SQL, preencher `backend/.env` (DATABASE_URL do pooler), `rake db:seed` contra ele. `VISITOR_TOKEN_SECRET` via `openssl rand -hex 32`. Criar usuário gestor no Auth.
- [ ] **Step 8: Commit** `feat(backend): persistência Sequel/Postgres, migration do schema e seed simulado`

### Task 2: Autenticação Supabase JWT

**Files:** Create `app/mall_pulse/auth/supabase_jwt.rb`, `app/mall_pulse/helpers/auth_helpers.rb`, `spec/mall_pulse/auth/supabase_jwt_spec.rb`, `spec/support/auth_helpers.rb`; Modify `api.rb`

**Interfaces:**
- Produces: `MallPulse::Auth::SupabaseJwt.verify(token) -> Hash` (lança `MallPulse::Auth::Unauthorized`); helper Grape `authenticate!` → `current_user_id` (`claims['sub']`); spec helper `auth_header` gera JWT ES256 com chave de teste e stuba o JWKS.

- [ ] **Step 1: Testes falhos:** token válido → claims com `sub`; expirado → raise; `iss` ≠ `"#{SUPABASE_URL}/auth/v1"` → raise; `aud` ≠ `'authenticated'` → raise; rota protegida sem header → 401 `{error:{code:'unauthorized'}}`.
- [ ] **Step 2:** Rodar → FAIL.
- [ ] **Step 3:** Implementar com gem `jwt`: `JWT.decode(token, nil, true, algorithms: %w[ES256 RS256], jwks: loader, iss:, verify_iss: true, aud: 'authenticated', verify_aud: true)`; loader busca `#{SUPABASE_URL}/auth/v1/.well-known/jwks.json` com cache de 10 min. `rescue_from MallPulse::Auth::Unauthorized` → 401.
- [ ] **Step 4:** PASS. **Step 5: Commit** `feat(backend): autenticação via JWT do Supabase (JWKS)`

### Task 3: Lojistas

**Files:** Create `endpoints/v1/lojistas.rb`, `entities/lojista.rb`, spec; Modify `api.rb`

**Interfaces:**
- `GET /api/v1/lojistas` (auth) → `[{id, nome, segmento, piso, tags_publico, eventos_participados, ativo}]`; `eventos_participados` = count em `eventos_lojistas`.
- `POST /api/v1/lojistas` (auth) `nome` (1..120, required), `segmento` (required), `piso` (required), `tags_publico` (Array[String], default `[]`) → 201 mesma entidade.

- [ ] TDD: lista seed; cria 201 com UUID; `nome` vazio → 400; sem auth → 401. **Commit** `feat(backend): endpoints de lojistas`

### Task 4: Clientes externos + Score + Recomendação

**Files:** Create `clients/brasil_api.rb`, `clients/open_meteo.rb`, `services/score.rb`, `services/recomendador.rb`, `endpoints/v1/recomendacoes.rb`, specs (clientes testados com stub de `Net::HTTP`).

**Interfaces:**
- `BrasilApi.feriados(ano) -> Array<Date> | nil`; `OpenMeteo.previsao(data, lat:, lon:) -> {temp_max:, chuva:, bruto:} | nil` (nil fora do horizonte de 16 dias ou erro).
- `Score.calcular(h:, l:, c:, s:) -> {score: Float|nil, cobertura: Float, componentes: {H:, L:, C:, S:}}`.
- `POST /api/v1/recomendacoes` (auth): `objetivo`, `publico_alvo`, `tags_publico` Array, `lojista_ids` Array[UUID], `data` Date, `categoria`, `ambiente` (`Indoor|Outdoor`), `local_sugerido` → 201 JSON §8 + `recomendacao.evento_id`. Uma transação: `campanhas_objetivos`, `contextos_consultados` (um por fonte), `eventos_sugeridos` (`Planejado`, início = data 17h, fim +4h), `eventos_lojistas` (`confirmado=false`, `tipo_participacao='indicado'`), `eventos_contextos`, `recomendacoes` (`origem='regras'`).
- Título/justificativa por template: `"#{categoria} para #{publico_alvo}"` + frase com componentes disponíveis/indisponíveis.

- [ ] **Step 1: Score (falho):** `calcular(h: 0.875, l: 0.9, c: 1, s: 1)` → `score 92.0, cobertura 1.0`; `calcular(h: nil, l: 0.5, c: nil, s: nil)` → `score 50.0, cobertura 0.3`; tudo nil → `score nil, cobertura 0.0`.
- [ ] **Step 2: Recomendador (falho):** H nil com < 3 comparáveis (seed simulado ⇒ nil); L só ativos com tag comum; Outdoor + `temp_max 38` ⇒ C 0; data a 2 dias de feriado ⇒ S 1; BrasilAPI nil ⇒ S nil e `cobertura < 1`; lojista_id inexistente ⇒ 422 `lojista_invalido`; resposta com `escala: "0-100; nao e probabilidade"`, `status: "Planejado"`, `versao_regra: "mvp-regras-1"`, `publico_estimado: nil`.
- [ ] **Steps 3–5:** FAIL → implementar (H via view `publico_realizado_checkins`) → PASS. **Commit** `feat(backend): recomendação por regras com contexto BrasilAPI/Open-Meteo`

### Task 5: Eventos (aprovar + listagem pública)

**Interfaces:**
- `POST /api/v1/eventos/:id/aprovar` (auth) → 200 `{id, status: 'Aprovado', checkin_url}`; grava `qr_code_url = "#{FRONTEND_URL}/checkin/#{id}"`. Só de `Planejado`; outro → 409 `conflito_status`; inexistente → 404.
- `GET /api/v1/eventos/publicos` (público) → `Aprovado|Ao Vivo`, `simulado=false`, `fim > now`, por `inicio`, limite 10: `[{id, titulo, categoria, inicio, fim, local}]`.
- `GET /api/v1/eventos/:id/publico` (público) → mesmo shape; 404 se não aprovado.

- [ ] TDD: aprovar ok; 2x → 409; 404; listagem exclui Planejado/simulado/passado. **Commit** `feat(backend): aprovação de eventos e listagem pública`

### Task 6: Visitantes (token + check-in)

**Interfaces:**
- `POST /api/v1/visitantes/token` (público) → 201 `{token}` (`SecureRandom.urlsafe_base64(32)`; nada gravado).
- `POST /api/v1/eventos/:id/checkins` (público): `token` (20..100), `interesses` Array[String] (≤ 10, cada ≤ 60) → 201 `{status:'confirmado', mensagem}` ou 200 `{status:'ja_registrado', mensagem}` (textos atuais do mock).
- `Checkin.hash_token(token)` = `OpenSSL::HMAC.hexdigest('SHA256', ENV.fetch('VISITOR_TOKEN_SECRET'), token)`.

- [ ] TDD: 1º check-in 201; repetição 200 e `count == 1`; token em claro ausente do DB; evento `Planejado` ou encerrado → 422 `evento_indisponivel`; `UniqueConstraintViolation` simulada → `ja_registrado`. **Commit** `feat(backend): emissão de token e check-in idempotente`

### Task 7: Painel

**Interfaces:**
- `GET /api/v1/painel/historico` (auth) → `[{id, objetivo, evento, publico, lojas, checkins, estimado, aderencia, data, simulado}]`; checkins da view; `aderencia = round(min(checkins/estimado,1)*100)` ou `null`; status `Concluido|Ao Vivo|Aprovado`, mais recentes primeiro.
- `GET /api/v1/painel/objetivos` (auth) → `[{objetivo, estimado, realizado, aderencia}]` por campanha.

- [ ] TDD: estimado 0 ⇒ aderência null; checkins vêm da view. **Commit** `feat(backend): endpoints do painel de resultados`

### Task 8: Frontend integrado

**Files:** Create `frontend/src/lib/supabase.ts`, `frontend/src/pages/LoginPage.tsx`, `frontend/.env.example`; Modify `frontend/src/services/api.ts`, `App.tsx`, `pages/CheckinPage.tsx`, `frontend/package.json`; Delete raiz `package.json`, `package-lock.json`, `node_modules`.

**Interfaces:**
- `api.ts`: `request<T>(path, {method, body, auth})` injeta `Authorization: Bearer <access_token>` quando `auth`; lança `ApiError(code, message, status)` em `!response.ok`. Funções: `listarLojistas`, `criarLojista`, `gerarRecomendacao`, `aprovarEvento`, `obterTokenVisitante` (busca `/visitantes/token` se ausente no `localStorage`), `registrarCheckin`, `listarEventosPublicos`, `obterEventoPublico`, `obterHistorico`, `obterGraficoObjetivos`. Tipos espelham Tasks 3–7.
- `App.tsx`: guarda que redireciona `/` → `/login` sem sessão; Decisão troca o texto livre "período" por `<input type="date">` e ganha campos `categoria`, `ambiente` (Indoor/Outdoor), `local_sugerido` e `tags_publico` (exigidos pela Task 4); seleciona lojistas por id, mostra H/L/C/S + cobertura, aprovar usa `checkin_url` no QR; Resultados/Relatórios/Lojas usam a API; erros via `OriginBanner`; badge "simulado".
- `exportarCSV`: escapar `"` e prefixar `'` em campos iniciados por `= + - @`.
- `CheckinPage`: sem fallback `"evento-01"`; 404 ⇒ "evento indisponível"; próximos eventos da API.

- [ ] **Step 1:** `npm i @supabase/supabase-js clsx tailwind-merge` em `frontend/`; remover deps da raiz.
- [ ] **Step 2:** Implementar.
- [ ] **Step 3:** `npm run build && npm run lint` → sem erros.
- [ ] **Step 4: E2E manual** (backend `bundle exec rackup -p 9292` + `npm run dev`): login → lojistas → recomendação → aprovar → `checkin_url` em aba anônima → confirmar → repetir ⇒ "já registrado" → histórico +1.
- [ ] **Step 5: Commit** `feat(frontend): integra com API real e Supabase Auth, remove mocks`

### Task 9: Documentação

- [ ] `README.md` (links corrigidos, setup, variáveis) e `CHANGELOG.md` (1.1). **Commit** `docs: setup da integração`
