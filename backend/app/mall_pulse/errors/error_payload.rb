# frozen_string_literal: true

module MallPulse
  module Errors
    module ErrorPayload
      def self.build(code:, message:)
        { error: { code: code, message: message } }
      end

      def self.from_exception(exception)
        build(code: Rack::Utils::SYMBOL_TO_STATUS_CODE.key(exception.status), message: exception.message)
      end

      def self.not_found
        build(code: :not_found, message: 'Resource not found')
      end

      def self.internal_error
        build(code: :internal_server_error, message: 'Internal server error')
      end
    end
  end
end
