# frozen_string_literal: true

RSpec.describe MallPulse::Auth::SupabaseJwt do
  include AuthSpecHelpers

  before do
    ENV['SUPABASE_URL'] = 'https://test.supabase.co'
    stub_jwks!
  end

  it 'returns the claims of a valid token' do
    expect(described_class.verify(auth_token(sub: 'abc'))).to include('sub' => 'abc')
  end

  it 'rejects an expired token' do
    expect { described_class.verify(auth_token(exp: Time.now.to_i - 10)) }
      .to raise_error(MallPulse::Auth::Unauthorized)
  end

  it 'rejects a token from another issuer' do
    expect { described_class.verify(auth_token(iss: 'https://evil.supabase.co/auth/v1')) }
      .to raise_error(MallPulse::Auth::Unauthorized)
  end

  it 'rejects a token with the wrong audience' do
    expect { described_class.verify(auth_token(aud: 'anon')) }.to raise_error(MallPulse::Auth::Unauthorized)
  end

  it 'rejects garbage' do
    expect { described_class.verify('not.a.jwt') }.to raise_error(MallPulse::Auth::Unauthorized)
  end

  it 'rejects even a matching token when SUPABASE_URL is blank' do
    ENV['SUPABASE_URL'] = ''
    token = auth_token(iss: '/auth/v1')

    expect { described_class.verify(token) }.to raise_error(MallPulse::Auth::Unauthorized, 'auth not configured')
  ensure
    ENV['SUPABASE_URL'] = 'https://test.supabase.co'
  end

  it 'rejects a missing token' do
    expect { described_class.verify(nil) }.to raise_error(MallPulse::Auth::Unauthorized)
  end

  describe '.jwks refetch throttle' do
    before do
      allow(described_class).to receive(:jwks).and_call_original
      described_class.instance_variable_set(:@cache, nil)
      described_class.instance_variable_set(:@fetched_at, nil)
    end

    it 'skips the refetch on kid_not_found when the last fetch was under 30s ago' do
      allow(MallPulse::Clients::HttpJson).to receive(:get).and_return('keys' => [])

      described_class.jwks
      described_class.jwks(kid_not_found: true, invalidate: true)

      expect(MallPulse::Clients::HttpJson).to have_received(:get).once
    end

    it 'refetches on kid_not_found once 30s have passed' do
      allow(MallPulse::Clients::HttpJson).to receive(:get).and_return('keys' => [])

      described_class.jwks
      described_class.instance_variable_set(:@fetched_at, Time.now - 31)
      described_class.jwks(kid_not_found: true)

      expect(MallPulse::Clients::HttpJson).to have_received(:get).twice
    end
  end
end
