class ConfiguredSystemController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def self.model
    ManageIQ::Providers::Foreman::ConfigurationManager::ConfiguredSystem
  end

  def self.table_name
    @table_name ||= "configured_system"
  end

  private

  def textual_group_list
    [%i[properties environment os], %i[tenancy tags]]
  end
  helper_method :textual_group_list

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Configuration Management")},
        {:title => _("Configured Systems"), :url => controller_url},
      ],
    }
  end

  menu_section :conf
end
