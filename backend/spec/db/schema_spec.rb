# frozen_string_literal: true

RSpec.describe 'database schema' do # rubocop:disable RSpec/DescribeClass -- no class under test
  it 'creates the schema tables' do
    expect(db.tables).to include(:lojistas_parceiros, :eventos_sugeridos, :interacoes_visitantes, :recomendacoes)
  end

  it 'rejects a duplicate check-in' do
    campanha = db[:campanhas_objetivos].insert(descricao_objetivo: 'x', publico_alvo: 'y',
                                               periodo_inicio: Date.today, periodo_fim: Date.today)
    evento = db[:eventos_sugeridos].insert(campanha_id: campanha, titulo_sugerido: 't', categoria: 'c',
                                           publico_alvo: 'p', ambiente: 'Indoor', local_sugerido: 'l',
                                           inicio: Time.now, fim: Time.now + 3600)
    expect { 2.times { db[:interacoes_visitantes].insert(evento_id: evento, visitante_token_hash: 'h') } }
      .to raise_error(Sequel::UniqueConstraintViolation)
  end
end
