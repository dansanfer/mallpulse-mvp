# frozen_string_literal: true

RSpec.describe MallPulse::Application do
  it 'serves the Swagger UI' do
    get '/swagger/index.html'

    expect(last_response).to be_ok
  end

  it 'allows cross origin requests to the API' do
    get '/api/v1/health', {}, 'HTTP_ORIGIN' => 'https://example.com'

    expect(last_response.headers['access-control-allow-origin']).to eq('*')
  end
end
