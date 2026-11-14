# frozen_string_literal: true

RSpec.describe MallPulse::Clients::OpenMeteo do
  let(:data) { Date.today + 5 }
  let(:bruto) do
    { 'daily' => { 'temperature_2m_max' => [31.5], 'precipitation_probability_max' => [20] } }
  end

  def previsao(dia = data)
    described_class.previsao(dia, lat: -23.5, lon: -46.6)
  end

  it 'extrai temperatura máxima e chuva' do
    allow(MallPulse::Clients::HttpJson).to receive(:get) do |uri|
      expect(uri.to_s).to include("start_date=#{data.iso8601}", "end_date=#{data.iso8601}", 'latitude=-23.5')
      bruto
    end

    expect(previsao).to eq(temp_max: 31.5, chuva: 20, bruto: bruto)
  end

  it 'retorna nil quando a consulta falha' do
    allow(MallPulse::Clients::HttpJson).to receive(:get).and_return(nil)

    expect(previsao).to be_nil
  end

  it 'aceita o último dia do horizonte e rejeita o seguinte' do
    allow(MallPulse::Clients::HttpJson).to receive(:get).and_return(bruto)

    expect(previsao(Date.today + 15)).not_to be_nil
    expect(previsao(Date.today + 16)).to be_nil
  end

  it 'rejeita datas passadas sem consultar' do
    allow(MallPulse::Clients::HttpJson).to receive(:get)

    expect(previsao(Date.today - 1)).to be_nil
    expect(MallPulse::Clients::HttpJson).not_to have_received(:get)
  end
end
