# frozen_string_literal: true

module MallPulse
  module Entities
    class EventoPublico < Grape::Entity
      expose :id, documentation: { type: String, desc: 'Event UUID' }
      expose(:titulo, documentation: { type: String, desc: 'Event title' }) { |evento| evento[:titulo_sugerido] }
      expose :categoria, documentation: { type: String, desc: 'Event category' }
      expose :inicio, documentation: { type: DateTime, desc: 'Start time' }
      expose :fim, documentation: { type: DateTime, desc: 'End time' }
      expose(:local, documentation: { type: String, desc: 'Event location' }) { |evento| evento[:local_sugerido] }
    end
  end
end
