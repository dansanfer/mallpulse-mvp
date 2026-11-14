# frozen_string_literal: true

require_relative 'boot'

Bundler.require(:default, ENV.fetch('RACK_ENV'))

require 'dotenv/load' unless ENV['RACK_ENV'] == 'production'

unless ENV['RACK_ENV'] == 'test'
  %w[VISITOR_TOKEN_SECRET FRONTEND_URL SUPABASE_URL].each do |name|
    next unless ENV[name].to_s.empty?

    # No Supabase project yet in local dev: boot anyway, every token is rejected.
    next warn('WARNING: SUPABASE_URL is empty; gestor routes will reject every request (401)') if name == 'SUPABASE_URL'

    raise "#{name} is required"
  end
end

loader = Zeitwerk::Loader.new
loader.push_dir(File.expand_path('../app', __dir__))
loader.inflector.inflect('api' => 'API')
loader.setup
require_relative 'database' # after setup so Zeitwerk autoloads MallPulse (VERSION) first
loader.eager_load
