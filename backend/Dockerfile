# syntax=docker/dockerfile:1
FROM ruby:4.0-slim AS build
RUN apt-get update -qq && apt-get install -y --no-install-recommends build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV BUNDLE_WITHOUT="development:test" BUNDLE_DEPLOYMENT=1 BUNDLE_PATH=/usr/local/bundle
COPY Gemfile Gemfile.lock .ruby-version ./
RUN bundle install --jobs 4 && rm -rf /usr/local/bundle/ruby/*/cache
COPY . .

FROM ruby:4.0-slim
RUN apt-get update -qq && apt-get install -y --no-install-recommends libpq5 \
    && rm -rf /var/lib/apt/lists/* && useradd --create-home --uid 1000 app
WORKDIR /app
ENV RACK_ENV=production BUNDLE_WITHOUT="development:test" BUNDLE_DEPLOYMENT=1 BUNDLE_PATH=/usr/local/bundle
COPY --from=build /usr/local/bundle /usr/local/bundle
COPY --from=build --chown=app:app /app /app
USER app
EXPOSE 9292
# Single process on purpose: the rate-limit store is in memory (see app/mall_pulse/rate_limit.rb).
CMD ["sh", "-c", "bundle exec puma -p ${PORT:-9292} -t 5:5"]
