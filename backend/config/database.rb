# frozen_string_literal: true

require 'sequel'

module MallPulse
  url = ENV.fetch(ENV['RACK_ENV'] == 'test' ? 'TEST_DATABASE_URL' : 'DATABASE_URL')
  DB = Sequel.connect(url)
  DB.extension :pg_array, :pg_json
end
