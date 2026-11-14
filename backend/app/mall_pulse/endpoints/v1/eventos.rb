# frozen_string_literal: true

module MallPulse
  module Endpoints
    module V1
      class Eventos < Grape::API
        helpers MallPulse::Helpers::AuthHelpers

        helpers do
          def eventos_publicos
            DB[:eventos_sugeridos]
              .where(status: Services::Checkin::STATUS_ABERTOS, simulado: false)
              .where { fim > Sequel::CURRENT_TIMESTAMP }
          end
        end

        resource :eventos do
          desc 'Lists upcoming public events', is_array: true, success: Entities::EventoPublico
          get :publicos do
            present eventos_publicos.order(:inicio).limit(10).all, with: Entities::EventoPublico
          end

          route_param :id, type: String do
            desc 'Shows a public event', success: Entities::EventoPublico
            get :publico do
              evento = Services::Uuid.valido?(params[:id]) && eventos_publicos.where(id: params[:id]).first
              error!(Errors::ErrorPayload.not_found, 404) unless evento

              present evento, with: Entities::EventoPublico
            end

            desc 'Approves a planned event and returns its check-in URL'
            post :aprovar do
              authenticate!
              status 200
              Services::AprovacaoEvento.call(params[:id])
            rescue Services::AprovacaoEvento::NaoEncontrado
              error!(Errors::ErrorPayload.not_found, 404)
            rescue Services::AprovacaoEvento::ConflitoStatus
              error!(Errors::ErrorPayload.build(code: 'conflito_status', message: 'Evento não está Planejado'), 409)
            end
          end
        end
      end
    end
  end
end
