# frozen_string_literal: true

module MallPulse
  module Services
    class Recomendador
      # Monta o JSON da recomendacao (dados.md §8).
      class Resposta
        def initialize(resultado, evento_id)
          @r = resultado
          @evento_id = evento_id
        end

        def to_h
          p = @r.params
          { modo: 'regras', objetivo: p[:objetivo], publico_alvo: p[:publico_alvo], recomendacao: recomendacao }
        end

        private

        def recomendacao
          { evento_id: @evento_id, titulo: @r.titulo, justificativa: @r.justificativa, status: 'Planejado',
            ambiente: @r.params[:ambiente], lojistas_indicados: lojistas_indicados }
            .merge(pontuacao, contexto: contexto)
        end

        def pontuacao
          { afinidade_pontos: @r.score[:score], escala: '0-100; nao e probabilidade',
            componentes: @r.componentes, cobertura_pesos: @r.score[:cobertura], amostra_historica: @r.amostra,
            historico_simulado: false, versao_regra: Score::VERSAO_REGRA, publico_estimado: nil,
            metodo_estimativa: nil }
        end

        def lojistas_indicados
          @r.lojistas.map { |l| { referencia: l[:id], nome: l[:nome_loja], confirmado: false } }
        end

        def contexto
          previsao = @r.previsao
          { fonte_clima: previsao && 'open-meteo', temperatura_max: previsao&.dig(:temp_max),
            fonte_calendario: @r.feriados && 'brasilapi', janela_feriado: @r.componentes[:S]&.positive? }
        end
      end
    end
  end
end
