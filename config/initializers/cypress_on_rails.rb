# This is identical to the generated file[1] with the exceptions below:
# [1] https://github.com/shakacode/cypress-playwright-on-rails/blob/ac5d69f9ea951c7545e5141db2abb2cb1350e740/lib/generators/cypress_on_rails/templates/config/initializers/cypress_on_rails.rb.erb
#   * install_folder  (uses our rails engine path)
#   * require ENV['CYPRESS'] to be set
#   * requires and instantiates the seeded_deletion strategy
if defined?(CypressOnRails) && ENV['CYPRESS'].present?
  CypressOnRails.configure do |c|
    c.api_prefix = ""

    # Currently, the only change from the template:
    c.install_folder = ManageIQ::UI::Classic::Engine.root.join("cypress/e2e")
    # WARNING!! CypressOnRails can execute arbitrary ruby code
    # please use with extra caution if enabling on hosted servers or starting your local server on 0.0.0.0
    c.use_middleware = !Rails.env.production?
    #  c.use_vcr_middleware = !Rails.env.production?
    #  # Use this if you want to use use_cassette wrapper instead of manual insert/eject
    #  # c.use_vcr_use_cassette_middleware = !Rails.env.production?
    #  # Pass custom VCR options
    #  c.vcr_options = {
    #    hook_into: :webmock,
    #    default_cassette_options: { record: :once },
    #    cassette_library_dir: File.expand_path("#{__dir__}/../../e2e/cypress/fixtures/vcr_cassettes")
    #  }
    c.logger = Rails.logger

    # If you want to enable a before_request logic, such as authentication, logging, sending metrics, etc.
    #   Refer to https://www.rubydoc.info/gems/rack/Rack/Request for the `request` argument.
    #   Return nil to continue through the Cypress command. Return a response [status, header, body] to halt.
    # c.before_request = lambda { |request|
    #   unless request.env['warden'].authenticate(:secret_key)
    #     return [403, {}, ["forbidden"]]
    #   end
    # }
  end

  # # if you compile your asssets on CI
  # if ENV['CYPRESS'].present? && ENV['CI'].present?
  #  Rails.application.configure do
  #    config.assets.compile = false
  #    config.assets.unknown_asset_fallback = false
  #  end
  # end
  require 'extensions/database_cleaner-activerecord-seeded_deletion'
  DatabaseCleaner[:active_record].strategy = DatabaseCleaner::ActiveRecord::SeededDeletion.new(:pre_count => true, :except => %w[audit_events sessions])
end
