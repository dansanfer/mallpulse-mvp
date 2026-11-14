# frozen_string_literal: true

module MallPulse
  module Helpers
    module AuthHelpers
      BEARER = /\ABearer (.+)\z/

      def authenticate!
        token = headers['Authorization'].to_s[BEARER, 1]
        @claims = Auth::SupabaseJwt.verify(token)
        raise Auth::Forbidden, 'gestor role required' unless @claims.dig('app_metadata', 'role') == 'gestor'
      end

      def current_user_id
        @claims&.fetch('sub')
      end
    end
  end
end
