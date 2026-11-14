# frozen_string_literal: true

module Factories
  def criar_campanha(**attrs)
    MallPulse::DB[:campanhas_objetivos].insert(
      { descricao_objetivo: 'Objetivo', publico_alvo: 'Familias',
        periodo_inicio: Date.today, periodo_fim: Date.today + 30 }.merge(attrs)
    )
  end

  def criar_evento(**attrs)
    MallPulse::DB[:eventos_sugeridos].insert(
      { campanha_id: criar_campanha, titulo_sugerido: 'Feira', categoria: 'Familiar', publico_alvo: 'Familias',
        ambiente: 'Indoor', local_sugerido: 'Praca central', inicio: Time.now - 3600, fim: Time.now + 3600,
        status: 'Aprovado' }.merge(attrs)
    )
  end
end

RSpec.configure { |config| config.include Factories }
