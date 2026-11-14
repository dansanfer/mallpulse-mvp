# frozen_string_literal: true

module MallPulse
  module Endpoints
    module V1
      class Painel < Grape::API
        helpers MallPulse::Helpers::AuthHelpers

        before { authenticate! }

        namespace :painel do
          desc 'Histórico de eventos com público realizado e aderência'
          get :historico do
            Services::Painel.historico
          end

          desc 'Aderência agregada por objetivo de campanha'
          get :objetivos do
            Services::Painel.objetivos
          end
        end
      end
    end
  end
end
