# require 'simplecov'
# SimpleCov.start

# TODO: Make this spec_helper stand alone.

ENV["RAILS_ENV"] ||= 'test'
require File.expand_path("../manageiq/config/environment", __FILE__)
require 'application_helper'
require 'rails-controller-testing'
require 'rspec/rails'

require 'manageiq/ui'

support_path = Rails.root.join('spec', 'support')

# TODO: isolate the helpers we need for UI specs
#
# require support_path.join('evm_spec_helper.rb')
# require support_path.join('auth_helper.rb')
# require support_path.join('controller_helper.rb')
# require support_path.join('view_helper.rb')
# require support_path.join('presenter_helper.rb')
# require support_path.join('menu_helper.rb')
# require support_path.join('automation_helper.rb')
# require support_path.join('factory_girl_helper.rb')
# require support_path.join('button_helper.rb')
# require support_path.join('settings_helper.rb')

Dir[support_path.join("**","*.rb")].each { |f| require f }

shared_path = Rails.root.join('spec', 'shared', 'controllers', '**', '*.rb')

Dir[shared_path].each do |f|
  require f
end

require support_path.join('examples_group', 'shared_examples_for_application_helper.rb').to_s
require support_path.join('rake_task_example_group.rb').to_s

Dir[ManageIQ::Gems::Pending.root.join("spec/support/custom_matchers/*.rb")].each { |f| require f }

RSpec.configure do |config|
  config.expect_with :rspec do |c|
    c.syntax = :expect
  end
  config.mock_with :rspec do |c|
    c.syntax = :expect
  end

  config.fixture_path = "#{::Rails.root}/spec/fixtures"
  config.use_transactional_fixtures = true
  config.use_instantiated_fixtures  = false

  config.infer_spec_type_from_file_location!

  unless ENV['CI']
    # File store for --only-failures option
    config.example_status_persistence_file_path = Rails.root.join("tmp/rspec_example_store.txt")
  end

  config.define_derived_metadata(:file_path => /spec\/lib\/miq_automation_engine\/models/) do |metadata|
    metadata[:type] ||= :model
  end

  config.include Spec::Support::AutomationHelper

  config.include Spec::Support::AuthHelper, :type => :view
  config.include Spec::Support::ViewHelper, :type => :view
  config.include UiConstants, :type => :view

  config.include Spec::Support::ControllerHelper, :type => :controller
  config.include Spec::Support::AuthHelper, :type => :controller
  config.include UiConstants, :type => :controller

  config.include Spec::Support::AuthHelper, :type => :helper

  config.include Spec::Support::PresenterHelper, :type => :presenter
  config.define_derived_metadata(:file_path => /spec\/presenters/) do |metadata|
    metadata[:type] ||= :presenter
  end

  config.include Spec::Support::RakeTaskExampleGroup, :type => :rake_task
  config.include Spec::Support::ButtonHelper, :type => :button
  config.include Spec::Support::AuthHelper, :type => :button
  config.define_derived_metadata(:file_path => /spec\/helpers\/application_helper\/buttons/) do |metadata|
    metadata[:type] = :button
  end

  config.before(:each) do |example|
    EmsRefresh.try(:debug_failures=, true) if example.metadata[:migrations].blank?
    ApplicationController.handle_exceptions = false if %w(controller requests).include?(example.metadata[:type])
  end

  # config.before(:each, :rest_api => true) { init_api_spec_env }

  config.around(:each) do |example|
    EvmSpecHelper.clear_caches { example.run }
  end
end
