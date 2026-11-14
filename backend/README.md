# MallPulse API

REST API built with [Grape](https://github.com/ruby-grape/grape) on Rack, started from
[grape-on-rack](https://github.com/ruby-grape/grape-on-rack).

## Requirements

- Ruby 3.4 (pinned in `mise.toml`)

## Setup

```sh
mise install
bundle install
```

## Running

```sh
bundle exec rackup        # http://localhost:9292
```

- Health check: `GET /api/v1/health`
- OpenAPI document: `GET /api/v1/swagger_doc`
- Swagger UI: http://localhost:9292/swagger/index.html

## Quality gate

```sh
bundle exec rake          # RuboCop + RSpec
bundle exec rake routes   # list API routes
```

## Project layout

```
app/
  mall_pulse.rb                 # namespace and VERSION
  mall_pulse/
    application.rb              # Rack stack: CORS, Swagger UI, API
    api.rb                      # root API: prefix, versioning, error handling, docs
    endpoints/v1/               # HTTP endpoints, one class per resource
    entities/                   # response representations (grape-entity)
    errors/                     # error payload contract
config/                         # boot, autoloading (Zeitwerk), environment
spec/                           # mirrors app/
```

Classes are autoloaded by [Zeitwerk](https://github.com/fxn/zeitwerk): the file path defines the constant
(`app/mall_pulse/endpoints/v1/health.rb` → `MallPulse::Endpoints::V1::Health`).

## Error contract

Every error response has the same shape:

```json
{ "error": { "code": "not_found", "message": "Resource not found" } }
```

## Configuration

| Variable       | Default       | Purpose                                   |
| -------------- | ------------- | ----------------------------------------- |
| `RACK_ENV`     | `development` | Runtime environment                       |
| `CORS_ORIGINS` | `*`           | Comma separated list of allowed origins   |
