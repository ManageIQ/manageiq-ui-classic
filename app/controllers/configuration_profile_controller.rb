class ConfigurationProfileController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def self.display_methods
    %w[configured_systems]
  end

  def button
    @edit = session[:edit] # Restore @edit for adv search box
    params[:display] = @display if display_methods.include?(@display) # Were we displaying nested list

    # Handle Toolbar Policy Tag Button
    @refresh_div = "main_div" # Default div for button.rjs to refresh

    if params[:pressed].starts_with?("configured_system_") # Handle buttons from sub-items screen
      tag(ConfiguredSystem) if params[:pressed] == "configured_system_tag"
      provision if params[:pressed] == "configured_system_provision"
    end

    if @refresh_div == "main_div" && @lastaction == "show_list"
      replace_gtl_main_div
    else
      render_flash unless performed?
    end
  end

  def show_list
    opts = {:no_checkboxes => true}
    process_show_list(opts)
  end

  def launch_configuration_profile_console
    record = self.class.model.find(params[:id])
    unless record.console_url
      add_flash(_("Configuration Profile console access failed: Task start failed"), :error)
    end

    if @flash_array
      javascript_flash(:spinner_off => true)
    else
      javascript_open_window(record.console_url)
    end
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
