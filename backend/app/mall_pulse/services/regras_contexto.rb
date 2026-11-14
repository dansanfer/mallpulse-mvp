# frozen_string_literal: true

require 'date'

module MallPulse
  module Services
    module RegrasContexto
      TEMP_MAX_LIMITE = 35
      CHUVA_LIMITE = 60
      JANELA_FERIADO_DIAS = 3

      module_function

      def clima(ambiente:, temp_max:, chuva:)
        return 1 if ambiente == 'Indoor'
        return nil if temp_max.nil? || chuva.nil?

        temp_max > TEMP_MAX_LIMITE || chuva >= CHUVA_LIMITE ? 0 : 1
      end

      def calendario(data:, feriados:)
        return nil if feriados.nil?

        feriados.any? { |feriado| (feriado - data).abs <= JANELA_FERIADO_DIAS } ? 1 : 0
      end

      def sinergia(lojistas_tags:, campanha_tags:)
        return 0.0 if lojistas_tags.empty?

        lojistas_tags.count { |tags| tags.intersect?(campanha_tags) }.fdiv(lojistas_tags.size)
      end
    end
  end
end
