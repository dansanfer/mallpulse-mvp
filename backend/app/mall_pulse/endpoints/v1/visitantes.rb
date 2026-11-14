# frozen_string_literal: true

require 'securerandom'

module MallPulse
  module Endpoints
    module V1
      class Visitantes < Grape::API
        MENSAGENS = {
          confirmado: 'Presença confirmada! Aproveite o evento no shopping.',
          ja_registrado: 'Sua presença já está confirmada neste evento.'
        }.freeze

        desc 'Issues an anonymous visitor token (nothing is stored)'
        post 'visitantes/token' do
          { token: SecureRandom.urlsafe_base64(32) }
        end

        desc 'Registers a visitor check-in, idempotent per token and event'
        params do
          requires :id, type: String
          requires :token, type: String, length: { min: 20, max: 100 }
          optional :interesses, type: [String], default: [], length: { max: 10 }
        end
        post 'eventos/:id/checkins' do
          error!(Errors::ErrorPayload.build(code: 'bad_request', message: 'interesses muito longo'), 400) if
            params[:interesses].any? { |interesse| interesse.length > 60 }

          resultado = Services::Checkin.call(
            evento_id: params[:id], token: params[:token], interesses: params[:interesses]
          )
          status(resultado == :confirmado ? 201 : 200)
          { status: resultado.to_s, mensagem: MENSAGENS.fetch(resultado) }
        rescue Services::Checkin::EventoIndisponivel
          error!(Errors::ErrorPayload.build(code: 'evento_indisponivel', message: 'Evento indisponível'), 422)
        end
      end
    end
  end
end
