# frozen_string_literal: true

module MallPulse
  module Services
    module AprovacaoEvento
      class NaoEncontrado < StandardError; end
      class ConflitoStatus < StandardError; end

      module_function

      def call(id)
        raise NaoEncontrado unless Uuid.valido?(id)

        eventos = DB[:eventos_sugeridos].where(id: id)
        url = "#{ENV.fetch('FRONTEND_URL')}/checkin/#{id}"
        # UPDATE condicional: a transição Planejado -> Aprovado é atômica
        return { id: id, status: 'Aprovado', checkin_url: url } if
          eventos.where(status: 'Planejado').update(status: 'Aprovado', qr_code_url: url) == 1

        raise eventos.empty? ? NaoEncontrado : ConflitoStatus
      end
    end
  end
end
