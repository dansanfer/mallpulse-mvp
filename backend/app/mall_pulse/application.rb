# frozen_string_literal: true

module MallPulse
  module Application
    PUBLIC_DIR = File.expand_path('../../public', __dir__)

    def self.build
      origins = allowed_origins

      Rack::Builder.new do
        use Rack::Cors, &Application.cors_rules(origins)
        use Rack::Attack # after Rack::Cors so 429 responses carry CORS headers
        use Rack::Static, urls: ['/swagger'], root: PUBLIC_DIR, index: 'index.html'
        run MallPulse::API
      end.to_app
    end

    def self.allowed_origins
      ENV.fetch('CORS_ORIGINS') do
        ENV['RACK_ENV'] == 'test' ? '*' : raise('CORS_ORIGINS is required')
      end.split(',')
    end

    def self.cors_rules(origins)
      proc do
        allow do
          origins(*origins)
          resource '/api/*', headers: :any, methods: %i[get post put patch delete options]
        end
      end
    end
  end
end
