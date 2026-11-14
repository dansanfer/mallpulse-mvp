# frozen_string_literal: true

RSpec.describe MallPulse::Clients::BrasilApi do
  it 'converte a resposta em datas' do
    allow(MallPulse::Clients::HttpJson).to receive(:get)
      .with(URI('https://brasilapi.com.br/api/feriados/v1/2026'))
      .and_return([{ 'date' => '2026-12-25', 'name' => 'Natal' }])

    expect(described_class.feriados(2026)).to eq([Date.new(2026, 12, 25)])
  end

  it 'retorna nil quando a consulta falha' do
    allow(MallPulse::Clients::HttpJson).to receive(:get).and_return(nil)

    expect(described_class.feriados(2026)).to be_nil
  end

  it 'retorna nil quando o corpo é inesperado' do
    allow(MallPulse::Clients::HttpJson).to receive(:get).and_return([{ 'x' => 1 }])

    expect(described_class.feriados(2026)).to be_nil
  end
end
