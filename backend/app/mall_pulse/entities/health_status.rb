# frozen_string_literal: true

module MallPulse
  module Entities
    class HealthStatus < Grape::Entity
      expose :status, documentation: { type: String, desc: 'Service status' }
      expose :version, documentation: { type: String, desc: 'Running application version' }
    end
  end
end
