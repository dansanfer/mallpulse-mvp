# frozen_string_literal: true

module MallPulse
  module Endpoints
    module V1
      class Health < Grape::API
        desc 'Reports that the API is up', success: Entities::HealthStatus
        get :health do
          present({ status: 'ok', version: MallPulse::VERSION }, with: Entities::HealthStatus)
        end
      end
    end
  end
end
