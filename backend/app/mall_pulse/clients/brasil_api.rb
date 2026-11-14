# frozen_string_literal: true

require 'date'

module MallPulse
  module Clients
    module BrasilApi
      URL = 'https://brasilapi.com.br/api/feriados/v1/%<ano>d'

      module_function

      def feriados(ano)
        corpo = HttpJson.get(URI(format(URL, ano: ano)))
        corpo&.map { |feriado| Date.iso8601(feriado['date']) }
      rescue StandardError
        nil
      end
    end
  end
end
