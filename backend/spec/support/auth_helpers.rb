# frozen_string_literal: true

require 'jwt'

module AuthSpecHelpers
  TEST_KEY = OpenSSL::PKey::EC.generate('prime256v1')
  TEST_JWK = JWT::JWK.new(TEST_KEY, kid: 'test-key')

  def supabase_url
    ENV.fetch('SUPABASE_URL')
  end

  def auth_token(sub: 'user-uuid', app_metadata: { role: 'gestor' }, **overrides)
    claims = { sub: sub, iss: "#{supabase_url}/auth/v1", aud: 'authenticated', exp: Time.now.to_i + 3600,
               app_metadata: app_metadata }
    JWT.encode(claims.merge(overrides), TEST_KEY, 'ES256', kid: TEST_JWK.kid)
  end

  def auth_header(**)
    { 'HTTP_AUTHORIZATION' => "Bearer #{auth_token(**)}" }
  end

  def stub_jwks!
    allow(MallPulse::Auth::SupabaseJwt).to receive(:jwks).and_return(keys: [TEST_JWK.export])
  end
end

# `||=` would keep an empty value loaded from .env, letting tokens minted with iss "/auth/v1" match.
ENV['SUPABASE_URL'] = 'https://test.supabase.co' if ENV['SUPABASE_URL'].to_s.strip.empty?
RSpec.configure do |c|
  c.include AuthSpecHelpers
  c.before do
    MallPulse::Auth::SupabaseJwt.instance_variable_set(:@cache, nil)
    MallPulse::Auth::SupabaseJwt.instance_variable_set(:@fetched_at, nil)
  end
end
