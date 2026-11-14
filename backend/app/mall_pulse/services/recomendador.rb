# frozen_string_literal: true

require 'date'

module MallPulse
  module Services
    # Gera recomendacao por regras (mvp-regras-1) e persiste tudo em uma transacao.
    class Recomendador
      class LojistaInvalido < StandardError; end

      COMPONENTES = { H: 'historico', L: 'sinergia comercial', C: 'clima', S: 'calendario' }.freeze

      def self.call(params)
        new(params).call
      end

      def self.lat = ENV.fetch('MALL_LAT', '-23.5505')
      def self.lon = ENV.fetch('MALL_LON', '-46.6333')

      def initialize(params)
        @p = params
        @data = params[:data]
      end

      def call
        lojistas = carregar_lojistas
        historico = HistoricoScore.call(categoria: @p[:categoria], publico_alvo: @p[:publico_alvo])
        resultado = montar_resultado(lojistas, historico)
        DB.transaction { Resposta.new(resultado, Persistencia.new(resultado).call).to_h }
      end

      private

      def carregar_lojistas
        ids = @p[:lojista_ids].uniq
        raise LojistaInvalido, 'lojista inexistente ou inativo' unless ids.all? { |id| Uuid.valido?(id) }

        linhas = DB[:lojistas_parceiros].where(id: ids, ativo: true).select(:id, :nome_loja, :tags_publico_alvo).all
        raise LojistaInvalido, 'lojista inexistente ou inativo' if linhas.size != ids.size

        linhas
      end

      def montar_resultado(lojistas, historico)
        previsao = Clients::OpenMeteo.previsao(@data, lat: self.class.lat, lon: self.class.lon)
        feriados = Clients::BrasilApi.feriados(@data.year)
        Resultado.new(params: @p, lojistas: lojistas, amostra: historico[:amostra], previsao: previsao,
                      feriados: feriados, score: calcular(historico[:h], lojistas, previsao, feriados))
      end

      def calcular(historico_h, lojistas, previsao, feriados)
        Score.calcular(
          h: historico_h,
          l: RegrasContexto.sinergia(lojistas_tags: lojistas.map { |l| l[:tags_publico_alvo].to_a },
                                     campanha_tags: @p[:tags_publico]),
          c: RegrasContexto.clima(ambiente: @p[:ambiente], temp_max: previsao&.dig(:temp_max),
                                  chuva: previsao&.dig(:chuva)),
          s: RegrasContexto.calendario(data: @data, feriados: feriados)
        )
      end
    end
  end
end
