# frozen_string_literal: true

RSpec.describe MallPulse::API do
  context 'when the route does not exist' do
    before { get '/api/v1/unknown' }

    it 'responds with a not found error payload' do
      expect([last_response.status, json_body]).to eq(
        [404, { error: { code: 'not_found', message: 'Resource not found' } }]
      )
    end
  end

  context 'when the HTTP method is not supported by the route' do
    before { post '/api/v1/health' }

    it 'responds with a method not allowed error payload' do
      expect([last_response.status, json_body.dig(:error, :code)]).to eq([405, 'method_not_allowed'])
    end
  end

  context 'when an unexpected error is raised' do
    before do
      allow(MallPulse::Entities::HealthStatus).to receive(:represent).and_raise(StandardError, 'secret detail')
      get '/api/v1/health'
    end

    it 'responds with a generic internal error payload' do
      expect([last_response.status, json_body]).to eq(
        [500, { error: { code: 'internal_server_error', message: 'Internal server error' } }]
      )
    end
  end

  describe 'GET /api/v1/swagger_doc' do
    before { get '/api/v1/swagger_doc' }

    it 'documents the health endpoint' do
      expect(json_body[:paths].keys).to include(:'/api/v1/health')
    end

    it 'hides the not found fallback route' do
      expect(json_body[:paths].keys).not_to include(:'/api/v1/{path}')
    end
  end
end
