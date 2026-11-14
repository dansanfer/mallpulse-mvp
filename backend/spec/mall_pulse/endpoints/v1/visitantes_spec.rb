# frozen_string_literal: true

RSpec.describe MallPulse::Endpoints::V1::Visitantes do
  let(:token) { 'b' * 32 }
  let(:evento_id) { criar_evento }

  before { ENV['VISITOR_TOKEN_SECRET'] = 'segredo-de-teste' }

  def checkin(id = evento_id, **body)
    post "/api/v1/eventos/#{id}/checkins", { token: token }.merge(body).to_json, 'CONTENT_TYPE' => 'application/json'
  end

  describe 'POST /api/v1/visitantes/token' do
    it 'issues a token' do
      post '/api/v1/visitantes/token'

      expect(last_response.status).to eq(201)
      expect(json_body[:token].length).to be >= 20
    end
  end

  describe 'POST /api/v1/eventos/:id/checkins' do
    it 'confirms the first check-in with 201' do
      checkin(interesses: ['moda'])

      expect(last_response.status).to eq(201)
      expect(json_body[:status]).to eq('confirmado')
    end

    it 'answers 200 ja_registrado on repeat and keeps one row' do
      2.times { checkin }

      expect([last_response.status, json_body[:status], db[:interacoes_visitantes].count])
        .to eq([200, 'ja_registrado', 1])
    end

    it 'never stores the plain token' do
      checkin

      expect(db[:interacoes_visitantes].select_map(:visitante_token_hash)).not_to include(token)
    end

    it 'returns 422 for a planned event' do
      checkin(criar_evento(status: 'Planejado'))

      expect([last_response.status, json_body[:error][:code]]).to eq([422, 'evento_indisponivel'])
    end

    it 'returns 422 for an ended event' do
      checkin(criar_evento(inicio: Time.now - 7200, fim: Time.now - 3600))

      expect(last_response.status).to eq(422)
    end

    it 'returns 422 for an invalid event id' do
      checkin('nao-e-uuid')

      expect(last_response.status).to eq(422)
    end

    it 'returns 400 for a short token' do
      checkin(token: 'curto')

      expect(last_response.status).to eq(400)
    end

    it 'returns 400 for an oversized interest' do
      checkin(interesses: ['x' * 61])

      expect(last_response.status).to eq(400)
    end
  end
end
