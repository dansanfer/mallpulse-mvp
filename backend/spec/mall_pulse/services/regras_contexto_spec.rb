# frozen_string_literal: true

RSpec.describe MallPulse::Services::RegrasContexto do
  describe '.clima' do
    def clima(**args)
      described_class.clima(ambiente: 'Outdoor', temp_max: 25, chuva: 10, **args)
    end

    it { expect(clima(ambiente: 'Indoor', temp_max: nil, chuva: nil)).to eq(1) }
    it { expect(clima(temp_max: 35)).to eq(1) }
    it { expect(clima(temp_max: 35.1)).to eq(0) }
    it { expect(clima(chuva: 59)).to eq(1) }
    it { expect(clima(chuva: 60)).to eq(0) }
    it { expect(clima(temp_max: nil)).to be_nil }
    it { expect(clima(chuva: nil)).to be_nil }
  end

  describe '.calendario' do
    let(:data) { Date.new(2026, 12, 20) }

    it { expect(described_class.calendario(data: data, feriados: [Date.new(2026, 12, 25)])).to eq(0) }
    it { expect(described_class.calendario(data: data, feriados: [Date.new(2026, 12, 23)])).to eq(1) }
    it { expect(described_class.calendario(data: data, feriados: [Date.new(2026, 12, 24)])).to eq(0) }
    it { expect(described_class.calendario(data: data, feriados: [Date.new(2026, 12, 17)])).to eq(1) }
    it { expect(described_class.calendario(data: data, feriados: [Date.new(2026, 12, 16)])).to eq(0) }
    it { expect(described_class.calendario(data: data, feriados: nil)).to be_nil }
  end

  describe '.sinergia' do
    it 'calcula a fração de lojistas com tag em comum' do
      lojistas = [%w[moda], %w[food], %w[moda tech]]

      expect(described_class.sinergia(lojistas_tags: lojistas, campanha_tags: %w[moda])).to be_within(1e-9).of(2 / 3.0)
    end

    it 'retorna 0.0 sem lojistas' do
      expect(described_class.sinergia(lojistas_tags: [], campanha_tags: %w[moda])).to eq(0.0)
    end
  end
end
