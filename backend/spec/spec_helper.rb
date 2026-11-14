# frozen_string_literal: true

require 'simplecov'

SimpleCov.start do
  enable_coverage :branch
  skip '/spec/'
end

ENV['RACK_ENV'] = 'test'
ENV['CORS_ORIGINS'] = '*' # dotenv never overrides an existing var, so specs stay independent of .env

require_relative '../config/environment'

Dir[File.expand_path('support/**/*.rb', __dir__)].each { |file| require file }

RSpec.configure do |config|
  config.include Rack::Test::Methods
  config.include ApiHelpers

  config.disable_monkey_patching!
  config.raise_errors_for_deprecations!
  config.order = :random
end
