# frozen_string_literal: true

RSpec.describe MallPulse::Endpoints::V1::Painel do
  %w[historico objetivos].each do |rota|
    describe "GET /api/v1/painel/#{rota}" do
      it 'exige autenticação' do
        get "/api/v1/painel/#{rota}"

        expect(last_response.status).to eq(401)
      end

      it 'responde a lista do serviço quando autenticado' do
        stub_jwks!
        get "/api/v1/painel/#{rota}", {}, auth_header

        expect(last_response).to be_ok
        expect(json_body).to eq([])
      end
    end
  end
end
