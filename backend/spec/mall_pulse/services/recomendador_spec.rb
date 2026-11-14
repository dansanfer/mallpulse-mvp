# frozen_string_literal: true

RSpec.describe MallPulse::Services::Recomendador do
  let(:data) { Date.today + 5 }
  let(:feriados) { [data + 2] }
  let(:previsao) { { temp_max: 38, chuva: 10, bruto: { 'daily' => {} } } }
  let!(:loja_ativa) { criar_lojista('A', %w[familias], true) }
  let!(:loja_sem_tag) { criar_lojista('B', %w[jovens], true) }
  let!(:loja_inativa) { criar_lojista('C', %w[familias], false) }
  let(:params) do
    { objetivo: 'o', publico_alvo: 'Familias', tags_publico: %w[familias],
      lojista_ids: [loja_ativa, loja_sem_tag], data: data, categoria: 'Gastronomia',
      ambiente: 'Outdoor', local_sugerido: 'Praca' }
  end

  before do
    allow(MallPulse::Clients::BrasilApi).to receive(:feriados).and_return(feriados)
    allow(MallPulse::Clients::OpenMeteo).to receive(:previsao).and_return(previsao)
  end

  def criar_lojista(nome, tags, ativo)
    db[:lojistas_parceiros].insert(nome_loja: nome, segmento: 's', ativo: ativo,
                                   tags_publico_alvo: Sequel.pg_array(tags, :text))
  end

  def componentes
    described_class.call(params)[:recomendacao][:componentes]
  end

  it 'leaves H unavailable without comparable history' do
    expect(componentes[:H]).to be_nil
  end

  it 'computes L over indicated lojistas sharing a tag' do
    expect(componentes[:L]).to eq(0.5)
  end

  it 'rejects inactive lojistas' do
    params[:lojista_ids] = [loja_inativa]
    expect { described_class.call(params) }.to raise_error(described_class::LojistaInvalido)
  end

  it 'zeroes C for Outdoor above 35 degrees' do
    expect(componentes[:C]).to eq(0)
  end

  it 'gives S 1 two days from a holiday' do
    expect(componentes[:S]).to eq(1)
  end

  context 'when BrasilAPI fails' do
    let(:feriados) { nil }

    it 'drops S and lowers coverage' do
      resposta = described_class.call(params)[:recomendacao]
      expect([resposta[:componentes][:S], resposta[:cobertura_pesos]]).to eq([nil, 0.5])
    end
  end

  it 'persists campaign, event, links, contexts and recommendation' do
    described_class.call(params)
    tabelas = %i[campanhas_objetivos eventos_sugeridos eventos_lojistas eventos_contextos recomendacoes]
    expect(tabelas.map { |t| db[t].count }).to eq([1, 1, 2, 2, 1])
  end
end
