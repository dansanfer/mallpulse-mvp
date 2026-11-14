# frozen_string_literal: true

module MallPulse
  module Services
    class Recomendador
      # Insere campanha, evento, lojistas, contextos e recomendacao; retorna o id do evento.
      class Persistencia
        FUSO = '-03:00' # America/Sao_Paulo sem horario de verao
        DURACAO = 4 * 3600

        def initialize(resultado)
          @r = resultado
          @p = resultado.params
        end

        def call
          evento_id = inserir_evento(inserir_campanha)
          vincular_lojistas(evento_id)
          inserir_contextos(evento_id)
          DB[:recomendacoes].insert(recomendacao_row(evento_id))
          evento_id
        end

        private

        def inserir_campanha
          DB[:campanhas_objetivos].insert(
            descricao_objetivo: @p[:objetivo], publico_alvo: @p[:publico_alvo],
            tags_publico_alvo: Sequel.pg_array(@p[:tags_publico], :text), periodo_inicio: @r.data, periodo_fim: @r.data
          )
        end

        def inserir_evento(campanha_id)
          inicio = Time.new(@r.data.year, @r.data.month, @r.data.day, 17, 0, 0, FUSO)
          DB[:eventos_sugeridos].insert(
            campanha_id: campanha_id, titulo_sugerido: @r.titulo, categoria: @p[:categoria],
            publico_alvo: @p[:publico_alvo], ambiente: @p[:ambiente], local_sugerido: @p[:local_sugerido],
            inicio: inicio, fim: inicio + DURACAO, publico_estimado: nil, status: 'Planejado'
          )
        end

        def vincular_lojistas(evento_id)
          @r.lojistas.each do |l|
            DB[:eventos_lojistas].insert(evento_id: evento_id, lojista_id: l[:id],
                                         tipo_participacao: 'indicado', confirmado: false)
          end
        end

        def inserir_contextos(evento_id)
          [contexto_previsao, contexto_calendario].compact.each do |contexto|
            DB[:eventos_contextos].insert(evento_id: evento_id,
                                          contexto_id: DB[:contextos_consultados].insert(contexto))
          end
        end

        def contexto_base(natureza, fonte)
          { data_referencia: @r.data, localizacao: 'Shopping', latitude: Recomendador.lat,
            longitude: Recomendador.lon, natureza: natureza, fonte: fonte, versao_regra: Score::VERSAO_REGRA }
        end

        def contexto_previsao
          previsao = @r.previsao
          return unless previsao

          contexto_base('previsao', 'open-meteo').merge(
            temperatura_max: previsao[:temp_max], probabilidade_chuva: previsao[:chuva],
            dados_origem: Sequel.pg_jsonb(previsao[:bruto])
          )
        end

        def contexto_calendario
          return unless @r.feriados

          contexto_base('calendario', 'brasilapi').merge(
            dados_origem: Sequel.pg_jsonb(feriados: @r.feriados.map(&:iso8601))
          )
        end

        def recomendacao_row(evento_id)
          score = @r.score
          { evento_id: evento_id, origem: 'regras', versao_regra: Score::VERSAO_REGRA,
            entradas: Sequel.pg_jsonb(@p), justificativa: @r.justificativa,
            componentes_score: Sequel.pg_jsonb(@r.componentes), score: score[:score],
            peso_disponivel: score[:cobertura], amostra_historica: @r.amostra }
        end
      end
    end
  end
end
