# frozen_string_literal: true

RSpec.describe MallPulse::Services::Score do
  it 'calcula o exemplo de dados.md com cobertura total' do
    resultado = described_class.calcular(h: 0.875, l: 0.9, c: 1, s: 1)

    expect(resultado).to include(score: 92.0, cobertura: 1.0, componentes: { H: 0.875, L: 0.9, C: 1, S: 1 })
  end

  it 'redistribui os pesos entre componentes disponíveis' do
    expect(described_class.calcular(h: nil, l: 0.5, c: nil, s: nil)).to include(score: 50.0, cobertura: 0.3)
  end

  it 'retorna score nulo sem componentes' do
    expect(described_class.calcular(h: nil, l: nil, c: nil, s: nil)).to include(score: nil, cobertura: 0.0)
  end

  it 'expõe a versão da regra' do
    expect(described_class::VERSAO_REGRA).to eq('mvp-regras-1')
  end
end
