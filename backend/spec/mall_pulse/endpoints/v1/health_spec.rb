# frozen_string_literal: true

RSpec.describe MallPulse::Endpoints::V1::Health do
  describe 'GET /api/v1/health' do
    before { get '/api/v1/health' }

    it 'responds with ok' do
      expect(last_response).to be_ok
    end

    it 'reports the status and the running version' do
      expect(json_body).to eq(status: 'ok', version: MallPulse::VERSION)
    end
  end
end
