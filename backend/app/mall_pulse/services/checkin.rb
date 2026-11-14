# frozen_string_literal: true

require 'openssl'

module MallPulse
  module Services
    module Checkin
      class EventoIndisponivel < StandardError; end

      STATUS_ABERTOS = ['Aprovado', 'Ao Vivo'].freeze
      ANTECEDENCIA = 2 * 60 * 60

      module_function

      def hash_token(token)
        OpenSSL::HMAC.hexdigest('SHA256', ENV.fetch('VISITOR_TOKEN_SECRET'), token)
      end

      # Retorna :confirmado ou :ja_registrado
      def call(evento_id:, token:, interesses:)
        raise EventoIndisponivel unless aberto?(evento_id)

        registrar(evento_id, token, interesses)
        :confirmado
      rescue Sequel::UniqueConstraintViolation
        :ja_registrado
      end

      def registrar(evento_id, token, interesses)
        DB.transaction(savepoint: true) do
          DB[:interacoes_visitantes].insert(
            evento_id: evento_id, visitante_token_hash: hash_token(token),
            interesses_selecionados: Sequel.pg_array(interesses, :text)
          )
        end
      end

      def aberto?(evento_id)
        return false unless Uuid.valido?(evento_id)

        evento = DB[:eventos_sugeridos].where(id: evento_id, status: STATUS_ABERTOS, simulado: false).first
        agora = Time.now
        !evento.nil? && agora.between?(evento[:inicio] - ANTECEDENCIA, evento[:fim])
      end
    end
  end
end
