# frozen_string_literal: true

module MallPulse
  module Repositories
    module Lojistas
      module_function

      def listar
        consulta.order(:nome_loja).all
      end

      def criar(nome:, segmento:, piso:, tags_publico:)
        id = DB[:lojistas_parceiros].insert(
          nome_loja: nome, segmento: segmento, piso: piso, tags_publico_alvo: Sequel.pg_array(tags_publico, :text)
        )
        consulta.where(Sequel[:lojistas_parceiros][:id] => id).first
      end

      def buscar_ativos_por_ids(ids)
        consulta.where(Sequel[:lojistas_parceiros][:id] => ids, ativo: true).all
      end

      def consulta
        participacoes = DB[:eventos_lojistas].where(lojista_id: Sequel[:lojistas_parceiros][:id])
        DB[:lojistas_parceiros].select(
          Sequel[:lojistas_parceiros][:id], Sequel[:nome_loja].as(:nome), :segmento, :piso,
          Sequel[:tags_publico_alvo].as(:tags_publico), :ativo,
          participacoes.select(Sequel.function(:count, Sequel.lit('*'))).as(:eventos_participados)
        )
      end
      private_class_method :consulta
    end
  end
end
