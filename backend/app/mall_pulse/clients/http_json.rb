# frozen_string_literal: true

require 'json'
require 'net/http'

module MallPulse
  module Clients
    module HttpJson
      TIMEOUT = 3

      module_function

      def get(uri)
        resposta = Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == 'https',
                                                       open_timeout: TIMEOUT, read_timeout: TIMEOUT) do |http|
          http.request(Net::HTTP::Get.new(uri))
        end
        JSON.parse(resposta.body) if resposta.is_a?(Net::HTTPSuccess)
      rescue StandardError
        nil
      end
    end
  end
end
