# frozen_string_literal: true

RSpec.describe MallPulse::Services::HistoricoScore do
  def criar_evento(estimado:, checkins:, simulado: false)
    campanha = db[:campanhas_objetivos].insert(descricao_objetivo: 'o', publico_alvo: 'Familias',
                                               periodo_inicio: Date.today, periodo_fim: Date.today)
    evento = db[:eventos_sugeridos].insert(
      campanha_id: campanha, titulo_sugerido: 't', categoria: 'Gastronomia', publico_alvo: 'Familias',
      ambiente: 'Indoor', local_sugerido: 'x', inicio: Time.now, fim: Time.now + 3600,
      publico_estimado: estimado, status: 'Concluido', simulado: simulado
    )
    checkins.times { |i| db[:interacoes_visitantes].insert(evento_id: evento, visitante_token_hash: "h#{i}") }
  end

  def calcular
    described_class.call(categoria: 'Gastronomia', publico_alvo: 'Familias')
  end

  it 'is unavailable with fewer than 3 comparable events' do
    2.times { criar_evento(estimado: 10, checkins: 5) }
    criar_evento(estimado: 10, checkins: 5, simulado: true)
    criar_evento(estimado: 0, checkins: 5)
    expect(calcular).to eq(h: nil, amostra: 2)
  end

  it 'averages capped reach over comparable events' do
    criar_evento(estimado: 10, checkins: 5)
    criar_evento(estimado: 10, checkins: 15)
    criar_evento(estimado: 10, checkins: 0)
    expect(calcular).to eq(h: 0.5, amostra: 3)
  end
end
