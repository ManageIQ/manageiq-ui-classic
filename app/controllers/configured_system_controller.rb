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
    render_flash unless performed?
  end

  def show_list
    options = {:named_scope => :under_configuration_managers}
    process_show_list(options)
  end

  def launch_configured_system_console
    record = self.class.model.find(params[:id])
    unless record.console_url
      add_flash(_("Configured System console access failed: Task start failed"), :error)
    end

    if @flash_array
      javascript_flash(:spinner_off => true)
    else
      javascript_open_window(record.console_url)
    end
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
