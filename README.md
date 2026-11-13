# MallPulse

Sistema de recomendação e gestão de eventos em shopping, orientado a objetivos comerciais e públicos específicos.

O gestor informa o objetivo e o público desejado. A plataforma propõe uma ação com base no mix de lojistas, histórico disponível e contexto externo. Após o evento, o painel acompanha os registros de participação e interesse.

## Status

Entrega 1.0 de planejamento técnico. Este pacote contém documentação e DDL de referência; não contém uma aplicação executável. Regras de pontuação são propostas do MVP, sem calibração empírica.

## Documentação

- [Planejamento e os seis requisitos da entrega](docs/planejamento.md)
- [Especificação de dados, regras e critérios de aceite](docs/dados.md)
- [Schema PostgreSQL](database/schema.sql)
- [PDF da entrega](docs/entrega/MallPulse_Entrega_v1_0.pdf)
- [Documento colaborativo](https://docs.google.com/document/d/1SEG14YjZu3L8Ou6Ij_daHEM5O7kCinvAsANcOHKrtFc/edit)

## Tecnologias definidas

| Camada | Tecnologias |
|---|---|
| Frontend | TypeScript, React, Vite e Origin UI |
| Backend | Ruby e Grape |
| Banco de dados | PostgreSQL via Supabase |
| Contexto e recomendação | BrasilAPI, Open-Meteo e Gemini |
| Portal do visitante | Interface web acessada por QR Code |

## Organização

O diretório docs reúne o planejamento, a especificação de dados e os protótipos. O diretório database contém o DDL. O PDF registra a versão da entrega; alterações posteriores devem ser acompanhadas também nos arquivos Markdown.

## Validação

O SQL não foi executado nesta entrega. A equipe deve validar o schema, as regras transacionais, as permissões e os indicadores antes da implementação. Dados ilustrativos dos protótipos não representam resultados medidos.

## Subir no repositório

Extraia este pacote e copie seu conteúdo para a raiz do repositório. Preserve os arquivos existentes e revise possíveis conflitos antes de confirmar o commit. Sugestão de mensagem: docs: adiciona planejamento tecnico do MallPulse v1.0.
