# frozen_string_literal: true

RSpec.describe MallPulse::RateLimit do
  def post_token(ip)
    post '/api/v1/visitantes/token', {}, 'REMOTE_ADDR' => ip
  end

  before do
    Rack::Attack.enabled = true
    Rack::Attack.cache.store.clear
  end

  after do
    Rack::Attack.cache.store.clear
    Rack::Attack.enabled = false
  end

  it 'throttles the 11th token request from the same IP with 429, error payload and Retry-After' do
    10.times { post_token('10.0.0.1') }
    post_token('10.0.0.1')

    expect(last_response.status).to eq(429)
    expect(JSON.parse(last_response.body).dig('error', 'code')).to eq('too_many_requests')
    expect(last_response.headers['retry-after'].to_i).to be_positive
  end

  it 'does not throttle a different IP' do
    11.times { post_token('10.0.0.1') }
    post_token('10.0.0.2')

    expect(last_response.status).to eq(201)
  end
end
