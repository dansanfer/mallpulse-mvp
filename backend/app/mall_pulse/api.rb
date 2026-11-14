# frozen_string_literal: true

module MallPulse
  class API < Grape::API
    prefix :api
    version :v1, using: :path
    format :json

    rescue_from :grape_exceptions do |exception|
      error!(Errors::ErrorPayload.from_exception(exception), exception.status)
    end

    rescue_from Auth::Unauthorized do
      error!(Errors::ErrorPayload.build(code: :unauthorized, message: 'Unauthorized'), 401)
    end

    rescue_from Auth::Forbidden do
      error!(Errors::ErrorPayload.build(code: :forbidden, message: 'Forbidden'), 403)
    end

    rescue_from :all do
      error!(Errors::ErrorPayload.internal_error, 500)
    end

    mount Endpoints::V1::Health
    mount Endpoints::V1::Lojistas
    mount Endpoints::V1::Recomendacoes
    mount Endpoints::V1::Eventos
    mount Endpoints::V1::Visitantes
    mount Endpoints::V1::Painel

    add_swagger_documentation info: { title: 'MallPulse API', version: MallPulse::VERSION }

    # Grape 4 lets this catch-all swallow its native 405, so it is detected here.
    route :any, '*path', hidden: true do
      caminho_existe = API.routes.any? { |r| r.request_method != '*' && r.pattern.match?(env['PATH_INFO']) }
      if caminho_existe
        error!(Errors::ErrorPayload.build(code: :method_not_allowed, message: 'Method not allowed'), 405)
      else
        error!(Errors::ErrorPayload.not_found, 404)
      end
    end
  end
end
