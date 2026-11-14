# frozen_string_literal: true

RSpec.describe MallPulse::Endpoints::V1::Eventos do
  before do
    ENV['FRONTEND_URL'] = 'https://app.test'
    stub_jwks!
  end

  describe 'POST /api/v1/eventos/:id/aprovar' do
    let(:evento_id) { criar_evento(status: 'Planejado') }

    it 'approves a planned event and stores the check-in URL' do
      post "/api/v1/eventos/#{evento_id}/aprovar", nil, auth_header

      expect(last_response.status).to eq(200)
      expect(json_body).to eq(id: evento_id, status: 'Aprovado', checkin_url: "https://app.test/checkin/#{evento_id}")
      expect(db[:eventos_sugeridos].where(id: evento_id).get(:qr_code_url)).to eq(json_body[:checkin_url])
    end

    it 'returns 409 when approving twice' do
      2.times { post "/api/v1/eventos/#{evento_id}/aprovar", nil, auth_header }

      expect([last_response.status, json_body[:error][:code]]).to eq([409, 'conflito_status'])
    end

    it 'returns 404 for unknown and invalid ids' do
      codes = [SecureRandom.uuid, 'invalido'].map do |id|
        post "/api/v1/eventos/#{id}/aprovar", nil, auth_header
        last_response.status
      end

      expect(codes).to eq([404, 404])
    end

    it 'requires authentication' do
      post "/api/v1/eventos/#{evento_id}/aprovar"

      expect(last_response.status).to eq(401)
    end
  end

  describe 'public endpoints' do
    let!(:visivel) { criar_evento(titulo_sugerido: 'Visivel', local_sugerido: 'Praca') }

    before do
      criar_evento(status: 'Planejado')
      criar_evento(simulado: true)
      criar_evento(inicio: Time.now - 7200, fim: Time.now - 3600)
    end

    it 'lists only upcoming approved real events' do
      get '/api/v1/eventos/publicos'

      expect(json_body.map { |e| e[:id] }).to eq([visivel])
      expect(json_body.first).to include(titulo: 'Visivel', local: 'Praca')
    end

    it 'shows a public event' do
      get "/api/v1/eventos/#{visivel}/publico"

      expect(json_body).to include(id: visivel, categoria: 'Familiar')
    end

    it 'returns 404 for a non-public event' do
      get "/api/v1/eventos/#{criar_evento(status: 'Planejado')}/publico"

      expect(last_response.status).to eq(404)
    end
  end
end
