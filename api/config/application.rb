require_relative "boot"

require "rails"
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
require "active_storage/engine"
require "action_controller/railtie"
require "action_mailer/railtie"
require "action_view/railtie"
require "action_cable/engine"

Bundler.require(*Rails.groups)

module SwsApi
  class Application < Rails::Application
    config.load_defaults 7.1
    config.api_only = true
    config.autoload_lib(ignore: %w[assets tasks])

    config.active_job.queue_adapter = :sidekiq

    config.middleware.insert_before 0, Rack::Cors do
      allow do
        origins "*"
        resource "*",
          headers: :any,
          methods: [:get, :post, :put, :patch, :delete, :options, :head],
          expose: ["Authorization"]
      end
    end

    config.generators do |g|
      g.orm :active_record, primary_key_type: :uuid
      g.test_framework :rspec
    end
  end
end
