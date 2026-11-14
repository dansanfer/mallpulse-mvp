# frozen_string_literal: true

module MallPulse
  module Entities
    class Lojista < Grape::Entity
      expose :id, documentation: { type: String, desc: 'Store UUID' }
      expose :nome, documentation: { type: String, desc: 'Store name' }
      expose :segmento, documentation: { type: String, desc: 'Business segment' }
      expose :piso, documentation: { type: String, desc: 'Mall floor' }
      expose :tags_publico, documentation: { type: String, is_array: true, desc: 'Target audience tags' } do |row, _|
        row[:tags_publico].to_a
      end
      expose :eventos_participados, documentation: { type: Integer, desc: 'Events the store took part in' }
      expose :ativo, documentation: { type: 'Boolean', desc: 'Whether the store can be recommended' }
    end
  end
end
