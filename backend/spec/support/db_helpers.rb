# frozen_string_literal: true

module DbHelpers
  def db
    MallPulse::DB
  end
end

RSpec.configure do |config|
  config.include DbHelpers
  config.around do |example|
    MallPulse::DB.transaction(rollback: :always, auto_savepoint: true) { example.run }
  end
end
