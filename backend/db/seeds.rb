# frozen_string_literal: true

# Dados simulados derivados dos mocks do frontend (simulado=true). Idempotente.
db = MallPulse::DB
return unless db[:lojistas_parceiros].empty?

lojistas = [
  ['VR & Alfaiataria Masculina', 'Artigos Masculinos', 'Piso L2 • Ala Norte', ['Homens 30-60', 'Executivo', 'Moda']],
  ['Barbearia Cavalheiros VIP', 'Barbearia VIP', 'Piso L2 • Ala Norte', ['Homens 30-60', 'Jovens 18-25', 'Estilo']],
  ['Mestre Cervejeiro & Grill', 'Cervejaria Artesanal', 'Boulevard Gourmet', ['Homens 30-60', 'Gastronomia', 'Música']],
  ['Mundo Kids & Brinquedos', 'Moda Infantil', 'Piso L1 • Praça Central', ['Famílias', 'Crianças', 'Fim de Semana']],
  ['TechZone Games & Hardware', 'Eletrônicos & Games', 'Piso L2 • Ala Sul', ['Jovens 18-25', 'Tecnologia', 'Games']],
  ['Grão Nobre Cafeteria', 'Praça de Alimentação', 'Piso L1 • Praça Alimentação',
   ['Todos os Públicos', 'Dias Chuvosos', 'Café']]
].to_h do |nome, segmento, piso, tags|
  [segmento, db[:lojistas_parceiros].returning(:id).insert(nome_loja: nome, segmento: segmento, piso: piso,
                                                           tags_publico_alvo: Sequel.pg_array(tags)).first[:id]]
end

historico = [
  ['EVT-104', 'Reativar Moda Masculina (Pós-Dia dos Pais)', 'Festival Rock Clássico & Grill Artesanal',
   'Homens • 30 a 60 anos', ['Artigos Masculinos', 'Barbearia VIP', 'Cervejaria Artesanal'], 680, 600, '2026-09-12'],
  ['EVT-103', 'Aumentar fluxo na Praça de Alimentação', 'Noite Gastronômica & Jazz Acústico',
   'Casais e Adultos • 25 a 50 anos', ['Praça de Alimentação', 'Empório do Vinho'], 1120, 950, '2026-08-29'],
  ['EVT-102', 'Atrair famílias no domingo à tarde', 'Oficina de Robótica & Teatro Infantil',
   'Famílias com Crianças • 25 a 45 anos', ['Moda Infantil', 'Livraria & Papelaria', 'Sorveteria'], 740, 800,
   '2026-08-16'],
  ['EVT-101', 'Movimentar corredor do Piso L2', 'Arena eSports & Torneio EA FC',
   'Jovens Universitários • 18 a 25 anos', ['Eletrônicos & Games', 'Fast Food', 'Moda Street'], 510, 450,
   '2026-08-02'],
  ['EVT-100', 'Fluxo em dia chuvoso (Alerta Open-Meteo)', 'Festival de Cafés Especiais & Leitura',
   'Público Geral • 25 a 60 anos', ['Cafeteria Gourmet', 'Livraria & Papelaria'], 490, 420, '2026-07-19']
]

db.transaction do
  historico.each do |linha|
    id, objetivo, evento, publico, lojas, checkins, estimado, data = linha
    dia = Date.parse(data)
    campanha = db[:campanhas_objetivos].returning(:id).insert(
      descricao_objetivo: objetivo, publico_alvo: publico, periodo_inicio: dia, periodo_fim: dia, status: 'Concluido'
    ).first[:id]
    inicio = Time.utc(dia.year, dia.month, dia.day, 20)
    evento_id = db[:eventos_sugeridos].returning(:id).insert(
      campanha_id: campanha, titulo_sugerido: evento, categoria: 'Histórico', publico_alvo: publico,
      ambiente: 'Indoor', local_sugerido: 'Shopping', inicio: inicio, fim: inicio + (4 * 3600),
      publico_estimado: estimado, metodo_estimativa: 'seed', status: 'Concluido', simulado: true
    ).first[:id]
    lojas.filter_map { |segmento| lojistas[segmento] }.each do |lojista_id|
      db[:eventos_lojistas].insert(evento_id: evento_id, lojista_id: lojista_id,
                                   tipo_participacao: 'indicado', confirmado: true)
    end
    db[:interacoes_visitantes].import(
      %i[evento_id visitante_token_hash],
      Array.new(checkins) { |i| [evento_id, "seed-#{id}-#{i}"] }
    )
  end
end
puts "seed: #{lojistas.size} lojistas, #{historico.size} eventos"
