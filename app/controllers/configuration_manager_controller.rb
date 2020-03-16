class ConfigurationManagerController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def self.model
    ManageIQ::Providers::ConfigurationManager
  end

  def self.table_name
    @table_name ||= "configuration_manager"
  end

  def self.display_methods
    %w[configuration_profiles configured_systems]
  end

  private

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Configuration Management")},
        {:title => _("Providers"), :url => controller_url},
      ],
    }
  end

  menu_section :conf
end
