# frozen_string_literal: true

RSpec.describe MallPulse::Services::Painel do
  def criar_campanha(objetivo)
    db[:campanhas_objetivos].insert(descricao_objetivo: objetivo, publico_alvo: 'Famílias',
                                    periodo_inicio: '2026-01-01', periodo_fim: '2026-12-31')
  end

  def criar_evento(campanha, inicio:, estimado:, status: 'Concluido', **extra)
    db[:eventos_sugeridos].returning(:id).insert(
      { campanha_id: campanha, titulo_sugerido: "Evento #{inicio}", categoria: 'Feira', publico_alvo: 'Famílias',
        ambiente: 'Indoor', local_sugerido: 'Praça', inicio: "#{inicio} 10:00:00+00", fim: "#{inicio} 12:00:00+00",
        publico_estimado: estimado, status: status }.merge(extra)
    ).first[:id]
  end

  def checkins(evento, quantidade)
    quantidade.times do |i|
      db[:interacoes_visitantes].insert(evento_id: evento, visitante_token_hash: "h#{evento}#{i}")
    end
  end

  def vincular_loja(evento, nome)
    loja = db[:lojistas_parceiros].returning(:id).insert(nome_loja: nome, segmento: 'Moda').first[:id]
    db[:eventos_lojistas].insert(evento_id: evento, lojista_id: loja, tipo_participacao: 'Ativação')
  end

  let(:campanha) { criar_campanha('Atrair famílias') }

  describe '.historico' do
    it 'usa os check-ins da view, agrega lojas e ordena do mais recente ao mais antigo' do
      antigo = criar_evento(campanha, inicio: '2026-03-01', estimado: 100)
      recente = criar_evento(campanha, inicio: '2026-04-01', estimado: 50, status: 'Ao Vivo', simulado: true)
      checkins(antigo, 25)
      checkins(recente, 80)
      vincular_loja(recente, 'Zeta')
      vincular_loja(recente, 'Alfa')

      resultado = described_class.historico

      expect(resultado.map { |e| e[:id] }).to eq([recente, antigo])
      expect(resultado.first).to include(objetivo: 'Atrair famílias', checkins: 80, estimado: 50, aderencia: 100,
                                         data: '2026-04-01', simulado: true, lojas: %w[Alfa Zeta])
      expect(resultado.last).to include(checkins: 25, aderencia: 25, lojas: [])
    end

    it 'devolve aderência nula quando o estimado é 0 ou nulo' do
      criar_evento(campanha, inicio: '2026-03-01', estimado: 0)
      criar_evento(campanha, inicio: '2026-03-02', estimado: nil)

      expect(described_class.historico.map { |e| e[:aderencia] }).to eq([nil, nil])
    end

    it 'ignora eventos fora dos status do painel' do
      criar_evento(campanha, inicio: '2026-03-01', estimado: 10, status: 'Planejado')
      criar_evento(campanha, inicio: '2026-03-02', estimado: 10, status: 'Cancelado')

      expect(described_class.historico).to be_empty
    end
  end

  describe '.objetivos' do
    it 'soma estimado e realizado por campanha sem misturar simulado e real' do
      outra = criar_campanha('Fidelizar')
      checkins(criar_evento(campanha, inicio: '2026-03-01', estimado: 100), 30)
      checkins(criar_evento(campanha, inicio: '2026-03-02', estimado: 100), 20)
      criar_evento(outra, inicio: '2026-03-03', estimado: 0)
      checkins(criar_evento(campanha, inicio: '2026-03-04', estimado: 10, simulado: true), 5)

      expect(described_class.objetivos).to contain_exactly(
        { objetivo: 'Atrair famílias', estimado: 200, realizado: 50, aderencia: 25, simulado: false },
        { objetivo: 'Atrair famílias', estimado: 10, realizado: 5, aderencia: 50, simulado: true },
        { objetivo: 'Fidelizar', estimado: 0, realizado: 0, aderencia: nil, simulado: false }
      )
    end
  end
end
