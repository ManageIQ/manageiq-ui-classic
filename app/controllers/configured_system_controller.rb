class ConfiguredSystemController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin
  include Mixins::ManagerControllerMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def self.table_name
    @table_name ||= "configured_system"
  end

  def button
    @edit = session[:edit] # Restore @edit for adv search box

    # Handle Toolbar Policy Tag Button
    @refresh_div = "main_div" # Default div for button.rjs to refresh
    model = self.class.model
    tag(model) if params[:pressed] == "configured_system_tag"
    provision if params[:pressed] == "configured_system_provision"

    return if ["#{params[:controller]}_tag"].include?(params[:pressed]) && @flash_array.nil? # Tag screen showing
  end

  private

  def textual_group_list
    [%i[properties relationships environment], %i[os tenancy tags]]
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
