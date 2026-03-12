require "active_support/core_ext/integer/time"

Rails.application.configure do
  config.enable_reloading = false
  config.eager_load = true
  config.consider_all_requests_local = false
  config.force_ssl = true
  config.assume_ssl = true

  config.log_tags = [:request_id]
  config.logger = ActiveSupport::TaggedLogging.logger(STDOUT)
  config.log_level = ENV.fetch("RAILS_LOG_LEVEL", "info")

  config.cache_store = :redis_cache_store, { url: ENV["REDIS_URL"] }
  config.active_storage.service = :amazon
  config.action_mailer.perform_caching = false
  config.active_support.deprecation = :notify
  config.active_record.dump_schema_after_migration = false
end
