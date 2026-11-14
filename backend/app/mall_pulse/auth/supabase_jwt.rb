# frozen_string_literal: true

require 'jwt'

module MallPulse
  module Auth
    module SupabaseJwt
      ALGORITHMS = %w[ES256 RS256].freeze
      AUDIENCE = 'authenticated'
      JWKS_TTL = 600
      JWKS_MIN_REFETCH = 30
      LOCK = Mutex.new

      module_function

      def verify(token)
        raise Unauthorized, 'missing token' if token.to_s.empty?
        # Without a configured issuer, iss/JWKS checks are meaningless: fail closed before decoding.
        raise Unauthorized, 'auth not configured' if ENV.fetch('SUPABASE_URL', '').strip.empty?

        claims, = JWT.decode(token, nil, true, algorithms: ALGORITHMS, jwks: ->(options) { jwks(**options) },
                                               iss: issuer, verify_iss: true, aud: AUDIENCE, verify_aud: true)
        claims
      rescue JWT::DecodeError => e
        raise Unauthorized, e.message
      end

      def issuer
        "#{ENV.fetch('SUPABASE_URL')}/auth/v1"
      end

      # Forced refetches (unknown kid) are throttled to one per JWKS_MIN_REFETCH against kid-spam.
      def jwks(invalidate: false, kid_not_found: false, **)
        LOCK.synchronize do
          forced = (invalidate || kid_not_found) && !fetched_recently?
          @cache = nil if forced || cache_expired?
          @cache ||= fetch_jwks
          @cache || { keys: [] }
        end
      end

      def fetched_recently?
        @fetched_at && Time.now - @fetched_at < JWKS_MIN_REFETCH
      end

      def cache_expired?
        @fetched_at.nil? || Time.now - @fetched_at > JWKS_TTL
      end

      def fetch_jwks
        @fetched_at = Time.now
        body = Clients::HttpJson.get(URI("#{issuer}/.well-known/jwks.json"))
        body&.transform_keys(&:to_sym)
      end
    end
  end
end
