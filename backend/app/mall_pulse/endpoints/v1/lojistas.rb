# frozen_string_literal: true

module MallPulse
  module Endpoints
    module V1
      class Lojistas < Grape::API
        helpers MallPulse::Helpers::AuthHelpers
        before { authenticate! }

        resource :lojistas do
          desc 'Lists partner stores ordered by name', is_array: true, success: Entities::Lojista
          get do
            present Repositories::Lojistas.listar, with: Entities::Lojista
          end

          desc 'Creates a partner store', success: Entities::Lojista
          params do
            requires :nome, type: String, allow_blank: false, length: { min: 1, max: 120 },
                            coerce_with: ->(v) { v.to_s.strip }
            requires :segmento, type: String, allow_blank: false, length: { max: 80 }
            requires :piso, type: String, allow_blank: false, length: { max: 80 }
            optional :tags_publico, type: [String], default: [], length: { max: 20 }, values: lambda { |tag|
              tag.length <= 40
            }
          end
          post do
            atributos = declared(params, include_missing: false).to_h.transform_keys(&:to_sym)
            lojista = Repositories::Lojistas.criar(**atributos)
            status 201
            present lojista, with: Entities::Lojista
          end
        end
      end
    end
  end
end
