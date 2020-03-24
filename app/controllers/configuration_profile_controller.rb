class ConfigurationProfileController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def self.table_name
    @table_name ||= "configuration_profile"
  end

  def self.display_methods
    %w[configured_systems]
  end

  private

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Configuration Profile")},
        {:title => _("Profiles"), :url => controller_url},
      ],
    }
  end

  menu_section :conf
end
