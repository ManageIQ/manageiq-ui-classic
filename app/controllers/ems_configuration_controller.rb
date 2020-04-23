class EmsConfigurationController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin
  include Mixins::GenericFormMixin
  include Mixins::ManagerControllerMixin
  include Mixins::FindRecord

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def self.model
    ManageIQ::Providers::ConfigurationManager
  end

  def self.table_name
    @table_name ||= "ems_configuration"
  end

  def self.display_methods
    %w[configuration_profiles configured_systems]
  end

  def button
    @edit = session[:edit] # Restore @edit for adv search box
    params[:display] = @display if display_methods.include?(@display) # Were we displaying nested list

    # Handle Toolbar Policy Tag Button
    @refresh_div = "main_div" # Default div for button.rjs to refresh
    model = self.class.model
    tag(model) if params[:pressed] == "#{params[:controller]}_tag"
    return if ["#{params[:controller]}_tag"].include?(params[:pressed]) && @flash_array.nil? # Tag screen showing

    if params[:pressed].starts_with?("configured_system_") # Handle buttons from sub-items screen
      tag(ConfiguredSystem) if params[:pressed] == "configured_system_tag"
      provision if params[:pressed] == "configured_system_provision"
    end

    case params[:pressed]
    when 'ems_configuration_edit_provider'
      edit
    when 'ems_configuration_add_provider'
      new
    when "ems_configuration_refresh_provider"
      refresh
    when "ems_configuration_delete_provider"
      delete
    end

    if single_delete_test
      single_delete_redirect
    elsif (params[:pressed].ends_with?("_edit_provider") || params[:pressed] == "ems_configuration_add_provider") && @flash_array.nil?
      if @flash_array
        show_list
        replace_gtl_main_div
      else
        javascript_redirect(:action => @refresh_partial, :id => @redirect_id)
      end
    elsif @refresh_div == "main_div" && @lastaction == "show_list"
      replace_gtl_main_div
    else
      render_flash unless performed?
    end
  end

  private

  def self.model_to_name(_provmodel)
    Dictionary.gettext('ems_configuration', :type => :ui_title, :translate => false)
  end

  def manager_prefix
    "configuration_manager"
  end

  def privilege_prefix
    "ems_configuration"
  end

  def refresh
    assert_privileges("ems_configuration_refresh_provider")
    manager_button_operation('refresh_ems', _('Refresh'))
  end

  def concrete_model
    ManageIQ::Providers::ConfigurationManager
  end

  def provider_class
    ManageIQ::Providers::Foreman::Provider
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Configuration Management")},
        {:title => _("Providers"), :url => controller_url},
      ],
    }
  end

  def set_redirect_vars
    @in_a_form = true
    @redirect_controller = "ems_configuration"
    @redirect_id = @provider_manager.id if @provider_manager.try(:id)
    @refresh_partial = @provider_manager.try(:id) ? "edit" : "new"
  end

  menu_section :conf
end
