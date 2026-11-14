# frozen_string_literal: true

require 'date'
require 'uri'

module MallPulse
  module Clients
    module OpenMeteo
      URL = 'https://api.open-meteo.com/v1/forecast'
      HORIZONTE_DIAS = 15

      module_function

      def previsao(data, lat:, lon:)
        return nil unless dentro_do_horizonte?(data)

        bruto = HttpJson.get(uri(data, lat, lon))
        diario = bruto&.fetch('daily', nil)
        return nil unless diario

        { temp_max: diario['temperature_2m_max']&.first, chuva: diario['precipitation_probability_max']&.first,
          bruto: bruto }
      end

      def dentro_do_horizonte?(data)
        (Date.today..(Date.today + HORIZONTE_DIAS)).cover?(data)
      end

      def uri(data, lat, lon)
        query = URI.encode_www_form(
          latitude: lat, longitude: lon, daily: 'temperature_2m_max,precipitation_probability_max',
          timezone: 'America/Sao_Paulo', start_date: data.iso8601, end_date: data.iso8601
        )
        URI("#{URL}?#{query}")
      end
      private_class_method :dentro_do_horizonte?, :uri
    end
  end
end
