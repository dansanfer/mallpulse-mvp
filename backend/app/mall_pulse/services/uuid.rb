# frozen_string_literal: true

module MallPulse
  module Services
    module Uuid
      FORMATO = /\A\h{8}-\h{4}-\h{4}-\h{4}-\h{12}\z/

      module_function

      def valido?(valor)
        FORMATO.match?(valor.to_s)
      end
    end
  end
end
