# MallPulse

Sistema de recomendação e gestão de eventos em shopping, orientado a objetivos comerciais e públicos específicos.

O gestor informa o objetivo e o público desejado. A plataforma propõe uma ação com base no mix de lojistas, histórico disponível e contexto externo. Após o evento, o painel acompanha os registros de participação e interesse.

## Status

Em desenvolvimento. O backend em Grape (`backend/`) persiste os dados em PostgreSQL via Sequel, e o frontend em React (`frontend/`) consome essa API. A autenticação usa Supabase Auth, com validação de JWT via JWKS. O projeto Supabase ainda não foi provisionado. Regras de pontuação são propostas do MVP, sem calibração empírica.

## Documentação

- [Planejamento e os seis requisitos da entrega](planejamento.md)
- [Especificação de dados, regras e critérios de aceite](dados.md)
- [Schema PostgreSQL](schema.sql)
- [PDF da entrega](MallPulse_Entrega_v1_0.pdf)
- [Plano de integração front-end e back-end](docs/superpowers/plans/2026-11-14-integracao-front-back.md)
- [Documento colaborativo](https://docs.google.com/document/d/1SEG14YjZu3L8Ou6Ij_daHEM5O7kCinvAsANcOHKrtFc/edit)

## Tecnologias

| Camada | Tecnologias |
|---|---|
| Frontend | TypeScript, React, Vite e Origin UI |
| Backend | Ruby, Grape e Sequel |
| Banco de dados | PostgreSQL |
| Autenticação | Supabase Auth (JWT/JWKS) |
| Contexto e recomendação | BrasilAPI e Open-Meteo |
| Portal do visitante | Interface web acessada por QR Code |

## Como rodar

### Backend

Requisitos: Ruby 3.3 (via rbenv) e PostgreSQL 16.

```bash
cd backend
cp .env.example .env
bundle install
createdb mallpulse_dev mallpulse_test
bundle exec rake db:migrate db:seed
bundle exec rackup -p 9292
```

Testes:

```bash
RACK_ENV=test bundle exec rake db:migrate
bundle exec rspec
```

Documentação da API (Swagger): http://localhost:9292/swagger

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### Variáveis de ambiente

Backend (`backend/.env`):

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | URL de conexão do banco de desenvolvimento. |
| `TEST_DATABASE_URL` | URL de conexão do banco de testes. |
| `SUPABASE_URL` | URL do projeto Supabase, usada para validar os JWTs via JWKS. |
| `VISITOR_TOKEN_SECRET` | Segredo HMAC dos tokens de visitante. Gere com `openssl rand -hex 32`. |
| `CORS_ORIGINS` | Origens autorizadas a acessar a API. |
| `FRONTEND_URL` | URL pública do frontend. |
| `RATE_LIMIT_PUBLIC_PER_MINUTE` | Máximo de requisições por minuto, por IP, em `POST /api/v1/visitantes/token` e `POST /api/v1/eventos/:id/checkins` (padrão 10). O contador fica em memória, por processo: com vários workers do Puma ou várias instâncias, use Redis. |
| `MALL_LAT` | Latitude do shopping, usada na consulta de clima (Open-Meteo). |
| `MALL_LON` | Longitude do shopping, usada na consulta de clima (Open-Meteo). |

Em produção o backend não sobe sem `VISITOR_TOKEN_SECRET`, `FRONTEND_URL` e `CORS_ORIGINS`. `SUPABASE_URL` vazio gera apenas um aviso, para o desenvolvimento local funcionar antes de existir um projeto Supabase.

#### Usuário gestor

Os endpoints de gestão exigem um JWT com `app_metadata.role = 'gestor'`; um usuário autenticado sem essa role recebe 403. Defina a role pelo painel do Supabase (Authentication > Users > Raw app meta data) ou por SQL:

```sql
update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"gestor"}' where email = 'gestor@exemplo.com';
```

Desative os cadastros públicos (Authentication > Sign In / Providers > desligue "Allow new users to sign up") e crie os gestores manualmente.

Frontend (`frontend/.env`):

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | URL base da API do backend. |
| `VITE_SUPABASE_URL` | URL do projeto Supabase. |
| `VITE_SUPABASE_ANON_KEY` | Chave pública (anon) do Supabase. |

## Endpoints

Todos os endpoints estão sob o prefixo `/api/v1`.

| Método | Caminho | Acesso |
|---|---|---|
| GET | `/health` | Público |
| GET, POST | `/lojistas` | Gestor |
| POST | `/recomendacoes` | Gestor |
| POST | `/eventos/:id/aprovar` | Gestor |
| GET | `/eventos/publicos` | Público |
| GET | `/eventos/:id/publico` | Público |
| POST | `/visitantes/token` | Público |
| POST | `/eventos/:id/checkins` | Visitante (token) |
| GET | `/painel/historico` | Gestor |
| GET | `/painel/objetivos` | Gestor |

Os dados de seed são marcados como `simulado=true` e não entram no cálculo de histórico (H).

## Organização

Os arquivos de planejamento ficam na raiz: `planejamento.md`, `dados.md`, `schema.sql` e o PDF da entrega. O diretório `docs/` contém o plano de implementação e os protótipos. O código fica em `backend/` e `frontend/`. O PDF registra a versão da entrega; alterações posteriores devem ser acompanhadas também nos arquivos Markdown.

## Validação

O SQL de referência não foi executado na entrega 1.0. A equipe deve validar o schema, as regras transacionais, as permissões e os indicadores antes da implementação. Dados ilustrativos dos protótipos não representam resultados medidos.
