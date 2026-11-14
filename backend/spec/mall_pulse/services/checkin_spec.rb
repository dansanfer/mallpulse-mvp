# frozen_string_literal: true

RSpec.describe MallPulse::Services::Checkin do
  let(:token) { 'a' * 32 }
  let(:evento_id) { criar_evento }

  before { ENV['VISITOR_TOKEN_SECRET'] = 'segredo-de-teste' }

  describe '.hash_token' do
    it 'is a deterministic hex digest that differs from the plain token' do
      hash = described_class.hash_token(token)

      expect(hash).to match(/\A\h{64}\z/).and eq(described_class.hash_token(token))
    end
  end

  describe '.call' do
    it 'confirms once and then reports ja_registrado' do
      results = 2.times.map { described_class.call(evento_id: evento_id, token: token, interesses: []) }

      expect(results).to eq(%i[confirmado ja_registrado])
    end

    it 'treats a simulated unique violation as ja_registrado' do
      allow(MallPulse::DB).to receive(:transaction).and_raise(Sequel::UniqueConstraintViolation)

      expect(described_class.call(evento_id: evento_id, token: token, interesses: [])).to eq(:ja_registrado)
    end

    it 'rejects simulated events' do
      simulado = criar_evento(simulado: true)

      expect { described_class.call(evento_id: simulado, token: token, interesses: []) }
        .to raise_error(described_class::EventoIndisponivel)
    end

    it 'rejects events outside the check-in window' do
      futuro = criar_evento(inicio: Time.now + (4 * 3600), fim: Time.now + (6 * 3600))

      expect { described_class.call(evento_id: futuro, token: token, interesses: []) }
        .to raise_error(described_class::EventoIndisponivel)
    end
  end
end
