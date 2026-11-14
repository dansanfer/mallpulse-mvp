# frozen_string_literal: true

module MallPulse
  module Services
    class Recomendador
      # Entradas e score calculados, compartilhados por Persistencia e Resposta.
      Resultado = Data.define(:params, :lojistas, :amostra, :previsao, :feriados, :score) do
        def data = params[:data]
        def componentes = score[:componentes]
        def titulo = "#{params[:categoria]} para #{params[:publico_alvo]}"

        def justificativa
          usados, ausentes = componentes.partition { |_, v| !v.nil? }.map { |par| par.map { |k, _| COMPONENTES[k] } }
          texto = "Pontuacao por regras com #{usados.empty? ? 'nenhum componente' : usados.join(', ')}."
          texto += " Indisponiveis: #{ausentes.join(', ')}." unless ausentes.empty?
          componentes[:H].nil? ? "#{texto} Recomendação inicial sem validação histórica." : texto
        end
      end
    end
  end
end
