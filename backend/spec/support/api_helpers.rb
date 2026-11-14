# frozen_string_literal: true

module ApiHelpers
  def app
    MallPulse::Application.build
  end

  def json_body
    JSON.parse(last_response.body, symbolize_names: true)
  end
end
