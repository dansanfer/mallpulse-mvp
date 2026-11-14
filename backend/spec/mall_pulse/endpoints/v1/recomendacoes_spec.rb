# frozen_string_literal: true

RSpec.describe MallPulse::Endpoints::V1::Recomendacoes do
  let(:lojista) do
    db[:lojistas_parceiros].insert(nome_loja: 'A', segmento: 's', tags_publico_alvo: Sequel.pg_array(%w[x], :text))
  end
  let(:body) do
    { objetivo: 'o', publico_alvo: 'Familias', tags_publico: %w[x], lojista_ids: [lojista],
      data: (Date.today + 3).iso8601, categoria: 'Gastronomia', ambiente: 'Indoor', local_sugerido: 'Praca' }
  end

  before do
    stub_jwks!
    allow(MallPulse::Clients::BrasilApi).to receive(:feriados).and_return([])
    allow(MallPulse::Clients::OpenMeteo).to receive(:previsao).and_return(nil)
  end

  def post_recomendacao(payload)
    post '/api/v1/recomendacoes', payload.to_json, auth_header.merge('CONTENT_TYPE' => 'application/json')
  end

  it 'creates a Planejado recommendation' do
    post_recomendacao(body)
    rec = json_body[:recomendacao]
    expect([last_response.status, rec[:escala], rec[:status], rec[:versao_regra], rec[:publico_estimado]])
      .to eq([201, '0-100; nao e probabilidade', 'Planejado', 'mvp-regras-1', nil])
  end

  it 'persists the event and exposes its id' do
    post_recomendacao(body)
    expect(db[:eventos_sugeridos].get(:id)).to eq(json_body[:recomendacao][:evento_id])
  end

  it 'rejects unknown lojistas with 422' do
    post_recomendacao(body.merge(lojista_ids: [SecureRandom.uuid]))
    expect([last_response.status, json_body[:error][:code]]).to eq([422, 'lojista_invalido'])
  end

  it 'rejects oversize tags_publico, lojista_ids or tag with 400' do
    [{ tags_publico: ['t'] * 21 }, { lojista_ids: [SecureRandom.uuid] * 21 },
     { tags_publico: ['t' * 41] }].each do |bad|
      post_recomendacao(body.merge(bad))
      expect(last_response.status).to eq(400)
    end
  end

  it 'requires auth' do
    post '/api/v1/recomendacoes', body.to_json, 'CONTENT_TYPE' => 'application/json'
    expect(last_response.status).to eq(401)
  end
end
