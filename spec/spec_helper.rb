require 'simplecov'
SimpleCov.start

ENV["RAILS_ENV"] ||= 'test'
require 'pathname'
require Pathname.new(__dir__).join("manageiq/config/environment").to_s
require 'rails-controller-testing'
require 'rspec/rails'

Rails::Controller::Testing.install
require 'manageiq/ui/classic'

support_path = Pathname.new(__dir__).join('support')
Dir[support_path.join("**/*.rb")].sort.each { |f| require f }

require 'miq-hash_struct'

# TODO: isolate the helpers we need for UI specs instead of general Dir glob
#
# core_support_path = Rails.root.join('spec/support')
# require core_support_path.join('evm_spec_helper.rb')
# require core_support_path.join('auth_helper.rb')
# require core_support_path.join('presenter_helper.rb')
# require core_support_path.join('menu_helper.rb')
# require core_support_path.join('automation_helper.rb')
# require core_support_path.join('factory_bot_helper.rb')
# require core_support_path.join('button_helper.rb')
# require core_support_path.join('settings_helper.rb')
#
# Known:
# require core_support_path.join("rake_task_example_group.rb")
Dir[Rails.root.join("spec/shared/**/*.rb")].sort.each { |f| require f }

Dir[ManageIQ::UI::Classic::Engine.root.join('spec/shared/**/*.rb')].sort.each { |f| require f }

RSpec.configure do |config|
  config.fixture_path = Rails.root.join("spec/fixtures")
  config.use_transactional_fixtures = true
  config.use_instantiated_fixtures  = false

  config.infer_spec_type_from_file_location!

  unless ENV['CI']
    # File store for --only-failures option
    config.example_status_persistence_file_path = Rails.root.join("tmp/rspec_example_store.txt")
  end

  config.include Spec::Support::SupportsHelper
  config.include Spec::Support::AuthHelper, :type => :view
  config.include Spec::Support::ViewHelper, :type => :view
  config.include ApplicationHelper, :type => :view

  config.include Spec::Support::ControllerHelper, :type => :controller
  config.include Spec::Support::AuthHelper, :type => :controller
  config.include Spec::Support::TaggingHelper, :type => :controller

  config.include Spec::Support::AuthHelper, :type => :helper

  config.include Spec::Support::PresenterHelper, :type => :presenter
  config.define_derived_metadata(:file_path => /spec\/presenters/) do |metadata|
    metadata[:type] ||= :presenter
  end

  config.include Spec::Support::ButtonHelper, :type => :button
  config.include Spec::Support::AuthHelper, :type => :button
  config.define_derived_metadata(:file_path => /spec\/helpers\/application_helper\/buttons/) do |metadata|
    metadata[:type] = :button
  end

  config.before(:each) do |example|
    ApplicationController.handle_exceptions = false if %w[controller requests].include?(example.metadata[:type])
  end
end
