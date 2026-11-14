# frozen_string_literal: true

RSpec.describe MallPulse::Endpoints::V1::Lojistas do
  before { stub_jwks! }

  describe 'GET /api/v1/lojistas' do
    it 'lists stores ordered by name with their event count' do
      db[:lojistas_parceiros].insert(nome_loja: 'Zeta', segmento: 'Moda', piso: 'L2')
      db[:lojistas_parceiros].insert(nome_loja: 'Alfa', segmento: 'Food', piso: 'L1',
                                     tags_publico_alvo: Sequel.pg_array(%w[jovem], :text))

      get '/api/v1/lojistas', {}, auth_header

      expect(json_body.map { |l| l[:nome] }).to eq(%w[Alfa Zeta])
      expect(json_body.first).to include(segmento: 'Food', piso: 'L1', tags_publico: %w[jovem],
                                         eventos_participados: 0, ativo: true)
    end

    it 'rejects unauthenticated requests' do
      get '/api/v1/lojistas'

      expect(last_response.status).to eq(401)
      expect(json_body.dig(:error, :code)).to eq('unauthorized')
    end
  end

  describe 'role check' do
    it 'fails closed with 401 when SUPABASE_URL is empty' do
      headers = auth_header
      original = ENV.fetch('SUPABASE_URL')
      ENV['SUPABASE_URL'] = ''
      get '/api/v1/lojistas', {}, headers

      expect(last_response.status).to eq(401)
    ensure
      ENV['SUPABASE_URL'] = original
    end

    it 'rejects a valid JWT without the gestor role with 403' do
      get '/api/v1/lojistas', {}, auth_header(app_metadata: {})

      expect([last_response.status, json_body.dig(:error, :code)]).to eq([403, 'forbidden'])
    end
  end

  describe 'POST /api/v1/lojistas' do
    it 'rejects oversize segmento, piso, tags_publico or tag with 400' do
      base = { nome: 'L', segmento: 'Moda', piso: 'L1' }
      [{ segmento: 'a' * 81 }, { piso: 'a' * 81 }, { tags_publico: ['t'] * 21 },
       { tags_publico: ['t' * 41] }].each do |bad|
        post '/api/v1/lojistas', base.merge(bad).to_json, auth_header.merge('CONTENT_TYPE' => 'application/json')
        expect(last_response.status).to eq(400)
      end
    end

    it 'creates a store and returns it' do
      body = { nome: '  Loja Nova ', segmento: 'Moda', piso: 'L1', tags_publico: %w[jovem] }
      post '/api/v1/lojistas', body, auth_header

      expect(last_response.status).to eq(201)
      expect(json_body).to include(nome: 'Loja Nova', tags_publico: %w[jovem], eventos_participados: 0)
      expect(json_body[:id]).to match(/\A\h{8}-\h{4}-\h{4}-\h{4}-\h{12}\z/)
    end

    it 'rejects a blank name' do
      post '/api/v1/lojistas', { nome: ' ', segmento: 'Moda', piso: 'L1' }, auth_header

      expect(last_response.status).to eq(400)
      expect(json_body.dig(:error, :code)).to eq('bad_request')
    end
  end
end
