# Sistema Inteligente de Gestão de Eventos em Shopping

Documento de planejamento do MVP

Versão 1.0 \| 13 de novembro de 2026 \| Consolidação: Eduardo

Esta entrega apresenta a proposta do MallPulse, os protótipos de interface, as tecnologias adotadas, a arquitetura proposta e a especificação de dados e integrações para o MVP.

## 1. Proposta e estrutura inicial das telas

## **Conceito da interface**

A interface do MallPulse combina recomendação de eventos orientada a objetivos comerciais com acompanhamento dos resultados. O gestor informa a finalidade da ação e o público desejado, revisa a sugestão de evento e utiliza o painel para acompanhar os indicadores após sua realização.

## **Direção visual**

O protótipo utiliza modo claro, com fundos branco (#FFFFFF) e cinza-claro (#F3F4F6), navegação lateral e organização em cartões. Na tela de decisão, duas colunas separam os dados informados pelo gestor da recomendação gerada.

A paleta adota laranja queimado (#D87943) nas ações principais, verde petróleo (#527575) nos indicadores e elementos de acompanhamento e areia (#FBCC97) nos destaques de contexto. A hierarquia visual prioriza leitura, identificação das ações e continuidade do fluxo.

## **Tela 1 — Motor de Decisão Comercial**

O gestor informa objetivo comercial, público-alvo, lojas ou segmentos parceiros e período desejado. A recomendação reúne tema do evento, local sugerido, parceiros e estimativa de público, considerando histórico e contexto de calendário e clima. O gestor pode aprovar a proposta e gerar o QR Code ou simular outro cenário.

![01-decisao-inteligente](assets/01-decisao-inteligente.jpeg)

*Figura 1 — Protótipo da tela de decisão inteligente*

## **Tela 2 — Painel de Resultados e Acompanhamento**

O painel apresenta o acompanhamento das ações, a comparação entre estimativas e resultados e o histórico dos eventos. O protótipo prevê indicadores de aderência ao público-alvo, fluxo nas lojas parceiras e contexto sazonal. A medição desses indicadores depende das fontes, dos critérios de cálculo e das integrações definidas pela equipe de dados.

![02-painel-resultados](assets/02-painel-resultados.jpeg)

*Figura 2 — Protótipo do painel de resultados*

## **Tela 3 — Portal Mobile do Visitante**

Portal web acessado pelo celular a partir do QR Code do evento, sem instalação de aplicativo. O protótipo permite confirmar presença, acessar benefícios nas lojas parceiras e selecionar preferências. O registro de presença deverá prever controle de duplicidade; a coleta de preferências complementa os dados de interesse e não constitui pesquisa de satisfação.

![03-portal-visitante](assets/03-portal-visitante.jpeg)

*Figura 3 — Protótipo do portal do visitante*

## **Fluxo de navegação**

O gestor acessa a Decisão Inteligente, informa os critérios e revisa a sugestão. Após aprovar a ação, disponibiliza o QR Code para acesso ao portal do visitante. Os registros coletados alimentam o Painel de Resultados e o histórico utilizado no planejamento de novas ações.

## **Premissas dos protótipos**

Percentuais, estimativas de público, resultados comerciais e insights exibidos nas imagens são exemplos ilustrativos, sem validação por dados reais nesta entrega. A BrasilAPI fornece contexto de feriados; quedas de fluxo, vendas e permanência dependem de dados próprios e análise adicional. Check-ins, isoladamente, não comprovam retorno financeiro nem o perfil demográfico dos participantes.

## 2. Documentação inicial do projeto

## **Contexto e problema**

O projeto parte da dificuldade de planejar eventos em shopping com dados suficientes sobre o interesse e a participação dos visitantes e sobre sua relação com os objetivos comerciais do empreendimento. A proposta reúne duas necessidades: decidir quais eventos criar para atrair um público específico e acompanhar os resultados das ações realizadas. O histórico de participação poderá apoiar essas decisões à medida que os dados forem coletados.

## **Proposta de solução**

Desenvolver uma plataforma de gerenciamento e recomendação de eventos orientada a objetivos comerciais e públicos específicos. O gestor informa a finalidade da ação, o público que deseja atrair e os lojistas ou áreas envolvidos; o sistema utiliza essas informações, o histórico disponível e dados de contexto para sugerir um evento. O painel inteligente mantém seu papel de acompanhar interesse e participação, comparar resultados e apoiar o planejamento das próximas iniciativas, sem depender de pesquisas de satisfação ou avaliações manuais dos visitantes.

## **Funcionamento previsto**

O fluxo previsto começa com a definição do objetivo comercial e do público-alvo pelo gestor, como movimentar a praça de alimentação ou atrair famílias no domingo. O sistema considera o cadastro dos lojistas, o histórico disponível e o contexto da ação para sugerir tema, período, local e parceiros internos, com uma justificativa para revisão do gestor. Após a realização do evento, os registros de participação e interesse alimentam o painel e o histórico. Esse ciclo conecta a recomendação anterior ao evento à análise posterior de seus resultados. Na ausência de histórico, as sugestões partem de hipóteses e regras iniciais, com essa limitação explícita.

## **Fontes e limites dos dados**

As fontes previstas incluem objetivos e públicos informados pelo gestor, cadastro e segmentos dos lojistas, registros dos organizadores, contagens de participantes e interações dos visitantes na plataforma. Dados de clima e calendário poderão complementar o contexto da recomendação. O método de coleta, a prevenção de contagens duplicadas e a definição dos indicadores serão detalhados com a equipe de dados. Dados simulados poderão ser usados na demonstração, desde que identificados e separados dos registros reais.

O acompanhamento deverá comparar os indicadores observados com as metas definidas para a ação. Participação e interesse permitem avaliar engajamento, mas não comprovam satisfação, aumento de vendas ou retorno financeiro; essas conclusões exigem dados específicos. As sugestões são apoio à decisão do gestor. Estimativas de público e pontuações de afinidade dependem de método documentado e validação; números demonstrativos deverão ser identificados como simulados.

## **Escopo inicial e resultado esperado**

O escopo inicial reúne o registro de objetivos comerciais e públicos-alvo, a associação com lojistas parceiros, a sugestão de eventos para revisão do gestor, o gerenciamento das ações e o painel de acompanhamento. O diferencial é conectar a recomendação de uma nova ação aos dados obtidos nas anteriores. O resultado esperado é reduzir a dependência de suposições e apoiar decisões progressivamente fundamentadas em evidências. Os requisitos detalhados, os critérios de aceite e as regras de recomendação serão consolidados com os materiais técnicos; o uso do histórico não pressupõe aprendizado automático já implementado.

## 3. Linguagem de programação escolhida

A equipe definiu TypeScript para o frontend e Ruby para o backend e o processamento dos dados. A distribuição prevista é:

TypeScript: desenvolvimento da interface web com React, Vite e Origin UI.

Ruby: implementação dos serviços de backend com Grape e da lógica de tratamento e análise dos dados.

## 4. Arquitetura proposta

A arquitetura proposta conecta a interface web em React, Vite, Origin UI e TypeScript ao backend Ruby com Grape. O backend valida as entradas do gestor, consulta o PostgreSQL via Supabase e os serviços externos, aplica regras versionadas e devolve a sugestão para revisão. Após a aprovação, o portal web registra check-ins e interações que alimentam o painel e o histórico.

A modelagem revisada contempla lojistas, campanhas e objetivos, eventos, vínculos entre eventos e lojistas, contextos consultados, recomendações, interações e conversões comerciais. Cada recomendação preserva entradas, contexto, versão das regras e componentes da pontuação. O público realizado por check-in é calculado por uma view; contagem presencial permanece separada. O detalhamento integral consta no Anexo técnico de dados, ao final deste documento. As regras propostas e o DDL aguardam validação e execução pela equipe.

## 5. Plataforma e tecnologias adotadas

A plataforma prevista é uma aplicação web. A lista abaixo registra as tecnologias confirmadas pela equipe; configuração, hospedagem e versões ainda serão detalhadas.

| Camada | Tecnologia | Aplicação prevista |
| :---- | :---- | :---- |
| Frontend | React \+ Vite \+ Origin UI e TypeScript | Interface da plataforma e painel de indicadores. |
| Backend | Grape e Ruby | Serviços da aplicação e tratamento dos dados. |
| Persistência | Supabase | Armazenamento das informações do projeto. |

Figma é a ferramenta de prototipação. O material de dados prevê BrasilAPI e Open-Meteo como fontes de contexto e Gemini como apoio à elaboração de sugestões. O banco permanece PostgreSQL via Supabase. O portal mobile é uma interface web acessada pelo navegador, sem instalação de aplicativo.

## 6. Como o consumo de APIs será incorporado

BrasilAPI fornece feriados nacionais; datas comerciais exigem calendário complementar. Open-Meteo fornece contexto climático por coordenadas e período suportado. Gemini pode elaborar tema e justificativa com os dados fornecidos pelo backend, que valida os lojistas e calcula a pontuação. Essas APIs não comprovam queda comercial, vendas ou probabilidade de sucesso.

O QR Code direciona ao portal do evento; a confirmação ocorre no backend. Um token aleatório do navegador, armazenado no banco como hash, permite uma confirmação por token e evento. Troca de dispositivo ou limpeza do navegador pode gerar duplicidade de pessoas; a métrica é check-ins únicos por token. Geração de imagem do QR Code não registra presença.

As integrações deverão prever timeout, tentativas limitadas, cache com idade visível e sinalização de dados indisponíveis. A pontuação é uma soma ponderada de histórico (40%), sinergia comercial (30%), clima (20%) e calendário (10%), com pesos redistribuídos apenas entre componentes disponíveis e cobertura explícita. É uma regra proposta de afinidade, não uma probabilidade validada. As definições, o contrato demonstrativo e os critérios de aceite estão no anexo.



## Anexo técnico de dados

Consulte a [especificação completa de dados](dados.md) e o [DDL PostgreSQL](../database/schema.sql).
