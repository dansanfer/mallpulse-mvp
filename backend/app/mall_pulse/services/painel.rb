# frozen_string_literal: true

module MallPulse
  module Services
    # Indicadores do painel de resultados (dados.md §7): adesão = check-ins / público estimado.
    module Painel
      STATUS = ['Concluido', 'Ao Vivo', 'Aprovado'].freeze

      EVENTO = Sequel[:e]
      COLUNAS_EVENTO = %i[id campanha_id titulo_sugerido publico_alvo inicio publico_estimado simulado]
                       .map { |coluna| EVENTO[coluna] }.freeze
      COLUNAS_JOIN = [Sequel[:c][:descricao_objetivo].as(:objetivo),
                      Sequel[:p][:checkins_unicos_token].as(:checkins)].freeze

      module_function

      def historico
        eventos = linhas
        lojas = lojas_por_evento(eventos.map { |e| e[:id] })
        eventos.map { |e| item_historico(e, lojas.fetch(e[:id], [])) }
      end

      # Dados simulados nunca se misturam aos reais (dados.md): um grupo por campanha e origem.
      def objetivos
        linhas.group_by { |e| [e[:campanha_id], e[:simulado]] }.values.map { |grupo| item_objetivo(grupo) }
      end

      def item_historico(evento, lojas)
        { id: evento[:id], objetivo: evento[:objetivo], evento: evento[:titulo_sugerido],
          publico: evento[:publico_alvo], lojas: lojas, checkins: evento[:checkins],
          estimado: evento[:publico_estimado], aderencia: aderencia(evento[:checkins], evento[:publico_estimado]),
          data: evento[:inicio].to_date.iso8601, simulado: evento[:simulado] }
      end

      def item_objetivo(grupo)
        estimado = grupo.sum { |e| e[:publico_estimado].to_i }
        realizado = grupo.sum { |e| e[:checkins] }
        { objetivo: grupo.first[:objetivo], estimado: estimado, realizado: realizado,
          aderencia: aderencia(realizado, estimado), simulado: grupo.first[:simulado] }
      end

      def aderencia(checkins, estimado)
        return nil if estimado.to_i.zero?

        ([checkins.to_f / estimado, 1].min * 100).round
      end

      def linhas
        base.where(Sequel[:e][:status] => STATUS)
            .order(Sequel.desc(Sequel[:e][:inicio]))
            .select(*COLUNAS_EVENTO, *COLUNAS_JOIN)
            .all
      end

      def base
        DB[Sequel.as(:eventos_sugeridos, :e)]
          .join(Sequel.as(:campanhas_objetivos, :c), { Sequel[:c][:id] => Sequel[:e][:campanha_id] })
          .join(Sequel.as(:publico_realizado_checkins, :p), { Sequel[:p][:evento_id] => Sequel[:e][:id] })
      end

      def lojas_por_evento(ids)
        DB[:eventos_lojistas].join(:lojistas_parceiros, id: :lojista_id)
                             .where(evento_id: ids).order(:nome_loja).select_hash_groups(:evento_id, :nome_loja)
      end
    end
  end
end
