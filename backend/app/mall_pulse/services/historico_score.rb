# frozen_string_literal: true

module MallPulse
  module Services
    # Componente H: alcance medio de eventos reais comparaveis (dados.md, secao 6).
    class HistoricoScore
      MIN_AMOSTRA = 3

      def self.call(**args)
        new(**args).call
      end

      def initialize(categoria:, publico_alvo:)
        @categoria = categoria
        @publico_alvo = publico_alvo
      end

      def call
        razoes = comparaveis.map { |linha| [linha[:checkins].fdiv(linha[:estimado]), 1].min }
        return { h: nil, amostra: razoes.size } if razoes.size < MIN_AMOSTRA

        { h: razoes.sum / razoes.size, amostra: razoes.size }
      end

      private

      def comparaveis
        base.where(filtro).where(Sequel[:e][:publico_estimado] > 0)
            .select(Sequel[:e][:publico_estimado].as(:estimado), Sequel[:v][:checkins_unicos_token].as(:checkins))
            .all
      end

      def base
        DB[Sequel[:eventos_sugeridos].as(:e)]
          .join(Sequel[:publico_realizado_checkins].as(:v), evento_id: Sequel[:e][:id])
      end

      def filtro
        { Sequel[:e][:status] => 'Concluido', Sequel[:e][:simulado] => false,
          Sequel[:e][:categoria] => @categoria, Sequel[:e][:publico_alvo] => @publico_alvo }
      end
    end
  end
end
