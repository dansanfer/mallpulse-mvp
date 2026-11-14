# frozen_string_literal: true

module MallPulse
  module RateLimit
    PUBLIC_PER_MINUTE = ENV.fetch('RATE_LIMIT_PUBLIC_PER_MINUTE', 10).to_i

    # shortcut: in-memory store is per-process; move to Redis when running multiple Puma workers/instances
    Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new
    Rack::Attack.enabled = ENV['RACK_ENV'] != 'test'

    Rack::Attack.throttle('visitantes/token', limit: PUBLIC_PER_MINUTE, period: 60) do |req|
      req.ip if req.post? && req.path == '/api/v1/visitantes/token'
    end

    Rack::Attack.throttle('eventos/checkins', limit: PUBLIC_PER_MINUTE, period: 60) do |req|
      req.ip if req.post? && req.path.match?(%r{\A/api/v1/eventos/[^/]+/checkins\z})
    end

    Rack::Attack.throttle('api', limit: 300, period: 300) { |req| req.ip if req.path.start_with?('/api/') }

    Rack::Attack.throttled_responder = lambda do |request|
      retry_after = (request.env['rack.attack.match_data'] || {})[:period].to_s
      body = Errors::ErrorPayload.build(code: :too_many_requests, message: 'Too many requests')
      [429, { 'content-type' => 'application/json', 'retry-after' => retry_after }, [JSON.generate(body)]]
    end
  end
end
