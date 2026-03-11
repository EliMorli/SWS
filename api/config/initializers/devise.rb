Devise.setup do |config|
  config.mailer_sender = "noreply@swsoperations.com"
  config.navigational_formats = []

  config.jwt do |jwt|
    jwt.secret = ENV.fetch("JWT_SECRET", "dev_jwt_secret_key_change_in_production")
    jwt.dispatch_requests = [
      ["POST", %r{^/auth/login$}]
    ]
    jwt.revocation_requests = [
      ["DELETE", %r{^/auth/logout$}]
    ]
    jwt.expiration_time = 1.hour.to_i
  end
end
