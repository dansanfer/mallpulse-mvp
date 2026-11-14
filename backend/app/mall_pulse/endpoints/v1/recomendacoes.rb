# frozen_string_literal: true

module MallPulse
  module Endpoints
    module V1
      class Recomendacoes < Grape::API
        helpers MallPulse::Helpers::AuthHelpers
        before { authenticate! }

        desc 'Gera uma recomendacao de evento por regras'
        params do
          requires :objetivo, type: String, allow_blank: false
          requires :publico_alvo, type: String, allow_blank: false
          requires :tags_publico, type: [String], length: { max: 20 }, values: ->(tag) { tag.length <= 40 }
          requires :lojista_ids, type: [String], length: { max: 20 }
          requires :data, type: Date
          requires :categoria, type: String, allow_blank: false
          requires :ambiente, type: String, values: %w[Indoor Outdoor]
          requires :local_sugerido, type: String, allow_blank: false
        end
        post :recomendacoes do
          status 201
          Services::Recomendador.call(declared(params).to_h.transform_keys(&:to_sym))
        rescue Services::Recomendador::LojistaInvalido => e
          error!(Errors::ErrorPayload.build(code: 'lojista_invalido', message: e.message), 422)
        end
      end
    end
  end
end
