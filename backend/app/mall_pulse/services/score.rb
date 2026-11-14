# frozen_string_literal: true

module MallPulse
  module Services
    module Score
      VERSAO_REGRA = 'mvp-regras-1'
      PESOS = { H: 0.40, L: 0.30, C: 0.20, S: 0.10 }.freeze

      module_function

      def calcular(h:, l:, c:, s:)
        componentes = { H: h, L: l, C: c, S: s }
        disponiveis = componentes.compact
        cobertura = disponiveis.sum(0.0) { |chave, _| PESOS[chave] }
        { score: pontuar(disponiveis, cobertura), cobertura: cobertura.round(3), componentes: componentes }
      end

      def pontuar(disponiveis, cobertura)
        return nil if disponiveis.empty?

        soma = disponiveis.sum { |chave, valor| PESOS[chave] * valor }
        (100 * soma / cobertura).round(2)
      end
      private_class_method :pontuar
    end
  end
end
